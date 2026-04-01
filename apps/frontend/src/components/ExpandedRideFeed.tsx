import { useState } from 'react';

type RideType = 'autopilot' | 'manual';

interface Ride {
  id: number;
  type: RideType;
  from: string;
  to: string;
  fare: number;
  ago: string;
  confidence: number;
  distance: number;
}

const MOCK_RIDES: Ride[] = [
  { id: 1,  type: 'autopilot', from: 'Sân Bay Tân Sơn Nhất', to: 'Quận 1',        fare: 85000,  ago: '2s',  confidence: 97.4, distance: 8.2 },
  { id: 2,  type: 'autopilot', from: 'Bến Thành',            to: 'Bình Thạnh',    fare: 42000,  ago: '5s',  confidence: 94.1, distance: 4.1 },
  { id: 3,  type: 'manual',    from: 'Quận 7',               to: 'Quận 1',        fare: 65000,  ago: '8s',  confidence: 88.6, distance: 6.7 },
  { id: 4,  type: 'autopilot', from: 'Sân Bay Tân Sơn Nhất', to: 'Gò Vấp',       fare: 95000,  ago: '12s', confidence: 98.9, distance: 9.5 },
  { id: 5,  type: 'autopilot', from: 'Thủ Đức',              to: 'Quận 1',        fare: 110000, ago: '15s', confidence: 96.2, distance: 12.3 },
  { id: 6,  type: 'manual',    from: 'Bình Thạnh',           to: 'Quận 3',        fare: 38000,  ago: '18s', confidence: 90.3, distance: 3.4 },
  { id: 7,  type: 'autopilot', from: 'Quận 1',               to: 'Sân Bay Tân Sơn Nhất', fare: 82000, ago: '22s', confidence: 97.1, distance: 7.9 },
  { id: 8,  type: 'autopilot', from: 'Gò Vấp',               to: 'Bình Thạnh',   fare: 35000,  ago: '26s', confidence: 93.7, distance: 3.1 },
  { id: 9,  type: 'manual',    from: 'Quận 7',               to: 'Bình Thạnh',   fare: 75000,  ago: '31s', confidence: 89.2, distance: 7.2 },
  { id: 10, type: 'autopilot', from: 'Thủ Đức',              to: 'Gò Vấp',       fare: 68000,  ago: '35s', confidence: 95.4, distance: 6.1 },
  { id: 11, type: 'autopilot', from: 'Bến Thành',            to: 'Quận 7',       fare: 58000,  ago: '40s', confidence: 96.8, distance: 5.5 },
  { id: 12, type: 'manual',    from: 'Quận 3',               to: 'Thủ Đức',      fare: 125000, ago: '44s', confidence: 88.0, distance: 14.2 },
  { id: 13, type: 'autopilot', from: 'Sân Bay Tân Sơn Nhất', to: 'Quận 7',      fare: 135000, ago: '48s', confidence: 99.1, distance: 13.8 },
  { id: 14, type: 'autopilot', from: 'Bình Thạnh',           to: 'Gò Vấp',      fare: 40000,  ago: '52s', confidence: 92.5, distance: 3.8 },
  { id: 15, type: 'manual',    from: 'Quận 1',               to: 'Thủ Đức',     fare: 145000, ago: '57s', confidence: 91.0, distance: 15.1 },
];

const FILTERS = ['Tất Cả', 'Sân Bay', 'Quận 1', 'Bình Thạnh', 'Gò Vấp', 'Quận 7'];

function formatFare(fare: number): string {
  return fare.toLocaleString('vi-VN') + 'đ';
}

export function ExpandedRideFeed() {
  const [activeFilter, setActiveFilter] = useState('Tất Cả');

  const filtered =
    activeFilter === 'Tất Cả'
      ? MOCK_RIDES
      : MOCK_RIDES.filter(
          (r) => r.from.includes(activeFilter) || r.to.includes(activeFilter),
        );

  return (
    <section className="panel panel--feed">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Realtime Matching</p>
          <h2>Live Ride Feed</h2>
        </div>
        <span className="badge badge--good">
          <span className="status-dot" />
          {filtered.length} rides
        </span>
      </div>

      <div className="toolbar-pills" style={{ marginBottom: '18px' }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`toolbar-pill${activeFilter === f ? ' toolbar-pill--accent' : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <ul className="ride-feed" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {filtered.map((ride) => (
          <li key={ride.id} className="ride-item">
            <div className="ride-item-row">
              <span className={`ride-tag ride-tag--${ride.type}`}>
                {ride.type === 'autopilot' ? '⚡ AUTO-PILOT' : 'MANUAL'}
              </span>
              <div className="ride-route">
                <span>{ride.from}</span>
                <span className="ride-route-arrow">→</span>
                <span>{ride.to}</span>
              </div>
              <span className="ride-fare">{formatFare(ride.fare)}</span>
            </div>
            <div className="ride-item-row">
              <div className="ride-meta">
                <span>{ride.ago} trước</span>
                <span className="ride-meta-dot" />
                <span>Khớp: {ride.confidence}%</span>
                <span className="ride-meta-dot" />
                <span>{ride.distance} km</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
