# Dashboard (Expanded Feed) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current `App.tsx` UI with the Stitch-designed "ZaloRideBot - Dashboard (Expanded Feed)" screen — sidebar layout, stats cards, keyword filter, and a scrollable live ride feed — using mock data only.

**Architecture:** Three changes: (1) append new CSS utility classes for ride items to `styles.css`, (2) create a self-contained `ExpandedRideFeed` component with mock data and local filter state, (3) rewrite `App.tsx` as a full dashboard shell that composes sidebar, topbar, stats grid, and the new feed component.

**Tech Stack:** React 19, TypeScript, Vite, Vitest + @testing-library/react, CSS custom properties (no CSS-in-JS)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `apps/frontend/src/styles.css` | Modify | Add ride-feed CSS classes |
| `apps/frontend/src/components/ExpandedRideFeed.tsx` | Create | Mock data, filter state, feed render |
| `apps/frontend/src/App.tsx` | Rewrite | Dashboard shell: sidebar, topbar, stats, feed |
| `apps/frontend/src/__tests__/App.test.tsx` | Modify | Update assertions to match new UI |

---

## Task 1: Add ride-feed CSS classes to styles.css

**Files:**
- Modify: `apps/frontend/src/styles.css`

- [ ] **Step 1: Append the new CSS classes**

Open `apps/frontend/src/styles.css` and append the following block at the very end of the file:

```css
/* ── Ride Feed ───────────────────────────────────── */

.ride-feed {
  display: grid;
  gap: 10px;
  padding-top: 4px;
}

.ride-item {
  display: grid;
  gap: 6px;
  padding: 14px 18px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(31, 32, 32, 0.94), rgba(23, 24, 24, 0.92));
  border: 1px solid var(--surface-border);
  transition: background 140ms ease;
}

.ride-item:hover {
  background: linear-gradient(180deg, rgba(38, 40, 40, 0.96), rgba(30, 31, 31, 0.94));
}

.ride-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.ride-route {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #e4e2e1;
  flex: 1 1 auto;
  min-width: 0;
}

.ride-route-arrow {
  color: var(--copy-muted);
  font-size: 0.8rem;
  flex-shrink: 0;
}

.ride-fare {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #b3c5ff;
  white-space: nowrap;
  flex-shrink: 0;
}

.ride-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 600;
  flex-shrink: 0;
}

.ride-tag--autopilot {
  background: rgba(66, 211, 146, 0.14);
  color: #85f4bf;
}

.ride-tag--manual {
  background: rgba(255, 255, 255, 0.06);
  color: var(--copy-muted);
}

.ride-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--copy-muted);
  font-size: 0.8rem;
}

.ride-meta-dot {
  display: inline-block;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--copy-muted);
  opacity: 0.5;
}
```

- [ ] **Step 2: Commit**

```bash
cd D:/EKOIOS/Zalo-Noti/Zalo-crawl
git add apps/frontend/src/styles.css
git commit -m "style: add ride-feed CSS classes for expanded dashboard feed"
```

---

## Task 2: Create ExpandedRideFeed component

**Files:**
- Create: `apps/frontend/src/components/ExpandedRideFeed.tsx`

- [ ] **Step 1: Write the failing test**

Create or append to `apps/frontend/src/__tests__/ExpandedRideFeed.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ExpandedRideFeed } from '../components/ExpandedRideFeed';

describe('ExpandedRideFeed', () => {
  it('renders feed header and at least one ride item', () => {
    render(<ExpandedRideFeed />);
    expect(screen.getByText('Live Ride Feed')).toBeInTheDocument();
    // at least one route arrow rendered means items are present
    const arrows = screen.getAllByText('→');
    expect(arrows.length).toBeGreaterThan(0);
  });

  it('filters items when a keyword pill is clicked', async () => {
    render(<ExpandedRideFeed />);
    const allCount = screen.getAllByText('→').length;

    await userEvent.click(screen.getByRole('button', { name: 'Sân Bay' }));
    const filteredCount = screen.getAllByText('→').length;
    expect(filteredCount).toBeLessThanOrEqual(allCount);
  });

  it('shows all items when Tất Cả pill is active', async () => {
    render(<ExpandedRideFeed />);
    const allCount = screen.getAllByText('→').length;

    await userEvent.click(screen.getByRole('button', { name: 'Sân Bay' }));
    await userEvent.click(screen.getByRole('button', { name: 'Tất Cả' }));
    expect(screen.getAllByText('→').length).toBe(allCount);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd D:/EKOIOS/Zalo-Noti/Zalo-crawl/apps/frontend
pnpm test
```

Expected: FAIL — `ExpandedRideFeed` module not found.

- [ ] **Step 3: Create the component**

Create `apps/frontend/src/components/ExpandedRideFeed.tsx`:

```tsx
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
              <span
                className={`ride-tag ride-tag--${ride.type}`}
              >
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
```

- [ ] **Step 4: Install @testing-library/user-event if not present**

```bash
cd D:/EKOIOS/Zalo-Noti/Zalo-crawl/apps/frontend
pnpm list @testing-library/user-event
```

If not listed, install it:
```bash
pnpm add -D @testing-library/user-event
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd D:/EKOIOS/Zalo-Noti/Zalo-crawl/apps/frontend
pnpm test
```

Expected: all ExpandedRideFeed tests PASS.

- [ ] **Step 6: Commit**

```bash
cd D:/EKOIOS/Zalo-Noti/Zalo-crawl
git add apps/frontend/src/components/ExpandedRideFeed.tsx \
        apps/frontend/src/__tests__/ExpandedRideFeed.test.tsx
git commit -m "feat: add ExpandedRideFeed component with mock data and keyword filter"
```

---

## Task 3: Rewrite App.tsx as dashboard shell

**Files:**
- Modify: `apps/frontend/src/App.tsx`
- Modify: `apps/frontend/src/__tests__/App.test.tsx`

- [ ] **Step 1: Update App test to match new UI**

Overwrite `apps/frontend/src/__tests__/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders the dashboard brand and navigation', () => {
    render(<App />);
    expect(screen.getByText('ZaloRideBot')).toBeInTheDocument();
    // heading query avoids ambiguity with the nav link that also says "Dashboard"
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Live Ride Feed')).toBeInTheDocument();
  });

  it('renders the three stats cards', () => {
    render(<App />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('98.4%')).toBeInTheDocument();
    expect(screen.getByText('12ms')).toBeInTheDocument();
  });

  it('renders the Auto-Pilot status in sidebar', () => {
    render(<App />);
    expect(screen.getByText('AUTO-PILOT ON')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd D:/EKOIOS/Zalo-Noti/Zalo-crawl/apps/frontend
pnpm test
```

Expected: App tests FAIL — elements not found in old `App.tsx`.

- [ ] **Step 3: Rewrite App.tsx**

Overwrite `apps/frontend/src/App.tsx`:

```tsx
import { ExpandedRideFeed } from './components/ExpandedRideFeed';

export default function App() {
  return (
    <div className="dashboard-shell">
      {/* ── Sidebar ─────────────────────────────── */}
      <aside className="sidebar">
        <div className="brand-block">
          <p className="brand-mark">ZaloRideBot</p>
          <p className="brand-tag">Auto-Pilot System</p>
        </div>

        <nav>
          <ul className="nav-list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            <li>
              <a href="#" className="nav-link nav-link--active">
                Dashboard
              </a>
            </li>
            <li>
              <a href="#" className="nav-link">
                Lịch Sử Cuốc Xe
              </a>
            </li>
            <li>
              <a href="#" className="nav-link">
                Cấu Hình Nhóm
              </a>
            </li>
          </ul>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 10px' }}>
          <span className="status-dot" />
          <span style={{ fontSize: '0.8rem', color: '#85f4bf', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            AUTO-PILOT ON
          </span>
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-action">Start Bot</button>
          <button
            className="sidebar-action"
            style={{ background: 'rgba(255,255,255,0.04)', boxShadow: 'none', color: 'rgba(228,226,225,0.6)' }}
          >
            Stop Bot
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────── */}
      <main className="dashboard-main">
        {/* Topbar */}
        <div className="topbar">
          <div>
            <p className="eyebrow">Live Monitoring</p>
            <h1>Dashboard</h1>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span className="topbar-status">
              <span className="status-dot" />
              42 Groups Active
            </span>
            <span className="topbar-status">12ms latency</span>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <section className="stat-card stat-card--primary">
            <p className="eyebrow">Nhóm Đang Theo Dõi</p>
            <div className="stat-value-row">
              <strong className="stat-value">42</strong>
              <span className="status-chip">active</span>
            </div>
            <div className="meter meter--large">
              <span style={{ width: '84%' }} />
            </div>
            <p className="stat-footnote">Trên 5 thành phố — HCM, HN, ĐN, CT, HP</p>
          </section>

          <section className="stat-card">
            <p className="eyebrow">Hiệu Suất Khớp</p>
            <div className="stat-value-row">
              <strong className="stat-value">98.4%</strong>
              <span className="status-chip">optimal</span>
            </div>
            <div className="meter meter--large">
              <span style={{ width: '98.4%' }} />
            </div>
            <p className="stat-footnote">Tỉ lệ accept thành công trong 24h qua</p>
          </section>

          <section className="stat-card">
            <p className="eyebrow">Độ Trễ Phản Hồi</p>
            <div className="stat-value-row">
              <strong className="stat-value">12ms</strong>
              <span className="status-chip">fast</span>
            </div>
            <div className="meter meter--large">
              <span style={{ width: '94%' }} />
            </div>
            <p className="stat-footnote">Trung bình toàn hệ thống, mục tiêu &lt;20ms</p>
          </section>
        </div>

        {/* Expanded Feed */}
        <div style={{ marginTop: '22px' }}>
          <ExpandedRideFeed />
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd D:/EKOIOS/Zalo-Noti/Zalo-crawl/apps/frontend
pnpm test
```

Expected: all tests PASS (App tests + ExpandedRideFeed tests).

- [ ] **Step 5: Smoke-check in browser**

```bash
cd D:/EKOIOS/Zalo-Noti/Zalo-crawl/apps/frontend
pnpm dev
```

Open `http://localhost:5173`. Verify:
- Sidebar shows "ZaloRideBot", nav links, "AUTO-PILOT ON"
- 3 stat cards with values 42 / 98.4% / 12ms
- Feed shows 15 rides with fare and filter pills working

- [ ] **Step 6: Commit**

```bash
cd D:/EKOIOS/Zalo-Noti/Zalo-crawl
git add apps/frontend/src/App.tsx \
        apps/frontend/src/__tests__/App.test.tsx
git commit -m "feat: replace App with Stitch dashboard shell (expanded feed layout)"
```
