import { useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Bell, Check, CheckCircle, Copy, Gift, Kanban, Money, ShieldCheck, Storefront, Warning,
  WhatsappLogo, EnvelopeSimple, InstagramLogo, Clock, X, Lock, Car, Wrench, type Icon,
} from '@phosphor-icons/react'
import { COVERAGE, PLANS, POSTS, POST_BODY, SERVICES, img } from '../data'
import { STATUS_FLOW, STATUS_LABEL, brl, useStore, type ReportMark, type Role } from '../store'
import { BrandPattern, Btn, LogoMark, PageHead, Seal, Stars, Wordmark, fmtDate } from '../ui'
import { StatusChip } from './bookings'

/* =================== Landing page de vendas =================== */
export function Landing() {
  const prices = useStore(s => s.planPrices)
  const limits = useStore(s => s.planLimits)
  const [faq, setFaq] = useState<number | null>(0)
  const FAQ = [
    ['Como funciona a coparticipação?', 'Nos serviços cobertos, você paga só uma parte: 50% no Start e 20% no Premium. A Carrook paga o resto direto para a oficina.'],
    ['Posso escolher a oficina?', 'Sim. A Carrook indica a parceira com melhor equilíbrio entre desconto, avaliação e distância, mas você escolhe qualquer uma da rede.'],
    ['Tem carência?', 'O Clube não tem carência. No Start a cobertura começa em 90 dias e no Premium em 30. Revisão anual e troca de óleo valem desde o primeiro mês.'],
    ['Como o app sabe a quilometragem?', 'Você informa quando quiser, e o app estima pelo seu uso entre uma atualização e outra.'],
    ['Posso cancelar?', 'Pode, a qualquer momento, pelo próprio app.'],
  ]
  return (
    <div className="bg-ice text-fg">
      <header className="sticky top-0 z-40 border-b border-line bg-ice/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <span className="flex items-center gap-2 text-royal"><LogoMark size={28} /><Wordmark className="text-lg text-fg" /></span>
          <nav className="flex items-center gap-2 text-sm font-semibold">
            <a href="#planos" className="hidden px-3 py-2 sm:block">Planos</a>
            <a href="#duvidas" className="hidden px-3 py-2 sm:block">Dúvidas</a>
            <Link to="/entrar" className="px-3 py-2">Entrar</Link>
            <Link to="/cadastro" className="rounded-full bg-lime px-4 py-2 text-ink">Assinar</Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-royal text-white">
        <BrandPattern opacity={0.07} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.14em] text-lime">O plano de saúde do seu carro</p>
            <h1 className="mt-3 text-[44px] font-extrabold leading-[1.02] lg:text-[64px]"><i>Facilitar &amp; transformar</i> em rotina a manutenção do seu veículo.</h1>
            <p className="mt-5 max-w-lg text-lg text-white/85">Alertas no app, oficinas certificadas com desconto e cobertura de até 80 itens. A partir de {brl(prices.clube).replace(',00', '')} por mês.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link to="/cadastro"><Btn size="lg">Assinar agora</Btn></Link><a href="#como"><Btn size="lg" kind="outline">Como funciona</Btn></a></div>
          </div>
          <div className="relative">
            <img src={img('car-rav4')} alt="Toyota RAV4 prata" className="aspect-[4/3] w-full rounded-[32px] object-cover" />
            <div className="absolute -bottom-5 left-5 flex items-center gap-3 rounded-3xl bg-surface p-4 text-fg shadow-float">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime text-ink"><Bell size={22} weight="fill" /></span>
              <span><b className="block">Troca de óleo em 500 km</b><span className="text-sm text-muted">Agende com 22% de desconto</span></span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="max-w-2xl text-3xl font-extrabold leading-tight lg:text-4xl">Falta de manutenção é uma das principais causas de acidentes de trânsito.</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[['30%', 'dos acidentes têm relação com falta de manutenção'], ['48%', 'dos motoristas não fazem manutenção preventiva'], ['91%', 'acham a previsibilidade de custos muito importante']].map(([n, t]) => (
            <div key={n} className="rounded-3xl bg-surface p-6"><p className="text-5xl font-extrabold text-royal">{n}</p><p className="mt-2 text-muted">{t}</p></div>))}
        </div>
        <p className="mt-3 text-xs text-muted">Fontes: omecanico.com.br (2022), IBGE (2022) e pesquisa de validação Carrook.</p>
      </section>

      <section id="como" className="bg-navy py-16 text-white">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-3xl font-extrabold lg:text-4xl">Como funciona</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {([[Car, 'Cadastre seu carro', 'Placa e quilometragem. O app monta o plano de manutenção do seu modelo.'], [Bell, 'Receba os alertas', 'Avisamos antes de cada item vencer, por km ou por tempo.'], [Wrench, 'Agende com desconto', 'Escolha a oficina parceira, pague pelo app e acompanhe o serviço.']] as [Icon, string, string][]).map(([Ic, t, d], i) => (
              <li key={t} className="rounded-3xl bg-white/10 p-6"><span className="text-sm font-bold text-lime">Passo {i + 1}</span><Ic size={32} className="mt-3" /><b className="mt-3 block text-xl">{t}</b><p className="mt-1 text-white/75">{d}</p></li>))}
          </ol>
        </div>
      </section>

      <section id="planos" className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-3xl font-extrabold lg:text-4xl">Planos</h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {PLANS.map(p => (
            <article key={p.id} className={`relative flex flex-col rounded-3xl p-6 ${p.popular ? 'bg-navy text-white' : 'bg-surface'}`}>
              {p.popular && <span className="absolute -top-3 left-6 rounded-full bg-lime px-3 py-1 text-xs font-bold text-ink">⚡ Popular</span>}
              <h3 className="text-xl font-bold">{p.name}</h3>
              <p className="mt-4 text-[40px] font-extrabold leading-none">{brl(prices[p.id]).replace(',00', '')}<small className="text-base font-medium opacity-70">/mês</small></p>
              <ul className="mt-5 grid flex-1 content-start gap-2">{[...p.perks, `Até ${limits[p.id]} ${limits[p.id] > 1 ? 'veículos' : 'veículo'}`].map(x => <li key={x} className="flex gap-2"><Check size={18} weight="bold" className="mt-0.5 shrink-0 text-lime" />{x}</li>)}</ul>
              <Link to="/cadastro" className="mt-6"><Btn kind={p.popular ? 'lime' : 'royal'} className="w-full">Assinar {p.short}</Btn></Link>
            </article>))}
        </div>
        <div className="mt-10 overflow-x-auto rounded-3xl bg-surface p-2">
          <table className="w-full min-w-[560px] text-sm">
            <thead><tr className="text-left"><th className="p-3">Comparativo</th><th className="text-center">Carrook</th><th className="text-center text-muted">Outros apps</th><th className="text-center text-muted">Oficina avulsa</th></tr></thead>
            <tbody>{[['Revisão anual gratuita', 1, 1, 0], ['Troca de óleo gratuita', 1, 1, 0], ['Desconto em peças', 1, 0, 0], ['Desconto em combustível', 1, 0, 0], ['Agendamento pelo app', 1, 1, 0], ['Cobertura de até 80 itens', 1, 0, 0]].map(([t, a, b, c]) => (
              <tr key={t as string} className="border-t border-line"><td className="p-3">{t}</td>{[a, b, c].map((v, i) => <td key={i} className="text-center">{v ? <CheckCircle size={20} weight="fill" className="mx-auto text-ok" /> : <X size={18} className="mx-auto text-danger" />}</td>)}</tr>))}</tbody>
          </table>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-3xl font-extrabold">Quem usa, recomenda</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">{[['Me salvou de um problemão! Acharam a correia rachada na revisão.', 'Rafael N., Criciúma'], ['Deixaram meu carro novo, e paguei metade.', 'Júlia M., Içara'], ['Finalmente sei quando trocar o óleo sem precisar lembrar.', 'Carlos S., Forquilhinha']].map(([q, n]) => (
            <figure key={n} className="rounded-3xl bg-mist p-6"><Stars value={5} /><blockquote className="mt-3 text-lg">“{q}”</blockquote><figcaption className="mt-3 text-sm text-muted">{n}</figcaption></figure>))}</div>
        </div>
      </section>

      <section id="duvidas" className="mx-auto max-w-3xl px-5 py-16">
        <h2 className="text-3xl font-extrabold">Dúvidas frequentes</h2>
        <div className="mt-6 grid gap-2">{FAQ.map(([q, a], i) => (
          <div key={q} className="rounded-2xl bg-surface">
            <button onClick={() => setFaq(faq === i ? null : i)} aria-expanded={faq === i} className="flex w-full items-center justify-between gap-3 p-5 text-left font-semibold">{q}<span className="text-xl text-royal">{faq === i ? '−' : '+'}</span></button>
            {faq === i && <p className="px-5 pb-5 text-muted">{a}</p>}
          </div>))}</div>
      </section>

      <section className="bg-lime py-14 text-ink"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5"><h2 className="text-3xl font-extrabold">Seu carro em dia, sem esforço.</h2><Link to="/cadastro"><Btn size="lg" kind="dark">Criar minha conta</Btn></Link></div></section>

      <footer className="bg-slate py-10 text-white/80">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 sm:grid-cols-3">
          <div><span className="flex items-center gap-2 text-white"><LogoMark size={24} color="#41D92A" /><Wordmark /></span><p className="mt-2 text-sm">Criciúma, SC</p></div>
          <div className="grid gap-1 text-sm"><span className="flex items-center gap-2"><WhatsappLogo size={16} />+55 48 9 9190-3121</span><span className="flex items-center gap-2"><EnvelopeSimple size={16} />plataformacarrook@gmail.com</span><span className="flex items-center gap-2"><InstagramLogo size={16} />@carrook.app</span></div>
          <div className="grid gap-1 text-sm"><Link to="/termos">Termos de uso</Link><Link to="/privacidade">Política de privacidade</Link><Link to="/bem-vindo">Acessar o app</Link></div>
        </div>
      </footer>
    </div>
  )
}

/* =================== Termos e privacidade =================== */
function LegalPage({ title, sections }: { title: string; sections: [string, string][] }) {
  return (
    <div className="min-h-screen bg-ice">
      <div className="mx-auto max-w-3xl px-5 py-8">
        <Link to="/site" className="flex items-center gap-2 text-royal"><LogoMark size={24} /><Wordmark className="text-fg" /></Link>
        <h1 className="mt-8 text-4xl font-extrabold">{title}</h1>
        <p className="mt-2 rounded-2xl bg-amber/15 px-4 py-3 text-sm text-[#7A4E00] dark:text-amber">Modelo para o protótipo. Revise com um advogado antes de publicar.</p>
        <p className="mt-4 text-sm text-muted">Última atualização: {fmtDate(new Date().toISOString(), { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        {sections.map(([h, t], i) => <section key={h} className="mt-8"><h2 className="text-xl font-bold">{i + 1}. {h}</h2><p className="mt-2 leading-relaxed text-muted">{t}</p></section>)}
        <p className="mt-10 text-sm text-muted">Dúvidas: plataformacarrook@gmail.com</p>
      </div>
    </div>
  )
}
export const Terms = () => <LegalPage title="Termos de uso" sections={[
  ['Sobre a Carrook', 'A Carrook é uma plataforma que organiza a manutenção preventiva de veículos por meio de planos de assinatura, alertas e uma rede de oficinas parceiras.'],
  ['Cadastro', 'Para usar o app você precisa ter 18 anos ou mais e informar dados verdadeiros. Você é responsável pela segurança da sua senha.'],
  ['Planos, carência e coparticipação', 'Cada plano tem preço, limite de veículos, carência e percentual de coparticipação próprios, descritos na tela de planos. A cobertura vale apenas para serviços feitos na rede parceira.'],
  ['Pagamentos e cancelamento', 'A assinatura é cobrada mensalmente. Você pode cancelar quando quiser pelo app; o acesso segue até o fim do período pago.'],
  ['Agendamentos', 'Cancelamentos com mais de 24 horas de antecedência não têm custo. Os serviços são executados pelas oficinas parceiras, que respondem pela sua execução.'],
  ['Limitações', 'Os alertas são estimativas baseadas no manual do fabricante e nas informações que você fornece. Eles não substituem a avaliação de um mecânico.'],
]} />
export const Privacy = () => <LegalPage title="Política de privacidade" sections={[
  ['Dados que coletamos', 'Nome, e-mail, telefone, dados do veículo (placa, modelo, quilometragem), histórico de serviços, dados de pagamento processados por parceiros e, se você autorizar, sinais de deslocamento para estimar a quilometragem.'],
  ['Para que usamos', 'Para prestar o serviço, enviar alertas, processar pagamentos, indicar oficinas e melhorar o app. Não vendemos seus dados.'],
  ['Base legal (LGPD)', 'Tratamos dados para executar o contrato com você, cumprir obrigações legais e, quando necessário, com o seu consentimento, que pode ser retirado a qualquer momento.'],
  ['Compartilhamento', 'Compartilhamos com a oficina escolhida apenas o necessário para o atendimento e com processadores de pagamento. Todos seguem a LGPD.'],
  ['Seus direitos', 'Você pode acessar, corrigir, exportar ou excluir seus dados e revogar consentimentos pelo app ou por e-mail.'],
  ['Retenção e segurança', 'Guardamos os dados enquanto a conta estiver ativa e pelo prazo exigido em lei. Usamos criptografia e controle de acesso.'],
]} />

/* =================== Esqueci a senha =================== */
export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  return (
    <div className="grid min-h-screen place-items-center bg-royal px-5 text-white">
      <div className="w-full max-w-sm">
        <Link to="/entrar" className="inline-grid h-10 w-10 place-items-center rounded-full bg-white/15" aria-label="Voltar"><ArrowLeft size={20} /></Link>
        {sent ? (<>
          <span className="mt-8 grid h-16 w-16 place-items-center rounded-full bg-lime text-ink"><EnvelopeSimple size={30} weight="fill" /></span>
          <h1 className="mt-5 text-3xl font-extrabold">Confira seu e-mail</h1>
          <p className="mt-2 text-white/80">Se existir uma conta com {email}, enviamos um link para criar uma nova senha. Ele vale por 1 hora.</p>
          <Link to="/entrar"><Btn kind="lime" size="lg" className="mt-8 w-full">Voltar para o login</Btn></Link>
        </>) : (<>
          <Lock size={40} className="mt-8 text-lime" />
          <h1 className="mt-4 text-3xl font-extrabold">Esqueceu a senha?</h1>
          <p className="mt-2 text-white/80">Digite o e-mail da sua conta e enviamos um link para criar outra.</p>
          <form className="mt-6 grid gap-3" onSubmit={e => { e.preventDefault(); if (email.includes('@')) setSent(true) }}>
            <input id="fp-email" className="field" type="email" required placeholder="voce@email.com" value={email} onChange={e => setEmail(e.target.value)} aria-label="E-mail" />
            <Btn kind="lime" size="lg" type="submit">Enviar link</Btn>
          </form>
        </>)}
      </div>
    </div>
  )
}

/* =================== Indique e ganhe =================== */
export function Referral() {
  const name = useStore(s => s.user.name)
  const say = useStore(s => s.say)
  const code = 'CK-' + name.split(' ')[0].toUpperCase().normalize('NFD').replace(/[^A-Z]/g, '')
  const link = `carrook.app/convite/${code}`
  const copy = () => navigator.clipboard?.writeText(link).then(() => say('Link copiado'), () => say('Selecione o link para copiar'))
  return (
    <div className="lg:max-w-3xl">
      <PageHead title="Indique e ganhe" />
      <div className="relative mx-5 overflow-hidden rounded-3xl bg-lime p-6 text-ink lg:mx-0">
        <Gift size={44} weight="fill" />
        <h2 className="mt-3 text-[28px] font-extrabold leading-tight">Seu amigo paga metade do 1º mês. Você ganha 1 mês grátis.</h2>
        <div className="mt-5 flex items-center gap-2 rounded-2xl bg-white p-2 pl-4 text-[#151A3B]">
          <span className="min-w-0 flex-1 select-all truncate font-semibold">{link}</span>
          <button onClick={copy} className="flex items-center gap-1.5 rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-white"><Copy size={16} />Copiar</button>
        </div>
        <p className="mt-3 text-sm">Ou passe o cupom <b className="tracking-wider">{code}</b> no cadastro.</p>
      </div>
      <div className="mx-5 mt-4 grid grid-cols-3 gap-3 lg:mx-0">
        {[['3', 'convites enviados'], ['2', 'amigos assinaram'], ['2', 'meses grátis']].map(([n, t]) => <div key={t} className="rounded-3xl bg-surface p-4 text-center"><b className="block text-3xl font-extrabold text-royal">{n}</b><span className="text-xs text-muted">{t}</span></div>)}
      </div>
      <h2 className="mt-8 px-5 text-lg font-semibold lg:px-0">Como funciona</h2>
      <ol className="mx-5 mt-3 grid gap-2 lg:mx-0">{['Envie seu link para quem tem carro.', 'Seu amigo assina qualquer plano com 50% de desconto no primeiro mês.', 'Depois do primeiro pagamento dele, sua próxima mensalidade sai grátis.'].map((t, i) => <li key={t} className="flex gap-3 rounded-2xl bg-surface p-4"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-royal text-sm font-bold text-white">{i + 1}</span>{t}</li>)}</ol>
    </div>
  )
}

/* =================== Blog =================== */
export function BlogPost() {
  const { id } = useParams()
  const p = POSTS.find(x => x.id === id)
  if (!p) return <PageHead title="Artigo não encontrado" />
  return (
    <article className="lg:max-w-3xl">
      <div className="relative h-[280px] overflow-hidden lg:rounded-4xl"><img src={p.photo} alt="" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-slate/90 to-transparent" />
        <div className="absolute inset-x-5 bottom-5 text-white"><span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">{p.tag} · {p.minutes} min de leitura</span><h1 className="mt-2 text-[30px] font-extrabold leading-tight">{p.title}</h1></div></div>
      <div className="grid gap-4 px-5 pt-6 text-[17px] leading-relaxed lg:px-0">{(POST_BODY[p.id] ?? []).map((t, i) => <p key={i}>{t}</p>)}</div>
      <div className="mx-5 mt-8 rounded-3xl bg-navy p-5 text-white lg:mx-0"><b className="text-lg">Quer o lembrete certo na hora certa?</b><p className="text-white/75">O app avisa antes de cada item vencer.</p><Link to="/veiculos" className="mt-3 inline-flex items-center gap-1 font-semibold text-lime">Ver meu plano de manutenção <ArrowRight size={16} /></Link></div>
      <h2 className="mt-8 px-5 font-semibold lg:px-0">Leia também</h2>
      <div className="mt-3 grid gap-2 px-5 lg:px-0">{POSTS.filter(x => x.id !== p.id).map(x => <Link key={x.id} to={`/blog/${x.id}`} className="flex items-center gap-3 rounded-2xl bg-surface p-2 pr-4"><img src={x.photo} alt="" className="h-14 w-20 rounded-xl object-cover" /><b className="text-sm">{x.title}</b></Link>)}</div>
    </article>
  )
}

/* =================== Acesso por perfil =================== */
const ROLE_NAME: Record<Role, string> = { cliente: 'Assinante', oficina: 'Oficina parceira', admin: 'Equipe Carrook' }
export function RoleGate({ need, children }: { need: Role; children: ReactNode }) {
  const role = useStore(s => s.role)
  const set = useStore(s => s.set)
  const nav = useNavigate()
  if (role === need) return <>{children}</>
  return (
    <div className="grid min-h-screen place-items-center bg-mist px-5">
      <div className="max-w-sm rounded-3xl bg-surface p-6 text-center">
        <Lock size={40} className="mx-auto text-royal" />
        <h1 className="mt-3 text-2xl font-extrabold">Acesso restrito</h1>
        <p className="mt-2 text-muted">Esta área é só para {ROLE_NAME[need].toLowerCase()}. Você está como {ROLE_NAME[role].toLowerCase()}.</p>
        <Btn className="mt-5 w-full" onClick={() => set({ role: need, signedIn: true })}>Entrar como {ROLE_NAME[need].toLowerCase()} (demo)</Btn>
        <button className="mt-3 text-sm font-semibold text-royal" onClick={() => nav('/')}>Voltar ao app</button>
      </div>
    </div>
  )
}
export const RolePicker = ({ onPick }: { onPick: (r: Role) => void }) => (
  <div className="grid gap-2">
    {([['cliente', 'Assinante', 'App do motorista', Car], ['oficina', 'Oficina parceira', 'Agenda, laudos e repasses', Storefront], ['admin', 'Equipe Carrook', 'Painel administrativo', ShieldCheck]] as [Role, string, string, Icon][]).map(([r, t, d, Ic]) => (
      <button key={r} onClick={() => onPick(r)} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 text-left hover:bg-white/20 lg:bg-mist lg:hover:bg-line">
        <Ic size={24} /><span className="flex-1"><b className="block text-[15px]">{t}</b><span className="text-[13px] opacity-75">{d}</span></span><ArrowRight size={18} />
      </button>))}
  </div>
)

/* =================== Portal da oficina =================== */
const SHOP_ID = 'prospera'
const PNAV: [string, string, Icon][] = [['/oficina', 'Agenda', Kanban], ['/oficina/horarios', 'Horários', Clock], ['/oficina/repasses', 'Repasses', Money]]

export function ShopShell() {
  const shop = useStore(s => s.shops.find(x => x.id === SHOP_ID)!)
  return (
    <RoleGate need="oficina">
      <div className="min-h-screen bg-mist lg:flex">
        <aside className="sticky top-0 z-30 bg-navy text-white lg:h-screen lg:w-[256px] lg:shrink-0 lg:p-5">
          <div className="flex items-center gap-3 px-5 py-4 lg:px-0 lg:py-0">
            <img src={shop.photo} alt="" className="h-11 w-11 rounded-2xl object-cover" />
            <div className="min-w-0"><b className="block truncate">{shop.name}</b><span className="flex items-center gap-1 text-xs text-white/70"><LogoMark size={11} color="#41D92A" />Portal do parceiro</span></div>
          </div>
          <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:mt-8 lg:flex-col lg:p-0" aria-label="Portal da oficina">
            {PNAV.map(([to, t, Ic]) => <NavLink key={to} to={to} end className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-white/15 text-lime' : 'text-white/75 hover:text-white'}`}><Ic size={20} />{t}</NavLink>)}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 px-5 py-6 lg:px-10 lg:py-8"><div className="mx-auto max-w-[1100px]"><Outlet /></div></main>
      </div>
    </RoleGate>
  )
}

export function ShopAgenda() {
  const s = useStore()
  const list = s.bookings.filter(b => b.shopId === SHOP_ID && b.status !== 'cancelado').sort((a, b) => a.date.localeCompare(b.date))
  const open = list.filter(b => b.status !== 'concluido')
  return (
    <div>
      <h1 className="text-[28px] font-extrabold">Agenda</h1>
      <p className="text-muted">{open.length} serviços em aberto</p>
      <div className="mt-6 grid gap-3">
        {list.map(b => (
          <Link key={b.id} to={`/oficina/servico/${b.id}`} className="flex flex-wrap items-center gap-4 rounded-3xl bg-surface p-4">
            <div className="w-16 text-center"><b className="block text-2xl leading-none">{new Date(b.date).getDate()}</b><span className="text-xs uppercase text-muted">{fmtDate(b.date, { month: 'short' })} · {b.time}</span></div>
            <div className="min-w-0 flex-1"><b className="block">{SERVICES[b.service].name}</b><span className="text-sm text-muted">{b.customer}{b.vehicleId !== '-' ? ` · ${s.vehicles.find(v => v.id === b.vehicleId)?.model ?? ''}` : ''}</span></div>
            {b.extra?.status === 'pendente' && <span className="rounded-full bg-amber/15 px-2.5 py-1 text-[11px] font-bold text-[#9A6200] dark:text-amber">Aguardando cliente</span>}
            <StatusChip s={b.status} />
          </Link>))}
      </div>
    </div>
  )
}

const REPORT_ITEMS = ['Freios e discos', 'Suspensão dianteira', 'Suspensão traseira', 'Fluidos e vazamentos', 'Bateria e alternador', 'Pneus e calibragem', 'Luzes e elétrica', 'Correias e mangueiras', 'Filtros', 'Escapamento']
export function ShopService() {
  const { id } = useParams()
  const s = useStore()
  const nav = useNavigate()
  const b = s.bookings.find(x => x.id === id)
  const [desc, setDesc] = useState('')
  const [val, setVal] = useState('')
  const [rep, setRep] = useState<Record<string, ReportMark>>(() => b?.report ?? Object.fromEntries(REPORT_ITEMS.map(i => [i, 'ok' as ReportMark])))
  if (!b) return <p>Serviço não encontrado.</p>
  const idx = STATUS_FLOW.indexOf(b.status)
  const next = STATUS_FLOW[idx + 1]
  const marks: [ReportMark, string, string][] = [['ok', 'OK', 'bg-lime text-ink'], ['atencao', 'Atenção', 'bg-amber text-ink'], ['trocar', 'Trocar', 'bg-danger text-white']]
  return (
    <div>
      <button onClick={() => nav('/oficina')} className="mb-4 flex items-center gap-1 text-sm font-semibold text-royal"><ArrowLeft size={16} />Agenda</button>
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-[28px] font-extrabold leading-tight">{SERVICES[b.service].name}</h1><p className="text-muted">{b.customer} · {fmtDate(b.date, { weekday: 'long', day: 'numeric', month: 'long' })}, {b.time}</p></div><StatusChip s={b.status} /></div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl bg-surface p-5">
          <h2 className="font-semibold">Status do serviço</h2>
          <div className="mt-4 flex flex-wrap gap-1.5">{STATUS_FLOW.map((st, i) => <span key={st} className={`rounded-full px-3 py-1 text-xs font-semibold ${i <= idx ? 'bg-slate text-white' : 'bg-mist text-muted'}`}>{STATUS_LABEL[st]}</span>)}</div>
          {next ? <Btn className="mt-5 w-full" onClick={() => { s.setStatus(b.id, next); s.say(`Status: ${STATUS_LABEL[next]}. O cliente foi avisado.`) }}>Avançar para “{STATUS_LABEL[next]}”</Btn> : <p className="mt-5 flex items-center gap-2 font-semibold text-ok"><CheckCircle size={20} weight="fill" />Serviço concluído</p>}
          <p className="mt-3 text-xs text-muted">O cliente recebe uma notificação a cada mudança.</p>
        </section>
        <section className="rounded-3xl bg-surface p-5">
          <h2 className="font-semibold">Orçamento extra</h2>
          {b.extra ? (
            <div className="mt-3 rounded-2xl bg-mist p-4"><b className="block">{b.extra.desc}</b><span className="tabular-nums">{brl(b.extra.value)}</span>
              <p className={`mt-2 text-sm font-semibold ${b.extra.status === 'aprovado' ? 'text-ok' : b.extra.status === 'recusado' ? 'text-danger' : 'text-[#9A6200] dark:text-amber'}`}>{{ pendente: 'Aguardando aprovação do cliente', aprovado: 'Aprovado pelo cliente', recusado: 'Recusado pelo cliente' }[b.extra.status]}</p></div>
          ) : (
            <form className="mt-3 grid gap-3" onSubmit={e => { e.preventDefault(); const v = parseFloat(val.replace(',', '.')); if (!desc.trim() || !v) { s.say('Descreva o item e o valor.'); return } s.proposeExtra(b.id, desc.trim(), v); s.say('Orçamento enviado ao cliente') }}>
              <p className="text-sm text-muted">Encontrou algo além do agendado? Envie para o cliente aprovar no app.</p>
              <input id="ex-desc" className="field" placeholder="Ex.: Troca dos discos de freio" value={desc} onChange={e => setDesc(e.target.value)} aria-label="Descrição" />
              <input id="ex-val" className="field" inputMode="decimal" placeholder="Valor (R$)" value={val} onChange={e => setVal(e.target.value)} aria-label="Valor" />
              <Btn kind="royal" type="submit">Enviar para aprovação</Btn>
            </form>)}
        </section>
        <section className="rounded-3xl bg-surface p-5 lg:col-span-2">
          <div className="flex items-center justify-between"><h2 className="font-semibold">Laudo digital</h2>{b.report && <span className="text-xs font-semibold text-ok">Enviado</span>}</div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">{REPORT_ITEMS.map(it => (
            <div key={it} className="flex items-center justify-between gap-2 rounded-2xl bg-mist p-2 pl-4"><span className="text-sm">{it}</span>
              <span className="flex gap-1">{marks.map(([m, t, c]) => <button key={m} onClick={() => setRep({ ...rep, [it]: m })} aria-pressed={rep[it] === m} className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${rep[it] === m ? c : 'bg-surface text-muted'}`}>{t}</button>)}</span></div>))}</div>
          <Btn kind="dark" className="mt-4" onClick={() => { s.saveReport(b.id, rep); s.say('Laudo salvo e disponível no app do cliente') }}>Salvar laudo</Btn>
        </section>
      </div>
    </div>
  )
}

export function ShopHours() {
  const s = useStore()
  const shop = s.shops.find(x => x.id === SHOP_ID)!
  const hours = ['08:00', '09:30', '11:00', '13:30', '15:00', '16:30']
  const blocked = shop.blocked ?? []
  const toggle = (h: string) => s.set({ shops: s.shops.map(x => x.id === SHOP_ID ? { ...x, blocked: blocked.includes(h) ? blocked.filter(y => y !== h) : [...blocked, h] } : x) })
  return (
    <div>
      <h1 className="text-[28px] font-extrabold">Horários</h1>
      <p className="text-muted">Toque para abrir ou fechar um horário para agendamentos pelo app.</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{hours.map(h => {
        const off = blocked.includes(h)
        return <button key={h} onClick={() => toggle(h)} aria-pressed={!off} className={`rounded-3xl p-5 text-center ${off ? 'bg-surface text-muted' : 'bg-royal text-white'}`}><b className="block text-2xl tabular-nums">{h}</b><span className="text-xs">{off ? 'Fechado' : 'Aberto'}</span></button>
      })}</div>
      <p className="mt-4 text-sm text-muted">{shop.hours}. Aos sábados, só pela manhã.</p>
    </div>
  )
}

export function ShopPayouts() {
  const s = useStore()
  const shop = s.shops.find(x => x.id === SHOP_ID)!
  const done = s.bookings.filter(b => b.shopId === SHOP_ID && b.status === 'concluido')
  const rows = done.map(b => { const gross = Math.round(b.base * (1 - shop.discount / 100) * 100) / 100; return { b, gross, client: b.price, carrook: Math.max(0, gross - b.price) } })
  const total = rows.reduce((a, r) => a + r.gross, 0)
  const nextPay = new Date(); nextPay.setDate(nextPay.getDate() + ((5 - nextPay.getDay() + 7) % 7 || 7))
  return (
    <div>
      <h1 className="text-[28px] font-extrabold">Repasses</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-royal p-5 text-white"><p className="text-xs font-semibold uppercase tracking-wider text-white/70">A receber</p><p className="mt-1 text-3xl font-extrabold tabular-nums">{brl(total)}</p><p className="text-sm text-white/75">Próximo repasse: {fmtDate(nextPay.toISOString(), { weekday: 'long', day: 'numeric', month: 'short' })}</p></div>
        <div className="rounded-3xl bg-surface p-5"><p className="text-xs font-semibold uppercase tracking-wider text-muted">Serviços concluídos</p><p className="mt-1 text-3xl font-extrabold">{done.length}</p></div>
        <div className="rounded-3xl bg-surface p-5"><p className="text-xs font-semibold uppercase tracking-wider text-muted">Avaliação</p><p className="mt-1 flex items-center gap-2 text-3xl font-extrabold">{shop.rating.toFixed(1)}<Stars value={shop.rating} /></p></div>
      </div>
      <div className="mt-4 overflow-x-auto rounded-3xl bg-surface p-2">
        <table className="w-full min-w-[560px] text-sm">
          <thead><tr className="text-left text-xs uppercase tracking-wider text-muted"><th className="p-3">Serviço</th><th>Data</th><th>Pago pelo cliente</th><th>Pago pela Carrook</th><th>Total</th></tr></thead>
          <tbody>{rows.map(r => <tr key={r.b.id} className="border-t border-line"><td className="p-3">{SERVICES[r.b.service].short} · {r.b.customer.split('·')[0]}</td><td>{fmtDate(r.b.date)}</td><td className="tabular-nums">{brl(r.client)}</td><td className="tabular-nums">{brl(r.carrook)}</td><td className="font-bold tabular-nums">{brl(r.gross)}</td></tr>)}
            {!rows.length && <tr><td colSpan={5} className="p-6 text-center text-muted">Os serviços concluídos aparecem aqui.</td></tr>}</tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">Valores já com o desconto de parceiro ({shop.discount}%). A Carrook paga a parte coberta pelo plano.</p>
    </div>
  )
}

/* Bloco usado no app do cliente */
export function ExtraApproval({ id }: { id: string }) {
  const s = useStore()
  const b = s.bookings.find(x => x.id === id)!
  if (!b.extra) return null
  const p = PLANS.find(x => x.id === s.plan)!
  const youPay = p.copay ? b.extra.value * p.copay : b.extra.value * (1 - (s.shops.find(x => x.id === b.shopId)?.discount ?? 0) / 100)
  return (
    <div className={`rounded-3xl p-5 ${b.extra.status === 'pendente' ? 'bg-amber/15 ring-2 ring-amber' : 'bg-surface'}`}>
      <p className="flex items-center gap-2 text-sm font-bold"><Warning size={18} weight="fill" className="text-amber" />Orçamento extra da oficina</p>
      <b className="mt-2 block text-lg">{b.extra.desc}</b>
      <div className="mt-1 flex justify-between text-sm"><span className="text-muted">Valor da oficina</span><span className="tabular-nums">{brl(b.extra.value)}</span></div>
      <div className="flex justify-between text-sm font-bold"><span>Você paga ({p.copay ? `coparticipação ${p.copay * 100}%` : 'com desconto'})</span><span className="tabular-nums">{brl(youPay)}</span></div>
      {b.extra.status === 'pendente' ? (
        <div className="mt-4 grid grid-cols-2 gap-2"><Btn onClick={() => { s.answerExtra(b.id, true); s.say('Orçamento aprovado') }}>Aprovar</Btn><Btn kind="line" onClick={() => { s.answerExtra(b.id, false); s.say('Orçamento recusado') }}>Recusar</Btn></div>
      ) : <p className={`mt-3 text-sm font-semibold ${b.extra.status === 'aprovado' ? 'text-ok' : 'text-danger'}`}>{b.extra.status === 'aprovado' ? 'Você aprovou' : 'Você recusou'}</p>}
    </div>
  )
}

export const Coverage = () => (
  <div className="overflow-x-auto rounded-3xl bg-surface p-2">
    <table className="w-full min-w-[620px] text-sm">
      <thead><tr className="text-left text-xs uppercase tracking-wider text-muted"><th className="p-3">Grupo</th><th>Itens</th><th>Clube</th><th>Start</th><th>Premium</th></tr></thead>
      <tbody>{COVERAGE.map(c => <tr key={c.group} className="border-t border-line align-top"><td className="p-3"><b className="block">{c.group}</b><span className="text-xs text-muted">{c.examples}</span></td><td className="pt-3 tabular-nums">{c.items}</td><td className="pt-3">{c.clube}</td><td className="pt-3">{c.start}</td><td className="pt-3">{c.premium}</td></tr>)}
        <tr className="border-t border-line font-bold"><td className="p-3">Total</td><td className="tabular-nums">{COVERAGE.reduce((a, c) => a + c.items, 0)}</td><td colSpan={3} className="text-xs font-medium text-muted">% = parte que você paga (coparticipação)</td></tr></tbody>
    </table>
  </div>
)

