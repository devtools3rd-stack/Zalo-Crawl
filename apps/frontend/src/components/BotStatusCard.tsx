type Props = { state: string };

export function BotStatusCard({ state }: Props) {
  const normalizedState = state.toUpperCase();
  const accentClass = state === 'offline' ? 'status-chip status-chip--offline' : 'status-chip';

  return (
    <section className="stat-card stat-card--primary">
      <p className="eyebrow">Bot State</p>
      <div className="stat-value-row">
        <strong className="stat-value">{normalizedState}</strong>
        <span className={accentClass}>{state === 'offline' ? 'degraded' : 'system live'}</span>
      </div>
      <p className="stat-footnote">
        {state === 'offline'
          ? 'Snapshot fetch failed. Showing offline fallback.'
          : 'Realtime automation status streaming from the core bot.'}
      </p>
    </section>
  );
}
