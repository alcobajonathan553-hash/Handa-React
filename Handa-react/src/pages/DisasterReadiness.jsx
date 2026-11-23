import { useEffect, useMemo, useState } from 'react';
import { auth } from '../components/firebase.js';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');

const disasters = [
  { key: 'bagyo', title: 'Bagyo at Unos', english: 'Typhoons', icon: 'bi-wind', guideId: 1, questions: ['May Go-Bag ba kayong madaling makuha?', 'Alam mo ba ang pinakamalapit na evacuation center?', 'May nakaimbak ba kayong malinis na tubig at pagkaing tatagal ng ilang araw?', 'Naka-charge at may backup power ba ang inyong cellphone?', 'Alam mo ba kung saan susubaybayan ang opisyal na babala ng PAGASA?'] },
  { key: 'baha', title: 'Baha', english: 'Flooding', icon: 'bi-water', guideId: 2, questions: ['Alam mo ba kung bahain ang inyong lugar?', 'May nakahanda ba kayong ligtas na evacuation route papunta sa mataas na lugar?', 'Nasa waterproof container ba ang mahahalagang dokumento?', 'May malinis na tubig at first-aid supplies ba kayo?', 'Alam mo ba na hindi dapat lumusong o magmaneho sa baha?'] },
  { key: 'lindol', title: 'Lindol', english: 'Earthquakes', icon: 'bi-activity', guideId: 3, questions: ['Alam mo ba ang tamang Duck, Cover, and Hold?', 'Naka-secure ba sa pader ang mabibigat na cabinet at istante?', 'May ligtas bang lugar sa bawat kuwarto na mapagtataguan?', 'May nakahanda ba kayong Go-Bag at first-aid kit?', 'May napag-usapan ba kayong family meeting point pagkatapos ng lindol?'] },
  { key: 'sunog', title: 'Sunog', english: 'Fire Safety', icon: 'bi-fire', guideId: 4, questions: ['May gumaganang smoke alarm o fire extinguisher ba kayo?', 'Alam ba ng lahat sa bahay ang emergency exit?', 'Regular bang chine-check ang electrical wiring at LPG?', 'May napagpraktisan ba kayong fire escape plan?', 'Alam mo ba ang gagawin kung may makapal na usok o apoy?'] },
  { key: 'kuryente', title: 'Kawalan ng Kuryente', english: 'Power Outage', icon: 'bi-lightning-charge', guideId: 5, questions: ['May gumaganang flashlight at ekstrang baterya ba kayo?', 'May naka-charge bang power bank o emergency light?', 'May battery-powered radio ba kayo para sa mga balita?', 'May pagkaing hindi kailangang lutuin o i-refrigerate?', 'Alam mo ba kung paano ligtas na i-unplug ang appliances kapag may outage?'] },
  { key: 'bulkan', title: 'Pagsabog ng Bulkan', english: 'Volcanic Eruption', icon: 'bi-cloud-haze2', guideId: 6, questions: ['May N95 mask at proteksyon sa mata ba kayo para sa ashfall?', 'Alam mo ba kung nasa danger zone ang inyong tirahan?', 'Sinusubaybayan mo ba ang opisyal na abiso ng PHIVOLCS?', 'May nakahanda ba kayong evacuation route at Go-Bag?', 'Nakatakip at ligtas ba ang inyong iniimbak na inuming tubig?'] },
  { key: 'landslide', title: 'Pagguho ng Lupa', english: 'Landslide', icon: 'bi-triangle', guideId: 7, questions: ['Alam mo ba ang mga babalang senyales tulad ng bitak sa lupa at nakatagilid na puno?', 'Alam mo ba ang ligtas na ruta palayo sa matarik na dalisdis?', 'Sinusubaybayan mo ba ang malakas at tuloy-tuloy na pag-ulan?', 'May napag-usapan ba kayong evacuation plan kasama ang pamilya?', 'Alam mo ba kung saan makikinig sa opisyal na babala ng LGU?'] },
  { key: 'tsunami', title: 'Tsunami Warning', english: 'Tsunami', icon: 'bi-tsunami', guideId: 8, questions: ['Alam mo ba kung nasa coastal tsunami hazard zone ang inyong lugar?', 'Natukoy mo na ba ang pinakamalapit na mataas na lugar o evacuation site?', 'Alam mo ba na dapat agad lumikas kapag nakaramdam ng malakas na lindol sa baybayin?', 'May napagpraktisan ba kayong mabilis na ruta papunta sa mataas na lugar?', 'Alam mo ba na hindi dapat bumalik sa baybayin hangga’t walang opisyal na all-clear?'] }
];

function getScore(answers) {
  const yes = answers.filter((answer) => answer === 'yes').length;
  return Math.round((yes / 5) * 100);
}

function scoreLabel(score) {
  if (score >= 80) return { label: 'Mahusay ang paghahanda', tone: 'success' };
  if (score >= 60) return { label: 'May paghahandang kailangan pang ayusin', tone: 'warning' };
  return { label: 'Kailangan pang maghanda', tone: 'danger' };
}

export default function DisasterReadiness({ onSelectGuide }) {
  const [records, setRecords] = useState([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function request(path, options = {}) {
    if (!auth.currentUser) throw new Error('Mag-sign in muli upang magpatuloy.');
    const token = await auth.currentUser.getIdToken();
    return fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}), Authorization: `Bearer ${token}` }
    });
  }

  async function loadAssessments() {
    try {
      const response = await request('/api/disaster-assessments');
      if (!response.ok) throw new Error('Hindi ma-load ang assessment results.');
      setRecords(await response.json());
      setError('');
    } catch (err) {
      setError(err.message || 'Hindi ma-load ang assessment results.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAssessments(); }, []);

  const latestByKey = useMemo(() => {
    const latest = {};
    records.forEach((record) => {
      if (!latest[record.disasterKey]) latest[record.disasterKey] = record;
    });
    return latest;
  }, [records]);

  const selectedDisaster = disasters.find((item) => item.key === selectedKey);
  const selectedAnswers = answers[selectedKey] || Array(5).fill('');

  function startAssessment(key) {
    setSelectedKey(key);
    setNotice('');
    setError('');
    setAnswers((current) => ({ ...current, [key]: Array(5).fill('') }));
  }

  function updateAnswer(index, value) {
    setAnswers((current) => {
      const next = [...(current[selectedKey] || Array(5).fill(''))];
      next[index] = value;
      return { ...current, [selectedKey]: next };
    });
  }

  async function submitAssessment() {
    if (selectedAnswers.some((answer) => !answer)) {
      setError('Sagutan muna ang lahat ng limang tanong.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const score = getScore(selectedAnswers);
      const response = await request('/api/disaster-assessments', {
        method: 'POST',
        body: JSON.stringify({ disasterKey: selectedKey, score, answers: selectedAnswers })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || 'Hindi na-save ang assessment.');
      setNotice(`Na-save ang iyong assessment. Readiness score: ${score}%.`);
      setSelectedKey('');
      setAnswers((current) => ({ ...current, [selectedKey]: Array(5).fill('') }));
      await loadAssessments();
    } catch (err) {
      setError(err.message || 'Hindi na-save ang assessment.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-shell">
      <div className="page-title">
        <div className="section-icon green"><i className="bi bi-clipboard2-pulse" /></div>
        <div>
          <h2>Disaster Readiness Assessment</h2>
          <p>Suriin ang iyong paghahanda sa walong uri ng sakuna. Sagutin nang tapat ang bawat tanong.</p>
        </div>
      </div>

      <div className="alert alert-info border-0 small">
        Ang score ay batay sa iyong mga sagot at sumusukat lamang sa iniulat mong paghahanda. Hindi ito garantiya ng kaligtasan o sukatan ng aktuwal na panganib sa inyong lugar.
      </div>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {notice && <div className="alert alert-success py-2">{notice}</div>}

      <div className="disaster-assessment-grid mb-4">
        {disasters.map((disaster) => {
          const latest = latestByKey[disaster.key];
          const score = latest ? Number(latest.score) : null;
          const result = latest ? scoreLabel(score) : null;
          return (
            <article className="disaster-assessment-card" key={disaster.key}>
              <div className="d-flex align-items-start justify-content-between gap-2">
                <div className="assessment-icon"><i className={`bi ${disaster.icon}`} /></div>
                {latest ? <span className={`badge text-bg-${result.tone}`}>{score}%</span> : <span className="badge text-bg-secondary">Hindi pa nasusuri</span>}
              </div>
              <div>
                <h3 className="h6 fw-bold mb-1">{disaster.title}</h3>
                <p className="small text-secondary mb-0">{disaster.english}</p>
              </div>
              {latest ? <><div className="progress"><div className={`progress-bar bg-${result.tone}`} style={{ width: `${score}%` }} /></div><small className="text-secondary">{result.label}</small><small className="text-secondary">Huling sagot: {new Date(latest.createdAt).toLocaleDateString()}</small></> : <p className="small text-secondary mb-0">Sagutan ang limang tanong para makuha ang iyong score.</p>}
              <div className="d-flex gap-2 mt-auto">
                <button className="btn btn-handa btn-sm flex-grow-1" onClick={() => startAssessment(disaster.key)}>{latest ? 'Ulitin ang Assessment' : 'Simulan'}</button>
                <button className="btn btn-outline-success btn-sm" onClick={() => onSelectGuide(disaster.guideId)}>Guide</button>
              </div>
            </article>
          );
        })}
      </div>

      {selectedDisaster && (
        <section className="panel p-3 p-md-4 mb-4" aria-live="polite">
          <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
            <div><h3 className="h5 fw-bold mb-1">{selectedDisaster.title} Assessment</h3><p className="small text-secondary mb-0">Piliin ang sagot sa bawat tanong.</p></div>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedKey('')}>Isara</button>
          </div>
          <div className="d-flex justify-content-between small text-secondary mb-2"><span>{selectedAnswers.filter(Boolean).length} sa 5 nasagutan</span><strong>{selectedAnswers.every(Boolean) ? getScore(selectedAnswers) : '—'}%</strong></div>
          <div className="progress mb-3"><div className="progress-bar" style={{ width: `${selectedAnswers.filter(Boolean).length * 20}%` }} /></div>
          <div className="d-grid gap-3">
            {selectedDisaster.questions.map((question, index) => (
              <div className="assessment-question" key={question}>
                <strong className="small">{index + 1}. {question}</strong>
                <div className="assessment-answer">
                  {[['yes', 'Oo'], ['no', 'Hindi'], ['unsure', 'Hindi sigurado']].map(([value, label]) => (
                    <button key={value} type="button" className={selectedAnswers[index] === value ? 'active' : ''} aria-pressed={selectedAnswers[index] === value} onClick={() => updateAnswer(index, value)}>{label}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-4">
            <small className="text-secondary">Ang bawat sagot na “Oo” ay katumbas ng 20 puntos.</small>
            <button className="btn btn-handa" disabled={saving || !selectedAnswers.every(Boolean)} onClick={submitAssessment}>{saving ? 'Sine-save...' : 'I-save ang Assessment'}</button>
          </div>
        </section>
      )}

      <section className="panel p-3 p-md-4">
        <h3 className="h6 fw-bold mb-3"><i className="bi bi-clock-history me-2 text-handa-green" />Assessment History</h3>
        {loading ? <p className="small text-secondary mb-0">Kinukuha ang saved assessments...</p> : records.length === 0 ? <p className="small text-secondary mb-0">Wala pang assessment. Simulan sa pagpili ng isang sakuna sa itaas.</p> : (
          <div className="table-responsive"><table className="table align-middle mb-0"><thead><tr><th>Sakuna</th><th>Score</th><th>Petsa</th></tr></thead><tbody>
            {records.map((record) => <tr key={record.id}><td>{disasters.find((item) => item.key === record.disasterKey)?.title || record.disasterKey}</td><td><strong>{record.score}%</strong></td><td>{new Date(record.createdAt).toLocaleString()}</td></tr>)}
          </tbody></table></div>
        )}
      </section>
    </div>
  );
}
