import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const features = [
  {
    icon: 'bi-wifi-off',
    title: 'Offline Access',
    description: 'I-save ang mga gabay sa iyong device para mabasa kahit walang internet connection.'
  },
  {
    icon: 'bi-bell-fill',
    title: 'Real-time Emergency Info',
    description: 'Maging alerto at updated sa mga pinakahuling babala ukol sa sakuna at kaligtasan.'
  },
  {
    icon: 'bi-briefcase-fill',
    title: 'Go-Bag Checklist',
    description: 'Alamin at ihanda ang mga importanteng gamit para sa 72-oras na emergency supply kit.'
  },
  {
    icon: 'bi-geo-alt-fill',
    title: 'Evacuation Guides',
    description: 'Mabilis na access sa mga hakbang at direksyon papunta sa pinakamalapit na ligtas na lugar.'
  }
];

export default function LandingPage({ onGetStarted, onLogin, user, onLogout, isOnline }) {
  return (
    <div className="min-vh-100 d-flex flex-column bg-light" id="top">
      <Navbar user={user} onLogin={onLogin} onLogout={onLogout} isOnline={isOnline} />

      <main className="flex-grow-1">
        {/* Hero */}
        <section className="bg-white py-5 border-bottom">
          <div className="container py-lg-4">
            <div className="row align-items-center g-5">
              <div className="col-lg-6 text-center text-lg-start">
                <span className="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-2 mb-3 rounded-pill">
                  <i className="bi bi-shield-check me-1"></i> Official Disaster Preparedness App
                </span>
                <h1 className="display-4 fw-bold mb-3 text-ready-green">
                  Handa Ka Ba Sa Anumang Sakuna?
                </h1>
                <p className="lead text-muted mb-4 fs-5">
                  Ang <strong>HANDA</strong> ay ang iyong maaasahang gabay para sa kaligtasan ng pamilya.
                  Mag-access ng mga opisyal na impormasyon, bagyo updates, at safety checklists&mdash;kahit offline!
                </p>

                {!isOnline && (
                  <div className="alert alert-warning d-inline-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-4">
                    <i className="bi bi-wifi-off"></i>
                    Wala kang internet ngayon, pero pwede ka pa ring mag-log in gamit ang naka-save na account.
                  </div>
                )}

                <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
                  <button
                    className="btn btn-ready btn-lg px-4 py-3 fw-bold shadow-sm rounded-3"
                    onClick={onGetStarted}
                  >
                    <i className="bi bi-compass me-2"></i>
                    {user ? 'Pumunta sa Dashboard' : 'Mag-Simula'}
                  </button>
                  <a href="#features" className="btn btn-outline-secondary btn-lg px-4 py-3 fw-bold rounded-3">
                    Alamin ang Tampok
                  </a>
                </div>
              </div>

              {/* Banner */}
              <div className="col-lg-6 text-center">
                <div className="position-relative d-inline-block w-100">
                  <img
                    src="/gobag.jpg"
                    alt="HANDA Preparedness Banner"
                    className="img-fluid rounded-4 shadow-lg border"
                    style={{ maxHeight: '420px', width: '100%', objectFit: 'cover' }}
                  />
                  <div className="position-absolute bottom-0 start-0 m-3 p-3 bg-white bg-opacity-75 rounded-3 shadow text-start border d-none d-sm-block">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-shield-fill-check text-success fs-3 me-3"></i>
                      <div>
                        <h6 className="mb-0 fw-bold">Laging Handa 24/7</h6>
                        <small className="text-muted">Protektado ang pamilya sa oras ng krisis.</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-5" id="features">
          <div className="container py-4">
            <div className="text-center mb-5">
              <h2 className="fw-bold text-ready-green">Bakit Mahalaga ang HANDA?</h2>
              <p className="text-muted lead fs-6">
                Idinisenyo upang magbigay ng mabilis, malinaw, at offline-ready na gabay sa mga oras ng sakuna.
              </p>
            </div>

            <div className="row g-4">
              {features.map((feature) => (
                <div className="col-md-6 col-lg-3" key={feature.title}>
                  <div className="card h-100 border-0 shadow-sm p-3 rounded-3 text-center">
                    <div className="card-body">
                      <div
                        className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 text-success mb-3"
                        style={{ width: '60px', height: '60px' }}
                      >
                        <i className={`bi ${feature.icon} fs-3`}></i>
                      </div>
                      <h5 className="card-title fw-bold mb-2">{feature.title}</h5>
                      <p className="card-text text-muted small">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-5 bg-ready-green text-white text-center">
          <div className="container py-3">
            <h2 className="fw-bold mb-3">Mag-handa Na Bago Pa Dumating ang Sakuna</h2>
            <p className="lead mb-4 mx-auto" style={{ maxWidth: '600px' }}>
              Huwag mag-atubili. Tiyaking ligtas at may sapat na kaalaman ang inyong buong pamilya.
            </p>
            <button
              className="btn btn-light btn-lg px-5 py-3 fw-bold text-success shadow rounded-3"
              onClick={onGetStarted}
            >
              {user ? 'Buksan ang Dashboard Ngayon' : 'Mag-Log In at Magsimula'}
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
