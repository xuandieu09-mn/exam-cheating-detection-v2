type Toast = { id: number; message: string; type?: 'info'|'success'|'error' };

type Listener = (t: Toast) => void;
const listeners = new Set<Listener>();
let nextId = 1;

export function onToast(l: Listener) { listeners.add(l); return () => listeners.delete(l); }
export function emitToast(message: string, type: Toast['type'] = 'info') {
  const toast: Toast = { id: nextId++, message, type };
  listeners.forEach(l => l(toast));
}

export type { Toast };
