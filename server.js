const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// État de la simulation en cours
let activeSim = {
    itemId: null,
    difficulty: 'medium',
    patient: {},
    whiteboard: [],
    correctDiag: "",
    lethalWrongDiags: [],
    clues: {},
    investigations: {},
    history: [],
    score: 100,
    turns: 0,
    // Nouveautés Étape 3
    liesDiscovered: false,
    searchedHome: false,
    interrogationCount: 0
};

// Base de données des scénarios EDN avec secrets intégrés
const ednScenarios = {
    "158": { 
        name: "Mme Joly, 74 ans", 
        desc: "Fièvre à 39.5°C, frissons, marbrures aux genoux, désorientée. Pouls filant, polypnée.", 
        fc: 125, ta: "82/46", spo2: 90,
        correctDiag: "Sepsis grave",
        lethalWrongDiags: ["Poussée de Lupus", "Insuffisance cardiaque isolée"],
        // Étape 3 : Secrets (Everybody Lies)
        patientSecret: "La patiente prétend qu'elle a juste attrapé un 'petit coup de froid' hier.",
        interrogateClue: "En insistant, sa fille avoue qu'elle avait des brûlures urinaires depuis 4 jours qu'elle refusait de soigner par peur des antibiotiques.",
        searchClue: "L'externe fouille son sac à main : il trouve des protections urinaires souillées et une boîte d'antalgiques vide. La porte d'entrée est clairement urinaire (Item 158 - Pyélonéphrite).",
        investigations: {
            "hemocultures": { tier: 1, res: "Positives à E. Coli (2 flacons aérobie/anaérobie).", msg: "Essentiel ! Toujours faire les hémocultures AVANT l'antibiothérapie (Item 158)." },
            "lactates": { tier: 1, res: "Lactatémie à 4.5 mmol/L (Seuil critique > 2).", msg: "Parfait pour évaluer l'hypoperfusion tissulaire." },
            "gaze du sang": { tier: 1, res: "Acidose métabolique compensée. pH 7.31, HCO3- 18 mEq/L.", msg: "Indispensable pour l'équilibre acido-basique." },
            "tdm abdomino-pelvien": { tier: 2, res: "Infiltration de la graisse péri-rénale gauche. Pyélonéphrite aiguë suspectée.", msg: "Bonne recherche de la porte d'entrée, mais stabilisez le choc d'abord." },
            "ponction lombaire": { tier: 3, res: "Liquide clair, absence d'hyperleucocytose.", msg: "Inutile et dangereux sur un patient en choc sans signe de localisation !" }
        }
    },
    "339": { 
        name: "M. Kovac, 52 ans", 
        desc: "Douleur thoracique irradiant dans le bras gauche, en sueur. Transfixiante depuis 45 min.", 
        fc: 98, ta: "145/92", spo2: 96,
        correctDiag: "SCA ST+",
        lethalWrongDiags: ["Dissection aortique", "Pneumothorax"],
        // Étape 3 : Secrets (Everybody Lies)
        patientSecret: "Il jure qu'il est non-fumeur, qu'il mange sain et n'a aucun stress.",
        interrogateClue: "Sous la pression, il admet avoir eu une violente dispute au travail et avoir pris une 'substance' pour tenir le coup.",
        searchClue: "L'externe fouille sa voiture : il trouve un pochon de cocaïne vide et 3 paquets de cigarettes cachés sous le siège. Facteur de risque majeur de spasme coronaire / SCA précoce (Item 339).",
        investigations: {
            "ecg": { tier: 1, res: "Sus-décalage du segment ST de 3mm en D2, D3, aVF avec miroir en D1, aVL.", msg: "FAIT EN MOINS DE 10 MINUTES. Vous avez votre diagnostic de Infarctus du myocarde inférieur !" },
            "troponine": { tier: 2, res: "En attente... (Le laboratoire prend 45 min).", msg: "Sur un ST+, on n'attend PAS la troponine pour envoyer en coronarographie ! Perte de chance pour le muscle cardiaque." },
            "angioscanner": { tier: 3, res: "Aorte intègre. Pas d'embolie pulmonaire.", msg: "Irradiation inutile et perte de temps criminelle. L'ECG signait l'urgence coronaire." }
        }
    }
};

// Route pour initialiser un cas
app.post('/api/start-case', (req, res) => {
    const { itemId, difficulty } = req.body;
    const sc = ednScenarios[itemId] || ednScenarios["158"];
    
    let multiplier = difficulty === 'easy' ? 0.8 : difficulty === 'hard' ? 1.3 : 1.0;

    activeSim = {
        itemId,
        difficulty,
        patient: {
            name: sc.name,
            status: "Détresse Initiale",
            fc: Math.round(sc.fc * multiplier),
            ta: sc.ta,
            spo2: Math.max(75, Math.round(sc.spo2 / multiplier)),
            desc: `${sc.desc} -> Déclaration initiale du patient : "${sc.patientSecret}"`
        },
        whiteboard: [],
        correctDiag: sc.correctDiag,
        lethalWrongDiags: sc.lethalWrongDiags,
        investigations: sc.investigations,
        history: ["Patient admis en salle de déchocage."],
        score: 100,
        turns: 0,
        // Étape 3
        liesDiscovered: false,
        searchedHome: false,
        interrogationCount: 0
    };

    res.json(activeSim);
});

// Route Étape 3 : Pousser l'interrogatoire (Anamnèse ciblée)
app.post('/api/interrogate', (req, res) => {
    const sc = ednScenarios[activeSim.itemId];
    activeSim.turns++;
    activeSim.interrogationCount++;

    let outcome = "";
    let hessQuote = "";

    if (activeSim.interrogationCount === 1) {
        activeSim.score += 5;
        outcome = `[Anamnèse poussée] ${sc.interrogateClue}`;
        hessQuote = "Dr House : Étonnant, non ? Les gens oublient toujours de mentionner ce qui pourrait les sauver.";
        activeSim.liesDiscovered = true;
    } else {
        activeSim.score -= 5;
        outcome = "[Anamnèse] Le patient s'énerve : 'Laissez-moi tranquille, je vous ai déjà tout dit !'";
        hessQuote = "Dr House : Vous le harcelez. À ce rythme, sa tension va grimper plus vite que votre score.";
    }

    activeSim.history.push(outcome);
    res.json({ activeSim, outcome, hessQuote });
});

// Route Étape 3 : Perquisition environnementale
app.post('/api/search-home', (req, res) => {
    const sc = ednScenarios[activeSim.itemId];
    activeSim.turns++;
    
    let outcome = "";
    let hessQuote = "";

    if (!activeSim.searchedHome) {
        activeSim.searchedHome = true;
        activeSim.score += 10; // Récompensé car capital dans l'univers de House
        outcome = `[Perquisition Externe] ${sc.searchClue}`;
        hessQuote = "Dr House : Voilà pourquoi on enfreint la loi. La vérité est dans les poubelles, jamais dans la bouche du malade.";
    } else {
        outcome = "[Perquisition] L'externe est déjà sur place, il ne trouve rien d'autre à part de la poussière.";
        hessQuote = "Dr House : Arrêtez de vider son appartement et concentrez-vous sur ses organes.";
    }

    activeSim.history.push(outcome);
    res.json({ activeSim, outcome, hessQuote });
});

// Route pour ajouter une hypothèse au Tableau Blanc
app.post('/api/whiteboard/add', (req, res) => {
    const { hypothesis } = req.body;
    let feedback = "";
    
    if (!activeSim.whiteboard.includes(hypothesis)) {
        activeSim.whiteboard.push(hypothesis);
        activeSim.history.push(`Hypothèse sur le tableau : ${hypothesis}`);
        
        if (activeSim.lethalWrongDiags.some(d => d.toLowerCase() === hypothesis.toLowerCase())) {
            feedback = `Dr House : "${hypothesis} ? Dangereux, mais biologiquement défendable. Prouvez-le avant de tuer le patient."`;
        } else if (hypothesis.toLowerCase() === activeSim.correctDiag.toLowerCase()) {
            feedback = `Dr House : "Tiens, une lueur de génie ? Dommage que vous n'ayez encore rien prouvé."`;
        } else {
            feedback = `Dr House : "${hypothesis} ? Vous avez acheté votre diplôme sur internet ou récupéré dans une pochette surprise ?"`;
            activeSim.score -= 5;
        }
    } else {
        feedback = `Dr House : "C'est déjà écrit sur le tableau. Vous devenez alzheimer ?"`;
    }
    res.json({ activeSim, feedback });
});

// Route d'urgence (Actions libres et drogues)
app.post('/api/execute', (req, res) => {
    const { order } = req.body;
    let outcome = "";
    let hessQuote = "";
    const cleanOrder = order.toLowerCase();
    activeSim.turns++;

    if (cleanOrder.includes("oxygène") || cleanOrder.includes("o2")) {
        activeSim.patient.spo2 = Math.min(100, activeSim.patient.spo2 + 4);
        outcome = "Mise en place d'une VPC (Oxygène à haut débit).";
        hessQuote = "Dr House : Le cerveau respire, mais la cause profonde attend toujours.";
    } 
    else if (cleanOrder.includes("anticoagulant") || cleanOrder.includes("aspirine") || cleanOrder.includes("lovenox")) {
        if (activeSim.itemId === "339") {
            outcome = "Bolus d'Aspegic IV administré.";
            hessQuote = "Dr House : Antiagrégation lancée. Logique pour une coronaire bouchée.";
        } else {
            activeSim.patient.status = "CHOC HÉMORRAGIQUE (Décès)";
            activeSim.patient.fc = 0; activeSim.patient.ta = "0/0";
            outcome = "L'état s'effondre. Saignement massif interne provoqué.";
            hessQuote = "Dr House : Merveilleux. Vous avez fluidifié le sang d'un patient qui n'en avait pas besoin. Il est mort vidé.";
            activeSim.score = 0;
        }
    } else {
        outcome = `Action enregistrée : "${order}"`;
        hessQuote = "Dr House : Vous brassez de l'air. Donnez un vrai ordre thérapeutique ou diagnostique.";
        activeSim.score -= 2;
    }

    activeSim.history.push(outcome);
    res.json({ activeSim, outcome, hessQuote });
});

// Route d'examens complémentaires (Rigueur EDN / HAS)
app.post('/api/investigate', (req, res) => {
    const { examName } = req.body;
    let cleanExam = examName.toLowerCase().trim();
    activeSim.turns++;

    let matchedKey = Object.keys(activeSim.investigations).find(key => cleanExam.includes(key) || key.includes(cleanExam));

    if (matchedKey) {
        let details = activeSim.investigations[matchedKey];
        
        if (details.tier === 1) {
            activeSim.score += 5;
            activeSim.history.push(`[1ère Intention] ${matchedKey.toUpperCase()} : ${details.res}`);
            return res.json({ activeSim, outcome: details.res, hessQuote: `Dr House : ${details.msg}`, success: true });
        } 
        else if (details.tier === 2) {
            activeSim.score -= 5;
            activeSim.history.push(`[2ème Intention] ${matchedKey.toUpperCase()} : ${details.res}`);
            return res.json({ activeSim, outcome: details.res, hessQuote: `Dr House : ${details.msg}`, success: true });
        } 
        else if (details.tier === 3) {
            activeSim.score -= 20;
            activeSim.history.push(`[ERREUR DE STRATÉGIE] ${matchedKey.toUpperCase()} : ${details.res}`);
            return res.json({ activeSim, outcome: details.res, hessQuote: `Dr House : ${details.msg}`, success: false });
        }
    } else {
        activeSim.score -= 3;
        let outcome = "Laboratoire : Examen non disponible en urgence ou non significatif.";
        activeSim.history.push(outcome);
        return res.json({ activeSim, outcome, hessQuote: "Dr House : Arrêtez de vider les caisses de l'hôpital avec des bilans inutiles.", success: false });
    }
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
        finalNote = Math.max(0, Math.round((activeSim.score - 40) / 5));
    }

    res.json({ success, finalNote, correctAnswer: activeSim.correctDiag });
});

app.listen(PORT, () => console.log(`Serveur Simulation EDN sur le port ${PORT}`));
