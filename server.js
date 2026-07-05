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
    "exam_back": "Examen du dos et des flancs (percussion lombaire)",
    "exam_skin": "Examen cutané (éruptions, purpura)",
    "bu": "Bandelette Urinaire (BU)",
    "ecg": "Électrocardiogramme (ECG)",
    "lactates": "Lactates sanguins",
    "hemocultures": "Hémocultures (2 paires)",
    "ionogramme": "Ionogramme sanguin standard",
    "nfs": "Numération Formule Sanguine (NFS)",
    "crp": "Protéine C-Réactive (CRP)",
    "lcr_num": "Numération cellulaire du LCR",
    "radio_thorax": "Radiographie du Thorax",
    "tdm_abdomen": "Scanner Abdomino-pelvien"
};

const ednScenarios = {
    "158": { 
        name: "Mme Joly, 74 ans", 
        type: "Choc septique d'origine urinaire (Item 158)",
        desc: "Trouvée désorientée chez elle. Fièvre majeure, frissons. Sa fille prétend qu'elle a juste attrapé un 'petit coup de froid' hier.", 
        fc: 125, ta: "82/46", spo2: 90, fr: 26, temp: 39.5, dextro: 6.1, aspect: "Marbrures aux genoux, TRC > 4s, somnolence prononcée.",
        correctDiag: "Sepsis grave",
        lethalWrongDiags: ["Poussée de Lupus", "Surdosage en bêtabloquants"],
        
        rosHint: "Insistez auprès de la fille sur les jours précédant l'épisode, les personnes âgées cachent souvent leurs symptômes urinaires par gêne.",
        examHint: "Examinez les fosses lombaires (signe de Giordano) et l'état cutané pour grader le niveau de choc circulatoire.",
        investigationsHint: "Le diagnostic de choc est clinique et biologique (Lactates). La porte d'entrée nécessite un examen d'orientation immédiat au lit du patient (BU).",
        
        // Clone Full Code : Orientation attendue
        correctDisposition: "icu_admission", 
        dispositionsConfig: {
            "icu_admission": { label: "Hospitalisation en Réanimation Médicale ou USC", score: 5, rationale: "INDISPENSABLE : Le choc septique avec défaillance d'organe (rénale, neurologique) impose une surveillance monitorée continue en réanimation ou soins continus pour titration des catécholamines si nécessaire." },
            "admit_to_floor": { label: "Hospitalisation en service de Médecine Conventionnelle", score: -15, rationale: "FAUTE GRAVE : Installer un patient en état de choc circulatoire et hypoperfusion tissulaire dans un lit de médecine standard expose à un arrêt cardiorespiratoire non surveillé." },
            "prep_for_operating_room": { label: "Transfert immédiat au Bloc Opératoire", score: -5, rationale: "INADÉQUAT : Pas de dilatation des cavités rénales ni d'obstacle obstructif nécessitant une dérivation chirurgicale immédiate sur l'imagerie." },
            "discharge": { label: "Retour à domicile avec prescription d'antibiotiques", score: -40, rationale: "CRIMINEL : Pronostic vital engagé à court terme." }
        },

        usefulExams: {
            "exam_vias": { tier: 1, res: "Voies aériennes supérieures libres.", interpretation: "Aucun obstacle.", image: "vias_normal.jpg", justification: "Libres. Indispensable lors de l'évaluation initiale d'une détresse." },
            "exam_resp": { tier: 1, res: "Polypnée superficielle à 26/min.", interpretation: "Tachypnée sans signe de lutte.", image: "resp_polypnee.jpg", justification: "Objective la tachypnée, critère de dysfonction respiratoire lié au sepsis (qSOFA)." },
            "exam_circ": { tier: 1, res: "Pouls radial filant, TRC allongé à 4 secondes.", interpretation: "Signes nets d'hypoperfusion périphérique.", image: "circ_choc.jpg", justification: "Mise en évidence directe d'une insuffisance circulatoire aiguë." },
            "exam_back": { tier: 1, res: "Douleur vive déclenchée à la percussion de la fosse lombaire gauche.", interpretation: "Signe de Giordano positif à gauche.", image: "giordano_pos.jpg", justification: "Oriente vers une atteinte rénale (pyélonéphrite)." },
            "exam_skin": { tier: 1, res: "Marbrures violacées localisées aux genoux.", interpretation: "Marbrures score de mottling >= 2.", image: "mottling_genoux.jpg", justification: "Marqueur clinique de gravité extrême de l'insuffisance circulatoire." },
            "bu": { tier: 1, res: "Leucocytes +++, Nitrites +", interpretation: "Infection urinaire hautement probable.", image: "bu_sepsis.jpg", justification: "Confirme l'infection urinaire aiguë et la porte d'entrée." },
            "lactates": { tier: 1, res: "Lactatémie à 4.5 mmol/L.", interpretation: "Hyperlactatémie critique.", image: "lactates_high.jpg", justification: "Confirme l'hypoperfusion tissulaire périphérique (seuil Sepsis-3 > 2 mmol/L)." },
            "ecg": { tier: 1, res: "Tachycardie sinusale régulière à 125 bpm.", interpretation: "Tachycardie sinusale adaptative. Pas de trouble de repolarisation repérable.", image: "sinus_tachycardia.jpg", justification: "Élimine un trouble du rythme malin primaire ou un infarctus." },
            "radio_thorax": { tier: 2, res: "Champs pulmonaires libres, pas de foyer.", interpretation: "Pas de pneumopathie ni d'OAP.", image: "cxr_normal.jpg", justification: "Exclut le foyer pulmonaire mais non prioritaire d'emblée." },
            "hemocultures": { tier: 1, res: "Positives à Bacilles Gram Négatif (E. Coli).", interpretation: "Bactériémie à E. Coli confirmed.", image: "culture_gram_neg.jpg", justification: "Isole le germe causal avant de guider l'antibiothérapie définitive." },
            "ionogramme": { tier: 1, res: "Créatinine 155 µmol/L, Urée 14 mmol/L.", interpretation: "Insuffisance rénale aiguë.", image: "lab_renal.jpg", justification: "Révèle une insuffisance rénale aiguë fonctionnelle d'origine hémodynamique." },
            "lcr_num": { tier: 3, res: "Liquide clair, formule normale.", interpretation: "LCR normal.", image: "lcr_normal.jpg", justification: "FAUTE GRAVE : Ponction lombaire injustifiée et dangereuse sur un choc septique urologique." }
        }
    }
};

app.post('/api/start-case', (req, res) => {
    const { itemId } = req.body;
    const sc = ednScenarios[itemId] || ednScenarios["158"];
    activeSim = {
        itemId, 
        patient: { name: sc.name, type: sc.type, fc: sc.fc, ta: sc.ta, spo2: sc.spo2, fr: sc.fr, temp: sc.temp, dextro: sc.dextro, aspect: sc.aspect, desc: sc.desc },
        whiteboard: [], correctDiag: sc.correctDiag, lethalWrongDiags: sc.lethalWrongDiags, usefulExams: sc.usefulExams,
        rosHint: sc.rosHint, examHint: sc.examHint, investigationsHint: sc.investigationsHint,
        correctDisposition: sc.correctDisposition, dispositionsConfig: sc.dispositionsConfig, chosenDisposition: null,
        performedActions: [], score: 100, vicodinDoses: 3, revealedInterpretations: [],
        stabilizationItems: { iv_access: false, oxygen: false, monitoring: false }
    };
    res.json(activeSim);
});

// Route de Stabilisation d'Urgence (Geste systématiques)
app.post('/api/stabilize-action', (req, res) => {
    const { actionKey } = req.body;
    let outcome = "";
    let scoreMod = 0;
    let justification = "";

    if (actionKey === "peripheral_ivs") {
        if (!activeSim.stabilizationItems.iv_access) {
            activeSim.stabilizationItems.iv_access = true;
            scoreMod = 5;
            outcome = "Pose de deux voies veineuses périphériques (VVP) de bon calibre effectuée avec succès.";
            justification = "OBLIGATOIRE : L'installation d'un accès veineux sécurisé est la priorité absolue pour toute gestion d'une défaillance circulatoire aiguë permettant l'administration des macromolécules et des traitements injectables.";
        } else {
            outcome = "Les voies veineuses périphériques sont déjà en place.";
            justification = "Geste redondant.";
        }
    } 
    else if (actionKey === "oxygen") {
        activeSim.stabilizationItems.oxygen = true;
        activeSim.patient.spo2 = Math.min(100, activeSim.patient.spo2 + 6);
        activeSim.patient.fr = Math.max(14, activeSim.patient.fr - 4);
        scoreMod = 5;
        outcome = "Oxygénothérapie au masque à haute concentration (15L/min) initiée.";
        justification = "JUSTIFIÉ : L'oxygénation doit être optimisée pour maintenir une SpO2 > 94% en présence d'un état de choc avec polypnée réflectoire.";
    } 
    else if (actionKey === "monitoring") {
        activeSim.stabilizationItems.monitoring = true;
        scoreMod = 5;
        outcome = "Patient scopé (ECG continu, tensiomètre automatique, capteur SpO2 permanent installé).";
        justification = "INDISPENSABLE : Le monitorage cardiotocographique ou hémodynamique continu est obligatoire pour détecter tout trouble du rythme malin ou effondrement tensionnel brutal.";
    }

    if (scoreMod !== 0) {
        activeSim.score += scoreMod;
        activeSim.performedActions.push({ name: `Stabilisation: ${actionKey.toUpperCase()}`, tier: "Critique", status: 1, res: "Validé", justification: justification });
    }

    res.json({ activeSim, outcome, justification });
});

// Investigations
app.post('/api/investigate', (req, res) => {
    const { examKey } = req.body;
    let name = EXAM_CATALOG[examKey] || "Examen Inconnu";
    
    if (activeSim.usefulExams && activeSim.usefulExams[examKey]) {
        let match = activeSim.usefulExams[examKey];
        let tierLabel = match.tier === 1 ? "Critique" : match.tier === 2 ? "Optionnel" : "Faute";
        
        if (match.tier === 1) activeSim.score += 5;
        if (match.tier === 2) activeSim.score -= 3;
        if (match.tier === 3) activeSim.score -= 20;

        res.json({ examKey, name, success: match.tier !== 3, image: match.image, rawResult: match.res, activeSim });
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
    const { order } = req.body; let clean = order.toLowerCase(); let outcome = "Geste consigné.";
    if (clean.includes("remplissage") && activeSim.itemId === "158") {
        activeSim.patient.ta = "105/65"; activeSim.patient.fc = 105; activeSim.score += 10;
        outcome = "Remplissage vasculaire par 500ml de Cristalloïdes effectué.";
        activeSim.performedActions.push({ name: "Thérapeutique: Remplissage", tier: "Critique", status: 1, res: "TA 105/65", justification: "Restauration de la volémie efficace." });
    } else if (clean.includes("antibiothérapie") || clean.includes("antibiotique")) {
        activeSim.score += 10;
        outcome = "Injection d'une C3G IV probabiliste effectuée.";
        activeSim.performedActions.push({ name: "Thérapeutique: Antibiotiques", tier: "Critique", status: 1, res: "Administré", justification: "Traitement étiologique urgent du sepsis." });
    }
    res.json({ activeSim, outcome });
});

app.post('/api/interrogate', (req, res) => { res.json({ activeSim, outcome: "[Anamnèse] Sa fille avoue des brûlures urinaires négligées.", hessQuote: "Dr Hess : Intéressant." }); });
app.post('/api/search-home', (req, res) => { res.json({ activeSim, outcome: "[Perquisition] Présence de protections urinaires usagées.", hessQuote: "Dr Hess : Foyer urinaire en vue." }); });
app.post('/api/whiteboard/add', (req, res) => { activeSim.whiteboard.push(req.body.hypothesis); res.json({ activeSim, feedback: "Épinglé." }); });

// Route de Diagnostic Final Combinée avec la disposition de triage (Clone Strict)
app.post('/api/diagnose', (req, res) => {
    const { hypothesis, dispositionKey } = req.body;
    
    let config = activeSim.dispositionsConfig[dispositionKey];
    activeSim.score += config ? config.score : -20;
    
    let correctDiagMatched = hypothesis.toLowerCase().includes(activeSim.correctDiag.toLowerCase());
    let finalNote = correctDiagMatched ? Math.round(activeSim.score / 5) : 4;
    
    if (finalNote > 20) finalNote = 20;
    if (finalNote < 0) finalNote = 0;

    // Injecter la disposition dans le débriefing final
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
app.listen(PORT, () => console.log("Clone Engine Full Code Online."));
