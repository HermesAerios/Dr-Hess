const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// État global de la simulation en cours
let activeSim = {
    itemId: null,
    difficulty: 'medium',
    patient: { name: "Anonyme", status: "Stable", fc: 80, ta: "120/80", spo2: 98, consciens: true },
    diagnostics: [],
    history: [],
    timeElapsed: 0,
    score: 100
};

// Dictionnaire de scénarios EDN de base (extensible)
const scenarios = {
    "331": { name: "M. Dupuis, 62 ans", fc: 145, ta: "85/40", spo2: 91, desc: "Trouvé inconscient en réanimation. Pouls filant, Scope en FV.", correctDiag: "ACR choquable" },
    "332": { name: "Léa, 24 ans", fc: 130, ta: "70/40", spo2: 88, desc: "Détresse respiratoire brutale après injection d'Amoxicilline. Urticaire géant.", correctDiag: "Choc anaphylactique" },
    "339": { name: "M. Martin, 55 ans", fc: 95, ta: "105/65", spo2: 96, desc: "Douleur thoracique constructive irradiant dans la mâchoire depuis 2h.", correctDiag: "SCA ST+" }
};

// Route pour initialiser un cas
app.post('/api/start-case', (req, res) => {
    const { itemId, difficulty } = req.body;
    const baseTemplate = scenarios[itemId] || {
        name: "Patient Standard",
        fc: 110, ta: "100/60", spo2: 94,
        desc: `Suspicion de pathologie liée à l'Item ${itemId}. Le patient présente des signes cliniques atypiques.`
    };

    let multiplier = difficulty === 'easy' ? 0.8 : difficulty === 'hard' ? 1.5 : 1.0;

    activeSim = {
        itemId,
        difficulty,
        patient: {
            name: baseTemplate.name,
            status: "En décompensation",
            fc: Math.round(baseTemplate.fc * multiplier),
            ta: baseTemplate.ta,
            spo2: Math.max(70, Math.round(baseTemplate.spo2 / multiplier)),
            desc: baseTemplate.desc
        },
        correctDiag: baseTemplate.correctDiag || "Non spécifié",
        history: ["Patient admis aux urgences."],
        score: 100,
        turns: 0
    };

    res.json(activeSim);
});

// Route pour traiter une action libre textuelle ou un bouton spécialisé
app.post('/api/action', (req, res) => {
    const { action } = req.body;
    activeSim.turns++;
    let hessQuote = "Continuez l'interrogatoire.";

    // Logique interactive amusante et punitive
    if (action.toLowerCase().includes("oxygène") || action.toLowerCase().includes("o2")) {
        activeSim.patient.spo2 = Math.min(100, activeSim.patient.spo2 + 5);
        activeSim.history.push("Pose d'un masque à haute concentration (O2).");
        hessQuote = "Bien. Le cerveau vous remercie, mais ça ne règle pas le problème de fond.";
    } 
    else if (action.toLowerCase().includes("adrénaline")) {
        activeSim.patient.fc += 25;
        activeSim.patient.ta = "160/100";
        activeSim.history.push("Injection d'1mg d'Adrénaline IVD.");
        if (activeSim.itemId !== "331" && activeSim.itemId !== "332") {
            activeSim.score -= 30;
            hessQuote = "De l'adrénaline sur ce profil ? Vous voulez le tuer plus vite que sa maladie ? Le scope s'affole !";
        } else {
            hessQuote = "Excellent réflexe. Le rythme de perfusion cardiaque remonte.";
        }
    } 
    else if (action.toLowerCase().includes("choc") || action.toLowerCase().includes("défibrillateur")) {
        if (activeSim.itemId === "331") {
            activeSim.patient.fc = 85;
            activeSim.patient.ta = "120/80";
            activeSim.patient.spo2 = 96;
            activeSim.history.push("Choc électrique externe (200J) délivré.");
            hessQuote = "RCE (Retour en circulation spontanée) obtenu ! Vous venez de le ramener à la vie.";
        } else {
            activeSim.score -= 40;
            activeSim.patient.fc = 0;
            activeSim.patient.ta = "0/0";
            activeSim.history.push("Asystolie provoquée par un choc inapproprié.");
            hessQuote = "Vous avez choqué un rythme sinusal... Félicitations, vous l'avez transformé en steak haché.";
        }
    } 
    else if (action.toLowerCase().includes("interroger") || action.toLowerCase().includes("anamnèse")) {
        activeSim.history.push("Interrogatoire du patient/de la famille effectué.");
        hessQuote = `Indice : "${activeSim.patient.desc}"`;
    }
    else {
        activeSim.history.push(`Action tentée : "${action}"`);
        hessQuote = "Le Dr Hess hausse les sourcils. 'Expliquez-moi le rapport avec les recommandations nationales ?'";
        activeSim.score -= 5;
    }

    // Calcul de l'état de santé
    if (activeSim.patient.fc > 160 || activeSim.patient.fc === 0 || activeSim.patient.spo2 < 75) {
        activeSim.patient.status = "ARRÊT CARDIO-RESPIRATOIRE / DÉCÈS";
        activeSim.score = 0;
    }

    res.json({ activeSim, hessQuote });
});

// Route de diagnostic final
app.post('/api/diagnose', (req, res) => {
    const { hypothesis } = req.body;
    let success = false;
    let finalNote = 0;

    if (activeSim.correctDiag && hypothesis.toLowerCase().includes(activeSim.correctDiag.toLowerCase())) {
        success = true;
        finalNote = Math.max(10, Math.round(activeSim.score / 5));
    } else {
        finalNote = Math.max(0, Math.round((activeSim.score - 50) / 5));
    }

    res.json({ success, finalNote, correctAnswer: activeSim.correctDiag });
});

app.listen(PORT, () => console.log(`Serveur Simulation EDN lancé sur le port ${PORT}`));
