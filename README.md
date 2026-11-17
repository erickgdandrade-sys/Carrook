# Carrook

O plano de saúde do seu carro: manutenção preventiva simples, com alertas, oficinas parceiras certificadas e descontos exclusivos.

> **Facilitar & transformar em rotina a manutenção preventiva do seu veículo.**

## Protótipo

`prototipo/index.html` é um protótipo navegável num único arquivo (HTML + JS, sem build). Abra direto no navegador.

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
