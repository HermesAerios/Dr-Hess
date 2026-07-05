const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let activeSim = {};

// Dictionnaire universel pour l'affichage propre dans les logs de débriefing
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
    "ionogramme": "Ionogramme sanguin standard",
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

// ROUTE DYNAMIQUE: Scanne le dossier /cases et renvoie la liste des fichiers disponibles
app.get('/api/available-cases', (req, res) => {
    const casesFolder = path.join(__dirname, 'cases');
    
    // Si le dossier n'existe pas, on le crée
    if (!fs.existsSync(casesFolder)) {
        fs.mkdirSync(casesFolder);
    }

    fs.readdir(casesFolder, (err, files) => {
        if (err) return res.status(500).json({ error: "Impossible de lire les dossiers patients." });
        
        // Filtrer pour ne garder que les fichiers .json
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        const dynamicList = jsonFiles.map(file => {
            const rawData = fs.readFileSync(path.join(casesFolder, file));
            const parsed = JSON.parse(rawData);
            return {
                itemId: parsed.itemId,
                displayName: parsed.displayName || parsed.type,
                fileName: file
            };
        });
        res.json(dynamicList);
    });
});

// ROUTE DYNAMIQUE: Initialise un cas en chargeant son JSON autonome
app.post('/api/start-case', (req, res) => {
    const { itemId } = req.body;
    const casesFolder = path.join(__dirname, 'cases');
    const filePath = path.join(casesFolder, `${itemId}.json`);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Dossier clinique introuvable." });
    }

    const rawData = fs.readFileSync(filePath);
    const sc = JSON.parse(rawData);

    // Hydratation du State de Simulation
    activeSim = {
        itemId: sc.itemId,
        patient: { ...sc.patient, status: "Détresse Initiale" },
        whiteboard: [],
        correctDiag: sc.correctDiag,
        lethalWrongDiags: sc.lethalWrongDiags,
        usefulExams: sc.usefulExams,
        rosHint: sc.rosHint,
        examHint: sc.examHint,
        investigationsHint: sc.investigationsHint,
        correctDisposition: sc.correctDisposition,
        dispositionsConfig: sc.dispositionsConfig,
        performedActions: [],
        score: 100,
        vicodinDoses: 3,
        stabilizationItems: { iv_access: false, oxygen: false, monitoring: false }
    };

    res.json(activeSim);
});

// Route de Stabilisation d'Urgence
app.post('/api/stabilize-action', (req, res) => {
    const { actionKey } = req.body;
    let outcome = "";
    let scoreMod = 0;
    let justification = "";

    if (actionKey === "peripheral_ivs") {
        if (!activeSim.stabilizationItems.iv_access) {
            activeSim.stabilizationItems.iv_access = true; scoreMod = 5;
            outcome = "Pose de voies veineuses périphériques (VVP) de bon calibre effectuée.";
            justification = "L'installation d'un accès veineux sécurisé est la priorité absolue devant une défaillance.";
        } else { outcome = "Déjà en place."; justification = "Geste redondant."; }
    } 
    else if (actionKey === "oxygen") {
        activeSim.stabilizationItems.oxygen = true;
        activeSim.patient.spo2 = Math.min(100, activeSim.patient.spo2 + 6);
        activeSim.patient.fr = Math.max(14, activeSim.patient.fr - 4);
        scoreMod = 5;
        outcome = "Oxygénothérapie au masque à haute concentration lancée.";
        justification = "Optimise l'oxygénation tissulaire en présence de polypnée.";
    } 
    else if (actionKey === "monitoring") {
        activeSim.stabilizationItems.monitoring = true; scoreMod = 5;
        outcome = "Patient monitoré et scopé en continu.";
        justification = "Le monitorage continu permet de détecter les complications rythmiques et tensionnelles.";
    }

    if (scoreMod !== 0) {
        activeSim.score += scoreMod;
        activeSim.performedActions.push({ name: `Stabilisation: ${actionKey.toUpperCase()}`, tier: "Critique", status: 1, res: "Validé", justification });
    }
    res.json({ activeSim, outcome, justification });
});

// Route d'Investigations
app.post('/api/investigate', (req, res) => {
    const { examKey } = req.body;
    let name = EXAM_CATALOG[examKey] || "Examen Inconnu";
    
    if (activeSim.usefulExams && activeSim.usefulExams[examKey]) {
        let match = activeSim.usefulExams[examKey];
        let tierLabel = match.tier === 1 ? "Critique" : match.tier === 2 ? "Optionnel" : "Faute";
        
        if (match.tier === 1) activeSim.score += 5;
        if (match.tier === 2) activeSim.score -= 3;
        if (match.tier === 3) activeSim.score -= 20;

        res.json({ examKey, name, success: match.tier !== 3, image: match.image || "normal.jpg", rawResult: match.res, activeSim });
    } else {
        activeSim.score -= 5;
        res.json({ examKey, name, success: false, image: "normal_generic.jpg", rawResult: "Résultats physiologiques normaux.", activeSim });
    }
});

app.post('/api/reveal-interpretation', (req, res) => {
    const { examKey } = req.body;
    let match = activeSim.usefulExams[examKey];
    activeSim.score -= 2;
    let interp = match ? match.interpretation : "Examen normal, sans particularité étiologique.";
    let justif = match ? match.justification : "Non contributif pour ce cas.";
    let name = EXAM_CATALOG[examKey] || examKey;
    
    activeSim.performedActions.push({ name, tier: match ? (match.tier === 1 ? "Critique" : "Optionnel") : "Inutile", status: match ? match.tier : 2, res: match ? match.res : "Normal", justification: justif });
    res.json({ interpretation: interp, justification: justif, score: activeSim.score });
});

app.post('/api/get-hint', (req, res) => {
    activeSim.score -= 3;
    let hintText = activeSim[req.body.type] || "Dr Hess : 'Cherchez encore.'";
    res.json({ hint: hintText, score: activeSim.score });
});

app.post('/api/execute', (req, res) => {
    const { order } = req.body;
    activeSim.performedActions.push({ name: `Ordre libre: ${order}`, tier: "Optionnel", status: 2, res: "Appliqué", justification: "Action thérapeutique ou d'ambiance." });
    res.json({ activeSim, outcome: "Geste consigné aux transmissions." });
});

app.post('/api/whiteboard/add', (req, res) => {
    activeSim.whiteboard.push(req.body.hypothesis);
    res.json({ activeSim, feedback: "Épinglé au tableau blanc." });
});

app.post('/api/diagnose', (req, res) => {
    const { hypothesis, dispositionKey } = req.body;
    let config = activeSim.dispositionsConfig[dispositionKey];
    activeSim.score += config ? config.score : -20;
    
    let correctDiagMatched = hypothesis.toLowerCase().includes(activeSim.correctDiag.toLowerCase());
    let finalNote = correctDiagMatched ? Math.round(activeSim.score / 5) : 4;
    
    if (finalNote > 20) finalNote = 20;
    if (finalNote < 0) finalNote = 0;

    activeSim.performedActions.push({
        name: `Orientation Finale: ${config ? config.label : 'Inconnue'}`,
        tier: config && config.score > 0 ? "Critique" : "Faute",
        status: config && config.score > 0 ? 1 : 3,
        res: correctDiagMatched ? "Diagnostic Correct" : "Diagnostic Erroné",
        justification: config ? config.rationale : "Triage non conforme."
    });

    res.json({ finalNote, correctAnswer: activeSim.correctDiag, actionsHistory: activeSim.performedActions });
});

app.get('/api/get-current-sim', (req, res) => { res.json(activeSim); });

app.listen(PORT, () => console.log(`Moteur ScribECN opérationnel sur le port ${PORT}`));
