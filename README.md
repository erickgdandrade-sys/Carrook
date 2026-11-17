# Carrook

O plano de saúde do seu carro: manutenção preventiva simples, com alertas, oficinas parceiras certificadas e descontos exclusivos.

> **Facilitar & transformar em rotina a manutenção preventiva do seu veículo.**

## Plataforma (`app/`)

A plataforma Carrook usa um só código para o **app no celular** e a **versão web**. A navegação inferior aparece no celular e a barra lateral no computador. Pode ser instalada como app (PWA) e está pronta para virar app de loja com Capacitor.

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Zustand + React Router + Phosphor Icons.

```bash
cd app
npm install
npm run dev      # desenvolvimento em http://localhost:5173
npm run build    # gera app/dist
```

### O que tem
- **Boas-vindas, login e cadastro em 4 etapas:** dados, carro (com placa Mercosul), plano e pagamento
- **Início** (base: mockup do Behance): cabeçalho violeta, carrossel de veículos com foto, placa e quilometragem, saúde do veículo (medidor), próximo agendamento, itens que pedem atenção, serviços com *Contratar / Saiba mais*, benefício de combustível e blog
- **Veículo:** "estrada da manutenção", com cada item no km em que vence e o carro no km atual; hodômetro; quilometragem manual ou estimada pelos deslocamentos; histórico
- **Oficinas:** filtro por serviço, ordenação (Indicada Carrook, maior desconto, mais perto, melhor avaliadas), mapa, selo de parceiro, preço já calculado para o plano do usuário
- **Agendamento:** veículo, serviço, dia e horário; serviços incluídos no plano confirmam direto, sem pagamento
- **Pagamento:** Pix (QR e copia e cola, 5% de desconto), crédito em até 6x, débito, Apple/Google Pay e boleto
- **Acompanhamento do serviço:** agendado → recebido → diagnóstico → em serviço → pronto → concluído, com laudo digital e avaliação
- **Benefícios** (cupom de combustível), **planos** (comparar e trocar, respeitando o limite de veículos), **notificações** e **perfil**
- **Painel admin** (`#/admin`): visão geral, quadro de agendamentos (avançar o status muda a tela do cliente), oficinas (credenciar e ajustar desconto), assinantes e planos (preço e limite de veículos)

Os dados são de exemplo e ficam salvos no navegador. O próximo passo é ligar um backend (ex.: Supabase para autenticação e banco) e um gateway de pagamento com Pix e cartão.

Fotos: [Unsplash](https://unsplash.com/license) (licença livre).

## Protótipo antigo

`prototipo/index.html` foi a primeira versão, num único arquivo. Ficou como referência; a versão atual é a de `app/`.

**App do motorista**
- Entrar / criar conta
- Início: veículo atual (troca entre veículos), saúde do veículo, próximas manutenções, serviços, benefícios (combustível, revisão anual) e blog
- Saúde do veículo: atualizar a quilometragem manualmente ou deixar o app estimar pelos deslocamentos; plano de manutenção por km **ou** tempo (o que vencer primeiro)
- Notificações: manutenções atrasadas e próximas, promoções de parceiros
- Oficinas parceiras: filtro por serviço, ordenação por maior desconto / mais perto / melhor avaliadas, oficina **Indicada Carrook** e selo de parceiro
- Agendamento (dia e horário) → pagamento (Pix, crédito parcelado, débito, carteiras digitais, boleto) → confirmação
- Menu: plano atual, meus veículos (limite por plano), histórico, formas de pagamento
- Planos (do pitch): Clube Carrook (a partir de R$ 50), Carrook Start (R$ 120, coparticipação 50%) e Carrook Premium (R$ 200, coparticipação 20%)

**Painel admin** (alternar no topo)
- Visão geral (assinantes, receita recorrente, agendamentos, oficinas)
- Agendamentos
- Oficinas: editar desconto, o que muda a ordenação e a indicação no app
- Planos: editar mensalidade e limite de veículos

Todos os números são **dados de exemplo**.

## Identidade visual

| Cor | Hex |
|---|---|
| Gelo | `#F9FDFF` |
| Índigo | `#3A43A4` |
| Azul | `#1F55E1` |
| Violeta | `#5A66F6` |
| Verde | `#41D92A` |
| Folha | `#4EA531` |
| Preto | `#0A0A0A` |

Tipografia institucional: **Neulis Neue** (Adobe Fonts). No protótipo, ela está na variável CSS `--font`. Hoje a página usa a **Outfit** (Google Fonts) como substituta. Para usar a Neulis Neue na web, crie um web project na Adobe Fonts e inclua o `<link>` do kit. A licença da Adobe Fonts não permite embutir o arquivo da fonte num app publicado nas lojas.

IDV: Erick Gomes · Andra & Go ([Behance](https://www.behance.net/gallery/212156461/Carrook-Identidade-Visual)).

## Pendências / decisões em aberto
- Limite de veículos por plano (hoje: Clube 1, Start 2, Premium 3, provisório)
- Regras de carência e quais dos "80 itens" cada plano cobre
- Stack do app real (iOS + Android): sugestão React Native/Expo + backend (ex.: Supabase) + gateway com Pix/cartão
