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
    // === EXAMEN CLINIQUE (A-B-C-D-E) ===
    "exam_vias": "Examen Airway / Liberté des voies aériennes",
    "exam_resp": "Examen Breathing / Respiration & Auscultation pulmonaire d'urgence",
    "exam_circ": "Examen Circulation / Pouls, TRC, hémodynamique globale",
    "exam_neuro": "Examen Disability / Glasgow, pupilles & orientation rapide",
    "exam_skin": "Examen Exposure / Peau nue, recherche de purpura et lésions",
    
    // === SYSTEMIQUE ===
    "exam_cardio": "Auscultation cardiovasculaire avancée",
    "exam_pulm": "Auscultation pleuropulmonaire exhaustive",
    "exam_abd": "Palpation et auscultation abdominale",
    "exam_neuro_comp": "Examen neurologique complet (moteur, sensitif, paires crâniennes)",
    "exam_back": "Palpation rachidienne & percussion des fosses lombaires (Giordano)",
    "exam_gu": "Examen gynéco-obstétrical (Spéculum / Toucher vaginal)",
    "exam_psych": "Évaluation de l'état mental et comportemental",

    // === BIOLOGIE : HEMATOLOGIE & HEMOSTASE ===
    "nfs": "Numération Formule Sanguine (NFS / Hémogramme complet)",
    "frottis_sanguin": "Frottis sanguin sur lame (recherche de schizocytes/parasites)",
    "hemostase": "Bilan d'hémostase standard (TP, TCA, INR)",
    "fibrinogene": "Dosage pondéral du fibrinogène",
    "ddimeres": "Dosage des D-Dimères",
    "pdf_fm": "Produits de Dégradation de la Fibrine (PDF) & Complexes solubles",

    // === BIOLOGIE : GAZOMÉTRIE & LACTATES ===
    "gds": "Gaz du sang artériel (GDS) avec pH, PaO2, PaCO2, HCO3-",
    "lactates": "Lacticémie artérielle (Lactates)",

    // === BIOLOGIE : BIOCHIMIE, ÉLECTROLYTES & REINS ===
    "ionogramme": "Ionogramme sanguin standard (Sodium, Potassium, Chlore, Urée)",
    "creatininemie": "Créatininémie & Clairance de la créatinine (DFG)",
    "calcemie_ion": "Calcémie ionisée",
    "calcemie_tot": "Calcémie totale",
    "magnesemie": "Dosage de la magnésémie",
    "phosphatemie": "Dosage de la phosphorémie",
    "lipasemie": "Dosage de la lipasémie",
    "amylasemie": "Dosage de l'amylasémie",
    "bilan_hepatique": "Bilan hépatique complet (ASAT, ALAT, PAL, Bilirubine libre/conjuguée, LDH)",

    // === BIOLOGIE : ENDOCRINOLOGIE & METABOLISME ===
    "hgt": "Glycémie capillaire instantanée au lit du patient (Fingerstick)",
    "glycemie_veineuse": "Glycémie veineuse à jeun",
    "tsh": "Dosage de la TSH ultra-sensible",

    // === BIOLOGIE : TOXICOLOGIE & DOSAGES ===
    "tox_urinaire": "Dépistage toxicologique urinaire multi-drogues",
    "paracetamol": "Dosage plasmatique du paracétamol (Paracétamolémie)",
    "salicyles": "Dosage plasmatique des salicylés",
    "alcoolemie": "Dosage de l'alcoolémie veineuse (EtOH)",

    // === BIOLOGIE : INFECTIOLOGIE & URINES ===
    "bu": "Bandelette Urinaire (BU) qualitative d'urgence",
    "ecbu": "Examen Cyto-Bactériologique des Urines (ECBU) avec sédiment",
    "hemocultures": "Hémocultures (2 paires : flacons aérobies / anaérobies)",
    "prelevement_vaginal": "Prélèvement vaginal microbiologique",
    "test_covid": "Test PCR Rapide Grippe / COVID / VRS",

    // === AUTRES BIOLOGIES ===
    "beta_hcg": "Dosage plasmatique quantitatif de la bêta-hCG",
    "groupage_rai": "Groupage sanguin (2 déterminations), phénotype Rh-Kell & RAI",

    // === EXPLORATIONS FONCTIONNELLES & IMAGERIE ===
    "ecg": "Électrocardiogramme (ECG) 12 dérivations",
    "radio_thorax": "Radiographie du thorax de face (lit ou debout)",
    "asp": "Radiographie de l'Abdomen Sans Préparation (ASP)",
    "radio_bassin": "Radiographie du bassin de face",
    "tdm_cerveau": "Tomodensitométrie (TDM) cérébrale sans injection",
    "tdm_rachis_cervical": "TDM du rachis cervical",
    "angio_tdm_pulm": "Angio-TDM pulmonaire (recherche d'embolie pulmonaire)",
    "angio_tdm_aorte": "Angio-TDM de l'aorte thoracique et abdominale",
    "tdm_tap": "TDM Thoraco-Abdomino-Pelvienne (TAP)",
    "echo_fast": "Échographie ciblée de traumatologie (E-FAST)",
    "echo_coeur_foc": "Échographie cardiaque focalisée au lit du patient (POCUS)",
    "echo_obstetricale": "Échographie obstétricale de contrôle avec Doppler",
    "irm_cerebrale": "Imagerie par Résonance Magnétique (IRM) cérébrale"
};

// ROUTE DYNAMIQUE SÉCURISÉE : Scanne le dossier /cases et ignore les fichiers corrompus
app.get('/api/available-cases', (req, res) => {
    const casesFolder = path.join(__dirname, 'cases');
    
    // Si le dossier n'existe pas, on le crée
    if (!fs.existsSync(casesFolder)) {
        fs.mkdirSync(casesFolder);
    }

    fs.readdir(casesFolder, (err, files) => {
        if (err) {
            console.error("Erreur de lecture du dossier /cases:", err);
            return res.status(500).json({ error: "Impossible de lire le dossier des cas." });
        }
        
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        const dynamicList = [];

        jsonFiles.forEach(file => {
            try {
                const rawData = fs.readFileSync(path.join(casesFolder, file), 'utf8');
                const parsed = JSON.parse(rawData);
                dynamicList.push({
                    itemId: parsed.itemId,
                    displayName: parsed.displayName || parsed.correctDiag || "Cas sans nom",
                    fileName: file
                });
            } catch (jsonErr) {
                // Si un fichier JSON est mal écrit, on l'affiche dans les logs du serveur mais on ne bloque pas l'application !
                console.error(`⚠️ Fichier JSON corrompu ou mal structuré [${file}]:`, jsonErr.message);
            }
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
