import http from 'http';
import { HouseEngine } from './core/engine/HouseEngine';

// Render donne un numéro de port automatique, on le récupère ici
const port = process.env.PORT || 3000;

console.log("🩺 Lancement du protocole Diagnostica...");

// On teste si notre moteur de scénarios Dr House fonctionne bien
try {
    const testEngine = new HouseEngine('CASE_HOUSE_001_WILSON');
    const patient = testEngine.getInitialPatient();
    console.log(`✅ [Moteur de Jeu] Succès. Scénario chargé pour le patient : ${patient.name}`);
} catch (error) {
    console.error("❌ Erreur lors du chargement du moteur clinique :", error);
}

// On crée un mini-serveur web pour que l'adresse internet du jeu affiche quelque chose
const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('🩺 Bienvenue sur Diagnostica: EDN Protocol (Dr-Hess) ! Le serveur de jeu tourne parfaitement en arrière-plan.');
});

server.listen(port, () => {
    console.log(`🚀 Le jeu est officiellement en ligne et écoute sur le port ${port}`);
});