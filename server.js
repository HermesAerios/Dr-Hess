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
    liesDiscovered: false,
    searchedHome: false,
    interrogationCount: 0,
    // Nouveautés Étape 4
    vicodinDoses: 3,
    epiphanyUsed: false
};

// Base de données des scénarios EDN
const ednScenarios = {
    "158": { 
        name: "Mme Joly, 74 ans", 
        desc: "Fièvre à 39.5°C, frissons, marbrures aux genoux, désorientée. Pouls filant, polypnée.", 
        fc: 125, ta: "82/46", spo2: 90,
        correctDiag: "Sepsis grave",
        lethalWrongDiags: ["Poussée de Lupus", "Insuffisance cardiaque isolée"],
        patientSecret: "La patiente prétend qu'elle a juste attrapé un 'petit coup de froid' hier.",
        interrogateClue: "En insistant, sa fille avoue qu'elle avait des brûlures urinaires depuis 4 jours qu'elle refusait de soigner par peur des antibiotiques.",
        searchClue: "L'externe fouille son sac à main : il trouve des protections urinaires souillées et une boîte d'antalgiques vide. La porte d'entrée est clairement urinaire (Item 158 - Pyélonéphrite).",
        // Étape 4 : Épiphanie spécifique
        epiphany: "Vous regardez distraitement le calendrier de l'hôpital... Puis vous pensez à une fuite d'eau dans une vieille maison. Eurêka. Les marbrures, la fièvre, la confusion... Ce n'est pas un problème systémique magique, c'est une tuyauterie infectée qui lâche ! Cherchez du côté des urines (Item 158), l'infection a colonisé le sang !",
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
        patientSecret: "Il jure qu'il est non-fumeur, qu'il mange sain et n'a aucun stress.",
        interrogateClue: "Sous la pression, il admet avoir eu une violente dispute au travail et avoir pris une 'substance' pour tenir le coup.",
        searchClue: "L'externe fouille sa voiture : il trouve un pochon de cocaïne vide et 3 paquets de cigarettes cachés sous le siège. Facteur de risque majeur de spasme coronaire / SCA précoce (Item 339).",
        // Étape 4 : Épiphanie spécifique
        epiphany: "Un externe fait tomber sa canette de soda, qui s'écrase et refuse de couler à cause du goulot plié. Flash mental. Le cœur de Kovac ne manque pas de force, son artère principale est juste complètement clampée ou thrombosée par sa substance magique ! Un ECG immédiat (Item 339) va montrer le courant de lésion sous-épicardique !",
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
        liesDiscovered: false,
        searchedHome: false,
        interrogationCount: 0,
        // Étape 4
        vicodinDoses: 3,
        epiphanyUsed: false
    };
    res.json(activeSim);
});

// Route Étape 4 : Consommer de la Vicodine / Épiphanie
app.post('/api/vicodin', (req, res) => {
    const sc = ednScenarios[activeSim.itemId];
    
    if (activeSim.vicodinDoses <= 0) {
        return res.json({ activeSim, outcome: "[Avertissement] Flacon vide !", hessQuote: "Dr House : Plus de pilules. Va falloir faire marcher vos propres neurones pour une fois.", success: false });
    }

    activeSim.vicodinDoses--;
    activeSim.turns++;
    let outcome = "";
    let hessQuote = "";

    if (!activeSim.epiphanyUsed) {
        activeSim.epiphanyUsed = true;
        activeSim.score -= 5; // Léger coût sur la note pour l'aide
        outcome = `[💊 ÉPIPHANIE CLINIQUE] ${sc.epiphany}`;
        hessQuote = "Dr House : *Gobe la pilule*... Attendez une minute. Ne me dites pas que vous n'avez pas vu le piège de l'item ?";
    } else {
        activeSim.score -= 15; // Abus de substance = forte pénalité
        outcome = "[Addiction] Vous reprenez une dose. Vos tremblements s'arrêtent, mais votre lucidité n'augmente pas plus.";
        hessQuote = "Dr House : La dépendance c'est bien, mais uniquement quand ça mène à un diagnostic. Là, vous planez juste.";
    }

    activeSim.history.push(outcome);
    res.json({ activeSim, outcome, hessQuote, success: true });
});

app.post('/api/interrogate', (req, res) => {
    const sc = ednScenarios[activeSim.itemId];
    activeSim.turns++;
    activeSim.interrogationCount++;
    let outcome = "";
    if (activeSim.interrogationCount === 1) {
        activeSim.score += 5;
        outcome = `[Anamnèse poussée] ${sc.interrogateClue}`;
        activeSim.liesDiscovered = true;
    } else {
        activeSim.score -= 5;
        outcome = "[Anamnèse] Le patient s'énerve : 'Laissez-moi tranquille !'";
    }
    activeSim.history.push(outcome);
    res.json({ activeSim, outcome, hessQuote: "Dr House : Tout le monde ment. C'est une constante universelle." });
});

app.post('/api/search-home', (req, res) => {
    const sc = ednScenarios[activeSim.itemId];
    activeSim.turns++;
    let outcome = "";
    if (!activeSim.searchedHome) {
        activeSim.searchedHome = true;
        activeSim.score += 10;
        outcome = `[Perquisition Externe] ${sc.searchClue}`;
    } else {
        outcome = "[Perquisition] Rien de plus dans les tiroirs.";
    }
    activeSim.history.push(outcome);
    res.json({ activeSim, outcome, hessQuote: "Dr House : L'éthique n'a jamais sauvé de vie. Les preuves, si." });
});

app.post('/api/whiteboard/add', (req, res) => {
    const { hypothesis } = req.body;
    let feedback = "";
    if (!activeSim.whiteboard.includes(hypothesis)) {
        activeSim.whiteboard.push(hypothesis);
        activeSim.history.push(`Hypothèse sur le tableau : ${hypothesis}`);
        if (activeSim.lethalWrongDiags.some(d => d.toLowerCase() === hypothesis.toLowerCase())) {
            feedback = `Dr House : "${hypothesis} ? Dangereux. Prouvez-le avant de commettre l'irréparable."`;
        } else if (hypothesis.toLowerCase() === activeSim.correctDiag.toLowerCase()) {
            feedback = `Dr House : "Une intuition ? Allez, trouvez l'examen de première intention pour valider."`;
        } else {
            feedback = `Dr House : "${hypothesis} ? Retournez en PCEM1."`;
            activeSim.score -= 5;
        }
    } else {
        feedback = `Dr House : "Déjà noté."`;
    }
    res.json({ activeSim, feedback });
});

app.post('/api/execute', (req, res) => {
    const { order } = req.body;
    let outcome = "";
    let hessQuote = "Dr House : Donnez un vrai ordre thérapeutique.";
    const cleanOrder = order.toLowerCase();
    activeSim.turns++;

    if (cleanOrder.includes("oxygène") || cleanOrder.includes("o2")) {
        activeSim.patient.spo2 = Math.min(100, activeSim.patient.spo2 + 4);
        outcome = "Mise en place d'une VPC (Oxygène à haut débit).";
        hessQuote = "Dr House : L'oxygénation remonte.";
    } else if (cleanOrder.includes("anticoagulant") || cleanOrder.includes("aspirine") || cleanOrder.includes("lovenox")) {
        if (activeSim.itemId === "339") {
            outcome = "Bolus d'Aspegic IV administré.";
            hessQuote = "Dr House : Antiagrégation en cours.";
        } else {
            activeSim.patient.status = "CHOC HÉMORRAGIQUE (Décès)";
            activeSim.patient.fc = 0; activeSim.patient.ta = "0/0";
            outcome = "L'état s'effondre. Saignement massif provoqué.";
            hessQuote = "Dr House : Vous l'avez tué. Bravo.";
            activeSim.score = 0;
        }
    } else {
        outcome = `Action enregistrée : "${order}"`;
    }
    activeSim.history.push(outcome);
    res.json({ activeSim, outcome, hessQuote });
});

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
        } else if (details.tier === 2) {
            activeSim.score -= 5;
            activeSim.history.push(`[2ème Intention] ${matchedKey.toUpperCase()} : ${details.res}`);
            return res.json({ activeSim, outcome: details.res, hessQuote: `Dr House : ${details.msg}`, success: true });
        } else {
            activeSim.score -= 20;
            activeSim.history.push(`[ERREUR STRATÉGIQUE] ${matchedKey.toUpperCase()} : ${details.res}`);
            return res.json({ activeSim, outcome: details.res, hessQuote: `Dr House : ${details.msg}`, success: false });
        }
    } else {
        activeSim.score -= 3;
        let outcome = "Laboratoire : Examen non contributif.";
        activeSim.history.push(outcome);
        return res.json({ activeSim, outcome, hessQuote: "Dr House : Demande inutile.", success: false });
    }
});

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

app.listen(PORT, () => console.log(`Serveur Simulation prêt sur le port ${PORT}`));
