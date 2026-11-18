# Ponto Certo SP · React Native

**Global Solution 2026.2 · Cross-Platform Application Development**  
FIAP · Ciência da Computação · Citizen Intelligence & Predictive Analytics  
Matheus Costa Cutrim · RM 568087 · 2CCPR · Professor Rodrigo Moraes

Quem depende de ônibus precisa decidir em qual ponto esperar e acompanhar a chegada da linha desejada. O app busca pontos pelo nome ou endereço, usa a localização do celular para ordenar os resultados por proximidade e apresenta previsões reais da SPTrans. O passageiro pode receber um aviso de chegada para uma linha e destino do ponto selecionado.

## Executar em um celular

1. Instale o Node.js 24 no computador e o Expo Go compatível com **Expo SDK 58** no celular. No Android, a [página do Expo Go](https://expo.dev/go) oferece APK por SDK. No iPhone, confira a [compatibilidade do Expo Go com o SDK](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/).
2. Abra no terminal a raiz do repositório ou da pasta extraída e execute:

   ```bash
   cd mobile
   npm ci
   npx expo start
   ```

3. Com os dois dispositivos na mesma rede Wi-Fi, leia o QR Code com o Expo Go no Android ou a câmera do iPhone. Se a rede bloquear a conexão, execute `npx expo start --tunnel`.
4. Toque em **Usar minha localização**, permita o GPS durante o uso e busque **Paulista** ou uma via de São Paulo que você usa. Confira a distância nos resultados.
5. Abra um ponto com previsões, selecione uma linha e um destino, escolha **3, 5 ou 10 min** e toque em **Ativar aviso**. Mantenha a tela de previsões aberta. Se já houver uma chegada dentro do limite, o aviso pode disparar na consulta seguinte, iniciada ao ativá-lo.

Por padrão, o app usa a [função publicada na Vercel](https://ponto-certo-sp.vercel.app/api/olho-vivo?acao=buscar&termo=Paulista). A variável `SPTRANS_TOKEN` fica no servidor. O aplicativo usa apenas a URL pública da função. Para usar outro servidor, copie `.env.example` de `mobile/` para `.env` na mesma pasta, edite `EXPO_PUBLIC_API_URL` com a URL completa do endpoint e reinicie o Expo. Ao hospedar a função localmente, use o IP do computador acessível pelo celular e configure `SPTRANS_TOKEN` no `.env` da raiz. Para um ensaio com dados fictícios, rode `npm run demo` na raiz e aponte o app para essa instância. Ela identifica as consultas simuladas na interface.

## Fluxo e decisões técnicas

- **Busca e GPS.** A busca usa `Parada/Buscar`. A localização pontual vem de `expo-location` após a permissão. A fórmula de Haversine calcula a distância em linha reta no celular e ordena os resultados da busca. O cidadão pode atualizar a posição ou continuar pesquisando após recusar o GPS.
- **Previsões.** `Previsao/Parada` retorna as linhas e os veículos previstos. O app usa o horário da própria resposta para calcular a espera, trata a virada da meia-noite e exibe o horário estimado e a indicação de acessibilidade da SPTrans.
- **Aviso.** O app consulta ao abrir o ponto, ao atualizar manualmente, ao ativar o aviso e a cada 30 segundos em primeiro plano. A primeira previsão da linha e do destino escolhidos que atingir o limite dispara um aviso único. Ao sair do ponto, o acompanhamento é encerrado.
- **Permissões.** Se a notificação local estiver indisponível ou a permissão for recusada, o app usa um alerta em tela e vibração. O GPS é solicitado ao tocar no botão de localização. A posição é usada no aparelho para calcular as distâncias.
- **Dados.** A função Node.js na Vercel autentica na API Olho Vivo e conserva o cookie da SPTrans. O crédito aparece no rodapé do app. A previsão pode mudar entre consultas e a distância exibida é em linha reta.

| Arquivo | Função |
| --- | --- |
| `src/App.js` | Busca, seleção de ponto, previsão e configuração do aviso |
| `src/api.js` | Requisições à função publicada e tratamento de erro |
| `src/mobility.mjs` | Distância, ordenação e seleção da chegada para o aviso |
| `src/native.js` | GPS, permissões, notificação local e vibração |
| `src/useArrivals.js` | Atualização da previsão em primeiro plano e ciclo de vida do aviso |
| `../public/previsoes.js` | Cálculo de espera compartilhado com o painel web |
| `../api/olho-vivo.js` | Entrada da função na Vercel |

## Conferir a entrega

Rode `npm test` na raiz para testar a função da SPTrans com respostas controladas. Rode `npm test` em `mobile/` para testar a ordenação por GPS e a seleção da chegada no limite. Use `npx expo export --platform all` em `mobile/` para verificar os bundles de Android e iOS.

| Critério | Pontos | Evidência para a entrega |
| --- | --- | --- |
| Funcionamento no celular | 3 | Vídeo no celular real com busca e previsão da SPTrans, GPS e aviso |
| Qualidade do código | 3 | Código React Native organizado por interface, rede, regras e recursos nativos |
| Usabilidade | 2 | Ações em português, estados de espera e erro, permissões solicitadas no contexto |
| Utilidade | 2 | GPS prioriza os resultados que ficam mais perto, aviso acompanha uma linha e destino |

## Roteiro do vídeo · até 3 minutos

| Tempo | O que mostrar e falar |
| --- | --- |
| 0:00–0:20 | “Sou Matheus Costa Cutrim, RM 568087, turma 2CCPR. O Ponto Certo SP ajuda quem anda de ônibus a escolher onde esperar e acompanhar a chegada da linha.” Mostre o app aberto no celular. |
| 0:20–0:55 | Use **Usar minha localização**, aceite a permissão e procure **Paulista**. Mostre a mensagem do GPS e as distâncias ordenadas. Explique que a ordem vem da distância em linha reta entre o aparelho e os pontos. |
| 0:55–1:30 | Abra um ponto. Mostre o horário da consulta, os minutos de espera e o crédito da SPTrans. Se o ponto estiver sem previsões, abra outro. |
| 1:30–2:30 | Toque em uma previsão de até 10 minutos, escolha um limite que inclua o tempo exibido e ative o aviso. Mostre o banner ou o alerta em tela e o texto do aviso enviado. |
| 2:30–2:50 | “O GPS ajuda a escolher o ponto. A previsão e o aviso ajudam a decidir quando se preparar para embarcar.” Finalize e publique o vídeo no YouTube. |

Na plataforma da FIAP, envie a URL da versão mobile no GitHub e o link do vídeo no YouTube. O arquivo [PARTICIPANTES.txt](../PARTICIPANTES.txt) fica na raiz do repositório.

[SPTrans · Área de desenvolvedores](https://www.sptrans.com.br/desenvolvedores/) · [Expo Location](https://docs.expo.dev/versions/v58.0.0/sdk/location/) · [Expo Notifications](https://docs.expo.dev/versions/v58.0.0/sdk/notifications/)
