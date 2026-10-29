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

No embed, a calculadora roda num iframe e **não enxerga a URL nem os cookies da LP**. Sem o passo abaixo,
as UTMs e o `ga_client_id` chegam vazios no Zapier.

1. Abrir `framer-snippet.html` e trocar `CALC_ORIGIN` pelo domínio onde a calculadora estiver publicada.
2. Colar o conteúdo no Framer: Page Settings → Custom Code → *End of `<body>` tag*.

## Embed no Framer

1. Publicar o `index.html` numa URL pública (ex.: Vercel, como a calculadora de saúde mental).
2. No Framer, usar o componente **Embed** no modo **URL**, apontando para essa URL.
3. Altura: o formulário é a tela mais alta (cerca de 1.100 px no desktop e mais no celular). Defina uma altura fixa que caiba nas três telas,
   ou use um Code Component que escute a mensagem `caju-calc-height`, que a página envia com a altura atual.

## Eventos emitidos (para tagueamento)

Enviados para `window.dataLayer` (se existir) e para a página pai via `postMessage` (`type: 'caju-calc-event'`):
`calc_view_intro`, `calc_view_form`, `calc_view_result`, `calc_result` (com `calc_total`, `calc_faixa`, `calc_pessoas`, `calc_retrabalho_preenchido`), `calc_download_pdf`, `calc_click_cta`.
Os nomes são provisórios e precisam ser validados com o time de Digital Analytics.
