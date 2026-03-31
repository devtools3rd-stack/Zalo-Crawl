import { useEffect, useState } from 'react';
import { BotStatusCard } from './components/BotStatusCard';
import { EventFeed } from './components/EventFeed';
import { GroupConfigPanel } from './components/GroupConfigPanel';
import { fetchBotSnapshot, saveGroupConfig, startBot, stopBot } from './lib/api';
import { connectBotEvents } from './lib/ws';

export default function App() {
  const [state, setState] = useState('idle');
  const [groups, setGroups] = useState<Array<{ id: string; name: string; isPinned: boolean; defaultReply?: string }>>([]);
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    fetchBotSnapshot()
      .then((snapshot) => {
        setState(snapshot.state);
        setGroups(snapshot.groups);
      })
      .catch(() => {
        setState('offline');
      });

    const socket = connectBotEvents((event) => {
      setEvents((current) => [JSON.stringify(event), ...current].slice(0, 20));
    });

    return () => socket.close();
  }, []);

  return (
    <main>
      <h1>ZaloRideBot Dashboard</h1>
      <button onClick={async () => { await startBot(); const s = await fetchBotSnapshot(); setState(s.state); setGroups(s.groups); }}>Start Bot</button>
      <button onClick={async () => { await stopBot(); const s = await fetchBotSnapshot(); setState(s.state); setGroups(s.groups); }}>Stop Bot</button>
      <BotStatusCard state={state} />
      <GroupConfigPanel
        groups={groups}
        onSave={async (groupId, defaultReply) => {
          await saveGroupConfig(groupId, { defaultReply });
        }}
      />
      <EventFeed events={events} />
    </main>
  );
}
