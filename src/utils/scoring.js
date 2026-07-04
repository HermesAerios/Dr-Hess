// Initialise ou récupère la liste des scores depuis la mémoire du navigateur
export function chargerScoresEDN(ednListInitiale) {
  const scoresSauvegardes = localStorage.getItem('edn_dashboard_scores');
  if (scoresSauvegardes) return JSON.parse(scoresSauvegardes);

  // Si c'est la première visite, on formate la liste de base
  const listeInitialisee = {};
  for (const [id, data] of Object.entries(ednListInitiale)) {
    listeInitialisee[id] = { ...data, derniere_note: null, deja_joue: false };
  }
  
  localStorage.setItem('edn_dashboard_scores', JSON.stringify(listeInitialisee));
  return listeInitialisee;
}

// Calcule la note finale et met à jour le localStorage
export function enregistrerNoteCas(ednItemId, erreursCritiques, erreursMineures, tempsEcoule, tempsLimite, aideHess) {
  const NOTE_MAX = 20;
  
  const penaliteCritique = erreursCritiques * 4.0;
  const penaliteMineure = erreursMineures * 1.5;
  const penaliteTemps = tempsEcoule > tempsLimite ? (tempsEcoule - tempsLimite) * 0.02 : 0;
  const penaliteHess = aideHess ? 2.0 : 0;

  let noteFinale = Math.max(0, NOTE_MAX - (penaliteCritique + penaliteMineure + penaliteTemps + penaliteHess));
  noteFinale = Math.round(noteFinale * 10) / 10;

  // Mise à jour de la base de données locale
  const listeGlobalEdn = JSON.parse(localStorage.getItem('edn_dashboard_scores'));
  if (listeGlobalEdn[ednItemId]) {
    listeGlobalEdn[ednItemId].derniere_note = noteFinale;
    listeGlobalEdn[ednItemId].deja_joue = true;
    localStorage.setItem('edn_dashboard_scores', JSON.stringify(listeGlobalEdn));
  }

  return { noteFinale, penaliteCritique, penaliteMineure, penaliteTemps, penaliteHess };
}