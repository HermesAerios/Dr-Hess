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
        
        // Système de Hints segmentés (Style Full Code)
        rosHint: "Insistez auprès de la fille sur les jours précédant l'épisode, les personnes âgées cachent souvent leurs symptômes urinaires par gêne.",
        examHint: "Examinez les fosses lombaires (signe de Giordano) et l'état cutané pour grader le niveau de choc circulatoire.",
        investigationsHint: "Le diagnostic de choc est clinique et biologique (Lactates). La porte d'entrée nécessite un examen d'orientation immédiat au lit du patient (BU).",
        
        usefulExams: {
            "exam_vias": { tier: 1, res: "Voies aériennes supérieures libres.", interpretation: "Aucun obstacle.", image: "vias_normal.jpg", justification: "Systématique lors de l'évaluation initiale d'une détresse." },
            "exam_resp": { tier: 1, res: "Polypnée superficielle à 26/min.", interpretation: "Tachypnée sans signe de lutte.", image: "resp_polypnee.jpg", justification: "Objective la tachypnée, critère de dysfonction respiratoire lié au sepsis (qSOFA)." },
            "exam_circ": { tier: 1, res: "Pouls radial filant, TRC allongé à 4 secondes.", interpretation: "Signes nets d'hypoperfusion périphérique.", image: "circ_choc.jpg", justification: "Mise en évidence directe d'une insuffisance circulatoire aiguë." },
            "exam_back": { tier: 1, res: "Douleur vive déclenchée à la percussion de la fosse lombaire gauche.", interpretation: "Signe de Giordano positif à gauche.", image: "giordano_pos.jpg", justification: "Oriente vers une atteinte rénale (pyélonéphrite)." },
            "exam_skin": { tier: 1, res: "Marbrures violacées localisées aux genoux.", interpretation: "Marbrures score de mottling >= 2.", image: "mottling_genoux.jpg", justification: "Marqueur clinique de gravité extrême de l'insuffisance circulatoire." },
            "bu": { tier: 1, res: "Leucocytes +++, Nitrites +", interpretation: "Infection urinaire hautement probable.", image: "bu_sepsis.jpg", justification: "Confirme l'infection urinaire aiguë et la porte d'entrée." },
            "lactates": { tier: 1, res: "Lactatémie à 4.5 mmol/L.", interpretation: "Hyperlactatémie critique.", image: "lactates_high.jpg", justification: "Confirme l'hypoperfusion tissulaire périphérique (seuil Sepsis-3 > 2 mmol/L)." },
            "ecg": { tier: 1, res: "Tachycardie sinusale régulière à 125 bpm.", interpretation: "Tachycardie sinusale adaptative. Pas de trouble de repolarisation repérable.", image: "sinus_tachycardia.jpg", justification: "Élimine un trouble du rythme malin primaire ou un infarctus." },
            "radio_thorax": { tier: 2, res: "Champs pulmonaires libres, pas de foyer.", interpretation: "Pas de pneumopathie ni d'OAP.", image: "cxr_normal.jpg", justification: "Exclut le foyer pulmonaire mais non prioritaire d'emblée." },
            "hemocultures": { tier: 1, res: "Positives à Bacilles Gram Négatif (E. Coli).", interpretation: "Bactériémie à E. Coli confirmée.", image: "culture_gram_neg.jpg", justification: "Isole le germe causal avant de guider l'antibiothérapie définitive." },
            "ionogramme": { tier: 1, res: "Créatinine 155 µmol/L, Urée 14 mmol/L.", interpretation: "Insuffisance rénale aiguë.", image: "lab_renal.jpg", justification: "Révèle une insuffisance rénale aiguë fonctionnelle d'origine hémodynamique." },
            "lcr_num": { tier: 3, res: "Liquide clair, formule normale.", interpretation: "LCR normal.", image: "lcr_normal.jpg", justification: "FAUTE GRAVE : Ponction lombaire injustifiée et dangereuse sur un choc septique urologique." }
        }
    }
};

// Start Case
app.post('/api/start-case', (req, res) => {
    const { itemId } = req.body;
    const sc = ednScenarios[itemId] || ednScenarios["158"];
    activeSim = {
        itemId, patient: { name: sc.name, type: sc.type, fc: sc.fc, ta: sc.ta, spo2: sc.spo2, fr: sc.fr, temp: sc.temp, dextro: sc.dextro, aspect: sc.aspect, desc: sc.desc },
        whiteboard: [], correctDiag: sc.correctDiag, lethalWrongDiags: sc.lethalWrongDiags, usefulExams: sc.usefulExams,
        rosHint: sc.rosHint, examHint: sc.examHint, investigationsHint: sc.investigationsHint,
        performedActions: [], score: 100, vicodinDoses: 3, revealedInterpretations: []
    };
    res.json(activeSim);
});

// Route d'Investigations Modifiée (Style Full Code avec Visuals)
app.post('/api/investigate', (req, res) => {
    const { examKey } = req.body;
    let name = EXAM_CATALOG[examKey] || "Examen Inconnu";
    
    if (activeSim.usefulExams && activeSim.usefulExams[examKey]) {
        let match = activeSim.usefulExams[examKey];
        let tierLabel = match.tier === 1 ? "Critique" : match.tier === 2 ? "Optionnel" : "Faute";
        
        if (match.tier === 1) activeSim.score += 5;
        if (match.tier === 2) activeSim.score -= 3;
        if (match.tier === 3) activeSim.score -= 20;

        // On n'inclut pas encore la justification brute, le joueur doit l'interpréter graphiquement
        res.json({ 
            examKey, name, success: match.tier !== 3,
            image: match.image, rawResult: match.res, // Données pour l'UI
            activeSim 
        });
    } else {
        activeSim.score -= 5;
        res.json({ 
            examKey, name, success: false,
            image: "normal_generic.jpg", rawResult: "Résultats physiologiques ou normaux.",
            activeSim
        });
    }
});

// Demander l'interprétation officielle (Coûte des points)
app.post('/api/reveal-interpretation', (req, res) => {
    const { examKey } = req.body;
    let match = activeSim.usefulExams[examKey];
    activeSim.score -= 2; // Malus de consultation d'aide secondaire
    
    let interp = match ? match.interpretation : "Examen normal, sans particularité étiologique.";
    let justif = match ? match.justification : "Non contributif pour ce cas.";
    
    // Enregistrer dans l'historique final pour le débriefing
    let name = EXAM_CATALOG[examKey] || examKey;
    activeSim.performedActions.push({ 
        name, tier: match ? (match.tier === 1 ? "Critique" : "Optionnel") : "Inutile", 
        status: match ? match.tier : 2, res: match ? match.res : "Normal", justification: justif 
    });

    res.json({ interpretation: interp, justification: justif, score: activeSim.score });
});

// Demander un Hint spécifique au Dr Hess
app.post('/api/get-hint', (req, res) => {
    const { type } = req.body;
    activeSim.score -= 3; // Coûte des points sur le debriefing final
    let hintText = activeSim[type] || "Hess hausse les épaules : 'Réfléchissez un peu.'";
    res.json({ hint: hintText, score: activeSim.score });
});

// Les autres routes restent identiques pour préserver les acquis fonctionnels
app.post('/api/execute', (req, res) => {
    const { order } = req.body; let clean = order.toLowerCase(); let outcome = "Ordre enregistré.";
    if (clean.includes("oxygène")) { activeSim.patient.spo2 = 98; outcome = "Oxygénothérapie efficace."; activeSim.performedActions.push({ name: "Oxygène", tier: "Critique", status: 1, res: "SpO2 stabilisée à 98%", justification: "Maintien de l'oxygénation tissulaire basale." }); }
    else if (clean.includes("remplissage")) { activeSim.patient.ta = "105/65"; outcome = "Remplissage vasculaire effectué."; activeSim.performedActions.push({ name: "Remplissage", tier: "Critique", status: 1, res: "TA 105/65", justification: "Restauration de la volémie." }); }
    res.json({ activeSim, outcome });
});
app.post('/api/interrogate', (req, res) => { res.json({ activeSim, outcome: "[Anamnèse] Sa fille avoue des brûlures urinaires négligées.", hessQuote: "Dr Hess : Intéressant." }); });
app.post('/api/search-home', (req, res) => { res.json({ activeSim, outcome: "[Perquisition] Présence de protections urinaires usagées.", hessQuote: "Dr Hess : Foyer urinaire en vue." }); });
app.post('/api/whiteboard/add', (req, res) => { activeSim.whiteboard.push(req.body.hypothesis); res.json({ activeSim, feedback: "Épinglé." }); });
app.post('/api/diagnose', (req, res) => {
    let finalNote = req.body.hypothesis.toLowerCase().includes(activeSim.correctDiag.toLowerCase()) ? Math.round(activeSim.score / 5) : 4;
    res.json({ finalNote, correctAnswer: activeSim.correctDiag, actionsHistory: activeSim.performedActions });
});
app.get('/api/get-current-sim', (req, res) => { res.json(activeSim); });
app.listen(PORT, () => console.log("Moteur Full-Code synchronisé."));
