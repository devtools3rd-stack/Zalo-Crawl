export async function fetchBotSnapshot() {
  const response = await fetch('/api/bot/state');
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json() as Promise<{
    state: string;
    groups: Array<{ id: string; name: string; isPinned: boolean; defaultReply?: string }>;
  }>;
}

export async function startBot() {
  const response = await fetch('/api/bot/start', { method: 'POST' });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
}

export async function stopBot() {
  const response = await fetch('/api/bot/stop', { method: 'POST' });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
}

export async function saveGroupConfig(groupId: string, payload: { defaultReply: string }) {
  const response = await fetch(`/api/groups/${groupId}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
}
