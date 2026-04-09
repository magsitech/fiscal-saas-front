# Guia de Conteúdo

Este guia define a convenção editorial das telas internas do `validaeNota`.

## Objetivo

Manter consistência de voz, navegação e microtextos em toda a aplicação.

## Estrutura recomendada

### 1. Menu lateral

Use rótulos curtos, objetivos e fáceis de escanear.

Exemplos:

- `Dashboard`
- `Auditoria`
- `Extrato`
- `Créditos`
- `Pedidos`
- `Simulador`
- `Perfil`

### 2. Título da página

Use um título mais descritivo do que o item do menu, explicando o contexto da tela.

Exemplos:

- `Histórico de auditoria fiscal`
- `Extrato financeiro`
- `Comprar créditos`
- `Simulador de custos`

### 3. Subtítulo

Use uma frase curta orientada à ação, benefício ou leitura da tela.

Exemplos:

- `Revise o status das consultas fiscais e identifique ocorrências com rapidez.`
- `Veja créditos, débitos e estornos para entender a evolução do saldo.`
- `Projete o custo do próximo lote com base no volume acumulado.`

### 4. Chips e apoios visuais

Use de 2 a 4 termos curtos que reforcem o escopo da rota.

Exemplos:

- `Visão geral`
- `Saldo`
- `Créditos`
- `Débitos`
- `Conciliação`
- `Pendências`

### 5. Botões e ações

Prefira verbos no infinitivo ou ações diretas.

Exemplos:

- `Calcular`
- `Ver todas`
- `Gerar boleto`
- `Copiar código PIX`
- `Salvar alterações`

### 6. Empty states

O texto deve ser claro, neutro e informar o estado sem dramatizar.

Exemplos:

- `Nenhuma auditoria registrada ainda`
- `Nenhum pedido encontrado`
- `Nenhum lançamento registrado`

## Padrões de linguagem

- Priorizar PT-BR correto, com acentuação e ortografia atualizadas.
- Preferir termos financeiros usuais em português: `créditos`, `débitos`, `saldo`, `extrato`.
- Evitar misturar rótulo curto de menu com título longo de página.
- Evitar excesso de jargão técnico quando houver alternativa mais clara.
- Usar tom objetivo, confiável e operacional.

## Regra prática

Use esta fórmula sempre que criar ou revisar uma tela:

- menu: curto
- título: descritivo
- subtítulo: orientado à ação
- botão: verbo direto

## Aplicação atual

A convenção acima deve ser usada principalmente em:

- rotas internas do app
- cabeçalhos de páginas
- cards de contexto
- filtros
- ações primárias e secundárias
- estados vazios
