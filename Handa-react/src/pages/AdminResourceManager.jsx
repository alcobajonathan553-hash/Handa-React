import { useEffect, useState } from 'react';
import { auth } from '../components/firebase.js';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');
const sections = {
  centers: { title: 'Evacuation Centers', fields: [['name', 'Center name'], ['address', 'Address'], ['notes', 'Notes']] },
  contacts: { title: 'Official Emergency Contacts', fields: [['name', 'Office / Contact name'], ['phone', 'Phone number'], ['category', 'Category']] },
  guides: { title: 'Disaster Guides', fields: [['title', 'Guide title'], ['description', 'Short description'], ['content', 'Guide content']] },
  announcements: { title: 'Announcements', fields: [['title', 'Announcement title'], ['message', 'Message'], ['priority', 'Priority (Normal / Important / Urgent)']] }
};

export default function AdminResourceManager() {
  const [type, setType] = useState('centers');
  const [rows, setRows] = useState([]);
  const [activity, setActivity] = useState([]);
  const [values, setValues] = useState({});
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function request(path, options = {}) {
    if (!auth.currentUser) throw new Error('Please sign in again.');
    const token = await auth.currentUser.getIdToken(true);
    return fetch(API_BASE_URL + path, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}), Authorization: 'Bearer ' + token } });
  }

  async function load() {
    setLoading(true);
    try {
      const response = await request('/api/admin/resources/' + type);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to load records.');
      setRows(data);
    } catch (error) { setMessage(error.message); }
    finally { setLoading(false); }
  }

  async function loadActivity() {
    try {
      const response = await request('/api/admin/activity-logs');
      if (response.ok) setActivity(await response.json());
    } catch (error) { console.error(error); }
  }

  useEffect(() => { load(); }, [type]);
  useEffect(() => { loadActivity(); }, []);

  function resetForm() { setValues({}); setEditId(null); }

  async function save(event) {
    event.preventDefault();
    setMessage('');
    try {
      const editing = editId !== null;
      const response = await request('/api/admin/resources/' + type + (editing ? '/' + editId : ''), {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(values)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to save record.');
      resetForm();
      setMessage(editing ? 'Record updated. Clients will see the latest information.' : 'Record published. Clients will see it automatically.');
      await load();
    } catch (error) { setMessage(error.message); }
  }

  async function remove(id) {
    if (!window.confirm('Delete this shared information?')) return;
    try {
      const response = await request('/api/admin/resources/' + type + '/' + id, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to delete record.');
      setMessage('Record deleted.');
      await load();
    } catch (error) { setMessage(error.message); }
  }

  const config = sections[type];
  return <section className="supply-card mb-4">
    <div className="supply-card-header"><i className="bi bi-diagram-3 me-2 text-success" />Shared LGU Information — Admin to Client</div>
    <div className="card-body p-3 p-md-4">
      <p className="small text-secondary">Manage official evacuation centers, emergency hotlines, disaster guides, and announcements. Published updates are visible to signed-in Clients.</p>
      <div className="d-flex flex-wrap gap-2 mb-3">
        {Object.entries(sections).map(([key, item]) => <button key={key} className={'btn btn-sm ' + (type === key ? 'btn-success' : 'btn-outline-success')} onClick={() => { setType(key); resetForm(); setMessage(''); }}>{item.title}</button>)}
      </div>
      <form className="row g-2 mb-3" onSubmit={save}>
        {config.fields.map(([key, label]) => <div className="col-12" key={key}>
          <label className="form-label small fw-semibold">{label}</label>
          {key === 'content' || key === 'description' || key === 'message' || key === 'notes'
            ? <textarea className="form-control" rows={key === 'content' ? 4 : 2} value={values[key] || ''} onChange={e => setValues(current => ({ ...current, [key]: e.target.value }))} required />
            : <input className="form-control" value={values[key] || ''} onChange={e => setValues(current => ({ ...current, [key]: e.target.value }))} required />}
        </div>)}
        <div className="col-12 d-flex gap-2">
          <button className="btn btn-success" type="submit">{editId ? 'Save Changes' : 'Publish to Clients'}</button>
          {editId && <button className="btn btn-outline-secondary" type="button" onClick={resetForm}>Cancel</button>}
        </div>
      </form>
      {message && <div className="alert alert-info py-2 small">{message}</div>}
      <div className="table-responsive"><table className="table table-sm align-middle">
        <thead><tr><th>Information</th><th>Details</th><th className="text-end">Actions</th></tr></thead>
        <tbody>{loading ? <tr><td colSpan="3">Loading...</td></tr> : rows.map(row => <tr key={row.id}>
          <td className="fw-semibold">{row.title || row.name}</td>
          <td className="small text-secondary">{row.address || row.phone || row.description || row.message || row.notes || ''}</td>
          <td className="text-end text-nowrap">
            <button className="btn btn-sm btn-outline-success me-1" onClick={() => { setEditId(row.id); setValues(Object.fromEntries(config.fields.map(([key]) => [key, row[key] || '']))); }}>Edit</button>
            <button className="btn btn-sm btn-outline-danger" onClick={() => remove(row.id)}>Delete</button>
          </td>
        </tr>)}
        {!loading && rows.length === 0 && <tr><td colSpan="3" className="text-secondary">No records yet.</td></tr>}</tbody>
      </table></div>
    </div>
    <div className="supply-card-header border-top"><i className="bi bi-activity me-2 text-success" />Client Activity Monitoring</div>
    <div className="card-body p-3 p-md-4">
      <p className="small text-secondary">Recent actions recorded by signed-in Clients. Private family contacts and personal evacuation details are not shown here.</p>
      <div className="table-responsive"><table className="table table-sm align-middle">
        <thead><tr><th>Client</th><th>Activity</th><th>Description</th><th>Date</th></tr></thead>
        <tbody>{activity.map(item => <tr key={item.id}><td>{item.userName}<small className="d-block text-secondary">{item.email}</small></td><td>{item.action}</td><td>{item.description}</td><td className="small">{new Date(item.createdAt).toLocaleString()}</td></tr>)}
        {activity.length === 0 && <tr><td colSpan="4" className="text-secondary">No client activity recorded yet.</td></tr>}</tbody>
      </table></div>
      <button className="btn btn-sm btn-outline-success" onClick={loadActivity}>Refresh Activity</button>
    </div>
  </section>;
}
