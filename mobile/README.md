# Aplicativo mobile

O [README principal](../README.md) apresenta o Ponto Certo SP, os requisitos de instalação e a demonstração em vídeo. A versão mobile usa React Native, Expo SDK 58, Expo Location e Expo Notifications.

## Código

| Arquivo | Responsabilidade |
| --- | --- |
| `src/App.js` | Busca, seleção do ponto e interface de previsões e avisos |
| `src/api.js` | Requisições HTTP e tratamento de falhas de conexão |
| `src/mobility.mjs` | Cálculo de distância por Haversine, ordenação de pontos e seleção da previsão que aciona o aviso |
| `src/native.js` | GPS, permissões, notificação local, alerta e vibração |
| `src/useArrivals.js` | Atualização das previsões em primeiro plano e encerramento do acompanhamento ao sair do ponto |
| `../public/previsoes.js` | Conversão de horários em minutos de espera, incluindo a virada da meia-noite |

As coordenadas do usuário são usadas no aparelho para ordenar os pontos retornados pela busca. A busca e as previsões usam os endpoints `Parada/Buscar` e `Previsao/Parada` da SPTrans, acessados pela função HTTP do projeto. O aviso dispara uma vez para a linha e o destino selecionados quando a previsão atende ao limite escolhido.

## Serviço local ou alternativo

Para executar a integração localmente, copie o `.env.example` da raiz para `.env`, configure `SPTRANS_TOKEN` e rode `npm start` na raiz. Para usar dados simulados, rode `npm run demo` na raiz. O app identifica as respostas simuladas na interface.

Para apontar a versão mobile para esse serviço, copie `mobile/.env.example` para `mobile/.env` e preencha `EXPO_PUBLIC_API_URL` com o endereço completo do endpoint. Em um celular físico, use o IP do computador que o celular alcança, por exemplo `http://192.168.1.20:3000/api/olho-vivo`. Reinicie o Expo após mudar a configuração.

## Verificação

A partir de `mobile/`, execute `npm test` para verificar a ordenação por distância e a regra de disparo do aviso. Use `npx expo export --platform all` para gerar os bundles de Android e iOS.
