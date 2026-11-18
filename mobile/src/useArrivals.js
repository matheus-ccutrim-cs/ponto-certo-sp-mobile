import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { getArrivals } from './api';
import { flattenArrivals, qualifyingArrival } from './mobility.mjs';
import { notifyArrival } from './native';

export function useArrivals(stop) {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [reminder, setReminder] = useState(null);
  const [notice, setNotice] = useState('');
  const reminderRef = useRef(null);
  const refresh = useRef(() => {});

  const cancel = useCallback(() => {
    reminderRef.current = null;
    setReminder(null);
    setNotice('');
  }, []);

  const arm = useCallback(config => {
    reminderRef.current = config;
    setReminder(config);
    setNotice('');
    refresh.current();
  }, []);

  useEffect(() => {
    if (!stop) return;
    let disposed = false;
    let running = false;
    let foreground = AppState.currentState !== 'background' && AppState.currentState !== 'inactive';

    async function update() {
      if (disposed || running || !foreground) return;
      running = true;
      setLoading(true);
      try {
        const { data, demo } = await getArrivals(stop.cp);
        if (disposed || !foreground) return;
        const arrivals = flattenArrivals(data);
        setReport({ arrivals, time: data.hr, demo });
        setError('');
        const config = reminderRef.current;
        const arrival = config && qualifyingArrival(arrivals, config);
        if (arrival) {
          const title = demo ? 'Simulação de chegada' : 'Seu ônibus está chegando';
          const body = `${arrival.line} para ${arrival.destination} · ${arrival.minutes} min em ${stop.np}.`;
          reminderRef.current = null;
          setReminder(null);
          setNotice(body);
          void notifyArrival(title, body, config.notifications);
        }
      } catch (failure) {
        if (!disposed && foreground) setError(failure.message);
      } finally {
        running = false;
        if (!disposed) setLoading(false);
      }
    }

    refresh.current = update;
    void update();
    const interval = setInterval(update, 30000);
    const listener = AppState.addEventListener('change', state => {
      foreground = state === 'active';
      if (foreground) void update();
    });
    return () => {
      disposed = true;
      clearInterval(interval);
      listener.remove();
    };
  }, [stop]);

  return { report, error, loading, reminder, notice, arm, cancel, update: () => refresh.current() };
}
