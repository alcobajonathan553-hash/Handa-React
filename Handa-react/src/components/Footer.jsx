import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-5">
      <div className="container mb-4">
        <a href="#top" className="text-decoration-underline small text-secondary d-block mb-4">Bumalik sa itaas</a>
        
        <div className="d-flex flex-wrap gap-4 fw-bold text-dark small border-bottom pb-3">
          <a href="#disasters" className="text-dark text-decoration-none">Mga Sakuna</a>
          <a href="#resources" className="text-dark text-decoration-none">Hotlines</a>
        </div>
      </div>

      {/* green  */}
      <div className="bg-ready-green text-white py-5">
        <div className="container">
          <div className="row gy-4">
            <div className="col-md-5">
              <h3 className="fw-bold m-0 text-white mb-2">Handa B Del Mundo <i className="bi bi-shield-check ms-1"></i></h3>
              <p className="small mb-1 fw-semibold">BARANGAY B DEL MUNDO DISASTER RISK MANAGEMNT</p>
              <p className="small text-white-50">Isang opisyal na gabay sa kaligtasan at kahandaan sa sakuna para sa mamamayan.</p>
            </div>

            <div className="col-md-4">
              <h6 className="fw-bold text-white mb-3">Mahahalagang Hotlines</h6>
              <ul className="list-unstyled small text-white-50 d-flex flex-column gap-1">
                <li>🚨 Mansalay Municipal Hall: <strong>09XXXXXXX</strong></li>
                <li>🚒 BFP Mansalay: <strong>(09) XX-XXX-XXXX</strong></li>
                <li>🚑 Mansalay Medicare: <strong>(09) XX-XXX-XXXX</strong></li>
                <li>👮‍♂️ PNP Mansalay: <strong>(09) XX-XXX-XXXX</strong></li>
              </ul>
            </div>

            <div className="col-md-3">
              <div className="bg-white text-dark p-3 rounded text-center shadow-sm">
                <div className="fw-bold text-success mb-1">
                  <i className="bi bi-broadcast text-success me-1"></i> BAYAN NG MANSALAY 
                </div>
                <div className="text-uppercase border-bottom pb-2 mb-2 style-small fw-bold text-muted" style={{ fontSize: '0.7rem' }}>
                  Pambayan na Babala sa Sakuna
                </div>
                <div className="fw-bold text-secondary small">
                  INGAT KA PALAGI!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}