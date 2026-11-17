import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { ChartLineUp, Kanban, Storefront, Users, Crown, ArrowLeft, ArrowRight, MagnifyingGlass, Plus, type Icon } from '@phosphor-icons/react'
import { PLANS, SERVICES, img, type PlanId, type ServiceKey } from '../data'
import { STATUS_FLOW, STATUS_LABEL, SUBSCRIBERS, brl, recommendScore, uid, useStore, type BookingStatus } from '../store'
import { Btn, LogoMark, Seal, Stars, Wordmark, fmtDate } from '../ui'
import { StatusChip } from './bookings'

const NAV: [string, string, Icon][] = [['/admin', 'Visão geral', ChartLineUp], ['/admin/agendamentos', 'Agendamentos', Kanban], ['/admin/oficinas', 'Oficinas', Storefront], ['/admin/assinantes', 'Assinantes', Users], ['/admin/planos', 'Planos', Crown]]

export function AdminShell() {
  return (
    <div className="min-h-screen bg-mist lg:flex">
      <aside className="sticky top-0 z-30 bg-slate text-white lg:h-screen lg:w-[248px] lg:shrink-0 lg:px-4 lg:py-6">
        <div className="flex items-center justify-between px-5 py-4 lg:mb-8 lg:px-3 lg:py-0">
          <span className="flex items-center gap-2.5"><LogoMark size={26} color="#41D92A" /><Wordmark className="text-lg" /><span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/70">Admin</span></span>
          <Link to="/" className="flex items-center gap-1 text-sm text-white/70 lg:hidden"><ArrowLeft size={16} />App</Link>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:p-0" aria-label="Admin">
          {NAV.map(([to, t, Ic]) => (
            <NavLink key={to} to={to} end={to === '/admin'} className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-white/10 text-lime' : 'text-white/70 hover:text-white'}`}><Ic size={20} />{t}</NavLink>))}
        </nav>
        <Link to="/" className="absolute bottom-6 left-4 right-4 hidden items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 lg:flex"><ArrowLeft size={18} />Voltar para o app</Link>
      </aside>
      <main className="min-w-0 flex-1 px-5 py-6 lg:px-10 lg:py-8"><div className="mx-auto max-w-[1240px]"><Outlet /></div></main>
    </div>
  )
}

const H = ({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-[28px] font-extrabold leading-tight">{title}</h1>{sub && <p className="text-muted">{sub}</p>}</div>{right}</div>
)
const Example = () => <span className="rounded-md bg-surface px-2 py-1 text-xs font-semibold text-muted">dados de exemplo</span>

export function AdminDashboard() {
  const s = useStore()
  const mix: [PlanId, number][] = [['clube', 512], ['start', 604], ['premium', 168]]
  const mrr = mix.reduce((a, [p, n]) => a + s.planPrices[p] * n, 0)
  const months = ['jun', 'jul', 'ago', 'set', 'out', 'nov']
  const series = [61, 74, 88, 101, 119, Math.round(mrr / 1000)]
  const max = Math.max(...series) * 1.1
  const today = s.bookings.filter(b => !['concluido', 'cancelado'].includes(b.status)).slice(0, 6)
  return (
    <div>
      <H title="Visão geral" sub={new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} right={<Example />} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[['Assinantes ativos', '1.284', '+86 no mês'], ['Receita recorrente', brl(mrr).replace(',00', ''), '+15,8% vs. outubro'], ['Agendamentos no mês', '412', '+38 na semana'], ['Economia gerada', 'R$ 218 mil', 'para os assinantes']].map(([t, v, d], i) => (
          <div key={t} className={`rounded-3xl p-5 ${i === 1 ? 'bg-royal text-white' : 'bg-surface'}`}>
            <p className={`text-[12px] font-semibold uppercase tracking-[.08em] ${i === 1 ? 'text-white/70' : 'text-muted'}`}>{t}</p>
            <p className="mt-2 text-[28px] font-extrabold tabular-nums leading-none">{v}</p>
            <p className={`mt-2 text-xs font-semibold ${i === 1 ? 'text-lime' : 'text-ok'}`}>{d}</p>
          </div>))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-3xl bg-surface p-5">
          <h2 className="font-semibold">Receita recorrente (R$ mil)</h2>
          <svg viewBox="0 0 600 220" className="mt-4 w-full" role="img" aria-label="Receita recorrente nos últimos 6 meses">
            {[0, 50, 100, 150].map(t => <g key={t}><line x1="40" x2="590" y1={190 - (t / max) * 170} y2={190 - (t / max) * 170} stroke="#E6E9F5" /><text x="30" y={194 - (t / max) * 170} fontSize="11" textAnchor="end" fill="#676E92">{t}</text></g>)}
            {series.map((v, i) => {
              const x = 70 + i * 100, h = (v / max) * 170
              return <g key={i}><rect x={x - 22} y={190 - h} width="44" height={h} rx="10" fill={i === series.length - 1 ? '#1F55E1' : '#C9D3F5'} /><text x={x} y={182 - h} textAnchor="middle" fontSize="12" fontWeight="700" fill="#151A3B">{v}</text><text x={x} y="210" textAnchor="middle" fontSize="12" fill="#676E92">{months[i]}</text></g>
            })}
          </svg>
        </section>
        <section className="rounded-3xl bg-surface p-5">
          <h2 className="font-semibold">Assinantes por plano</h2>
          <div className="mt-5 flex h-4 overflow-hidden rounded-full">{mix.map(([p, n], i) => <span key={p} style={{ width: `${n / 12.84}%` }} className={['bg-lime', 'bg-royal', 'bg-slate'][i]} />)}</div>
          <ul className="mt-5 grid gap-3">{mix.map(([p, n], i) => <li key={p} className="flex items-center gap-3"><span className={`h-3 w-3 rounded-full ${['bg-lime', 'bg-royal', 'bg-slate'][i]}`} /><span className="flex-1">{PLANS.find(x => x.id === p)!.name}</span><b className="tabular-nums">{n}</b><span className="w-24 text-right text-sm tabular-nums text-muted">{brl(n * s.planPrices[p]).replace(',00', '')}</span></li>)}</ul>
        </section>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-3xl bg-surface p-5">
          <h2 className="font-semibold">Funil do mês</h2>
          <div className="mt-4 grid gap-2">{([['Visitas no site', 8420], ['Cadastros', 1130], ['Assinaturas', 286], ['Primeiro agendamento', 201]] as [string, number][]).map(([t, n], i, a) => (
            <div key={t} className="grid grid-cols-[150px_1fr_90px] items-center gap-3 text-sm"><span>{t}</span><span className="h-8 overflow-hidden rounded-lg bg-mist"><span className="block h-full rounded-lg bg-royal" style={{ width: `${(n / a[0][1]) * 100}%`, minWidth: 6 }} /></span><span className="text-right"><b className="tabular-nums">{n.toLocaleString('pt-BR')}</b>{i > 0 && <span className="block text-xs text-muted">{Math.round((n / a[i - 1][1]) * 100)}% da etapa</span>}</span></div>))}</div>
        </section>
        <section className="rounded-3xl bg-surface p-5">
          <h2 className="font-semibold">Retenção</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">{[['1,8%', 'cancelamento mensal'], ['R$ 102', 'ticket médio'], ['4,7', 'nota média das oficinas'], ['62%', 'usam a revisão anual']].map(([n, t]) => <div key={t} className="rounded-2xl bg-mist p-3"><b className="block text-2xl tabular-nums">{n}</b><span className="text-xs text-muted">{t}</span></div>)}</div>
        </section>
      </div>
      <section className="mt-4 rounded-3xl bg-surface p-5">
        <div className="flex items-center justify-between"><h2 className="font-semibold">Em andamento</h2><Link to="/admin/agendamentos" className="text-sm font-semibold text-royal">Abrir quadro</Link></div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-wider text-muted"><th className="py-2 font-semibold">Cliente</th><th className="font-semibold">Serviço</th><th className="font-semibold">Oficina</th><th className="font-semibold">Quando</th><th className="font-semibold">Status</th></tr></thead>
            <tbody>{today.map(b => <tr key={b.id} className="border-t border-line"><td className="py-3 font-medium">{b.customer}</td><td>{SERVICES[b.service].short}</td><td>{s.shops.find(x => x.id === b.shopId)?.name}</td><td className="tabular-nums">{fmtDate(b.date)} {b.time}</td><td><StatusChip s={b.status} /></td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export function AdminBookings() {
  const s = useStore()
  const cols: BookingStatus[] = ['agendado', 'recebido', 'diagnostico', 'servico', 'pronto', 'concluido']
  const move = (id: string, st: BookingStatus, dir: 1 | -1) => s.setStatus(id, STATUS_FLOW[STATUS_FLOW.indexOf(st) + dir])
  return (
    <div>
      <H title="Agendamentos" sub="Avance o status e o cliente acompanha no app em tempo real." />
      <div className="no-scrollbar -mx-5 flex gap-4 overflow-x-auto px-5 pb-4 lg:mx-0 lg:px-0">
        {cols.map(c => {
          const items = s.bookings.filter(b => b.status === c)
          return (
            <section key={c} className="w-[260px] shrink-0 rounded-3xl bg-line/50 p-3">
              <h2 className="flex items-center justify-between px-2 pb-3 pt-1 text-sm font-bold">{STATUS_LABEL[c]}<span className="rounded-full bg-surface px-2 text-xs tabular-nums text-muted">{items.length}</span></h2>
              <div className="grid gap-2">
                {items.map(b => {
                  const mine = b.vehicleId !== '-'
                  return (
                    <article key={b.id} className={`rounded-2xl bg-surface p-3 text-sm ${mine ? 'ring-2 ring-lime' : ''}`}>
                      <b className="block">{SERVICES[b.service].short}</b>
                      <span className="block truncate text-muted">{mine ? `${b.customer} (você)` : b.customer}</span>
                      <span className="mt-1 block truncate text-xs text-muted">{s.shops.find(x => x.id === b.shopId)?.name} · {fmtDate(b.date)} {b.time}</span>
                      <div className="mt-2 flex items-center justify-between">
                        <b className="tabular-nums">{b.price === 0 ? 'Plano' : brl(b.price)}</b>
                        <span className="flex gap-1">
                          {c !== 'agendado' && <button onClick={() => move(b.id, c, -1)} aria-label="Voltar etapa" className="grid h-7 w-7 place-items-center rounded-full bg-mist"><ArrowLeft size={14} /></button>}
                          {c !== 'concluido' && <button onClick={() => move(b.id, c, 1)} aria-label="Avançar etapa" className="grid h-7 w-7 place-items-center rounded-full bg-slate text-white"><ArrowRight size={14} /></button>}
                        </span>
                      </div>
                    </article>)
                })}
                {!items.length && <p className="px-2 py-4 text-center text-xs text-muted">Vazio</p>}
              </div>
            </section>)
        })}
      </div>
      <p className="text-sm text-muted">Cartões com borda verde são da conta de demonstração. Avance um deles e abra o agendamento no app.</p>
    </div>
  )
}

export function AdminShops() {
  const s = useStore()
  const [adding, setAdding] = useState(false)
  const [n, setN] = useState({ name: '', address: '', district: '', discount: '15' })
  const top = [...s.shops].sort((a, b) => recommendScore(b) - recommendScore(a))[0]?.id
  const setDisc = (id: string, v: number) => s.set({ shops: s.shops.map(x => x.id === id ? { ...x, discount: Math.max(0, Math.min(60, v)) } : x) })
  const add = () => {
    if (!n.name.trim() || !n.address.trim()) { s.say('Preencha nome e endereço.'); return }
    s.set({ shops: [...s.shops, { id: uid(), name: n.name, address: n.address, district: n.district || 'Centro', photo: img('shop-engine'), rating: 5, reviews: 0, discount: +n.discount || 10, distanceKm: 4, map: { x: 70 + Math.random() * 15, y: 60 + Math.random() * 20 }, hours: 'Seg a sex 8h–18h', phone: '(48) 0000-0000', services: Object.keys(SERVICES) as ServiceKey[], since: 2026, quotes: [] }] })
    setAdding(false); setN({ name: '', address: '', district: '', discount: '15' }); s.say('Oficina credenciada')
  }
  return (
    <div>
      <H title="Oficinas parceiras" sub="O desconto muda a ordem “Maior desconto” e a indicação Carrook no app." right={<Btn kind="royal" onClick={() => setAdding(!adding)}><Plus size={18} weight="bold" />Credenciar oficina</Btn>} />
      {adding && (
        <div className="mb-4 grid gap-3 rounded-3xl bg-surface p-5 sm:grid-cols-2 lg:grid-cols-5">
          <input id="ns-name" className="field lg:col-span-2" placeholder="Nome da oficina" value={n.name} onChange={e => setN({ ...n, name: e.target.value })} aria-label="Nome" />
          <input id="ns-addr" className="field" placeholder="Endereço" value={n.address} onChange={e => setN({ ...n, address: e.target.value })} aria-label="Endereço" />
          <input id="ns-dist" className="field" placeholder="Bairro" value={n.district} onChange={e => setN({ ...n, district: e.target.value })} aria-label="Bairro" />
          <div className="flex gap-2"><input id="ns-disc" className="field w-24" inputMode="numeric" value={n.discount} onChange={e => setN({ ...n, discount: e.target.value })} aria-label="Desconto em %" /><Btn onClick={add}>Salvar</Btn></div>
        </div>)}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {s.shops.map(sh => (
          <article key={sh.id} className="overflow-hidden rounded-3xl bg-surface">
            <div className="relative h-32"><img src={sh.photo} alt="" className="h-full w-full object-cover" />{sh.id === top && <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-lime px-2.5 py-1 text-[11px] font-bold"><LogoMark size={12} />Indicada</span>}</div>
            <div className="p-4">
              <b className="flex items-center gap-1.5">{sh.name}<Seal /></b>
              <p className="text-sm text-muted">{sh.address} · {sh.district}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm"><Stars value={sh.rating} />{sh.rating.toFixed(1)} <span className="text-muted">({sh.reviews})</span></p>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-mist p-2 pl-4">
                <span className="text-sm font-semibold">Desconto em peças</span>
                <span className="flex items-center gap-1">
                  <button onClick={() => setDisc(sh.id, sh.discount - 1)} className="grid h-8 w-8 place-items-center rounded-full bg-surface font-bold" aria-label="Diminuir desconto">−</button>
                  <b className="w-12 text-center tabular-nums">{sh.discount}%</b>
                  <button onClick={() => setDisc(sh.id, sh.discount + 1)} className="grid h-8 w-8 place-items-center rounded-full bg-surface font-bold" aria-label="Aumentar desconto">+</button>
                </span>
              </div>
            </div>
          </article>))}
      </div>
    </div>
  )
}

export function AdminSubscribers() {
  const prices = useStore(s => s.planPrices)
  const [q, setQ] = useState('')
  const [plan, setPlan] = useState<PlanId | 'todos'>('todos')
  const list = SUBSCRIBERS.filter(x => (plan === 'todos' || x.plan === plan) && x.name.toLowerCase().includes(q.toLowerCase()))
  return (
    <div>
      <H title="Assinantes" sub={`${list.length} de ${SUBSCRIBERS.length} na amostra`} right={<Example />} />
      <div className="mb-4 flex flex-wrap gap-3">
        <label className="relative min-w-[220px] flex-1"><MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" /><input id="sub-q" className="field pl-11" placeholder="Buscar por nome" value={q} onChange={e => setQ(e.target.value)} aria-label="Buscar assinante" /></label>
        <select id="sub-plan" className="field w-auto" value={plan} onChange={e => setPlan(e.target.value as PlanId | 'todos')} aria-label="Filtrar por plano"><option value="todos">Todos os planos</option>{PLANS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
      </div>
      <div className="overflow-x-auto rounded-3xl bg-surface p-2">
        <table className="w-full min-w-[680px] text-sm">
          <thead><tr className="text-left text-xs uppercase tracking-wider text-muted"><th className="p-3 font-semibold">Nome</th><th className="font-semibold">Cidade</th><th className="font-semibold">Plano</th><th className="font-semibold">Veículos</th><th className="font-semibold">Desde</th><th className="font-semibold">Mensalidade</th><th className="font-semibold">Situação</th></tr></thead>
          <tbody>{list.map(x => (
            <tr key={x.id} className="border-t border-line"><td className="p-3 font-medium">{x.name}</td><td>{x.city}</td><td>{PLANS.find(p => p.id === x.plan)!.short}</td><td className="tabular-nums">{x.vehicles}</td><td>{fmtDate(x.since, { month: 'short', year: 'numeric' })}</td><td className="tabular-nums">{brl(prices[x.plan])}</td>
              <td><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${x.status === 'ativo' ? 'bg-lime/20 text-ok' : x.status === 'atrasado' ? 'bg-amber/15 text-[#9A6200]' : 'bg-mist text-muted'}`}>{x.status}</span></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  )
}

export function AdminPlans() {
  const s = useStore()
  return (
    <div>
      <H title="Planos" sub="Valores e limites aparecem no app na hora." />
      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS.map(p => (
          <section key={p.id} className="rounded-3xl bg-surface p-5">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold">{p.name}</h2>{p.popular && <span className="rounded-full bg-lime px-2.5 py-0.5 text-[11px] font-bold">Popular</span>}</div>
            <p className="text-sm text-muted">{p.copay ? `Coparticipação de ${p.copay * 100}%` : 'Sem cobertura: descontos e benefícios'}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label><span className="label">Mensalidade (R$)</span><input id={`pp-${p.id}`} className="field tabular-nums" type="number" min={0} step={1} value={s.planPrices[p.id]} onChange={e => s.set({ planPrices: { ...s.planPrices, [p.id]: Math.max(0, +e.target.value) } })} /></label>
              <label><span className="label">Veículos</span><input id={`pl-${p.id}`} className="field tabular-nums" type="number" min={1} max={10} value={s.planLimits[p.id]} onChange={e => s.set({ planLimits: { ...s.planLimits, [p.id]: Math.max(1, Math.min(10, +e.target.value || 1)) } })} /></label>
            </div>
            <ul className="mt-4 grid gap-1.5 text-sm text-muted">{p.perks.map(x => <li key={x}>• {x}</li>)}</ul>
          </section>))}
      </div>
    </div>
  )
}
