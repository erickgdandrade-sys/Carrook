import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, DotsThreeVertical, GasPump, ArrowRight, CalendarBlank, MapPin, Plus, Lightning } from '@phosphor-icons/react'
import { POSTS, PLANS, SERVICES, type ServiceKey } from '../data'
import { brl, currentKm, daysSince, fmtKm, healthScore, itemStates, quote, useStore, type Vehicle } from '../store'
import { Btn, Gauge, ITEM_ICON, LEVEL, LogoMark, Plate, SERVICE_ICON, Section, fmtDate } from '../ui'

const HOME_SERVICES: ServiceKey[] = ['revisao', 'oleo', 'freios', 'alinhamento', 'bateria', 'diagnostico']

export function Home() {
  const s = useStore()
  const nav = useNavigate()
  const vIndex = Math.max(0, s.vehicles.findIndex(v => v.id === s.activeVehicle))
  const v = s.vehicles[vIndex]
  const unread = s.notices.filter(n => !n.read).length
  const first = s.user.name.split(' ')[0]
  const next = s.bookings.filter(b => b.vehicleId !== '-' && !['concluido', 'cancelado'].includes(b.status)).sort((a, b) => a.date.localeCompare(b.date))[0]
  const plan = PLANS.find(p => p.id === s.plan)!

  if (!v) return <EmptyGarage name={first} />
  const states = itemStates(v, s.autoKm)
  const score = healthScore(v, s.autoKm)
  const attention = states.filter(x => x.level !== 'ok')

  return (
    <div>
      {/* ===== Cabeçalho violeta + carrossel de veículos ===== */}
      <div className="relative bg-violet px-5 pb-[118px] pt-[max(14px,env(safe-area-inset-top))] text-white lg:rounded-4xl lg:px-8 lg:pb-8 lg:pt-7">
        <div className="flex items-center justify-between">
          <Link to="/perfil" className="flex items-center gap-2.5 text-[19px] font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-white text-[13px] font-bold">{first[0]}</span>Olá, {first}
          </Link>
          <Link to="/notificacoes" aria-label={`Notificações${unread ? `, ${unread} novas` : ''}`} className="relative grid h-10 w-10 place-items-center rounded-full bg-white/15 lg:hidden">
            <Bell size={22} />{unread > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-violet bg-lime" />}
          </Link>
          <Link to="/plano" className="hidden items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25 lg:flex"><LogoMark size={16} color="#41D92A" />{plan.name}</Link>
        </div>
        <p className="mt-6 hidden max-w-xl text-[40px] font-extrabold leading-[1.05] lg:block">
          {attention.length ? <>O {v.model} pede atenção em <span className="text-lime">{attention.length} {attention.length > 1 ? 'itens' : 'item'}</span>.</> : <>Tudo em dia com o <span className="text-lime">{v.model}</span>.</>}
        </p>
      </div>

      <div className="-mt-[104px] lg:mt-6 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-6">
        <VehicleCarousel vehicles={s.vehicles} index={vIndex} onIndex={i => s.set({ activeVehicle: s.vehicles[i].id })} autoKm={s.autoKm} />

        <div className="mt-5 grid gap-4 px-5 lg:mt-0 lg:px-0">
          {/* Saúde do veículo */}
          <button onClick={() => nav(`/veiculos/${v.id}`)} className="relative overflow-hidden rounded-3xl bg-navy p-5 text-left text-white">
            <div className="flex items-center gap-4">
              <div className="-mb-2 shrink-0"><Gauge score={score} size={124} /></div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold uppercase tracking-[.12em] text-white/60">Saúde do veículo</p>
                <p className="mt-1 text-[17px] font-semibold leading-snug">{attention.length ? `${attention[0].name} ${attention[0].level === 'late' ? 'com prazo vencido' : 'vencendo em breve'}${attention.length > 1 ? `, e mais ${attention.length - 1} ${attention.length > 2 ? 'itens' : 'item'}` : ''}.` : 'Nenhuma manutenção pendente.'}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-lime">Ver plano de manutenção <ArrowRight size={14} weight="bold" /></span>
              </div>
            </div>
          </button>

          {/* Próximo agendamento */}
          {next ? <NextBooking id={next.id} /> : (
            <Link to="/oficinas" className="flex items-center gap-4 rounded-3xl border-2 border-dashed border-line bg-white/60 p-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mist text-royal"><CalendarBlank size={24} /></span>
              <span className="flex-1"><b className="block">Nada agendado</b><span className="text-sm text-muted">Encontre uma oficina parceira</span></span><ArrowRight size={18} className="text-muted" />
            </Link>
          )}

          {/* Itens que pedem atenção */}
          <div className="card divide-y divide-line">
            {states.slice(0, 3).map(it => {
              const Ic = ITEM_ICON[it.key], L = LEVEL[it.level]
              return (
                <Link key={it.key} to={`/oficinas?servico=${it.service}`} className="flex items-center gap-3 p-4">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${L.bg} ${L.text}`}><Ic size={20} weight="duotone" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2"><b className="truncate text-[15px] font-semibold">{it.name}</b><span className={`shrink-0 text-xs font-bold ${L.text}`}>{L.label}</span></span>
                    <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-mist"><span className={`block h-full rounded-full ${L.bar}`} style={{ width: `${Math.min(100, it.progress * 100)}%` }} /></span>
                    <span className="mt-1 block text-xs text-muted">{it.level === 'late' ? `Venceu por ${it.by}` : it.kmLeft > 0 ? `Faltam ${fmtKm(it.kmLeft)} ou ${Math.max(0, Math.round(it.daysLeft / 30))} meses` : 'Vencendo agora'}</span>
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* ===== Serviços ===== */}
      <Section title="Serviços para seu veículo" className="mt-8" action={<Link to="/oficinas" className="mr-5 text-sm font-semibold text-royal lg:mr-0">Ver oficinas</Link>}>
        <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto px-5 pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
          {HOME_SERVICES.map(k => <ServiceCard key={k} k={k} />)}
        </div>
      </Section>

      <div className="mt-8 grid gap-4 px-5 lg:grid-cols-2 lg:px-0">
        {/* Combustível */}
        <Link to="/beneficios" className="relative flex items-center gap-4 overflow-hidden rounded-3xl bg-lime p-5 text-ink">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-ink text-lime"><GasPump size={28} weight="fill" /></span>
          <span className="flex-1"><span className="text-[13px] font-semibold uppercase tracking-[.1em] text-ink/60">Benefício ativo</span><b className="block text-xl leading-tight">R$ 0,20 off por litro</b><span className="text-sm text-ink/70">Posto Parceiro BR-101 · 1,8 km</span></span>
          <ArrowRight size={22} weight="bold" />
        </Link>
        {/* Plano */}
        <Link to="/plano" className="relative flex items-center gap-4 overflow-hidden rounded-3xl bg-white p-5">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-royal text-white"><LogoMark size={30} /></span>
          <span className="flex-1"><span className="text-[13px] font-semibold uppercase tracking-[.1em] text-muted">Seu plano</span><b className="block text-xl leading-tight">{plan.name}</b><span className="text-sm text-muted">{s.yearlyUsed.revisao ? 'Revisão anual já usada' : 'Revisão anual de 80 itens disponível'}</span></span>
          <ArrowRight size={22} weight="bold" className="text-muted" />
        </Link>
      </div>

      {/* ===== Blog ===== */}
      <Section title="Descubra mais" className="mt-8">
        <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto px-5 pb-2 lg:grid lg:grid-cols-3 lg:px-0">
          {POSTS.map(p => (
            <article key={p.id} className="relative h-48 w-[260px] shrink-0 snap-start overflow-hidden rounded-3xl lg:w-auto">
              <img src={p.photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate/90 via-slate/30 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 text-white"><span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur">{p.tag} · {p.minutes} min</span><h3 className="mt-2 text-[17px] font-semibold leading-snug">{p.title}</h3></div>
            </article>
          ))}
        </div>
        <div className="mx-5 mt-3 flex items-center justify-between rounded-2xl bg-navy px-5 py-4 text-white lg:mx-0">
          <b className="text-[17px]">Acesse nosso blog</b><ArrowRight size={20} weight="bold" />
        </div>
      </Section>
    </div>
  )
}

/* Cartão de veículo, fiel ao mockup: foto, nome, placa e quilometragem */
function VehicleCarousel({ vehicles, index, onIndex, autoKm }: { vehicles: Vehicle[]; index: number; onIndex: (i: number) => void; autoKm: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [menu, setMenu] = useState<string | null>(null)
  const nav = useNavigate()
  const onScroll = () => {
    const el = ref.current; if (!el) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i !== index && vehicles[i]) onIndex(i)
  }
  return (
    <div className="relative">
      <div ref={ref} onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto lg:overflow-hidden">
        {vehicles.map(v => {
          const km = currentKm(v, autoKm)
          return (
            <div key={v.id} className="w-full shrink-0 snap-center px-5 lg:px-0">
              <article className="relative rounded-[28px] bg-white p-3 shadow-float lg:shadow-none">
                <button onClick={() => setMenu(menu === v.id ? null : v.id)} aria-label="Opções do veículo" className="absolute right-5 top-5 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate backdrop-blur"><DotsThreeVertical size={22} weight="bold" /></button>
                {menu === v.id && (
                  <div className="absolute right-5 top-16 z-20 w-48 overflow-hidden rounded-2xl bg-white text-sm shadow-float">
                    <button className="block w-full px-4 py-3 text-left hover:bg-mist" onClick={() => nav(`/veiculos/${v.id}`)}>Atualizar quilometragem</button>
                    <button className="block w-full px-4 py-3 text-left hover:bg-mist" onClick={() => nav('/veiculos')}>Gerenciar veículos</button>
                  </div>)}
                <Link to={`/veiculos/${v.id}`} className="block">
                  <img src={v.photo} alt={`${v.brand} ${v.model}`} className="aspect-[16/9] w-full rounded-[20px] object-cover lg:aspect-[16/8]" />
                  <div className="px-2 pb-1 pt-4">
                    <div className="flex items-end justify-between gap-3">
                      <div className="min-w-0"><p className="text-[13px] font-medium text-muted">{v.brand} · {v.year}</p><h2 className="truncate text-[24px] font-bold leading-tight">{v.model}</h2></div>
                      <Plate plate={v.plate} />
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[14px]">
                      <span className="text-muted">Quilometragem</span>
                      <span className="flex items-center gap-2">{autoKm && daysSince(v.kmUpdatedAt) > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-mist px-2 py-0.5 text-[11px] font-semibold text-royal"><Lightning size={11} weight="fill" />estimada</span>}<b className="tabular-nums">{fmtKm(km)}</b></span>
                    </div>
                  </div>
                </Link>
              </article>
            </div>)
        })}
      </div>
      <div className="mt-3 flex items-center justify-center gap-1.5">
        {vehicles.map((v, i) => <button key={v.id} aria-label={`Ver ${v.model}`} onClick={() => { ref.current?.scrollTo({ left: i * (ref.current?.clientWidth ?? 0), behavior: 'smooth' }); onIndex(i) }} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-12 bg-lime' : 'w-1.5 bg-line'}`} />)}
        <Link to="/veiculos/novo" aria-label="Adicionar veículo" className="ml-1 grid h-6 w-6 place-items-center rounded-full bg-white text-muted"><Plus size={12} weight="bold" /></Link>
      </div>
    </div>
  )
}

function ServiceCard({ k }: { k: ServiceKey }) {
  const s = useStore()
  const nav = useNavigate()
  const svc = SERVICES[k]
  const Ic = SERVICE_ICON[k]
  const best = s.shops.filter(x => x.services.includes(k)).map(x => quote(s.plan, x, k, s.yearlyUsed)).sort((a, b) => a.total - b.total)[0]
  return (
    <div className="w-[230px] shrink-0 snap-start rounded-3xl bg-white p-4 lg:w-auto">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-mist text-slate"><Ic size={24} /></span>
        <div className="min-w-0"><b className="block truncate text-[16px] font-semibold">{svc.short}</b><span className="text-[13px] text-muted">{best.total === 0 ? 'No seu plano' : 'A partir de:'}</span>
          <p className="text-[19px] font-bold tabular-nums leading-tight">{best.total === 0 ? 'Incluído' : brl(best.total)}</p></div>
      </div>
      <div className="mt-4 flex gap-2">
        <Btn size="sm" onClick={() => nav(`/oficinas?servico=${k}`)}>Contratar</Btn>
        <Btn size="sm" kind="ghost" onClick={() => nav(`/oficinas?servico=${k}&info=1`)}>Saiba mais</Btn>
      </div>
    </div>
  )
}

function NextBooking({ id }: { id: string }) {
  const b = useStore(s => s.bookings.find(x => x.id === id))!
  const shop = useStore(s => s.shops.find(x => x.id === b.shopId))!
  const d = new Date(b.date)
  return (
    <Link to={`/agendamentos/${b.id}`} className="flex items-stretch overflow-hidden rounded-3xl bg-white">
      <div className="flex w-20 shrink-0 flex-col items-center justify-center bg-royal text-white">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">{fmtDate(b.date, { month: 'short' })}</span>
        <span className="text-3xl font-extrabold leading-none">{d.getDate()}</span>
        <span className="mt-1 text-xs font-semibold">{b.time}</span>
      </div>
      <div className="min-w-0 flex-1 p-4">
        <p className="text-[12px] font-semibold uppercase tracking-[.1em] text-royal">Próximo agendamento</p>
        <b className="block truncate text-[16px]">{SERVICES[b.service].name}</b>
        <span className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted"><MapPin size={14} />{shop.name}</span>
      </div>
    </Link>
  )
}

function EmptyGarage({ name }: { name: string }) {
  const nav = useNavigate()
  return (
    <div className="px-5 pt-10 text-center">
      <h1 className="text-3xl font-extrabold">Olá, {name}</h1>
      <p className="mt-2 text-muted">Cadastre seu primeiro carro para receber alertas de manutenção.</p>
      <Btn className="mt-6" onClick={() => nav('/veiculos/novo')}><Plus size={18} weight="bold" />Adicionar veículo</Btn>
    </div>
  )
}
