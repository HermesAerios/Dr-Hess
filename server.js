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

app.get('/api/available-cases', (req, res) => {
    const casesFolder = path.join(__dirname, 'cases');
    if (!fs.existsSync(casesFolder)) fs.mkdirSync(casesFolder);
    fs.readdir(casesFolder, (err, files) => {
        if (err) return res.status(500).json({ error: "Erreur de lecture." });
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        const dynamicList = jsonFiles.map(file => {
            const parsed = JSON.parse(fs.readFileSync(path.join(casesFolder, file)));
            return { itemId: parsed.itemId, displayName: parsed.displayName || parsed.type };
        });
        res.json(dynamicList);
    });
});

app.post('/api/start-case', (req, res) => {
    const { itemId } = req.body;
    const filePath = path.join(__dirname, 'cases', `${itemId}.json`);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Introuvable." });

    const matrix = JSON.parse(fs.readFileSync(filePath));

    // Initialisation par défaut
    let patientInstance = {};
    
    // Si c'est une matrice adaptative, on pioche un profil au hasard
    if (matrix.isMatrix && matrix.possibleProfiles && matrix.possibleProfiles.length > 0) {
        const randomIndex = Math.floor(Math.random() * matrix.possibleProfiles.length);
        const profile = matrix.possibleProfiles[randomIndex];
        
        patientInstance = {
            name: profile.name,
            type: matrix.patient ? matrix.patient.type : "Syndrome infectieux / Choc suspect",
            status: "Détresse Initiale",
            fc: profile.baseVitals.fc,
            ta: profile.baseVitals.ta,
            spo2: profile.baseVitals.spo2,
            fr: profile.baseVitals.fr,
            temp: profile.baseVitals.temp,
            dextro: profile.baseVitals.dextro,
            aspect: profile.aspect,
            desc: `Admis(e) pour évaluation d'une défaillance aiguë. Terrain : ${profile.terrain} Histoire : ${profile.secret}`
        };
    } else {
        // Fallback si fichier classique non matriciel
        patientInstance = sc.patient;
    }

    activeSim = {
        itemId: matrix.itemId,
        patient: patientInstance,
        whiteboard: [],
        correctDiag: matrix.correctDiag,
        lethalWrongDiags: matrix.lethalWrongDiags,
        usefulExams: matrix.matrixExams || matrix.usefulExams, // Adapte les examens selon la matrice
        mandatoryExamsToRuleOut: matrix.mandatoryExamsToRuleOut || [],
        ruledOutExams: [],
        correctDisposition: matrix.correctDisposition,
        dispositionsConfig: matrix.dispositionsConfig,
        performedActions: [],
        score: 100,
        virtualMinutesElapsed: 0,
        vicodinDoses: 3,
        stabilizationItems: { iv_access: false, oxygen: false, monitoring: false },
        completedExams: []
    };

    res.json(activeSim);
});

// Axe 1 : Logique de dégradation clinique en fonction de la latence de l'action (costTime)
function progressVirtualTime(minutes) {
    activeSim.virtualMinutesElapsed += minutes;
    
    // Si le patient est étiqueté comme critique et instable, le temps qui passe dégrade ses fonctions vitales
    if (activeSim.patient.isCritical) {
        if (!activeSim.stabilizationItems.iv_access && !activeSim.stabilizationItems.oxygen) {
            // Pas de réanimation commencée = effondrement rapide
            activeSim.patient.fc = Math.min(160, activeSim.patient.fc + Math.round(minutes * 1.5));
            let taParts = activeSim.patient.ta.split('/');
            let sys = Math.max(50, parseInt(taParts[0]) - Math.round(minutes * 1.2));
            let dia = Math.max(30, parseInt(taParts[1]) - Math.round(minutes * 0.8));
            activeSim.patient.ta = `${sys}/${dia}`;
            activeSim.patient.spo2 = Math.max(70, activeSim.patient.spo2 - Math.round(minutes * 0.7));
            activeSim.score -= Math.round(minutes * 0.5); // Perte de points par retard de prise en charge
        }
    }
}

app.post('/api/stabilize-action', (req, res) => {
    const { actionKey } = req.body;
    let outcome = "";
    let justification = "";
    
    progressVirtualTime(2); // Poser un geste prend 2 minutes virtuelles

    if (actionKey === "peripheral_ivs") {
        activeSim.stabilizationItems.iv_access = true;
        outcome = "Pose de deux VVP de gros calibre complétée.";
        justification = "L'accès veineux est prioritaire pour guider les thérapeutiques d'urgence hémodynamiques.";
    } else if (actionKey === "oxygen") {
        activeSim.stabilizationItems.oxygen = true;
        activeSim.patient.spo2 = Math.min(100, activeSim.patient.spo2 + 8);
        outcome = "Oxygénothérapie haut débit initiée.";
        justification = "Optimise le transport tissulaire en oxygène.";
    } else if (actionKey === "monitoring") {
        activeSim.stabilizationItems.monitoring = true;
        outcome = "Scope cardioscopique et oxymétrie de pouls connectés.";
        justification = "Indispensable pour traquer l'apparition de complications rythmiques.";
    }

    res.json({ activeSim, outcome, justification });
});

app.post('/api/investigate', (req, res) => {
    const { examKey } = req.body;
    let name = EXAM_CATALOG[examKey] || "Examen Inconnu";
    
    // Axe 1 : Récupérer le coût en temps réel du fichier de cas (par défaut 5 min pour la bio, 20 min pour l'imagerie)
    let cost = 5;
    if (examKey.startsWith("exam_")) cost = 1;
    if (examKey === "tdm_abdomen" || examKey === "angio_scanner") cost = 30; // Un scanner prend 30 min !

    progressVirtualTime(cost);

    if (activeSim.usefulExams && activeSim.usefulExams[examKey]) {
        let match = activeSim.usefulExams[examKey];
        
        // Axe 2 : Enregistrer que l'examen a été physiquement complété
        if (!activeSim.completedExams.includes(examKey)) activeSim.completedExams.push(examKey);
        // Axe 3 : Enregistrer l'élimination des diagnostics différentiels obligatoires
        if (activeSim.mandatoryExamsToRuleOut.includes(examKey) && !activeSim.ruledOutExams.includes(examKey)) {
            activeSim.ruledOutExams.push(examKey);
        }

        if (match.tier === 1) activeSim.score += 5;
        if (match.tier === 2) activeSim.score -= 3;
        if (match.tier === 3) activeSim.score -= 20;

        res.json({ examKey, name, success: match.tier !== 3, image: match.image || "normal.jpg", rawResult: match.res, minutesSpent: cost, activeSim });
    } else {
        activeSim.score -= 5;
        res.json({ examKey, name, success: false, image: "normal_generic.jpg", rawResult: "Résultats physiologiques normaux.", minutesSpent: cost, activeSim });
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

// Axe 2 : Contrôle des contre-indications croisées et pré-requis d'examens (fileDependencies)
app.post('/api/execute', (req, res) => {
    const { order } = req.body;
    let clean = order.toLowerCase();
    let outcome = "";
    let isWrongGeste = false;

    progressVirtualTime(3);

    // Exemple de pré-requis universel : Traiter une chorioamniotite (Cas 24) ou une pyélonéphrite obstructive (Cas 265) 
    // nécessite d'avoir fait les prélèvements microbiologiques (Hémocultures/BU) AVANT d'injecter les antibiotiques, sous peine de masquer les cultures.
    if (clean.includes("antibio") || clean.includes("ceftriaxone")) {
        if (activeSim.itemId === "158" && !activeSim.completedExams.includes("hemocultures")) {
            activeSim.score -= 15;
            isWrongGeste = true;
            outcome = "[FAUTE LOURDE HÔPITAL] Vous injectez l'antibiothérapie avant d'avoir réalisé les hémocultures obligatoires ! Vous venez de stériliser les prélèvements et de saboter l'identification bactérienne ultérieure.";
        } else {
            activeSim.score += 10;
            outcome = "Injection de l'antibiothérapie parentérale large spectre effectuée.";
        }
    } 
    // Exemple 2 : Si le joueur fait un remplissage massif sur un patient suspect d'infarctus ou d'insuffisance cardiaque sans imagerie pulmonaire/écho préalable.
    else if (clean.includes("remplissage")) {
        if (activeSim.itemId === "158") {
            activeSim.patient.ta = "105/65"; activeSim.patient.fc = 105; activeSim.score += 10;
            outcome = "Remplissage par Cristalloïdes efficace : restauration volémique complétée.";
        } else {
            activeSim.score -= 15;
            outcome = "Remplissage effectué à tort : surcharge ventriculaire induite (risque d'OAP).";
        }
    } else {
        outcome = `Ordre clinique consigné : "${order}".`;
    }

    activeSim.performedActions.push({
        name: `Traitement : ${order}`,
        tier: isWrongGeste ? "Faute" : "Justifié",
        status: isWrongGeste ? 3 : 1,
        res: outcome,
        justification: isWrongGeste ? "Contre-indication ou non-respect de l'arborescence des soins." : "Conforme aux protocoles d'urgence."
    });

    res.json({ activeSim, outcome });
});

app.post('/api/get-hint', (req, res) => {
    activeSim.score -= 3;
    let hintText = activeSim[req.body.type] || "Hess : 'Utilisez votre logique.'";
    res.json({ hint: hintText, score: activeSim.score });
});

app.post('/api/whiteboard/add', (req, res) => {
    activeSim.whiteboard.push(req.body.hypothesis);
    res.json({ activeSim, feedback: "Hypothèse notée au tableau." });
});

app.post('/api/diagnose', (req, res) => {
    const { hypothesis, dispositionKey } = req.body;
    let config = activeSim.dispositionsConfig[dispositionKey];
    
    // Axe 3 : Contrôle de l'élimination des diagnostics différentiels obligatoires (stroke mimics / hypoglycémie)
    let missedDifferentialFault = false;
    activeSim.mandatoryExamsToRuleOut.forEach(reqExam => {
        if (!activeSim.completedExams.includes(reqExam)) {
            missedDifferentialFault = true;
        }
    });

    if (missedDifferentialFault) activeSim.score -= 25; // Lourde pénalité docimologique ECN
    activeSim.score += config ? config.score : -20;
    
    let correctDiagMatched = hypothesis.toLowerCase().includes(activeSim.correctDiag.toLowerCase());
    let finalNote = (correctDiagMatched && !missedDifferentialFault) ? Math.round(activeSim.score / 5) : 4;
    
    if (finalNote > 20) finalNote = 20;
    if (finalNote < 0) finalNote = 0;

    activeSim.performedActions.push({
        name: `Vérification Diagnostics Différentiels Obligatoires`,
        tier: missedDifferentialFault ? "Faute" : "Critique",
        status: missedDifferentialFault ? 3 : 1,
        res: missedDifferentialFault ? "Piège non éliminé !" : "Tous les diagnostics mimes ont été écartés réglementairement.",
        justification: missedDifferentialFault ? "FAUTE LOURDE EDN : Vous avez validé votre rapport sans avoir éliminé le diagnostic mime obligatoire au lit du patient (ex: éliminer une hypoglycémie devant un trouble de conscience ou un déficit focalisé) !" : "Rigueur d'analyse parfaite."
    });

    res.json({ finalNote, correctAnswer: activeSim.correctDiag, actionsHistory: activeSim.performedActions });
});

app.get('/api/get-current-sim', (req, res) => { res.json(activeSim); });
app.listen(PORT, () => console.log("Moteur Full Code V2 déployé avec succès."));
