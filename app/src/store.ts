import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
import { CARENCIA_DIAS, ITEMS, MODEL_PLANS, PLANS, SERVICES, SHOPS, img, type ItemKey, type PlanId, type ServiceKey, type Shop } from './data'

/* ---------- Tipos ---------- */
export interface Vehicle {
  id: string; brand: string; model: string; year: number; plate: string; photo: string; nickname?: string
  km: number; kmUpdatedAt: string; avgKmDay: number
  last: Record<ItemKey, { km: number; date: string }>
}
export type BookingStatus = 'agendado' | 'recebido' | 'diagnostico' | 'servico' | 'pronto' | 'concluido' | 'cancelado'
export interface Booking {
  id: string; vehicleId: string; shopId: string; service: ServiceKey; date: string; time: string
  price: number; base: number; payment: string; status: BookingStatus; customer: string; createdAt: string; note?: string
  extra?: { desc: string; value: number; status: 'pendente' | 'aprovado' | 'recusado' }
  report?: Record<string, ReportMark>
}
export type ReportMark = 'ok' | 'atencao' | 'trocar'
export type Role = 'cliente' | 'oficina' | 'admin'
export type Theme = 'system' | 'light' | 'dark'
export interface Prefs { push: boolean; email: boolean; whatsapp: boolean; manut: boolean; agenda: boolean; promo: boolean }
export interface Notice { id: string; kind: 'alerta' | 'agenda' | 'promo' | 'km'; title: string; body: string; date: string; read: boolean; to?: string }
export interface Subscriber { id: string; name: string; city: string; plan: PlanId; vehicles: number; since: string; status: 'ativo' | 'atrasado' | 'cancelado' }

/* ---------- Datas ---------- */
const DAY = 864e5
export const now = () => new Date()
const ago = (d: number) => new Date(Date.now() - d * DAY).toISOString()
const ahead = (d: number) => new Date(Date.now() + d * DAY).toISOString()
export const daysSince = (iso: string) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / DAY))
export const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const fmtKm = (v: number) => `${Math.round(v).toLocaleString('pt-BR')} km`
export const uid = () => Math.random().toString(36).slice(2, 9)

/* ---------- Seeds ---------- */
const lastAll = (km: number, date: string, over: Partial<Record<ItemKey, { km: number; date: string }>> = {}) =>
  Object.fromEntries(ITEMS.map(i => [i.key, over[i.key] ?? { km, date }])) as Vehicle['last']

const seedVehicles = (): Vehicle[] => [
  { id: 'v1', brand: 'Toyota', model: 'RAV4', year: 2022, plate: 'EGM9R71', photo: img('car-rav4'), nickname: 'Carro da família',
    km: 31200, kmUpdatedAt: ago(26), avgKmDay: 41,
    last: lastAll(20000, ago(420), { oleo: { km: 22300, date: ago(250) }, pneus: { km: 22300, date: ago(250) }, bateria: { km: 0, date: ago(1300) } }) },
  { id: 'v2', brand: 'Fiat', model: '500', year: 2019, plate: 'QJT4E28', photo: img('car-fiat500'),
    km: 48200, kmUpdatedAt: ago(6), avgKmDay: 19,
    last: lastAll(40000, ago(200), { freios: { km: 21000, date: ago(900) }, correia: { km: 0, date: ago(2000) } }) },
]

const seedBookings = (): Booking[] => [
  { id: 'b1', vehicleId: 'v1', shopId: 'prospera', service: 'oleo', date: ahead(2), time: '09:30', price: 0, base: 320, payment: 'Incluído no plano', status: 'agendado', customer: 'Marina Costa', createdAt: ago(1) },
  { id: 'b0', vehicleId: 'v2', shopId: 'rio-maina', service: 'alinhamento', date: ago(40), time: '14:00', price: 73.8, base: 180, payment: 'Pix', status: 'concluido', customer: 'Marina Costa', createdAt: ago(45) },
  { id: 'b-1', vehicleId: 'v1', shopId: 'prospera', service: 'revisao', date: ago(250), time: '08:00', price: 0, base: 1180, payment: 'Incluído no plano', status: 'concluido', customer: 'Marina Costa', createdAt: ago(255) },
  // agendamentos de outros clientes (aparecem só no admin)
  { id: 'x1', vehicleId: '-', shopId: 'centro-sul', service: 'freios', date: ago(0), time: '15:00', price: 202.4, base: 460, payment: 'Cartão de crédito', status: 'servico', customer: 'Júlia Mendes · HB20', createdAt: ago(3) },
  { id: 'x2', vehicleId: '-', shopId: 'pinheirinho', service: 'revisao', date: ago(0), time: '08:00', price: 0, base: 1180, payment: 'Incluído no plano', status: 'diagnostico', customer: 'Carlos Silva · Corolla', createdAt: ago(5) },
  { id: 'x3', vehicleId: '-', shopId: 'prospera', service: 'bateria', date: ahead(1), time: '11:00', price: 230.1, base: 590, payment: 'Pix', status: 'agendado', customer: 'Rafael Nunes · T-Cross', createdAt: ago(1) },
  { id: 'x4', vehicleId: '-', shopId: 'rio-maina', service: 'oleo', date: ago(0), time: '10:30', price: 0, base: 320, payment: 'Incluído no plano', status: 'recebido', customer: 'Ana Beatriz · Argo', createdAt: ago(2) },
  { id: 'x5', vehicleId: '-', shopId: 'centro-sul', service: 'diagnostico', date: ago(1), time: '16:30', price: 26.4, base: 150, payment: 'Cartão de débito', status: 'pronto', customer: 'Pedro Alves · Kwid', createdAt: ago(4) },
  { id: 'x6', vehicleId: '-', shopId: 'pinheirinho', service: 'correia', date: ahead(3), time: '13:30', price: 151.3, base: 890, payment: 'Cartão de crédito', status: 'agendado', customer: 'Larissa Pires · Onix', createdAt: ago(0) },
]

const seedNotices = (): Notice[] => [
  { id: 'n1', kind: 'agenda', title: 'Troca de óleo confirmada', body: 'Auto Center Próspera · daqui a 2 dias, 09:30', date: ago(1), read: false, to: '/agendamentos/b1' },
  { id: 'n2', kind: 'promo', title: '22% em peças na Próspera', body: 'Desconto de assinante válido até o fim do mês.', date: ago(2), read: false, to: '/oficinas/prospera' },
  { id: 'n3', kind: 'km', title: 'Confira a quilometragem', body: 'Faz 26 dias que você não atualiza o RAV4. Estimamos pelo seu uso.', date: ago(3), read: true, to: '/veiculos/v1' },
]

const NAMES = ['Marina Costa', 'Rafael Nunes', 'Júlia Mendes', 'Carlos Silva', 'Ana Beatriz Souza', 'Pedro Alves', 'Larissa Pires', 'Bruno Zanette', 'Camila de Luca', 'Thiago Rocha', 'Fernanda Milioli', 'Gustavo Pagani', 'Beatriz Cechinel', 'Lucas Fabris']
const CITIES = ['Criciúma', 'Içara', 'Forquilhinha', 'Nova Veneza', 'Cocal do Sul', 'Siderópolis']
export const SUBSCRIBERS: Subscriber[] = NAMES.map((n, i) => ({
  id: 's' + i, name: n, city: CITIES[i % CITIES.length], plan: (['start', 'clube', 'premium', 'start', 'clube'] as PlanId[])[i % 5],
  vehicles: 1 + (i % 3 === 0 ? 1 : 0), since: ago(20 + i * 23), status: i === 4 ? 'atrasado' : i === 11 ? 'cancelado' : 'ativo',
}))

/* ---------- Store ---------- */
interface State {
  signedIn: boolean
  role: Role
  planSince: string
  theme: Theme
  prefs: Prefs
  user: { name: string; email: string; phone: string }
  plan: PlanId
  yearlyUsed: Partial<Record<ServiceKey, boolean>>
  autoKm: boolean
  activeVehicle: string
  vehicles: Vehicle[]
  bookings: Booking[]
  notices: Notice[]
  shops: Shop[]
  planPrices: Record<PlanId, number>
  planLimits: Record<PlanId, number>
  toast: string | null
  set: (p: Partial<State>) => void
  say: (msg: string) => void
  updateKm: (id: string, km: number) => void
  addVehicle: (v: Omit<Vehicle, 'id' | 'last' | 'kmUpdatedAt' | 'avgKmDay'>) => string
  removeVehicle: (id: string) => void
  book: (b: Omit<Booking, 'id' | 'createdAt' | 'status' | 'customer'>) => string
  setStatus: (id: string, s: BookingStatus) => void
  readAll: () => void
  proposeExtra: (id: string, desc: string, value: number) => void
  answerExtra: (id: string, ok: boolean) => void
  saveReport: (id: string, r: Record<string, ReportMark>) => void
  updateVehicle: (id: string, p: Partial<Vehicle>) => void
  reset: () => void
}

const safeStorage: StateStorage = {
  getItem: k => { try { return localStorage.getItem(k) } catch { return null } },
  setItem: (k, v) => { try { localStorage.setItem(k, v) } catch { /* sem armazenamento */ } },
  removeItem: k => { try { localStorage.removeItem(k) } catch { /* */ } },
}

const initial = () => ({
  signedIn: false,
  role: 'cliente' as Role,
  planSince: ago(200),
  theme: 'system' as Theme,
  prefs: { push: true, email: true, whatsapp: true, manut: true, agenda: true, promo: false } as Prefs,
  user: { name: 'Marina Costa', email: 'marina@exemplo.com', phone: '(48) 99190-0000' },
  plan: 'start' as PlanId,
  yearlyUsed: {} as State['yearlyUsed'],
  autoKm: true,
  activeVehicle: 'v1',
  vehicles: seedVehicles(),
  bookings: seedBookings(),
  notices: seedNotices(),
  shops: SHOPS,
  planPrices: Object.fromEntries(PLANS.map(p => [p.id, p.price])) as Record<PlanId, number>,
  planLimits: Object.fromEntries(PLANS.map(p => [p.id, p.maxVehicles])) as Record<PlanId, number>,
  toast: null,
})

let toastTimer: number | undefined
export const useStore = create<State>()(persist((set, get) => ({
  ...initial(),
  set: p => set(p),
  say: msg => { set({ toast: msg }); clearTimeout(toastTimer); toastTimer = window.setTimeout(() => set({ toast: null }), 2800) },
  updateKm: (id, km) => set(s => ({ vehicles: s.vehicles.map(v => v.id === id ? { ...v, km, kmUpdatedAt: new Date().toISOString() } : v) })),
  addVehicle: v => {
    const id = 'v' + uid()
    const date = new Date().toISOString()
    set(s => ({ vehicles: [...s.vehicles, { ...v, id, kmUpdatedAt: date, avgKmDay: 30, last: lastAll(v.km, date) }], activeVehicle: id }))
    return id
  },
  removeVehicle: id => set(s => {
    const vehicles = s.vehicles.filter(v => v.id !== id)
    return { vehicles, activeVehicle: s.activeVehicle === id ? vehicles[0]?.id ?? '' : s.activeVehicle }
  }),
  book: b => {
    const id = 'b' + uid()
    const shop = get().shops.find(x => x.id === b.shopId)
    const svc = SERVICES[b.service]
    set(s => ({
      bookings: [{ ...b, id, status: 'agendado', customer: s.user.name, createdAt: new Date().toISOString() }, ...s.bookings],
      yearlyUsed: svc.includedYearly && b.price === 0 ? { ...s.yearlyUsed, [b.service]: true } : s.yearlyUsed,
      notices: [{ id: uid(), kind: 'agenda', title: `${svc.short} agendado`, body: `${shop?.name} · ${new Date(b.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}, ${b.time}`, date: new Date().toISOString(), read: false, to: '/agendamentos/' + id }, ...s.notices],
    }))
    return id
  },
  setStatus: (id, status) => set(s => {
    const b = s.bookings.find(x => x.id === id)
    const mine = b && b.vehicleId !== '-'
    const label: Record<BookingStatus, string> = { agendado: 'Agendado', recebido: 'Carro recebido na oficina', diagnostico: 'Em diagnóstico', servico: 'Serviço em andamento', pronto: 'Pronto para retirar', concluido: 'Serviço concluído', cancelado: 'Agendamento cancelado' }
    // ao concluir, atualiza o histórico de manutenção do veículo
    let vehicles = s.vehicles
    if (mine && status === 'concluido') {
      vehicles = s.vehicles.map(v => {
        if (v.id !== b!.vehicleId) return v
        const today = new Date().toISOString()
        const k = currentKm(v, s.autoKm)
        const last = { ...v.last }
        ITEMS.filter(i => i.service === b!.service || b!.service === 'revisao' && ['filtroAr', 'oleo'].includes(i.key)).forEach(i => { last[i.key] = { km: k, date: today } })
        return { ...v, last }
      })
    }
    return {
      vehicles,
      bookings: s.bookings.map(x => x.id === id ? { ...x, status } : x),
      notices: mine ? [{ id: uid(), kind: 'agenda' as const, title: label[status], body: `${SERVICES[b!.service].short} · ${s.shops.find(x => x.id === b!.shopId)?.name}`, date: new Date().toISOString(), read: false, to: '/agendamentos/' + id }, ...s.notices] : s.notices,
    }
  }),
  readAll: () => set(s => ({ notices: s.notices.map(n => ({ ...n, read: true })) })),
  proposeExtra: (id, desc, value) => set(s => {
    const b = s.bookings.find(x => x.id === id)
    const mine = b && b.vehicleId !== '-'
    return {
      bookings: s.bookings.map(x => x.id === id ? { ...x, extra: { desc, value, status: 'pendente' as const } } : x),
      notices: mine ? [{ id: uid(), kind: 'alerta' as const, title: 'Orçamento extra para aprovar', body: `${desc}: ${brl(value)} (antes da cobertura do plano)`, date: new Date().toISOString(), read: false, to: '/agendamentos/' + id }, ...s.notices] : s.notices,
    }
  }),
  answerExtra: (id, ok) => set(s => ({ bookings: s.bookings.map(x => x.id === id && x.extra ? { ...x, extra: { ...x.extra, status: ok ? 'aprovado' as const : 'recusado' as const } } : x) })),
  saveReport: (id, r) => set(s => ({ bookings: s.bookings.map(x => x.id === id ? { ...x, report: r } : x) })),
  updateVehicle: (id, p) => set(s => ({ vehicles: s.vehicles.map(v => v.id === id ? { ...v, ...p } : v) })),
  reset: () => set(s => ({ ...initial(), signedIn: true, role: s.role, theme: s.theme })),
}), {
  name: 'carrook-v1',
  storage: createJSONStorage(() => safeStorage),
  partialize: s => { const { toast, ...rest } = s; void toast; return rest as State },
}))

/* ---------- Regras de negócio ---------- */
export const currentKm = (v: Vehicle, auto: boolean) => auto ? v.km + daysSince(v.kmUpdatedAt) * v.avgKmDay : v.km

export type Level = 'ok' | 'soon' | 'late'
export interface ItemState { key: ItemKey; name: string; service: ServiceKey; progress: number; kmLeft: number; daysLeft: number; level: Level; dueKm: number; by: 'km' | 'tempo' }
export function itemStates(v: Vehicle, auto: boolean): ItemState[] {
  const km = currentKm(v, auto)
  const plan = MODEL_PLANS[`${v.brand} ${v.model}`]?.items ?? {}
  return ITEMS.filter(it => plan[it.key] !== null).map(base => {
    const it = { ...base, ...(plan[base.key] ?? {}) }
    const l = v.last[it.key]
    const pk = (km - l.km) / it.everyKm
    const pt = daysSince(l.date) / (it.everyMonths * 30.4)
    const progress = Math.max(pk, pt)
    const level: Level = progress >= 1 ? 'late' : progress >= 0.8 ? 'soon' : 'ok'
    return { key: it.key, name: it.name, service: it.service, progress, kmLeft: Math.round(l.km + it.everyKm - km), daysLeft: Math.round(it.everyMonths * 30.4 - daysSince(l.date)), level, dueKm: l.km + it.everyKm, by: (pt > pk ? 'tempo' : 'km') as ItemState['by'] }
  }).sort((a, b) => b.progress - a.progress)
}
export function healthScore(v: Vehicle, auto: boolean) {
  const st = itemStates(v, auto)
  const penalty = st.reduce((a, s) => a + (s.level === 'late' ? 18 : s.level === 'soon' ? 7 : Math.max(0, s.progress - 0.5) * 6), 0)
  return Math.max(12, Math.min(100, Math.round(100 - penalty)))
}

export interface Quote { base: number; total: number; label: string; saved: number; kind: 'incluido' | 'cobertura' | 'desconto' }
export const carenciaLeft = (plan: PlanId, since: string) => Math.max(0, CARENCIA_DIAS[plan] - daysSince(since))
export function quote(plan: PlanId, shop: Shop, svc: ServiceKey, yearlyUsed: State['yearlyUsed'], since: string = useStore.getState().planSince): Quote {
  const s = SERVICES[svc]
  const p = PLANS.find(x => x.id === plan)!
  const partner = Math.round(s.base * (1 - shop.discount / 100) * 100) / 100
  if (s.includedYearly && !yearlyUsed[svc]) return { base: s.base, total: 0, label: 'Incluído no seu plano (1x por ano)', saved: s.base, kind: 'incluido' }
  if (p.copay && carenciaLeft(plan, since) > 0) {
    return { base: s.base, total: partner, label: `Carência: cobertura libera em ${carenciaLeft(plan, since)} dias`, saved: s.base - partner, kind: 'desconto' }
  }
  if (p.copay) {
    const t = Math.round(partner * p.copay * 100) / 100
    return { base: s.base, total: t, label: `Cobertura ${p.short}: você paga ${p.copay * 100}%`, saved: s.base - t, kind: 'cobertura' }
  }
  return { base: s.base, total: partner, label: `Desconto de parceiro (${shop.discount}%)`, saved: s.base - partner, kind: 'desconto' }
}

// Indicação Carrook: equilibra desconto, nota e distância
export const recommendScore = (s: Shop) => s.discount * 0.8 + s.rating * 6 - s.distanceKm * 1.2
export const STATUS_FLOW: BookingStatus[] = ['agendado', 'recebido', 'diagnostico', 'servico', 'pronto', 'concluido']
export const STATUS_LABEL: Record<BookingStatus, string> = { agendado: 'Agendado', recebido: 'Recebido', diagnostico: 'Diagnóstico', servico: 'Em serviço', pronto: 'Pronto', concluido: 'Concluído', cancelado: 'Cancelado' }
