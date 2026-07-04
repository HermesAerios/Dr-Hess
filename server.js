const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let activeSim = {};

// DICTIONNAIRE DE RÉFÉRENCE DES INTITULÉS (Pour l'affichage des logs)
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
    "nfs": "Numération Formule Sanguine (NFS) / Hémogramme",
    "ddimeres": "D-Dimères",
    "lactates": "Lactates sanguins",
    "lipasemie": "Lipasémie",
    "bilan_hepatique": "Bilan hépatique complet (ASAT, ALAT, PAL, GGT)",
    "magnesemie": "Dosage du magnésium (Magnésémie)",
    "phosphatemie": "Dosage du phosphore (Phosphatémie)",
    "probnp": "pro-BNP (Peptide natriurétique)",
    "troponine_t": "Troponine T",
    "paracetamol": "Dosage du paracétamol",
    "amylasemie": "Amylasémie",
    "crp": "Protéine C-Réactive (CRP)",
    "cpk": "Créatine Kinase (CK / CPK)",
    "alcoolemie": "Alcoolémie / Dosage éthanol",
    "hemocultures": "Hémocultures (2 flacons/prélèvements)",
    "analyse_urine": "Analyse d'urine (bandelette / sédiment)",
    "lcr_num": "Numération cellulaire du LCR (Cytologie)",
    "lcr_glyco": "Glycorachie (glucose dans le LCR)",
    "lcr_gram": "Coloration de Gram sur le LCR",
    "lcr_proteino": "Protéinorachie (protéines dans le LCR)"
};

const ednScenarios = {
    // ==================== EPISODE 1 : ITEM 158 ====================
    "158": { 
        name: "Mme Joly, 74 ans", 
        type: "Choc septique d'origine urinaire (Item 158)",
        desc: "Trouvée désorientée chez elle. Fièvre majeure, frissons. Sa fille prétend qu'elle a juste attrapé un 'petit coup de froid' hier.", 
        fc: 125, ta: "82/46", spo2: 90, fr: 26, temp: 39.5, dextro: 6.1, aspect: "Marbrures aux genoux, TRC > 4s, somnolence prononcée.",
        correctDiag: "Sepsis grave",
        lethalWrongDiags: ["Poussée de Lupus", "Surdosage en bêtabloquants"],
        interrogateEffect: (sim) => {
            if (!sim.liesDiscovered) {
                sim.liesDiscovered = true; sim.patient.fc = 138; sim.patient.ta = "72/40"; sim.score -= 5;
                return {
                    outcome: "[CRASH CLINIQUE] En insistant agressivement, la patiente s'effondre. Sa fille avoue : 'Elle avait des brûlures urinaires atroces depuis 4 jours mais refusait les antibiotiques !'",
                    hess: "Dr Hess : Félicitations Sherlock, vous avez fait cracher le morceau à la gamine. Mais sa tension s'effondre. Remplissez-moi ce lit de macromolécules !"
                };
            }
            return { outcome: "[Anamnèse] Patiente obnubilée, aucune réponse possible.", hess: "Dr Hess : Elle glisse vers le coma." };
        },
        searchEffect: (sim) => {
            if (!sim.searchedHome) {
                sim.searchedHome = true; sim.score += 10;
                return {
                    outcome: "[Perquisition] Votre externe trouve des protections urinaires souillées de sang et une boîte de paracétamol vide dans sa poubelle.",
                    hess: "Dr Hess : La porte d'entrée est urinaire. C'est un urosepsis."
                };
            }
            return { outcome: "[Perquisition] Aucun autre élément.", hess: "Dr Hess : Vous perdez votre temps." };
        },
        epiphany: "Les marbrures, la fièvre, la confusion, l'hypotension persistante... Ce n'est pas une panne de pompe, c'est la tuyauterie systémique qui s'effondre sous l'effet des endotoxines bactériennes ! Ciblez le foyer urinaire.",
        usefulExams: {
            // Examens Physiques
            "exam_vias": { tier: 1, res: "Voies aériennes supérieures libres, pas d'encombrement.", justification: "Libres. Indispensable lors de l'évaluation initiale d'une détresse." },
            "exam_resp": { tier: 1, res: "Polypnée superficielle à 26/min, pas de tirage.", justification: "Objective la tachypnée, critère majeur de dysfonction respiratoire lié au sepsis (qSOFA)." },
            "exam_circ": { tier: 1, res: "Pouls radial filant, tachycardie à 125 bpm, temps de recoloration cutanée (TRC) allongé à 4 secondes.", justification: "Signe la défaillance hémodynamique et la mauvaise perfusion périphérique." },
            "exam_cardio": { tier: 1, res: "Bruits du cœur réguliers et rapides, pas de souffle ni d'œdèmes des membres inférieurs.", justification: "Élimine une insuffisance cardiaque droite ou gauche aiguë isolée." },
            "exam_pulm": { tier: 1, res: "Murmure vésiculaire symétrique, pas de râles crépitants.", justification: "Permet d'écarter un foyer infectieux pulmonaire ou un OAP de surcharge." },
            "exam_abd": { tier: 1, res: "Abdomen souple, dépressible, sensibilité diffuse sans défense.", justification: "Permet de mettre de côté une urgence chirurgicale abdominale (péritonite)." },
            "exam_back": { tier: 1, res: "Douleur vive déclenchée à la percussion de la fosse lombaire gauche.", justification: "Signe de Giordano positif : oriente immédiatement vers une atteinte rénale (pyélonéphrite)." },
            "exam_skin": { tier: 1, res: "Marbrures cutanées nettes s'étendant aux genoux. Pas d'élément purpurique.", justification: "Marqueur clinique de gravité extrême de l'insuffisance circulatoire." },
            "exam_neuro": { tier: 1, res: "Score de Glasgow à 13 (E4V3M6). Somnolente, désorientée dans le temps et l'espace.", justification: "Objective l'atteinte neurologique centrale, signe de défaillance d'organe liée au sepsis." },
            
            // Tests au lit & Échos
            "hgt": { tier: 1, res: "Glycémie capillaire à 6.1 mmol/L.", justification: "Élimine un coma ou une confusion sur hypoglycémie." },
            "bu": { tier: 1, res: "Bandelette Urinaire : Leucocytes +++, Nitrites +, pas de protéinurie.", justification: "CRITIQUE (Item 158) : Confirme l'infection urinaire aiguë et signe le point d'appel étiologique." },
            "echo_renal": { tier: 1, res: "Infiltration péri-rénale gauche, pas de dilatation des cavités pyélocalicielles.", justification: "INDISPENSABLE (Item 158) : Élimine un obstacle urétéral nécessitant un drainage médico-chirurgical urgent." },
            
            // Biologie
            "lactates": { tier: 1, res: "Lactatémie à 4.5 mmol/L.", justification: "CRITIQUE : Affirme l'état de choc septique selon les critères de consensus Sepsis-3 (Lactates > 2 mmol/L)." },
            "hemocultures": { tier: 1, res: "Positives à Bacilles Gram Négatif (E. Coli).", justification: "INDISPENSABLE (Item 158) : Permet d'isoler la bactérie responsable avant l'antibiogramme." },
            "ionogramme": { tier: 1, res: "Sodium 138 mmol/L, Potassium 4.6 mmol/L, Créatinine 155 µmol/L, Urée 14 mmol/L.", justification: "INDISPENSABLE : Révèle une insuffisance rénale aiguë fonctionnelle d'origine hémodynamique." },
            "gds": { tier: 1, res: "Acidose métabolique sévère (pH 7.28, HCO3- 15 mmol/L).", justification: "UTILE : Révèle la sévérité du retentissement métabolique." },
            "nfs": { tier: 1, res: "Hyperleucocytose à 19 000/mm3 à polynucléaires neutrophiles.", justification: "UTILE : Confirme l'origine bactérienne aiguë." },
            "crp": { tier: 2, res: "CRP à 220 mg/L.", justification: "PEU CONTRIBUTIF : Confirme le syndrome inflammatoire mais n'aide pas à la réanimation immédiate." },
            
            // Fautes Lourdes (LCR / Imagerie abusive)
            "lcr_num": { tier: 3, res: "Liquide clair, formule cellulaire normale.", justification: "FAUTE GRAVE : Pratiquer une ponction lombaire sans point d'appel méningé chez une patiente instable retarde le traitement et fait perdre des chances de survie." },
            "angio_scanner": { tier: 3, res: "Aorte thoracique normale, pas d'embolie pulmonaire.", justification: "FAUTE GRAVE : L'injection de produit de contraste iodé est hautement néphrotoxique sur ce rein déjà hypoperfusé." }
        }
    },

    // ==================== EPISODE 2 : ITEM 24 ====================
    "24": { 
        name: "Amandine L., 26 ans", 
        type: "Fièvre et contractions au 3ème trimestre (Items 23 / 24)",
        desc: "Amenée par le SAMU à 31 SA + 4 jours pour de violentes douleurs abdominales intermittentes et des vomissements[cite: 3, 4]. Elle déclare : 'C'est juste une vilaine grippe, j'ai de la fièvre depuis ce matin[cite: 3]. Ne touchez pas à mon ventre, j'ai trop mal.'", 
        fc: 118, ta: "124/82", spo2: 95, fr: 24, temp: 38.6, dextro: 5.2, aspect: "Faciès prostré, angoissé, sueurs profuses[cite: 5]. Hauteur utérine mesurée à 31 cm (normale)[cite: 2]. Utérus douloureux en permanence entre les contractions[cite: 5].",
        correctDiag: "Chorioamniotite",
        lethalWrongDiags: ["Appendicite aiguë", "Hématome rétroplacentaire"],
        interrogateEffect: (sim) => {
            if (!sim.liesDiscovered) {
                sim.liesDiscovered = true; sim.patient.fr = 28; sim.patient.fc = 135;
                return {
                    outcome: "[ANAMNÈSE AGRESSIVE] En insistant, elle craque : 'D'accord ! J'ai rompu ma poche des eaux avant-hier soir à la maison[cite: 3]... Je n'ai rien dit parce que je fume beaucoup de cannabis[cite: 2] et j'avais peur qu'on me retire mon bébé !'",
                    hess: "Dr Hess : Une Rupture Prématurée des Membranes (RPM) cachée depuis 48h à 31 SA (Item 24)[cite: 3] ! La barrière stérile est rompue, les bactéries ont colonisé l'amnios[cite: 3]. Tocolyser cet utérus est une faute grave !"
                };
            }
            return { outcome: "[Anamnèse] La patiente gémit et refuse de parler.", hess: "Dr Hess : Agissez." };
        },
        searchEffect: (sim) => {
            if (!sim.searchedHome) {
                sim.searchedHome = true; sim.score += 5;
                return {
                    outcome: "[PERQUISITION DOMICILE] Votre externe trouve un pochon de cannabis dans son sac[cite: 2] et des serviettes hygiéniques trempées d'un liquide teinté et malodorant[cite: 3].",
                    hess: "Dr Hess : Liquide amniotique fétide[cite: 3]. Le piège de la chorioamniotite se referme."
                };
            }
            return { outcome: "[Perquisition] Rien de plus.", hess: "Dr Hess : Concentrez-vous." };
        },
        epiphany: "La fièvre, la douleur utérine permanente, la tachycardie fœtale...[cite: 3] Ce n'est pas un problème chirurgical abdominal, c'est l'infection de la poche des eaux provoquée par la rupture prolongée des membranes[cite: 3] ! Le traitement, c'est l'extraction et les antibiotiques[cite: 3].",
        usefulExams: {
            // Examens Physiques
            "exam_resp": { tier: 1, res: "Polypnée à 24/min, pas de râles.", justification: "Évalue la tolérance maternelle de la fièvre[cite: 3]." },
            "exam_circ": { tier: 1, res: "Tachycardie sinusale à 118 bpm, TRC normal à 2s.", justification: "Surveillance de la tolérance hémodynamique maternelle." },
            "exam_abd": { tier: 1, res: "Abdomen souple, pas de défense dans les fosses iliaques.", justification: "Élimine une appendicite aiguë (principal diagnostic différentiel chirurgical)[cite: 3]." },
            "exam_gu": { tier: 1, res: "Au spéculum : Écoulement permanent d'un liquide amniotique louche, épais et d'odeur fétide[cite: 3]. Col utérin centré, ramolli, ouvert à 2 cm[cite: 6].", justification: "CRITIQUE (Item 24) : Pose le diagnostic visuel de rupture des membranes associée à des signes de chorioamniotite[cite: 3]." },
            "exam_back": { tier: 1, res: "Fosses lombaires libres et indolores à la percussion.", justification: "Élimine formellement une pyélonéphrite aiguë gravidique[cite: 3]." },
            "exam_skin": { tier: 1, res: "Sueurs profuses[cite: 5], pas de rash cutané, pas de purpura.", justification: "Élimine un exanthème fébrile ou un purpura fulminans." },
            
            // Tests au lit & Échos
            "ecg": { tier: 1, res: "Enregistrement Cardiotocographique (RCF) : Tachycardie fœtale sévère et constante à 185 bpm, perte de réactivité, oscillations plates. Contractions utérines régulières toutes les 3 minutes[cite: 4].", justification: "CRITIQUE (Item 24) : Met en évidence la tachycardie fœtale, signe majeur de souffrance et d'infection fœtale[cite: 3, 4]." },
            "bu": { tier: 1, res: "Bandelette : Absence de leucocytes, pas de nitrites, pas de protéinurie.", justification: "INDISPENSABLE : Écarte une infection urinaire basse ou haute[cite: 3]." },
            
            // Biologie
            "nfs": { tier: 1, res: "Hémoglobine à 11.2 g/dL[cite: 2], Leucocytes augmentés à 16 500/mm3 à polynucléaires neutrophiles[cite: 2, 3].", justification: "CRITIQUE : Confirme l'hyperleucocytose infectieuse, à interpréter avec précaution car modérément physiologique en fin de grossesse[cite: 2, 3]." },
            "crp": { tier: 1, res: "CRP élevée à 84 mg/L[cite: 3].", justification: "CRITIQUE : Objective le syndrome inflammatoire aigu accompagnant la chorioamniotite[cite: 3]." },
            "hemocultures": { tier: 1, res: "En cours... (Recherche de Listeria monocytogenes lancée)[cite: 3].", justification: "INDISPENSABLE : Règle absolue devant toute fièvre in utero inexpliquée pour exclure une listériose[cite: 3]." },
            
            // Fautes lourdes
            "lcr_num": { tier: 3, res: "Absence d'anomalie cellulaire.", justification: "FAUTE GRAVE : Pratiquer une PL sur une femme enceinte fébrile sans aucun syndrome méningé clinique est une perte de temps[cite: 3]." },
            "tdm_abdomen": { tier: 3, res: "Utérus gravide volumineux à terme, fœtus en présentation céphalique[cite: 2].", justification: "FAUTE GRAVE : Irradier inutilement un fœtus au 3ème trimestre pour une douleur utérine fébrile évidente est une faute médico-légale majeure[cite: 2, 3]." }
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

// Route d'interrogatoire
app.post('/api/interrogate', (req, res) => {
    const sc = ednScenarios[activeSim.itemId];
    activeSim.turns++;
    const data = sc.interrogateEffect(activeSim);
    activeSim.history.push(data.outcome);
    res.json({ activeSim, outcome: data.outcome, hessQuote: data.hess });
});

// Route de perquisition
app.post('/api/search-home', (req, res) => {
    const sc = ednScenarios[activeSim.itemId];
    activeSim.turns++;
    const data = sc.searchEffect(activeSim);
    activeSim.history.push(data.outcome);
    res.json({ activeSim, outcome: data.outcome, hessQuote: data.hess });
});

// Route de Vicodine
app.post('/api/vicodin', (req, res) => {
    const sc = ednScenarios[activeSim.itemId];
    if (activeSim.vicodinDoses <= 0) {
        return res.json({ activeSim, outcome: "[Flacon vide]", hessQuote: "Dr Hess : Plus de pilules. Réfléchissez.", success: false });
    }
    activeSim.vicodinDoses--; activeSim.turns++;
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

// Route Tableau Blanc
app.post('/api/whiteboard/add', (req, res) => {
    const { hypothesis } = req.body;
    let feedback = "";
    if (!activeSim.whiteboard.includes(hypothesis)) {
        activeSim.whiteboard.push(hypothesis);
        activeSim.history.push(`Hypothèse : ${hypothesis}`);
        if (activeSim.lethalWrongDiags.some(d => hypothesis.toLowerCase().includes(d.toLowerCase()))) {
            feedback = `Dr Hess : "${hypothesis} ? Erreur. Si vous injectez le traitement à l'aveugle, vous signez son permis d'inhumer."`;
            activeSim.score -= 10;
        } else if (hypothesis.toLowerCase().includes(activeSim.correctDiag.toLowerCase())) {
            feedback = `Dr Hess : "${hypothesis} ? C'est sur la bonne voie. Prouvez-le maintenant."`;
            activeSim.score += 5;
        } else {
            feedback = `Dr Hess : "${hypothesis} ? Une théorie étrange."`;
            activeSim.score -= 4;
        }
    } else { feedback = `Dr Hess : "Déjà noté."`; }
    res.json({ activeSim, feedback });
});

// Route d'Investigations (Filtre dynamique par clé)
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
        let justification = "NON CONTRIBUTIF / PARCOURS INUTILE : Cet examen n'apporte aucun élément d'orientation étiologique ou de sévérité pour ce tableau clinique précis et retarde de manière critique la thérapeutique requise par la HAS.";
        activeSim.history.push(`[Inutile] ${info} : Non contributif.`);
        return res.json({ activeSim, outcome: "Résultats physiologiques ou normaux.", justification, success: false });
    }
});

// Route d'Exécution Thérapeutique
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
    } else if (cleanOrder.includes("antibiothérapie") || cleanOrder.includes("antibiotique") || cleanOrder.includes("ceftriaxone") || cleanOrder.includes("amoxicilline")) {
        if (activeSim.itemId === "158" || activeSim.itemId === "24") {
            activeSim.score += 12;
            outcome = "Injection d'une antibiothérapie parentérale probabiliste IV (C3G ou Amoxicilline) immédiate.";
        } else {
            outcome = "Antibiothérapie administrée sans cible active.";
        }
    } else {
        outcome = `Action clinique entreprise : "${order}"`;
    }
    activeSim.history.push(outcome);
    res.json({ activeSim, outcome, hessQuote: "Dr Hess : Ordre consigné." });
});

// Route de Notation Finale
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
