export function connectBotEvents(onMessage: (event: unknown) => void) {
  const url = new URL('/ws/events', window.location.origin);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';

  const socket = new WebSocket(url.toString());
  socket.addEventListener('message', (event) => {
    try {
      onMessage(JSON.parse((event as MessageEvent).data));
    } catch {
      return;
    }
  });
  return socket;
}
