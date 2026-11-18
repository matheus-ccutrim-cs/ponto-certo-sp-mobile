function clockMinutes(value) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

export function flattenArrivals(data) {
  const reference = clockMinutes(data.hr);
  return (data.p?.l ?? []).flatMap(line => (line.vs ?? []).flatMap(vehicle => {
    const arrival = clockMinutes(vehicle.t);
    if (reference === null || arrival === null) return [];
    // Os horários da API não contêm a data. Um horário menor indica a próxima virada do dia.
    const minutes = (arrival - reference + 1440) % 1440;
    return [{
      line: line.c,
      destination: line.lt0,
      time: vehicle.t,
      minutes,
      accessible: vehicle.a === true
    }];
  })).sort((a, b) => a.minutes - b.minutes);
}
