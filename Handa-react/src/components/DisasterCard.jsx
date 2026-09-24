import React from 'react';

export default function DisasterCard({ item, onSelect }) {
  return (
    <div className="col-md-6 mb-4">
      <div className="d-flex align-items-start gap-4 p-2">
        <img 
          src={item.image} 
          alt={item.title} 
          className="disaster-circle-img flex-shrink-0"
        />
        <div>
          <h3 className="disaster-title mb-2">{item.title}</h3>
          <p className="text-secondary small mb-2" style={{ lineHeight: '1.4' }}>
            {item.description}
          </p>
          <a 
            href="#details" 
            className="disaster-link" 
            onClick={(e) => {
              e.preventDefault();
              onSelect(item);
            }}
          >
            {item.linkText}
          </a>
        </div>
      </div>
    </div>
  );
}