// Ligação com o Supabase: carrega os dados da conta, salva as alterações e recebe atualizações em tempo real.
import { createClient, type RealtimeChannel } from '@supabase/supabase-js'
import { ITEMS, type ItemKey, type PlanId, type ServiceKey, type Shop } from './data'
import { currentKm, initial, useStore, type Booking, type Notice, type Role, type State, type Vehicle } from './store'

// Chave publicável: feita para ficar no navegador. A segurança vem das regras (RLS) do banco.
export const SUPABASE_URL = 'https://iffhgjdshzsmlxlvdjqg.supabase.co'
export const SUPABASE_KEY = 'sb_publishable_P5uuy6GjmKUnX9r2VQ0Gdw_lwh5w9pN'
export const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true, storageKey: 'carrook-auth' } })

/* ---------- Conversão banco <-> app ---------- */
type Row = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
const fullLast = (last: Row | null, km: number, date: string): Vehicle['last'] =>
  Object.fromEntries(ITEMS.map(i => [i.key, (last && last[i.key]) || { km, date }])) as Vehicle['last']
const toVehicle = (r: Row): Vehicle => ({ id: r.id, brand: r.brand, model: r.model, year: r.year, plate: r.plate, photo: r.photo, nickname: r.nickname ?? undefined, km: r.km, kmUpdatedAt: r.km_updated_at, avgKmDay: r.avg_km_day, last: fullLast(r.last, r.km, r.created_at) })
const fromVehicle = (v: Vehicle) => ({ id: v.id, brand: v.brand, model: v.model, year: v.year, plate: v.plate, photo: v.photo, nickname: v.nickname ?? null, km: Math.round(v.km), km_updated_at: v.kmUpdatedAt, avg_km_day: v.avgKmDay, last: v.last })
const toBooking = (r: Row): Booking => ({ id: r.id, vehicleId: r.vehicle_id ?? '-', shopId: r.shop_id, service: r.service as ServiceKey, date: r.date, time: r.time, price: Number(r.price), base: Number(r.base), payment: r.payment, status: r.status, customer: r.customer, createdAt: r.created_at, extra: r.extra ?? undefined, report: r.report ?? undefined })
const fromBooking = (b: Booking) => ({ id: b.id, vehicle_id: b.vehicleId === '-' ? null : b.vehicleId, shop_id: b.shopId, service: b.service, date: b.date, time: b.time, price: b.price, base: b.base, payment: b.payment, status: b.status, customer: b.customer, extra: b.extra ?? null, report: b.report ?? null })
const toNotice = (r: Row): Notice => ({ id: r.id, kind: r.kind, title: r.title, body: r.body, date: r.created_at, read: r.read, to: r.to_path ?? undefined })
const toShop = (r: Row): Shop => ({ id: r.id, name: r.name, photo: r.photo, address: r.address, district: r.district, rating: Number(r.rating), reviews: r.reviews, discount: r.discount, distanceKm: Number(r.distance_km), map: { x: Number(r.map_x), y: Number(r.map_y) }, hours: r.hours, phone: r.phone, services: r.services, since: r.since, blocked: r.blocked, quotes: r.quotes ?? [] })

/* ---------- Estado de sincronização ---------- */
let applying = false // true enquanto aplicamos dados vindos do servidor (não reenviar)
let channel: RealtimeChannel | null = null
let unsub: (() => void) | null = null

const apply = (p: Partial<State>) => { applying = true; try { useStore.setState(p) } finally { applying = false } }
const report = (e: { message?: string } | null, what: string) => { if (e) { console.error(what, e); useStore.getState().say(`Não foi possível salvar (${what}). Tente de novo.`) } }

/** Carrega tudo que o usuário logado pode ver e liga o modo real */
export async function loadLive(): Promise<Role | null> {
  const { data: { session } } = await sb.auth.getSession()
  if (!session) return null
  const uidv = session.user.id
  const [prof, plans, shops] = await Promise.all([
    sb.from('profiles').select('*').eq('id', uidv).single(),
    sb.from('plans').select('*').order('sort'),
    sb.from('shops').select('*').order('created_at'),
  ])
  if (prof.error || !prof.data) { report(prof.error, 'perfil'); return null }
  const p = prof.data
  const role = p.role as Role
  // agendamentos: o banco já filtra pelo papel (cliente, oficina ou admin)
  const [veh, bk, nt] = await Promise.all([
    sb.from('vehicles').select('*').order('created_at'),
    sb.from('bookings').select('*').order('date', { ascending: false }).limit(500),
    sb.from('notices').select('*').eq('user_id', uidv).order('created_at', { ascending: false }).limit(100),
  ])
  const myVehicles = (veh.data ?? []).filter(r => r.owner === uidv).map(toVehicle)
  const base = initial()
  apply({
    ...base,
    theme: useStore.getState().theme,
    signedIn: true, mode: 'live', userId: uidv, role, shopId: p.shop_id ?? undefined,
    user: { name: p.name || session.user.email?.split('@')[0] || '', email: p.email ?? session.user.email ?? '', phone: p.phone },
    plan: p.plan as PlanId, planSince: p.plan_since, yearlyUsed: p.yearly_used ?? {}, prefs: p.prefs, autoKm: p.auto_km,
    vehicles: myVehicles, activeVehicle: myVehicles[0]?.id ?? '',
    bookings: (bk.data ?? []).map(toBooking), notices: (nt.data ?? []).map(toNotice),
    shops: (shops.data ?? []).map(toShop),
    planPrices: Object.fromEntries((plans.data ?? []).map(r => [r.id, Number(r.price)])) as Record<PlanId, number>,
    planLimits: Object.fromEntries((plans.data ?? []).map(r => [r.id, r.max_vehicles])) as Record<PlanId, number>,
  })
  await finishPendingSignup()
  startSync()
  return role
}

/** Veículo informado no cadastro, quando o e-mail precisou ser confirmado antes */
const PENDING = 'carrook-pending-vehicle'
export const savePendingVehicle = (v: object) => { try { localStorage.setItem(PENDING, JSON.stringify(v)) } catch { /* */ } }
async function finishPendingSignup() {
  let raw: string | null = null
  try { raw = localStorage.getItem(PENDING) } catch { /* */ }
  if (!raw || useStore.getState().vehicles.length) return
  try { localStorage.removeItem(PENDING) } catch { /* */ }
  const v = JSON.parse(raw)
  useStore.getState().addVehicle(v) // o sincronizador envia para o banco
}

/* ---------- Envia alterações do app para o banco ---------- */
function startSync() {
  stopSync()
  unsub = useStore.subscribe((s, prev) => {
    if (applying || s.mode !== 'live' || !s.userId) return
    const id = s.userId
    // perfil
    if (s.user !== prev.user || s.plan !== prev.plan || s.planSince !== prev.planSince || s.prefs !== prev.prefs || s.autoKm !== prev.autoKm || s.yearlyUsed !== prev.yearlyUsed) {
      sb.from('profiles').update({ name: s.user.name, phone: s.user.phone, plan: s.plan, plan_since: s.planSince, prefs: s.prefs, auto_km: s.autoKm, yearly_used: s.yearlyUsed }).eq('id', id).then(r => report(r.error, 'perfil'))
    }
    // veículos
    if (s.vehicles !== prev.vehicles) {
      const before = new Map(prev.vehicles.map(v => [v.id, v]))
      for (const v of s.vehicles) {
        const old = before.get(v.id)
        if (!old) sb.from('vehicles').insert({ ...fromVehicle(v), owner: id }).then(r => report(r.error, 'veículo'))
        else if (old !== v) sb.from('vehicles').update(fromVehicle(v)).eq('id', v.id).then(r => report(r.error, 'veículo'))
        before.delete(v.id)
      }
      for (const gone of before.keys()) sb.from('vehicles').delete().eq('id', gone).then(r => report(r.error, 'veículo'))
    }
    // agendamentos
    if (s.bookings !== prev.bookings) {
      const before = new Map(prev.bookings.map(b => [b.id, b]))
      for (const b of s.bookings) {
        const old = before.get(b.id)
        if (!old) sb.from('bookings').insert({ ...fromBooking(b), user_id: id }).then(r => report(r.error, 'agendamento'))
        else if (old !== b) {
          const { id: _i, ...rest } = fromBooking(b); void _i
          sb.from('bookings').update({ status: rest.status, extra: rest.extra, report: rest.report }).eq('id', b.id).then(r => report(r.error, 'agendamento'))
        }
      }
    }
    // notificações (criadas pelo app e marcadas como lidas)
    if (s.notices !== prev.notices) {
      const before = new Map(prev.notices.map(n => [n.id, n]))
      for (const n of s.notices) {
        const old = before.get(n.id)
        if (!old) sb.from('notices').insert({ id: n.id, user_id: id, kind: n.kind, title: n.title, body: n.body, to_path: n.to ?? null, read: n.read }).then(r => report(r.error, 'notificação'))
        else if (old.read !== n.read) sb.from('notices').update({ read: n.read }).eq('id', n.id).then(r => report(r.error, 'notificação'))
      }
    }
    // oficinas (admin ou a própria oficina)
    if (s.shops !== prev.shops && (s.role === 'admin' || s.role === 'oficina')) {
      const before = new Map(prev.shops.map(x => [x.id, x]))
      for (const x of s.shops) {
        const old = before.get(x.id)
        const row = { id: x.id, name: x.name, photo: x.photo, address: x.address, district: x.district, discount: x.discount, hours: x.hours, phone: x.phone, services: x.services, blocked: x.blocked ?? [], map_x: x.map.x, map_y: x.map.y, distance_km: x.distanceKm }
        if (!old && s.role === 'admin') sb.from('shops').insert(row).then(r => report(r.error, 'oficina'))
        else if (old && old !== x) sb.from('shops').update(row).eq('id', x.id).then(r => report(r.error, 'oficina'))
      }
    }
    // planos (admin)
    if ((s.planPrices !== prev.planPrices || s.planLimits !== prev.planLimits) && s.role === 'admin') {
      for (const pid of Object.keys(s.planPrices) as PlanId[]) {
        if (s.planPrices[pid] !== prev.planPrices[pid] || s.planLimits[pid] !== prev.planLimits[pid])
          sb.from('plans').update({ price: s.planPrices[pid], max_vehicles: s.planLimits[pid] }).eq('id', pid).then(r => report(r.error, 'plano'))
      }
    }
  })

  // tempo real: status, orçamento e notificações chegam sozinhos
  channel = sb.channel('carrook-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, payload => {
      const st = useStore.getState()
      if (payload.eventType === 'DELETE') return
      const b = toBooking(payload.new as Row)
      const exists = st.bookings.some(x => x.id === b.id)
      const prevB = st.bookings.find(x => x.id === b.id)
      apply({ bookings: exists ? st.bookings.map(x => x.id === b.id ? b : x) : [b, ...st.bookings] })
      // serviço concluído: atualiza o histórico do meu veículo
      if (b.status === 'concluido' && prevB?.status !== 'concluido') {
        const v = useStore.getState().vehicles.find(x => x.id === b.vehicleId)
        if (v) {
          const today = new Date().toISOString(), k = currentKm(v, st.autoKm), last = { ...v.last }
          ITEMS.filter(i => i.service === b.service || (b.service === 'revisao' && ['filtroAr', 'oleo'].includes(i.key))).forEach(i => { last[i.key as ItemKey] = { km: k, date: today } })
          useStore.getState().updateVehicle(v.id, { last })
        }
      }
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notices' }, payload => {
      const st = useStore.getState()
      const n = toNotice(payload.new as Row)
      if (st.notices.some(x => x.id === n.id)) return
      apply({ notices: [n, ...st.notices] })
      st.say(n.title)
    })
    .subscribe()
}
function stopSync() { unsub?.(); unsub = null; if (channel) { sb.removeChannel(channel); channel = null } }

export async function signOut() {
  stopSync()
  await sb.auth.signOut()
  apply({ ...initial(), theme: useStore.getState().theme })
}

/** Lista de perfis (admin) */
export async function listProfiles() {
  const [p, v] = await Promise.all([sb.from('profiles').select('*').order('created_at', { ascending: false }), sb.from('vehicles').select('owner')])
  const counts = new Map<string, number>()
  for (const r of v.data ?? []) counts.set(r.owner, (counts.get(r.owner) ?? 0) + 1)
  return (p.data ?? []).map(r => ({ ...r, vehicles: counts.get(r.id) ?? 0 })) as Row[]
}
export async function setAccess(id: string, role: Role, shopId: string | null) {
  const r = await sb.from('profiles').update({ role, shop_id: role === 'oficina' ? shopId : null }).eq('id', id)
  report(r.error, 'perfil de acesso')
  return !r.error
}
