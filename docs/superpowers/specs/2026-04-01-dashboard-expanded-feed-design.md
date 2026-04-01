# Dashboard (Expanded Feed) — Design Spec

**Date:** 2026-04-01  
**Source:** Stitch project 3200194460836341835 — screen "ZaloRideBot - Dashboard (Expanded Feed)"  
**Scope:** Frontend only, mock data, replaces existing `App.tsx` layout

---

## 1. Goal

Recreate the Stitch-designed "ZaloRideBot - Dashboard (Expanded Feed)" screen as a React frontend. No backend calls — all data is static mock data. The result replaces the current `App.tsx` UI.

---

## 2. Files Changed

| File | Action |
|------|--------|
| `apps/frontend/src/App.tsx` | Rewrite — full dashboard shell |
| `apps/frontend/src/components/ExpandedRideFeed.tsx` | Create new — feed component with mock data |
| `apps/frontend/src/styles.css` | Append — new CSS classes for ride items |

Existing components (`BotStatusCard`, `EventFeed`, `GroupConfigPanel`) are kept as-is but no longer rendered.

---

## 3. Layout

Two-column grid shell: `260px sidebar` + `1fr main content`.

```
┌─────────────┬──────────────────────────────────────────┐
│   Sidebar   │  Topbar (title + status chip)             │
│  260px      ├──────────────────────────────────────────┤
│  - Brand    │  Stats Grid (3 cards)                     │
│  - Nav      │  Groups: 42 | Efficiency: 98.4% | 12ms    │
│  - Status   ├──────────────────────────────────────────┤
│  - Actions  │  Filter Toolbar (search + keyword pills)  │
│             ├──────────────────────────────────────────┤
│             │  EXPANDED RIDE FEED (scrollable)          │
│             │  ~15 mock ride items                      │
└─────────────┴──────────────────────────────────────────┘
```

---

## 4. Sidebar

- **Brand:** "ZaloRideBot" in Space Grotesk, subtitle "Auto-Pilot System"
- **Nav links:** Dashboard (active), Lịch Sử Cuốc Xe, Cấu Hình Nhóm
- **Auto-Pilot badge:** green pulsing dot + "AUTO-PILOT ON" label
- **Footer:** Start Bot / Stop Bot action buttons (no-op for FE-only)

Reuses existing CSS: `.sidebar`, `.brand-mark`, `.nav-link`, `.nav-link--active`, `.sidebar-action`

---

## 5. Topbar

- Left: page title "Dashboard", eyebrow "Live Monitoring"
- Right: status chip "42 Groups Active" + latency pill "12ms"

Reuses: `.topbar`, `.topbar-status`, `.status-dot`

---

## 6. Stats Grid

Three `.stat-card` components in `.stats-grid`:

| Card | Value | Unit |
|------|-------|------|
| Nhóm Đang Theo Dõi | 42 | groups |
| Hiệu Suất Khớp | 98.4% | efficiency |
| Độ Trễ Phản Hồi | 12ms | latency |

Each card has: eyebrow label, large value, progress meter, footnote text.

---

## 7. Filter Toolbar

- Search input shell (decorative, no handler needed)
- Filter pills: `Tất Cả` (active) · `Sân Bay` · `Quận 1` · `Bình Thạnh` · `Gò Vấp` · `Quận 7`
- Clicking a pill filters the feed by matching pickup/dropoff location (local state)

Reuses: `.surface-toolbar`, `.search-shell`, `.toolbar-pills`, `.toolbar-pill`, `.toolbar-pill--accent`

---

## 8. ExpandedRideFeed Component

### Interface
```tsx
// Self-contained — no props, owns mock data + filter state
export function ExpandedRideFeed() { ... }
```

### Each Ride Item
```
┌──────────────────────────────────────────────────────────┐
│  [AUTO-PILOT]  Tân Sơn Nhất → Quận 1    45,000đ          │
│  2s ago        Khớp: 96.2%              3.2 km            │
└──────────────────────────────────────────────────────────┘
```

Fields per item: `type` (autopilot | manual), `from`, `to`, `fare` (VND), `ago`, `confidence` (%), `distance` (km)

### Mock Data (~15 items)
Vietnamese locations: Sân Bay Tân Sơn Nhất, Quận 1, Quận 3, Quận 7, Bình Thạnh, Gò Vấp, Thủ Đức, Bến Thành.  
Fares: 35,000–180,000đ. Confidence: 88–99%. Type mix: ~70% autopilot, ~30% manual.

### Filter Logic
Active pill filters items where `from` or `to` includes the keyword. "Tất Cả" shows all items. Filter state is `useState<string>` local to the component.

### New CSS Classes
- `.ride-feed` — `display: grid; gap: 10px; padding-top: 4px`
- `.ride-item` — card layout, two rows, uses `.panel` background
- `.ride-item-row` — flex row for top/bottom line
- `.ride-tag` — small badge base style
- `.ride-tag--autopilot` — green gradient badge
- `.ride-tag--manual` — muted grey badge
- `.ride-fare` — large fare number, Space Grotesk font, primary color
- `.ride-meta` — muted smaller text (ago, confidence, distance)

---

## 9. Design Tokens

All tokens already present in `styles.css`:
- Colors: `--accent` (#0052D4), `--accent-soft` (#2D9BC9), `--good` (#42D392), `--copy-muted`
- Fonts: Space Grotesk (headlines/values), Inter (body)
- Surfaces: `--surface`, `--surface-strong`, `--surface-border`

No new tokens needed.

---

## 10. Responsive

Follows existing breakpoints in `styles.css`:
- `≤1100px`: sidebar collapses to top, grids go single-column
- `≤720px`: reduced padding

No new media query rules needed for the ride feed.
