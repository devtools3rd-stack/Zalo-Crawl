export async function fetchBotSnapshot() {
  const response = await fetch('/api/bot/state');
  return response.json() as Promise<{
    state: string;
    groups: Array<{ id: string; name: string; isPinned: boolean; defaultReply?: string }>;
  }>;
}

export async function startBot() {
  await fetch('/api/bot/start', { method: 'POST' });
}

export async function stopBot() {
  await fetch('/api/bot/stop', { method: 'POST' });
}

export async function saveGroupConfig(groupId: string, payload: { defaultReply: string }) {
  await fetch(`/api/groups/${groupId}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
}
