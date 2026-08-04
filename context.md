# Catanos Figurinhas — Copa 2026
Contexto do projeto. Cole este arquivo no início de qualquer chat novo com o assistente.

## O que é
PWA vanilla JS (sem build, sem framework) para gerir estoque de figurinhas
repetidas do álbum Panini Copa 2026, montar ofertas, rastrear procuradas,
salvar orçamentos e registrar vendas. Sincroniza via Supabase.

## Arquivos — NÃO criar novos sem pedir
| Arquivo | Papel |
|---|---|
| `index.html` | Toda a UI. 8 views (`#v-estoque`, `#v-oferta`, `#v-livre`, `#v-procuradas`, `#v-orcamentos`, `#v-vendas`, `#v-scanner`, `#v-testes`) |
| `css/style.css` | Estilo único, tema escuro |
| `js/data.js` | Catálogo `teams`, bandeiras, craques, validação de números |
| `js/store.js` | localStorage, parser de listas, demanda, backup |
| `js/ui.js` | Render de todas as views, listas de texto, testes unitários |
| `js/cloud.js` | Supabase (auto-injetável, faz hook em `saveStock` etc.) |
| `js/scanner.js` | Câmera + OCR Tesseract v5 |
| `manifest.json` | PWA |

Ordem dos `<script>` importa: `data → store → ui → supabase-cdn → cloud → tesseract-cdn → scanner`.

## Regras do álbum (oficiais Panini)
- 980 cromos = **48 seleções × 20** + **20 especiais (código `FWC`)**
- `FWC` numera **00–19**; seleções numeram **01–20**
- ❌ Não existe bloco `HIST` (foi removido — era duplicata dos 20 especiais)
- ✨ **Brilhante** = a primeira de cada seleção (nº 01) + todas as FWC
- ⭐ **Craque** = existe **por seleção, sem número**. A Panini não publica
  checklist oficial; a ordem varia (emblema=1, foto do time flutua, jogadores
  em ordem tática). Por isso `isAce()` retorna sempre `false` e usamos
  `ACES_BY_TEAM` / `teamHasAce()` / `teamAceLabel()`.

## Convenções de código
- ES5 puro, `var`, `function`. Sem arrow, sem `let`/`const`, sem async no core
  (só `scanner.js` usa `async` para OCR).
- Indentação 2 espaços, sem ponto-e-vírgula opcional omitido.
- Nomes de função em português (`renderStock`, `gerarListaOferta`).
- IDs do DOM em camelCase (`#stockContainer`, `#btnListOf`).
- Nada de dependência nova sem autorização.

## Duas APIs de bandeira — não confundir
- `flagHTML(code)` / `flagURL(code,w)` → **imagem** do flagcdn.com, para a UI
- `flagEmoji(code)` → **emoji** Unicode, para as listas de texto do WhatsApp
  (usar em `buildList` e `gerarListaDemanda`)

## Chaves do localStorage
`fig26_stock` · `fig26_orc` · `fig26_sales` · `fig26_dem` · `fig26_ignore`
`fig26_local_ts` · `fig26_pending` · `fig26_hist_backup` (cópia da migração)

## Como pedir alterações ao assistente
1. **Sempre** anexar os arquivos afetados antes de pedir.
2. Responder com **diff apontando arquivo + número de linha**, nunca reescrever
   arquivo inteiro sem pedido explícito.
3. Não renomear IDs, classes CSS nem funções existentes.
4. Se faltar contexto, **perguntar** em vez de inventar.
5. Toda mudança em lógica deve vir com teste em `runTests()` (view Testes).

## Pendências conhecidas
- Escócia/Inglaterra: emoji de bandeira (tag sequence) não renderiza em Windows
  e alguns Androids. WhatsApp mobile renderiza certo.
- Scanner: OCR depende de CDN (offline não funciona). Câmera exige HTTPS.
- `ACES_BY_TEAM` tem 48 nomes preenchidos manualmente — revisar se a Panini
  divulgar checklist oficial.
