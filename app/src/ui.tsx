import { type ReactNode, type ButtonHTMLAttributes } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CaretLeft, Drop, Wind, SteeringWheel, Disc, Thermometer, BatteryCharging, Gear, Wrench, Pulse, Star, SealCheck,
  type Icon,
} from '@phosphor-icons/react'
import type { ItemKey, ServiceKey } from './data'
import { useStore, type Level } from './store'

/* ---------- Marca ---------- */
export const LogoMark = ({ size = 28, color = 'currentColor', className = '' }: { size?: number; color?: string; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className={className}>
    <path fill={color} d="M42 18A40 40 0 1 0 82 58H63A21 21 0 1 1 42 37Z" />
    <path fill={color} d="M52 18H82V47.7H63.5V36.8H52Z" />
  </svg>
)
export const Wordmark = ({ className = '' }: { className?: string }) => (
  <span className={`font-extrabold tracking-[.02em] ${className}`}>CARROOK</span>
)
/** Padrão gráfico da IDV: o símbolo girando em 4 posições */
export const BrandPattern = ({ className = '', color = '#fff', opacity = 0.1 }: { className?: string; color?: string; opacity?: number }) => (
  <svg className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
    <defs>
      <pattern id="ck-pat" width="120" height="120" patternUnits="userSpaceOnUse">
        {[0, 90, 180, 270].map((r, i) => (
          <g key={r} transform={`translate(${(i % 2) * 60 + 10} ${Math.floor(i / 2) * 60 + 10}) rotate(${r} 20 20) scale(.4)`} opacity={i % 2 ? opacity * 0.5 : opacity}>
            <path fill={color} d="M42 18A40 40 0 1 0 82 58H63A21 21 0 1 1 42 37Z" /><path fill={color} d="M52 18H82V47.7H63.5V36.8H52Z" />
          </g>
        ))}
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#ck-pat)" />
  </svg>
)

/* ---------- Placa Mercosul ---------- */
export const Plate = ({ plate, size = 'md' }: { plate: string; size?: 'sm' | 'md' | 'lg' }) => {
  const s = { sm: 'w-[78px] text-[13px]', md: 'w-[96px] text-[16px]', lg: 'w-[132px] text-[22px]' }[size]
  return (
    <span className={`inline-flex flex-col overflow-hidden rounded-[5px] border border-[#151A3B]/25 bg-white leading-none shadow-sm ${s}`}>
      <span className="flex items-center justify-between bg-royal px-1.5 py-[2px] text-[6.5px] font-semibold tracking-[.18em] text-white">
        <span>BRASIL</span><span className="h-[5px] w-[8px] rounded-[1px] bg-lime" />
      </span>
      <span className="py-[3px] text-center font-bold tracking-[.08em] text-[#151A3B]" style={{ fontVariantNumeric: 'tabular-nums' }}>{plate.toUpperCase()}</span>
    </span>
  )
}

/* ---------- Hodômetro ---------- */
export const Odometer = ({ value, dark = false }: { value: number; dark?: boolean }) => {
  const digits = Math.round(value).toString().padStart(6, '0').split('')
  return (
    <span className="inline-flex items-end gap-1" aria-label={`${Math.round(value).toLocaleString('pt-BR')} quilômetros`}>
      <span className="inline-flex gap-[2px]">
        {digits.map((d, i) => (
          <span key={i} className={`grid h-7 w-[19px] place-items-center rounded-[5px] text-[15px] font-semibold tabular-nums ${dark ? 'bg-white/15 text-white' : 'bg-slate text-white'} ${i === digits.length - 1 ? '!bg-lime !text-ink' : ''}`}>{d}</span>
        ))}
      </span>
      <span className={`pb-0.5 text-xs font-semibold ${dark ? 'text-white/70' : 'text-muted'}`}>km</span>
    </span>
  )
}

/* ---------- Medidor de saúde (velocímetro) ---------- */
export const Gauge = ({ score, size = 132, light = true }: { score: number; size?: number; light?: boolean }) => {
  const r = 52, c = Math.PI * r
  const color = score >= 75 ? '#41D92A' : score >= 50 ? '#F2A516' : '#E5484D'
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 132 82" role="img" aria-label={`Saúde ${score} de 100`}>
      {Array.from({ length: 11 }).map((_, i) => {
        const a = Math.PI - (i / 10) * Math.PI
        const x1 = 66 + Math.cos(a) * 62, y1 = 70 - Math.sin(a) * 62, x2 = 66 + Math.cos(a) * (i % 5 ? 58 : 55), y2 = 70 - Math.sin(a) * (i % 5 ? 58 : 55)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={light ? 'rgba(255,255,255,.45)' : '#C3C8DE'} strokeWidth="1.6" strokeLinecap="round" />
      })}
      <path d="M14 70a52 52 0 0 1 104 0" fill="none" stroke={light ? 'rgba(255,255,255,.16)' : '#E6E9F5'} strokeWidth="10" strokeLinecap="round" />
      <path d="M14 70a52 52 0 0 1 104 0" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(score / 100) * c} ${c}`} />
      <text x="66" y="66" textAnchor="middle" fontSize="30" fontWeight="800" fill={light ? '#fff' : '#151A3B'} fontFamily="Outfit, sans-serif">{score}</text>
    </svg>
  )
}

/* ---------- Botões ---------- */
type BtnKind = 'lime' | 'royal' | 'ghost' | 'outline' | 'dark' | 'white' | 'line'
export function Btn({ kind = 'lime', size = 'md', className = '', children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { kind?: BtnKind; size?: 'sm' | 'md' | 'lg' }) {
  const k: Record<BtnKind, string> = {
    lime: 'bg-lime text-ink hover:brightness-95',
    royal: 'bg-royal text-white hover:bg-[#1a4bcb]',
    ghost: 'bg-mist text-fg hover:bg-line',
    outline: 'border-[1.5px] border-white/80 text-white hover:bg-white/10',
    dark: 'bg-slate text-white hover:bg-black',
    white: 'bg-white text-navy hover:bg-[#F9FDFF]',
    line: 'border-[1.5px] border-line bg-surface text-fg hover:border-royal',
  }
  const s = { sm: 'h-8 px-3.5 text-[13px]', md: 'h-11 px-5 text-[15px]', lg: 'h-14 px-6 text-base' }[size]
  return <button className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${k[kind]} ${s} ${className}`} {...rest}>{children}</button>
}

export const Stars = ({ value, size = 13 }: { value: number; size?: number }) => (
  <span className="inline-flex items-center gap-[1px]" aria-label={`${value} estrelas`}>
    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={size} weight="fill" className={i <= Math.round(value) ? 'text-amber' : 'text-line'} />)}
  </span>
)
export const Seal = ({ size = 16 }: { size?: number }) => <SealCheck size={size} weight="fill" className="shrink-0 text-royal" aria-label="Parceiro certificado Carrook" />

/* ---------- Ícones por item / serviço ---------- */
export const ITEM_ICON: Record<ItemKey, Icon> = { oleo: Drop, filtroAr: Wind, pneus: SteeringWheel, freios: Disc, arrefecimento: Thermometer, bateria: BatteryCharging, correia: Gear }
export const SERVICE_ICON: Record<ServiceKey, Icon> = { revisao: Wrench, oleo: Drop, freios: Disc, alinhamento: SteeringWheel, bateria: BatteryCharging, arrefecimento: Thermometer, correia: Gear, diagnostico: Pulse }
export const LEVEL: Record<Level, { label: string; text: string; bg: string; bar: string }> = {
  ok: { label: 'Em dia', text: 'text-ok', bg: 'bg-lime/15', bar: 'bg-lime' },
  soon: { label: 'Em breve', text: 'text-[#9A6200]', bg: 'bg-amber/15', bar: 'bg-amber' },
  late: { label: 'Atrasado', text: 'text-danger', bg: 'bg-danger/10', bar: 'bg-danger' },
}

/* ---------- Cabeçalho de subpágina ---------- */
export function PageHead({ title, sub, back = true, right }: { title: string; sub?: string; back?: boolean; right?: ReactNode }) {
  const nav = useNavigate()
  return (
    <header className="flex items-center gap-3 px-5 pb-4 pt-3 lg:px-0 lg:pb-6 lg:pt-0">
      {back && (
        <button onClick={() => nav(-1)} aria-label="Voltar" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface text-fg shadow-soft lg:hidden">
          <CaretLeft size={20} weight="bold" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="text-[22px] font-bold leading-tight text-fg lg:text-[34px] lg:font-extrabold">{title}</h1>
        {sub && <p className="mt-0.5 text-sm text-muted lg:text-base">{sub}</p>}
      </div>
      {right}
    </header>
  )
}

export const Section = ({ title, action, children, className = '' }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) => (
  <section className={className}>
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="text-[15px] font-semibold text-fg lg:text-lg">{title}</h2>
      {action}
    </div>
    {children}
  </section>
)

export function Toast() {
  const toast = useStore(s => s.toast)
  if (!toast) return null
  return (
    <div role="status" className="fixed inset-x-4 bottom-[92px] z-50 mx-auto flex max-w-sm animate-[rise_.25s_ease] items-center gap-3 rounded-2xl bg-slate px-4 py-3 text-sm text-white shadow-float lg:bottom-8">
      <LogoMark size={18} color="#41D92A" />{toast}
    </div>
  )
}

export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) => new Date(iso).toLocaleDateString('pt-BR', opts).replace('.', '')
