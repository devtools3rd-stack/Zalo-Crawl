export function EventFeed({ events }: { events: string[] }) {
  return (
    <section className="panel panel--feed">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Lower Support Area</p>
          <h2>Realtime Events</h2>
        </div>
        <span className="badge badge--good">socket buffer</span>
      </div>

      {events.length === 0 ? (
        <div className="empty-state empty-state--compact">
          <p className="empty-title">No events yet.</p>
          <p className="empty-copy">WebSocket connection is open and waiting for bot activity.</p>
        </div>
      ) : (
        <ul className="event-list">
          {events.map((event, index) => (
            <li key={index} className="event-item">
              <span className="event-marker" aria-hidden="true" />
              <code>{event}</code>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
