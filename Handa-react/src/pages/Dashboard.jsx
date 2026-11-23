import { useEffect, useMemo, useState } from 'react';
import { auth } from '../components/firebase.js';
import DisasterDetail from './DisasterDetail';

const disasterList = [
  {
    id: 1,
    title: 'Bagyo at Unos (Typhoons)',
    description:
      'Maging alerto sa mga babala ng PAGASA. Ihanda ang Go-Bag at alamin ang evacuation center sa inyong barangay.',
    linkText: 'Gabay sa Panahon ng Bagyo',
    image: '/bagyo.jpg',
  },
  {
    id: 2,
    title: 'Baha (Flooding)',
    description:
      'Iwasang lumusong sa baha para makaiwas sa leptospirosis at iba pang sakit. “Kung baha na, lumikas na!”',
    linkText: 'Maging Handa sa Baha',
    image: '/baha.jpg',
  },
  {
    id: 3,
    title: 'Lindol (Earthquakes)',
    description:
      'Tandaan ang Duck, Cover, and Hold! Siguraduhing ligtas ang inyong tahanan mula sa mga bumabagsak na gamit.',
    linkText: 'Gabay sa Paghahanda sa Lindol',
    image: '/lindol.jpg',
  },
  {
    id: 4,
    title: 'Sunog (Fire Safety)',
    description:
      'I-check ang mga linya ng kuryente at gasul. Tandaan ang Stop, Drop, and Roll sakaling magkasunog.',
    linkText: 'Mga Payo sa Fire Safety',
    image: '/sunog.jpg',
  },
  {
    id: 5,
    title: 'Kawalan ng Kuryente (Power Outage)',
    description:
      'Magtabi ng flashlight, kandila, at power bank. Tiyaking nakatago sa ligtas na lugar ang mga emergency supplies.',
    linkText: 'Payo sa Power Outages',
    image: '/kuryente.jpg',
  },
  {
    id: 6,
    title: 'Pagsabog ng Bulkan (Volcanic Eruption)',
    description:
      'Magsuot ng N95 mask o basahang basa para sa ashfall. Sumunod sa payo ng PHIVOLCS at LGU kung kailangang lumikas.',
    linkText: 'Gabay sa Ashfall at Bulkan',
    image: '/bulkan.jpg',
  },
  {
    id: 7,
    title: 'Pagguho ng Lupa (Landslide)',
    description:
      'Maging alerto sa patuloy na pag-ulan sa mga kabundukan. Mag-evacuate agad kapag nakakita ng bitak sa lupa o kakaibang tunog.',
    linkText: 'Kaligtasan sa Landslide',
    image: '/landslide.jpg',
  },
  {
    id: 8,
    title: 'Tsunami Warning',
    description:
      'Kapag nakaramdam ng malakas na lindol malapit sa baybayin o mabilis na pagliit ng tubig-dagat, tumakbo agad sa mataas na lugar.',
    linkText: 'Gabay sa Tsunami Preparedness',
    image: '/tsunami.jpg',
  },
  {
    id: 9,
    title: 'Paghahanda ng Emergency Go-Bag',
    description:
      'Maghanda ng Go-Bag na naglalaman ng pagkain, tubig, gamot, barya, at mahahalagang dokumento para sa 72 oras.',
    linkText: 'Listahan ng Laman ng Go-Bag',
    image: '/gobag.jpg',
  },
];

const initialSupplies = [
  { id: 1, name: 'Tubig na Inumin', icon: 'bi-droplet-fill', status: 'Ready' },
  { id: 2, name: 'First Aid Kit', icon: 'bi-bandaid-fill', status: 'Ready' },
  { id: 3, name: 'Flashlight', icon: 'bi-flashlight-fill', status: 'Check' },
  { id: 4, name: 'MGA Baterya', icon: 'bi-battery-half', status: 'Missing' },
  { id: 5, name: 'Radyo', icon: 'bi-broadcast-pin', status: 'Ready' },
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
  { id: 10, text: 'Tignan ang mga hotline numbers sa inyong lugar', done: true },
];

const readiness = [
  { name: 'Bagyo', value: 80, icon: 'bi-wind' },
  { name: 'Baha', value: 60, icon: 'bi-water' },
  { name: 'Lindol', value: 50, icon: 'bi-activity' },
  { name: 'Sunog', value: 70, icon: 'bi-fire' },
  { name: 'Landslide', value: 40, icon: 'bi-triangle-fill' },
];

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');

async function dashboardRequest(path, options = {}) {
  if (!auth.currentUser) throw new Error('Please sign in again.');
  const token = await auth.currentUser.getIdToken();
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });
}


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
        <button
          className="btn btn-sm btn-outline-handa"
          onClick={onAction}
        >
          {action} <i className="bi bi-arrow-right ms-1" />
        </button>
      )}
    </div>
  );
}

function ProgressRing({ value }) {
  return (
    <div
      className="progress-ring"
      style={{ '--progress': `${value * 3.6}deg` }}
    >
      <div className="progress-ring-inner">
        <strong>{value}%</strong>
      </div>
    </div>
  );
}

function getUniqueSupplies(items) {
  const uniqueItems = new Map();

  items.forEach((item) => {
    const key = String(item.name || '').trim().toLowerCase();
    if (key) uniqueItems.set(key, item);
  });

  return Array.from(uniqueItems.values());
}

export default function Dashboard({ user, onLogout, isOnline }) {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [supplies, setSupplies] = useState(initialSupplies);
  const [lguKit, setLguKit] = useState([]);
  const [sharedSupplies, setSharedSupplies] = useState([]);
  const [sharedSuppliesLoading, setSharedSuppliesLoading] = useState(true);
  const [supplyRequests, setSupplyRequests] = useState([]);
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [dashboardError, setDashboardError] = useState('');
  const [contacts, setContacts] = useState([]);
  const [evacuationPlan, setEvacuationPlan] = useState(null);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date());

  useEffect(() => {
    const clockId = window.setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => window.clearInterval(clockId);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadMySupplyRequests() {
      try {
        const response = await dashboardRequest('/api/my-supply-requests');
        if (!response.ok) throw new Error('Hindi ma-load ang iyong supply requests.');
        const data = await response.json();
        if (active) setSupplyRequests(data);
      } catch (error) {
        console.error('Supply requests loading failed:', error);
      }
    }

    async function loadMyPersonalKit() {
      try {
        const response = await dashboardRequest('/api/user-supplies');
        if (!response.ok) throw new Error('Hindi ma-refresh ang iyong emergency kit.');
        const data = await response.json();
        if (active) {
          setSupplies(getUniqueSupplies(data).map((item, index) => ({
            ...item,
            icon: ['bi-droplet-fill', 'bi-bandaid-fill', 'bi-flashlight-fill', 'bi-battery-half', 'bi-broadcast-pin'][index % 5]
          })));
        }
      } catch (error) {
        console.error('Personal emergency kit refresh failed:', error);
      }
    }

    async function loadMyLguKit() {
      try {
        const response = await dashboardRequest('/api/my-lgu-kit');
        if (!response.ok) throw new Error('Hindi ma-load ang supplies na inilabas ng LGU.');
        const data = await response.json();
        if (active) setLguKit(getUniqueSupplies(data));
      } catch (error) {
        console.error('LGU emergency kit loading failed:', error);
      }
    }

    async function loadSharedSupplies() {
      try {
        const response = await dashboardRequest('/api/public-supplies');
        if (!response.ok) throw new Error('Hindi ma-load ang LGU emergency inventory.');
        const data = await response.json();
        if (active) setSharedSupplies(data);
      } catch (error) {
        console.error('Shared emergency inventory loading failed:', error);
      } finally {
        if (active) setSharedSuppliesLoading(false);
      }
    }

    loadSharedSupplies();
    loadMySupplyRequests();
    loadMyPersonalKit();
    loadMyLguKit();
    const refreshId = window.setInterval(() => {
      loadSharedSupplies();
      loadMySupplyRequests();
      loadMyPersonalKit();
      loadMyLguKit();
    }, 15000);

    return () => {
      active = false;
      window.clearInterval(refreshId);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadResidentData() {
      try {
        const [checklistResponse, suppliesResponse] = await Promise.all([
          dashboardRequest('/api/checklists'),
          dashboardRequest('/api/user-supplies')
        ]);

        if (!checklistResponse.ok || !suppliesResponse.ok) {
          throw new Error('Hindi ma-load ang iyong saved records.');
        }

        const savedTasks = await checklistResponse.json();
        let savedSupplies = await suppliesResponse.json();

        if (active) {
          setTasks(savedTasks);
          setSupplies(getUniqueSupplies(savedSupplies).map((item, index) => ({
            ...item,
            icon: ['bi-droplet-fill', 'bi-bandaid-fill', 'bi-flashlight-fill', 'bi-battery-half', 'bi-broadcast-pin'][index % 5]
          })));
        }
      } catch (error) {
        console.error('Resident data loading failed:', error);
        if (active) setDashboardError(error.message || 'Database connection failed.');
      }
    }

    async function loadDashboardExtras() {
      const requests = await Promise.allSettled([
        dashboardRequest('/api/emergency-contacts'),
        dashboardRequest('/api/evacuation-plan'),
        dashboardRequest('/api/activity-logs'),
        dashboardRequest('/api/notifications')
      ]);

      if (!active) return;

      const [contactsResult, planResult, activitiesResult, notificationsResult] = requests;

      if (contactsResult.status === 'fulfilled' && contactsResult.value.ok) {
        setContacts(await contactsResult.value.json());
      }
      if (planResult.status === 'fulfilled' && planResult.value.ok) {
        setEvacuationPlan(await planResult.value.json());
      }
      if (activitiesResult.status === 'fulfilled' && activitiesResult.value.ok) {
        setActivities(await activitiesResult.value.json());
      }
      if (notificationsResult.status === 'fulfilled' && notificationsResult.value.ok) {
        setNotifications(await notificationsResult.value.json());
      }
    }

    loadResidentData();
    loadDashboardExtras();
    return () => { active = false; };
  }, []);

  async function submitSupplyRequest(supplyId, quantity) {
    const requestedQuantity = Number(quantity);
    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
      throw new Error('Maglagay ng valid na quantity na hindi bababa sa 1.');
    }
    const response = await dashboardRequest('/api/supply-requests', {
      method: 'POST',
      body: JSON.stringify({ supplyId, quantity: requestedQuantity })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || 'Hindi naisumite ang supply request.');
    setSupplyRequests((current) => [result, ...current]);
    return result;
  }

  async function refreshActivities() {
    try {
      const response = await dashboardRequest('/api/activity-logs');
      if (response.ok) setActivities(await response.json());
    } catch (error) {
      console.error('Activity logs could not be loaded:', error);
    }
  }

  async function recordActivity(action, description) {
    try {
      const response = await dashboardRequest('/api/activity-logs', {
        method: 'POST',
        body: JSON.stringify({ action, description })
      });
      if (response.ok) await refreshActivities();
    } catch (error) {
      console.error('Activity log could not be saved:', error);
    }
  }

  async function addPersonalSupply(name) {
    const cleanName = name.trim();
    if (!cleanName) return false;

    if (supplies.some((item) => item.name.trim().toLowerCase() === cleanName.toLowerCase())) {
      setDashboardError('May kaparehong item na sa iyong emergency kit.');
      return false;
    }

    try {
      const response = await dashboardRequest('/api/user-supplies', {
        method: 'POST',
        body: JSON.stringify({ name: cleanName, quantity: 1, status: 'Missing' })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Hindi maidagdag ang supply.');
      setSupplies((current) => [...current, { ...result, icon: 'bi-box-seam' }]);
      await recordActivity('Emergency kit item added', `Added ${cleanName} to the emergency kit.`);
      return true;
    } catch (error) {
      setDashboardError(error.message);
      return false;
    }
  }

  async function markNotificationRead(id) {
    try {
      const response = await dashboardRequest(`/api/notifications/${id}/read`, {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Hindi ma-update ang notification.');
      setNotifications((current) => current.map((item) =>
        item.id === id ? { ...item, isRead: true } : item
      ));
    } catch (error) {
      setDashboardError(error.message);
    }
  }

  const completedTasks = tasks.filter((task) => task.done).length;

  const checklistPercent =
    tasks.length > 0
      ? Math.round((completedTasks / tasks.length) * 100)
      : 0;

  const readySupplies = supplies.filter(
    (item) => item.status === 'Ready'
  ).length;

  const planFields = ['evacuationCenter', 'meetingPoint', 'primaryRoute', 'backupRoute'];
  const completedPlanFields = planFields.filter((field) => String(evacuationPlan?.[field] || '').trim()).length;
  const checklistPoints = Math.round(checklistPercent * 0.4);
  const supplyPoints = supplies.length > 0 ? Math.round((readySupplies / supplies.length) * 25) : 0;
  const evacuationPoints = Math.round((completedPlanFields / planFields.length) * 20);
  const contactPoints = Math.round((Math.min(contacts.length, 3) / 3) * 15);
  const scoreBreakdown = [
    { label: 'Preparedness checklist', earned: checklistPoints, weight: 40 },
    { label: 'Emergency kit readiness', earned: supplyPoints, weight: 25 },
    { label: 'Evacuation plan', earned: evacuationPoints, weight: 20 },
    { label: 'Emergency contacts', earned: contactPoints, weight: 15 },
  ];
  const preparednessScore = scoreBreakdown.reduce((total, item) => total + item.earned, 0);

  const filteredDisasters = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return disasterList;

    return disasterList.filter((item) =>
      `${item.title} ${item.description}`
        .toLowerCase()
        .includes(query)
    );
  }, [search]);

  const navigate = (page) => {
    setActivePage(page);
    setSelectedDisaster(null);
    setMobileNav(false);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const toggleTask = async (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task
    );
    setTasks(updatedTasks);

    try {
      const response = await dashboardRequest('/api/checklists', {
        method: 'PUT',
        body: JSON.stringify({ tasks: updatedTasks })
      });
      if (!response.ok) throw new Error('Hindi na-save ang checklist.');
      const changedTask = updatedTasks.find((task) => task.id === id);
      await recordActivity('Checklist updated', changedTask?.text || 'Updated a preparedness checklist task');
    } catch (error) {
      console.error(error);
      setDashboardError(error.message);
    }
  };

  const cycleSupply = async (id) => {
    const updatedSupplies = supplies.map((item) => {
      if (item.id !== id) return item;
      const next = item.status === 'Ready' ? 'Check' : item.status === 'Check' ? 'Missing' : 'Ready';
      return { ...item, status: next };
    });
    setSupplies(updatedSupplies);

    const changedSupply = updatedSupplies.find((item) => item.id === id);
    if (!changedSupply) return;

    try {
      const response = await dashboardRequest(`/api/user-supplies/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: changedSupply.name,
          quantity: changedSupply.quantity || 1,
          status: changedSupply.status
        })
      });
      if (!response.ok) throw new Error('Hindi na-save ang supply status.');
      await recordActivity('Emergency kit updated', `${changedSupply.name} status changed to ${changedSupply.status}`);
    } catch (error) {
      console.error(error);
      setDashboardError(error.message);
    }
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
                Magandang araw, {user?.name || 'User'}!{' '}
                <span aria-hidden="true">👋</span>
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

            <button
              className="icon-button"
              title="Notifications"
              onClick={() => setNotificationOpen((open) => !open)}
              aria-expanded={notificationOpen}
            >
              <i className="bi bi-bell" />
              {notifications.some((item) => !item.isRead) && <span className="notification-dot">{notifications.filter((item) => !item.isRead).length}</span>}
            </button>

            <div className="date-block d-none d-xl-block">
              <strong>{currentDateTime?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
              <span>{currentDateTime?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          </div>
          {notificationOpen && (
            <div className="notification-dropdown shadow rounded-3 bg-white p-3" style={{ position: 'absolute', right: 24, top: 76, zIndex: 20, width: 'min(360px, calc(100vw - 32px))', maxHeight: 360, overflowY: 'auto' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong>Notifications</strong>
                <button className="btn btn-sm btn-link text-success p-0" onClick={() => setNotificationOpen(false)}>Close</button>
              </div>
              {notifications.length === 0 ? (
                <p className="small text-secondary mb-0">Wala pang notifications sa iyong account.</p>
              ) : notifications.map((item) => (
                <div key={item.id} className="border-top py-2">
                  <div className="d-flex justify-content-between gap-2">
                    <strong className="small">{item.title}</strong>
                    {!item.isRead && <span className="badge bg-success">New</span>}
                  </div>
                  <p className="small text-secondary mb-1">{item.message}</p>
                  {!item.isRead && <button className="btn btn-sm btn-outline-success" onClick={() => markNotificationRead(item.id)}>Mark as read</button>}
                </div>
              ))}
            </div>
          )}
        </header>

        <main className="dashboard-content">
          {activePage === 'dashboard' && (
            <DashboardHome
              preparednessScore={preparednessScore}
              scoreBreakdown={scoreBreakdown}
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
              contacts={contacts}
              evacuationPlan={evacuationPlan}
              activities={activities}
              sharedSupplies={sharedSupplies}
              sharedSuppliesLoading={sharedSuppliesLoading}
              currentDateTime={currentDateTime}
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
            <SuppliesPage
              lguKit={lguKit}
              sharedSupplies={sharedSupplies}
              sharedSuppliesLoading={sharedSuppliesLoading}
              supplyRequests={supplyRequests}
              onSubmitSupplyRequest={submitSupplyRequest}
            />
          )}

          {dashboardError && <div className="alert alert-warning mx-3" role="alert">{dashboardError}</div>}

          {activePage === 'evacuation' && (
            <EvacuationPage
              onPlanSaved={setEvacuationPlan}
              onActivityAdded={refreshActivities}
            />
          )}

          {activePage === 'contacts' && (
            <ContactsPage
              onContactsChanged={setContacts}
              onActivityAdded={refreshActivities}
            />
          )}

          {activePage === 'guides' && (
            <GuidesPage
              disasters={filteredDisasters}
              onSelect={setSelectedDisaster}
            />
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
          Handa • Disaster Preparedness Guide
          <span>•</span>
          Panatilihing ligtas at handa ang inyong pamilya.
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
  mobileNav,
}) {
  const navItems = [
    ['dashboard', 'bi-grid-1x2-fill', 'Dashboard'],
    ['checklist', 'bi-check2-square', 'Emergency Checklist'],
    ['supplies', 'bi-backpack4', 'Emergency Supplies'],
    ['evacuation', 'bi-signpost-2-fill', 'Evacuation Plans'],
    ['contacts', 'bi-telephone-fill', 'Emergency Contacts'],
    ['guides', 'bi-book-half', 'Disaster Guides'],
    ['settings', 'bi-gear-fill', 'Settings'],
  ];

  return (
    <aside
      className={`handa-sidebar ${
        mobileNav ? 'show' : ''
      }`}
    >
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
            <i className="bi bi-sun me-2" />
            Light / Dark Mode
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
          <span
            className={`status-dot ${
              isOnline ? 'online' : ''
            }`}
          />

          {isOnline ? 'Online' : 'Offline Mode'}
        </div>

        <div className="profile">
          <div className="profile-avatar">
            <i className="bi bi-person-fill" />
          </div>

          <div className="flex-grow-1">
            <strong>{user?.name || 'User'}</strong>
            <small>
              {user?.email || 'Preparedness user'}
            </small>
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
  scoreBreakdown,
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
  filteredDisasters,
  contacts,
  evacuationPlan,
  activities,
  sharedSupplies = [],
  sharedSuppliesLoading = false,
  currentDateTime,
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
              <span className="eyebrow">
                KASALUKUYANG STATUS
              </span>

              <h3>
                {preparednessScore >= 80
                  ? 'Handang-Handa Na!'
                  : preparednessScore >= 60
                  ? 'Malapit Nang Maging Handa'
                  : 'Kailangan Pa Ng Aksyon'}
              </h3>

              <p>
                Ang score ay kinukuha mula sa checklist, personal emergency kit, evacuation plan, at emergency contacts. Nagbabago ito kapag may na-update kang records.
              </p>

              <div className="mt-3" aria-label="Preparedness score breakdown">
                {scoreBreakdown.map((item) => (
                  <div className="mb-2" key={item.label}>
                    <div className="d-flex justify-content-between small mb-1">
                      <span>{item.label}</span>
                      <strong>{item.earned}/{item.weight}</strong>
                    </div>
                    <div className="progress" style={{ height: 7 }}>
                      <div className="progress-bar bg-success" role="progressbar" style={{ width: `${item.weight ? (item.earned / item.weight) * 100 : 0}%` }} aria-valuenow={item.earned} aria-valuemin="0" aria-valuemax={item.weight} />
                    </div>
                  </div>
                ))}
              </div>

              <p className="small text-secondary mt-2 mb-3">
                Checklist: {completedTasks}/{tasks.length} completed · Emergency kit: {readySupplies}/{supplies.length} Ready
              </p>

              <button
                className="btn btn-handa"
                onClick={() => navigate('checklist')}
              >
                Tignan ang Details
                <i className="bi bi-arrow-right ms-1" />
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

          {(() => {
            const notReadyCount = supplies.filter((item) => item.status !== 'Ready').length;
            const planFields = ['evacuationCenter', 'meetingPoint', 'primaryRoute', 'backupRoute'];
            const missingPlanFields = planFields.filter((field) => !String(evacuationPlan?.[field] || '').trim()).length;
            const planComplete = missingPlanFields === 0;
            const hasAttention = notReadyCount > 0 || !planComplete;
            return (
              <>
                <div className="safe-status">
                  <i className={hasAttention ? "bi bi-shield-exclamation" : "bi bi-check-circle-fill"} />

                  <div>
                    <strong>{hasAttention ? 'May mga preparedness task na kailangan' : 'Maayos ang iyong preparedness records'}</strong>
                    <span>Dashboard status batay sa iyong saved emergency kit at evacuation plan. Hindi ito real-time official emergency alert feed.</span>
                  </div>
                </div>

                <div className="attention">
                  <i className="bi bi-exclamation-triangle-fill" />
                  <div>
                    <strong>Kailangan ng iyong pansin</strong>
                    <ul className="mb-2">
                      <li>{notReadyCount} supply {notReadyCount === 1 ? 'item' : 'items'} ang kailangang i-check</li>
                      <li>{planComplete ? 'Kumpleto ang evacuation plan fields' : `Kulang ang ${missingPlanFields} evacuation plan field(s)`}</li>
                    </ul>
                    <div className="d-flex flex-wrap gap-2">
                      {notReadyCount > 0 && <button className="btn btn-sm btn-outline-handa" onClick={() => navigate('supplies')}>Check Emergency Kit</button>}
                      {!planComplete && <button className="btn btn-sm btn-outline-handa" onClick={() => navigate('evacuation')}>Complete Evacuation Plan</button>}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        <div className="quote-card">
          <img
            src="/hero-bg.jpg"
            alt="Preparedness landscape"
          />

          <div className="quote-overlay">
            <p>
              “Ang paghahanda ngayong araw
              <br />
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
            text="Live inventory mula sa administrator. Awtomatikong nag-a-update kada 15 segundo."
            action="I-manage"
            onAction={() => navigate('supplies')}
          />

          <div className="supply-progress">
            <strong>
              {sharedSupplies.filter((item) => Number(item.quantity) > 0).length} / {sharedSupplies.length} LGU supplies in stock
            </strong>

            <div className="progress">
              <div
                className="progress-bar"
                style={{
                  width: `${sharedSupplies.length
                    ? Math.max(15, (sharedSupplies.filter((item) => Number(item.quantity) > 0).length / sharedSupplies.length) * 100)
                    : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="supply-list">
            {sharedSuppliesLoading ? (
              <div className="text-secondary small py-3">
                <span className="spinner-border spinner-border-sm me-2" />Loading admin supplies...
              </div>
            ) : sharedSupplies.length === 0 ? (
              <p className="text-secondary small py-3 mb-0">Wala pang emergency supplies na inilalagay ang administrator.</p>
            ) : (
              sharedSupplies.map((item) => (
                <div className="supply-row" key={item.id}>
                  <i className="bi bi-box-seam" />
                  <span className="flex-grow-1">
                    {item.name}
                    <small className="d-block text-secondary">{item.category} · Qty: {Number(item.quantity)}</small>
                  </span>
                  <em className={`badge-status ${Number(item.quantity) <= 0 ? 'missing' : Number(item.quantity) <= 15 ? 'check' : 'ready'}`}>
                    {Number(item.quantity) <= 0 ? 'Out of Stock' : Number(item.quantity) <= 15 ? 'Low Stock · Check' : 'Available'}
                  </em>
                </div>
              ))
            )}
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
            <strong>
              {completedTasks} / {tasks.length} nakumpleto
            </strong>

            <span>{checklistPercent}%</span>
          </div>

          <div className="progress mb-3">
            <div
              className="progress-bar"
              style={{
                width: `${checklistPercent}%`,
              }}
            />
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

            <strong>{evacuationPlan && (evacuationPlan.evacuationCenter || evacuationPlan.meetingPoint) ? 'May naka-save na evacuation plan' : 'Wala pang naisusulat na plan'}</strong>

            <p>
              {evacuationPlan && (evacuationPlan.evacuationCenter || evacuationPlan.meetingPoint)
                ? `Evacuation Center: ${evacuationPlan.evacuationCenter || 'Not set'} • Meeting Point: ${evacuationPlan.meetingPoint || 'Not set'}`
                : 'I-set ang inyong evacuation area, safe routes, at family meeting point.'}
            </p>

            <button
              className="btn btn-handa"
              onClick={() => navigate('evacuation')}
            >
              Gumawa ng Plan
              <i className="bi bi-arrow-right ms-1" />
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
            <strong>{contacts.length} contact{contacts.length === 1 ? '' : 's'} ang naka-save</strong>

            <button
              className="btn btn-sm btn-outline-handa"
              onClick={() => navigate('contacts')}
            >
              Manage Contacts
            </button>
          </div>

          <div className="contact-chips">
            {contacts.slice(0, 4).map((contact) => (
              <div key={contact.id}>
                <i className="bi bi-person-lines-fill" />
                <span>
                  {contact.name}
                  <small>{contact.phone}</small>
                </span>
              </div>
            ))}
            {contacts.length === 0 && <p className="small text-secondary mb-0">Wala pang saved contacts.</p>}
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
                <div
                  className="progress-bar"
                  style={{
                    width: `${item.value}%`,
                  }}
                />
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
            <img
              src="/bagyo.jpg"
              alt="Typhoon preparedness"
            />

            <div>
              <span className="eyebrow">REKOMENDADO</span>

              <h3>Paghahanda sa Bagyo</h3>

              <p>
                Alamin ang mga dapat gawin bago, habang, at pagkatapos
                ng bagyo.
              </p>

              <button
                className="btn btn-handa"
                onClick={() =>
                  onSelectGuide(
                    filteredDisasters.find(
                      (d) => d.id === 1
                    ) || disasterList[0]
                  )
                }
              >
                Basahin ang Guide
                <i className="bi bi-arrow-right ms-1" />
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

              <strong>
                {
                  supplies.filter(
                    (s) => s.status !== 'Ready'
                  ).length
                }{' '}
                supply items ang kailangang i-check.
              </strong>

              <button onClick={() => navigate('supplies')}>
                Tignan ang Supplies
              </button>
            </div>

            <div>
              <i className="bi bi-signpost-2-fill" />

              <strong>
                Kailangan pa ng karagdagang detalye sa inyong
                evacuation plan.
              </strong>

              <button onClick={() => navigate('evacuation')}>
                Gumawa ng Plan
              </button>
            </div>

            <div>
              <i className="bi bi-telephone-fill" />

              <strong>
                Siguraduhing updated ang emergency contacts.
              </strong>

              <button onClick={() => navigate('contacts')}>
                Manage Contacts
              </button>
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
            {activities.slice(0, 5).map((activity) => (
              <li key={activity.id}>
                <i className="bi bi-check-circle-fill" />
                {activity.description || activity.action}
                <small>{activity.createdAt ? new Date(activity.createdAt).toLocaleString() : ''}</small>
              </li>
            ))}
            {activities.length === 0 && <li className="text-secondary">Wala pang recorded activities.</li>}
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
              {tasks.filter((t) => t.done).length} sa {tasks.length}{' '}
              tasks ang natapos na
            </span>
          </div>

          <div className="progress">
            <div
              className="progress-bar"
              style={{
                width: `${percent}%`,
              }}
            />
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

                <small>
                  {task.done
                    ? 'Nagawa na'
                    : 'Kailangan pa ng aksyon'}
                </small>
              </span>

              <i
                className={`bi ${
                  task.done
                    ? 'bi-check-circle-fill'
                    : 'bi-circle'
                }`}
              />
            </label>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function SuppliesPage({ lguKit = [], sharedSupplies, sharedSuppliesLoading, supplyRequests = [], onSubmitSupplyRequest }) {
  const [requestQuantities, setRequestQuantities] = useState({});
  const [requestMessage, setRequestMessage] = useState('');
  const [requestingSupplyId, setRequestingSupplyId] = useState(null);

  async function handleAddSupply(event) {
    event.preventDefault();
    const saved = await onAddSupply(newSupplyName);
    if (saved) {
      setNewSupplyName('');
      setMessage('Naidagdag ang supply sa iyong emergency kit.');
    } else {
      setMessage('Hindi naidagdag ang supply. Pakitingnan ang error message.');
    }
  }

  return (
    <PageShell
      icon="bi-backpack4"
      title="Emergency Supplies"
      description="I-monitor ang laman at status ng inyong emergency kit."
    >
      <div className="panel page-panel mb-4">
        <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-3">
          <div>
            <h2 className="h5 fw-bold mb-1"><i className="bi bi-building-check me-2 text-success" />LGU Emergency Supply Inventory</h2>
            <p className="text-secondary small mb-0">Mga supply na inilagay ng administrator. Awtomatikong nagre-refresh kada 15 segundo.</p>
          </div>
          <span className="badge text-bg-success">{sharedSupplies.length} items</span>
        </div>
        {sharedSuppliesLoading ? (
          <div className="text-secondary small py-3"><span className="spinner-border spinner-border-sm me-2" />Loading LGU inventory...</div>
        ) : sharedSupplies.length === 0 ? (
          <p className="text-secondary small mb-0 py-3">Wala pang inilalagay na emergency supplies ang administrator.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead><tr><th>Supply Name</th><th>Category</th><th>Available</th><th>Status</th><th style={{ minWidth: 190 }}>Request Quantity</th></tr></thead>
              <tbody>
                {sharedSupplies.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-semibold">{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.quantity}</td>
                    <td><span className={`badge ${item.status === 'Low Stock' ? 'text-bg-warning' : 'text-bg-success'}`}>{item.status}</span></td>
                    <td>
                      <form className="d-flex gap-2" onSubmit={async (event) => {
                        event.preventDefault();
                        setRequestingSupplyId(item.id);
                        setRequestMessage('');
                        try {
                          await onSubmitSupplyRequest(item.id, requestQuantities[item.id] || 1);
                          setRequestQuantities((current) => ({ ...current, [item.id]: 1 }));
                          setRequestMessage(`Request para sa ${item.name} ay naisumite na.`);
                        } catch (error) {
                          setRequestMessage(error.message || 'Hindi naisumite ang request.');
                        } finally {
                          setRequestingSupplyId(null);
                        }
                      }}>
                        <input
                          className="form-control form-control-sm"
                          type="number"
                          min="1"
                          max={Number(item.quantity)}
                          value={requestQuantities[item.id] ?? 1}
                          onChange={(event) => setRequestQuantities((current) => ({ ...current, [item.id]: event.target.value }))}
                          disabled={Number(item.quantity) < 1 || requestingSupplyId === item.id}
                          aria-label={`Quantity for ${item.name}`}
                          style={{ maxWidth: 78 }}
                        />
                        <button className="btn btn-sm btn-success text-nowrap" type="submit" disabled={Number(item.quantity) < 1 || requestingSupplyId === item.id}>
                          {requestingSupplyId === item.id ? 'Sending...' : 'Request Supply'}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {requestMessage && <div className="alert alert-info py-2 mt-3 mb-0 small">{requestMessage}</div>}
      </div>

      <div className="panel page-panel mb-4">
        <h2 className="h5 fw-bold mb-1"><i className="bi bi-clipboard-check me-2 text-success" />Aking LGU Supply Requests</h2>
        <p className="text-secondary small">Makikita rito kung Pending, Approved, Rejected, o Released na ang iyong request.</p>
        {supplyRequests.length === 0 ? (
          <p className="text-secondary small mb-0">Wala ka pang naisusumiteng request.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead><tr><th>Supply</th><th>Quantity</th><th>Date</th><th>Status</th><th>Admin Note</th></tr></thead>
              <tbody>
                {supplyRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="fw-semibold">{request.supplyName}</td>
                    <td>{request.quantity}</td>
                    <td>{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '—'}</td>
                    <td><span className={`badge ${request.status === 'Rejected' ? 'text-bg-danger' : request.status === 'Released' ? 'text-bg-success' : request.status === 'Approved' ? 'text-bg-primary' : 'text-bg-warning'}`}>{request.status}</span></td>
                    <td>{request.adminNote || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="panel page-panel">
        <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-3">
          <div>
            <h2 className="h5 fw-bold mb-1"><i className="bi bi-backpack4 me-2 text-success" />Aking Emergency Kit</h2>
            <p className="text-secondary small mb-0">Dito lang makikita ang mga emergency supply na inilabas ng administrator para sa iyo. Awtomatikong nag-a-update kada 15 segundo.</p>
          </div>
          <span className="badge text-bg-success">{lguKit.length} released items</span>
        </div>
        {lguKit.length === 0 ? (
          <div className="text-center py-4">
            <i className="bi bi-backpack2 display-5 text-secondary" />
            <h3 className="h6 fw-bold mt-3">Wala pang na-release na supply</h3>
            <p className="text-secondary small mb-0">Pumili ng item sa LGU Emergency Supply Inventory, magsumite ng request, at hintayin ang approval at release ng administrator. Lalabas dito ang supply pagkatapos itong i-release.</p>
          </div>
        ) : (
          <div className="row g-3">
            {lguKit.map((item) => (
              <div className="col-12 col-sm-6 col-lg-4" key={item.id}>
                <div className="border rounded-3 p-3 h-100 d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-success-subtle text-success p-3"><i className="bi bi-box-seam fs-5" /></div>
                  <div className="flex-grow-1 min-w-0">
                    <strong className="d-block text-break">{item.name}</strong>
                    <span className="small text-secondary">Quantity: {Number(item.quantity || 0)}</span>
                    <div><span className="badge text-bg-success mt-1">Released by LGU</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

function EvacuationPage({ onPlanSaved, onActivityAdded }) {
  const [plan, setPlan] = useState({ evacuationCenter: '', meetingPoint: '', primaryRoute: '', backupRoute: '' });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dashboardRequest('/api/evacuation-plan')
      .then(async (response) => {
        if (!response.ok) throw new Error('Hindi ma-load ang saved evacuation plan.');
        const data = await response.json();
        setPlan({
          evacuationCenter: data.evacuationCenter || '',
          meetingPoint: data.meetingPoint || '',
          primaryRoute: data.primaryRoute || '',
          backupRoute: data.backupRoute || ''
        });
      })
      .catch((error) => setMessage(error.message));
  }, []);

  const updateField = (field, value) => setPlan((current) => ({ ...current, [field]: value }));
  const origin = plan.meetingPoint.trim();
  const destination = plan.evacuationCenter.trim();
  const hasLocations = Boolean(origin && destination);
  const mapQuery = destination || origin || 'evacuation center';
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;
  const directionsUrl = hasLocations
    ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`
    : '';

  async function savePlan() {
    setSaving(true);
    setMessage('');
    try {
      const response = await dashboardRequest('/api/evacuation-plan', {
        method: 'PUT',
        body: JSON.stringify(plan)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || 'Hindi na-save ang evacuation plan.');
      setMessage('Matagumpay na na-save ang iyong evacuation plan.');
      if (onPlanSaved) onPlanSaved(plan);
      await dashboardRequest('/api/activity-logs', {
        method: 'POST',
        body: JSON.stringify({ action: 'Evacuation plan updated', description: 'Updated the family evacuation plan.' })
      });
      if (onActivityAdded) await onActivityAdded();
    } catch (error) {
      setMessage(error.message || 'May error sa pag-save. Subukang muli.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell icon="bi-signpost-2-fill" title="Evacuation Plan" description="Maghanda ng simpleng plano para alam ng lahat ang pupuntahan.">
      <div className="panel page-panel">
        <div className="form-grid">
          <div>
            <label>Evacuation Center</label>
            <input className="form-control" placeholder="Ilagay ang pangalan o address ng evacuation center" value={plan.evacuationCenter || ''} onChange={(e) => updateField('evacuationCenter', e.target.value)} />
          </div>
          <div>
            <label>Family Meeting Point (Starting Point)</label>
            <input className="form-control" placeholder="Ilagay ang bahay o family meeting point" value={plan.meetingPoint || ''} onChange={(e) => updateField('meetingPoint', e.target.value)} />
          </div>
          <div>
            <label>Pangunahing Daanan (Pangunahing Contact Route)</label>
            <textarea className="form-control" rows="2" placeholder="Mga landmark o directions para sa pangunahing route" value={plan.primaryRoute || ''} onChange={(e) => updateField('primaryRoute', e.target.value)} />
          </div>
          <div>
            <label>Alternatibong Daanan (Backup Route)</label>
            <textarea className="form-control" rows="2" placeholder="Mga landmark o directions kung hindi madaanan ang primary route" value={plan.backupRoute || ''} onChange={(e) => updateField('backupRoute', e.target.value)} />
          </div>
        </div>

        <div className="plan-map-large mt-3 p-0 overflow-hidden d-block">
          <iframe
            title="Evacuation location map"
            src={mapEmbedUrl}
            width="100%"
            height="320"
            style={{ border: 0, borderRadius: '12px' }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="p-3">
            <strong className="d-block mb-1">Map / Route Preview</strong>
            <span className="small text-secondary d-block mb-3">
              {destination ? `Map preview for: ${destination}` : 'Ilagay ang evacuation center para makita ito sa mapa.'}
            </span>
            {hasLocations ? (
              <a className="btn btn-outline-handa btn-sm" href={directionsUrl} target="_blank" rel="noopener noreferrer">
                <i className="bi bi-map me-2" />Open directions from meeting point to evacuation center
              </a>
            ) : (
              <p className="small text-secondary mb-0">Ilagay ang family meeting point at evacuation center para makagawa ng directions link.</p>
            )}
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 mt-3">
          <button className="btn btn-handa" onClick={savePlan} disabled={saving}>
            <i className="bi bi-save me-2" />{saving ? 'Saving...' : 'I-save ang Evacuation Plan'}
          </button>
          {hasLocations && (
            <a className="btn btn-outline-handa" href={directionsUrl} target="_blank" rel="noopener noreferrer">
              <i className="bi bi-signpost-2 me-2" />View Route in Google Maps
            </a>
          )}
        </div>
        {message && <p className={`small mt-3 mb-0 ${message.includes('Matagumpay') ? 'text-success' : 'text-secondary'}`} role="status">{message}</p>}
      </div>
    </PageShell>
  );
}

function ContactsPage({ onContactsChanged, onActivityAdded }) {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Family');
  const [relationship, setRelationship] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [message, setMessage] = useState('');

  async function loadContacts() {
    try {
      const response = await dashboardRequest('/api/emergency-contacts');
      if (!response.ok) throw new Error('Hindi ma-load ang emergency contacts.');
      const savedContacts = await response.json();
      setContacts(savedContacts);
      if (onContactsChanged) onContactsChanged(savedContacts);
    } catch (error) { setMessage(error.message); }
  }
  useEffect(() => { loadContacts(); }, []);

  async function addContact(event) {
    event.preventDefault();
    try {
      const payload = { name: name.trim(), phone: phone.trim(), category, relationship: relationship.trim(), notes: notes.trim() };
      const response = await dashboardRequest(editingId ? '/api/emergency-contacts/' + editingId : '/api/emergency-contacts', { method: editingId ? 'PATCH' : 'POST', body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Hindi naidagdag ang contact.');
      const addedName = name.trim();
      setName(''); setPhone(''); setRelationship(''); setNotes(''); setEditingId(null); setMessage(editingId ? 'Na-update ang emergency contact.' : 'Naidagdag ang emergency contact.');
      await dashboardRequest('/api/activity-logs', { method: 'POST', body: JSON.stringify({ action: editingId ? 'Emergency contact updated' : 'Emergency contact added', description: (editingId ? 'Updated emergency contact: ' : 'Added emergency contact: ') + addedName }) });
      if (onActivityAdded) await onActivityAdded();
      await loadContacts();
    } catch (error) { setMessage(error.message); }
  }

  function editContact(contact) {
    setEditingId(contact.id); setName(contact.name || ''); setPhone(contact.phone || '');
    setCategory(contact.category || 'Family'); setRelationship(contact.relationship || ''); setNotes(contact.notes || '');
    setMessage('Editing contact: ' + contact.name); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function makePrimary(id) {
    try {
      const response = await dashboardRequest('/api/emergency-contacts/' + id + '/primary', { method: 'PATCH' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || 'Hindi ma-set ang primary contact.');
      setMessage('Na-set ang primary emergency contact.'); await loadContacts();
    } catch (error) { setMessage(error.message); }
  }
  async function deleteContact(id) {
    if (!window.confirm('Sigurado ka bang buburahin ang contact na ito?')) return;
    try {
      const response = await dashboardRequest('/api/emergency-contacts/' + id, { method: 'DELETE' });
      if (!response.ok) throw new Error('Hindi mabura ang contact.');
      setMessage('Nabura ang emergency contact.');
      if (onActivityAdded) await onActivityAdded();
      await loadContacts();
    } catch (error) { setMessage(error.message); }
  }

  const filteredContacts = contacts.filter((contact) =>
    (filter === 'All' || contact.category === filter) &&
    (String(contact.name + ' ' + contact.phone + ' ' + contact.category + ' ' + (contact.relationship || '')).toLowerCase().includes(search.trim().toLowerCase()))
  );

  return (
    <PageShell icon="bi-telephone-fill" title="Mga Emergency Contact" description="I-save ang mahahalagang numero ng pamilya, kaibigan, at mga taong puwedeng tawagan kapag may sakuna o emergency.">
      <div className="panel page-panel mb-4 emergency-form-panel">
        <div className="emergency-section-heading">
          <div className="emergency-heading-icon"><i className="bi bi-person-plus-fill" /></div>
          <div><h3 className="h5 fw-bold mb-1">{'{'}editingId ? 'I-edit ang Emergency Contact' : 'Magdagdag ng Emergency Contact'{'}'}</h3><p className="mb-0">Ilagay ang detalye para mabilis mo silang matawagan kung kinakailangan.</p></div>
        </div>
        <form className="row g-3 emergency-contact-form" onSubmit={addContact}>
          <div className="col-md-6"><label className="form-label">Pangalan ng Contact</label><input className="form-control" value={name} onChange={(e) => setName(e.target.value)} maxLength="100" required placeholder="Hal. Juan Dela Cruz" /></div>
          <div className="col-md-6"><label className="form-label">Numero ng Telepono</label><input className="form-control" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength="30" required placeholder="09XX XXX XXXX" /></div>
          <div className="col-md-4"><label className="form-label">Kategorya</label><select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}><option value="Family">Pamilya</option><option value="Medical">Medikal</option><option value="Emergency">Emergency</option><option value="Other">Iba pa</option></select></div>
          <div className="col-md-4"><label className="form-label">Ugnayan sa Contact</label><input className="form-control" value={relationship} onChange={(e) => setRelationship(e.target.value)} maxLength="80" placeholder="Hal. Anak, kapatid, kapitbahay, doktor" /></div>
          <div className="col-md-8"><label className="form-label">Mga Paalala / Mahalagang Tagubilin</label><input className="form-control" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength="500" placeholder="Hal. may allergy, espesyal na pangangailangan, o ibang dapat tandaan" /></div>
          <div className="col-12 d-flex flex-wrap gap-2 pt-2"><button className="btn btn-handa emergency-submit-btn" type="submit"><i className="bi bi-person-plus-fill me-1" />{editingId ? 'I-save ang Pagbabago' : 'Idagdag ang Contact'}</button>{editingId && <button className="btn btn-outline-secondary" type="button" onClick={() => { setEditingId(null); setName(''); setPhone(''); setCategory('Family'); setRelationship(''); setNotes(''); }}>Kanselahin</button>}</div>
        </form>
        {message && <p className="small text-secondary mt-3 mb-0" role="status">{message}</p>}
      </div>
      <div className="panel page-panel mb-3 emergency-search-panel">
        <div className="row g-3 align-items-end">
          <div className="col-md-8"><label className="form-label small fw-semibold">Maghanap ng Contact</label><input className="form-control" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="I-type ang pangalan o numero ng telepono..." /></div>
          <div className="col-md-4"><label className="form-label small fw-semibold">Pumili ng Kategorya</label><select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="All">Lahat</option><option value="Family">Pamilya</option><option value="Medical">Medikal</option><option value="Emergency">Emergency</option><option value="Other">Iba pa</option></select></div>
        </div>
        <div className="emergency-contact-count mt-3"><i className="bi bi-people-fill" /><span><strong>{contacts.length}</strong> naka-save na contact</span></div>
      </div>
      <div className="contact-page-grid">
        {filteredContacts.map((contact) => (
          <div className="panel contact-card p-3 emergency-contact-card" key={contact.id}>
            <div className="d-flex align-items-center gap-3 w-100">
              <div className="emergency-contact-avatar"><i className="bi bi-person-fill" /></div>
              <div className="flex-grow-1 min-w-0"><div className="d-flex flex-wrap align-items-center gap-2"><strong className="text-break">{contact.name}</strong>{contact.isPrimary && <span className="badge emergency-primary-badge"><i className="bi bi-star-fill me-1" />Pangunahing Contact</span>}</div><span className="d-block emergency-contact-phone"><i className="bi bi-telephone me-1" />{contact.phone}</span><small className="text-secondary emergency-contact-meta">{contact.relationship ? contact.relationship + ' · ' : ''}{({ Family: 'Pamilya', Medical: 'Medikal', Emergency: 'Emergency', Other: 'Iba pa' }[contact.category] || contact.category)}</small>{contact.notes && <p className="small text-secondary mt-2 mb-0">{contact.notes}</p>}</div>
            </div>
            <div className="d-flex flex-wrap gap-2 mt-3 emergency-contact-actions">
              <a className="btn btn-sm btn-success" href={'tel:' + contact.phone.replace(/[^+0-9]/g, '')}><i className="bi bi-telephone-fill me-1" />Tawagan</a>
              <a className="btn btn-sm btn-outline-success" href={'sms:' + contact.phone.replace(/[^+0-9]/g, '')}><i className="bi bi-chat-dots-fill me-1" />Mag-text</a>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => { navigator.clipboard?.writeText(contact.phone); setMessage('Nakopya ang phone number.'); }}><i className="bi bi-copy me-1" />Kopyahin</button>
              {!contact.isPrimary && <button className="btn btn-sm btn-outline-warning" onClick={() => makePrimary(contact.id)}><i className="bi bi-star me-1" />Gawing Pangunahing Contact</button>}
              <button className="btn btn-sm btn-outline-secondary" onClick={() => editContact(contact)}><i className="bi bi-pencil me-1" />I-edit</button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => deleteContact(contact.id)}><i className="bi bi-trash me-1" />Burahin</button>
            </div>
          </div>
        ))}
        {filteredContacts.length === 0 && <p className="text-secondary">{contacts.length === 0 ? 'Wala ka pang naka-save na emergency contact.' : 'Walang contact na tumugma sa iyong hinanap o piniling kategorya.'}</p>}
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
          <div
            className="col-md-6 col-xl-4"
            key={item.id}
          >
            <div className="guide-card">
              <img
                src={item.image}
                alt={item.title}
              />

              <div>
                <h3>{item.title}</h3>

                <p>{item.description}</p>

                <button onClick={() => onSelect(item)}>
                  Basahin ang Guide
                  <i className="bi bi-arrow-right" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

function SettingsPage({
  darkMode,
  setDarkMode,
  onLogout,
}) {
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

            <small>
              Gamitin ang mas madilim na kulay para sa low-light na
              kapaligiran.
            </small>
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

            <small>
              Mananatiling gumagana ang batayang interface ng app kahit
              walang internet connection.
            </small>
          </span>

          <i className="bi bi-check-circle-fill text-handa-green" />
        </label>

        <button
          className="btn btn-outline-danger mt-3"
          onClick={onLogout}
        >
          Log Out
        </button>
      </div>
    </PageShell>
  );
}

function PageShell({
  icon,
  title,
  description,
  children,
}) {
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