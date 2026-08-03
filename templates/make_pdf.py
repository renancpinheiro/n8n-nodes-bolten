#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from fpdf import FPDF

INDIGO = (79, 70, 229)
DARK = (26, 26, 46)
GRAY = (107, 114, 128)
LIGHT = (243, 244, 246)
VIOLET_BG = (245, 243, 255)
CODE_RED = (190, 18, 60)
NIGHT = (17, 24, 39)


class PDF(FPDF):
    def header(self):
        pass

    def footer(self):
        self.set_y(-13)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(*GRAY)
        self.cell(0, 8, "Bolten x Meta Lead Ads  -  Template n8n para partners", align="C")


pdf = PDF(format="A4")
pdf.set_auto_page_break(auto=True, margin=16)
pdf.add_page()
pdf.set_margins(18, 16, 18)
W = pdf.w - 36  # usable width


def h1(txt):
    pdf.set_x(18)
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(*INDIGO)
    pdf.multi_cell(W, 9, txt, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(1)


def sub(txt):
    pdf.set_x(18)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(*GRAY)
    pdf.multi_cell(W, 5, txt, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)


def h2(txt):
    pdf.ln(1.5)
    pdf.set_font("Helvetica", "B", 12.5)
    pdf.set_text_color(*INDIGO)
    pdf.cell(0, 7, txt)
    pdf.ln(7)
    y = pdf.get_y()
    pdf.set_draw_color(*LIGHT)
    pdf.set_line_width(0.6)
    pdf.line(18, y, 18 + W, y)
    pdf.ln(2.5)


def flow(txt):
    pdf.set_fill_color(*NIGHT)
    pdf.set_text_color(230, 232, 235)
    pdf.set_font("Courier", "", 8.5)
    pdf.multi_cell(W, 6.5, txt, fill=True, border=0, align="C", padding=3)
    pdf.ln(3)


def bullet(txt, bold_lead=None):
    pdf.set_x(20)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(*INDIGO)
    pdf.cell(4, 5.2, chr(149))
    _rich_line(txt, bold_lead)


def numbered(n, lead, rest):
    pdf.set_x(19)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(*INDIGO)
    pdf.cell(6, 5.2, f"{n}.")
    _rich_line(rest, lead)


def _rich_line(txt, bold_lead=None):
    # renders a paragraph where **x** is bold and `x` is monospace/red
    import re
    x_start = pdf.get_x()
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(*DARK)
    tokens = []
    if bold_lead:
        tokens.append(("b", bold_lead + " "))
    for part in re.split(r"(\*\*.*?\*\*|`.*?`)", txt):
        if not part:
            continue
        if part.startswith("**"):
            tokens.append(("b", part[2:-2]))
        elif part.startswith("`"):
            tokens.append(("c", part[1:-1]))
        else:
            tokens.append(("n", part))
    line_h = 5.2
    avail_right = 18 + W
    for kind, text in tokens:
        words = text.split(" ")
        for i, word in enumerate(words):
            w = word if i == len(words) - 1 else word + " "
            if w == "":
                w = " "
            if kind == "b":
                pdf.set_font("Helvetica", "B", 10); pdf.set_text_color(*DARK)
            elif kind == "c":
                pdf.set_font("Courier", "", 9); pdf.set_text_color(*CODE_RED)
            else:
                pdf.set_font("Helvetica", "", 10); pdf.set_text_color(*DARK)
            ww = pdf.get_string_width(w)
            if pdf.get_x() + ww > avail_right:
                pdf.ln(line_h)
                pdf.set_x(x_start)
            pdf.cell(ww, line_h, w)
    pdf.ln(line_h + 0.4)


def box(lines):
    y0 = pdf.get_y()
    # measure total height with a dry run
    total_h = 0
    pad = 4
    for lead, rest in lines:
        pdf.set_font("Helvetica", "", 9.3)
        n = len(pdf.multi_cell(W - 8, 5, lead + " " + rest, dry_run=True,
                               output="LINES", new_x="LMARGIN", new_y="TOP"))
        total_h += n * 5
    total_h += pad * 2 + (len(lines) - 1) * 1.5
    # background + left accent bar
    pdf.set_fill_color(*VIOLET_BG)
    pdf.rect(18, y0, W, total_h, style="F")
    pdf.set_fill_color(124, 58, 237)
    pdf.rect(18, y0, 1.4, total_h, style="F")
    pdf.set_xy(22, y0 + pad)
    for lead, rest in lines:
        x_lead = 22
        pdf.set_x(x_lead)
        pdf.set_font("Helvetica", "B", 9.3); pdf.set_text_color(124, 58, 237)
        lead_w = pdf.get_string_width(lead + " ")
        pdf.cell(lead_w, 5, lead)
        pdf.set_font("Helvetica", "", 9.3); pdf.set_text_color(*DARK)
        pdf.set_x(x_lead + lead_w)
        pdf.multi_cell(18 + W - (x_lead + lead_w) - 4, 5, rest,
                       new_x="LMARGIN", new_y="NEXT")
        pdf.set_y(pdf.get_y() + 1.5)
    pdf.set_y(y0 + total_h + 2)


# ---------- content ----------
h1("Bolten x Meta Lead Ads")
sub("Template n8n para partners - cada lead do Facebook/Instagram vira contato + oportunidade no pipeline automaticamente.")
flow("Facebook Lead Ads Trigger  >  Configuracao  >  Mapear Campos  >  Criar Contato  >  Criar Oportunidade  >  Associar Contato")

h2("Pre-requisitos")
bullet("Conta **Bolten** com acesso a API (Configuracoes > Integracoes > API).")
bullet("Instancia **n8n** (Cloud ou self-hosted) com community nodes habilitados.")
bullet("Conta **Meta Business** com uma Pagina e um **formulario de lead** ativo.")

h2("Passo a passo")
numbered(1, "Instale o node da Bolten.", "No n8n: `Settings > Community nodes > Install` e informe `n8n-nodes-bolten`. Aceite o aviso e instale.")
numbered(2, "Importe o workflow.", "Menu `... > Import from File` e selecione `meta-lead-ads-para-bolten.json` (do ZIP).")
numbered(3, "Crie a credencial Bolten API.", "Em Bolten, gere a API key. No n8n, crie a credencial **Bolten API**, cole a key e selecione-a nos **3 nos Bolten**.")
numbered(4, "Conecte o Facebook.", "Abra o no **Facebook Lead Ads Trigger**, autentique com sua conta Meta e selecione a **Pagina** e o **Formulario**.")
numbered(5, "Preencha a Configuracao.", "No no **Configuracao**, cole os 2 Component IDs. Para acha-los: adicione um no Bolten > Project > Get Components e copie o UUID do CRM e do Pipeline.")
numbered(6, "Ajuste o Mapear Campos.", "A esquerda ficam os atributos **no Bolten**; a direita, os campos do **formulario Meta**. Rode 1 teste para ver os nomes reais e alinhe os dois lados.")
numbered(7, "Teste e ative.", "Use Execute Workflow com um lead de teste, confira o contato e a oportunidade no Bolten e entao **ative** o workflow.")

h2("Mapeamento padrao")
# simple table
rows = [("Atributo Bolten", "Campo Meta", True), ("Nome", "full_name", False),
        ("E-mail", "email", False), ("Telefone", "phone_number", False)]
col1 = W * 0.5
for k, v, head in rows:
    pdf.set_x(18)
    if head:
        pdf.set_font("Helvetica", "B", 9.5); pdf.set_fill_color(*LIGHT); pdf.set_text_color(*DARK)
        pdf.cell(col1, 7, "  " + k, border=1, fill=True)
        pdf.cell(W - col1, 7, "  " + v, border=1, fill=True, ln=1)
    else:
        pdf.set_font("Helvetica", "", 9.5); pdf.set_text_color(*DARK)
        pdf.cell(col1, 7, "  " + k, border=1)
        pdf.set_font("Courier", "", 9); pdf.set_text_color(*CODE_RED)
        pdf.cell(W - col1, 7, "  " + v, border=1, ln=1)
pdf.ln(1)
pdf.set_font("Helvetica", "", 8.6); pdf.set_text_color(*GRAY)
pdf.multi_cell(W, 4.4, "Se o seu formulario usa outros campos ou seu CRM usa outros atributos, ajuste no no Mapear Campos.")

h2("Bom saber")
box([
    ("Duplicados:", "o template cria um contato novo a cada lead (sem checagem de duplicidade) - comportamento intencional para manter o fluxo simples."),
    ("Retry:", "os nos Bolten ja vem com 3 tentativas automaticas para falhas transitorias de rede."),
    ("Titulo da oportunidade:", "nasce como 'Lead Meta - {Nome}'. Se o atributo de titulo do seu pipeline tiver outro nome, ajuste no no Criar Oportunidade."),
])
pdf.ln(2)
pdf.set_font("Helvetica", "", 8.6); pdf.set_text_color(*GRAY)
pdf.multi_cell(W, 4.6, "Documentacao da API: docs.bolten.io   |   Node: github.com/renancpinheiro/n8n-nodes-bolten")

pdf.output("quickstart-meta-lead-ads.pdf")
print("PDF gerado")
