import React, { useRef, useState } from 'react';
import {
  ActivityIndicator, Linking, Pressable, ScrollView, StatusBar,
  StyleSheet, Text, TextInput, View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { searchStops } from './api';
import { distanceLabel, rankStops } from './mobility.mjs';
import { enableNotifications, readPosition } from './native';
import { useArrivals } from './useArrivals';

function Button({ label, onPress, secondary, disabled }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }}
      disabled={disabled} onPress={onPress}
      style={({ pressed }) => [styles.button, secondary && styles.secondary,
        (pressed || disabled) && styles.dimmed]}>
      <Text style={[styles.buttonText, secondary && styles.secondaryText]}>{label}</Text>
    </Pressable>
  );
}

function Message({ children, error }) {
  return (
    <Text accessibilityLiveRegion="polite" style={[styles.muted, error && styles.error]}>
      {children}
    </Text>
  );
}

function StopDetails({ stop, distance, onBack, onSelectArrival }) {
  const { report, error, loading, reminder, notice, arm, cancel, update } = useArrivals(stop);
  const [selection, setSelection] = useState(null);
  const [threshold, setThreshold] = useState(5);
  const [requesting, setRequesting] = useState(false);

  async function activate() {
    setRequesting(true);
    try {
      const notifications = await enableNotifications();
      arm({ ...selection, minutes: threshold, notifications });
    } finally {
      setRequesting(false);
    }
  }

  return (
    <>
      <Button label="Voltar à busca" secondary onPress={onBack} disabled={requesting} />
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.heading}>{stop.np}</Text>
        <Text style={styles.muted}>{stop.ed || `Ponto ${stop.cp}`}</Text>
        {distance !== null && <Text style={styles.accent}>{distanceLabel(distance)}</Text>}
      </View>
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.heading}>Aviso de chegada</Text>
        {notice ? <Message>Aviso enviado. {notice}</Message> : null}
        {reminder ? (
          <>
            <Message>{reminder.line} para {reminder.destination} · até {reminder.minutes} min</Message>
            <Message>{reminder.notifications ? 'Notificação local' : 'Alerta em tela e vibração'} · mantenha esta tela aberta.</Message>
            <Button label="Cancelar aviso" secondary onPress={cancel} />
          </>
        ) : selection ? (
          <>
            <Text style={styles.body}>{selection.line} para {selection.destination}</Text>
            <Message>Avise quando a previsão estiver em até</Message>
            <View style={styles.choices}>
              {[3, 5, 10].map(minutes => (
                <Pressable key={minutes} accessibilityRole="radio"
                  accessibilityState={{ checked: threshold === minutes, disabled: requesting }}
                  disabled={requesting} onPress={() => setThreshold(minutes)}
                  style={[styles.choice, threshold === minutes && styles.checked]}>
                  <Text style={styles.body}>{minutes} min</Text>
                </Pressable>
              ))}
            </View>
            <Button label={requesting ? 'Configurando…' : 'Ativar aviso'} disabled={requesting} onPress={activate} />
          </>
        ) : <Message>Toque em uma previsão abaixo para escolher a linha e o destino.</Message>}
      </View>
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.heading}>Próximos ônibus</Text>
        <Button label={loading ? 'Consultando…' : 'Atualizar previsões'} secondary disabled={loading} onPress={update} />
        {error ? <Message error>{error}{report ? ' A última consulta é exibida abaixo.' : ''}</Message> : null}
        {report?.demo && <Message>Modo demonstração · dados simulados</Message>}
        {report && <Message>{report.demo ? 'Horário simulado' : 'Consulta SPTrans'} às {report.time} · horário de São Paulo</Message>}
        {report?.arrivals.length === 0 && <Message>Sem chegadas previstas para este ponto.</Message>}
        {report?.arrivals.map((arrival, index) => {
          const chosen = selection?.line === arrival.line && selection.destination === arrival.destination;
          return (
            <Pressable key={index} accessibilityRole="button" accessibilityState={{ selected: chosen }}
              accessibilityHint="Seleciona esta linha e destino para configurar o aviso"
              disabled={!!reminder || requesting} onPress={() => {
                setSelection(arrival);
                onSelectArrival();
              }}
              style={[styles.row, chosen && styles.checked]}>
              <View style={styles.rowCopy}>
                <Text style={styles.body}>{arrival.line} · {arrival.destination}</Text>
                <Text style={styles.muted}>{arrival.time}{arrival.accessible ? ' · Veículo acessível' : ''}</Text>
              </View>
              <Text style={styles.accent}>{arrival.minutes} min</Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

export default function App() {
  const scroll = useRef(null);
  const [term, setTerm] = useState('');
  const [results, setResults] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [searching, setSearching] = useState(false);
  const [stop, setStop] = useState(null);
  const [position, setPosition] = useState(null);
  const [gps, setGps] = useState(null);
  const [locating, setLocating] = useState(false);
  const ranked = rankStops(results?.data ?? [], position);

  async function locate() {
    if (locating) return;
    setLocating(true);
    try {
      const next = await readPosition();
      setPosition(next.coords ?? null);
      setGps(next);
    } catch {
      setPosition(null);
      setGps({ message: 'O celular não conseguiu obter a localização. Tente novamente.' });
    } finally {
      setLocating(false);
    }
  }

  async function search() {
    if (searching) return;
    const value = term.trim();
    if (value.length < 2) {
      setSearchError('Digite pelo menos duas letras ou números.');
      return;
    }
    setSearching(true);
    setSearchError('');
    setResults(null);
    try {
      setResults({ ...await searchStops(value), term: value });
    } catch (failure) {
      setSearchError(failure.message);
    } finally {
      setSearching(false);
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" />
        <ScrollView ref={scroll} style={styles.scroll} contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Text accessibilityRole="header" style={styles.title}>Ponto Certo SP</Text>
            <Text style={styles.tagline}>Consulte a chegada dos ônibus em São Paulo.</Text>
          </View>
          {stop ? (
            <StopDetails key={stop.cp} stop={stop} distance={stop.distance} onBack={() => setStop(null)}
              onSelectArrival={() => scroll.current?.scrollTo({ y: 0, animated: true })} />
          ) : (
            <>
              <View style={styles.card}>
                <Text accessibilityRole="header" style={styles.heading}>Buscar ponto</Text>
                <TextInput accessibilityLabel="Nome ou endereço do ponto" autoCapitalize="words"
                  value={term} maxLength={100} onChangeText={setTerm} returnKeyType="search"
                  onSubmitEditing={search} placeholder="Ex.: Paulista" placeholderTextColor="#526575"
                  style={styles.input} />
                <Button label="Buscar pontos" onPress={search} disabled={searching} />
                <Button label={locating ? 'Obtendo localização…' : position ? 'Atualizar GPS' : 'Usar minha localização'}
                  secondary onPress={locate} disabled={locating} />
                <Message>{gps?.message ?? 'Use o GPS para ver primeiro os pontos mais próximos da sua busca.'}</Message>
                {gps?.settings && <Button label="Abrir configurações" secondary onPress={() => {
                  Linking.openSettings().catch(() => setGps({ message: 'Abra os ajustes do celular e confira a localização.' }));
                }} />}
                {searchError ? <Message error>{searchError}</Message> : null}
              </View>
              {searching && <ActivityIndicator accessibilityLabel="Buscando pontos" color="#075d54" />}
              {results && (
                <View style={styles.card}>
                  <Text accessibilityRole="header" style={styles.heading}>Pontos para “{results.term}”</Text>
                  {results.demo && <Message>Modo demonstração · dados simulados</Message>}
                  {ranked.length === 0 && <Message>Nenhum ponto encontrado. Tente outro nome ou endereço.</Message>}
                  {ranked.map(item => (
                    <Pressable key={item.cp} accessibilityRole="button" onPress={() => {
                      setStop(item);
                      scroll.current?.scrollTo({ y: 0, animated: false });
                    }} style={styles.row}>
                      <View style={styles.rowCopy}>
                        <Text style={styles.body}>{item.np}</Text>
                        <Text style={styles.muted}>{item.ed || `Ponto ${item.cp}`}</Text>
                        {item.distance !== null && <Text style={styles.accent}>{distanceLabel(item.distance)}</Text>}
                      </View>
                      <Text style={styles.accent}>Ver</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </>
          )}
          <Text style={styles.footer}>Dados de transporte fornecidos pela SPTrans · API Olho Vivo</Text>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#103533' },
  scroll: { backgroundColor: '#eef5f4' },
  page: { gap: 14, paddingBottom: 28, width: '100%', maxWidth: 720, alignSelf: 'center' },
  hero: { backgroundColor: '#103533', padding: 22, gap: 5 },
  title: { fontSize: 30, fontWeight: '800', color: '#ffffff' },
  tagline: { color: '#d2ebe7', fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 15, gap: 10, marginHorizontal: 14 },
  heading: { fontSize: 21, fontWeight: '800', color: '#102b2f' },
  input: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#95aaa9', color: '#102b2f', fontSize: 16 },
  button: { marginHorizontal: 0, borderRadius: 10, minHeight: 48, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#075d54' },
  secondary: { backgroundColor: '#deeeeb' },
  buttonText: { fontSize: 16, fontWeight: '700', color: '#fff', textAlign: 'center' },
  secondaryText: { color: '#113d38' },
  dimmed: { opacity: 0.64 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { padding: 10, minHeight: 44, borderRadius: 8, backgroundColor: '#edf4f3' },
  checked: { backgroundColor: '#cae8e1', borderColor: '#075d54', borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
    backgroundColor: '#f0f6f5', borderRadius: 10, minHeight: 48, padding: 12 },
  rowCopy: { flex: 1, gap: 4 },
  body: { fontSize: 16, fontWeight: '700', color: '#102b2f' },
  accent: { fontSize: 15, fontWeight: '700', color: '#075d54' },
  muted: { fontSize: 15, lineHeight: 21, color: '#364e54' },
  error: { color: '#992b28' },
  footer: { textAlign: 'center', paddingHorizontal: 16, color: '#364e54', fontSize: 13 }
});
