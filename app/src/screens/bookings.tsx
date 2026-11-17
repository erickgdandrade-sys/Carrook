import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle, MapPin, CalendarBlank, X, Star, Car, Wrench, MagnifyingGlass, Flag, ClipboardText, Check } from '@phosphor-icons/react'
import { SERVICES } from '../data'
import { ExtraApproval } from './extra'
import { STATUS_FLOW, STATUS_LABEL, brl, useStore, type BookingStatus } from '../store'
import { Btn, PageHead, SERVICE_ICON, fmtDate } from '../ui'

const chip: Record<BookingStatus, string> = {
  agendado: 'bg-royal/10 text-royal', recebido: 'bg-violet/15 text-violet', diagnostico: 'bg-amber/15 text-[#9A6200]', servico: 'bg-amber/15 text-[#9A6200]',
  pronto: 'bg-lime/20 text-ok', concluido: 'bg-mist text-muted', cancelado: 'bg-danger/10 text-danger',
}
export const StatusChip = ({ s }: { s: BookingStatus }) => <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${chip[s]}`}>{STATUS_LABEL[s]}</span>

export function Bookings() {
  const s = useStore()
  const [tab, setTab] = useState<'proximos' | 'anteriores'>('proximos')
  const mine = s.bookings.filter(b => b.vehicleId !== '-')
  const list = mine.filter(b => (tab === 'proximos') === !['concluido', 'cancelado'].includes(b.status)).sort((a, b) => tab === 'proximos' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date))
  const saved = mine.filter(b => b.status !== 'cancelado').reduce((a, b) => a + (b.base - b.price), 0)
  return (
    <div>
      <PageHead title="Agendamentos" />
      <div className="mx-5 mb-5 flex items-center justify-between rounded-3xl bg-navy p-5 text-white lg:mx-0">
        <div><p className="text-[13px] font-semibold uppercase tracking-[.1em] text-white/60">Economia com a Carrook</p><p className="text-3xl font-extrabold tabular-nums">{brl(saved)}</p></div>
        <Link to="/oficinas" className="rounded-full bg-lime px-4 py-2.5 text-sm font-bold text-ink">Novo</Link>
      </div>
      <div className="mx-5 mb-4 grid grid-cols-2 rounded-full bg-surface p-1 text-sm font-semibold lg:mx-0 lg:w-80">
        {(['proximos', 'anteriores'] as const).map(t => <button key={t} onClick={() => setTab(t)} className={`rounded-full py-2 ${tab === t ? 'bg-slate text-white' : 'text-muted'}`}>{t === 'proximos' ? 'Próximos' : 'Anteriores'}</button>)}
      </div>
      <div className="grid gap-3 px-5 lg:grid-cols-2 lg:px-0">
        {list.map(b => {
          const shop = s.shops.find(x => x.id === b.shopId)!, v = s.vehicles.find(x => x.id === b.vehicleId), Ic = SERVICE_ICON[b.service]
          return (
            <Link key={b.id} to={`/agendamentos/${b.id}`} className="flex gap-4 rounded-3xl bg-surface p-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mist"><Ic size={22} /></span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2"><b className="truncate">{SERVICES[b.service].short}</b><StatusChip s={b.status} /></span>
                <span className="block truncate text-sm text-muted">{shop.name}{v ? ` · ${v.model}` : ''}</span>
                <span className="mt-1 block text-sm font-semibold">{fmtDate(b.date, { weekday: 'short', day: 'numeric', month: 'short' })} · {b.time}</span>
              </span>
            </Link>)
        })}
        {!list.length && <p className="rounded-3xl bg-surface p-6 text-center text-muted lg:col-span-2">{tab === 'proximos' ? 'Nenhum agendamento em aberto.' : 'Nada por aqui ainda.'}</p>}
      </div>
    </div>
  )
}

const STEP_ICON = { agendado: CalendarBlank, recebido: Car, diagnostico: MagnifyingGlass, servico: Wrench, pronto: Flag, concluido: CheckCircle, cancelado: X }

export function BookingDetail() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const s = useStore()
  const nav = useNavigate()
  const [cancel, setCancel] = useState(false)
  const [rated, setRated] = useState(0)
  const b = s.bookings.find(x => x.id === id)
  if (!b) return <PageHead title="Agendamento não encontrado" />
  const shop = s.shops.find(x => x.id === b.shopId)!
  const v = s.vehicles.find(x => x.id === b.vehicleId)
  const idx = STATUS_FLOW.indexOf(b.status)
  const fresh = params.get('novo') === '1'

  return (
    <div className="lg:max-w-4xl">
      {fresh ? (
        <div className="relative overflow-hidden bg-royal px-6 pb-8 pt-[max(28px,env(safe-area-inset-top))] text-white lg:rounded-4xl lg:p-10">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-lime text-ink"><Check size={34} weight="bold" /></span>
          <h1 className="mt-4 text-[32px] font-extrabold leading-tight">Agendado!</h1>
          <p className="mt-1 text-white/80">Vamos te lembrar um dia antes. Acompanhe cada etapa por aqui.</p>
        </div>
      ) : <PageHead title={SERVICES[b.service].short} sub={`Pedido #${b.id.toUpperCase()}`} />}

      <div className="mt-5 grid gap-5 px-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-0">
        {/* Linha do tempo */}
        <section className="rounded-3xl bg-surface p-5">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Acompanhamento</h2><StatusChip s={b.status} /></div>
          {b.status === 'cancelado' ? <p className="text-sm text-muted">Este agendamento foi cancelado.</p> : (
            <ol className="relative">
              {STATUS_FLOW.map((st, i) => {
                const done = i <= idx, Ic = STEP_ICON[st]
                return (
                  <li key={st} className="relative flex gap-4 pb-5 last:pb-0">
                    {i < STATUS_FLOW.length - 1 && <span className={`absolute left-[17px] top-9 h-[calc(100%-28px)] w-[2px] ${i < idx ? 'bg-lime' : 'bg-line'}`} />}
                    <span className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-full ${i === idx ? 'bg-lime text-ink ring-4 ring-lime/25' : done ? 'bg-slate text-white' : 'bg-mist text-muted'}`}><Ic size={18} weight={done ? 'fill' : 'regular'} /></span>
                    <div className={done ? '' : 'opacity-50'}>
                      <b className="block text-[15px]">{STATUS_LABEL[st]}</b>
                      <span className="text-sm text-muted">{({ agendado: `${fmtDate(b.date, { weekday: 'long', day: 'numeric', month: 'long' })} às ${b.time}`, recebido: 'A oficina confirma a chegada do carro', diagnostico: 'Checagem e orçamento no app, se precisar de algo extra', servico: 'Mecânico trabalhando no seu carro', pronto: 'Pode buscar. Laudo já disponível', concluido: 'Histórico do veículo atualizado' } as Record<string, string>)[st]}</span>
                    </div>
                  </li>)
              })}
            </ol>)}
          {(b.status === 'concluido' || b.report) && (
            <div className="mt-5 rounded-2xl bg-mist p-4">
              <p className="flex items-center gap-2 font-semibold"><ClipboardText size={20} className="text-royal" />Laudo digital</p>
              <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">{Object.entries(b.report ?? { 'Freios e discos': 'ok', 'Suspensão dianteira': 'ok', 'Fluidos e vazamentos': 'ok', 'Bateria e alternador': 'ok', 'Pneus e calibragem': 'ok', 'Luzes e elétrica': 'ok' }).map(([x, m]) => <li key={x} className="flex items-center gap-2"><CheckCircle size={16} weight="fill" className={m === 'ok' ? 'text-ok' : m === 'atencao' ? 'text-amber' : 'text-danger'} />{x}: {m === 'ok' ? 'ok' : m === 'atencao' ? 'atenção' : 'trocar'}</li>)}</ul>
              <p className="mt-3 text-sm font-semibold">Como foi o atendimento?</p>
              <div className="mt-1 flex gap-1">{[1, 2, 3, 4, 5].map(n => <button key={n} onClick={() => { setRated(n); s.say('Obrigado pela avaliação!') }} aria-label={`${n} estrelas`}><Star size={28} weight={n <= rated ? 'fill' : 'regular'} className={n <= rated ? 'text-amber' : 'text-muted'} /></button>)}</div>
            </div>)}
        </section>

        <aside className="grid content-start gap-4">
          {b.extra && <ExtraApproval id={b.id} />}
          <div className="overflow-hidden rounded-3xl bg-surface">
            <img src={shop.photo} alt="" className="h-28 w-full object-cover" />
            <div className="p-4">
              <b className="block">{shop.name}</b>
              <span className="flex items-center gap-1 text-sm text-muted"><MapPin size={14} />{shop.address}</span>
              {v && <span className="mt-3 flex items-center gap-3 rounded-2xl bg-mist p-2 pr-3"><img src={v.photo} alt="" className="h-10 w-14 rounded-xl object-cover" /><span className="text-sm"><b className="block">{v.brand} {v.model}</b><span className="text-muted">{v.plate}</span></span></span>}
            </div>
          </div>
          <div className="rounded-3xl bg-surface p-4 text-sm">
            <div className="flex justify-between"><span className="text-muted">Pagamento</span><b>{b.payment}</b></div>
            <div className="mt-1.5 flex justify-between"><span className="text-muted">Valor</span><b className="tabular-nums">{brl(b.price)}</b></div>
            <div className="mt-1.5 flex justify-between text-ok"><span>Você economizou</span><b className="tabular-nums">{brl(b.base - b.price)}</b></div>
          </div>
          {b.status === 'agendado' && (cancel ? (
            <div className="rounded-3xl bg-danger/10 p-4 text-sm">
              <p className="font-semibold text-danger">Cancelar este agendamento?</p>
              <p className="mt-1 text-muted">Sem custo até 24 h antes. O valor volta pelo mesmo meio de pagamento.</p>
              <div className="mt-3 flex gap-2"><Btn size="sm" kind="dark" onClick={() => { s.setStatus(b.id, 'cancelado'); setCancel(false); s.say('Agendamento cancelado') }}>Sim, cancelar</Btn><Btn size="sm" kind="ghost" onClick={() => setCancel(false)}>Voltar</Btn></div>
            </div>) : <Btn kind="line" onClick={() => setCancel(true)}>Cancelar agendamento</Btn>)}
          {fresh && <Btn onClick={() => nav('/', { replace: true })}>Voltar ao início</Btn>}
          <p className="text-center text-xs text-muted">No painel admin dá para avançar o status e ver esta tela mudar.</p>
        </aside>
      </div>
    </div>
  )
}
