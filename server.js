const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let activeSim = {};

// CATALOGUE UNIVERSEL DES EXAMENS (Pour la justification HAS / EDN)
const EXAM_CATALOG = {
    // Clinique / Immédiat
    "ecg": "Électrocardiogramme 12 dérivations (Objectif < 10 min en cas de suspicion de SCA).",
    "gaze_du_sang": "Gazométrie artérielle avec mesure du pH, pO2, pCO2 et des bicarbonates.",
    "lactates": "Lactatémie capillaire ou artérielle (Reflet direct de l'hypoperfusion tissulaire périphérique).",
    // Biologie Standard
    "nfs": "Numération Formule Sanguine (Recherche d'hyperleucocytose, d'anémie ou de thrombopénie).",
    "crp": "Protéine C Réactive (Marqueur d'inflammation systémique).",
    "ionogramme": "Iono sanguin complet (Évaluation de la fonction rénale, kaliémie, natrémie).",
    "troponine": "Troponine I ou T ultra-sensible (Marqueur de nécrose myocardique).",
    "hemocultures": "Hémocultures (2 paires, indispensables avant toute antibiothérapie systémique si suspicion de sepsis).",
    "ecbu": "Examen Cytobactériologique des Urines (Recherche d'une infection du tractus urinaire).",
    "bnh": "Bilan Hépatique Complet (ASAT, ALAT, PAL, Bilirubine pour évaluer un retentissement ou une étiologie biliaire).",
    // Imagerie
    "radio_thorax": "Radiographie du thorax de face (Recherche d'un foyer pulmonaire, d'un épanchement ou d'un pneumothorax).",
    "angio_scanner": "Angioscanner thoracique (Examen de référence pour exclure une embolie pulmonaire ou une dissection aortique).",
    "echo_coeur": "Échocardiographie transthoracique (ETT - Évaluation de la cinétique segmentaire et de la fonction systolique).",
    "tdm_abdomen": "Scanner abdomino-pelvien injecté (Recherche d'un foyer profond, abcès ou d'un obstacle des voies urinaires)."
};

const ednScenarios = {
   "24": { 
        name: "Amandine L., 26 ans", 
        type: "Fièvre et contractions au 3ème trimestre (Items 23 / 24)",
        desc: "Amenée par le SAMU à 31 SA + 4 jours pour de violentes douleurs abdominales intermittentes et des vomissements. Elle déclare : 'C'est juste une vilaine grippe, j'ai de la fièvre depuis ce matin. Ne touchez pas à mon ventre, j'ai trop mal.'", 
        // Constantes Hospitalières Réalistes (Rigueur ECN)
        fc: 118, 
        ta: "148/95", // HTA sous-jacente masquée par la douleur
        spo2: 95, 
        fr: 24, 
        temp: 38.6, 
        dextro: 5.2, 
        aspect: "Faciès prostré, angoissé, sueurs profuses. Hauteur utérine mesurée à 31 cm (normale pour le terme). Utérus sensible entre les contractions.",
        correctDiag: "Chorioamniotite", // Diagnostic EDN attendu
        lethalWrongDiags: ["Appendicite aiguë", "Hématome rétroplacentaire"],
        
        // Étape 3 : Non-linéarité et secrets (Everybody Lies)
        patientSecret: "C'est juste une vilaine grippe, j'ai de la fièvre depuis ce matin.",
        interrogateEffect: (sim) => {
            if (!sim.liesDiscovered) {
                sim.liesDiscovered = true;
                sim.patient.fr = 28; // Polypnée aggravée
                sim.patient.fc = 135; // Tachycardie réflexe
                return {
                    outcome: "[ANAMNÈSE AGRESSIVE] Vous la poussez à bout. En larmes, elle avoue : 'D'accord ! J'ai rompu ma poche des eaux avant-hier soir à la maison... Je n'ai rien dit parce que je fume beaucoup de cannabis et j'avais peur qu'on me retire mon bébé à la maternité !'",
                    hess: "Dr Hess : Magique. Une Rupture Prématurée des Membranes (RPM) cachée depuis 48h à 31 SA (Item 24). La barrière stérile est rompue, les bactéries vaginales ont colonisé l'amnios. Vous avez un incendie microbiologique intra-utérin à éteindre d'urgence !"
                };
            }
            return { outcome: "[Anamnèse] La patiente gémit et refuse de parler davantage, focalisée sur ses vagues utérines.", hess: "Dr Hess : Vous connaissez son secret. Arrêtez de bavarder, agissez." };
        },
        searchEffect: (sim) => {
            if (!sim.searchedHome) {
                sim.searchedHome = true;
                sim.score += 5;
                return {
                    outcome: "[PERQUISITION DOMICILE] Votre externe fouille son sac de maternité resté dans le couloir : il y trouve un pochon de têtes de cannabis (FR d'accouchement prématuré) et des serviettes hygiéniques totalement trempées d'un liquide teinté, d'odeur fétide.",
                    hess: "Dr Hess : Du liquide amniotique fétide dans le sac. Ça confirme la rupture prolongée des membranes. Le piège se referme."
                };
            }
            return { outcome: "[Perquisition] Rien de plus.", hess: "Dr Hess : Inutile de fouiller deux fois." };
        },
        
        // Étape 4 : L'Épiphanie de Hess
        epiphany: "Vous observez un externe qui essaie de refermer un bocal de cornichons dont le joint en caoutchouc s'est liquéfié : le vinaigre coule et empeste la pièce. Flash mental. L'utérus d'Amandine n'est pas en train de faire une simple crise contractile idiopathique, c'est son liquide amniotique protecteur qui a été infecté à cause du joint rompu (la RPM) ! La fièvre et la douleur permanente, c'est l'infection de l'œuf ! (Item 24 / Chorioamniotite). Tocolyser ce vagin est un arrêt de mort pour le fœtus !",
        
        // Matrice Para-clinique Exhaustive (Régulation HAS)
        usefulExams: {
            "ecg": { tier: 2, res: "Tachycardie sinusale à 118 bpm, pas de trouble de conduction.", justification: "PEU UTILE : Examen de routine devant une tachycardie, mais n'oriente pas la pathologie obstétricale." },
            "lactates": { tier: 2, res: "Lactates à 1.8 mmol/L.", justification: "UTILE : Élimine un état de choc systémique profond (Sepsis-3) pour le moment." },
            "bu": { tier: 2, res: "Traces de leucocytes, nitrites négatifs, pas de protéinurie.", justification: "ÉCARTÉ : Permet d'éliminer une pyélonéphrite aiguë (principal diagnostic différentiel de fièvre au 3ème trimestre)." },
            "nfs": { tier: 1, res: "Hémoglobine à 11.2 g/dL (normal pour le 3e trimestre), Leucocytes à 16 500/mm3 avec hyperleucocytose à PNN.", justification: "CRITIQUE : Confirme le syndrome infectieux biologique, même si une hyperleucocytose modérée est physiologique en fin de grossesse." },
            "crp": { tier: 1, res: "CRP élevée à 84 mg/L.", justification: "CRITIQUE : Confirme le syndrome inflammatoire aigu majeur en miroir de la fièvre clinique." },
            "gaze_du_sang": { tier: 2, res: "pH 7.41, pCO2 32 mmHg (hyperventilation adaptative), HCO3- 21 mmol/L.", justification: "PEU UTILE : Confirme la compensation respiratoire de la grossesse, sans valeur d'orientation." },
            "hemocultures": { tier: 1, res: "En cours... (Recherche de Listeria monocytogenes et germes vaginaux lancée).", justification: "INDISPENSABLE : Devant toute fièvre in utero non étiquetée, les hémocultures sont obligatoires avant l'antibiothérapie." },
            "ecbu": { tier: 2, res: "Culture stérile, absence de leucocyturie significative.", justification: "ÉCARTÉ : Confirme l'absence de colonisation ou d'infection urinaire active." },
            "radio_thorax": { tier: 2, res: "Parenchyme pulmonaire libre, pas de foyer infectieux.", justification: "PEU UTILE : Élimine une pneumopathie aiguë communautaire, mais fait perdre du temps." },
            "angio_scanner": { tier: 3, res: "Irradiation pelvienne injustifiée.", justification: "FAUTE GRAVE : Injecter et irradier un fœtus de 31 SA sans aucun signe d'embolie pulmonaire ou de dissection aortique est une erreur majeure." },
            "echo_coeur": { tier: 2, res: "Fraction d'éjection préservée, pas de végétation d'endocardite.", justification: "INUTILE : Perte de temps totale en salle de déchocage." },
            "tdm_abdomen": { tier: 3, res: "Examen non contributif, utérus gravide volumineux.", justification: "FAUTE GRAVE : Demander un scanner abdominal pour une douleur utérine fébrile retarde la prise en charge et expose à une irradiation fœtale inutile." }
        }
    },
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
                sim.patient.fc = 138;
                sim.patient.ta = "72/40"; 
                sim.score -= 5;
                return {
                    outcome: "[CRASH CLINIQUE] En insistant agressivement, la patiente s'effondre. Sa fille avoue enfin : 'Elle avait des brûlures urinaires atroces depuis 4 jours mais refusait les antibiotiques !'",
                    hess: "Dr Hess : Félicitations Sherlock, vous avez fait cracher le morceau à la gamine, mais le cœur de la vieille lâche. Remplissez-moi ce lit de macromolécules !"
                };
            }
            return { outcome: "[Anamnèse] Patiente obnubilée, aucune réponse possible.", hess: "Dr Hess : Elle glisse vers le coma. Arrêtez de lui parler." };
        },
        searchEffect: (sim) => {
            if (!sim.searchedHome) {
                sim.searchedHome = true;
                sim.score += 10;
                return {
                    outcome: "[Perquisition] Votre externe trouve des protections urinaires souillées de sang et une boîte de paracétamol vide dans sa poubelle.",
                    hess: "Dr Hess : La porte d'entrée est urinaire, l'infection a colonisé le sang. C'est une pyélonéphrite obstructive ou maligne."
                };
            }
            return { outcome: "[Perquisition] Aucun autre élément.", hess: "Dr Hess : Vous perdez votre temps." };
        },
        epiphany: "Les marbrures, la fièvre, la confusion, l'hypotension persistante... Ce n'est pas une panne cardiogénique, c'est la tuyauterie systémique qui s'effondre sous l'effet des endotoxines bactériennes ! Traitez le contenant et ciblez le foyer urinaire.",
        usefulExams: {
            "lactates": { tier: 1, res: "Lactatémie à 4.5 mmol/L.", justification: "CRITIQUE : Confirme l'hypoperfusion tissulaire systémique et valide le diagnostic de choc septique selon les critères Sepsis-3." },
            "hemocultures": { tier: 1, res: "Positives à Bacilles Gram Négatif (E. Coli).", justification: "INDISPENSABLE : Permet d'isoler le germe. Doit être réalisé sans attendre mais sans retarder l'antibiothérapie d'urgence." },
            "ecbu": { tier: 1, res: "Leucocyturie majeure, nitrites +, hématurie.", justification: "JUSTIFIÉ : Oriente immédiatement vers le foyer infectieux initial (Uro-sepsis)." },
            "gaze_du_sang": { tier: 1, res: "Acidose métabolique sévère (pH 7.28, HCO3- 15 mmol/L).", justification: "UTILE : Évalue la gravité de la défaillance d'organe (rénale/métabolique)." },
            "nfs": { tier: 1, res: "Hyperleucocytose à 19 000/mm3.", justification: "UTILE : Confirme la réponse inflammatoire d'origine infectieuse." },
            "crp": { tier: 2, res: "CRP à 220 mg/L.", justification: "PEU UTILE : Confirme le syndrome inflammatoire mais n'apporte aucune valeur ajoutée en situation d'extrême urgence réanimatoire." },
            "ionogramme": { tier: 2, res: "Urée : 14 mmol/L, Créatinine : 145 µmol/L.", justification: "UTILE : Met en évidence une insuffisance rénale aiguë fonctionnelle liée à l'hypotension." },
            "radio_thorax": { tier: 2, res: "Pas de foyer parenchymateux visible.", justification: "ÉCARTÉ : Permet d'éliminer un foyer pulmonaire associé, mais n'est pas la priorité." },
            "tdm_abdomen": { tier: 2, res: "Infiltration péri-rénale gauche, pas d'obstacle lithiasique.", justification: "UTILE : À faire dans un second temps pour éliminer un abcès ou une pyélonéphrite obstructive requérant un drainage." },
            "troponine": { tier: 3, res: "Troponine I légèrement positive à 45 ng/L.", justification: "INUTILE : Positivité aspécifique liée à la souffrance myocardique fonctionnelle en contexte de tachycardie et de choc." },
            "angio_scanner": { tier: 3, res: "Pas d'embolie pulmonaire.", justification: "FAUTE : Irresponsable d'injecter un produit de contraste néphrotoxique chez une patiente en choc avec insuffisance rénale sans suspicion forte d'EP." }
        }
    },
    "339": { 
        name: "M. Kovac, 52 ans", 
        type: "Syndrome Coronarien Aigu (SCA) (Item 339)",
        desc: "Douleur thoracique rétrosternale, constructive, irradiant la mâchoire depuis 45 min. En sueur intense.", 
        fc: 98, ta: "145/92", spo2: 95, fr: 20, temp: 36.9, dextro: 5.5, aspect: "Pâleur cutanée, sueurs profuses, angoisse majeure de mort imminente.",
        correctDiag: "SCA ST+",
        lethalWrongDiags: ["Dissection aortique", "Pneumothorax"],
        interrogateEffect: (sim) => {
            sim.liesDiscovered = true;
            return {
                outcome: "[Anamnèse] Le patient avoue : 'J'ai fumé deux paquets aujourd'hui à cause du stress alors que j'avais arrêté depuis 5 ans.'",
                hess: "Dr Hess : Tabagisme massif aigu et stress. Le combo idéal pour fissurer une plaque d'athérome."
            };
        },
        searchEffect: (sim) => {
            sim.searchedHome = true;
            sim.score -= 10;
            return {
                outcome: "[Fausse Piste Domicile] Vos externes ramènent des boîtes de tisane pour le foie et des vitamines.",
                hess: "Dr Hess : Bravo, vous avez perdu 10 points de temps précieux pendant que ses cellules myocardiques étouffent."
            };
        },
        epiphany: "Le temps c'est du muscle ! Arrêtez de chercher des causes ésotériques. Une douleur typique, serrée, chez un homme de la cinquantaine coronaropathe potentiel... L'interrupteur électrique du cœur est bloqué. Il faut l'ECG immédiat !",
        usefulExams: {
            "ecg": { tier: 1, res: "Sus-décalage franc du segment ST de 4mm en D2, D3, aVF avec image en miroir.", justification: "CRITIQUE : Pose le diagnostic immédiat d'Infarctus du Myocarde (SCA ST+ inférieur). Indication de reperfusion immédiate (Coronarographie)." },
            "troponine": { tier: 2, res: "Troponine en cours (Résultat d'ici 45 min).", justification: "DANGEREUX : Devant un ST+, on n'attend JAMAIS les résultats de la biologie pour agir. Chaque minute perdue détruit du myocarde." },
            "ionogramme": { tier: 2, res: "Potassium : 4.0 mmol/L, Sodium : 139 mmol/L.", justification: "UTILE : Évalue la kaliémie pour prévenir les troubles du rythme ventriculaire malins." },
            "nfs": { tier: 2, res: "Normal.", justification: "PEU UTILE : Bilan pré-opératoire standard mais ne doit pas retarder le transfert." },
            "gaze_du_sang": { tier: 2, res: "Normal.", justification: "INUTILE : Le patient ne présente pas de signe d'insuffisance respiratoire ou d'acidose." },
            "angio_scanner": { tier: 3, res: "Pas d'anomalie de l'aorte.", justification: "FAUTE LETHALE : Envoyer un patient suspect de SCA ST+ passer un angioscanner au lieu de l'adresser directement en salle de cathétérisme coronaire est une perte de chance majeure." }
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
        return res.json({ activeSim, outcome: "[Flacon vide]", hessQuote: "Dr Hess : Plus de pilules. Réfléchissez par vous-même.", success: false });
    }
    activeSim.vicodinDoses--;
    activeSim.turns++;
    let outcome = "";
    let hessQuote = "";

    if (!activeSim.epiphanyUsed) {
        activeSim.epiphanyUsed = true;
        activeSim.score -= 5;
        outcome = `[💊 ÉPIPHANIE DE HESS] ${sc.epiphany}`;
        hessQuote = "Dr Hess : *Avale sa pilule*... C'était pourtant sous vos yeux depuis le début.";
    } else {
        activeSim.score -= 15;
        outcome = "[Addiction] Dose superflue. Aucun effet thérapeutique sur votre logique.";
        hessQuote = "Dr Hess : Vous devenez dépendant et le patient est toujours en train de mourir.";
    }
    activeSim.history.push(outcome);
    res.json({ activeSim, outcome, hessQuote, success: true });
});

app.post('/api/whiteboard/add', (req, res) => {
    const { hypothesis } = req.body;
    let feedback = "";
    if (!activeSim.whiteboard.includes(hypothesis)) {
        activeSim.whiteboard.push(hypothesis);
        activeSim.history.push(`Hypothèse : ${hypothesis}`);
        if (activeSim.lethalWrongDiags.some(d => hypothesis.toLowerCase().includes(d.toLowerCase()))) {
            feedback = `Dr Hess : "${hypothesis} ? Si vous injectez le traitement de ça à l'aveugle, vous le tuez."`;
            activeSim.score -= 10; // Le tableau blanc a de l'importance ! Poser des diagnostics mortels pénalise le score.
        } else if (hypothesis.toLowerCase().includes(activeSim.correctDiag.toLowerCase())) {
            feedback = `Dr Hess : "${hypothesis} ? C'est sur la bonne voie. Prouvez-le maintenant."`;
            activeSim.score += 5;
        } else {
            feedback = `Dr Hess : "${hypothesis} ? Une théorie digne d'une fiction."`;
            activeSim.score -= 4;
        }
    } else {
        feedback = `Dr Hess : "Déjà listé."`;
    }
    res.json({ activeSim, feedback });
});

app.post('/api/investigate', (req, res) => {
    const { examKey } = req.body;
    activeSim.turns++;
    
    // Vérifier si l'examen existe dans le catalogue du cas actif
    if (activeSim.usefulExams && activeSim.usefulExams[examKey]) {
        let match = activeSim.usefulExams[examKey];
        if (match.tier === 1) {
            activeSim.score += 5;
            let logMsg = `[CRITIQUE] ${EXAM_CATALOG[examKey]} -> ${match.res} (${match.justification})`;
            activeSim.history.push(logMsg);
            return res.json({ activeSim, outcome: match.res, justification: match.justification, hessQuote: "Dr Hess : Examen parfait. Recommandations HAS respectées.", success: true });
        } else if (match.tier === 2) {
            activeSim.score -= 3;
            let logMsg = `[SECONDE LIGNE] ${EXAM_CATALOG[examKey]} -> ${match.res} (${match.justification})`;
            activeSim.history.push(logMsg);
            return res.json({ activeSim, outcome: match.res, justification: match.justification, hessQuote: "Dr Hess : Utile, mais non prioritaire dans l'immédiat.", success: true });
        } else {
            activeSim.score -= 20;
            activeSim.patient.fc += 15; // Aggravation
            let logMsg = `[⚠️ FAUTE GRAVE] ${EXAM_CATALOG[examKey]} -> ${match.res} (${match.justification})`;
            activeSim.history.push(logMsg);
            return res.json({ activeSim, outcome: match.res, justification: match.justification, hessQuote: "Dr Hess : C'est une faute lourde par rapport au référentiel !", success: false });
        }
    } else {
        // L'examen est hors sujet pour ce cas
        activeSim.score -= 5;
        let info = EXAM_CATALOG[examKey] || "Examen inconnu";
        let justification = "NON CONTRIBUTIF : Cet examen n'apporte aucune donnée d'orientation pour les symptômes de ce patient et retarde indûment la prise en charge étiologique.";
        let logMsg = `[INUTILE] ${info} -> Non contributif.`;
        activeSim.history.push(logMsg);
        return res.json({ activeSim, outcome: "Résultats non significatifs ou normaux.", justification, hessQuote: "Dr Hess : Arrêtez de dilapider l'argent de la sécurité sociale.", success: false });
    }
});

app.post('/api/execute', (req, res) => {
    const { order } = req.body;
    let outcome = "";
    let hessQuote = "";
    const cleanOrder = order.toLowerCase();
    activeSim.turns++;

    if (cleanOrder.includes("oxygène") || cleanOrder.includes("o2")) {
        activeSim.patient.spo2 = Math.min(100, activeSim.patient.spo2 + 6);
        activeSim.patient.fr = Math.max(14, activeSim.patient.fr - 4);
        outcome = "Oxygénothérapie initiée au masque à haute concentration.";
        hessQuote = "Dr Hess : On remonte le scope. Mais l'oxygène ne traite pas la cause.";
    } else if (cleanOrder.includes("remplissage") || cleanOrder.includes("sérum")) {
        if (activeSim.itemId === "158") {
            activeSim.patient.ta = "105/65";
            activeSim.patient.fc = 105;
            activeSim.score += 10;
            outcome = "Remplissage vasculaire par 500 ml de Cristalloïdes.";
            hessQuote = "Dr Hess : Correct. Restaurer la pression de perfusion est indispensable face à ce choc.";
        } else {
            activeSim.patient.fc += 10;
            activeSim.patient.spo2 -= 8;
            activeSim.score -= 15;
            outcome = "Remplissage vasculaire effectué à tort.";
            hessQuote = "Dr Hess : Bravo, vous êtes en train de le noyer en provoquant un œdème aigu du poumon.";
        }
    } else if (cleanOrder.includes("antibiothérapie") || cleanOrder.includes("antibiotique")) {
        if (activeSim.itemId === "158") {
            activeSim.score += 10;
            outcome = "Injection d'une C3G (Ceftriaxone) IV après hémocultures.";
            hessQuote = "Dr Hess : Le traitement étiologique de l'urosepsis est en route.";
        } else {
            outcome = "Antibiothérapie administrée sans cible active.";
            hessQuote = "Dr Hess : Un infarctus ne se soigne pas à l'amoxicilline.";
        }
    } else {
        outcome = `Action clinique entreprise : "${order}"`;
        hessQuote = "Dr Hess : Pourquoi pas, mais ça ne règle pas l'urgence.";
    }

    activeSim.history.push(outcome);
    res.json({ activeSim, outcome, hessQuote });
});

// Route d'état de synchronisation pour le Tableau Blanc (Front-End)
app.get('/api/get-current-sim', (req, res) => {
    res.json(activeSim);
});

app.post('/api/diagnose', (req, res) => {
    const { hypothesis } = req.body;
    let success = false;
    let finalNote = 0;

    if (activeSim.correctDiag && hypothesis.toLowerCase().includes(activeSim.correctDiag.toLowerCase())) {
        success = true;
        finalNote = Math.round(activeSim.score / 5);
        if (finalNote > 20) finalNote = 20;
        if (finalNote < 0) finalNote = 0;
    } else {
        finalNote = Math.max(0, Math.round((activeSim.score - 50) / 5));
        if (finalNote > 5) finalNote = 4;
    }

    res.json({ success, finalNote, correctAnswer: activeSim.correctDiag });
});

app.listen(PORT, () => console.log(`Serveur prêt sur le port ${PORT}`));
