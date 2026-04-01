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
          <ul className="nav-list">
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

        <div className="auto-pilot-status">
          <span className="status-dot" />
          <span className="auto-pilot-label">AUTO-PILOT ON</span>
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-action">Start Bot</button>
          <button className="sidebar-action sidebar-action--secondary">
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
          <div className="topbar-actions">
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
        <div className="feed-wrapper">
          <ExpandedRideFeed />
        </div>
      </main>
    </div>
  );
}
