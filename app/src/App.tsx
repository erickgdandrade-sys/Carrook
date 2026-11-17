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
import { Toast } from './ui'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}
function Private({ children }: { children: JSX.Element }) {
  const signed = useStore(s => s.signedIn)
  return signed ? children : <Navigate to="/bem-vindo" replace />
}

export default function App() {
  return (
    <HashRouter>
      <ScrollTop />
      <Routes>
        <Route path="/bem-vindo" element={<Welcome />} />
        <Route path="/entrar" element={<SignIn />} />
        <Route path="/cadastro" element={<SignUp />} />
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
        </Route>
        <Route path="/admin" element={<AdminShell />}>
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
