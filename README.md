# Ponto Certo SP

O Ponto Certo SP ajuda passageiros de ônibus municipais a escolher um ponto e a acompanhar as próximas chegadas em São Paulo. Os dados de transporte vêm da **SPTrans · API Olho Vivo**.

## GS 2026.2 · Cross-Platform Application Development

A versão mobile em **React Native com Expo** usa o GPS do celular para ordenar os pontos encontrados na busca. O passageiro pode escolher uma linha e um destino e receber um aviso quando a previsão atingir o limite de 3, 5 ou 10 minutos. O acompanhamento ocorre com a tela de previsões aberta.

| Aluno | RM | Turma | Professor |
| --- | --- | --- | --- |
| Matheus Costa Cutrim | 568087 | 2CCPR | Rodrigo Moraes |

```bash
cd mobile
npm ci
npx expo start
```

Veja os [pré-requisitos, instruções para o celular e roteiro do vídeo](mobile/README.md) e a [divisão do trabalho](PARTICIPANTES.txt).

## Painel web · Application Development

Aplicativo web para consultar as próximas chegadas de ônibus nos pontos de São Paulo, utilizando dados da API Olho Vivo da SPTrans.

Projeto desenvolvido para a **Global Solution 2026.2**, da disciplina **Application Development**, do curso de Ciência da Computação da FIAP.

## Identificação

| Informação | Dados |
| --- | --- |
| Aluno | Matheus Costa Cutrim |
| RM | 568087 |
| Turma | 2CCPR |
| Professor | Rodrigo Moraes |
| Disciplina | Application Development |

A descrição da contribuição está no arquivo [PARTICIPANTES.txt](PARTICIPANTES.txt).

## Acesso ao projeto

- [Aplicativo publicado na Vercel](https://ponto-certo-sp.vercel.app/)
- [Repositório no GitHub](https://github.com/matheus-ccutrim-cs/ponto-certo-sp)

## Visão geral

Quem utiliza ônibus precisa de informações sobre as próximas chegadas para organizar seus deslocamentos e reduzir a incerteza durante a espera.

O Ponto Certo SP reúne essas informações em uma interface que permite buscar pontos por nome ou endereço, selecionar o local desejado e consultar os veículos previstos para chegar até ele.

O painel apresenta a identificação da linha, o destino, o horário previsto e o tempo estimado de espera. Também permite filtrar veículos acessíveis e salvar pontos consultados com frequência.

A solução se relaciona ao tema **Citizen Intelligence & Predictive Analytics** ao transformar dados públicos de mobilidade e previsões fornecidas pela SPTrans em informações que apoiam decisões cotidianas dos passageiros.

## Objetivos

### Objetivo geral

Facilitar o planejamento de deslocamentos por ônibus em São Paulo por meio do acesso às previsões de chegada da API Olho Vivo.

### Objetivos específicos

- Permitir a localização de pontos por nome ou endereço.
- Apresentar as próximas chegadas em ordem crescente de espera.
- Informar a linha e o destino de cada veículo previsto.
- Destacar a indicação de acessibilidade dos veículos.
- Permitir o armazenamento de pontos favoritos no navegador.
- Atualizar as previsões automaticamente e por solicitação do usuário.
- Disponibilizar uma interface responsiva para celulares e computadores.
- Utilizar dados públicos com identificação da fonte.

## Público beneficiado

O aplicativo atende passageiros de ônibus municipais de São Paulo, especialmente pessoas que consultam os mesmos pontos diariamente e usuários que precisam identificar veículos acessíveis.

As informações ajudam o passageiro a avaliar a espera prevista em um ponto e acompanhar as linhas que atendem ao local.

## Funcionalidades

| Funcionalidade | Descrição |
| --- | --- |
| Busca de pontos | Consulta pontos pelo nome ou endereço informado. |
| Identificação do ponto | Exibe nome, endereço e código para diferenciar os resultados. |
| Previsões de chegada | Apresenta linha, destino, horário previsto e minutos de espera. |
| Ordenação das previsões | Prioriza os veículos com menor tempo estimado de chegada. |
| Filtro de acessibilidade | Exibe somente veículos indicados como acessíveis pela SPTrans. |
| Pontos favoritos | Permite salvar e remover pontos no navegador. |
| Atualização automática | Realiza novas consultas de previsão a cada 30 segundos enquanto o ponto está selecionado. |
| Atualização manual | Disponibiliza o botão “Atualizar agora”. |
| Estados da interface | Informa carregamento, ausência de resultados e falhas nas consultas. |
| Layout responsivo | Adapta a apresentação ao espaço disponível na tela. |

## Tecnologias utilizadas

- **HTML5** para a estrutura das páginas.
- **CSS3** para o layout, a apresentação visual e a responsividade.
- **JavaScript com módulos ES** para a interação com o usuário e o processamento das previsões.
- **Node.js 24** para o servidor local e a integração com a SPTrans.
- **Vercel Functions** para executar a integração no ambiente publicado.
- **localStorage** para armazenar os pontos favoritos no navegador.
- **Node.js Test Runner** para os testes automatizados.
- **Git e GitHub** para versionamento e disponibilização do código.

O projeto utiliza recursos nativos do Node.js e dispensa a instalação de dependências npm.

## Organização do projeto

| Caminho | Responsabilidade |
| --- | --- |
| `public/index.html` | Estrutura da interface e controles de busca, favoritos e previsões. |
| `public/style.css` | Estilos visuais e regras de responsividade. |
| `public/app.js` | Busca, seleção de pontos, favoritos, filtro e atualização das previsões. |
| `public/previsoes.js` | Conversão dos horários e ordenação das chegadas. |
| `api/olho-vivo.js` | Entrada da função executada pela Vercel. |
| `lib/olho-vivo.js` | Autenticação, gerenciamento dos cookies e consultas à SPTrans. |
| `lib/request.js` | Validação das solicitações e tratamento das respostas da integração. |
| `scripts/dev.js` | Servidor local e modo de demonstração. |
| `test/project.test.js` | Testes automatizados dos principais comportamentos da integração. |
| `.env.example` | Modelo de configuração da variável de ambiente. |
| `.gitignore` | Regras de exclusão de arquivos locais do versionamento. |
| `vercel.json` | Configuração de publicação. |
| `PARTICIPANTES.txt` | Identificação e contribuição individual. |

## Integração com a API Olho Vivo

A integração utiliza os seguintes endpoints da SPTrans.

| Método | Endpoint | Finalidade |
| --- | --- | --- |
| POST | `/Login/Autenticar?token=...` | Autenticar o aplicativo e obter os cookies de sessão. |
| GET | `/Parada/Buscar?termosBusca=...` | Buscar pontos por nome ou endereço. |
| GET | `/Previsao/Parada?codigoParada=...` | Consultar as previsões de chegada de um ponto. |

### Fluxo de funcionamento

1. O usuário informa um nome ou endereço na busca.
2. O navegador envia uma solicitação ao endpoint `/api/olho-vivo` do aplicativo.
3. O servidor autentica na SPTrans e utiliza os cookies de sessão para consultar os dados.
4. A interface apresenta os pontos encontrados.
5. Ao selecionar um ponto, o aplicativo consulta suas previsões.
6. Os veículos são organizados pelo tempo previsto até a chegada.
7. Novas consultas são realizadas automaticamente a cada 30 segundos.

O token é lido pela aplicação no servidor por meio da variável `SPTRANS_TOKEN`.

A sessão é reutilizada enquanto estiver disponível na instância do servidor. Caso uma consulta retorne HTTP 401 ou 403, a integração realiza uma nova autenticação e repete a consulta uma vez.

### Cálculo do tempo de espera

O tempo exibido é calculado pela diferença entre o horário previsto de chegada do veículo e o horário de referência informado pela SPTrans.

O cálculo considera a virada do dia. Por exemplo, uma consulta com referência às 23h58 e chegada prevista para 00h05 resulta em sete minutos de espera.

As previsões são produzidas pela SPTrans e podem mudar entre consultas.

## Como executar localmente

### Pré-requisitos

- Node.js 24.
- Git, caso o projeto seja obtido por clonagem.
- Acesso à internet.
- Token ativo da API Olho Vivo para consultar dados reais.

### 1. Obter o código

Clone o repositório e entre na pasta do projeto.

```bash
git clone https://github.com/matheus-ccutrim-cs/ponto-certo-sp.git
cd ponto-certo-sp
```

Também é possível baixar o ZIP pelo GitHub, extraí-lo e abrir um terminal na pasta que contém o arquivo `package.json`.

### 2. Configurar o token

Na área de desenvolvedores da SPTrans, crie uma conta, acesse “Meus Aplicativos” e cadastre um aplicativo para obter a chave de acesso.

Copie o arquivo `.env.example` para `.env`.

No Windows, pelo Prompt de Comando ou PowerShell, execute:

```bat
copy .env.example .env
```

No macOS ou Linux, execute:

```bash
cp .env.example .env
```

Abra o arquivo `.env` e preencha a variável com o token ativo.

```dotenv
SPTRANS_TOKEN=COLE_SEU_TOKEN_AQUI
```

Substitua `COLE_SEU_TOKEN_AQUI` pelo valor da chave, sem espaços ao redor.

O `.env` está incluído nas regras do `.gitignore`. Mantenha o token privado e utilize `.env.example` como modelo compartilhável.

### 3. Iniciar o aplicativo

```bash
npm start
```

No PowerShell do Windows, se houver bloqueio da execução de `npm.ps1`, utilize:

```bat
npm.cmd start
```

Acesse o aplicativo no navegador.

[http://localhost:3000](http://localhost:3000)

Para encerrar o servidor, pressione `Ctrl+C` no terminal.

## Como utilizar

1. Digite o nome ou endereço do ponto, como “Paulista”.
2. Clique em **Buscar pontos**.
3. Confira o endereço e o código dos resultados.
4. Selecione o ponto desejado.
5. Consulte a linha, o destino, o horário previsto e os minutos de espera.
6. Marque **Só veículos acessíveis** para aplicar o filtro.
7. Clique em **Salvar ponto** para adicioná-lo aos favoritos.
8. Utilize **Atualizar agora** para solicitar uma nova consulta.

Os favoritos ficam armazenados no navegador utilizado. Ao voltar ao aplicativo nesse navegador, os pontos salvos podem ser selecionados novamente.

## Modo de demonstração

Para conhecer a interface com dados fictícios, execute:

```bash
npm run demo
```

No PowerShell do Windows, também é possível utilizar:

```bat
npm.cmd run demo
```

Abra [http://localhost:3000](http://localhost:3000).

Nesse modo, a página exibe a indicação de simulação.

- Busque **Paulista** para visualizar pontos e previsões fictícias.
- Busque **Praça da Sé** para visualizar um ponto sem chegadas previstas.
- Teste o filtro de acessibilidade e o armazenamento dos favoritos.

O modo de demonstração utiliza uma lista própria de favoritos. Para consultar a SPTrans, encerre o servidor de demonstração e execute `npm start` com o token configurado.

## Testes automatizados

Execute na pasta do projeto:

```bash
npm test
```

No PowerShell do Windows, também é possível utilizar:

```bat
npm.cmd test
```

Os testes verificam os seguintes comportamentos.

- Validação dos parâmetros recebidos.
- Resposta quando a configuração do token está ausente.
- Encaminhamento correto da busca.
- Envio dos cookies de sessão à SPTrans.
- Renovação da autenticação após expiração da sessão.
- Ordenação dos veículos pelo tempo de chegada.
- Cálculo de espera durante a virada do dia.
- Preservação da indicação de acessibilidade.

Os testes automatizados utilizam respostas controladas. A integração com dados reais pode ser conferida pela busca e seleção de um ponto no aplicativo.

## Publicação na Vercel

1. Envie o projeto para um repositório no GitHub.
2. Acesse a Vercel e importe o repositório.
3. Selecione **Other** como preset da aplicação.
4. Use a raiz do repositório como **Root Directory**.
5. Adicione a variável de ambiente `SPTRANS_TOKEN` com o token ativo, incluindo o ambiente **Production**.
6. Realize o deploy.
7. Abra a URL publicada e teste a busca e as previsões.

O arquivo `vercel.json` define `public` como a pasta de saída. A integração com a SPTrans é executada pela função localizada em `api/olho-vivo.js`.

Se a variável de ambiente for adicionada ou alterada depois da publicação, realize um novo deploy para aplicar a configuração.

## Usabilidade e acessibilidade

A interface utiliza campos com rótulos, botões com identificação textual, indicação do ponto selecionado e mensagens de status durante as consultas.

Os controles podem ser acessados pelo teclado, com destaque visual de foco. O layout adapta a organização dos painéis para telas menores.

A indicação “Veículo acessível” e o filtro correspondente utilizam o campo de acessibilidade retornado pela SPTrans.

## Decisões de implementação

- **Consulta por ponto** para concentrar as informações no local em que o passageiro pretende embarcar.
- **Ordenação por chegada** para facilitar a identificação dos próximos veículos.
- **Favoritos no navegador** para permitir consultas recorrentes sem exigir cadastro.
- **Integração pelo servidor** para gerenciar a autenticação e os cookies da SPTrans.
- **Separação de responsabilidades** para facilitar a leitura, a manutenção e a explicação do código.
- **HTML, CSS e JavaScript** como base da interface, conforme a proposta da disciplina.

## Fonte dos dados

Os dados de pontos e as previsões de chegada são fornecidos pela **SPTrans**, por meio da **API Olho Vivo**.

O crédito à fonte também aparece no rodapé do aplicativo.

- [Área de desenvolvedores da SPTrans](https://www.sptrans.com.br/desenvolvedores/)
- [Documentação da API Olho Vivo](https://www.sptrans.com.br/desenvolvedores/api-do-olho-vivo-guia-de-referencia/documentacao-api)

## Autor

**Matheus Costa Cutrim**  
RM 568087 · Turma 2CCPR  
FIAP · Ciência da Computação  
Global Solution 2026.2 · Application Development
