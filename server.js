const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let activeSim = {};

const EXAM_CATALOG = {
    "exam_vias": "Examen des voies aériennes supérieures",
    "exam_resp": "Examen de la respiration / ventilation",
    "exam_circ": "Examen circulatoire (pouls, TRC, hémodynamique)",
    "exam_head": "Examen Tête, Yeux, Oreilles, Nez, Gorge (HEENT)",
    "exam_neck": "Examen du cou (souplesse, thyroïde, ganglions)",
    "exam_cardio": "Examen cardiovasculaire (auscultation, œdèmes)",
    "exam_pulm": "Examen pulmonaire (auscultation)",
    "exam_abd": "Examen abdominal (palpation, percussion)",
    "exam_gu": "Examen génito-urinaire",
    "exam_back": "Examen du dos et des flancs (percussion lombaire)",
    "exam_loco": "Appareil locomoteur / musculosquelettique",
    "exam_skin": "Examen cutané (éruptions, purpura)",
    "exam_neuro": "Examen neurologique complet",
    "exam_psych": "Examen psychiatrique / état psychologique",
    "ecg": "Électrocardiogramme (ECG)",
    "hgt": "Glycémie capillaire (HGT)",
    "dep": "Mesure du débit expiratoire de pointe (DEP)",
    "echo_aorte": "Échographie de l'aorte",
    "echo_coeur_foc": "Échographie cardiaque focalisée",
    "echo_fast": "Échographie FAST (épanchements)",
    "echo_tvp": "Échographie veineuse des MI (Thrombose)",
    "echo_pulm": "Échographie pleuropulmonaire",
    "echo_renal": "Échographie rénale et des voies urinaires",
    "echo_hépato": "Échographie hépato-biliaire",
    "echo_mou": "Échographie des tissus mous",
    "gds": "Gaz du sang artériel (GDS)",
    "ionogramme": "Ionogramme sanguin standard (Chem 7)",
    "groupage_rai": "Groupage sanguin et Recherche de RAI",
    "calcemie_ion": "Calcémie ionisée",
    "calcemie_tot": "Calcémie totale",
    "hemostase": "Bilan de l'hémostase (TP, TCA, INR)",
    "nfs": "Numération Formule Sanguine (NFS)",
    "ddimeres": "D-Dimères",
    "lactates": "Lactates sanguins",
    "lipasemie": "Lipasémie",
    "bilan_hepatique": "Bilan hépatique complet",
    "magnesemie": "Dosage du magnésium",
    "phosphatemie": "Dosage du phosphore",
    "probnp": "pro-BNP (Peptide natriurétique)",
    "troponine_t": "Troponine T",
    "paracetamol": "Dosage du paracétamol",
    "amylasemie": "Amylasémie",
    "crp": "Protéine C-Réactive (CRP)",
    "cpk": "Créatine Kinase (CK / CPK)",
    "alcoolemie": "Alcoolémie / Dosage éthanol",
    "hemocultures": "Hémocultures (2 paires)",
    "analyse_urine": "Analyse d'urine (bandelette / sédiment)",
    "lcr_num": "Numération cellulaire du LCR",
    "lcr_glyco": "Glycorachie",
    "lcr_gram": "Coloration de Gram sur le LCR",
    "lcr_proteino": "Protéinorachie"
};

const ednScenarios = {
    "158": { 
        name: "Mme Joly, 74 ans", 
        type: "Choc septique d'origine urinaire (Item 158)",
        desc: "Trouvée désorientée chez elle. Fièvre majeure, frissons. Sa fille prétend qu'elle a juste attrapé un 'petit coup de froid' hier.", 
        fc: 125, ta: "82/46", spo2: 90, fr: 26, temp: 39.5, dextro: 6.1, aspect: "Marbrures aux genoux, TRC > 4s, somnolence prononcée.",
        correctDiag: "Sepsis grave",
        lethalWrongDiags: ["Poussée de Lupus", "Surdosage en bêtabloquants"],
        interrogateEffect: (sim) => {
            sim.liesDiscovered = true; sim.patient.fc = 138; sim.patient.ta = "72/40"; sim.score -= 5;
            return { outcome: "[CRASH CLINIQUE] La patiente s'effondre. Sa fille avoue : 'Elle avait des brûlures urinaires atroces depuis 4 jours !'", hess: "Dr Hess : Sa tension s'effondre. Lancez la réanimation !" };
        },
        searchEffect: (sim) => {
            sim.searchedHome = true; sim.score += 10;
            return { outcome: "[Perquisition] Votre externe trouve des protections urinaires souillées de sang.", hess: "Dr Hess : La porte d'entrée est urinaire." };
        },
        epiphany: "La tuyauterie systémique s'effondre sous l'effet des endotoxines bactériennes ! Ciblez le foyer urinaire.",
        usefulExams: {
            "exam_vias": { tier: 1, res: "Voies aériennes supérieures libres.", justification: "Libres. Indispensable lors de l'évaluation initiale d'une détresse." },
            "exam_resp": { tier: 1, res: "Polypnée superficielle à 26/min.", justification: "Objective la tachypnée, critère de dysfonction respiratoire lié au sepsis (qSOFA)." },
            "exam_circ": { tier: 1, res: "Pouls radial filant, tachycardie à 125 bpm, TRC à 4 secondes.", justification: "Mise en évidence directe d'une insuffisance circulatoire aiguë." },
            "exam_back": { tier: 1, res: "Douleur vive déclenchée à la percussion de la fosse lombaire gauche.", justification: "Signe de Giordano positif : oriente vers une atteinte rénale (pyélonéphrite)." },
            "exam_skin": { tier: 1, res: "Marbrures violacées localisées aux genoux.", justification: "Marqueur clinique de gravité extrême de l'insuffisance circulatoire." },
            "analyse_urine": { tier: 1, res: "Bandelette urinaire : Leucocytes +++, Nitrites +", justification: "INDISPENSABLE (Item 158) : Confirme l'infection urinaire aiguë et la porte d'entrée." },
            "lactates": { tier: 1, res: "Lactatémie à 4.5 mmol/L.", justification: "CRITIQUE : Confirme l'hypoperfusion tissulaire périphérique (seuil Sepsis-3 > 2 mmol/L)." },
            "hemocultures": { tier: 1, res: "Positives à Bacilles Gram Négatif (E. Coli).", justification: "OBLIGATOIRE : Isole le germe causal avant de guider l'antibiothérapie définitive." },
            "ionogramme": { tier: 1, res: "Créatinine 155 µmol/L, Urée 14 mmol/L.", justification: "INDISPENSABLE : Révèle une insuffisance rénale aiguë fonctionnelle d'origine hémodynamique." },
            "lcr_num": { tier: 3, res: "Liquide clair, formule normale.", justification: "ERREUR GRAVE : Ponction lombaire injustifiée et dangereuse sur un choc septique urologique." }
        }
    }
};

app.post('/api/start-case', (req, res) => {
    const { itemId, difficulty } = req.body;
    const sc = ednScenarios[itemId] || ednScenarios["158"];
    let multiplier = difficulty === 'easy' ? 0.8 : difficulty === 'hard' ? 1.3 : 1.0;

    activeSim = {
        itemId,
        difficulty,
        patient: {
            name: sc.name, type: sc.type, status: "Détresse Initiale",
            fc: Math.round(sc.fc * multiplier), ta: sc.ta,
            spo2: Math.min(100, Math.max(75, Math.round(sc.spo2 / (multiplier * 0.98)))),
            fr: Math.round(sc.fr * multiplier), temp: sc.temp, dextro: sc.dextro, aspect: sc.aspect, desc: sc.desc
        },
        whiteboard: [],
        correctDiag: sc.correctDiag,
        lethalWrongDiags: sc.lethalWrongDiags,
        usefulExams: sc.usefulExams,
        history: ["Admission du patient au déchocage."],
        // Liste historique pour le débriefing structuré
        performedActions: [],
        score: 100,
        turns: 0,
        liesDiscovered: false,
        searchedHome: false,
        vicodinDoses: 3,
        epiphanyUsed: false
    };
    res.json(activeSim);
});

// Enregistrement et calcul des investigations
app.post('/api/investigate', (req, res) => {
    const { examKey } = req.body;
    activeSim.turns++;
    let name = EXAM_CATALOG[examKey] || "Examen Inconnu";
    
    if (activeSim.usefulExams && activeSim.usefulExams[examKey]) {
        let match = activeSim.usefulExams[examKey];
        let tierLabel = match.tier === 1 ? "Critique" : match.tier === 2 ? "Optionnel" : "Faute";
        
        if (match.tier === 1) activeSim.score += 5;
        if (match.tier === 2) activeSim.score -= 3;
        if (match.tier === 3) { activeSim.score -= 20; activeSim.patient.status = "CRASH"; }

        activeSim.performedActions.push({ key: examKey, name: name, tier: tierLabel, status: match.tier, res: match.res, justification: match.justification });
        return res.json({ activeSim, outcome: match.res, justification: match.justification, success: match.tier !== 3 });
    } else {
        activeSim.score -= 5;
        let justification = "NON CONTRIBUTIF : Cet examen n'est pas recommandé en première intention pour ce tableau clinique précis.";
        activeSim.performedActions.push({ key: examKey, name: name, tier: "Inutile", status: 3, res: "Normal / Non significatif.", justification: justification });
        return res.json({ activeSim, outcome: "Résultats normaux.", justification, success: false });
    }
});

// Thérapeutiques
app.post('/api/execute', (req, res) => {
    const { order } = req.body;
    let outcome = "Action clinique consignée.";
    let clean = order.toLowerCase();

    if (clean.includes("oxygène")) {
        activeSim.patient.spo2 = Math.min(100, activeSim.patient.spo2 + 6);
        outcome = "Oxygénothérapie initiée.";
        activeSim.performedActions.push({ key: "ther_o2", name: "Oxygénothérapie", tier: "Critique", status: 1, res: "Efficace", justification: "Maintien des fonctions vitales de base." });
    } else if (clean.includes("remplissage") && activeSim.itemId === "158") {
        activeSim.patient.ta = "105/65"; activeSim.patient.fc = 105; activeSim.score += 10;
        outcome = "Remplissage par 500ml de Cristalloïdes effectué.";
        activeSim.performedActions.push({ key: "ther_fluid", name: "Remplissage Vasculaire", tier: "Critique", status: 1, res: "Pression artérielle restaurée", justification: "Correction du contenant face à l'urosepsis." });
    } else {
        activeSim.performedActions.push({ key: "ther_other", name: `Action: ${order}`, tier: "Optionnel", status: 2, res: "En cours", justification: "Geste de confort ou non prioritaire." });
    }
    res.json({ activeSim, outcome, hessQuote: "Dr Hess : Reçu." });
});

// Traitement des autres routes basiques
app.post('/api/interrogate', (req, res) => {
    const sc = ednScenarios[activeSim.itemId];
    const data = sc.interrogateEffect(activeSim);
    res.json({ activeSim, outcome: data.outcome, hessQuote: data.hess });
});
app.post('/api/search-home', (req, res) => {
    const sc = ednScenarios[activeSim.itemId];
    const data = sc.searchEffect(activeSim);
    res.json({ activeSim, outcome: data.outcome, hessQuote: data.hess });
});
app.post('/api/vicodin', (req, res) => {
    const sc = ednScenarios[activeSim.itemId];
    activeSim.vicodinDoses--; activeSim.epiphanyUsed = true; activeSim.score -= 5;
    res.json({ activeSim, outcome: `[ÉPIPHANIE] ${sc.epiphany}`, hessQuote: "Dr Hess : Regardez mieux.", success: true });
});
app.post('/api/whiteboard/add', (req, res) => {
    const { hypothesis } = req.body; activeSim.whiteboard.push(hypothesis);
    res.json({ activeSim, feedback: "Dr Hess : Hypothèse épinglée au tableau blanc." });
});

app.post('/api/diagnose', (req, res) => {
    const { hypothesis } = req.body;
    let finalNote = hypothesis.toLowerCase().includes(activeSim.correctDiag.toLowerCase()) ? Math.round(activeSim.score / 5) : 4;
    if (finalNote > 20) finalNote = 20;
    res.json({ finalNote, correctAnswer: activeSim.correctDiag, actionsHistory: activeSim.performedActions });
});

app.get('/api/get-current-sim', (req, res) => { res.json(activeSim); });
app.listen(PORT, () => console.log(`Moteur d'apprentissage actif.`));
