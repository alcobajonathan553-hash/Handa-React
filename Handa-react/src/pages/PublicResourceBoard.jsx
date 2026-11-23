import { useEffect, useState } from 'react';
import { auth } from '../components/firebase.js';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');

export default function PublicResourceBoard() {
  const [data, setData] = useState({ centers: [], contacts: [], guides: [], announcements: [] });
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        if (!auth.currentUser) return;
        const token = await auth.currentUser.getIdToken();
        const response = await fetch(API_BASE_URL + '/api/public-resources', { headers: { Authorization: 'Bearer ' + token } });
        if (!response.ok) throw new Error('Hindi ma-load ang official LGU information.');
        const result = await response.json();
        if (active) setData(result);
      } catch (error) { if (active) setMessage(error.message); }
    }
    load();
    const timer = window.setInterval(load, 15000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  return <div className="mt-4">
    <div className="panel page-panel mb-4">
      <h2 className="h5 fw-bold"><i className="bi bi-megaphone-fill text-success me-2" />LGU Announcements</h2>
      {message && <p className="small text-danger">{message}</p>}
      {data.announcements.map(item => <div className="border rounded-3 p-3 mb-2" key={item.id}><div className="d-flex justify-content-between gap-2"><strong>{item.title}</strong><span className="badge text-bg-success">{item.priority}</span></div><p className="mb-1 mt-2">{item.message}</p><small className="text-secondary">{new Date(item.createdAt).toLocaleString()}</small></div>)}
      {data.announcements.length === 0 && <p className="small text-secondary mb-0">Wala pang official announcement mula sa administrator.</p>}
    </div>
    <div className="panel page-panel mb-4">
      <h2 className="h5 fw-bold"><i className="bi bi-geo-alt-fill text-success me-2" />Official Evacuation Centers</h2>
      {data.centers.map(item => <div className="border-bottom py-3" key={item.id}><strong>{item.name}</strong><p className="small mb-1">{item.address}</p><span className="small text-secondary">{item.notes}</span></div>)}
      {data.centers.length === 0 && <p className="small text-secondary mb-0">Wala pang evacuation center na inilathala.</p>}
    </div>
    <div className="panel page-panel mb-4">
      <h2 className="h5 fw-bold"><i className="bi bi-telephone-fill text-success me-2" />Official Emergency Contacts</h2>
      {data.contacts.map(item => <div className="d-flex justify-content-between border-bottom py-2 gap-2" key={item.id}><span><strong>{item.name}</strong><small className="d-block text-secondary">{item.category}</small></span><a href={'tel:' + item.phone}>{item.phone}</a></div>)}
      {data.contacts.length === 0 && <p className="small text-secondary mb-0">Wala pang official emergency contact.</p>}
    </div>
    <div className="panel page-panel">
      <h2 className="h5 fw-bold"><i className="bi bi-book-half text-success me-2" />LGU Disaster Guides</h2>
      {data.guides.map(item => <details className="border-bottom py-3" key={item.id}><summary className="fw-semibold">{item.title}</summary><p className="small mt-2">{item.description}</p><div className="small" style={{ whiteSpace: 'pre-wrap' }}>{item.content}</div></details>)}
      {data.guides.length === 0 && <p className="small text-secondary mb-0">Wala pang disaster guide na inilathala.</p>}
    </div>
  </div>;
}
