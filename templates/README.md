# Templates n8n — Bolten

Workflows prontos para partners importarem no n8n.

## Meta Lead Ads → Bolten (CRM + Pipeline)

Cada lead de um formulário do Facebook/Instagram Lead Ads vira automaticamente
um **contato** e uma **oportunidade** no pipeline da Bolten.

**Fluxo:** `Facebook Lead Ads Trigger → Configuração → Mapear Campos → Criar Contato → Criar Oportunidade → Associar Contato`

### Arquivos
- `meta-lead-ads-para-bolten.json` — workflow para importar no n8n (`⋯ → Import from File`).
- `quickstart-meta-lead-ads.pdf` — guia de setup em PT-BR para o partner.
- `make_pdf.py` — gerador do PDF (rode `python3 make_pdf.py` para regenerar).

### O que o partner edita
1. **Configuração** — os 2 Component IDs (CRM e Pipeline).
2. **Mapear Campos** — alinhar atributos Bolten × campos do formulário Meta.
3. **Credenciais** — selecionar a *Bolten API* nos 3 nós Bolten e conectar o Facebook no trigger.

### Requisitos
- Node `n8n-nodes-bolten` instalado (Settings → Community nodes).
- API key da Bolten (Configurações → Integrações → API).
- Conta Meta Business com Página e formulário de lead ativos.

> **Duplicados:** o template cria um contato novo a cada lead (sem dedup), por design.
