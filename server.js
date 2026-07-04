const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let activeSim = {
    itemId: null,
    patient: {},
    whiteboard: [], // Hypothèses posées par le joueur
    correctDiag: "",
    lethalWrongDiags: [], // Diagnostics mortels si traités à l'envers
    history: [],
    score: 100
};

const ednScenarios = {
    "158": { 
        name: "Mme Joly, 74 ans", 
        desc: "Fièvre à 39.5°C, frissons, marbrures aux genoux, désorientée. FC 120, TA 85/50.", 
        correctDiag: "Sepsis grave",
        lethalWrongDiags: ["Poussée de Lupus", "Insuffisance cardiaque isolée"],
        clues: { "bilan bio": "Hyperleucocytose à 18G/L, Lactates à 4.2 mmol/L.", "hemocultures": "En cours... (Positives à E. Coli à 24h)" }
    },
    "339": { 
        name: "M. Kovac, 52 ans", 
        desc: "Douleur thoracique irradiant dans le bras gauche, en sueur. Transfixiante. FC 98, TA 140/90.", 
        correctDiag: "SCA ST+",
        lethalWrongDiags: ["Dissection aortique", "Pneumothorax"],
        clues: { "ecg": "Sus-décalage du segment ST en D2, D3, aVF (Infarctus inférieur).", "troponine": "Troponine I ultra-sensible élevée." }
    }
};

app.post('/api/start-case', (req, res) => {
    const { itemId } = req.body;
    const sc = ednScenarios[itemId] || ednScenarios["158"]; // Fallback
    
    activeSim = {
        itemId,
        patient: { name: sc.name, desc: sc.desc, fc: 110, ta: "90/60", spo2: 93, status: "En observation" },
        whiteboard: [],
        correctDiag: sc.correctDiag,
        lethalWrongDiags: sc.lethalWrongDiags,
        clues: sc.clues,
        history: ["Patient installé dans le box d'investigation."],
        score: 100
    };
    res.json(activeSim);
});

// Ajouter une hypothèse au tableau blanc
app.post('/api/whiteboard/add', (req, res) => {
    const { hypothesis } = req.body;
    let feedback = "";
    
    if (!activeSim.whiteboard.includes(hypothesis)) {
        activeSim.whiteboard.push(hypothesis);
        activeSim.history.push(`Hypothèse ajoutée au tableau blanc : ${hypothesis}`);
        
        if (activeSim.lethalWrongDiags.includes(hypothesis)) {
            feedback = `Dr Hess : "Pister une '${hypothesis}' ? Dangereux, mais biologiquement défendable. Prouvez-le avant de tuer le patient."`;
        } else if (hypothesis.toLowerCase() === activeSim.correctDiag.toLowerCase()) {
            feedback = `Dr Hess : "Tiens, une lueur de génie ? Gardez cette idée dans un coin de votre tête."`;
        } else {
            feedback = `Dr Hess : "${hypothesis} ? Vous avez acheté votre diplôme sur internet ou quoi ?"`;
            activeSim.score -= 5;
        }
    }
    res.json({ activeSim, feedback });
});

// Prescrire un examen ou un traitement
app.post('/api/execute', (req, res) => {
    const { order } = req.body;
    let outcome = "";
    let hessQuote = "";
    const cleanOrder = order.toLowerCase();

    // Gestion des examens biologiques/imagerie du programme EDN
    if (cleanOrder.includes("ecg") || cleanOrder.includes("bilan") || cleanOrder.includes("troponine") || cleanOrder.includes("lactates")) {
        let foundClue = false;
        for (let key in activeSim.clues) {
            if (cleanOrder.includes(key) || key.includes(cleanOrder)) {
                outcome = `[Examen] ${activeSim.clues[key]}`;
                foundClue = true;
            }
        }
        if (!foundClue) outcome = "[Examen] Résultats dans les limites de la normale.";
        hessQuote = "Les chiffres ne mentent pas. Contrairement aux patients.";
    } 
    // Erreur fatale : Traiter un faux diagnostic mortel
    else if (cleanOrder.includes("anticoagulant") || cleanOrder.includes("aspirine")) {
        if (activeSim.whiteboard.includes("Dissection aortique") || activeSim.itemId === "339") {
            outcome = "Administration d'antiagrégants plaquettaires.";
            hessQuote = "Traitement standard du SCA validé. Bien joué.";
        } else {
            activeSim.patient.status = "ARRÊT CARDIAQUE (Choc hémorragique)";
            activeSim.patient.fc = 0; activeSim.patient.ta = "0/0";
            outcome = "Effondrement circulatoire immédiat.";
            hessQuote = "Donner des anticoagulants sur une suspicion de dissection aortique... Vous venez de rompre son artère. Il est mort vidé de son sang.";
            activeSim.score = 0;
        }
    } else {
        outcome = `Ordre exécuté : ${order}`;
        hessQuote = "Rien de catastrophique, mais on n'avance pas.";
    }

    activeSim.history.push(outcome);
    res.json({ activeSim, outcome, hessQuote });
});

app.listen(PORT, () => console.log("Moteur d'enquête lancé."));
