const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let activeSim = {
    itemId: null,
    difficulty: 'medium',
    patient: {},
    whiteboard: [],
    correctDiag: "",
    lethalWrongDiags: [],
    investigations: {},
    history: [],
    score: 100,
    turns: 0,
    // Variables d'état dynamiques pour casser la linéarité
    liesDiscovered: false,
    searchedHome: false,
    crisisTriggered: false,
    vicodinDoses: 3,
    epiphanyUsed: false
};

const ednScenarios = {
    "158": { 
        name: "Mme Joly, 74 ans", 
        type: "Choc septique d'origine urinaire",
        desc: "Trouvée désorientée chez elle. Fièvre majeure, frissons. Sa fille prétend qu'elle a juste attrapé un 'petit coup de froid' hier.", 
        // Scope Hospitalier Réaliste
        fc: 125, ta: "82/46", spo2: 90, fr: 26, temp: 39.5, dextro: 6.1, aspect: "Marbrures aux genoux, temps de recoloration cutanée (TRC) > 4s, somnolente.",
        correctDiag: "Sepsis grave",
        lethalWrongDiags: ["Poussée de Lupus", "Insuffisance cardiaque isolée", "Surdosage en bêtabloquants"],
        // Non-linéarité : Ici, pousser l'interrogatoire déclenche un crash !
        interrogateEffect: (sim) => {
            if (!sim.liesDiscovered) {
                sim.liesDiscovered = true;
                sim.patient.fc = 140;
                sim.patient.ta = "71/39"; // Aggravation du choc
                sim.score -= 5;
                return {
                    outcome: "[CRASH CLINIQUE] En insistant agressivement, la patiente fait une crise d'angoisse majeure et s'effondre. Sa fille, paniquée, avoue enfin : 'Elle avait des brûlures urinaires atroces depuis 4 jours mais refusait les antibiotiques par conviction !'",
                    hess: "Dr Hess : Félicitations Sherlock, vous avez fait cracher le morceau à la gamine, mais le cœur de la vieille vient de lâcher une vitesse. Remplissez-moi ce lit de macromolécules avant qu'elle ne devienne une statistique (Item 158) !"
                };
            }
            return { outcome: "[Anamnèse] Plus aucune réponse, la patiente est obnubilée.", hess: "Dr Hess : Elle est en train de glisser vers le coma. Arrêtez de lui parler." };
        },
        searchEffect: (sim) => {
            if (!sim.searchedHome) {
                sim.searchedHome = true;
                sim.score += 10;
                return {
                    outcome: "[Perquisition Domicile] Votre externe revient avec un sac plastique : 'Trouvé des protections urinaires souillées de sang et une boîte de paracétamol vide dans sa poubelle.'",
                    hess: "Dr Hess : Des couches sales. Glamour. La porte d'entrée est urinaire, l'infection a colonisé le sang. C'est une pyélonéphrite qui tourne au vinaigre."
                };
            }
            return { outcome: "[Perquisition] Rien de plus.", hess: "Dr Hess : Vous cherchez quoi ? Ses bijoux ?" };
        },
        epiphany: "Vous fixez le plafond... Une fuite d'eau dans une vieille bâtisse ne détruit pas le toit, elle pourrit les fondations. Les marbrures, la fièvre, la confusion... Ce n'est pas une panne de pompe, c'est la tuyauterie qui a rompu et qui inonde le sang de toxines ! Orientez vos examens vers le bas de l'abdomen (Item 158) !",
        investigations: {
            // Examens cliniques et para-cliniques exhaustifs
            "hemocultures": { tier: 1, res: "Positives à E. Coli (2 flacons).", msg: "Élémentaire. À faire AVANT l'antibiothérapie, sans retarder la prise en charge." },
            "lactates": { tier: 1, res: "Lactatémie à 4.5 mmol/L (Hyperlactatémie critique).", msg: "Signe une hypoperfusion tissulaire périphérique. Valide le choc septique." },
            "ecbu": { tier: 1, res: "Leucocyturie massive, nitrites positifs, présence de bacilles gram négatifs.", msg: "La preuve par neuf. L'incendie a bien démarré dans la vessie." },
            "gaze du sang": { tier: 1, res: "Acidose métabolique. pH 7.29, HCO3- 16 mEq/L, biphosphates stables.", msg: "Le rein ne compense plus rien." },
            "numération formule sanguine": { tier: 1, res: "Hyperleucocytose à 18 000/mm3 avec neutrophilie.", msg: "L'armée blanche est sur le pied de guerre." },
            "crp": { tier: 2, res: "CRP à 240 mg/L.", msg: "Oui, c'est enflammé. Une information d'une banalité affligeante." },
            "tdm abdomino-pelvien": { tier: 2, res: "Infiltration de la graisse péri-rénale gauche, pas d'obstacle lithiasique.", msg: "Pas de rein en rétention. C'est rassurant, mais ça ne remplace pas une ligne de réanimation." },
            "natrémie": { tier: 2, res: "Sodium à 137 mmol/L.", msg: "Normale. Merci d'avoir gaspillé du réactif de laboratoire." },
            "ponction lombaire": { tier: 3, res: "Liquide clair, formule normale.", msg: "ERREUR GRAVE. Faire une PL sur un état de choc sans point d'appel méningé ? C'est criminel." }
        }
    },
    "339": { 
        name: "M. Kovac, 52 ans", 
        type: "Syndrome Coronarien Aigu (SCA)",
        desc: "Douleur thoracique rétrosternale, transfixiante, constrictive irradiant la mâchoire depuis 45 min. En sueur intense.", 
        fc: 98, ta: "145/92", spo2: 95, fr: 20, temp: 36.9, dextro: 5.5, aspect: "Pâleur cutanée, sueurs profuses, angoisse de mort imminente. Auscultation libre.",
        correctDiag: "SCA ST+",
        lethalWrongDiags: ["Dissection aortique", "Pneumothorax suffocant", "Embolie pulmonaire massive"],
        // Non-linéarité : Ici, la perquisition est une FAUSSE PISTE totale !
        interrogateEffect: (sim) => {
            sim.liesDiscovered = true;
            return {
                outcome: "[Anamnèse] Le patient avoue à demi-mot : 'J'ai eu une violente altercation avec mon patron, et j'ai fumé deux paquets aujourd'hui alors que j'ai arrêté il y a dix ans...'",
                hess: "Dr Hess : Le stress émotionnel et la nicotine massive... Un cocktail parfait pour spasmer ou rompre une plaque d'athérome."
            };
        },
        searchEffect: (sim) => {
            sim.searchedHome = true;
            sim.score -= 5; // Pénalité de temps car inutile ici !
            return {
                outcome: "[Fausse Piste Domicile] Les externes fouillent son appartement et trouvent des boîtes de compléments alimentaires pour le foie et du thé vert.",
                hess: "Dr Hess : Formidable. Votre équipe a perdu 15 minutes précieuses à dévaliser un herboriste pendant que les cellules myocardiques de Kovac étouffent. Rentrez au labo !"
            };
        },
        epiphany: "Un externe fait tomber sa montre connectée, l'écran s'éteint brusquement à cause d'un faux contact de la batterie. Flash. Le problème de Kovac n'est pas mécanique, c'est un problème d'alimentation directe de la pompe électrique ! Un ECG de moins de 10 minutes (Item 339) va vous montrer l'onde de lésion !",
        investigations: {
            "ecg": { tier: 1, res: "Sus-décalage du segment ST de 4mm en D2, D3, aVF avec miroir en D1, aVL.", msg: "URGENTISSIME ET PARFAIT. Vous avez le diagnostic sous les yeux : IDM inférieur. Appelez la coronarographie immédiatement !" },
            "troponine": { tier: 2, res: "Troponine I ultrasensible en cours... (Résultat dans 45min).", msg: "FAUTE STRATÉGIQUE. Sur un ST+, on n'attend PAS la biologie pour reperfuser ! Le temps, c'est du muscle." },
            "angioscanner": { tier: 3, res: "Aorte thoracique normale, pas d'embolie pulmonaire.", msg: "FAUTE LETHALE. Envoyer un infarctus en cours au scanner plutôt qu'en salle de cathétérisme coronaire ? Vous l'achevez." },
            "ionogramme": { tier: 2, res: "K+: 4.1 mmol/L, Na+: 140 mmol/L.", msg: "Le potassium est stable, au moins il ne fera pas de fibrillation de ce côté." }
        }
    }
};

app.post('/api/start-case', (req, res) => {
    const { itemId, difficulty } = req.body;
    const sc = ednScenarios[itemId] || ednScenarios["158"];
    let multiplier = difficulty === 'easy' ? 0.8 : difficulty === 'hard' ? 1.4 : 1.0;

    activeSim = {
        itemId,
        difficulty,
        patient: {
            name: sc.name,
            type: sc.type,
            status: "Détresse Stable",
            fc: Math.round(sc.fc * multiplier),
            ta: sc.ta,
            spo2: Math.max(70, Math.round(sc.spo2 / (multiplier * 0.95))),
            fr: Math.round(sc.fr * multiplier),
            temp: sc.temp,
            dextro: sc.dextro,
            aspect: sc.aspect,
            desc: sc.desc
        },
        whiteboard: [],
        correctDiag: sc.correctDiag,
        lethalWrongDiags: sc.lethalWrongDiags,
        investigations: sc.investigations,
        history: ["Patient admis aux urgences. En attente de décisions."],
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
        return res.json({ activeSim, outcome: "[Flacon vide]", hessQuote: "Dr Hess : Plus de pilules. Utilisez ce qu'il vous reste de cortex préfrontal.", success: false });
    }
    activeSim.vicodinDoses--;
    activeSim.turns++;
    let outcome = "";
    let hessQuote = "";

    if (!activeSim.epiphanyUsed) {
        activeSim.epiphanyUsed = true;
        activeSim.score -= 5;
        outcome = `[💊 ÉPIPHANIE DE HESS] ${sc.epiphany}`;
        hessQuote = "Dr Hess : *Avale sa pilule*... Bon sang, c'est pourtant évident. Vous bloquez sur un cas de première année ?";
    } else {
        activeSim.score -= 15;
        outcome = "[Addiction] Dose supplémentaire prise. Vos tremblements cessent, mais votre vision diagnostique n'avance pas.";
        hessQuote = "Dr Hess : Vous devenez addict sans même résoudre le cas. Pathétique.";
    }
    activeSim.history.push(outcome);
    res.json({ activeSim, outcome, hessQuote, success: true });
});

app.post('/api/whiteboard/add', (req, res) => {
    const { hypothesis } = req.body;
    let feedback = "";
    if (!activeSim.whiteboard.includes(hypothesis)) {
        activeSim.whiteboard.push(hypothesis);
        activeSim.history.push(`Tableau : ${hypothesis}`);
        if (activeSim.lethalWrongDiags.some(d => hypothesis.toLowerCase().includes(d.toLowerCase()))) {
            feedback = `Dr Hess : "${hypothesis} ? Si vous traitez ça à l'aveugle, vous signez son permis d'inhumer."`;
        } else if (hypothesis.toLowerCase().includes(activeSim.correctDiag.toLowerCase())) {
            feedback = `Dr Hess : "${hypothesis} ? Peut-être. Mais un bon médecin prouve ses dires avant de parier."`;
        } else {
            feedback = `Dr Hess : "${hypothesis} ? Intéressant... pour un vétérinaire."`;
            activeSim.score -= 4;
        }
    } else {
        feedback = `Dr Hess : "C'est déjà écrit."`;
    }
    res.json({ activeSim, feedback });
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
            activeSim.history.push(`[Examen Clé] ${matchedKey.toUpperCase()} : ${details.res}`);
            return res.json({ activeSim, outcome: details.res, hessQuote: `Dr Hess : ${details.msg}`, success: true });
        } else if (details.tier === 2) {
            activeSim.score -= 4;
            activeSim.history.push(`[Examen non prioritaire] ${matchedKey.toUpperCase()} : ${details.res}`);
            return res.json({ activeSim, outcome: details.res, hessQuote: `Dr Hess : ${details.msg}`, success: true });
        } else {
            activeSim.score -= 20;
            activeSim.patient.status = "AGGRAVATION SÉVÈRE";
            activeSim.history.push(`[FAUTE RECOMMANDATIONS] ${matchedKey.toUpperCase()} : ${details.res}`);
            return res.json({ activeSim, outcome: details.res, hessQuote: `Dr Hess : ${details.msg}`, success: false });
        }
    } else {
        activeSim.score -= 3;
        let outcome = "Laboratoire : Examen disponible mais non contributif pour cette symptomatologie.";
        activeSim.history.push(`[Inutile] ${examName} : Non contributif.`);
        return res.json({ activeSim, outcome, hessQuote: "Dr Hess : Arrêtez de vider les caisses de l'hôpital avec vos examens au pifomètre.", success: false });
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
        outcome = "Mise sous Oxygène haut débit (Masque haute concentration).";
        hessQuote = "Dr Hess : L'oxygénation remonte mécaniquement. Le patient respire, mais l'incendie fait toujours rage.";
    } else if (cleanOrder.includes("remplissage") || cleanOrder.includes("sérum") || cleanOrder.includes("nac l")) {
        if (activeSim.itemId === "158") {
            activeSim.patient.ta = "105/65";
            activeSim.patient.fc = 105;
            activeSim.score += 10;
            outcome = "Remplissage vasculaire par 500 ml de Cristalloïdes en 30 min.";
            hessQuote = "Dr Hess : Bien vu. Restaurer la volémie est capital dans le choc septique.";
        } else {
            activeSim.patient.status = "OAP IMMINENT";
            activeSim.patient.spo2 -= 10;
            activeSim.score -= 15;
            outcome = "Remplissage vasculaire effectué à tort.";
            hessQuote = "Dr Hess : Surcharger un cœur déjà en train d'asphyxier sur un SCA ? Génial, vous le noyez.";
        }
    } else if (cleanOrder.includes("antibiothérapie") || cleanOrder.includes("antibiotique") || cleanOrder.includes("ceftriaxone")) {
        if (activeSim.itemId === "158") {
            activeSim.score += 10;
            outcome = "Injection IV de Ceftriaxone après réalisation des prélèvements.";
            hessQuote = "Dr Hess : Enfin du lourd. Le traitement étiologique de l'Item 158 est lancé.";
        } else {
            outcome = "Antibiotiques injectés sans effet clinique.";
            hessQuote = "Dr Hess : Il fait un infarctus et vous traitez des bactéries imaginaires. Bravo.";
        }
    } else {
        outcome = `Action clinique enregistrée : "${order}"`;
        hessQuote = "Dr Hess : Mouais. Pas de quoi révolutionner l'histoire de la médecine.";
    }

    activeSim.history.push(outcome);
    res.json({ activeSim, outcome, hessQuote });
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
        if (finalNote > 5) finalNote = 4; // Zéro pédagogique si faute étiologique majeure
    }

    res.json({ success, finalNote, correctAnswer: activeSim.correctDiag });
});

app.listen(PORT, () => console.log(`Serveur prêt sur le port ${PORT}`));
