import React, { useMemo, useState } from 'react';
import DisasterDetail from './DisasterDetail';

const disasterList = [
  { id: 1, title: 'Bagyo at Unos (Typhoons)', description: 'Maging alerto sa mga babala ng PAGASA. Ihanda ang Go-Bag at alamin ang evacuation center sa inyong barangay.', linkText: 'Gabay sa Panahon ng Bagyo', image: '/bagyo.jpg' },
  { id: 2, title: 'Baha (Flooding)', description: 'Iwasang lumusong sa baha para makaiwas sa leptospirosis at iba pang sakit. “Kung baha na, lumikas na!”', linkText: 'Maging Handa sa Baha', image: '/baha.jpg' },
  { id: 3, title: 'Lindol (Earthquakes)', description: 'Tandaan ang Duck, Cover, and Hold! Siguraduhing ligtas ang inyong tahanan mula sa mga bumabagsak na gamit.', linkText: 'Gabay sa Paghahanda sa Lindol', image: '/lindol.jpg' },
  { id: 4, title: 'Sunog (Fire Safety)', description: 'I-check ang mga linya ng kuryente at gasul. Tandaan ang Stop, Drop, and Roll sakaling magkasunog.', linkText: 'Mga Payo sa Fire Safety', image: '/sunog.jpg' },
  { id: 5, title: 'Kawalan ng Kuryente (Power Outage)', description: 'Magtabi ng flashlight, kandila, at power bank. Tiyaking nakatago sa ligtas na lugar ang mga emergency supplies.', linkText: 'Payo sa Power Outages', image: '/kuryente.jpg' },
  { id: 6, title: 'Pagsabog ng Bulkan (Volcanic Eruption)', description: 'Magsuot ng N95 mask o basahang basa para sa ashfall. Sumunod sa payo ng PHIVOLCS at LGU kung kailangang lumikas.', linkText: 'Gabay sa Ashfall at Bulkan', image: '/bulkan.jpg' },
  { id: 7, title: 'Pagguho ng Lupa (Landslide)', description: 'Maging alerto sa patuloy na pag-ulan sa mga kabundukan. Mag-evacuate agad kapag nakakita ng bitak sa lupa o kakaibang tunog.', linkText: 'Kaligtasan sa Landslide', image: '/landslide.jpg' },
  { id: 8, title: 'Tsunami Warning', description: 'Kapag nakaramdam ng malakas na lindol malapit sa baybayin o mabilis na pagliit ng tubig-dagat, tumakbo agad sa mataas na lugar.', linkText: 'Gabay sa Tsunami Preparedness', image: '/tsunami.jpg' },
  { id: 9, title: 'Paghahanda ng Emergency Go-Bag', description: 'Maghanda ng Go-Bag na naglalaman ng pagkain, tubig, gamot, barya, at mahahalagang dokumento para sa 72 oras.', linkText: 'Listahan ng Laman ng Go-Bag', image: '/gobag.jpg' }
];

const initialSupplies = [
  { id: 1, name: 'Tubig na Inumin', icon: 'bi-droplet-fill', status: 'Ready' },
  { id: 2, name: 'First Aid Kit', icon: 'bi-bandaid-fill', status: 'Ready' },
  { id: 3, name: 'Flashlight', icon: 'bi-flashlight-fill', status: 'Check' },
  { id: 4, name: 'MGA Baterya', icon: 'bi-battery-half', status: 'Missing' },
  { id: 5, name: 'Radyo', icon: 'bi-broadcast-pin', status: 'Ready' }
];

const initialTasks = [
  { id: 1, text: 'Ihanda ang Emergency Go-Bag', done: true },
  { id: 2, text: 'Mag-imbak ng sapat na tubig na inumin', done: true },
  { id: 3, text: 'Ayusin at itago ang mahahalagang dokumento', done: false },
  { id: 4, text: 'Alamin ang pinakamalapit na evacuation route', done: false },
  { id: 5, text: 'I-save ang mga emergency contacts', done: false },
  { id: 6, text: 'I-check ang flashlight at extra batteries', done: true },
  { id: 7, text: 'I-secure ang mabibigat na kasangkapan', done: true },
  { id: 8, text: 'Pag-usapan ang family meeting point', done: false },
  { id: 9, text: 'Suriin ang imbak na pagkain at tubig', done: true },
  { id: 10, text: 'Tignan ang mga hotline numbers sa inyong lugar', done: true }
];

const readiness = [
  { name: 'Bagyo', value: 80, icon: 'bi-wind' },
  { name: 'Baha', value: 60, icon: 'bi-water' },
  { name: 'Lindol', value: 50, icon: 'bi-activity' },
  { name: 'Sunog', value: 70, icon: 'bi-fire' },
  { name: 'Landslide', value: 40, icon: 'bi-triangle-fill' }
];

function SectionTitle({ icon, title, text, action, onAction }) {
  return (
    <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
      <div>
        <h2 className="h5 fw-bold mb-1">
          <i className={`bi ${icon} me-2 text-handa-green`} />
          {title}
        </h2>
        {text && <p className="text-secondary small mb-0">{text}</p>}
      </div>
      {action && (
        <button className="btn btn-sm btn-outline-handa" onClick={onAction}>
          {action} <i className="bi bi-arrow-right ms-1" />
        </button>
      )}
    </div>
  );
}

function ProgressRing({ value }) {
  return (
    <div className="progress-ring" style={{ '--progress': `${value * 3.6}deg` }}>
      <div className="progress-ring-inner">
        <strong>{value}%</strong>
      </div>
    </div>
  );
}

export default function Dashboard({ user, onLogout, isOnline }) {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [supplies, setSupplies] = useState(initialSupplies);
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState('');
  const [mobileNav, setMobileNav] = useState(false);

  const completedTasks = tasks.filter((task) => task.done).length;
  const checklistPercent = Math.round((completedTasks / tasks.length) * 100);
  const readySupplies = supplies.filter((item) => item.status === 'Ready').length;
  const preparednessScore = Math.round(
    checklistPercent * 0.45 + (readySupplies / supplies.length) * 100 * 0.35 + 70 * 0.2
  );

  const filteredDisasters = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return disasterList;
    return disasterList.filter((item) =>
      `${item.title} ${item.description}`.toLowerCase().includes(query)
    );
  }, [search]);

  const navigate = (page) => {
    setActivePage(page);
    setSelectedDisaster(null);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task))
    );
  };

  const cycleSupply = (id) => {
    setSupplies((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const next =
          item.status === 'Ready'
            ? 'Check'
            : item.status === 'Check'
            ? 'Missing'
            : 'Ready';
        return { ...item, status: next };
      })
    );
  };

  if (selectedDisaster) {
    return (
      <div className={`handa-app ${darkMode ? 'dark-mode' : ''}`}>
        <Sidebar
          activePage="guides"
          navigate={navigate}
          onLogout={onLogout}
          user={user}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          isOnline={isOnline}
        />
        <div className="handa-main">
          <div className="p-3 p-lg-4">
            <DisasterDetail
              item={selectedDisaster}
              onBack={() => setSelectedDisaster(null)}
              darkMode={darkMode}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`handa-app ${darkMode ? 'dark-mode' : ''}`}>
      <Sidebar
        activePage={activePage}
        navigate={navigate}
        onLogout={onLogout}
        user={user}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isOnline={isOnline}
        mobileNav={mobileNav}
        setMobileNav={setMobileNav}
      />
      {mobileNav && (
        <button
          className="sidebar-backdrop d-lg-none"
          aria-label="Close menu"
          onClick={() => setMobileNav(false)}
        />
      )}

      <div className="handa-main">
        <header className="dashboard-header">
          <div className="d-flex align-items-center gap-3">
            <button
              className="mobile-menu-btn d-lg-none"
              onClick={() => setMobileNav(true)}
              aria-label="Open menu"
            >
              <i className="bi bi-list" />
            </button>
            <div>
              <h1 className="h3 fw-bold mb-1">
                Magandang araw, {user?.name || 'User'}! <span aria-hidden="true">👋</span>
              </h1>
              <p className="text-secondary mb-0 small">
                Maging alerto. Maging handa. Maging ligtas.
              </p>
            </div>
          </div>

          <div className="header-actions">
            <div className="search-box d-none d-md-flex">
              <i className="bi bi-search" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Mag-search ng guides, supplies..."
              />
            </div>
            <button className="icon-button" title="Notifications">
              <i className="bi bi-bell" />
              <span className="notification-dot">2</span>
            </button>
            <div className="date-block d-none d-xl-block">
              <strong>September 15, 2025</strong>
              <span>10:24 AM</span>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          {activePage === 'dashboard' && (
            <DashboardHome
              preparednessScore={preparednessScore}
              checklistPercent={checklistPercent}
              completedTasks={completedTasks}
              supplies={supplies}
              readySupplies={readySupplies}
              tasks={tasks}
              readiness={readiness}
              navigate={navigate}
              onToggleTask={toggleTask}
              onCycleSupply={cycleSupply}
              onSelectGuide={setSelectedDisaster}
              filteredDisasters={filteredDisasters}
            />
          )}
          {activePage === 'checklist' && (
            <ChecklistPage
              tasks={tasks}
              onToggleTask={toggleTask}
              percent={checklistPercent}
            />
          )}
          {activePage === 'supplies' && (
            <SuppliesPage supplies={supplies} onCycleSupply={cycleSupply} />
          )}
          {activePage === 'evacuation' && <EvacuationPage />}
          {activePage === 'contacts' && <ContactsPage />}
          {activePage === 'guides' && (
            <GuidesPage disasters={filteredDisasters} onSelect={setSelectedDisaster} />
          )}
          {activePage === 'settings' && (
            <SettingsPage
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              onLogout={onLogout}
            />
          )}
        </main>

        <footer className="dashboard-footer">
          Handa • Disaster Preparedness Guide <span>•</span> Panatilihing ligtas at handa ang inyong pamilya.
        </footer>
      </div>
    </div>
  );
}

function Sidebar({
  activePage,
  navigate,
  onLogout,
  user,
  darkMode,
  setDarkMode,
  isOnline,
  mobileNav
}) {
  const navItems = [
    ['dashboard', 'bi-grid-1x2-fill', 'Dashboard'],
    ['checklist', 'bi-check2-square', 'Emergency Checklist'],
    ['supplies', 'bi-backpack4', 'Emergency Supplies'],
    ['evacuation', 'bi-signpost-2-fill', 'Evacuation Plans'],
    ['contacts', 'bi-telephone-fill', 'Emergency Contacts'],
    ['guides', 'bi-book-half', 'Disaster Guides'],
    ['settings', 'bi-gear-fill', 'Settings']
  ];

  return (
    <aside className={`handa-sidebar ${mobileNav ? 'show' : ''}`}>
      <div className="brand">
        <div className="brand-shield">
          <i className="bi bi-shield-fill-check" />
        </div>
        <div>
          <strong>Handa</strong>
          <small>Disaster Preparedness Guide</small>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(([page, icon, label]) => (
          <button
            key={page}
            className={activePage === page ? 'active' : ''}
            onClick={() => navigate(page)}
          >
            <i className={`bi ${icon}`} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="mode-row">
          <span>
            <i className="bi bi-sun me-2" /> Light / Dark Mode
          </span>
          <button
            className={`switch ${darkMode ? 'on' : ''}`}
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
          >
            <span />
          </button>
        </div>

        <div className="sidebar-status">
          <span className={`status-dot ${isOnline ? 'online' : ''}`} />
          {isOnline ? 'Online' : 'Offline Mode'}
        </div>

        <div className="profile">
          <div className="profile-avatar">
            <i className="bi bi-person-fill" />
          </div>
          <div className="flex-grow-1">
            <strong>{user?.name || 'User'}</strong>
            <small>{user?.email || 'Preparedness user'}</small>
          </div>
          <button onClick={onLogout} title="Log out">
            <i className="bi bi-box-arrow-right" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function DashboardHome({
  preparednessScore,
  checklistPercent,
  completedTasks,
  supplies,
  readySupplies,
  tasks,
  readiness,
  navigate,
  onToggleTask,
  onCycleSupply,
  onSelectGuide,
  filteredDisasters
}) {
  return (
    <>
      <section className="top-grid">
        <div className="panel score-panel">
          <div className="panel-heading">
            <div className="section-icon green">
              <i className="bi bi-shield-check" />
            </div>
            <div>
              <h2>Preparedness Score Mo</h2>
              <p>Kabuuang progreso sa iyong mga paghahanda.</p>
            </div>
          </div>

          <div className="score-body">
            <ProgressRing value={preparednessScore} />
            <div>
              <span className="eyebrow">KASALUKUYANG STATUS</span>
              <h3>
                {preparednessScore >= 80
                  ? 'Handang-Handa Na!'
                  : preparednessScore >= 60
                  ? 'Malapit Nang Maging Handa'
                  : 'Kailangan Pa Ng Aksyon'}
              </h3>
              <p>
                Nakatapos ka na ng {completedTasks} sa {tasks.length} tasks sa iyong checklist. Tuloy-tuloy lang para maging fully prepared!
              </p>
              <button className="btn btn-handa" onClick={() => navigate('checklist')}>
                Tignan ang Details <i className="bi bi-arrow-right ms-1" />
              </button>
            </div>
          </div>
        </div>

        <div className="panel safety-panel">
          <SectionTitle
            icon="bi-shield-check"
            title="Kasalukuyang Safety Status"
            text="Mabilis na tingin sa iyong mga preparedness alerts."
          />
          <div className="safe-status">
            <i className="bi bi-check-circle-fill" />
            <div>
              <strong>Walang Aktibong Emergency</strong>
              <span>Gamitin ang dashboard na ito para sa pagpaplano at pag-update ng records.</span>
            </div>
          </div>

          <div className="attention">
            <i className="bi bi-exclamation-triangle-fill" />
            <div>
              <strong>Kailangan ng iyong pansin</strong>
              <ul>
                <li>{supplies.filter((s) => s.status !== 'Ready').length} supply items ang kailangang i-check</li>
                <li>Kailangang kumpletuhin ang iyong evacuation plan</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="quote-card">
          <img src="/hero-bg.jpg" alt="Preparedness landscape" />
          <div className="quote-overlay">
            <p>
              “Ang paghahanda ngayong araw<br />
              ay makakapagligtas ng buhay bukas.”
            </p>
            <small>— Handa</small>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel supply-panel">
          <SectionTitle
            icon="bi-backpack4"
            title="Emergency Kit Tracker"
            text="I-manage ang iyong go-bag at mga essential supplies."
            action="I-manage"
            onAction={() => navigate('supplies')}
          />
          <div className="supply-progress">
            <strong>{readySupplies} / {supplies.length + 7} items ang ready na</strong>
            <div className="progress">
              <div
                className="progress-bar"
                style={{ width: `${Math.max(15, (readySupplies / 12) * 100)}%` }}
              />
            </div>
          </div>
          <div className="supply-list">
            {supplies.map((item) => (
              <button
                className="supply-row"
                key={item.id}
                onClick={() => onCycleSupply(item.id)}
              >
                <i className={`bi ${item.icon}`} />
                <span>{item.name}</span>
                <em className={`badge-status ${item.status.toLowerCase()}`}>
                  {item.status}
                </em>
              </button>
            ))}
          </div>
        </div>

        <div className="panel checklist-panel">
          <SectionTitle
            icon="bi-check2-square"
            title="Preparedness Checklist"
            text="Kumpletuhin ang tasks para maging fully prepared."
            action="Tignan Lahat"
            onAction={() => navigate('checklist')}
          />
          <div className="checklist-summary">
            <strong>{completedTasks} / {tasks.length} nakumpleto</strong>
            <span>{checklistPercent}%</span>
          </div>
          <div className="progress mb-3">
            <div className="progress-bar" style={{ width: `${checklistPercent}%` }} />
          </div>
          <div className="task-list">
            {tasks.slice(0, 5).map((task) => (
              <label key={task.id}>
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => onToggleTask(task.id)}
                />
                <span>{task.text}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="panel evacuation-panel">
          <SectionTitle
            icon="bi-signpost-2-fill"
            title="Aking Evacuation Plan"
            text="Maging handa. Alamin kung saan pupunta."
          />
          <div className="plan-empty">
            <div className="map-art">
              <i className="bi bi-geo-alt-fill" />
            </div>
            <strong>Wala pang naisusulat na plan</strong>
            <p>I-set ang inyong evacuation area, safe routes, at family meeting point.</p>
            <button className="btn btn-handa" onClick={() => navigate('evacuation')}>
              Gumawa ng Plan <i className="bi bi-arrow-right ms-1" />
            </button>
          </div>
        </div>

        <div className="panel contacts-panel">
          <SectionTitle
            icon="bi-telephone-fill"
            title="Emergency Contacts"
            text="Panatilihing accessible ang mahahalagang numero."
            action="I-manage"
            onAction={() => navigate('contacts')}
          />
          <div className="contacts-count">
            <strong>4 contacts ang naka-save</strong>
            <button className="btn btn-sm btn-outline-handa" onClick={() => navigate('contacts')}>
              Manage Contacts
            </button>
          </div>
          <div className="contact-chips">
            <div>
              <i className="bi bi-shield-fill" />
              <span>PNP Mansalay<small>09XXXXXXXXX</small></span>
            </div>
            <div>
              <i className="bi bi-fire" />
              <span>BFP Mansalay<small>09XXXXXXXXX</small></span>
            </div>
            <div>
              <i className="bi bi-plus-circle-fill" />
              <span>Mansalay Medicare<small>09XXXXXXXXX</small></span>
            </div>
            <div>
              <i className="bi bi-person-fill" />
              <span>Family Contact<small>Saved</small></span>
            </div>
          </div>
        </div>

        <div className="panel readiness-panel">
          <SectionTitle
            icon="bi-bar-chart-fill"
            title="Disaster Readiness"
            text="Suriin ang antas ng paghahanda sa bawat uri ng sakuna."
          />
          {readiness.map((item) => (
            <div className="readiness-row" key={item.name}>
              <span>
                <i className={`bi ${item.icon}`} />
                {item.name}
              </span>
              <div className="progress">
                <div className="progress-bar" style={{ width: `${item.value}%` }} />
              </div>
              <strong>{item.value}%</strong>
            </div>
          ))}
        </div>

        <div className="panel guide-panel">
          <SectionTitle
            icon="bi-book-half"
            title="Rekomendadong Gabay"
            text="Gabay na magandang basahin ngayon."
            action="Lahat ng Guides"
            onAction={() => navigate('guides')}
          />
          <div className="recommended">
            <img src="/bagyo.jpg" alt="Typhoon preparedness" />
            <div>
              <span className="eyebrow">REKOMENDADO</span>
              <h3>Paghahanda sa Bagyo</h3>
              <p>Alamin ang mga dapat gawin bago, habang, at pagkatapos ng bagyo.</p>
              <button
                className="btn btn-handa"
                onClick={() =>
                  onSelectGuide(
                    filteredDisasters.find((d) => d.id === 1) || disasterList[0]
                  )
                }
              >
                Basahin ang Guide <i className="bi bi-arrow-right ms-1" />
              </button>
            </div>
          </div>
        </div>

        <div className="panel reminders-panel">
          <SectionTitle
            icon="bi-exclamation-triangle-fill"
            title="Mahahalagang Paalala"
            text="Maliit na hakbang na may malaking tulong."
          />
          <div className="reminders">
            <div>
              <i className="bi bi-backpack-fill" />
              <strong>{supplies.filter((s) => s.status !== 'Ready').length} supply items ang kailangang i-check.</strong>
              <button onClick={() => navigate('supplies')}>Tignan ang Supplies</button>
            </div>
            <div>
              <i className="bi bi-signpost-2-fill" />
              <strong>Kailangan pa ng karagdagang detalye sa inyong evacuation plan.</strong>
              <button onClick={() => navigate('evacuation')}>Gumawa ng Plan</button>
            </div>
            <div>
              <i className="bi bi-telephone-fill" />
              <strong>Siguraduhing updated ang emergency contacts.</strong>
              <button onClick={() => navigate('contacts')}>Manage Contacts</button>
            </div>
          </div>
        </div>

        <div className="panel activity-panel">
          <SectionTitle
            icon="bi-clock-history"
            title="Kamakailang Gawain"
            action="Tignan Lahat"
            onAction={() => navigate('checklist')}
          />
          <ul>
            <li>
              <i className="bi bi-check-circle-fill" />
              Natapos ang Flood Checklist <small>1 araw ang nakalipas</small>
            </li>
            <li>
              <i className="bi bi-check-circle-fill" />
              Nalagay ang Flashlight sa Emergency Kit <small>1 araw ang nakalipas</small>
            </li>
            <li>
              <i className="bi bi-check-circle-fill" />
              Na-update ang Family Contact <small>2 araw ang nakalipas</small>
            </li>
            <li>
              <i className="bi bi-check-circle-fill" />
              Nakalikha ng Evacuation Plan <small>3 araw ang nakalipas</small>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}

function ChecklistPage({ tasks, onToggleTask, percent }) {
  return (
    <PageShell
      icon="bi-check2-square"
      title="Emergency Checklist"
      description="I-track ang mga kailangang aksyon bago dumating ang anumang emergency."
    >
      <div className="panel page-panel">
        <div className="large-progress">
          <div>
            <strong>{percent}% ang nakumpleto</strong>
            <span>
              {tasks.filter((t) => t.done).length} sa {tasks.length} tasks ang natapos na
            </span>
          </div>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="full-task-list">
          {tasks.map((task) => (
            <label key={task.id}>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => onToggleTask(task.id)}
              />
              <span>
                <strong>{task.text}</strong>
                <small>{task.done ? 'Nagawa na' : 'Kailangan pa ng aksyon'}</small>
              </span>
              <i
                className={`bi ${
                  task.done ? 'bi-check-circle-fill' : 'bi-circle'
                }`}
              />
            </label>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function SuppliesPage({ supplies, onCycleSupply }) {
  return (
    <PageShell
      icon="bi-backpack4"
      title="Emergency Supplies"
      description="I-monitor ang laman at status ng inyong emergency kit."
    >
      <div className="panel page-panel">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="h5 fw-bold mb-1">Aking Emergency Kit</h2>
            <p className="text-secondary small mb-0">
              I-click ang item para palitan ang status nito sa demo na ito.
            </p>
          </div>
          <button
            className="btn btn-handa"
            onClick={() => alert('Pwedeng i-connect dito ang Add Supply modal/form.')}
          >
            + Magdagdag ng Supply
          </button>
        </div>

        <div className="supply-table">
          {supplies.map((item) => (
            <button key={item.id} onClick={() => onCycleSupply(item.id)}>
              <i className={`bi ${item.icon}`} />
              <strong>{item.name}</strong>
              <span className={`badge-status ${item.status.toLowerCase()}`}>
                {item.status}
              </span>
              <i className="bi bi-chevron-right" />
            </button>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function EvacuationPage() {
  return (
    <PageShell
      icon="bi-signpost-2-fill"
      title="Evacuation Plan"
      description="Maghanda ng simpleng plano para alam ng lahat ang pupuntahan."
    >
      <div className="panel page-panel">
        <div className="form-grid">
          <div>
            <label>Evacuation Center</label>
            <input className="form-control" placeholder="Ilagay ang evacuation center" />
          </div>
          <div>
            <label>Family Meeting Point</label>
            <input className="form-control" placeholder="Ilagay ang meeting point" />
          </div>
          <div>
            <label>Pangunahing Daanan (Primary Route)</label>
            <input className="form-control" placeholder="Ilarawan ang pinakaligtas na daan" />
          </div>
          <div>
            <label>Alternatibong Daanan (Backup Route)</label>
            <input className="form-control" placeholder="Ilarawan ang alternatibong daan" />
          </div>
        </div>

        <div className="plan-map-large">
          <i className="bi bi-map" />
          <div>
            <strong>Map / Route Area</strong>
            <span>Pwedeng i-integrate ang totoong map service dito pagdating ng panahon.</span>
          </div>
        </div>

        <button
          className="btn btn-handa"
          onClick={() => alert('Naka-save na ang evacuation plan sa demo na ito.')}
        >
          I-save ang Evacuation Plan
        </button>
      </div>
    </PageShell>
  );
}

function ContactsPage() {
  const contactData = [
    ['bi-shield-fill', 'PNP Mansalay', '09XXXXXXXXX'],
    ['bi-fire', 'BFP Mansalay', '09XXXXXXXXX'],
    ['bi-plus-circle-fill', 'Mansalay Medicare', '09XXXXXXXXX'],
    ['bi-person-fill', 'Family Contact', 'Magdagdag ng numero'],
    ['bi-building', 'LGU Mansalay', '09XXXXXXXXX'],
    ['bi-telephone', 'Iba pang Contact', 'Magdagdag ng numero']
  ];

  return (
    <PageShell
      icon="bi-telephone-fill"
      title="Emergency Contacts"
      description="Itago ang mahahalagang numero na kailangan sa oras ng sakuna."
    >
      <div className="contact-page-grid">
        {contactData.map(([icon, name, number]) => (
          <div className="panel contact-card" key={name}>
            <i className={`bi ${icon}`} />
            <div>
              <strong>{name}</strong>
              <span>{number}</span>
            </div>
            <button className="btn btn-sm btn-outline-handa">Edit</button>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

function GuidesPage({ disasters, onSelect }) {
  return (
    <PageShell
      icon="bi-book-half"
      title="Disaster Guides"
      description="Pumili ng uri ng sakuna para mabasa ang praktikal na gabay sa kaligtasan."
    >
      <div className="row g-4">
        {disasters.map((item) => (
          <div className="col-md-6 col-xl-4" key={item.id}>
            <div className="guide-card">
              <img src={item.image} alt={item.title} />
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <button onClick={() => onSelect(item)}>
                  Basahin ang Guide <i className="bi bi-arrow-right" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

function SettingsPage({ darkMode, setDarkMode, onLogout }) {
  return (
    <PageShell
      icon="bi-gear-fill"
      title="Settings"
      description="I-manage ang iyong mga gustong preference sa dashboard."
    >
      <div className="panel page-panel settings-list">
        <label>
          <span>
            <strong>Dark Mode</strong>
            <small>Gamitin ang mas madilim na kulay para sa low-light na kapaligiran.</small>
          </span>
          <button
            className={`switch ${darkMode ? 'on' : ''}`}
            onClick={() => setDarkMode(!darkMode)}
          >
            <span />
          </button>
        </label>

        <label>
          <span>
            <strong>Offline-friendly Interface</strong>
            <small>Mananatiling gumagana ang batayang interface ng app kahit walang internet connection.</small>
          </span>
          <i className="bi bi-check-circle-fill text-handa-green" />
        </label>

        <button className="btn btn-outline-danger mt-3" onClick={onLogout}>
          Log Out
        </button>
      </div>
    </PageShell>
  );
}

function PageShell({ icon, title, description, children }) {
  return (
    <div className="page-shell">
      <div className="page-title">
        <div className="section-icon green">
          <i className={`bi ${icon}`} />
        </div>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}