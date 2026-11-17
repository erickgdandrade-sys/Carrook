import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useStore } from './store'
import { AppShell } from './shell'
import { Welcome, SignIn, SignUp } from './screens/auth'
import { Home } from './screens/home'
import { Garage, VehicleDetail, AddVehicle } from './screens/vehicles'
import { Shops, ShopDetail, Schedule, Checkout } from './screens/shops'
import { Bookings, BookingDetail } from './screens/bookings'
import { Notices, Benefits, PlanPage, Menu, Profile } from './screens/account'
import { AdminShell, AdminDashboard, AdminBookings, AdminShops, AdminSubscribers, AdminPlans } from './screens/admin'
import { Landing, Terms, Privacy, ForgotPassword, Referral, BlogPost, RoleGate, ShopShell, ShopAgenda, ShopService, ShopHours, ShopPayouts } from './screens/extra'
import { Toast } from './ui'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}
function Private({ children }: { children: JSX.Element }) {
  const signed = useStore(s => s.signedIn)
  return signed ? children : <Navigate to={window.innerWidth >= 1024 ? '/site' : '/bem-vindo'} replace />
}
function ThemeSync() {
  const theme = useStore(s => s.theme)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && mq.matches))
    apply(); mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])
  return null
}

export default function App() {
  return (
    <HashRouter>
      <ScrollTop />
      <ThemeSync />
      <Routes>
        <Route path="/bem-vindo" element={<Welcome />} />
        <Route path="/entrar" element={<SignIn />} />
        <Route path="/cadastro" element={<SignUp />} />
        <Route path="/recuperar-senha" element={<ForgotPassword />} />
        <Route path="/site" element={<Landing />} />
        <Route path="/termos" element={<Terms />} />
        <Route path="/privacidade" element={<Privacy />} />
        <Route path="/oficina" element={<ShopShell />}>
          <Route index element={<ShopAgenda />} />
          <Route path="servico/:id" element={<ShopService />} />
          <Route path="horarios" element={<ShopHours />} />
          <Route path="repasses" element={<ShopPayouts />} />
        </Route>
        <Route element={<Private><AppShell /></Private>}>
          <Route index element={<Home />} />
          <Route path="veiculos" element={<Garage />} />
          <Route path="veiculos/novo" element={<AddVehicle />} />
          <Route path="veiculos/:id" element={<VehicleDetail />} />
          <Route path="oficinas" element={<Shops />} />
          <Route path="oficinas/:id" element={<ShopDetail />} />
          <Route path="agendar/:shopId" element={<Schedule />} />
          <Route path="pagamento" element={<Checkout />} />
          <Route path="agendamentos" element={<Bookings />} />
          <Route path="agendamentos/:id" element={<BookingDetail />} />
          <Route path="notificacoes" element={<Notices />} />
          <Route path="beneficios" element={<Benefits />} />
          <Route path="plano" element={<PlanPage />} />
          <Route path="menu" element={<Menu />} />
          <Route path="perfil" element={<Profile />} />
          <Route path="indique" element={<Referral />} />
          <Route path="blog/:id" element={<BlogPost />} />
        </Route>
        <Route path="/admin" element={<RoleGate need="admin"><AdminShell /></RoleGate>}>
          <Route index element={<AdminDashboard />} />
          <Route path="agendamentos" element={<AdminBookings />} />
          <Route path="oficinas" element={<AdminShops />} />
          <Route path="assinantes" element={<AdminSubscribers />} />
          <Route path="planos" element={<AdminPlans />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </HashRouter>
  )
}
