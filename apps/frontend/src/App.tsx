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
