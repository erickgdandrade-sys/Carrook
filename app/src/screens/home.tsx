import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, DotsThreeVertical, GasPump, ArrowRight, CalendarCheck, MapPin, Plus, Lightning, Heartbeat, Wrench } from '@phosphor-icons/react'
import { POSTS, PLANS, SERVICES, cut, type ServiceKey } from '../data'
import { SHOPS } from '../data'
import { brl, currentKm, daysSince, fmtKm, healthScore, itemStates, quote, useStore, type Vehicle } from '../store'
import { ThemeSwitch, Btn, ITEM_ICON, LEVEL, LogoMark, Plate, SERVICE_ICON, Section, fmtDate } from '../ui'
import { Bento, Bars, Field, Mini, Pill, Row } from '../bento'

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
          <div className="flex items-center gap-2.5 lg:hidden">
            <ThemeSwitch />
            <Link to="/notificacoes" aria-label={`Notificações${unread ? `, ${unread} novas` : ''}`} className="relative grid h-10 w-10 place-items-center rounded-full bg-white/15">
              <Bell size={22} />{unread > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-violet bg-lime" />}
            </Link>
          </div>
          <Link to="/plano" className="hidden items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25 lg:flex"><LogoMark size={16} color="#41D92A" />{plan.name}</Link>
        </div>
        <p className="mt-6 hidden max-w-xl text-[40px] font-extrabold leading-[1.05] lg:block">
          {attention.length ? <>O {v.model} pede atenção em <span className="text-lime">{attention.length} {attention.length > 1 ? 'itens' : 'item'}</span>.</> : <>Tudo em dia com o <span className="text-lime">{v.model}</span>.</>}
        </p>
      </div>

      <div className="-mt-[104px] lg:mt-6 lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-5">
        <VehicleCarousel vehicles={s.vehicles} index={vIndex} onIndex={i => s.set({ activeVehicle: s.vehicles[i].id })} autoKm={s.autoKm} />

        {/* Bloco: saúde do veículo */}
        <div className="mt-5 px-5 lg:mt-0 lg:px-0">
          <Bento tone="navy" eyebrow="Saúde do veículo" className="h-full"
            title={attention.length ? <>{attention.length} {attention.length > 1 ? 'itens pedem' : 'item pede'} atenção</> : 'Tudo em dia'}
            desc={`O plano do ${v.model} segue o manual e o seu uso. Vence o que chegar primeiro: km ou tempo.`}>
            <Mini title="Plano de manutenção" right={<span className="flex items-center gap-1.5 text-[12px] font-semibold text-muted"><span className={`h-2 w-2 rounded-full ${score >= 75 ? 'bg-lime' : score >= 50 ? 'bg-amber' : 'bg-danger'}`} />Saúde {score}</span>}>
              {states.slice(0, 3).map(it => {
                const Ic = ITEM_ICON[it.key], L = LEVEL[it.level]
                return <Link key={it.key} to={`/oficinas?servico=${it.service}`} className="block">
                  <Row avatar={<span className={`grid h-full w-full place-items-center ${L.bg} ${L.text}`}><Ic size={20} weight="duotone" /></span>} name={it.name} sub={L.label}
                    top={it.level === 'late' ? 'Venceu por' : 'Vence em'} bottom={it.level === 'late' ? it.by : it.kmLeft > 0 ? fmtKm(it.kmLeft) : 'agora'} accent={L.text} />
                </Link>
              })}
              <Link to={`/veiculos/${v.id}`} className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-mist py-2.5 text-[13px] font-semibold text-royal">Ver estrada da manutenção <ArrowRight size={14} weight="bold" /></Link>
            </Mini>
          </Bento>
        </div>
      </div>

      <div className="mt-5 grid gap-5 px-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:px-0">
        {/* Bloco: agendamento rápido */}
        <QuickBook vehicle={v} next={next?.id} />
        {/* Bloco: seus números */}
        <Numbers score={score} />
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
        <Link to="/plano" className="relative flex items-center gap-4 overflow-hidden rounded-3xl bg-surface p-5">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-royal text-white"><LogoMark size={30} /></span>
          <span className="flex-1"><span className="text-[13px] font-semibold uppercase tracking-[.1em] text-muted">Seu plano</span><b className="block text-xl leading-tight">{plan.name}</b><span className="text-sm text-muted">{s.yearlyUsed.revisao ? 'Revisão anual já usada' : 'Revisão anual de 80 itens disponível'}</span></span>
          <ArrowRight size={22} weight="bold" className="text-muted" />
        </Link>
      </div>

      {/* ===== Blog ===== */}
      <Section title="Descubra mais" className="mt-8">
        <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto px-5 pb-2 lg:grid lg:grid-cols-3 lg:px-0">
          {POSTS.map(p => (
            <Link to={`/blog/${p.id}`} key={p.id} className="relative h-48 w-[260px] shrink-0 snap-start overflow-hidden rounded-3xl lg:w-auto">
              <img src={p.photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate/90 via-slate/30 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 text-white"><span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur">{p.tag} · {p.minutes} min</span><h3 className="mt-2 text-[17px] font-semibold leading-snug">{p.title}</h3></div>
            </Link>
          ))}
        </div>
        <Link to="/blog/oleo" className="mx-5 mt-3 flex items-center justify-between rounded-2xl bg-navy px-5 py-4 text-white lg:mx-0">
          <b className="text-[17px]">Acesse nosso blog</b><ArrowRight size={20} weight="bold" />
        </Link>
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
              <article className="relative rounded-[28px] bg-surface p-3 shadow-float lg:shadow-none">
                <button onClick={() => setMenu(menu === v.id ? null : v.id)} aria-label="Opções do veículo" className="absolute right-5 top-5 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#151A3B] backdrop-blur"><DotsThreeVertical size={22} weight="bold" /></button>
                {menu === v.id && (
                  <div className="absolute right-5 top-16 z-20 w-48 overflow-hidden rounded-2xl bg-surface text-sm shadow-float">
                    <button className="block w-full px-4 py-3 text-left hover:bg-mist" onClick={() => nav(`/veiculos/${v.id}`)}>Atualizar quilometragem</button>
                    <button className="block w-full px-4 py-3 text-left hover:bg-mist" onClick={() => nav('/veiculos')}>Gerenciar veículos</button>
                  </div>)}
                <Link to={`/veiculos/${v.id}`} className="block">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-[20px] bg-gradient-to-b from-mist via-mist to-surface lg:aspect-[16/8]">
                    <span aria-hidden className="absolute inset-x-0 bottom-[14%] h-px bg-line" />
                    <img src={cut(v.photo)} alt={`${v.brand} ${v.model}`} className="absolute bottom-[6%] left-1/2 h-[84%] w-[90%] -translate-x-1/2 object-contain object-bottom" />
                  </div>
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
        <Link to="/veiculos/novo" aria-label="Adicionar veículo" className="ml-1 grid h-6 w-6 place-items-center rounded-full bg-surface text-muted"><Plus size={12} weight="bold" /></Link>
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
    <div className="w-[230px] shrink-0 snap-start rounded-3xl bg-surface p-4 lg:w-auto">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-mist text-fg"><Ic size={24} /></span>
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

function QuickBook({ vehicle, next }: { vehicle: Vehicle; next?: string }) {
  const s = useStore()
  const nav = useNavigate()
  const [svc, setSvc] = useState<ServiceKey>('freios')
  const [vid, setVid] = useState(vehicle.id)
  const v = s.vehicles.find(x => x.id === vid) ?? vehicle
  const options = s.shops.filter(x => x.services.includes(svc)).map(x => ({ shop: x, q: quote(s.plan, x, svc, s.yearlyUsed) })).sort((a, b) => a.q.total - b.q.total)
  const best = options[0]
  const b = next ? s.bookings.find(x => x.id === next) : undefined
  const bShop = b && s.shops.find(x => x.id === b.shopId)
  const Ic = SERVICE_ICON[svc]
  return (
    <Bento tone="lime" eyebrow="Agendamento rápido" title="Agende e pague em segundos" desc="Escolha o serviço e veja na hora quanto você paga no seu plano.">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] [&>*]:min-w-0">
        <Mini title="Novo serviço">
          <label className="mt-3 block"><span className="mb-1.5 block text-[12px] text-muted">Veículo</span>
            <span className="relative flex h-11 items-center gap-2 rounded-xl border border-line px-2">
              <img src={cut(v.photo)} alt="" className="h-7 w-10 object-contain" />
              <select id="qb-vehicle" value={vid} onChange={e => setVid(e.target.value)} className="h-full flex-1 appearance-none bg-transparent text-[14px] font-medium outline-none">{s.vehicles.map(x => <option key={x.id} value={x.id}>{x.brand} {x.model}</option>)}</select>
            </span></label>
          <label className="mt-3 block"><span className="mb-1.5 block text-[12px] text-muted">Serviço</span>
            <span className="relative flex h-11 items-center gap-2 rounded-xl border border-line px-3">
              <Ic size={18} className="text-royal" />
              <select id="qb-service" value={svc} onChange={e => setSvc(e.target.value as ServiceKey)} className="h-full flex-1 appearance-none bg-transparent text-[14px] font-medium outline-none">{(Object.keys(SERVICES) as ServiceKey[]).map(k => <option key={k} value={k}>{SERVICES[k].short}</option>)}</select>
            </span></label>
          <Field label="Você paga a partir de"><b className="tabular-nums">{best ? (best.q.total === 0 ? 'Incluído no plano' : brl(best.q.total)) : '—'}</b></Field>
          <Btn kind="dark" className="mt-4 w-full" onClick={() => nav(`/oficinas?servico=${svc}`)}>Ver oficinas</Btn>
        </Mini>
        <div className="grid min-w-0 content-start gap-3">
          <Mini>
            <span className="text-[12px] text-muted">Você economiza</span>
            <p className="text-[28px] font-bold tabular-nums leading-tight">{best ? brl(best.q.saved) : '—'}</p>
            <div className="mt-2 flex flex-wrap gap-1.5"><Pill>Pix 5%</Pill><Pill>6x sem juros</Pill><Pill>{PLANS.find(p => p.id === s.plan)!.short}</Pill></div>
            {best && <div className="mt-3 border-t border-line pt-3"><Row avatar={<img src={best.shop.photo} alt="" className="h-full w-full object-cover" />} name={best.shop.name} sub="Melhor preço para você" /></div>}
          </Mini>
          <Mini>
            {b && bShop ? (
              <Link to={`/agendamentos/${b.id}`} className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-royal text-white"><CalendarCheck size={24} weight="fill" /></span>
                <span className="min-w-0"><b className="block text-[14px]">{SERVICES[b.service].short} agendado</b><span className="block truncate text-[12px] text-muted">{fmtDate(b.date, { weekday: 'short', day: 'numeric', month: 'short' })}, {b.time} · {bShop.name}</span></span>
              </Link>
            ) : <p className="flex items-center gap-3 text-[13px] text-muted"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mist text-royal"><MapPin size={22} /></span>{SHOPS.length} oficinas parceiras perto de você</p>}
          </Mini>
        </div>
      </div>
    </Bento>
  )
}

function Numbers({ score }: { score: number }) {
  const s = useStore()
  const mine = s.bookings.filter(b => b.vehicleId !== '-' && b.status !== 'cancelado')
  const saved = mine.reduce((a, b) => a + (b.base - b.price), 0)
  const done = mine.filter(b => b.status === 'concluido').length
  // economia por mês (últimos 6), a partir dos agendamentos
  const months = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i)); return d })
  const data = months.map(d => ({ label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), value: mine.filter(b => { const x = new Date(b.date); return x.getMonth() === d.getMonth() && x.getFullYear() === d.getFullYear() }).reduce((a, b) => a + (b.base - b.price), 0) }))
  return (
    <Bento tone="violet" eyebrow="Seus números" title="Saúde e economia do seu carro" desc="Tudo que a Carrook já fez por você, mês a mês.">
      <div className="grid grid-cols-2 gap-3">
        <Mini><span className="flex items-center gap-1.5 text-[12px] text-muted"><Heartbeat size={15} weight="fill" className="text-royal" />Saúde</span><p className="text-[26px] font-bold tabular-nums">{score}<small className="text-[13px] font-medium text-muted">/100</small></p></Mini>
        <Mini><span className="flex items-center gap-1.5 text-[12px] text-muted"><Wrench size={15} weight="fill" className="text-royal" />Serviços feitos</span><p className="text-[26px] font-bold tabular-nums">{done}</p></Mini>
        <Mini className="col-span-2"><span className="text-[12px] text-muted">Economia total com a Carrook</span><p className="text-[28px] font-bold tabular-nums leading-tight">{brl(saved)}</p><Bars data={data} /></Mini>
      </div>
    </Bento>
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
