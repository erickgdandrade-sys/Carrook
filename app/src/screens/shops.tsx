import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { MapPin, Clock, Phone, CaretLeft, QrCode, CreditCard, Barcode, DeviceMobile, Copy, Check, Info, ListBullets, MapTrifold } from '@phosphor-icons/react'
import { SERVICES, type ServiceKey } from '../data'
import { brl, quote, recommendScore, useStore } from '../store'
import { Btn, LogoMark, PageHead, SERVICE_ICON, Seal, Stars, fmtDate } from '../ui'

type Sort = 'indicada' | 'desconto' | 'perto' | 'nota'

/* Mapa estilizado de Criciúma com os parceiros */
function CityMap({ active, onPick }: { active?: string; onPick: (id: string) => void }) {
  const shops = useStore(s => s.shops)
  return (
    <div className="relative h-[220px] overflow-hidden rounded-3xl bg-[#E4E9F7] lg:h-full lg:min-h-[420px]">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-5 70 C 20 60, 35 80, 60 64 S 90 40, 110 46" fill="none" stroke="#BFD0F5" strokeWidth="5" />
        {[[0, 30, 100, 38], [0, 58, 100, 50], [18, 0, 26, 100], [52, 0, 46, 100], [78, 0, 84, 100], [0, 86, 100, 80], [0, 12, 100, 18]].map(([a, b, c, d], i) =>
          <line key={i} x1={a} y1={b} x2={c} y2={d} stroke="#fff" strokeWidth={i === 1 || i === 3 ? 2.2 : 1.2} />)}
        <rect x="58" y="70" width="14" height="10" rx="2" fill="#CFE9C8" />
        <rect x="8" y="40" width="10" height="12" rx="2" fill="#CFE9C8" />
      </svg>
      <span className="absolute left-[49%] top-[44%] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-royal shadow-[0_0_0_8px_rgba(31,85,225,.18)]" aria-label="Você" />
      {shops.map(s => (
        <button key={s.id} onClick={() => onPick(s.id)} style={{ left: `${s.map.x}%`, top: `${s.map.y}%` }}
          className={`absolute flex -translate-x-1/2 -translate-y-full items-center gap-1 rounded-full py-1 pl-1 pr-2.5 text-[12px] font-bold shadow-soft transition ${active === s.id ? 'z-10 scale-110 bg-slate text-white' : 'bg-white text-slate'}`}>
          <span className="grid h-6 w-6 place-items-center rounded-full bg-royal text-white"><LogoMark size={13} /></span>-{s.discount}%
        </button>))}
    </div>
  )
}

export function Shops() {
  const s = useStore()
  const nav = useNavigate()
  const [params, setParams] = useSearchParams()
  const svc = (params.get('servico') as ServiceKey) || 'revisao'
  const [sort, setSort] = useState<Sort>('indicada')
  const [view, setView] = useState<'lista' | 'mapa'>('lista')
  const [picked, setPicked] = useState<string>()
  const info = params.get('info') === '1'
  const top = useMemo(() => [...s.shops].sort((a, b) => recommendScore(b) - recommendScore(a))[0]?.id, [s.shops])
  const list = s.shops.filter(x => x.services.includes(svc)).sort((a, b) =>
    sort === 'desconto' ? b.discount - a.discount : sort === 'perto' ? a.distanceKm - b.distanceKm : sort === 'nota' ? b.rating - a.rating : recommendScore(b) - recommendScore(a))

  return (
    <div>
      <PageHead title="Oficinas parceiras" sub="Todas certificadas com o selo Carrook" back={false}
        right={<button onClick={() => setView(view === 'lista' ? 'mapa' : 'lista')} className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-soft lg:hidden" aria-label={view === 'lista' ? 'Ver mapa' : 'Ver lista'}>{view === 'lista' ? <MapTrifold size={20} /> : <ListBullets size={20} />}</button>} />

      {/* Serviços */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-3 lg:flex-wrap lg:px-0">
        {(Object.keys(SERVICES) as ServiceKey[]).map(k => {
          const Ic = SERVICE_ICON[k]
          return <button key={k} onClick={() => setParams({ servico: k })} aria-pressed={svc === k} className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${svc === k ? 'bg-royal text-white' : 'bg-white text-slate hover:bg-line'}`}><Ic size={17} />{SERVICES[k].short}</button>
        })}
      </div>

      {info && (
        <div className="mx-5 mb-3 flex gap-3 rounded-3xl bg-navy p-4 text-sm text-white lg:mx-0">
          <Info size={22} className="shrink-0 text-lime" />
          <p><b className="block text-base">{SERVICES[svc].name}</b>{SERVICES[svc].desc} Leva cerca de {Math.round(SERVICES[svc].minutes / 60 * 10) / 10} h.</p>
        </div>)}

      <div className="no-scrollbar flex gap-4 overflow-x-auto px-5 pb-4 text-sm lg:px-0">
        {([['indicada', 'Indicada Carrook'], ['desconto', 'Maior desconto'], ['perto', 'Mais perto'], ['nota', 'Melhor avaliadas']] as [Sort, string][]).map(([k, t]) =>
          <button key={k} onClick={() => setSort(k)} className={`shrink-0 border-b-2 pb-1 font-semibold ${sort === k ? 'border-lime text-slate' : 'border-transparent text-muted'}`}>{t}</button>)}
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,.9fr)] lg:gap-6">
        <div className={`px-5 lg:px-0 ${view === 'mapa' ? 'hidden lg:block' : ''}`}>
          <div className="grid gap-3">
            {list.map(shop => {
              const q = quote(s.plan, shop, svc, s.yearlyUsed)
              const rec = shop.id === top
              return (
                <button key={shop.id} onClick={() => nav(`/oficinas/${shop.id}?servico=${svc}`)} onMouseEnter={() => setPicked(shop.id)}
                  className={`flex overflow-hidden rounded-3xl bg-white text-left transition hover:shadow-soft ${rec ? 'ring-2 ring-lime' : ''} ${picked === shop.id ? 'shadow-soft' : ''}`}>
                  <div className="relative w-[112px] shrink-0 sm:w-[150px]">
                    <img src={shop.photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <span className="absolute bottom-2 left-2 rounded-full bg-lime px-2 py-0.5 text-[12px] font-extrabold text-ink">-{shop.discount}%</span>
                  </div>
                  <div className="min-w-0 flex-1 p-4">
                    {rec && <span className="mb-1 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[.08em] text-leaf"><LogoMark size={12} />Indicada Carrook</span>}
                    <b className="flex items-center gap-1.5 text-[16px] font-semibold"><span className="truncate">{shop.name}</span><Seal /></b>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted"><span className="flex items-center gap-1"><Stars value={shop.rating} size={11} />{shop.rating.toFixed(1)}</span><span className="flex items-center gap-1"><MapPin size={12} />{shop.distanceKm.toFixed(1).replace('.', ',')} km</span></span>
                    <div className="mt-3 flex items-end justify-between gap-2">
                      <span><span className="block text-[19px] font-bold tabular-nums leading-none">{q.total === 0 ? 'Incluído' : brl(q.total)}</span><span className="text-xs text-muted line-through">{brl(q.base)}</span></span>
                      <span className="text-right text-[11px] font-semibold leading-tight text-leaf">{q.kind === 'incluido' ? 'no plano' : `economia de ${brl(q.saved)}`}</span>
                    </div>
                  </div>
                </button>)
            })}
            {!list.length && <p className="rounded-3xl bg-white p-6 text-center text-muted">Nenhuma parceira faz esse serviço ainda.</p>}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted">A indicação Carrook pesa desconto, avaliação e distância. Você pode escolher qualquer oficina da lista.</p>
        </div>
        <div className={`px-5 lg:sticky lg:top-8 lg:block lg:self-start lg:px-0 ${view === 'lista' ? 'hidden' : ''}`}>
          <CityMap active={picked} onPick={id => nav(`/oficinas/${id}?servico=${svc}`)} />
        </div>
      </div>
    </div>
  )
}

export function ShopDetail() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const s = useStore()
  const nav = useNavigate()
  const shop = s.shops.find(x => x.id === id)
  const [svc, setSvc] = useState<ServiceKey>((params.get('servico') as ServiceKey) || shop?.services[0] || 'revisao')
  if (!shop) return <PageHead title="Oficina não encontrada" />
  const q = quote(s.plan, shop, shop.services.includes(svc) ? svc : shop.services[0], s.yearlyUsed)
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
      <div>
        <div className="relative h-[260px] overflow-hidden lg:h-[360px] lg:rounded-4xl">
          <img src={shop.photo} alt={`Oficina ${shop.name}`} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate/90 via-transparent to-slate/30" />
          <button onClick={() => nav(-1)} aria-label="Voltar" className="absolute left-5 top-[max(16px,env(safe-area-inset-top))] grid h-10 w-10 place-items-center rounded-full bg-white/90 text-slate"><CaretLeft size={20} weight="bold" /></button>
          <div className="absolute inset-x-5 bottom-5 text-white lg:inset-x-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[12px] font-bold text-royal"><Seal size={14} />Parceiro Carrook desde {shop.since}</span>
            <h1 className="mt-2 text-[30px] font-extrabold leading-tight lg:text-[40px]">{shop.name}</h1>
            <p className="flex items-center gap-2 text-sm text-white/85"><Stars value={shop.rating} />{shop.rating.toFixed(1)} · {shop.reviews} avaliações</p>
          </div>
        </div>
        <div className="grid gap-2 px-5 pt-5 text-sm text-muted lg:px-0">
          <p className="flex items-center gap-2"><MapPin size={18} className="text-royal" />{shop.address} · {shop.district}, Criciúma · {shop.distanceKm.toFixed(1).replace('.', ',')} km</p>
          <p className="flex items-center gap-2"><Clock size={18} className="text-royal" />{shop.hours}</p>
          <p className="flex items-center gap-2"><Phone size={18} className="text-royal" />{shop.phone}</p>
        </div>

        <h2 className="mt-7 px-5 text-[15px] font-semibold lg:px-0 lg:text-lg">Serviços e preços no seu plano</h2>
        <div className="mt-3 grid gap-2 px-5 lg:px-0">
          {shop.services.map(k => {
            const qq = quote(s.plan, shop, k, s.yearlyUsed), Ic = SERVICE_ICON[k]
            return (
              <button key={k} onClick={() => setSvc(k)} aria-pressed={svc === k} className={`flex items-center gap-3 rounded-2xl border-2 bg-white p-3.5 text-left transition ${svc === k ? 'border-royal' : 'border-transparent'}`}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mist"><Ic size={20} /></span>
                <span className="min-w-0 flex-1"><b className="block truncate text-[15px] font-semibold">{SERVICES[k].name}</b><span className="text-xs text-muted">~{Math.round(SERVICES[k].minutes / 6) / 10} h</span></span>
                <span className="text-right"><b className="block tabular-nums">{qq.total === 0 ? 'Incluído' : brl(qq.total)}</b><span className="text-xs text-muted line-through">{brl(qq.base)}</span></span>
              </button>)
          })}
        </div>

        <h2 className="mt-7 px-5 text-[15px] font-semibold lg:px-0 lg:text-lg">O que dizem os clientes</h2>
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-5 pb-2 lg:px-0">
          {shop.quotes.map((r, i) => (
            <figure key={i} className="w-[260px] shrink-0 rounded-3xl bg-white p-4"><Stars value={r.stars} /><blockquote className="mt-2 text-[15px] leading-snug">“{r.text}”</blockquote><figcaption className="mt-2 text-xs text-muted">{r.name} · assinante Carrook</figcaption></figure>))}
        </div>
      </div>

      {/* Resumo fixo */}
      <aside className="pb-safe sticky bottom-0 z-30 mt-6 border-t border-line bg-white p-4 lg:top-8 lg:mt-0 lg:self-start lg:rounded-3xl lg:border-0 lg:p-6">
        <div className="flex items-center justify-between gap-3 lg:block">
          <div className="min-w-0"><p className="truncate text-sm text-muted">{SERVICES[q.base ? svc : svc].short} · {q.label}</p><p className="text-2xl font-extrabold tabular-nums">{q.total === 0 ? 'R$ 0,00' : brl(q.total)}</p></div>
          <Btn size="lg" className="shrink-0 lg:mt-4 lg:w-full" onClick={() => nav(`/agendar/${shop.id}?servico=${svc}`)}>Agendar</Btn>
        </div>
      </aside>
    </div>
  )
}

export function Schedule() {
  const { shopId } = useParams()
  const [params] = useSearchParams()
  const s = useStore()
  const nav = useNavigate()
  const shop = s.shops.find(x => x.id === shopId)!
  const [svc, setSvc] = useState<ServiceKey>((params.get('servico') as ServiceKey) || shop.services[0])
  const [vehicle, setVehicle] = useState(s.activeVehicle)
  const days = useMemo(() => Array.from({ length: 12 }, (_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i + 1); return d }).filter(d => d.getDay() !== 0), [])
  const [day, setDay] = useState(0)
  const [time, setTime] = useState<string>()
  const hours = ['08:00', '09:30', '11:00', '13:30', '15:00', '16:30']
  const busy = (h: string, i: number) => (i * 7 + hours.indexOf(h) * 3) % 5 === 0 || (days[day]?.getDay() === 6 && hours.indexOf(h) > 2)
  const q = quote(s.plan, shop, svc, s.yearlyUsed)

  const go = () => {
    if (!time) return
    const draft = { vehicleId: vehicle, shopId: shop.id, service: svc, date: days[day].toISOString(), time, price: q.total, base: q.base }
    if (q.total === 0) {
      const id = s.book({ ...draft, payment: 'Incluído no plano' })
      nav(`/agendamentos/${id}?novo=1`, { replace: true })
    } else nav('/pagamento', { state: draft })
  }

  return (
    <div className="lg:max-w-3xl">
      <PageHead title="Agendar" sub={shop.name} />
      <div className="grid grid-cols-1 gap-6 px-5 lg:px-0 [&>*]:min-w-0">
        {s.vehicles.length > 1 && (
          <div><span className="label">Veículo</span>
            <div className="grid grid-cols-2 gap-2">{s.vehicles.map(v => (
              <button key={v.id} onClick={() => setVehicle(v.id)} aria-pressed={vehicle === v.id} className={`flex items-center gap-2 overflow-hidden rounded-2xl border-2 bg-white pr-3 text-left ${vehicle === v.id ? 'border-royal' : 'border-transparent'}`}>
                <img src={v.photo} alt="" className="h-14 w-16 object-cover" /><b className="truncate text-sm">{v.model}</b></button>))}</div></div>)}
        <label><span className="label">Serviço</span>
          <select id="sc-svc" className="field" value={svc} onChange={e => setSvc(e.target.value as ServiceKey)}>{shop.services.map(k => <option key={k} value={k}>{SERVICES[k].name}</option>)}</select></label>
        <div><span className="label">Dia</span>
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:px-0">{days.map((d, i) => (
            <button key={i} onClick={() => { setDay(i); setTime(undefined) }} aria-pressed={day === i} className={`flex w-[62px] shrink-0 flex-col items-center rounded-2xl py-3 transition ${day === i ? 'bg-royal text-white' : 'bg-white'}`}>
              <span className={`text-[11px] font-semibold uppercase ${day === i ? 'text-white/75' : 'text-muted'}`}>{d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span>
              <span className="text-xl font-bold">{d.getDate()}</span></button>))}</div></div>
        <div><span className="label">Horário</span>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{hours.map(h => {
            const off = busy(h, day)
            return <button key={h} disabled={off} onClick={() => setTime(h)} aria-pressed={time === h} className={`rounded-2xl py-3 font-semibold tabular-nums transition ${time === h ? 'bg-royal text-white' : 'bg-white'} disabled:bg-transparent disabled:text-muted/50 disabled:line-through`}>{h}</button>
          })}</div></div>
        <div className="rounded-3xl bg-white p-5">
          <div className="flex justify-between text-sm"><span>{SERVICES[svc].name}</span><span className="tabular-nums">{brl(q.base)}</span></div>
          <div className="mt-2 flex justify-between text-sm"><span className="text-muted">{q.label}</span><span className="font-semibold tabular-nums text-leaf">-{brl(q.saved)}</span></div>
          <div className="mt-3 flex justify-between border-t border-dashed border-line pt-3 text-lg font-bold"><span>Você paga</span><span className="tabular-nums">{brl(q.total)}</span></div>
        </div>
        <Btn size="lg" disabled={!time} onClick={go}>{!time ? 'Escolha um horário' : q.total === 0 ? 'Confirmar agendamento' : 'Ir para pagamento'}</Btn>
      </div>
    </div>
  )
}

type Draft = { vehicleId: string; shopId: string; service: ServiceKey; date: string; time: string; price: number; base: number }
export function Checkout() {
  const { state } = useLocation() as { state: Draft | null }
  const s = useStore()
  const nav = useNavigate()
  const [pay, setPay] = useState('pix')
  const [inst, setInst] = useState(1)
  const [card, setCard] = useState({ n: '', name: '', exp: '', cvv: '' })
  const [copied, setCopied] = useState(false)
  if (!state) return <div><PageHead title="Pagamento" /><p className="px-5 text-muted">Escolha um serviço para pagar.</p><Link to="/oficinas" className="px-5 font-semibold text-royal">Ver oficinas</Link></div>
  const shop = s.shops.find(x => x.id === state.shopId)!
  const pixOff = pay === 'pix' ? Math.round(state.price * 0.05 * 100) / 100 : 0
  const total = state.price - pixOff
  const pixCode = `00020126580014BR.GOV.BCB.PIX0136carrook-${state.shopId}-${Math.round(total * 100)}5204000053039865802BR5925CARROOK6009CRICIUMA`
  const METHODS = [['pix', 'Pix', '5% de desconto · aprovação na hora', QrCode], ['credito', 'Cartão de crédito', 'Até 6x sem juros', CreditCard], ['debito', 'Cartão de débito', 'Visa, Master e Elo', CreditCard], ['wallet', 'Apple Pay ou Google Pay', 'Pague por aproximação', DeviceMobile], ['boleto', 'Boleto', 'Compensa em até 2 dias úteis', Barcode]] as const
  const cardOk = card.n.replace(/\D/g, '').length >= 15 && card.name.trim() && card.exp.length >= 5 && card.cvv.length >= 3
  const finish = () => {
    if ((pay === 'credito' || pay === 'debito') && !cardOk) { s.say('Confira os dados do cartão.'); return }
    const label = { pix: 'Pix', credito: `Crédito ${inst}x`, debito: 'Débito', wallet: 'Carteira digital', boleto: 'Boleto' }[pay]!
    const id = s.book({ ...state, price: total, payment: label })
    nav(`/agendamentos/${id}?novo=1`, { replace: true })
  }
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
      <div>
        <PageHead title="Pagamento" sub={`${SERVICES[state.service].short} · ${shop.name}`} />
        <div className="grid gap-2 px-5 lg:px-0">
          {METHODS.map(([k, t, d, Ic]) => (
            <div key={k} className={`overflow-hidden rounded-2xl border-2 bg-white transition ${pay === k ? 'border-royal' : 'border-transparent'}`}>
              <button onClick={() => setPay(k)} aria-pressed={pay === k} className="flex w-full items-center gap-3 p-4 text-left">
                <Ic size={26} className={k === 'pix' ? 'text-[#32BCAD]' : 'text-royal'} weight={k === 'pix' ? 'fill' : 'regular'} />
                <span className="flex-1"><b className="block">{t}</b><span className="text-sm text-muted">{d}</span></span>
                <span className={`h-5 w-5 shrink-0 rounded-full border-2 ${pay === k ? 'border-[6px] border-royal' : 'border-line'}`} />
              </button>
              {pay === k && k === 'pix' && (
                <div className="flex flex-col items-center gap-3 border-t border-line p-4 sm:flex-row sm:items-start">
                  <FakeQr seed={pixCode} />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="text-muted">Escaneie no app do banco ou use o Pix copia e cola. O código vale por 30 minutos.</p>
                    <code className="mt-2 block truncate rounded-xl bg-mist px-3 py-2 text-xs">{pixCode}</code>
                    <button className="mt-2 inline-flex items-center gap-1.5 font-semibold text-royal" onClick={() => { navigator.clipboard?.writeText(pixCode).then(() => setCopied(true), () => setCopied(false)) }}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Copiado' : 'Copiar código'}</button>
                  </div>
                </div>)}
              {pay === k && (k === 'credito' || k === 'debito') && (
                <div className="grid gap-3 border-t border-line p-4">
                  <input id="cc-n" className="field tabular-nums" inputMode="numeric" placeholder="Número do cartão" value={card.n} onChange={e => setCard({ ...card, n: e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim() })} aria-label="Número do cartão" />
                  <input id="cc-name" className="field" placeholder="Nome impresso" value={card.name} onChange={e => setCard({ ...card, name: e.target.value.toUpperCase() })} aria-label="Nome impresso no cartão" />
                  <div className="grid grid-cols-2 gap-3">
                    <input id="cc-exp" className="field" inputMode="numeric" placeholder="MM/AA" value={card.exp} onChange={e => setCard({ ...card, exp: e.target.value.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(\d)/, '$1/$2') })} aria-label="Validade" />
                    <input id="cc-cvv" className="field" inputMode="numeric" placeholder="CVV" value={card.cvv} onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })} aria-label="Código de segurança" />
                  </div>
                  {k === 'credito' && <select id="cc-inst" className="field" value={inst} onChange={e => setInst(+e.target.value)} aria-label="Parcelas">{[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}x de {brl(total / n)} sem juros</option>)}</select>}
                </div>)}
            </div>))}
        </div>
      </div>
      <aside className="mx-5 mt-6 rounded-3xl bg-white p-5 lg:sticky lg:top-8 lg:mx-0 lg:mt-[76px] lg:self-start">
        <p className="text-[13px] font-semibold uppercase tracking-[.1em] text-muted">Resumo</p>
        <p className="mt-2 font-semibold">{SERVICES[state.service].name}</p>
        <p className="text-sm text-muted">{shop.name} · {fmtDate(state.date, { weekday: 'short', day: 'numeric', month: 'short' })}, {state.time}</p>
        <div className="mt-4 grid gap-1.5 text-sm">
          <div className="flex justify-between"><span>Preço de tabela</span><span className="tabular-nums">{brl(state.base)}</span></div>
          <div className="flex justify-between text-leaf"><span>Carrook</span><span className="tabular-nums">-{brl(state.base - state.price)}</span></div>
          {pixOff > 0 && <div className="flex justify-between text-leaf"><span>Desconto Pix</span><span className="tabular-nums">-{brl(pixOff)}</span></div>}
          <div className="mt-2 flex justify-between border-t border-dashed border-line pt-3 text-xl font-extrabold"><span>Total</span><span className="tabular-nums">{brl(total)}</span></div>
        </div>
        <Btn size="lg" className="mt-5 w-full" onClick={finish}>{pay === 'pix' ? 'Já paguei o Pix' : pay === 'boleto' ? 'Gerar boleto e agendar' : `Pagar ${brl(total)}`}</Btn>
        <p className="mt-3 text-center text-xs text-muted">Pagamento de demonstração. Nada é cobrado.</p>
      </aside>
    </div>
  )
}

/* QR ilustrativo (não é um Pix real) */
function FakeQr({ seed }: { seed: string }) {
  const n = 25
  let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const cells: boolean[] = []
  for (let i = 0; i < n * n; i++) { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; cells.push((h >>> 0) % 2 === 0) }
  const finder = (x: number, y: number) => [[0, 0], [n - 7, 0], [0, n - 7]].some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7)
  return (
    <svg width="148" height="148" viewBox={`-1 -1 ${n + 2} ${n + 2}`} className="shrink-0 rounded-xl bg-white" role="img" aria-label="QR Code do Pix (ilustrativo)">
      {cells.map((on, i) => { const x = i % n, y = Math.floor(i / n); return !finder(x, y) && on ? <rect key={i} x={x} y={y} width="1" height="1" fill="#151A3B" /> : null })}
      {[[0, 0], [n - 7, 0], [0, n - 7]].map(([x, y], i) => <g key={i}><rect x={x} y={y} width="7" height="7" fill="#151A3B" /><rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" /><rect x={x + 2} y={y + 2} width="3" height="3" fill="#151A3B" /></g>)}
      <rect x={n / 2 - 2.5} y={n / 2 - 2.5} width="5" height="5" rx="1" fill="#1F55E1" />
    </svg>
  )
}
