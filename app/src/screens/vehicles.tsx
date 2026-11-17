import { Fragment, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Car, Lightning, Plus, Trash, CaretRight, CaretLeft, CheckCircle, Path } from '@phosphor-icons/react'
import { CATALOG, MODEL_PLANS, PLANS, SERVICES, lookupPlate } from '../data'
import { currentKm, daysSince, fmtKm, healthScore, itemStates, useStore } from '../store'
import { Btn, Gauge, ITEM_ICON, LEVEL, Odometer, PageHead, Plate, Section, fmtDate } from '../ui'

export function Garage() {
  const s = useStore()
  const limit = s.planLimits[s.plan]
  const plan = PLANS.find(p => p.id === s.plan)!
  const full = s.vehicles.length >= limit
  return (
    <div>
      <PageHead title="Meus veículos" sub={`${s.vehicles.length} de ${limit} no ${plan.name}`} />
      <div className="grid gap-4 px-5 lg:grid-cols-2 lg:px-0">
        {s.vehicles.map(v => {
          const score = healthScore(v, s.autoKm)
          return (
            <Link key={v.id} to={`/veiculos/${v.id}`} className="group overflow-hidden rounded-3xl bg-surface">
              <div className="relative">
                <img src={v.photo} alt="" className="aspect-[2/1] w-full object-cover transition group-hover:scale-[1.02]" />
                <span className="absolute left-3 top-3"><Plate plate={v.plate} size="sm" /></span>
                {v.id === s.activeVehicle && <span className="absolute right-3 top-3 rounded-full bg-lime px-2.5 py-1 text-[11px] font-bold">No início</span>}
              </div>
              <div className="flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1"><b className="block text-lg">{v.brand} {v.model} <span className="font-normal text-muted">{v.year}</span></b><span className="text-sm text-muted">{fmtKm(currentKm(v, s.autoKm))} · saúde {score}</span></div>
                <CaretRight size={20} className="text-muted" />
              </div>
            </Link>)
        })}
        {full ? (
          <div className="grid place-items-center rounded-3xl border-2 border-dashed border-line p-6 text-center">
            <p className="font-semibold">Seu plano chegou ao limite de veículos.</p>
            <Link to="/plano" className="mt-2 font-semibold text-royal">Ver planos com mais veículos</Link>
          </div>
        ) : (
          <Link to="/veiculos/novo" className="grid min-h-[180px] place-items-center rounded-3xl border-2 border-dashed border-line text-center text-muted hover:border-royal hover:text-royal">
            <span><Plus size={28} className="mx-auto" /><b className="mt-2 block">Adicionar veículo</b></span>
          </Link>
        )}
      </div>
    </div>
  )
}

export function VehicleDetail() {
  const { id } = useParams()
  const s = useStore()
  const nav = useNavigate()
  const v = s.vehicles.find(x => x.id === id)
  const [km, setKm] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [edit, setEdit] = useState(false)
  if (!v) return <PageHead title="Veículo não encontrado" />
  const cur = currentKm(v, s.autoKm)
  const states = itemStates(v, s.autoKm)
  const road = [...states].sort((a, b) => a.dueKm - b.dueKm)
  const carAt = road.findIndex(r => r.dueKm > cur)
  const history = s.bookings.filter(b => b.vehicleId === v.id && b.status === 'concluido')

  const save = () => {
    const n = parseInt(km.replace(/\D/g, ''))
    if (!n || n < v.km - 50) { s.say('Digite o número que aparece no painel do carro.'); return }
    s.updateKm(v.id, n); setKm(''); s.say('Quilometragem atualizada')
  }

  return (
    <div>
      {/* Foto em destaque */}
      <div className="relative h-[300px] overflow-hidden lg:h-[340px] lg:rounded-4xl">
        <img src={v.photo} alt={`${v.brand} ${v.model}`} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate via-slate/20 to-slate/30" />
        <button onClick={() => nav(-1)} aria-label="Voltar" className="absolute left-5 top-[max(16px,env(safe-area-inset-top))] grid h-10 w-10 place-items-center rounded-full bg-white/90 text-[#151A3B] lg:hidden"><CaretLeft size={20} weight="bold" /></button>
        <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 text-white lg:inset-x-8 lg:bottom-7">
          <div className="min-w-0"><p className="text-sm text-white/75">{v.nickname ?? v.brand} · {v.year}</p><h1 className="text-[32px] font-extrabold leading-none lg:text-[44px]">{v.brand} {v.model}</h1><div className="mt-3"><Plate plate={v.plate} /></div></div>
          <div className="hidden shrink-0 sm:block"><Gauge score={healthScore(v, s.autoKm)} size={130} /></div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 px-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-0">
        {/* Estrada da manutenção */}
        <Section title="Estrada da manutenção" action={<span className="text-xs text-muted">o que vencer primeiro: km ou tempo</span>}>
          <p className="mb-3 flex items-center gap-2 rounded-2xl bg-surface px-4 py-2.5 text-xs text-muted"><CheckCircle size={16} weight="fill" className="shrink-0 text-royal" />{MODEL_PLANS[`${v.brand} ${v.model}`]?.source ?? 'Intervalos padrão de mercado. Confira o manual do seu carro.'}</p>
          <ol className="relative rounded-3xl bg-surface p-4 pl-[74px]">
            <span aria-hidden className="absolute bottom-4 left-6 top-4 w-9 rounded-full bg-slate dark:bg-[#2C335F]">
              <span className="absolute inset-y-3 left-1/2 w-[3px] -translate-x-1/2 bg-[repeating-linear-gradient(to_bottom,#41D92A_0_10px,transparent_10px_20px)]" />
            </span>
            {road.map((it, i) => {
              const Ic = ITEM_ICON[it.key], L = LEVEL[it.level]
              return (
                <Fragment key={it.key}>
                  {i === carAt && <CarMarker km={cur} />}
                  <li className="relative flex items-center gap-3 py-3">
                    <span className={`absolute -left-[57px] grid h-8 w-8 place-items-center rounded-full border-[3px] border-slate ${it.level === 'late' ? 'bg-danger text-white' : it.level === 'soon' ? 'bg-amber text-ink' : 'bg-surface text-fg'}`}><Ic size={15} weight="bold" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold tabular-nums text-muted">{fmtKm(it.dueKm)}</p>
                      <b className="block text-[15px] font-semibold">{it.name}</b>
                      <span className={`text-xs font-semibold ${L.text}`}>{it.level === 'late' ? `Atrasado (por ${it.by})` : it.level === 'soon' ? 'Vence em breve' : `Em dia · faltam ${fmtKm(it.kmLeft)}`}</span>
                    </div>
                    {it.level !== 'ok' && <Btn size="sm" kind={it.level === 'late' ? 'lime' : 'ghost'} onClick={() => nav(`/oficinas?servico=${it.service}`)}>Agendar</Btn>}
                  </li>
                </Fragment>)
            })}
            {carAt === -1 && <CarMarker km={cur} />}
          </ol>
        </Section>

        <div className="grid content-start gap-5">
          {/* Quilometragem */}
          <section className="rounded-3xl bg-surface p-5">
            <p className="text-[13px] font-semibold uppercase tracking-[.1em] text-muted">Hodômetro</p>
            <div className="mt-2"><Odometer value={cur} /></div>
            <p className="mt-2 text-sm text-muted">{s.autoKm ? `Informado há ${daysSince(v.kmUpdatedAt)} dias + estimativa de ${v.avgKmDay} km/dia pelos seus deslocamentos.` : `Informado ${fmtDate(v.kmUpdatedAt, { day: 'numeric', month: 'long' })}.`}</p>
            <div className="mt-4 flex gap-2">
              <input id="km-input" className="field" inputMode="numeric" placeholder={`Ex.: ${Math.round(cur)}`} value={km} onChange={e => setKm(e.target.value)} aria-label="Quilometragem do painel" />
              <Btn kind="royal" onClick={save} className="shrink-0">Salvar</Btn>
            </div>
            <button role="switch" aria-checked={s.autoKm} onClick={() => s.set({ autoKm: !s.autoKm })} className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-mist p-3 text-left">
              <Lightning size={22} weight="fill" className="shrink-0 text-royal" />
              <span className="flex-1 text-sm"><b className="block">Estimar automaticamente</b><span className="text-muted">Usa a detecção de deslocamento de carro do celular.</span></span>
              <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${s.autoKm ? 'bg-lime' : 'bg-line'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-surface shadow transition-all ${s.autoKm ? 'left-6' : 'left-1'}`} /></span>
            </button>
          </section>

          <Section title="Histórico">
            <div className="card divide-y divide-line">
              {history.length ? history.map(b => (
                <Link key={b.id} to={`/agendamentos/${b.id}`} className="flex items-center gap-3 p-4">
                  <CheckCircle size={22} weight="fill" className="shrink-0 text-ok" />
                  <span className="min-w-0 flex-1"><b className="block truncate text-sm">{SERVICES[b.service].name}</b><span className="text-xs text-muted">{fmtDate(b.date, { day: 'numeric', month: 'short', year: 'numeric' })} · {s.shops.find(x => x.id === b.shopId)?.name}</span></span>
                </Link>)) : <p className="p-4 text-sm text-muted">Os serviços feitos pela Carrook aparecem aqui, com laudo.</p>}
            </div>
          </Section>

          {edit ? <EditVehicle id={v.id} onDone={() => setEdit(false)} /> : <Btn kind="line" onClick={() => setEdit(true)}>Editar dados do veículo</Btn>}
          {s.vehicles.length > 1 && (confirm ? (
            <div className="rounded-3xl bg-danger/10 p-4 text-sm">
              <p className="font-semibold text-danger">Remover {v.model} da sua conta?</p>
              <div className="mt-3 flex gap-2"><Btn size="sm" kind="dark" onClick={() => { s.removeVehicle(v.id); s.say('Veículo removido'); nav('/veiculos') }}>Remover</Btn><Btn size="sm" kind="ghost" onClick={() => setConfirm(false)}>Cancelar</Btn></div>
            </div>
          ) : <button onClick={() => setConfirm(true)} className="flex items-center gap-2 text-sm font-semibold text-danger"><Trash size={16} />Remover veículo</button>)}
        </div>
      </div>
    </div>
  )
}

const CarMarker = ({ km }: { km: number }) => (
  <li className="relative my-1 flex items-center gap-3 rounded-2xl bg-royal px-3 py-2.5 text-white">
    <span className="absolute -left-[60px] grid h-9 w-9 place-items-center rounded-full bg-lime text-ink ring-4 ring-surface"><Car size={18} weight="fill" /></span>
    <Path size={18} /><span className="text-sm"><b>Você está aqui</b> · {fmtKm(km)}</span>
  </li>
)

export function AddVehicle() {
  const s = useStore()
  const nav = useNavigate()
  const limit = s.planLimits[s.plan]
  const [d, setD] = useState({ plate: '', car: 0, year: '2021', km: '', nickname: '' })
  const [found, setFound] = useState<string>()
  if (s.vehicles.length >= limit) return (
    <div><PageHead title="Adicionar veículo" />
      <div className="mx-5 rounded-3xl bg-surface p-6 text-center lg:mx-0"><p className="font-semibold">Seu plano cobre até {limit} {limit > 1 ? 'veículos' : 'veículo'}.</p><Btn className="mt-4" onClick={() => nav('/plano')}>Ver planos</Btn></div></div>)
  const add = () => {
    const plate = d.plate.replace(/\W/g, '').toUpperCase(), km = parseInt(d.km.replace(/\D/g, ''))
    if (plate.length !== 7 || !km) { s.say('Preencha a placa (7 caracteres) e a quilometragem.'); return }
    const c = CATALOG[d.car]
    const id = s.addVehicle({ brand: c.brand, model: c.model, year: +d.year, plate, photo: c.photo, km, nickname: d.nickname || undefined })
    s.say(`${c.model} adicionado`); nav(`/veiculos/${id}`)
  }
  return (
    <div className="lg:max-w-2xl">
      <PageHead title="Adicionar veículo" sub={`${s.vehicles.length} de ${limit} usados no seu plano`} />
      <div className="grid gap-4 px-5 lg:px-0">
        <div className="grid place-items-center rounded-3xl bg-surface py-6"><Plate plate={(d.plate || 'ABC1D23').replace(/\W/g, '').slice(0, 7)} size="lg" /></div>
        <div><span className="label">Placa</span>
          <div className="flex gap-2"><input id="av-plate" className="field uppercase tracking-[.2em]" maxLength={8} value={d.plate} onChange={e => { setD({ ...d, plate: e.target.value }); setFound(undefined) }} placeholder="ABC1D23" aria-label="Placa" />
            <Btn kind="royal" className="h-12 shrink-0" disabled={d.plate.replace(/\W/g, '').length !== 7 || found === '…'} onClick={() => { setFound('…'); setTimeout(() => { const r = lookupPlate(d.plate); if (r) { setD(x => ({ ...x, car: r.index, year: String(r.year) })); setFound(`${r.brand} ${r.model} ${r.year}, cor ${r.color.toLowerCase()}`) } }, 900) }}>{found === '…' ? 'Buscando…' : 'Consultar'}</Btn></div>
          {found && found !== '…' && <p className="mt-2 rounded-2xl bg-lime/15 px-3 py-2 text-sm">Encontramos: <b>{found}</b>. Confira abaixo.</p>}
        </div>
        <div><span className="label">Modelo</span>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{CATALOG.map((c, i) => (
            <button key={i} onClick={() => setD({ ...d, car: i })} aria-pressed={d.car === i} className={`overflow-hidden rounded-2xl border-2 bg-surface text-left ${d.car === i ? 'border-royal' : 'border-transparent'}`}>
              <img src={c.photo} alt="" className="h-20 w-full object-cover" /><span className="block px-3 py-2 text-[13px]"><b>{c.model}</b> <span className="text-muted">{c.brand}</span></span></button>))}</div></div>
        <div className="grid grid-cols-2 gap-3">
          <label><span className="label">Ano</span><select id="av-year" className="field" value={d.year} onChange={e => setD({ ...d, year: e.target.value })}>{Array.from({ length: 16 }, (_, i) => 2026 - i).map(y => <option key={y}>{y}</option>)}</select></label>
          <label><span className="label">Km no painel</span><input id="av-km" className="field" inputMode="numeric" value={d.km} onChange={e => setD({ ...d, km: e.target.value })} placeholder="32000" /></label>
        </div>
        <label><span className="label">Apelido (opcional)</span><input id="av-nick" className="field" value={d.nickname} onChange={e => setD({ ...d, nickname: e.target.value })} placeholder="Carro do trabalho" /></label>
        <Btn size="lg" className="mt-2" onClick={add}><Plus size={18} weight="bold" />Adicionar veículo</Btn>
      </div>
    </div>
  )
}

function EditVehicle({ id, onDone }: { id: string; onDone: () => void }) {
  const s = useStore()
  const v = s.vehicles.find(x => x.id === id)!
  const [d, setD] = useState({ nickname: v.nickname ?? '', plate: v.plate, year: String(v.year), photo: v.photo })
  const save = () => {
    const plate = d.plate.replace(/\W/g, '').toUpperCase()
    if (plate.length !== 7) { s.say('A placa precisa ter 7 caracteres.'); return }
    s.updateVehicle(id, { nickname: d.nickname || undefined, plate, year: +d.year, photo: d.photo }); s.say('Veículo atualizado'); onDone()
  }
  return (
    <section className="grid gap-3 rounded-3xl bg-surface p-5">
      <b>Editar veículo</b>
      <label><span className="label">Apelido</span><input id="ev-nick" className="field" value={d.nickname} onChange={e => setD({ ...d, nickname: e.target.value })} placeholder="Carro da família" /></label>
      <div className="grid grid-cols-2 gap-3">
        <label><span className="label">Placa</span><input id="ev-plate" className="field uppercase" maxLength={8} value={d.plate} onChange={e => setD({ ...d, plate: e.target.value })} /></label>
        <label><span className="label">Ano</span><select id="ev-year" className="field" value={d.year} onChange={e => setD({ ...d, year: e.target.value })}>{Array.from({ length: 16 }, (_, i) => 2026 - i).map(y => <option key={y}>{y}</option>)}</select></label>
      </div>
      <div><span className="label">Foto</span><div className="grid grid-cols-3 gap-2">{CATALOG.map(c => <button key={c.photo} onClick={() => setD({ ...d, photo: c.photo })} aria-pressed={d.photo === c.photo} aria-label={`Foto ${c.model}`} className={`overflow-hidden rounded-xl border-2 ${d.photo === c.photo ? 'border-royal' : 'border-transparent'}`}><img src={c.photo} alt="" className="h-14 w-full object-cover" /></button>)}</div></div>
      <div className="flex gap-2"><Btn kind="royal" onClick={save}>Salvar</Btn><Btn kind="ghost" onClick={onDone}>Cancelar</Btn></div>
    </section>
  )
}
