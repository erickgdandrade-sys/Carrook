import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { House, Bell, Wrench, List, Car, CalendarCheck, Gift, Crown, User, ChartLineUp, type Icon } from '@phosphor-icons/react'
import { useStore } from './store'
import { LogoMark, Wordmark } from './ui'

const TABS: [string, string, Icon][] = [['/', 'Início', House], ['/notificacoes', 'Notificações', Bell], ['/oficinas', 'Serviços', Wrench], ['/menu', 'Menu', List]]
const SIDE: [string, string, Icon][] = [
  ['/', 'Início', House], ['/veiculos', 'Meus veículos', Car], ['/oficinas', 'Oficinas e serviços', Wrench],
  ['/agendamentos', 'Agendamentos', CalendarCheck], ['/beneficios', 'Benefícios', Gift], ['/notificacoes', 'Notificações', Bell],
  ['/plano', 'Meu plano', Crown], ['/perfil', 'Perfil', User],
]
// Telas de fluxo (sem barra inferior no celular)
const FLOW = ['/agendar', '/pagamento', '/veiculos/novo']

export function AppShell() {
  const { pathname } = useLocation()
  const unread = useStore(s => s.notices.filter(n => !n.read).length)
  const user = useStore(s => s.user)
  const plan = useStore(s => s.plan)
  const hideTabs = FLOW.some(f => pathname.startsWith(f)) || /^\/oficinas\/[^/]+/.test(pathname)
  const tabActive = (to: string) => to === '/' ? pathname === '/' || pathname.startsWith('/veiculos') : to === '/oficinas' ? ['/oficinas', '/agendar', '/pagamento', '/agendamentos'].some(p => pathname.startsWith(p)) : to === '/menu' ? ['/menu', '/plano', '/perfil', '/beneficios'].some(p => pathname.startsWith(p)) : pathname.startsWith(to)

  return (
    <div className="min-h-screen lg:flex">
      {/* Barra lateral (web) */}
      <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col border-r border-line bg-white px-4 py-6 lg:flex">
        <div className="mb-8 flex items-center gap-2.5 px-3 text-royal"><LogoMark size={30} /><Wordmark className="text-xl text-slate" /></div>
        <nav className="flex flex-1 flex-col gap-1" aria-label="Principal">
          {SIDE.map(([to, label, Ic]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] font-medium transition ${isActive ? 'bg-mist font-semibold text-royal' : 'text-muted hover:bg-mist/60 hover:text-slate'}`}>
              {({ isActive }) => <><Ic size={22} weight={isActive ? 'fill' : 'regular'} />{label}{to === '/notificacoes' && unread > 0 && <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-lime px-1.5 text-[11px] font-bold text-ink">{unread}</span>}</>}
            </NavLink>
          ))}
        </nav>
        <div className="rounded-3xl bg-navy p-4 text-white">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-white/80 text-sm font-bold">{user.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</span>
            <div className="min-w-0"><p className="truncate font-semibold">{user.name}</p><p className="text-xs text-white/70">Assinante {plan[0].toUpperCase() + plan.slice(1)}</p></div>
          </div>
          <NavLink to="/admin" className="mt-3 flex items-center justify-center gap-2 rounded-full bg-white/10 py-2 text-[13px] font-semibold hover:bg-white/20"><ChartLineUp size={16} />Painel admin</NavLink>
        </div>
      </aside>

      <main className={`min-w-0 flex-1 ${hideTabs ? 'pb-8' : 'pb-28'} lg:px-10 lg:py-8 lg:pb-12`}>
        <div className="mx-auto w-full max-w-[1180px]"><Outlet /></div>
      </main>

      {/* Barra inferior (app) */}
      {!hideTabs && (
        <nav aria-label="Principal" className="pb-safe fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-white/95 pt-2 backdrop-blur lg:hidden">
          {TABS.map(([to, label, Ic]) => {
            const on = tabActive(to)
            return (
              <NavLink key={to} to={to} className={`relative flex flex-col items-center gap-0.5 text-[11px] ${on ? 'font-bold text-leaf' : 'font-medium text-muted'}`}>
                <Ic size={25} weight={on ? 'fill' : 'regular'} className={on ? 'text-lime' : ''} />{label}
                {to === '/notificacoes' && unread > 0 && <span className="absolute right-[calc(50%-18px)] top-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-lime" />}
              </NavLink>
            )
          })}
        </nav>
      )}
    </div>
  )
}
