const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let activeSim = {};

// CATALOGUE UNIVERSEL ET EXHAUSTIF DES EXAMENS (Captures 1000020296 à 1000020307)
const EXAM_CATALOG = {
    // 1. EXAMENS PHYSIQUES
    "exam_vias": "Examen des voies aériennes supérieures (liberté des voies)",
    "exam_resp": "Examen de la respiration / ventilation",
    "exam_circ": "Examen circulatoire (hémodynamique, pouls, temps de recoloration cutanée)",
    "exam_head": "Examen Tête, Yeux, Oreilles, Nez, Gorge",
    "exam_neck": "Examen du cou (souplesse, thyroïde, aires ganglionnaires)",
    "exam_cardio": "Examen cardiovasculaire (auscultation cardiaque, recherche d'œdèmes)",
    "exam_pulm": "Examen pulmonaire / pleuropulmonaire (auscultation)",
    "exam_abd": "Examen abdominal (palpation, percussion, inspection)",
    "exam_gu": "Examen génito-urinaire",
    "exam_back": "Examen du dos et des flancs (recherche d'une douleur à la percussion lombaire)",
    "exam_loco": "Examen de l'appareil locomoteur / musculosquelettique",
    "exam_skin": "Examen cutané (recherche d'éruptions, purpura, lésions)",
    "exam_neuro": "Examen neurologique complet",
    "exam_psych": "Examen psychiatrique / état psychologique",

    // 2. TESTS AU LIT & ECHOGRAPHIES CIBLÉES
    "ecg": "Électrocardiogramme (ECG)",
    "hgt": "Glycémie capillaire (au bout du doigt)",
    "dep": "Mesure du débit expiratoire de pointe (DEP)",
    "echo_aorte": "Échographie de l'aorte",
    "echo_coeur_foc": "Échographie cardiaque focalisée",
    "echo_fast": "Échographie FAST (recherche d'épanchement intrapéritonéal ou péricardique)",
    "echo_tvp": "Échographie veineuse des membres inférieurs (recherche de TVP)",
    "echo_pulm": "Échographie pleuropulmonaire",
    "echo_renal": "Échographie rénale et des voies urinaires",
    "echo_hépato": "Échographie du quadrant supérieur droit / de l'hypochondre droit (foie, vésicule, voies biliaires)",
    "echo_mou": "Échographie des tissus mous",

    // 3. EXAMENS BIOLOGIQUES (LABORATOIRE)
    "gds": "Gaz du sang artériel (GDS)",
    "ionogramme": "Ionogramme sanguin standard (Sodium, Potassium, Chlore, Bicarbonates, Urée, Créatinine, Glucose)",
    "groupage_rai": "Groupage sanguin et Recherche d'Anticorps Irréguliers (RAI)",
    "calcemie_ion": "Calcémie ionisée",
    "calcemie_tot": "Calcémie totale",
    "hemostase": "Bilan de l'hémostase / coagulation (TP, TCA, INR)",
    "nfs": "Numération Formule Sanguine (NFS) / Hémogramme",
    "ddimeres": "D-Dimères",
    "lactates": "Lactates sanguins",
    "lipasemie": "Lipasémie",
    "bilan_hepatique": "Bilan hépatique complet (ASAT, ALAT, PAL, Bilirubine, GGT)",
    "magnesemie": "Dosage du magnésium (Magnésémie)",
    "phosphatemie": "Dosage du phosphore (Phosphatémie)",
    "probnp": "pro-BNP (Peptide natriurétique)",
    "troponine_t": "Troponine T",
    "paracetamol": "Dosage du paracétamol (Acétaminophénémie)",
    "amylasemie": "Amylasémie",
    "crp": "Protéine C-Réactive (CRP)",
    "cpk": "Créatine Kinase (CK / CPK)",
    "alcoolemie": "Alcoolémie / Dosage de l'éthanol",
    "hemocultures": "Hémocultures (2 flacons/prélèvements)",
    "analyse_urine": "Analyse d'urine (bandelette urinaire / sédiment)",
    
    // LIQUIDE CÉPHALO-RACHIEN (LCR)
    "lcr_num": "Numération cellulaire du LCR (Cytologie)",
    "lcr_glyco": "Glycorachie (glucose dans le LCR)",
    "lcr_gram": "Coloration de Gram sur le LCR (recherche directe de bactéries)",
    "lcr_proteino": "Protéinorachie (protéines dans le LCR)"
};

// Base de données des scénarios EDN
const ednScenarios = {
    "158": { 
        name: "Mme Joly, 74 ans", 
        type: "Choc septique d'origine urinaire (Item 158)",
        desc: "Trouvée désorientée chez elle. Fièvre majeure, frissons. Sa fille prétend qu'elle a juste attrapé un 'petit coup de froid' hier.", 
        fc: 125, ta: "82/46", spo2: 90, fr: 26, temp: 39.5, dextro: 6.1, aspect: "Marbrures aux genoux, TRC > 4s, somnolence prononcée.",
        correctDiag: "Sepsis grave",
        lethalWrongDiags: ["Poussée de Lupus", "Surdosage en bêtabloquants"],
        interrogateEffect: (sim) => {
            if (!sim.liesDiscovered) {
                sim.liesDiscovered = true;
                sim.patient.fc = 138; sim.patient.ta = "72/40"; sim.score -= 5;
                return {
                    outcome: "[CRASH CLINIQUE] En insistant agressivement, la patiente s'effondre. Sa fille avoue : 'Elle avait des brûlures urinaires atroces depuis 4 jours mais refusait les antibiotiques !'",
                    hess: "Dr Hess : Félicitations Sherlock, vous avez fait cracher le morceau à la gamine, mais sa tension s'effondre. Remplissez-moi ce lit de macromolécules !"
                };
            }
            return { outcome: "[Anamnèse] Patiente obnubilée, aucune réponse possible.", hess: "Dr Hess : Elle glisse vers le coma. Laissez-la souffler." };
        },
        searchEffect: (sim) => {
            if (!sim.searchedHome) {
                sim.searchedHome = true; sim.score += 10;
                return {
                    outcome: "[Perquisition] Votre externe trouve des protections urinaires souillées de sang et une boîte de paracétamol vide dans sa poubelle.",
                    hess: "Dr Hess : La porte d'entrée est urinaire, l'infection a colonisé le sang. C'est une urosepsis (Item 158)."
                };
            }
            return { outcome: "[Perquisition] Aucun autre élément.", hess: "Dr Hess : Vous perdez votre temps." };
        },
        epiphany: "Les marbrures, la fièvre, la confusion, l'hypotension persistante... Ce n'est pas une panne de pompe, c'est la tuyauterie systémique qui s'effondre sous l'effet des endotoxines bactériennes ! Ciblez le foyer urinaire.",
        usefulExams: {
            "exam_vias": { tier: 1, res: "Voies aériennes supérieures libres, pas d'encombrement.", justification: "Examen initial systématique en réanimation (Airway)." },
            "exam_resp": { tier: 1, res: "Polypnée superficielle à 26/min, pas de tirage.", justification: "Évalue le retentissement respiratoire du sepsis (critère qSOFA)." },
            "exam_circ": { tier: 1, res: "Pouls radial filant, tachycardie à 125 bpm, temps de recoloration cutanée (TRC) allongé à 4 secondes.", justification: "Mise en évidence directe d'une insuffisance circulatoire aiguë." },
            "exam_abd": { tier: 1, res: "Abdomen souple, dépressible, sensibilité diffuse sans défense.", justification: "Élimine une urgence chirurgicale abdominale d'emblée." },
            "exam_back": { tier: 1, res: "Douleur vive déclenchée à la percussion de la fosse lombaire gauche.", justification: "Signe clinique de pyélonéphrite aiguë homolatérale." },
            "exam_skin": { tier: 1, res: "Marbrures violacées localisées aux genoux. Pas de purpura.", justification: "Évalue la sévérité du choc (reflet de la dysfonction microvasculaire)." },
            "analyse_urine": { tier: 1, res: "Bandelette urinaire : Leucocytes +++, Nitrites +, pas de protéinurie.", justification: "INDISPENSABLE (Item 158) : Confirme l'infection urinaire aiguë et la porte d'entrée." },
            "lactates": { tier: 1, res: "Lactatémie à 4.5 mmol/L.", justification: "CRITIQUE : Confirme l'hypoperfusion tissulaire périphérique (seuil Sepsis-3 > 2 mmol/L)." },
            "hemocultures": { tier: 1, res: "Positives à Bacilles Gram Négatif (E. Coli).", justification: "OBLIGATOIRE : Isole le germe causal avant de guider l'antibiothérapie définitive." },
            "ionogramme": { tier: 1, res: "Sodium 138 mmol/L, Potassium 4.6 mmol/L, Créatinine 155 µmol/L, Urée 14 mmol/L.", justification: "INDISPENSABLE : Révèle une insuffisance rénale aiguë fonctionnelle liée à l'hypoperfusion." },
            "gds": { tier: 1, res: "Acidose métabolique sévère (pH 7.28, HCO3- 15 mmol/L).", justification: "UTILE : Indique la sévérité biologique de la défaillance métabolique." },
            "nfs": { tier: 1, res: "Hyperleucocytose à 19 000/mm3 à polynucléaires neutrophiles.", justification: "UTILE : Signe la réponse inflammatoire systémique d'origine bactérienne." },
            "crp": { tier: 2, res: "CRP à 220 mg/L.", justification: "PEU CONTRIBUTIF : Confirme l'inflammation majeure mais n'aide pas à la réanimation d'urgence." },
            "echo_renal": { tier: 2, res: "Infiltration péri-rénale gauche, pas de dilatation des cavités pyélocalicielles.", justification: "UTILE : Élimine un obstacle sur les voies urinaires nécessitant un drainage médico-chirurgical urgent." },
            "troponine_t": { tier: 3, res: "Troponine T légèrement augmentée à 38 ng/L.", justification: "NON CONTRIBUTIF : Souffrance myocardique fonctionnelle liée au choc et à la tachycardie." },
            "lcr_num": { tier: 3, res: "Liquide clair, formule normale.", justification: "ERREUR GRAVE : Ponction lombaire injustifiée et dangereuse sur un choc septique urologique évident." }
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
            name: sc.name,
            type: sc.type,
            status: "Détresse Initiale",
            fc: Math.round(sc.fc * multiplier),
            ta: sc.ta,
            spo2: Math.min(100, Math.max(75, Math.round(sc.spo2 / (multiplier * 0.98)))),
            fr: Math.round(sc.fr * multiplier),
            temp: sc.temp,
            dextro: sc.dextro,
            aspect: sc.aspect,
            desc: sc.desc
        },
        whiteboard: [],
        correctDiag: sc.correctDiag,
        lethalWrongDiags: sc.lethalWrongDiags,
        usefulExams: sc.usefulExams,
        history: ["Admission du patient au déchocage."],
        score: 100,
        turns: 0,
        liesDiscovered: false,
        searchedHome: false,
        vicodinDoses: 3,
        epiphanyUsed: false
    };
    res.json(activeSim);
});

app.post('/api/interrogate', (req, res) => {
    const sc = ednScenarios[activeSim.itemId];
    activeSim.turns++;
    const data = sc.interrogateEffect(activeSim);
    activeSim.history.push(data.outcome);
    res.json({ activeSim, outcome: data.outcome, hessQuote: data.hess });
});

app.post('/api/search-home', (req, res) => {
    const sc = ednScenarios[activeSim.itemId];
    activeSim.turns++;
    const data = sc.searchEffect(activeSim);
    activeSim.history.push(data.outcome);
    res.json({ activeSim, outcome: data.outcome, hessQuote: data.hess });
});

app.post('/api/vicodin', (req, res) => {
    const sc = ednScenarios[activeSim.itemId];
    if (activeSim.vicodinDoses <= 0) {
        return res.json({ activeSim, outcome: "[Flacon vide]", hessQuote: "Dr Hess : Plus de pilules. Réfléchissez.", success: false });
    }
    activeSim.vicodinDoses--;
    activeSim.turns++;
    let outcome = "";
    if (!activeSim.epiphanyUsed) {
        activeSim.epiphanyUsed = true; activeSim.score -= 5;
        outcome = `[💊 ÉPIPHANIE DE HESS] ${sc.epiphany}`;
    } else {
        activeSim.score -= 15;
        outcome = "[Addiction] Dose superflue. Aucun effet thérapeutique.";
    }
    activeSim.history.push(outcome);
    res.json({ activeSim, outcome, hessQuote: "Dr Hess : C'était pourtant sous vos yeux.", success: true });
});

app.post('/api/whiteboard/add', (req, res) => {
    const { hypothesis } = req.body;
    let feedback = "";
    if (!activeSim.whiteboard.includes(hypothesis)) {
        activeSim.whiteboard.push(hypothesis);
        activeSim.history.push(`Hypothèse : ${hypothesis}`);
        if (activeSim.lethalWrongDiags.some(d => hypothesis.toLowerCase().includes(d.toLowerCase()))) {
            feedback = `Dr Hess : "${hypothesis} ? Erreur. Si vous injectez le traitement à l'aveugle, vous le tuez."`;
            activeSim.score -= 10;
        } else if (hypothesis.toLowerCase().includes(activeSim.correctDiag.toLowerCase())) {
            feedback = `Dr Hess : "${hypothesis} ? C'est sur la bonne voie. Prouvez-le maintenant."`;
            activeSim.score += 5;
        } else {
            feedback = `Dr Hess : "${hypothesis} ? Une théorie étrange."`;
            activeSim.score -= 4;
        }
    } else {
        feedback = `Dr Hess : "Déjà noté."`;
    }
    res.json({ activeSim, feedback });
});

app.post('/api/investigate', (req, res) => {
    const { examKey } = req.body;
    activeSim.turns++;
    
    if (activeSim.usefulExams && activeSim.usefulExams[examKey]) {
        let match = activeSim.usefulExams[examKey];
        if (match.tier === 1) {
            activeSim.score += 5;
            activeSim.history.push(`[Examen Clé] ${EXAM_CATALOG[examKey]} : ${match.res}`);
            return res.json({ activeSim, outcome: match.res, justification: match.justification, success: true });
        } else if (match.tier === 2) {
            activeSim.score -= 3;
            activeSim.history.push(`[Examen non prioritaire] ${EXAM_CATALOG[examKey]} : ${match.res}`);
            return res.json({ activeSim, outcome: match.res, justification: match.justification, success: true });
        } else {
            activeSim.score -= 20;
            activeSim.patient.status = "AGGRAVATION SÉVÈRE";
            activeSim.history.push(`[⚠️ FAUTE] ${EXAM_CATALOG[examKey]} : ${match.res}`);
            return res.json({ activeSim, outcome: match.res, justification: match.justification, success: false });
        }
    } else {
        activeSim.score -= 5;
        let info = EXAM_CATALOG[examKey] || "Examen inconnu";
        let justification = "NON CONTRIBUTIF : Cet examen n'apporte aucune donnée d'orientation diagnostique pour le tableau clinique actuel de ce patient et retarde indûment la prise en charge étiologique requise par le référentiel.";
        activeSim.history.push(`[Inutile] ${info} : Non contributif.`);
        return res.json({ activeSim, outcome: "Résultats physiologiques ou normaux.", justification, success: false });
    }
});

app.post('/api/execute', (req, res) => {
    const { order } = req.body;
    let outcome = "";
    const cleanOrder = order.toLowerCase();
    activeSim.turns++;

    if (cleanOrder.includes("oxygène") || cleanOrder.includes("o2")) {
        activeSim.patient.spo2 = Math.min(100, activeSim.patient.spo2 + 6);
        activeSim.patient.fr = Math.max(14, activeSim.patient.fr - 4);
        outcome = "Oxygénothérapie initiée au masque à haute concentration.";
    } else if (cleanOrder.includes("remplissage") || cleanOrder.includes("sérum")) {
        if (activeSim.itemId === "158") {
            activeSim.patient.ta = "105/65"; activeSim.patient.fc = 105; activeSim.score += 10;
            outcome = "Remplissage vasculaire par 500 ml de Cristalloïdes.";
        } else {
            activeSim.patient.fc += 10; activeSim.patient.spo2 -= 8; activeSim.score -= 15;
            outcome = "Remplissage vasculaire effectué à tort.";
        }
    } else if (cleanOrder.includes("antibiothérapie") || cleanOrder.includes("antibiotique")) {
        if (activeSim.itemId === "158") {
            activeSim.score += 10;
            outcome = "Injection d'une C3G (Ceftriaxone) IV après réalisation des prélèvements bactériologiques.";
        } else {
            outcome = "Antibiothérapie administrée sans cible active.";
        }
    } else {
        outcome = `Action clinique entreprise : "${order}"`;
    }
    activeSim.history.push(outcome);
    res.json({ activeSim, outcome, hessQuote: "Dr Hess : Ordre consigné." });
});

app.post('/api/diagnose', (req, res) => {
    const { hypothesis } = req.body;
    let success = false;
    let finalNote = 0;
    if (activeSim.correctDiag && hypothesis.toLowerCase().includes(activeSim.correctDiag.toLowerCase())) {
        success = true; finalNote = Math.round(activeSim.score / 5);
        if (finalNote > 20) finalNote = 20; if (finalNote < 0) finalNote = 0;
    } else {
        finalNote = Math.max(0, Math.round((activeSim.score - 50) / 5));
        if (finalNote > 5) finalNote = 4;
    }
    res.json({ success, finalNote, correctAnswer: activeSim.correctDiag });
});

app.get('/api/get-current-sim', (req, res) => { res.json(activeSim); });

app.listen(PORT, () => console.log(`Serveur prêt sur le port ${PORT}`));
