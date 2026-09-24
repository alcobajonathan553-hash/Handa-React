import React from 'react';

export default function Navbar({ user, onLogin, onLogout, isOnline }) {
  return (
    <header>
      {/* top banner + live connection status */}
      <div className="top-gov-banner border-bottom">
        <div className="container d-flex justify-content-between align-items-center">
          <div>
            <span className="me-2">BDM Opisyal na Website para sa Kahandaan sa Sakuna</span>
          </div>
          <div>
            <span className={`badge d-inline-flex align-items-center gap-1 ${isOnline ? 'bg-success' : 'bg-danger'}`}>
              <i className={`bi ${isOnline ? 'bi-wifi' : 'bi-wifi-off'}`}></i>
              {isOnline ? 'Online' : 'Offline Mode'}
            </span>
          </div>
        </div>
      </div>

      {/* main header */}
      <div className="container py-3">
        <div className="row align-items-center g-3">
          <div className="col-md-4 d-flex align-items-center">
            <h1 className="m-0 text-ready-green fw-bold display-6 d-flex align-items-center">
              Handa <i className="bi bi-shield-check ms-2 text-success"></i>
            </h1>
          </div>
          <div className="col-md-8 d-flex justify-content-md-end align-items-center gap-3">
            {user ? (
              <>
                <span className="small fw-bold text-success me-2">
                  <i className="bi bi-person-circle me-1"></i> {user.name}
                </span>
                <button className="btn btn-outline-danger btn-sm" onClick={onLogout}>
                  Logout
                </button>
              </>
            ) : (
              <button className="btn btn-ready btn-sm px-3 rounded-3" onClick={onLogin}>
                <i className="bi bi-box-arrow-in-right me-1"></i> Mag-Log In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* navigation menu */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-ready-green py-2">
        <div className="container">
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 fw-semibold">
              <li className="nav-item"><a className="nav-link active" href="#features">Mga Tampok</a></li>
              <li className="nav-item"><a className="nav-link" href="#disasters">Mga Sakuna at Saklolo</a></li>
              <li className="nav-item"><a className="nav-link" href="#resources">Emergency Contacts</a></li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
