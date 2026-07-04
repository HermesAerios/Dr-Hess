import React, { useState, useEffect } from 'react';
import { enregistrerNoteCas } from '../utils/scoring';

// On simule l'importation du cas sélectionné
import casData from '../data/cases/cas_226.json';

export default function GameEngine({ onRetourAccueil }) {
  // --- ÉTATS DU JEU ---
  const [noeudActuelKey, setNoeudActuelKey] = useState(casData.scenari.noeud_initial);
  const [erreursCritiques, setErreursCritiques] = useState(0);
  const [erreursMineures, setErreursMineures] = useState(0);
  const [tempsEcoule, setTempsEcoule] = useState(0);
  const [aideHessUtilisee, setAideHessUtilisee] = useState(false);
  
  // --- ÉTATS DE FIN DE PARTIE ---
  const [jeuTermine, setJeuTermine] = useState(false);
  const [bilanFinal, setBilanFinal] = useState(null);

  // Le nœud en cours de lecture
  const noeudActuel = casData.scenari.noeuds[noeudActuelKey];

  // --- CHRONOMÈTRE ---
  useEffect(() => {
    let timer;
    if (!jeuTermine) {
      timer = setInterval(() => {
        setTempsEcoule((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [jeuTermine]);

  // --- ACTIONS DU JOUEUR ---

  // 1. Demander l'aide du Dr Hess
  const demanderAideHess = () => {
    if (window.confirm(`Dr Hess va dévoiler les objectifs, mais cela vous coûtera ${casData.configuration_difficulte.malus_dr_hess} points. Accepter ?`)) {
      setAideHessUtilisee(true);
    }
  };

  // 2. Faire un choix médical
  const validerChoix = (choix) => {
    // Comptabilisation des erreurs
    if (choix.type_impact === 'erreur_critique') setErreursCritiques((prev) => prev + 1);
    if (choix.type_impact === 'erreur_mineure') setErreursMineures((prev) => prev + 1);

    // Feedback immédiat (tu pourras remplacer par une belle modal plus tard)
    alert(choix.feedback);

    // Progression ou fin du cas (si la cible n'existe pas, on considère que le cas est fini)
    if (casData.scenari.noeuds[choix.cible]) {
      setNoeudActuelKey(choix.cible);
    } else {
      terminerLeCas();
    }
  };

  // 3. Fin de la partie et calcul du score
  const terminerLeCas = () => {
    setJeuTermine(true);
    
    // Appel de la fonction de notre fichier scoring.js
    const bilan = enregistrerNoteCas(
      casData.edn_item_id,
      erreursCritiques,
      erreursMineures,
      tempsEcoule,
      casData.configuration_difficulte.temps_limite_secondes,
      aideHessUtilisee
    );
    
    setBilanFinal(bilan);
  };

  // --- RENDU VISUEL : ÉCRAN DE FIN ---
  if (jeuTermine && bilanFinal) {
    return (
      <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center', fontFamily: 'Arial' }}>
        <h1>Cas Terminé !</h1>
        <h2 style={{ fontSize: '48px', color: bilanFinal.noteFinale >= 10 ? '#2e7d32' : '#c62828' }}>
          {bilanFinal.noteFinale} / 20
        </h2>
        
        <div style={{ textAlign: 'left', backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
          <h3>Détail des pénalités :</h3>
          <ul>
            <li>Fautes graves ({erreursCritiques}) : -{bilanFinal.penaliteCritique} pts</li>
            <li>Fautes mineures ({erreursMineures}) : -{bilanFinal.penaliteMineure} pts</li>
            <li>Dépassement de temps : -{bilanFinal.penaliteTemps.toFixed(1)} pts</li>
            {aideHessUtilisee && <li style={{ color: 'red' }}>Aide Dr Hess : -{bilanFinal.penaliteHess} pts</li>}
          </ul>
        </div>

        <button 
          onClick={onRetourAccueil}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  // --- RENDU VISUEL : PENDANT LE JEU ---
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial' }}>
      {/* Header : Titre et Chrono */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
        <h2>{casData.titre}</h2>
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
          ⏱️ {Math.floor(tempsEcoule / 60)}:{(tempsEcoule % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Section Dr Hess & Objectifs */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        {aideHessUtilisee ? (
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>🎯 Objectifs de stabilisation :</h4>
            <ul style={{ margin: 0 }}>
              {casData.objectifs_stabilisation.map((obj, index) => (
                <li key={index}>{obj}</li>
              ))}
            </ul>
          </div>
        ) : (
          <button 
            onClick={demanderAideHess}
            style={{ backgroundColor: '#ff9800', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}
          >
            🆘 Appeler Dr Hess (Révéler les objectifs : -{casData.configuration_difficulte.malus_dr_hess} pts)
          </button>
        )}
      </div>

      {/* Scénario en cours */}
      <div style={{ marginTop: '30px' }}>
        <p style={{ fontSize: '18px', lineHeight: '1.6' }}>{noeudActuel.description}</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '30px' }}>
          {noeudActuel.prochains_pas.map((choix, index) => (
            <button 
              key={index}
              onClick={() => validerChoix(choix)}
              style={{
                padding: '15px',
                textAlign: 'left',
                fontSize: '16px',
                cursor: 'pointer',
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '8px'
              }}
            >
              {choix.texte}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}