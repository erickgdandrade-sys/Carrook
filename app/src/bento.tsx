import { useState, type ReactNode } from 'react'
import { Sparkle, Check, CaretDown, Lightning } from '@phosphor-icons/react'
import { PLANS, type PlanId } from './data'
import { brl, useStore } from './store'

/* Blocos grandes no estilo "bento": rótulo com ícone, título forte, texto curto e uma mini interface dentro */
export type Tone = 'navy' | 'lime' | 'violet' | 'royal' | 'plain'
const TONE: Record<Tone, { box: string; eyebrow: string; desc: string }> = {
  navy: { box: 'bg-navy text-white', eyebrow: 'text-lime', desc: 'text-white/75' },
  lime: { box: 'bg-lime text-ink', eyebrow: 'text-ink', desc: 'text-ink/70' },
  violet: { box: 'bg-violet text-white', eyebrow: 'text-white', desc: 'text-white/80' },
  royal: { box: 'bg-royal text-white', eyebrow: 'text-lime', desc: 'text-white/80' },
  plain: { box: 'bg-surface text-fg', eyebrow: 'text-royal', desc: 'text-muted' },
}

export function Bento({ tone, eyebrow, title, desc, children, className = '', aside }: { tone: Tone; eyebrow: string; title: ReactNode; desc?: ReactNode; children?: ReactNode; className?: string; aside?: ReactNode }) {
  const t = TONE[tone]
  return (
    <section className={`relative overflow-hidden rounded-[28px] p-5 sm:p-6 lg:p-7 ${t.box} ${className}`}>
      <div className={aside ? 'lg:grid lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:items-end lg:gap-8' : ''}>
        <div>
          <p className={`flex items-center gap-1.5 text-[13px] font-semibold ${t.eyebrow}`}><Sparkle size={15} weight="fill" />{eyebrow}</p>
          <h2 className="mt-2 text-[26px] font-bold leading-[1.1] tracking-[-.01em] lg:text-[32px]">{title}</h2>
          {desc && <p className={`mt-2 max-w-md text-[14px] leading-relaxed ${t.desc}`}>{desc}</p>}
        </div>
        {aside && <div className="mt-5 lg:mt-0">{aside}</div>}
      </div>
      {children && <div className="mt-5">{children}</div>}
    </section>
  )
}

/* Card branco interno */
export const Mini = ({ title, right, children, className = '' }: { title?: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) => (
  <div className={`min-w-0 rounded-[20px] bg-surface p-4 text-fg shadow-[0_1px_0_rgba(0,0,0,.04)] ${className}`}>
    {title && <div className="mb-1 flex items-center justify-between gap-2"><h3 className="text-[15px] font-semibold">{title}</h3>{right}</div>}
    {children}
  </div>
)

/* Linha de lista: avatar, nome + subtítulo, duas linhas à direita */
export const Row = ({ avatar, name, sub, top, bottom, accent }: { avatar: ReactNode; name: ReactNode; sub: ReactNode; top?: ReactNode; bottom?: ReactNode; accent?: string }) => (
  <div className="flex items-center gap-3 border-b border-line py-3 last:border-0 last:pb-0">
    <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-mist">{avatar}</span>
    <span className="min-w-0 flex-1"><b className="block truncate text-[14px] font-semibold">{name}</b><span className="block truncate text-[12px] text-muted">{sub}</span></span>
    {(top || bottom) && <span className="shrink-0 text-right text-[12px] leading-[1.5]"><span className="block text-muted">{top}</span><b className={`block font-semibold ${accent ?? ''}`}>{bottom}</b></span>}
  </div>
)

/* Campo de formulário "falso" (visual de select) */
export const Field = ({ label, children, caret }: { label: string; children: ReactNode; caret?: boolean }) => (
  <div className="mt-3">
    <span className="mb-1.5 block text-[12px] text-muted">{label}</span>
    <span className="flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-[14px] font-medium">{children}<span className="flex-1" />{caret && <CaretDown size={14} className="text-muted" />}</span>
  </div>
)

export const Pill = ({ children, on }: { children: ReactNode; on?: boolean }) => (
  <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${on ? 'bg-royal text-white' : 'bg-lime/70 text-ink'}`}>{children}</span>
)

/* Gráfico de barras simples, escalado pelo maior valor */
export function Bars({ data, highlight }: { data: { label: string; value: number }[]; highlight?: number }) {
  const max = Math.max(...data.map(d => d.value), 1)
  const hi = highlight ?? data.length - 1
  return (
    <div className="mt-4 flex h-[120px] items-end gap-2" role="img" aria-label={data.map(d => `${d.label}: ${brl(d.value)}`).join(', ')}>
      {data.map((d, i) => (
        <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
          {i === hi && <span className="text-[11px] font-semibold tabular-nums text-muted">{brl(d.value).replace(',00', '')}</span>}
          <span className={`w-full rounded-t-[8px] ${i === hi ? 'bg-lime' : 'bg-slate dark:bg-[#3A4170]'}`} style={{ height: `${Math.max(6, (d.value / max) * 100)}%` }} />
          <span className="text-[11px] text-muted">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ---------- Planos: chave mensal/anual + 3 cards ---------- */
const YEARLY_OFF = 0.15
export function PricingCards({ cta, current }: { cta: (id: PlanId, dark: boolean) => ReactNode; current?: PlanId }) {
  const prices = useStore(s => s.planPrices)
  const limits = useStore(s => s.planLimits)
  const [yearly, setYearly] = useState(false)
  return (
    <div>
      <div className="mb-6 flex items-center justify-end gap-3 text-[14px] font-medium">
        <span className={yearly ? 'text-muted' : ''}>Mensal</span>
        <button role="switch" aria-checked={yearly} aria-label="Cobrança anual" onClick={() => setYearly(!yearly)} className={`relative h-7 w-12 rounded-full transition ${yearly ? 'bg-royal' : 'bg-slate dark:bg-[#3A4170]'}`}>
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${yearly ? 'left-6' : 'left-1'}`} />
        </button>
        <span className={yearly ? '' : 'text-muted'}>Anual <small className="block text-[11px] font-semibold text-ok">economize 15%</small></span>
      </div>
      <div className="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 pt-1 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
        {PLANS.map(p => {
          const dark = !p.popular
          const price = prices[p.id] * (yearly ? 1 - YEARLY_OFF : 1)
          const line = dark ? 'border-white/20' : 'border-fg/80'
          return (
            <article key={p.id} className={`flex w-[290px] shrink-0 snap-center flex-col rounded-[24px] p-6 lg:w-auto ${dark ? 'bg-navy text-white' : 'bg-surface text-fg ring-1 ring-line'} ${current === p.id ? 'outline outline-[3px] outline-offset-2 outline-lime' : ''}`}>
              <h3 className="text-[22px] font-bold">{p.name}</h3>
              <p className={`mt-1 min-h-[40px] text-[13px] leading-snug ${dark ? 'text-lime' : 'text-muted'}`}>{p.tagline}</p>
              <hr className={`my-5 ${line}`} />
              <ul className="grid flex-1 content-start gap-3 text-[14px]">
                {[...p.perks, `Até ${limits[p.id]} ${limits[p.id] > 1 ? 'veículos' : 'veículo'}`].map(x => <li key={x} className="flex gap-2.5"><Check size={16} weight="bold" className={`mt-0.5 shrink-0 ${dark ? 'text-lime' : 'text-ok'}`} />{x}</li>)}
              </ul>
              <hr className={`my-5 ${line}`} />
              <div className="flex items-end justify-between gap-2">
                <p className="flex items-end gap-1.5"><span className="text-[38px] font-extrabold leading-none tabular-nums">{brl(price).replace(',00', '')}</span>
                  <span className={`pb-1 text-[11px] leading-tight ${dark ? 'text-white/70' : 'text-muted'}`}>/por mês<br />{yearly ? `${brl(price * 12).replace(',00', '')} no ano` : 'sem fidelidade'}</span></p>
                {p.popular && <span className="flex items-center gap-1 rounded-full bg-slate px-3 py-1.5 text-[12px] font-bold text-white dark:bg-lime dark:text-ink"><Lightning size={13} weight="fill" className="text-lime dark:text-ink" />Popular</span>}
              </div>
              <div className="mt-6">{cta(p.id, dark)}</div>
            </article>)
        })}
      </div>
    </div>
  )
}
