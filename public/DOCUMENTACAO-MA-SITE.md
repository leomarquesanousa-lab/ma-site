# M.A Confecções e Brindes — Site Institucional Temporário

**Projeto:** `ma-site`  
**Domínio:** `https://maconfeccoes.com.br`  
**Stack:** Next.js + React + TypeScript  
**Status:** Finalizado para publicação inicial  
**Data do checkpoint:** 21/08/2026

---

## 1. Objetivo do site

O site atual foi criado para substituir temporariamente o WordPress antigo e dar ao domínio principal da M.A Confecções e Brindes uma presença profissional, confiável e coerente com a marca enquanto a futura loja virtual completa ainda não está pronta.

O principal objetivo é gerar confiança em visitantes que chegam pelas landing pages, campanhas, redes sociais ou links de vendas.

O site apresenta:

- identidade visual da M.A Confecções e Brindes;
- Confecções;
- Brindes personalizados;
- MA System Baby;
- acesso ao MA System;
- WhatsApp;
- Instagram;
- Facebook;
- CNPJ da empresa;
- aviso de nova experiência/site em construção.

---

## 2. Estrutura atual

### Cabeçalho

- fundo branco;
- logotipo oficial da M.A;
- texto institucional: `Confecções • Brindes • Tecnologia`;
- botão para acesso ao MA System.

### Hero / abertura

Mensagem principal:

> Criamos para marcar presença.

Apresenta a empresa como uma combinação de produtos personalizados e tecnologia.

Possui:

- botão de acesso ao MA System;
- botão para contato pelo WhatsApp;
- aviso de site em construção;
- composição visual com as artes de Confecções, Brindes e MA System Baby.

### Faixa institucional

Apresenta os pilares:

- Personalização;
- Qualidade;
- Tecnologia;
- Experiência.

### Cards principais

#### Confecções

Imagem:

`/MA-SITE-CONFECCOES.png`

Apresentação de camisas, jaquetas e peças personalizadas.

#### Brindes personalizados

Imagem:

`/ma-SITE-BRINDES.png`

Apresentação de canecas, garrafas e presentes personalizados.

#### MA System Baby

Imagem:

`/MA-SITE-BEBES.png`

Apresenta a solução digital para organização de memórias e acompanhamento do bebê.

Link:

`https://app.maconfeccoes.com.br`

### Seção institucional

Seção escura e limpa, sem imagens em excesso, usada para explicar os diferenciais da M.A:

1. Personalização;
2. Acabamento;
3. Soluções digitais.

### Destaque MA System

Seção dedicada ao MA System Baby com:

- imagem do sistema;
- Organização;
- Memórias;
- Compartilhamento;
- botão de acesso.

### Rodapé

Sem logotipo.

Contém:

- M.A Confecções e Brindes;
- CNPJ;
- WhatsApp;
- Instagram;
- Facebook;
- direitos autorais.

---

## 3. Dados oficiais utilizados

**Empresa:** M.A Confecções e Brindes  
**CNPJ:** 57.739.176/0001-87  
**WhatsApp:** (11) 94794-4345  
**WhatsApp URL:** `https://wa.me/5511947944345`  
**Instagram:** `@maconfeccoesebrindes`  
**Instagram URL:** `https://www.instagram.com/maconfeccoesebrindes`  
**Facebook:** M.A Confecções e Brindes  
**MA System:** `https://app.maconfeccoes.com.br`

---

## 4. Arquivos visuais principais

Os seguintes arquivos devem permanecer dentro da pasta:

`public/`

### Logotipo

`logo-ma.jpg`

### Card Confecções

`MA-SITE-CONFECCOES.png`

### Card Brindes

`ma-SITE-BRINDES.png`

### Card MA System Baby

`MA-SITE-BEBES.png`

> Atenção: em servidores Linux, letras maiúsculas e minúsculas fazem diferença no nome dos arquivos. Não alterar os nomes sem atualizar também as referências no código.

---

## 5. Arquivo principal da página

O site atual utiliza:

`app/page.tsx`

Este é o arquivo principal que contém:

- estrutura da página;
- componentes;
- conteúdo;
- estilos responsivos;
- ícones SVG;
- links externos.

Existe histórico de uma pasta `src/app` criada no projeto, mas o projeto atual está servindo a pasta **`app` da raiz**. Portanto, alterações desta landing page devem ser feitas em:

`app/page.tsx`

---

## 6. Responsividade

O layout possui ajustes específicos para:

- desktop;
- tablet;
- celular.

No mobile:

- cards passam para uma coluna;
- composição visual do hero é reorganizada;
- textos e botões reduzem de tamanho;
- rodapé passa para disposição vertical;
- botão flutuante do WhatsApp permanece disponível.

---

## 7. Identidade visual definida

Paleta predominante:

- branco;
- marfim;
- vinho;
- dourado;
- tons escuros no rodapé e seções de contraste.

Direção visual:

- premium;
- elegante;
- limpa;
- institucional;
- sem excesso de elementos;
- uso de linhas finas e detalhes dourados;
- sombras discretas;
- tipografia com serifas nas chamadas principais;
- imagens fortes nos pontos de maior destaque.

---

## 8. Papel do site dentro do ecossistema M.A

O domínio principal funciona atualmente como página institucional e de confiança.

Fluxo esperado:

**Anúncio / Rede Social / Landing Page → maconfeccoes.com.br → validação da empresa / contato / acesso ao MA System**

O site definitivo poderá futuramente evoluir para:

- loja virtual;
- catálogo;
- personalização de produtos;
- checkout;
- pagamento;
- frete;
- área de clientes;
- integração com MA System;
- campanhas;
- produtos MA Smart;
- novas soluções digitais.

---

## 9. Publicação na Hostinger

A Hostinger oferece suporte a aplicações Next.js/Node.js em Web App Hosting.

Fluxo recomendado:

1. validar o projeto localmente;
2. executar build de produção;
3. enviar o projeto para um repositório Git;
4. criar uma Node.js Web App na Hostinger;
5. conectar o repositório;
6. selecionar a branch de produção;
7. deixar a Hostinger detectar Next.js;
8. executar o deploy;
9. apontar `maconfeccoes.com.br` para a nova aplicação;
10. confirmar SSL;
11. testar desktop e celular.

A hospedagem Node.js gerenciada da Hostinger pode fazer build e redeploy automático a cada push para o repositório conectado.

---

## 10. Checklist antes de publicar

- [ ] `npm run build` concluído sem erros.
- [ ] `public/logo-ma.jpg` presente.
- [ ] `public/MA-SITE-CONFECCOES.png` presente.
- [ ] `public/ma-SITE-BRINDES.png` presente.
- [ ] `public/MA-SITE-BEBES.png` presente.
- [ ] links do WhatsApp funcionando.
- [ ] Instagram funcionando.
- [ ] botão MA System abrindo `app.maconfeccoes.com.br`.
- [ ] layout desktop validado.
- [ ] layout mobile validado.
- [ ] domínio principal apontado para o novo Web App.
- [ ] HTTPS/SSL ativo.

---

## 11. Checkpoint

**Checkpoint 21/08/2026**

O site institucional temporário da M.A Confecções e Brindes está visualmente aprovado para sua função atual.

Objetivo atingido:

- substituir a aparência fraca do WordPress anterior;
- apresentar uma identidade premium;
- aumentar a confiança de visitantes vindos de landing pages;
- criar presença institucional antes da loja virtual definitiva;
- conectar a marca física ao ecossistema MA System.

A partir deste checkpoint, mudanças devem ser tratadas como melhorias, correções ou evolução para o site/loja definitiva, e não como pendências do site institucional temporário.
