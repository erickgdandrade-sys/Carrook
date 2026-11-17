import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CaretLeft, Check, Eye, EyeSlash, QrCode, CreditCard } from '@phosphor-icons/react'
import { CATALOG, COUPONS, PLANS, cut, img, lookupPlate, type PlanId } from '../data'
import { RolePicker } from './extra'
import { loadLive, savePendingVehicle, sb } from '../live'
import type { Role } from '../store'
import { brl, useStore } from '../store'
import { BrandPattern, Btn, LogoMark, Plate, Wordmark } from '../ui'

/* Moldura comum: no celular é tela cheia azul; na web, foto à esquerda e formulário à direita */
function AuthFrame({ children, photo = img('car-rav4'), quote }: { children: ReactNode; photo?: string; quote?: ReactNode }) {
  return (
    <div className="min-h-screen bg-royal lg:grid lg:grid-cols-[1.1fr_1fr] lg:bg-ice">
      <div className="relative hidden overflow-hidden lg:block">
        <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-royal via-royal/40 to-transparent" />
        <div className="absolute inset-x-12 bottom-12 text-white">
          <LogoMark size={52} color="#41D92A" />
          <p className="mt-6 max-w-md text-[44px] font-extrabold leading-[1.02]">{quote ?? <><i>Facilitar &amp; transformar</i> em rotina a manutenção do seu carro.</>}</p>
        </div>
      </div>
      <div className="relative flex min-h-screen flex-col">{children}</div>
    </div>
  )
}

export function Welcome() {
  const nav = useNavigate()
  const set = useStore(s => s.set)
  return (
    <AuthFrame>
      <div className="relative flex min-h-screen flex-col overflow-hidden text-white lg:items-center lg:justify-center lg:text-fg">
        {/* Celular: foto no topo com corte diagonal */}
        <div className="relative h-[46vh] min-h-[300px] lg:hidden">
          <img src={img('car-rav4')} alt="Toyota RAV4 prata estacionado" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-royal/30 via-transparent to-royal" />
          <div className="absolute left-6 top-[max(24px,env(safe-area-inset-top))] flex items-center gap-2"><LogoMark size={30} color="#fff" /><Wordmark className="text-lg" /></div>
        </div>
        <BrandPattern className="lg:hidden" opacity={0.07} />
        <div className="relative flex flex-1 flex-col px-7 pb-10 pt-2 lg:w-full lg:max-w-md lg:flex-none lg:p-0">
          <div className="hidden items-center gap-2.5 text-royal lg:flex"><LogoMark size={40} /><Wordmark className="text-3xl text-fg" /></div>
          <h1 className="mt-2 text-[34px] font-extrabold leading-[1.05] lg:mt-10 lg:text-[40px]">
            Seu carro em dia, <span className="italic text-lime lg:text-royal">sem esforço.</span>
          </h1>
          <p className="mt-3 text-[17px] leading-snug text-white/80 lg:text-muted">Alertas de manutenção, oficinas certificadas e um plano que cobre até 80 itens.</p>
          <div className="mt-auto grid gap-3 pt-10 lg:mt-10">
            <Btn size="lg" kind="lime" onClick={() => nav('/cadastro')}>Crie sua conta</Btn>
            <Btn size="lg" kind="outline" className="lg:!border-line lg:!text-fg" onClick={() => nav('/entrar')}>Entrar</Btn>
            <details className="group mt-1">
              <summary className="cursor-pointer list-none text-center text-sm font-medium text-white/80 underline-offset-4 hover:underline lg:text-muted">Ver demonstração com dados de exemplo</summary>
              <div className="mt-3"><RolePicker onPick={(r: Role) => { useStore.getState().enterDemo(r); nav(r === 'admin' ? '/admin' : r === 'oficina' ? '/oficina' : '/') }} /></div>
            </details>
            <Link to="/site" className="text-center text-sm font-semibold text-lime lg:text-royal">Conheça a Carrook</Link>
          </div>
          <p className="mt-6 text-center text-xs text-white/60 lg:text-muted">Ao continuar você aceita os <u>Termos</u> e a <u>Política de Privacidade</u>.</p>
        </div>
      </div>
    </AuthFrame>
  )
}

const Back = ({ to }: { to?: string }) => {
  const nav = useNavigate()
  return <button onClick={() => (to ? nav(to) : nav(-1))} aria-label="Voltar" className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white lg:bg-mist lg:text-fg"><CaretLeft size={20} weight="bold" /></button>
}

export function SignIn() {
  const nav = useNavigate()
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  return (
    <AuthFrame>
      <div className="flex min-h-screen flex-col px-6 pb-10 pt-[max(20px,env(safe-area-inset-top))] lg:justify-center lg:px-0">
        <div className="lg:mx-auto lg:w-full lg:max-w-md">
          <Back to="/bem-vindo" />
          <h1 className="mt-8 text-[32px] font-extrabold text-white lg:text-fg">Bem-vindo de volta</h1>
          <p className="mt-1 text-white/75 lg:text-muted">Entre para ver a saúde do seu carro.</p>
          <form className="mt-8 grid gap-4 rounded-3xl bg-surface p-5 lg:p-0" onSubmit={async e => {
            e.preventDefault()
            if (!email.includes('@') || pass.length < 6) { setErr('Confira o e-mail e a senha (mínimo 6 caracteres).'); return }
            setBusy(true); setErr('')
            const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: pass })
            if (error) { setBusy(false); setErr(error.message.includes('confirmed') ? 'Confirme seu e-mail pelo link que enviamos antes de entrar.' : 'E-mail ou senha incorretos.'); return }
            const role = await loadLive()
            setBusy(false)
            nav(role === 'admin' ? '/admin' : role === 'oficina' ? '/oficina' : '/')
          }}>
            <label><span className="label">E-mail</span><input id="si-email" className="field" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>
            <label><span className="label">Senha</span>
              <span className="relative block"><input id="si-pass" className="field pr-12" type={show ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)} autoComplete="current-password" />
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Esconder senha' : 'Mostrar senha'} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">{show ? <EyeSlash size={20} /> : <Eye size={20} />}</button></span></label>
            {err && <p className="text-sm text-danger">{err}</p>}
            <Btn size="lg" type="submit" kind="royal" className="mt-1" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</Btn>
            <Link to="/recuperar-senha" className="text-center text-sm font-semibold text-royal">Esqueci minha senha</Link>
          </form>
          <p className="mt-6 text-center text-sm text-white/80 lg:text-muted">Ainda não tem conta? <Link to="/cadastro" className="font-bold text-lime lg:text-royal">Crie agora</Link></p>
        </div>
      </div>
    </AuthFrame>
  )
}

/* ---------- Cadastro em 4 etapas ---------- */
const STEPS = ['Seus dados', 'Seu carro', 'Plano', 'Pagamento']
export function SignUp() {
  const nav = useNavigate()
  const st = useStore()
  const [step, setStep] = useState(0)
  const [d, setD] = useState({ name: '', email: '', phone: '', pass: '', plate: '', car: 0, year: '2022', km: '', plan: 'start' as PlanId, pay: 'pix', coupon: '' })
  const [found, setFound] = useState<ReturnType<typeof lookupPlate> | 'loading' | null>(null)
  const coupon = COUPONS[d.coupon.trim().toUpperCase()]
  const firstOff = coupon ? coupon.off : 0.1
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const up = (k: keyof typeof d) => (e: { target: { value: string } }) => setD({ ...d, [k]: e.target.value })
  const plan = PLANS.find(p => p.id === d.plan)!

  const next = async () => {
    setErr('')
    if (step === 0 && (!d.name.trim() || !d.email.includes('@') || d.pass.length < 6)) return setErr('Preencha nome, e-mail válido e uma senha com 6 ou mais caracteres.')
    if (step === 1 && (d.plate.replace(/\W/g, '').length !== 7 || !d.km)) return setErr('Digite a placa (7 caracteres) e a quilometragem do painel.')
    if (step < 3) return setStep(step + 1)
    const c = CATALOG[d.car]
    const vehicle = { brand: c.brand, model: c.model, year: +d.year, plate: d.plate.replace(/\W/g, '').toUpperCase(), photo: c.photo, km: +d.km.replace(/\D/g, '') }
    setBusy(true)
    savePendingVehicle(vehicle) // entra no banco no primeiro login
    const { data, error } = await sb.auth.signUp({
      email: d.email.trim(), password: d.pass,
      options: { data: { name: d.name.trim(), phone: d.phone, plan: d.plan }, emailRedirectTo: location.origin + location.pathname },
    })
    if (error) { setBusy(false); setErr(error.message.includes('registered') ? 'Esse e-mail já tem conta. Entre ou recupere a senha.' : 'Não foi possível criar a conta agora. Tente de novo em instantes.'); return }
    if (!data.session) { setBusy(false); setSent(true); return } // precisa confirmar o e-mail
    await loadLive()
    setBusy(false)
    st.say(`Bem-vindo à Carrook, ${d.name.split(' ')[0]}!`)
    nav('/')
  }
  if (sent) return (
    <AuthFrame photo={img('car-crv')}>
      <div className="grid min-h-screen place-items-center bg-ice px-6">
        <div className="max-w-sm text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-lime text-ink"><Check size={32} weight="bold" /></span>
          <h1 className="mt-5 text-[28px] font-extrabold">Confirme seu e-mail</h1>
          <p className="mt-2 text-muted">Enviamos um link para <b>{d.email}</b>. Abra o e-mail, toque no link e depois entre com sua senha. Seu carro já fica salvo.</p>
          <Btn size="lg" className="mt-6 w-full" onClick={() => nav('/entrar')}>Ir para o login</Btn>
        </div>
      </div>
    </AuthFrame>
  )

  return (
    <AuthFrame photo={img('car-crv')} quote={<>Um plano de saúde, <i>só que para o seu carro.</i></>}>
      <div className="flex min-h-screen flex-col bg-ice pt-[max(16px,env(safe-area-inset-top))] lg:justify-center">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-8 lg:flex-none">
          <div className="flex items-center gap-3">
            <button onClick={() => (step ? setStep(step - 1) : nav('/bem-vindo'))} aria-label="Voltar" className="grid h-10 w-10 place-items-center rounded-full bg-surface shadow-soft"><CaretLeft size={20} weight="bold" /></button>
            <div className="flex flex-1 gap-1.5">{STEPS.map((_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-lime' : 'bg-line'}`} />)}</div>
          </div>
          <p className="mt-6 text-[13px] font-semibold uppercase tracking-[.12em] text-royal">Etapa {step + 1} de 4 · {STEPS[step]}</p>

          {step === 0 && <>
            <h1 className="mt-1 text-[28px] font-extrabold leading-tight">Vamos começar pelo básico</h1>
            <div className="mt-6 grid gap-4">
              <label><span className="label">Nome completo</span><input id="su-name" className="field" value={d.name} onChange={up('name')} autoComplete="name" placeholder="Como está no documento" /></label>
              <label><span className="label">E-mail</span><input id="su-email" className="field" type="email" value={d.email} onChange={up('email')} autoComplete="email" placeholder="voce@email.com" /></label>
              <label><span className="label">WhatsApp</span><input id="su-phone" className="field" inputMode="tel" value={d.phone} onChange={up('phone')} placeholder="(48) 9 0000-0000" /></label>
              <label><span className="label">Senha</span><input id="su-pass" className="field" type="password" value={d.pass} onChange={up('pass')} autoComplete="new-password" placeholder="6 ou mais caracteres" /></label>
            </div>
          </>}

          {step === 1 && <>
            <h1 className="mt-1 text-[28px] font-extrabold leading-tight">Qual carro vamos cuidar?</h1>
            <div className="mt-5 grid place-items-center rounded-3xl bg-surface p-5">
              <Plate plate={(d.plate || 'ABC1D23').replace(/\W/g, '').slice(0, 7)} size="lg" />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 [&>*]:min-w-0">
              <div><span className="label">Placa</span>
                <div className="flex gap-2"><input id="su-plate" className="field uppercase tracking-[.2em]" maxLength={8} value={d.plate} onChange={e => { up('plate')(e); setFound(null) }} placeholder="ABC1D23" aria-label="Placa" />
                  <Btn kind="royal" className="h-12 shrink-0" disabled={d.plate.replace(/\W/g, '').length !== 7 || found === 'loading'} onClick={() => { setFound('loading'); setTimeout(() => { const r = lookupPlate(d.plate); setFound(r); if (r) setD(x => ({ ...x, car: r.index, year: String(r.year) })) }, 900) }}>{found === 'loading' ? 'Buscando…' : 'Consultar'}</Btn></div>
                {found && found !== 'loading' && <p className="mt-2 rounded-2xl bg-lime/15 px-3 py-2 text-sm"><b>{found.brand} {found.model} {found.year}</b>, cor {found.color.toLowerCase()}. Confira abaixo e ajuste se precisar.</p>}
              </div>
              <div><span className="label">Modelo</span>
                <div className="no-scrollbar -mx-6 flex gap-3 overflow-x-auto px-6 pb-1">
                  {CATALOG.map((c, i) => (
                    <button key={i} onClick={() => setD({ ...d, car: i })} aria-pressed={d.car === i} className={`w-[132px] shrink-0 overflow-hidden rounded-2xl border-2 bg-surface text-left transition ${d.car === i ? 'border-royal' : 'border-transparent'}`}>
                      <span className="block h-20 bg-mist p-2"><img src={cut(c.photo)} alt="" className="h-full w-full object-contain" /></span><span className="block px-3 py-2 text-[13px] leading-tight"><b className="block">{c.model}</b><span className="text-muted">{c.brand}</span></span>
                    </button>))}
                </div></div>
              <div className="grid grid-cols-2 gap-3">
                <label><span className="label">Ano</span><select id="su-year" className="field" value={d.year} onChange={up('year')}>{Array.from({ length: 16 }, (_, i) => 2026 - i).map(y => <option key={y}>{y}</option>)}</select></label>
                <label><span className="label">Km no painel</span><input id="su-km" className="field" inputMode="numeric" value={d.km} onChange={up('km')} placeholder="32000" /></label>
              </div>
            </div>
          </>}

          {step === 2 && <>
            <h1 className="mt-1 text-[28px] font-extrabold leading-tight">Escolha seu plano</h1>
            <p className="mt-1 text-muted">Dá para trocar depois, quando quiser.</p>
            <div className="mt-5 grid gap-3">
              {PLANS.map(p => (
                <button key={p.id} onClick={() => setD({ ...d, plan: p.id })} aria-pressed={d.plan === p.id} className={`relative rounded-3xl border-2 p-4 text-left transition ${d.plan === p.id ? 'border-royal bg-surface shadow-soft' : 'border-line bg-surface/60'}`}>
                  {p.popular && <span className="absolute -top-2.5 right-4 rounded-full bg-lime px-2.5 py-0.5 text-[11px] font-bold">Mais escolhido</span>}
                  <div className="flex items-baseline justify-between"><b className="text-lg">{p.name}</b><span className="text-lg font-extrabold tabular-nums">{brl(st.planPrices[p.id])}<small className="text-xs font-medium text-muted">/mês</small></span></div>
                  <p className="mt-0.5 text-sm text-muted">{p.tagline}</p>
                  {d.plan === p.id && <ul className="mt-3 grid gap-1.5 text-sm">{p.perks.map(x => <li key={x} className="flex gap-2"><Check size={16} weight="bold" className="mt-0.5 text-ok" />{x}</li>)}<li className="flex gap-2"><Check size={16} weight="bold" className="mt-0.5 text-ok" />Até {st.planLimits[p.id]} {st.planLimits[p.id] > 1 ? 'veículos' : 'veículo'}</li></ul>}
                </button>))}
            </div>
          </>}

          {step === 3 && <>
            <h1 className="mt-1 text-[28px] font-extrabold leading-tight">Como prefere pagar?</h1>
            <div className="mt-5 rounded-3xl bg-navy p-5 text-white">
              <p className="text-sm text-white/70">{plan.name}</p>
              <p className="text-3xl font-extrabold tabular-nums">{brl(st.planPrices[plan.id] * (1 - firstOff))}<small className="text-sm font-medium text-white/70"> no 1º mês</small></p>
              <p className="mt-1 text-sm text-white/70">Depois {brl(st.planPrices[plan.id])}/mês · {coupon ? coupon.label : '10% de desconto de primeira assinatura'}</p>
            </div>
            <label className="mt-4 block"><span className="label">Cupom ou código de indicação</span>
              <input id="su-coupon" className="field uppercase" value={d.coupon} onChange={up('coupon')} placeholder="Ex.: PRIMEIRA20" /></label>
            {d.coupon && !coupon && <p className="mt-1 text-sm text-danger">Cupom não encontrado.</p>}
            {coupon && <p className="mt-1 text-sm font-semibold text-ok">Cupom aplicado: {coupon.label}</p>}
            <div className="mt-4 grid gap-2">
              {[['pix', 'Pix recorrente', 'Autoriza uma vez, cobra todo mês', QrCode], ['card', 'Cartão de crédito', 'Visa, Master, Elo, Amex', CreditCard]].map(([k, t, s, Ic]) => {
                const I = Ic as typeof QrCode
                return <button key={k as string} onClick={() => setD({ ...d, pay: k as string })} aria-pressed={d.pay === k} className={`flex items-center gap-3 rounded-2xl border-2 bg-surface p-4 text-left ${d.pay === k ? 'border-royal' : 'border-line'}`}><I size={26} className="text-royal" /><span className="flex-1"><b className="block">{t as string}</b><span className="text-sm text-muted">{s as string}</span></span><span className={`h-5 w-5 rounded-full border-2 ${d.pay === k ? 'border-[6px] border-royal' : 'border-line'}`} /></button>
              })}
            </div>
          </>}

          {err && <p className="mt-4 rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">{err}</p>}
          <div className="mt-auto pt-8 lg:mt-8"><Btn size="lg" className="w-full" disabled={busy} onClick={next}>{busy ? 'Criando conta…' : step === 3 ? 'Assinar e começar' : 'Continuar'}</Btn></div>
        </div>
      </div>
    </AuthFrame>
  )
}
