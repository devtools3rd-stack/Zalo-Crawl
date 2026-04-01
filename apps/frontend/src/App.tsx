import { ExpandedRideFeed } from './components/ExpandedRideFeed';

const FEED_ITEMS = [
  { id: 1, group: 'Grab/Be Driver Sài Gòn', route: 'Sân Bay Tân Sơn Nhất → Quận 7 (Phú Mỹ Hưng)', fare: '285,000đ', keywords: '#sanbay, #quan7', detection: '2.4s ago', icon: 'local_taxi', optimal: true },
  { id: 2, group: 'Chuyến xe 0 đồng Miền Nam', route: 'Quận 3 → Chợ Bến Thành', fare: '65,000đ', icon: 'distance', optimal: false },
  { id: 3, group: 'Tài xế Công Nghệ 24/7', route: 'Thủ Đức → Sân Bay', fare: '190,000đ', icon: 'group', optimal: false },
  { id: 4, group: 'Hội Lái Xe Grab-Be-Gojek', route: 'Bình Thạnh → Vinhomes Grand Park', fare: '145,000đ', icon: 'map', optimal: false },
  { id: 5, group: 'Uber/Grab Ho Chi Minh City', route: 'Quận 10 → Aeon Mall Tân Phú', fare: '112,000đ', icon: 'speed', optimal: false },
  { id: 6, group: 'Car Sharing Sài Gòn', route: 'Gò Vấp → Landmark 81', fare: '88,000đ', icon: 'navigation', optimal: false },
  { id: 7, group: 'Grab Sài Gòn Group', route: 'Phú Nhuận → Thảo Điền', fare: '76,000đ', icon: 'location_on', optimal: false },
];

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background">
      {/* Sidebar */}
      <aside className="w-64 z-40 bg-[#0e0e0e] border-r border-[#484848]/15 flex flex-col h-full shrink-0">
        <div className="p-6">
          <h1 className="text-lg font-black text-[#60A5FA]">ZaloRideBot</h1>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Active Session</p>
        </div>
        <nav className="flex-1 px-2 py-4">
          <a className="bg-secondary-container text-on-secondary-container rounded-lg mx-2 my-1 px-4 py-3 flex items-center gap-3 transition-all duration-200" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-medium text-sm">Command Center</span>
          </a>
          {[
            { icon: 'settings_input_component', label: 'Automation Rules' },
            { icon: 'link', label: 'Zalo Connection' },
            { icon: 'terminal', label: 'System Logs' },
          ].map(({ icon, label }) => (
            <a key={label} className="text-on-surface-variant hover:bg-surface-container hover:text-on-surface mx-2 my-1 px-4 py-3 flex items-center gap-3 transition-all duration-200" href="#">
              <span className="material-symbols-outlined">{icon}</span>
              <span className="font-medium text-sm">{label}</span>
            </a>
          ))}
        </nav>
        <div className="mt-auto p-4 space-y-1">
          {[{ icon: 'settings', label: 'Settings' }, { icon: 'help', label: 'Support' }].map(({ icon, label }) => (
            <a key={label} className="text-on-surface-variant hover:bg-surface-container hover:text-on-surface px-4 py-2 flex items-center gap-3 transition-all" href="#">
              <span className="material-symbols-outlined">{icon}</span>
              <span className="text-sm">{label}</span>
            </a>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        {/* Topbar */}
        <header className="w-full z-50 bg-[#0e0e0e] flex justify-between items-center px-6 h-16 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tighter text-on-surface">ZaloRideBot</span>
            <span className="bg-primary-container text-on-primary-container text-[10px] px-2 py-0.5 rounded-full font-bold">PRO</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-blue-400">sensors</span>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-blue-400">speed</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center text-xs font-bold text-on-surface-variant">
              D
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 px-8 pt-4 pb-6 grid grid-cols-12 gap-8 overflow-hidden">
          {/* Hero Stats */}
          <div className="col-span-12 flex flex-col md:flex-row items-center gap-10 mb-2 shrink-0">
            <div className="flex gap-10 items-end">
              <div>
                <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-[0.2em]">Efficiency</span>
                <h2 className="font-headline text-4xl font-bold text-primary tracking-tighter">98.4%</h2>
              </div>
              <div>
                <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-[0.2em]">Watchers</span>
                <h2 className="font-headline text-4xl font-bold text-on-surface tracking-tighter">14</h2>
              </div>
            </div>
            <div className="ml-auto glass-panel px-4 py-2 rounded-xl flex items-center gap-4 border border-outline-variant/10">
              <div className="text-right">
                <p className="text-[10px] font-label uppercase text-on-surface-variant">Latency</p>
                <p className="text-lg font-headline font-bold text-primary">12ms</p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-pulse flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">bolt</span>
              </div>
            </div>
          </div>

          {/* Left Column */}
          <div className="col-span-12 lg:col-span-4 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            {/* Connectivity */}
            <section className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/5">
              <div className="p-4 pb-0 flex justify-between items-center">
                <h3 className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Connectivity</h3>
                <span className="flex items-center gap-1 text-[9px] text-green-400 font-bold uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Live
                </span>
              </div>
              <div className="p-4 flex flex-col items-center">
                <div className="w-32 h-32 bg-surface-container-highest rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant">qr_code_2</span>
                </div>
                <p className="mt-3 text-center text-[10px] text-on-surface-variant leading-tight">
                  Monitoring 42 driver groups
                </p>
              </div>
            </section>

            {/* Keywords */}
            <section className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Keywords</h3>
                <button className="material-symbols-outlined text-primary text-lg">add_circle</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {['#sanbay', '#quận1', '#vũngtàu'].map((kw) => (
                  <div key={kw} className="bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded-full text-[10px] font-medium flex items-center gap-1.5">
                    {kw} <span className="material-symbols-outlined text-[12px] cursor-pointer">close</span>
                  </div>
                ))}
                <div className="bg-surface-container-highest text-on-surface-variant px-2.5 py-1 rounded-full text-[10px] font-medium flex items-center gap-1.5">
                  #airport <span className="material-symbols-outlined text-[12px] cursor-pointer">close</span>
                </div>
              </div>
            </section>

            {/* Response Speed */}
            <section className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/5">
              <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-3">Response Speed</label>
              <div className="flex items-center gap-3">
                <input className="flex-1 accent-primary bg-surface-container-highest rounded-lg h-1.5" type="range" defaultValue={90} />
                <span className="text-[10px] font-headline font-bold text-primary">TURBO</span>
              </div>
            </section>

            {/* Auto-Pilot */}
            <div className="bg-secondary-container/20 border border-primary/10 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase font-label text-on-secondary-container font-bold">Auto-Pilot</p>
                <p className="text-xs text-on-surface-variant mt-0.5">High priority only</p>
              </div>
              <div className="relative inline-block w-10 h-5 rounded-full bg-primary/20">
                <div className="absolute left-1 top-1 bg-primary w-3 h-3 rounded-full shadow-lg" />
              </div>
            </div>
          </div>

          {/* Right Column: Live Ride Feed */}
          <div className="col-span-12 lg:col-span-8 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-sm font-label uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                Live Ride Feed
                <span className="w-2 h-2 rounded-full bg-error-dim animate-ping" />
              </h3>
              <div className="flex gap-4">
                <span className="text-xs font-medium text-primary cursor-pointer hover:underline">Export Logs</span>
                <span className="text-xs font-medium text-on-surface-variant cursor-pointer">Filter: All Groups</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-3 space-y-4 custom-scrollbar">
              {FEED_ITEMS.map((item) =>
                item.optimal ? (
                  <div key={item.id} className="bg-surface-container border-l-4 border-primary rounded-r-xl p-5 relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-on-primary text-[9px] font-bold uppercase tracking-tighter rounded-bl-lg">
                      Optimal Match
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-surface-container-highest p-2 rounded-lg">
                            <span className="material-symbols-outlined text-primary text-xl">{item.icon}</span>
                          </div>
                          <div>
                            <p className="text-[10px] text-on-surface-variant font-medium">{item.group}</p>
                            <p className="text-base font-bold leading-tight">{item.route}</p>
                          </div>
                        </div>
                        <div className="flex gap-6 pl-12">
                          <div>
                            <p className="text-[9px] uppercase text-on-surface-variant font-bold">Fare</p>
                            <p className="text-lg font-headline text-primary">{item.fare}</p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase text-on-surface-variant font-bold">Met</p>
                            <p className="text-[11px] mt-0.5 text-on-surface">{item.keywords}</p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase text-on-surface-variant font-bold">Detection</p>
                            <p className="text-[11px] mt-0.5 text-on-surface">{item.detection}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary-container px-6 py-4 rounded-lg font-black text-xs shadow-lg active:scale-95 transition-all uppercase tracking-widest">
                          ACCEPT
                        </button>
                        <button className="bg-surface-container-highest text-on-surface px-6 py-3 rounded-lg font-bold text-xs active:scale-95 transition-all uppercase opacity-80">
                          IGNORE
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={item.id} className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/10 hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-surface-container-highest p-2 rounded-lg">
                          <span className="material-symbols-outlined text-on-surface-variant">{item.icon}</span>
                        </div>
                        <div>
                          <p className="text-[10px] text-on-surface-variant font-medium">{item.group}</p>
                          <p className="text-sm font-semibold">{item.route}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-[9px] uppercase text-on-surface-variant font-bold">Fare</p>
                          <p className="text-sm font-headline font-bold">{item.fare}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="material-symbols-outlined w-10 h-10 flex items-center justify-center bg-surface-container hover:bg-primary/20 hover:text-primary rounded-full transition-colors">check</button>
                          <button className="material-symbols-outlined w-10 h-10 flex items-center justify-center bg-surface-container hover:bg-error/20 hover:text-error-dim rounded-full transition-colors">close</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Floating FAB */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-center gap-4">
        <div className="bg-surface-container-highest px-4 py-2 rounded-full border border-outline-variant/30 text-[10px] font-bold shadow-2xl flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          ZaloBot Online
        </div>
        <button className="w-14 h-14 rounded-full bg-primary text-on-primary shadow-[0_12px_40px_rgba(164,201,255,0.3)] flex items-center justify-center active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
        </button>
      </div>
    </div>
  );
}
