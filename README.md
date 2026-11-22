<a id="readme-top"></a>

<div align="center">

<h1>Frontend - Acervo de Alexandria</h1>
<h6>E-commerce de livros: catálogo, busca, carrinho, checkout e conta de usuário integrados a uma API REST</h6>
</div>

***

<div align="center">

[![HTML5](https://img.shields.io/badge/HTML5-%23E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-%231572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![JavaScript ES6](https://img.shields.io/badge/JavaScript-ES6--%23F7DF1E?logo=javascript&logoColor=%23323330)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![Render](https://img.shields.io/badge/Render--%23FFFFFF?logo=render)](https://render.com/)

</div>
<hr>

<div align="center">
  <a href="https://github.com/MachadoCodes/frontend_acervo_de_alexandria/blob/main/README.md#readme-top">
    <img src="assets/img/aaLOGOwtriangle.png" alt="Logo" width="300" height="300">
  </a>
</div>

<br>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Guia de conteúdo</summary>
  <ol>
    <li>
      <a href="#sobre-o-projeto">Sobre o Projeto</a>
      <ul>
        <li><a href="#contextualização">Contextualização</a></li>
        <li><a href="#a-proposta">A Proposta</a></li>
      </ul>
    </li>
    <li><a href="#tecnologias-utilizadas">Tecnologias Utilizadas</a></li>
    <li><a href="#funcionalidades">Funcionalidades</a></li>
    <li><a href="#como-funciona">Como Funciona</a></li>
    <li><a href="#interface-do-usuário">Interface do Usuário</a></li>
    <li><a href="#arquitetura-do-projeto">Arquitetura do Projeto</a></li>
    <li><a href="#estrutura-de-pastas">Estrutura de Pastas</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#integração-com-a-api">Integração com a API</a></li>
    <li><a href="#segurança">Segurança</a></li>
    <li><a href="#deploy-no-render">Deploy no Render</a></li>
    <li><a href="#limitações-conhecidas-e-próximos-passos">Limitações Conhecidas e Próximos Passos</a></li>
    <li><a href="#contato">Contato</a></li>
  </ol>
</details>

<br>

## Sobre o Projeto
<p>
  O <b>Acervo de Alexandria</b> é uma livraria online voltada ao público acadêmico. Este repositório contém o <b>frontend</b> da aplicação: um site estático em HTML, CSS e JavaScript puro (sem frameworks e sem etapa de build) que consome a API REST do projeto para listar mais de 11 mil livros, buscar por título ou autor, montar o carrinho, finalizar pedidos e gerenciar a conta do cliente.
</p>

### Contextualização
<p>
  Lojas virtuais de livros acadêmicos lidam com catálogos grandes e públicos variados: estudantes procurando um título específico, professores montando listas de leitura e leitores comuns explorando novidades. Um catálogo desse tamanho exige paginação, busca eficiente e uma interface que continue leve mesmo quando o servidor demora para responder.
</p>
<p>
  Este projeto foi desenvolvido em dupla com o responsável pela API, com divisão clara de responsabilidades: o servidor é a fonte da verdade (preços, estoque, totais e autenticação) e o frontend cuida da experiência de uso.
</p>

### A Proposta
<p>
  Entregar uma experiência de compra completa e segura usando apenas tecnologias da plataforma web. O frontend é totalmente desacoplado da API: conversa com ela por requisições <code>fetch</code> em JSON, nunca confia em dados do navegador para valores sensíveis (o total do pedido é calculado pelo servidor) e trata todo conteúdo recebido como texto, nunca como HTML.
</p>

<br>

<p align="right">(<a href="#readme-top"> ▲ voltar ao topo ▲ </a>)</p>

## Tecnologias utilizadas

<div align="center">

| Tecnologia | Versão | Função |
| :--- | :--- | :--- |
| HTML5 | - | Estrutura semântica das 13 páginas |
| CSS3 | - | Estilo único e responsivo (`css/style.css`) |
| JavaScript | ES2020+ (módulos nativos) | Lógica de interface, estado e integração com a API |
| Fetch API | - | Comunicação assíncrona com a API REST |
| LocalStorage / SessionStorage | - | Carrinho, lista de desejos, sessão (JWT) e dados do checkout |
| Open Library Covers | - | Capas dos livros a partir do ISBN |
| Google Fonts / Material Symbols | - | Tipografia e ícones |
| Render | Static Site | Hospedagem em nuvem do frontend |

</div>

<p><i>
  Nota: este repositório contém apenas o frontend. A API (Spring Boot, PostgreSQL) está em: <a href="https://github.com/MiguelRebequi/api_acervo_alexandria">api_acervo_alexandria</a>. Não é necessário instalar Node.js nem nenhum gerenciador de pacotes para rodar o frontend.
</i></p>

<br>

<p align="right">(<a href="#readme-top"> ▲ voltar ao topo ▲ </a>)</p>

## Funcionalidades

<ul>
  <li><b>Catálogo e home:</b> prateleiras com os livros mais bem avaliados e os lançamentos, carregados da API.</li>
  <li><b>Busca no servidor:</b> pesquisa por título ou autor (sem diferenciar acentos), com paginação e botão "Carregar mais".</li>
  <li><b>Filtros:</b> por formato, avaliação e ano de lançamento.</li>
  <li><b>Página do livro:</b> capa, autor, preço, estoque, sinopse e ficha técnica (editora, idioma, formato, ISBN, ano).</li>
  <li><b>Carrinho e lista de desejos:</b> guardados no navegador, com controle de quantidade e validação contra o catálogo.</li>
  <li><b>Checkout em etapas:</b> entrega (com login ou como visitante) e pagamento (cartão com até 4 parcelas, Pix, carteira digital, PayPal, criptomoeda ou boleto) com cupons de desconto.</li>
  <li><b>Pedido real na API:</b> o frontend envia itens, entrega, pagamento e cupom; o servidor calcula subtotal, frete, desconto e total, e a tela de confirmação mostra o valor oficial.</li>
  <li><b>Conta do usuário:</b> cadastro, login (JWT), menu da conta, página "Meu perfil" para editar dados e trocar a senha.</li>
  <li><b>Resiliência:</b> aviso enquanto a API acorda (o plano gratuito do Render hiberna), tempo limite nas chamadas, capas com imagem reserva e catálogo de exemplo quando a API está fora do ar.</li>
</ul>

<br>

<p align="right">(<a href="#readme-top"> ▲ voltar ao topo ▲ </a>)</p>

## Como Funciona

<ol>
  <li>O visitante abre o site e o frontend carrega os livros da API (<code>GET /livros</code>), exibindo um aviso caso o servidor esteja acordando.</li>
  <br>
  <li>Ele navega pelas prateleiras ou pesquisa por título ou autor. A busca é feita no servidor, página por página.</li>
  <br>
  <li>Na página do livro, adiciona o item ao carrinho (guardado no navegador).</li>
  <br>
  <li>No carrinho, ajusta as quantidades e segue para a <b>entrega</b>. Quem já tem conta entra na própria tela (login real na API); em qualquer caso informa o endereço de entrega e o método (padrão ou expresso).</li>
  <br>
  <li>No <b>pagamento</b>, escolhe a forma de pagamento e, se quiser, aplica um cupom. O resumo exibe uma prévia do total.</li>
  <br>
  <li>Ao confirmar, o frontend envia o pedido para <code>POST /pedidos</code>. O servidor valida estoque e cupom, calcula o total oficial e devolve o número do pedido.</li>
  <br>
  <li>A página de <b>confirmação</b> mostra o número do pedido e o total calculado pela API. O carrinho local é limpo.</li>
</ol>

<p><i>
  Observação: o pagamento é simulado. Não há gateway: nenhum dado de cartão é coletado para a API nem guardado no navegador.
</i></p>

<br>

<p align="right">(<a href="#readme-top"> ▲ voltar ao topo ▲ </a>)</p>

## Interface do Usuário

<p>Páginas do projeto:</p>

<div align="center">

| Página | Arquivo | Descrição |
| :--- | :--- | :--- |
| Início | `index.html` | Banners, prateleiras de livros, login e menu da conta |
| Resultado da busca | `resultado-busca.html` | Busca e filtros, com paginação |
| Livro | `produto.html` | Detalhes, ficha técnica e adicionar ao carrinho |
| Carrinho | `carrinho.html` | Itens, quantidades e resumo |
| Entrega | `entrega.html` | Login ou visitante, endereço e método de entrega |
| Pagamento | `pagamento.html` | Formas de pagamento, cupom e resumo |
| Pedido confirmado | `sucesso.html` | Número do pedido e total |
| Cadastro | `cadastro.html` e `sucesso-cadastro.html` | Criação de conta |
| Meu perfil | `perfil.html` | Dados da conta, troca de senha |
| Lista de desejos | `wishlist.html` | Livros favoritados |
| Termos e privacidade | `termos.html` e `privacidade.html` | Páginas institucionais |

</div>

<!--
  Para exibir capturas de tela aqui, salve as imagens em assets/img/screenshots/ e use, por exemplo:

  <div align="center">
    <img src="assets/img/screenshots/home.png" alt="Página inicial" width="800">
    <br>
    <img src="assets/img/screenshots/busca.png" alt="Resultado da busca" width="800">
    <br>
    <img src="assets/img/screenshots/checkout.png" alt="Checkout" width="800">
  </div>
-->

<br>

<p align="right">(<a href="#readme-top"> ▲ voltar ao topo ▲ </a>)</p>

## Arquitetura do projeto

A aplicação segue o paradigma **Client-Server (Desacoplado)**: o frontend é um site estático e a API REST é a única fonte de dados e de regras de negócio. No frontend, o código é dividido em módulos ES com responsabilidades separadas:

<ul>
  <li><b>Integração (<code>api.js</code>, <code>config.js</code>):</b> todas as chamadas HTTP, tratamento de erros, tempo limite, token JWT e URL da API em um único lugar.</li>
  <li><b>Domínio (<code>catalogo.js</code>, <code>store.js</code>):</b> converte os livros da API para o formato interno e mantém carrinho, lista de desejos e dados do checkout, sempre revalidados contra o catálogo.</li>
  <li><b>Interface (<code>ui.js</code>, <code>conta.js</code>):</b> componentes compartilhados (cartões de livro, formatação de moeda, menu da conta).</li>
  <li><b>Páginas (<code>index.js</code>, <code>search.js</code>, <code>produto.js</code>, <code>carrinho.js</code>, <code>entrega.js</code>, <code>pagamento.js</code>, <code>pedido.js</code>, <code>perfil.js</code>, ...):</b> um módulo por página, que só orquestra os módulos acima.</li>
</ul>

```
┌─────────────────────────────────────────────────────────────┐
│                  Páginas (HTML + js/<pagina>.js)            │
│   (index, busca, produto, carrinho, entrega, pagamento...)  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│        Domínio e interface (catalogo, store, ui, conta)     │
│   (Catálogo, carrinho, lista de desejos, componentes)       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                 Integração (api.js, config.js)              │
│        (fetch, JWT, tempo limite, tratamento de erros)      │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS (CORS)
┌──────────────────────▼──────────────────────────────────────┐
│                 API REST (Spring Boot, Render)              │
│           (Livros, usuários, pedidos, autenticação)         │
└─────────────────────────────────────────────────────────────┘
```

<br>

<p align="right">(<a href="#readme-top"> ▲ voltar ao topo ▲ </a>)</p>

## Estrutura de Pastas

```text
frontend_acervo_de_alexandria/
├── assets/
│   └── img/                    # Logo, banners e imagem reserva de capa
├── css/
│   └── style.css               # Estilo único de todas as páginas
├── js/
│   ├── api.js                  # Chamadas à API, JWT e tratamento de erros
│   ├── config.js               # URL da API e parâmetros de paginação
│   ├── catalogo.js             # Livros da API -> formato do frontend (e catálogo de exemplo)
│   ├── store.js                # Carrinho, lista de desejos e dados do checkout
│   ├── ui.js                   # Componentes e formatação compartilhados
│   ├── conta.js                # Menu da conta e avatar
│   ├── index.js                # Home, login e cadastro rápido
│   ├── search.js               # Busca, filtros e paginação
│   ├── produto.js              # Página do livro
│   ├── carrinho.js             # Carrinho
│   ├── entrega.js              # Etapa de entrega e login
│   ├── pagamento.js            # Etapa de pagamento e cupons
│   ├── pedido.js               # Monta e envia o pedido para a API
│   ├── sucesso.js              # Confirmação do pedido
│   ├── cadastro.js             # Cadastro de usuário
│   ├── perfil.js               # Meu perfil
│   └── wishlist.js             # Lista de desejos
├── index.html                  # Páginas do site (13 arquivos .html na raiz)
├── ...
├── package.json                # Metadados do projeto (não há dependências)
└── README.md
```

<br>

<p align="right">(<a href="#readme-top"> ▲ voltar ao topo ▲ </a>)</p>

## Getting started
<p>Siga estas instruções para executar o frontend em sua máquina para desenvolvimento e teste.</p>

### Pré-requisitos

<ul>
  <li><b>Navegador moderno</b> (Chrome, Edge, Firefox ou Safari atuais).</li>
  <li><b>Git</b>, para clonar o repositório.</li>
  <li><b>Um servidor HTTP local:</b> o projeto usa módulos ES (<code>&lt;script type="module"&gt;</code>), que <u>não funcionam</u> abrindo o arquivo com um duplo clique (<code>file://</code>). Qualquer uma das opções abaixo serve.</li>
  <li><i>Opcional:</i> JDK 21 e o repositório da API, caso queira rodar a API na sua máquina.</li>
</ul>

### Clonar e executar

```sh
git clone https://github.com/MachadoCodes/frontend_acervo_de_alexandria
cd frontend_acervo_de_alexandria
```

Escolha **uma** forma de servir os arquivos:

<ol>
  <li><b>WebStorm / IntelliJ:</b> abra o <code>index.html</code> e clique em um dos ícones de navegador que aparecem no canto superior direito do editor (endereço <code>http://localhost:63342</code>).</li>
  <li><b>VS Code:</b> instale a extensão <i>Live Server</i> e clique em "Go Live" (endereço <code>http://127.0.0.1:5500</code>).</li>
  <li><b>Python:</b> na pasta do projeto, execute:

```sh
python -m http.server 5500
```

e abra <code>http://localhost:5500</code>.</li>
</ol>

<p>
  Por padrão o site usa a API publicada no Render. Na primeira chamada o servidor pode levar cerca de 1 minuto para acordar (plano gratuito); o site exibe um aviso enquanto isso.
</p>

### Usar uma API local (opcional)

<ol>
  <li>Rode a API em <code>http://localhost:8080</code> (veja o repositório <a href="https://github.com/MiguelRebequi/api_acervo_alexandria">api_acervo_alexandria</a>) e libere a origem do seu servidor local na variável <code>CORS_ALLOWED_ORIGINS</code> da API.</li>
  <br>
  <li>Aponte o site para ela, no console do navegador (F12):

```js
localStorage.setItem('acervo_api_url', 'http://localhost:8080');
```
  </li>
  <br>
  <li>Adicione <code>http://localhost:8080</code> ao <code>connect-src</code> da política de segurança (<code>&lt;meta http-equiv="Content-Security-Policy"&gt;</code>) das páginas <b>apenas na sua cópia local</b>; não faça commit dessa alteração.</li>
</ol>

<p>Para voltar à API padrão: <code>localStorage.removeItem('acervo_api_url')</code>.</p>

<br>

<p align="right">(<a href="#readme-top"> ▲ voltar ao topo ▲ </a>)</p>

## Integração com a API

<p>
  A URL da API é definida em <code>js/config.js</code>. A configuração só aceita endereços <code>https://</code> (ou <code>http://localhost</code> para desenvolvimento). Endpoints utilizados pelo frontend:
</p>

<div align="center">

| Método | Endpoint | Protegido | Uso no frontend |
| :--- | :--- | :---: | :--- |
| GET | `/livros` | Não | Home e busca (paginado e ordenável) |
| GET | `/livros/busca` | Não | Busca por título ou autor |
| GET | `/livros/{id}` | Não | Página do livro |
| POST | `/usuarios` | Não | Cadastro de usuário |
| POST | `/login` | Não | Login (retorna o JWT) |
| GET | `/usuarios/me` | Sim | Carregar o perfil |
| PUT | `/usuarios/me` | Sim | Atualizar nome, telefones e endereço |
| PATCH | `/usuarios/me/senha` | Sim | Trocar a senha (confere a senha atual) |
| POST | `/pedidos` | Sim | Finalizar o pedido |

</div>

<p>Corpo enviado em <code>POST /pedidos</code>:</p>

```json
{
  "itens": [{ "livroId": 12, "quantidade": 2 }],
  "entrega": {
    "metodo": "STANDARD",
    "nome": "Ana", "sobrenome": "Souza", "email": "ana@email.com",
    "pais": "br", "cep": "01000-000", "estado": "SP", "cidade": "São Paulo",
    "endereco": "Rua Exemplo", "numero": "10",
    "complemento": null, "observacoes": null
  },
  "pagamento": { "metodo": "PIX", "parcelas": 1 },
  "cupom": "ALEXANDRIA10"
}
```

<p>
  Valores: entrega <code>STANDARD</code> (R$ 15,90) ou <code>EXPRESS</code> (R$ 32,90); pagamento <code>CREDIT_CARD</code>, <code>PIX</code>, <code>DIGITAL_WALLET</code>, <code>PAYPAL</code>, <code>CRYPTO</code> ou <code>BOLETO</code>; cupons <code>ALEXANDRIA10</code> (10% nos livros) e <code>BEMVINDO20</code> (R$ 20,00, uma vez por cliente); Pix com 5% de desconto e criptomoeda com 2% de taxa. A tela de pagamento mostra uma <b>prévia</b>; o valor oficial é sempre o calculado pela API.
</p>

<br>

<p align="right">(<a href="#readme-top"> ▲ voltar ao topo ▲ </a>)</p>

## Segurança

<ul>
  <li><b>Política de Segurança de Conteúdo (CSP)</b> em todas as páginas, sem <code>'unsafe-inline'</code> para scripts e estilos: só executa código do próprio site e só se conecta à API configurada.</li>
  <li><b>Sem injeção de HTML:</b> todo texto vindo da API ou digitado pelo usuário é inserido com <code>textContent</code>, nunca como HTML.</li>
  <li><b>URL da API validada:</b> apenas <code>https</code> (ou localhost em desenvolvimento).</li>
  <li><b>Valores sensíveis no servidor:</b> preço, estoque, frete, desconto e total são calculados e validados pela API; o frontend só exibe.</li>
  <li><b>Dados do carrinho revalidados:</b> tudo que é lido do <code>localStorage</code> é conferido contra o catálogo, pois o usuário pode editar esse armazenamento.</li>
  <li><b>Sessão:</b> o JWT fica no <code>localStorage</code> e expirado é descartado automaticamente; no logout também são apagados os dados do checkout (nome e endereço). Como em qualquer SPA estática, um ataque XSS seria o principal risco, e a CSP rigorosa existe justamente para mitigá-lo.</li>
  <li><b>Pagamento simulado:</b> nenhum dado de cartão sai do formulário nem é armazenado.</li>
</ul>

<br>

<p align="right">(<a href="#readme-top"> ▲ voltar ao topo ▲ </a>)</p>

## Deploy no Render

<p>O frontend é publicado como <b>Static Site</b> no Render, a partir da branch <code>develop</code>:</p>

<div align="center">

| Configuração | Valor |
| :--- | :--- |
| Build Command | `mkdir -p dist && cp -r *.html css js assets dist/` |
| Publish Directory | `dist` |

</div>

<p>
  Ao publicar, inclua a origem do site (por exemplo <code>https://frontend-acervo-de-alexandria.onrender.com</code>, sem barra no final) na variável <code>CORS_ALLOWED_ORIGINS</code> da API, e mantenha o mesmo endereço da API em <code>js/config.js</code> e no <code>connect-src</code> da CSP.
</p>
<p><i>
  Atenção: no Linux (Render) maiúsculas e minúsculas importam. Mantenha a pasta de imagens como <code>assets/</code> (minúscula) e confira o nome exato dos arquivos nos caminhos.
</i></p>

<br>

<p align="right">(<a href="#readme-top"> ▲ voltar ao topo ▲ </a>)</p>

## Limitações conhecidas e próximos passos

<ul>
  <li>O carrinho e a lista de desejos ficam só no navegador (não sincronizam entre dispositivos).</li>
  <li>O pagamento é simulado, sem gateway.</li>
  <li>A foto de perfil é guardada apenas no navegador; a API já oferece endpoints para armazená-la no servidor.</li>
  <li>A recuperação de senha ainda não está integrada à API (<code>POST /login/redefinir-senha</code>).</li>
  <li>O histórico de pedidos (<code>GET /pedidos/historico</code>) ainda não tem tela.</li>
  <li>Filtro por categoria no servidor (<code>?categoria=</code>) e por faixa de preço ainda não conectados à interface.</li>
  <li>Algumas imagens dos banners são pesadas e podem ser otimizadas.</li>
</ul>

<br>

<p align="right">(<a href="#readme-top"> ▲ voltar ao topo ▲ </a>)</p>

<!--
## Licença
<p>Distribuído sob a licença MIT. Veja <code>LICENSE</code> para mais informações.</p>
(Para ativar: adicione o arquivo LICENSE ao repositório e remova os comentários desta seção.)

## Agradecimentos
(Adicione aqui professores, instituição ou quem contribuiu com o projeto.)
-->

## Contato

<table align="center">
  <tr>
    <td align="center" valign="top">
      <a href="https://github.com/MachadoCodes">
        <img src="https://avatars.githubusercontent.com/u/142549072" width="200px;" alt="Renato Gonçalves Machado"/>
      </a>
      <br />
      <p><b>Renato Gonçalves Machado</b></p>
      <p><a href="">LinkedIn</a> | <a href="https://github.com/MachadoCodes">GitHub</a></p>
    </td>
    <td align="center" valign="top">
      <a href="https://github.com/MiguelRebequi">
        <img src="https://avatars.githubusercontent.com/u/130229587" width="200px;" alt="Miguel Martinho Rebequi"/>
      </a>
      <br />
      <p><b>Miguel Martinho Rebequi</b></p>
      <p><a href="https://www.linkedin.com/in/miguel-martinho-rebequi-08753b271/">LinkedIn</a> | <a href="https://github.com/MiguelRebequi">GitHub</a></p>
    </td>
    <td align="center" valign="top">
      <a href="">
        <img src="" width="200px;" alt="Marcus Vinícuis"/>
      </a>
      <br />
      <p><b>Marcus Vinícuis</b></p>
      <p><a href="">LinkedIn</a> | <a href="">GitHub</a></p>
    </td>
  </tr>
</table>

<br>

<p align="right">(<a href="#readme-top"> ▲ voltar ao topo ▲ </a>)</p>