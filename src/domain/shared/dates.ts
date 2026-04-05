export function nowIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function nowIsoDateTime() {
  return new Date().toISOString();
}
