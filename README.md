# Calculadora do Custo Invisível das Despesas — Caju

Ferramenta TOFU, num único arquivo (`index.html`), para embed em uma LP no Framer.
Fluxo: **Tela inicial → 4 perguntas (uma por tela) → Seus dados (3 telas) → Resultado** (com download em PDF e CTA para Gestão de Despesas).
Cada etapa é curta para caber num embed pequeno, de tamanho fixo. O código é colado direto no Embed (modo HTML) do Framer.

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
- `ctaUrl` — link do botão "Gestão de Despesas" (página de Despesas, com UTMs da campanha).
- `ctaTextoPdf` — texto curto do link que aparece no PDF.
- `custoHora` — valor usado em cada faixa.
- `zapierWebhook` — URL do Catch Hook do Zapier.
- `privacyUrl` — link da Política de Privacidade (**confirmar o link oficial**).

## Dados de contato e envio para o Zapier

Depois das 4 perguntas, o formulário pede, em três telas (todos obrigatórios):
1. nome completo, e-mail e telefone com DDD;
2. nome da empresa, número de colaboradores (número inteiro, de 1 a 1.000.000) e se a empresa já é cliente Caju;
3. área e cargo. Quando a pessoa clica em "Ver meu resultado", a calculadora envia
um POST (`application/x-www-form-urlencoded`) para o webhook com estes campos:

| Campo | Exemplo |
|---|---|
| `nome`, `email`, `telefone` | Maria da Silva, maria@empresa.com.br, (11) 91234-5678 |
| `empresa`, `numero_colaboradores` | Empresa Exemplo Ltda, 250 |
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

## Como colocar no Framer

A calculadora **não precisa ser publicada em outro lugar**: o código do `index.html` é colado direto no Embed.

### 1. Embed (modo HTML)
1. No Framer, inserir um **Embed** e escolher o modo **HTML**.
2. Colar **todo** o conteúdo do `index.html`.
3. Tamanho do bloco: **pelo menos 360 × 600 px** (largura × altura). Nesse tamanho, todas as telas cabem sem rolagem.
   Tamanhos testados: 320×560, 360×640, 400×600, 600×600 e 800×700. Em 320×560, só o resultado
   rola um pouco (23 px) dentro do bloco, mas funciona.

### 2. Custom Code (`framer-snippet.html`)
Não consegui confirmar na documentação do Framer como ele roda o HTML colado (o site do Framer estava inacessível
no ambiente de desenvolvimento). Por isso a calculadora foi preparada e testada para os três jeitos possíveis:

| Como o Framer roda o código | UTMs e GA client id | Download do PDF |
|---|---|---|
| Direto na página da LP | lidos direto da LP | normal |
| Quadro (iframe) com o mesmo endereço da LP | lidos direto da LP | normal |
| Quadro isolado (sandbox) | **só com o Custom Code** | pelo Custom Code, se o quadro não puder baixar |

Por isso, **instale sempre o Custom Code**: nos dois primeiros casos ele não é usado e não atrapalha.
No Framer: Page Settings da LP → Custom Code → **End of `<body>` tag** → colar o conteúdo do `framer-snippet.html`.
Não é preciso alterar nada nele.

### Isolamento do estilo
Todo o CSS vale só dentro de `#caju-calc`, para não alterar a LP, e o layout se adapta à **largura do próprio bloco**
(container queries), não à da janela. Risco residual, só se o Framer injetar o código direto na página: uma regra
genérica da LP (ex.: `.btn`, `.card`) poderia afetar a calculadora. O Framer usa classes próprias (`framer-...`),
então é improvável.

## Eventos para o GA

A calculadora dispara estes eventos (nenhum leva dado pessoal):

| Evento | Quando | Parâmetros |
|---|---|---|
| `calc_view_intro` | a tela inicial aparece | – |
| `calc_view_form` | clica em "Calcular meu custo invisível" | – |
| `calc_form_step` | abre cada etapa do formulário | `calc_step` (1 a 4 = perguntas; 5 a 7 = dados) |
| `calc_view_result` | o resultado aparece | – |
| `calc_result` | o resultado é calculado | `calc_total` (R$/ano), `calc_faixa`, `calc_pessoas`, `calc_retrabalho_preenchido` |
| `calc_download_pdf` | baixa o PDF | `calc_total` |
| `calc_click_cta` | clica em "Gestão de Despesas" | – |

Como chegam ao GA:
- **Num quadro (iframe):** a calculadora avisa a LP e o **Custom Code** (`framer-snippet.html`) repassa o evento.
- **Direto na página:** a própria calculadora envia.
- Em ambos: se a LP tem **GTM**, o evento vai para o `dataLayer`; se tem só **gtag.js** (GA4 sem GTM), vai direto ao GA4.

Com GTM, para cada evento que quiser no GA4:
1. Acionador → **Evento personalizado** → nome do evento (ex.: `calc_result`). Para pegar todos: `^calc_` com "usar correspondência de regex".
2. Variáveis → **Variável da camada de dados** para cada parâmetro (ex.: `calc_total`).
3. Tag → **Google Analytics: evento do GA4** → nome do evento `{{Event}}` e os parâmetros com as variáveis acima.
4. No GA4, registrar os parâmetros que quiser usar em relatórios como **dimensões/métricas personalizadas**.

Os nomes dos eventos são provisórios: validar com o time de Digital Analytics antes de criar as tags.
