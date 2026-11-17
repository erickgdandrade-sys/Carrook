import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, CalendarCheck, Tag, Gauge as GaugeIcon, GasPump, Check, Car, Crown, Gift, User, SignOut, ChartLineUp, CaretRight, Wrench, ShieldCheck, Percent, QrCode, ArrowCounterClockwise, Handshake, Storefront, FileText, Globe, Moon, Sun, Desktop, type Icon } from '@phosphor-icons/react'
import { CARENCIA_DIAS, FUEL, NOT_COVERED, PLANS, type PlanId } from '../data'
import { Coverage, RolePicker } from './extra'
import { PricingCards } from '../bento'
import { signOut } from '../live'
import { brl, carenciaLeft, uid, useStore, type Notice, type Prefs, type Theme } from '../store'
import { BrandPattern, Btn, LogoMark, PageHead, ThemeSwitch, fmtDate } from '../ui'

const N_ICON: Record<Notice['kind'], Icon> = { alerta: Wrench, agenda: CalendarCheck, promo: Tag, km: GaugeIcon }

export function Notices() {
  const s = useStore()
  const nav = useNavigate()
  return (
    <div className="lg:max-w-3xl">
      <PageHead title="Notificações" back={false} right={s.notices.some(n => !n.read) && <button onClick={s.readAll} className="text-sm font-semibold text-royal">Marcar como lidas</button>} />
      <div className="grid gap-2 px-5 lg:px-0">
        {s.notices.map(n => {
          const Ic = N_ICON[n.kind]
          return (
            <button key={n.id} onClick={() => { s.set({ notices: s.notices.map(x => x.id === n.id ? { ...x, read: true } : x) }); if (n.to) nav(n.to) }} className={`flex gap-3 rounded-3xl p-4 text-left transition ${n.read ? 'bg-surface/60' : 'bg-surface shadow-soft'}`}>
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${n.kind === 'promo' ? 'bg-lime text-ink' : n.kind === 'agenda' ? 'bg-royal text-white' : 'bg-mist text-royal'}`}><Ic size={22} weight="fill" /></span>
              <span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-2"><b className="text-[15px]">{n.title}</b><span className="shrink-0 text-xs text-muted">{fmtDate(n.date)}</span></span><span className="text-sm text-muted">{n.body}</span></span>
              {!n.read && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-lime" />}
            </button>)
        })}
        {!s.notices.length && <div className="rounded-3xl bg-surface p-8 text-center text-muted"><Bell size={32} className="mx-auto mb-2" />Sem notificações por enquanto.</div>}
      </div>
    </div>
  )
}

export function Benefits() {
  const [coupon, setCoupon] = useState<string>()
  const plan = useStore(s => PLANS.find(p => p.id === s.plan)!)
  const yearly = useStore(s => s.yearlyUsed)
  return (
    <div>
      <PageHead title="Benefícios" sub={`Inclusos no ${plan.name}`} />
      <div className="grid gap-4 px-5 lg:grid-cols-2 lg:px-0">
        <section className="relative overflow-hidden rounded-3xl bg-lime p-5 text-ink lg:row-span-2">
          <GasPump size={40} weight="fill" />
          <h2 className="mt-3 text-[26px] font-extrabold leading-tight">Desconto em combustível</h2>
          <p className="text-ink/70">Mostre o cupom no caixa dos postos parceiros.</p>
          <div className="mt-4 grid gap-2">
            {FUEL.map(f => (
              <div key={f.id} className="rounded-2xl bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3"><span><b className="block">{f.name}</b><span className="text-sm text-ink/60">{f.address} · {f.distanceKm.toFixed(1).replace('.', ',')} km</span></span><span className="text-right text-xl font-extrabold">-{brl(f.perLiter)}<small className="block text-xs font-semibold">por litro</small></span></div>
                {coupon === f.id ? (
                  <div className="mt-3 flex items-center gap-3 rounded-xl bg-ink p-3 text-white"><QrCode size={56} className="text-lime" /><span><span className="text-xs text-white/60">Cupom válido por 15 min</span><b className="block text-2xl tracking-[.2em]">CK-{f.id.slice(0, 3).toUpperCase()}{Math.floor(1000 + Math.random() * 8999)}</b></span></div>
                ) : <Btn size="sm" kind="dark" className="mt-3" onClick={() => setCoupon(f.id)}>Gerar cupom</Btn>}
              </div>))}
          </div>
        </section>
        {([
          [ShieldCheck, 'Revisão anual de 80 itens', yearly.revisao ? 'Já usada este ano. Renova na data da assinatura.' : 'Disponível. Agende quando quiser.', yearly.revisao ? undefined : '/oficinas?servico=revisao'],
          [ArrowCounterClockwise, 'Troca de óleo e filtro', yearly.oleo ? 'Já usada este ano.' : 'Uma troca gratuita por ano.', yearly.oleo ? undefined : '/oficinas?servico=oleo'],
          [Percent, 'Até 20% em peças', 'Desconto aplicado direto na oficina parceira.', '/oficinas'],
          [Gift, '+15 vantagens de parceiros', 'Lavagem, estacionamento, seguros e mais. Em breve no app.', undefined],
        ] as [Icon, string, string, string | undefined][]).map(([Ic, t, d, to]) => (
          <div key={t} className="flex gap-4 rounded-3xl bg-surface p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mist text-royal"><Ic size={24} weight="duotone" /></span>
            <div className="flex-1"><b className="block text-[17px]">{t}</b><p className="text-sm text-muted">{d}</p>{to && <Link to={to} className="mt-2 inline-block text-sm font-semibold text-royal">Usar agora</Link>}</div>
          </div>))}
      </div>
    </div>
  )
}

export function PlanPage() {
  const s = useStore()
  const [pick, setPick] = useState<PlanId>()
  const cur = PLANS.find(p => p.id === s.plan)!
  const change = (id: PlanId) => {
    if (s.vehicles.length > s.planLimits[id]) { s.say(`Esse plano cobre ${s.planLimits[id]} veículo(s). Remova um antes.`); return }
    const up = (PLANS.find(p => p.id === id)!.copay ?? 1) < (PLANS.find(p => p.id === s.plan)!.copay ?? 1)
    s.set({ plan: id, ...(up ? { planSince: new Date().toISOString() } : {}) }); setPick(undefined); s.say(`Plano alterado para ${PLANS.find(p => p.id === id)!.name}`)
  }
  return (
    <div>
      <PageHead title="Meu plano" sub="O plano de saúde do seu carro" />
      <div className="relative mx-5 overflow-hidden rounded-3xl bg-royal p-6 text-white lg:mx-0 lg:p-8">
        <BrandPattern opacity={0.08} />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm text-white/70">Plano atual</p><h2 className="text-[34px] font-extrabold leading-none">{cur.name}</h2><p className="mt-2 text-white/80">{brl(s.planPrices[cur.id])}/mês · renova dia 5 · {s.vehicles.length} de {s.planLimits[cur.id]} veículos</p>
            {carenciaLeft(cur.id, s.planSince) > 0 && <p className="mt-3 inline-block rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">Carência: cobertura libera em {carenciaLeft(cur.id, s.planSince)} dias</p>}</div>
          <LogoMark size={64} color="#41D92A" />
        </div>
      </div>
      <div className="mt-8 flex flex-wrap items-end justify-between gap-2 px-5 lg:px-0"><h2 className="text-[30px] font-extrabold leading-none lg:text-[40px]">Compare os planos</h2><p className="max-w-sm text-sm text-muted">Cobertura de até 80 itens, oficinas certificadas e descontos. Troque quando quiser.</p></div>
      <div className="mt-2 px-5 lg:px-0">
        <PricingCards current={s.plan} cta={(id, dark) => id === s.plan
          ? <Btn kind={dark ? 'white' : 'ghost'} size="lg" className="w-full" disabled>Seu plano atual</Btn>
          : pick === id ? <div className="grid gap-2"><Btn size="lg" className="w-full" onClick={() => change(id)}>Confirmar troca</Btn><Btn kind={dark ? 'outline' : 'ghost'} className="w-full" onClick={() => setPick(undefined)}>Cancelar</Btn></div>
            : <Btn kind={dark ? 'lime' : 'dark'} size="lg" className="w-full" onClick={() => setPick(id)}>Mudar para {PLANS.find(p => p.id === id)!.short}</Btn>} />
      </div>
      <p className="mx-5 mt-4 text-sm leading-relaxed text-muted lg:mx-0">Coparticipação é a parte do custo que você paga nos serviços cobertos: no Start, metade; no Premium, 20%. Revisão anual e troca de óleo estão incluídas em todos os planos. Trocar para um plano com mais cobertura reinicia a carência.</p>
      <h2 className="mt-8 px-5 text-lg font-semibold lg:px-0">O que os 80 itens cobrem</h2>
      <div className="mx-5 mt-3 lg:mx-0"><Coverage /></div>
      <div className="mx-5 mt-4 grid gap-4 lg:mx-0 lg:grid-cols-2">
        <section className="rounded-3xl bg-surface p-5"><b>Carência</b><ul className="mt-2 grid gap-1.5 text-sm">{PLANS.map(p => <li key={p.id} className="flex justify-between"><span>{p.name}</span><b>{CARENCIA_DIAS[p.id] ? `${CARENCIA_DIAS[p.id]} dias` : 'Sem carência'}</b></li>)}</ul><p className="mt-2 text-xs text-muted">Revisão anual, troca de óleo e descontos valem desde o primeiro mês.</p></section>
        <section className="rounded-3xl bg-surface p-5"><b>Não está coberto</b><ul className="mt-2 grid gap-1.5 text-sm text-muted">{NOT_COVERED.map(x => <li key={x}>• {x}</li>)}</ul></section>
      </div>
    </div>
  )
}

export function Menu() {
  const s = useStore()
  const nav = useNavigate()
  const plan = PLANS.find(p => p.id === s.plan)!
  const ITEMS: [string, string, Icon][] = [['/veiculos', 'Meus veículos', Car], ['/agendamentos', 'Agendamentos', CalendarCheck], ['/beneficios', 'Benefícios', Gift], ['/plano', 'Meu plano', Crown], ['/indique', 'Indique e ganhe', Handshake], ['/perfil', 'Perfil, tema e notificações', User],
    ...(s.role === 'admin' ? [['/admin', 'Painel admin', ChartLineUp] as [string, string, Icon]] : []), ...(s.role === 'oficina' ? [['/oficina', 'Portal da oficina', Storefront] as [string, string, Icon]] : []),
    ['/site', 'Site da Carrook', Globe], ['/termos', 'Termos e privacidade', FileText]]
  return (
    <div>
      <div className="bg-violet px-5 pb-6 pt-[max(20px,env(safe-area-inset-top))] text-white">
        <div className="flex items-center gap-3"><span className="grid h-14 w-14 place-items-center rounded-full border-2 border-white text-lg font-bold">{s.user.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</span>
          <div className="flex-1"><b className="block text-xl">{s.user.name}</b><span className="text-sm text-white/75">{plan.name}</span></div><ThemeSwitch /></div>
      </div>
      <div className="mx-5 -mt-0 mt-4 overflow-hidden rounded-3xl bg-surface">
        {ITEMS.map(([to, t, Ic]) => <Link key={to} to={to} className="flex items-center gap-4 border-b border-line px-4 py-4 last:border-0"><Ic size={22} className="text-royal" /><span className="flex-1 font-medium">{t}</span><CaretRight size={18} className="text-muted" /></Link>)}
      </div>
      <button onClick={async () => { if (s.mode === 'live') await signOut(); else s.set({ signedIn: false }); nav('/bem-vindo') }} className="mx-5 mt-4 flex items-center gap-2 font-semibold text-danger"><SignOut size={20} />Sair</button>
    </div>
  )
}

export function Profile() {
  const s = useStore()
  const nav = useNavigate()
  const [u, setU] = useState(s.user)
  const [resetAsk, setResetAsk] = useState(false)
  return (
    <div className="lg:max-w-2xl">
      <PageHead title="Perfil" />
      <form className="grid gap-4 px-5 lg:px-0" onSubmit={e => { e.preventDefault(); s.set({ user: u }); s.say('Dados salvos') }}>
        <label><span className="label">Nome</span><input id="pf-name" className="field" value={u.name} onChange={e => setU({ ...u, name: e.target.value })} /></label>
        <label><span className="label">E-mail</span><input id="pf-email" className="field" type="email" value={u.email} onChange={e => setU({ ...u, email: e.target.value })} /></label>
        <label><span className="label">WhatsApp</span><input id="pf-phone" className="field" value={u.phone} onChange={e => setU({ ...u, phone: e.target.value })} /></label>
        <Btn kind="royal" type="submit">Salvar alterações</Btn>
      </form>
      <h2 className="mt-8 px-5 text-lg font-semibold lg:px-0">Aparência</h2>
      <div className="mx-5 mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-surface p-1.5 lg:mx-0">
        {([['system', 'Automático', Desktop], ['light', 'Claro', Sun], ['dark', 'Escuro', Moon]] as [Theme, string, Icon][]).map(([k, t, Ic]) => <button key={k} onClick={() => s.set({ theme: k })} aria-pressed={s.theme === k} className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold ${s.theme === k ? 'bg-royal text-white' : 'text-muted'}`}><Ic size={18} />{t}</button>)}
      </div>
      <h2 className="mt-8 px-5 text-lg font-semibold lg:px-0">Notificações</h2>
      <div className="mx-5 mt-3 overflow-hidden rounded-3xl bg-surface lg:mx-0">
        {([['push', 'Notificações no celular'], ['email', 'E-mail'], ['whatsapp', 'WhatsApp'], ['manut', 'Alertas de manutenção'], ['agenda', 'Lembretes e status de agendamento'], ['promo', 'Promoções de parceiros']] as [keyof Prefs, string][]).map(([k, t], i) => (
          <button key={k} role="switch" aria-checked={s.prefs[k]} onClick={() => s.set({ prefs: { ...s.prefs, [k]: !s.prefs[k] } })} className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left ${i ? 'border-t border-line' : ''} ${i === 3 ? 'border-t-4' : ''}`}>
            <span className="font-medium">{t}</span>
            <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${s.prefs[k] ? 'bg-lime' : 'bg-line'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${s.prefs[k] ? 'left-6' : 'left-1'}`} /></span>
          </button>))}
      </div>
      <Btn kind="ghost" size="sm" className="mx-5 mt-3 lg:mx-0" onClick={() => { s.set({ notices: [{ id: uid(), kind: 'alerta', title: 'Notificação de teste', body: `Canais ativos: ${[s.prefs.push && 'celular', s.prefs.email && 'e-mail', s.prefs.whatsapp && 'WhatsApp'].filter(Boolean).join(', ') || 'nenhum'}`, date: new Date().toISOString(), read: false }, ...s.notices] }); s.say('Notificação de teste enviada') }}>Enviar notificação de teste</Btn>
      <h2 className="mt-8 px-5 text-lg font-semibold lg:px-0">Formas de pagamento</h2>
      <div className="mx-5 mt-3 grid gap-2 lg:mx-0">
        <div className="flex items-center gap-3 rounded-2xl bg-surface p-4"><QrCode size={24} className="text-[#32BCAD]" weight="fill" /><span className="flex-1"><b className="block">Pix recorrente</b><span className="text-sm text-muted">Assinatura mensal</span></span><span className="rounded-full bg-lime/20 px-2.5 py-1 text-xs font-bold text-ok">Principal</span></div>
        <div className="flex items-center gap-3 rounded-2xl bg-surface p-4"><span className="rounded-md bg-slate px-2 py-1 text-[10px] font-bold text-white">VISA</span><span className="flex-1"><b className="block">Crédito •••• 4821</b><span className="text-sm text-muted">Vence 08/29</span></span></div>
      </div>
      {s.mode === 'demo' && <><div className="mx-5 mt-8 rounded-3xl bg-royal p-4 text-sm text-white lg:mx-0">
        <b>Perfil de demonstração</b><p className="mb-3 mt-1 text-white/75">Veja a plataforma como assinante, oficina parceira ou equipe Carrook.</p>
        <RolePicker onPick={r => { s.enterDemo(r); nav(r === 'admin' ? '/admin' : r === 'oficina' ? '/oficina' : '/') }} />
      </div>
      <div className="mx-5 mt-4 rounded-3xl border-2 border-dashed border-line p-4 text-sm lg:mx-0">
        <b>Dados de demonstração</b><p className="mt-1 text-muted">Volta o app para o estado inicial, com os veículos e agendamentos de exemplo.</p>
        {resetAsk ? <div className="mt-3 flex gap-2"><Btn size="sm" kind="dark" onClick={() => { s.reset(); setResetAsk(false); s.say('Demonstração reiniciada'); nav('/') }}>Reiniciar</Btn><Btn size="sm" kind="ghost" onClick={() => setResetAsk(false)}>Cancelar</Btn></div>
          : <Btn size="sm" kind="ghost" className="mt-3" onClick={() => setResetAsk(true)}>Reiniciar demonstração</Btn>}
      </div></>}
      {s.mode === 'live' && <Btn kind="line" className="mx-5 mt-8 lg:mx-0" onClick={async () => { await signOut(); nav('/bem-vindo') }}>Sair da conta</Btn>}
    </div>
  )
}
