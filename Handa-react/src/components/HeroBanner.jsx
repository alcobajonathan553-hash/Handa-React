import React from 'react';

export default function HeroBanner() {
  return (
    <div className="position-relative bg-light overflow-hidden mb-5">
      <div 
        style={{
          backgroundImage: `url('/hero-bg.jpg')`, //background pic yong bata
          backgroundSize: 'cover',
          backgroundPosition: 'right 75%', 
          minHeight: '480px' 
        }}
        className="d-flex align-items-center"
      >
        <div className="container">
          <div className="row">
            <div className="col-md-5">
              <div className="bg-dark bg-opacity-75 text-white p-4 rounded shadow-lg">
                <h2 className="fw-bold mb-3">Kahandaan sa Panahon ng Sakuna sa Pilipinas</h2>
                <p className="small mb-4">
                  Maging handa at ligtas sa panahon ng bagyo, baha, lindol, at iba pang sakuna. Alamin ang mga dapat gawin bago, habang, at pagkatapos ng emergency.
                </p>
                <button className="btn btn-success fw-bold px-3 py-2 btn-sm">
                  Alamin ang mga Gabay sa Ligtas
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}