# Calculadora do Custo Invisível das Despesas — Caju

Ferramenta TOFU, num único arquivo (`index.html`), para embed em uma LP no Framer.
Fluxo: **Tela inicial → Formulário (4 perguntas) → Resultado** (com download em PDF e CTA para Gestão de Despesas).

## Fórmula

Os campos 2 e 3 são **horas por mês, por pessoa**. Por isso a multiplicação por `pessoas` está correta.

| Item | Cálculo |
|---|---|
| Horas operacionais | campo 2 − campo 3 |
| Custo operacional/ano | pessoas × horas operacionais × custo/hora × 12 |
| Custo de retrabalho/ano | pessoas × horas de retrabalho × custo/hora × 12 (só se o campo 3 for preenchido) |
| Custo invisível total/ano | operacional + retrabalho |
| Equivalente mensal | total ÷ 12 |
| Horas do time por ano | pessoas × campo 2 × 12 |

Valor de referência por faixa de custo/hora: até R$ 30 → **25**; R$ 30–60 → **45**; R$ 60–100 → **80**; mais de R$ 100 → **120**.

Validações: pessoas de 1 a 1.000; horas de 1 a 220 por pessoa/mês; retrabalho de 0 até o valor do campo 2; todos números inteiros.

## O que dá para editar sem mexer no resto

No topo do `<script>`, no objeto `CONFIG`:
- `ctaUrl` — link do botão "Gestão de Despesas" (**hoje é provisório**).
- `custoHora` — valor usado em cada faixa.

## Embed no Framer

1. Publicar o `index.html` numa URL pública (ex.: Vercel, como a calculadora de saúde mental).
2. No Framer, usar o componente **Embed** no modo **URL**, apontando para essa URL.
3. Altura: o formulário é a tela mais alta (cerca de 1.100 px no desktop e mais no celular). Defina uma altura fixa que caiba nas três telas,
   ou use um Code Component que escute a mensagem `caju-calc-height`, que a página envia com a altura atual.

## Eventos emitidos (para tagueamento)

Enviados para `window.dataLayer` (se existir) e para a página pai via `postMessage` (`type: 'caju-calc-event'`):
`calc_view_intro`, `calc_view_form`, `calc_view_result`, `calc_result` (com `calc_total`, `calc_faixa`, `calc_pessoas`, `calc_retrabalho_preenchido`), `calc_download_pdf`, `calc_click_cta`.
Os nomes são provisórios e precisam ser validados com o time de Digital Analytics.
