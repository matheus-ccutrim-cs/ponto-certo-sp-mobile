# Ponto Certo SP

Aplicativo mobile que ajuda passageiros de ônibus em São Paulo a escolher onde esperar e a acompanhar a chegada da linha desejada. O app combina a localização do celular com as previsões da **API Olho Vivo da SPTrans**.

**Global Solution 2026.2 · Cross-Platform Application Development · FIAP**

Matheus Costa Cutrim · RM 568087 · Turma 2CCPR · Professor Rodrigo Moraes

[Assistir à demonstração no YouTube](https://www.youtube.com/shorts/H8TiinLZo8c) · [Participante e contribuição](PARTICIPANTES.txt)

## Objetivo

Facilitar o embarque ao responder três perguntas do passageiro: qual dos pontos encontrados fica mais perto, quando o próximo ônibus deve chegar e quando é hora de se preparar para embarcar.

## O que o app faz

- Busca pontos de ônibus pelo nome ou endereço e usa o GPS para ordenar os resultados por distância em linha reta. A busca também funciona sem permissão de localização.
- Exibe as próximas chegadas no ponto escolhido, com linha, destino, horário previsto e indicação de acessibilidade quando fornecida pela SPTrans.
- Permite escolher uma linha e um destino e receber um aviso quando a previsão estiver em até 3, 5 ou 10 minutos. O app faz a consulta ao ativar o aviso e atualiza os dados a cada 30 segundos com a tela do ponto aberta em primeiro plano.
- Envia uma notificação local no celular. Se o recurso estiver indisponível ou a permissão for recusada, usa um alerta em tela e vibração.

## Como executar

**Pré-requisitos:** Git, Node.js 24 e um dispositivo Android ou iOS com [Expo Go compatível com o SDK 58](https://expo.dev/go). O computador e o celular devem conseguir se comunicar pela rede local.

```bash
git clone https://github.com/matheus-ccutrim-cs/ponto-certo-sp-mobile.git
cd ponto-certo-sp-mobile/mobile
npm ci
npx expo start --go
```

Conecte o computador e o celular à mesma rede Wi-Fi. Leia o QR Code no Expo Go, no Android, ou pela Câmera, no iPhone. Caso o Expo Go solicite autenticação, entre com a mesma conta Expo no celular e no terminal usando `npx expo login`. Se a rede impedir a conexão direta, use `npx expo start --go --tunnel`.

Na tela inicial, toque em **Usar minha localização** e permita o acesso ao GPS durante o uso. Busque **Paulista**, abra um ponto e selecione uma das previsões. Escolha o limite de minutos, toque em **Ativar aviso** e mantenha a tela do ponto aberta.

O app consulta por padrão o serviço publicado na Vercel. O celular precisa de internet para consultar a SPTrans, e a configuração padrão já inclui o endereço do serviço. A chave da SPTrans fica no servidor.

## Estrutura do projeto

| Caminho | Responsabilidade |
| --- | --- |
| [mobile/](mobile/) | App React Native com Expo, GPS e notificações locais |
| [api/](api/) e [lib/](lib/) | Função HTTP, autenticação e consultas à API Olho Vivo |
| [public/previsoes.js](public/previsoes.js) | Cálculo de espera e ordenação compartilhados com o painel web |
| [mobile/test/](mobile/test/) e [test/](test/) | Testes da lógica de mobilidade e da integração |

Para executar os testes automatizados, rode `npm test` na raiz. Veja também os [detalhes da integração e da execução local](mobile/README.md).

**Fonte dos dados:** [SPTrans · API Olho Vivo](https://www.sptrans.com.br/desenvolvedores/). As previsões são estimativas e podem mudar a cada consulta.
