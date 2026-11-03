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
- `zapierWebhook` — URL do Catch Hook do Zapier.
- `privacyUrl` — link da Política de Privacidade (**confirmar o link oficial**).

## Dados de contato e envio para o Zapier

Depois das 4 perguntas, o formulário pede (todos obrigatórios): nome completo, e-mail, telefone com DDD,
área, cargo e se a empresa já é cliente Caju. Quando a pessoa clica em "Ver meu resultado", a calculadora envia
um POST (`application/x-www-form-urlencoded`) para o webhook com estes campos:

| Campo | Exemplo |
|---|---|
| `nome`, `email`, `telefone` | Maria da Silva, maria@empresa.com.br, (11) 91234-5678 |
| `area`, `cargo`, `ja_cliente_caju` | Compras/Financeiro, Gerente/Coordenador, Não |
| `pessoas`, `horas_mes_por_pessoa`, `horas_retrabalho_mes_por_pessoa` | 3, 40, 8 (vazio se não informado) |
| `faixa_custo_hora`, `custo_hora_referencia` | R$ 30 a 60, 45 |
| `custo_operacional_ano`, `custo_retrabalho_ano`, `custo_total_ano`, `custo_mensal`, `horas_time_ano` | 51840, 12960, 64800, 5400, 1440 |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` | sempre enviados (vazios se não houver) |
| outros `utm_*` (ex.: `utm_id`) | enviados se estiverem na URL |
| `ga_client_id` | 987654321.1730000000 |
| `page_url`, `enviado_em` | URL da LP, data/hora em UTC (ISO 8601) |

Os valores em reais vão como números puros, sem "R$" e sem pontos, para facilitar a análise.
O mesmo cálculo não é enviado duas vezes seguidas. Os dados pessoais **não** vão para o `dataLayer`.

### UTMs e GA client id dentro do Framer (obrigatório)

No embed, a calculadora roda num iframe e **não enxerga a URL nem os cookies da LP**. Quem entrega esses dados
é o Code Component (seção abaixo). Se for usar o Embed comum, use o `framer-snippet.html`: troque `CALC_ORIGIN`
pelo domínio da calculadora e cole o script em Page Settings → Custom Code → *End of `<body>` tag*.
Sem um dos dois, as UTMs e o `ga_client_id` chegam vazios no Zapier.

## Embed no Framer (recomendado: Code Component)

Use o componente `framer/CalculadoraDespesas.tsx` no lugar do Embed comum. Ele:
- ajusta a altura do quadro ao conteúdo de cada tela (a tela inicial tem ~600 px e o formulário de 1.550 a 2.200 px, conforme a largura);
- rola a página até o topo da calculadora quando a tela muda (ex.: do formulário para o resultado);
- repassa as UTMs e o GA client id. **Com o componente, o `framer-snippet.html` não é necessário.**

Passo a passo:
1. Publicar o `index.html` numa URL pública (ex.: Vercel).
2. No Framer: Assets → Code → **+** → New Component. Apagar o conteúdo, colar o `CalculadoraDespesas.tsx` e salvar.
3. Arrastar o componente para a página. Largura: Fill (ou fixa, a partir de 300 px). Altura: **Fit Content**.
4. No painel à direita, preencher a **URL**. Em "Folga do topo", colocar a altura do menu fixo da LP, se houver (padrão: 80 px).

Larguras testadas, sem rolagem lateral: 300, 340, 400, 480, 600, 700 e 900 px.

Alternativa (Embed comum, modo URL): funciona, mas com altura fixa. Será preciso uma altura que caiba o formulário
(até ~2.200 px em quadro estreito), o que deixa espaço vazio nas outras telas. Nesse caso, use o `framer-snippet.html` para as UTMs.

## Eventos emitidos (para tagueamento)

Enviados para `window.dataLayer` (se existir) e para a página pai via `postMessage` (`type: 'caju-calc-event'`):
`calc_view_intro`, `calc_view_form`, `calc_view_result`, `calc_result` (com `calc_total`, `calc_faixa`, `calc_pessoas`, `calc_retrabalho_preenchido`), `calc_download_pdf`, `calc_click_cta`.
Os nomes são provisórios e precisam ser validados com o time de Digital Analytics.
