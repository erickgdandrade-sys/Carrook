// Dados de exemplo da plataforma Carrook.
// Tudo aqui é fictício e serve para o protótipo; depois vem do backend.

export const img = (name: string) => `./img/${name}.jpg`

export type PlanId = 'clube' | 'start' | 'premium'
export interface Plan {
  id: PlanId
  name: string
  short: string
  price: number
  maxVehicles: number
  copay: number | null // fração que o assinante paga nos serviços cobertos
  tagline: string
  perks: string[]
  popular?: boolean
}

// Planos do pitch (valores "a partir de"). Limite de veículos provisório.
export const PLANS: Plan[] = [
  {
    id: 'clube', name: 'Clube Carrook', short: 'Clube', price: 50, maxVehicles: 1, copay: null,
    tagline: 'O essencial para manter a rotina em dia.',
    perks: ['Revisão anual de até 80 itens', 'Troca de óleo e filtro gratuita', 'Até 20% de desconto em peças', 'Descontos em combustível'],
  },
  {
    id: 'start', name: 'Carrook Start', short: 'Start', price: 120, maxVehicles: 2, copay: 0.5, popular: true,
    tagline: 'Cobertura de verdade, pagando metade.',
    perks: ['Cobertura total de até 80 itens', 'Coparticipação de 50%', 'Todos os benefícios do Clube', 'Descontos em combustível'],
  },
  {
    id: 'premium', name: 'Carrook Premium', short: 'Premium', price: 200, maxVehicles: 3, copay: 0.2,
    tagline: 'Para quem não quer pensar em oficina.',
    perks: ['Cobertura total de até 80 itens', 'Coparticipação de 20%', 'Todos os benefícios do Clube', 'Carência reduzida'],
  },
]

export type ServiceKey = 'revisao' | 'oleo' | 'freios' | 'alinhamento' | 'bateria' | 'arrefecimento' | 'correia' | 'diagnostico'
export interface Service { key: ServiceKey; name: string; short: string; base: number; minutes: number; desc: string; includedYearly?: boolean }

export const SERVICES: Record<ServiceKey, Service> = {
  revisao: { key: 'revisao', name: 'Revisão completa de 80 itens', short: 'Revisão', base: 1180, minutes: 180, includedYearly: true,
    desc: 'Inspeção de suspensão, freios, fluidos, elétrica, filtros e pneus, com laudo digital no app.' },
  oleo: { key: 'oleo', name: 'Troca de óleo e filtro', short: 'Óleo e filtro', base: 320, minutes: 45, includedYearly: true,
    desc: 'Óleo na especificação do fabricante e filtro novo. Inclui checagem de níveis.' },
  freios: { key: 'freios', name: 'Pastilhas de freio', short: 'Freios', base: 460, minutes: 90,
    desc: 'Troca das pastilhas dianteiras e verificação de discos e fluido.' },
  alinhamento: { key: 'alinhamento', name: 'Alinhamento e balanceamento', short: 'Alinhamento', base: 180, minutes: 60,
    desc: 'Geometria a laser e balanceamento das quatro rodas, com rodízio.' },
  bateria: { key: 'bateria', name: 'Bateria nova', short: 'Bateria', base: 590, minutes: 30,
    desc: 'Teste do sistema de carga e instalação de bateria com 24 meses de garantia.' },
  arrefecimento: { key: 'arrefecimento', name: 'Sistema de arrefecimento', short: 'Arrefecimento', base: 260, minutes: 60,
    desc: 'Troca do fluido, teste de pressão e verificação de mangueiras.' },
  correia: { key: 'correia', name: 'Correia dentada', short: 'Correia', base: 890, minutes: 210,
    desc: 'Troca da correia e do tensor. Evita quebra do motor.' },
  diagnostico: { key: 'diagnostico', name: 'Diagnóstico eletrônico', short: 'Diagnóstico', base: 150, minutes: 40,
    desc: 'Leitura por scanner de todos os módulos e relatório de falhas.' },
}

export type ItemKey = 'oleo' | 'filtroAr' | 'pneus' | 'freios' | 'arrefecimento' | 'bateria' | 'correia'
export interface MaintItem { key: ItemKey; name: string; everyKm: number; everyMonths: number; service: ServiceKey }
export const ITEMS: MaintItem[] = [
  { key: 'oleo', name: 'Óleo do motor', everyKm: 10000, everyMonths: 12, service: 'oleo' },
  { key: 'filtroAr', name: 'Filtro de ar', everyKm: 15000, everyMonths: 12, service: 'revisao' },
  { key: 'pneus', name: 'Rodízio e alinhamento', everyKm: 10000, everyMonths: 12, service: 'alinhamento' },
  { key: 'freios', name: 'Pastilhas de freio', everyKm: 30000, everyMonths: 24, service: 'freios' },
  { key: 'arrefecimento', name: 'Fluido de arrefecimento', everyKm: 40000, everyMonths: 24, service: 'arrefecimento' },
  { key: 'bateria', name: 'Bateria', everyKm: 60000, everyMonths: 36, service: 'bateria' },
  { key: 'correia', name: 'Correia dentada', everyKm: 60000, everyMonths: 48, service: 'correia' },
]

export interface Shop {
  id: string; name: string; photo: string; address: string; district: string
  rating: number; reviews: number; discount: number; distanceKm: number
  map: { x: number; y: number }; hours: string; phone: string
  services: ServiceKey[]; since: number
  quotes: { name: string; text: string; stars: number }[]
}

export const SHOPS: Shop[] = [
  { id: 'prospera', name: 'Auto Center Próspera', photo: img('shop-mechanic'), address: 'R. Henrique Lage, 1240', district: 'Próspera',
    rating: 4.9, reviews: 312, discount: 22, distanceKm: 2.1, map: { x: 66, y: 34 }, hours: 'Seg a sex 8h–18h · Sáb 8h–12h', phone: '(48) 3433-1020',
    services: ['revisao', 'oleo', 'freios', 'alinhamento', 'bateria', 'arrefecimento', 'correia', 'diagnostico'], since: 2024,
    quotes: [{ name: 'Rafael N.', text: 'Me salvou de um problemão! Acharam a correia rachada na revisão.', stars: 5 }, { name: 'Júlia M.', text: 'Deixaram meu carro novo.', stars: 5 }] },
  { id: 'rio-maina', name: 'Mecânica Rio Maina', photo: img('shop-oil'), address: 'Av. Universitária, 680', district: 'Universitário',
    rating: 4.7, reviews: 188, discount: 18, distanceKm: 5.4, map: { x: 22, y: 22 }, hours: 'Seg a sex 7h30–18h', phone: '(48) 3437-5512',
    services: ['revisao', 'oleo', 'freios', 'alinhamento', 'diagnostico'], since: 2024,
    quotes: [{ name: 'Carlos S.', text: 'Serviço super rápido!', stars: 5 }, { name: 'Ana B.', text: 'Ótimos preços e explicam tudo.', stars: 4 }] },
  { id: 'centro-sul', name: 'Oficina Centro Sul', photo: img('shop-engine'), address: 'R. Cel. Pedro Benedet, 315', district: 'Centro',
    rating: 4.6, reviews: 97, discount: 12, distanceKm: 1.2, map: { x: 48, y: 52 }, hours: 'Seg a sex 8h–18h30', phone: '(48) 3045-7788',
    services: ['oleo', 'freios', 'bateria', 'arrefecimento', 'diagnostico'], since: 2025,
    quotes: [{ name: 'Pedro A.', text: 'Ótimo atendimento.', stars: 5 }] },
  { id: 'pinheirinho', name: 'Garagem Pinheirinho', photo: img('shop-garage'), address: 'R. Imigrante Meller, 52', district: 'Pinheirinho',
    rating: 4.8, reviews: 241, discount: 15, distanceKm: 3.8, map: { x: 30, y: 74 }, hours: 'Seg a sáb 8h–19h', phone: '(48) 3462-9031',
    services: ['revisao', 'oleo', 'alinhamento', 'correia', 'diagnostico'], since: 2024,
    quotes: [{ name: 'Larissa P.', text: 'Me avisaram de tudo pelo WhatsApp. Confiança total.', stars: 5 }] },
]

export const FUEL = [
  { id: 'br101', name: 'Posto Parceiro BR-101', perLiter: 0.2, distanceKm: 1.8, address: 'BR-101, km 380' },
  { id: 'centenario', name: 'Posto Centenário', perLiter: 0.15, distanceKm: 3.1, address: 'Av. Centenário, 4100' },
]

export const POSTS = [
  { id: 'oleo', title: 'Quando trocar o óleo de verdade?', tag: 'Manutenção', minutes: 4, photo: img('shop-oil') },
  { id: 'viagem', title: 'Checklist de 10 minutos antes de pegar a estrada', tag: 'Viagem', minutes: 6, photo: img('car-suv-road') },
  { id: 'eletricos', title: 'Carro elétrico precisa de revisão?', tag: 'Tendências', minutes: 5, photo: img('car-ev') },
]

// Catálogo para o cadastro de veículos
export const CATALOG = [
  { brand: 'Toyota', model: 'RAV4', photo: img('car-rav4') },
  { brand: 'Fiat', model: '500', photo: img('car-fiat500') },
  { brand: 'Toyota', model: 'Camry', photo: img('car-camry') },
  { brand: 'Honda', model: 'CR-V', photo: img('car-crv') },
  { brand: 'Ford', model: 'Expedition', photo: img('car-suv-road') },
  { brand: 'Tesla', model: 'Model 3', photo: img('car-ev') },
]
