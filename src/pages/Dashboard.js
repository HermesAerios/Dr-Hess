import React, { useState, useEffect } from 'react';
import { chargerScoresEDN } from '../utils/scoring';
import ednListInitiale from '../data/edn_list.json';

export default function Dashboard({ onLancerCas }) {
  const [listeEDN, setListeEDN] = useState({});

  // Au chargement de la page, on récupère les données (et les notes)
  useEffect(() => {
    const scores = chargerScoresEDN(ednListInitiale);
    setListeEDN(scores);
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Tableau de bord EDN</h1>
      <p>Sélectionnez un item pour vous entraîner. Votre dernière note sera conservée.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
        {Object.entries(listeEDN).map(([id, item]) => (
          <div 
            key={id} 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '15px', 
              border: '1px solid #ddd', 
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}
          >
            <div>
              <span style={{ fontWeight: 'bold', marginRight: '10px' }}>Item {id}</span>
              <span>{item.titre}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {/* Affichage conditionnel de la note */}
              <span style={{ 
                fontWeight: 'bold', 
                color: item.derniere_note !== null ? '#2e7d32' : '#757575' 
              }}>
                {item.derniere_note !== null ? `${item.derniere_note} / 20` : 'À faire'}
              </span>
              
              <button 
                onClick={() => onLancerCas(id)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {item.derniere_note !== null ? 'Rejouer' : 'Jouer'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}