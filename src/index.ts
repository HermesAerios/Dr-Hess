import http from 'http';
import { HouseEngine } from './core/engine/HouseEngine';
import { TextAnalyzer } from './core/nlp/TextAnalyzer';

const port = process.env.PORT || 3000;
const gameEngine = new HouseEngine('CASE_HOUSE_001_WILSON');

// --- BASE DE DONNÉES EN MÉMOIRE VIVE (Serveur) ---
let currentPatient = gameEngine.getInitialPatient();
let gameLogs: string[] = [];
let isGameActive = false;
let isStable = false; 
let isGameOver = false;

// Variables cliniques avancées
let activeDifficulty = "facile";
let caseTitle = "";
let caseDescription = "";
let hrIncrement = 1;
let satDecrement = 0.2;

// Objectifs de survie spécifiques aux cas complexes
let clinicalState = {
    antibioticGiven: false,
    fluidResuscitationDone: false, // Remplissage vasculaire pour le choc
    oxygenAdministered: false      // Oxygène pour la détresse respi
};

// Carnet d'erreurs persistant
interface ErrorNote {
    id: number;
    item: string;
    note: string;
    timestamp: string;
}
let errorLogDatabase: ErrorNote[] = [
    {
        id: 1,
        item: "Item 148",
        note: "Rappel crucial : Devant un purpura fulminans, l'antibiothérapie probabiliste (Céfotaxime ou Amoxicilline) doit être injectée IMMÉDIATEMENT, avant même de réaliser la ponction lombaire ou d'attendre le labo.",
        timestamp: "04/07/2026"
    }
];
let nextNoteId = 2;

// ----------------------------------------------------------------
// 🧠 LE MOTEUR DE SARCASME DU DR HESS (Générateur de répliques)
// ----------------------------------------------------------------
function generateHessComment(trigger: string, context?: any): string {
    const quotes: Record<string, string[]> = {
        start_facile: [
            "👨‍⚕️ [DR HESS] Une méningite franche... Même un vétérinaire rattaché à un zoo de province s'en sortirait. Ne me décevez pas, l'interne.",
            "👨‍⚕️ [DR HESS] Ah, le niveau débutant. Parfait pour vos compétences limitées. Tentez de ne pas le tuer en lui disant bonjour."
        ],
        start_modere: [
            "👨‍⚕️ [DR HESS] Un sepsis sur érysipèle. C'est mignon. Attention à ce que ça ne devienne pas une gangrène pendant que vous relisez vos fiches de cours.",
            "👨‍⚕️ [DR HESS] Ne restez pas planté là à regarder ses marbrures comme si c'était une œuvre d'art moderne. Bougez-vous."
        ],
        start_difficile: [
            "👨‍⚕️ [DR HESS] Purpura fulminans avec choc septique. Là, on s'amuse. Si vous avez envie de pleurer, allez aux toilettes, le patient n'a pas le temps."
        ],
        invalid: [
            "👨‍⚕️ [DR HESS] Intéressant. Vous essayez de le tuer plus vite pour libérer un lit ? Cet ordre ne sert strictement à rien.",
            "👨‍⚕️ [DR HESS] Est-ce que vous avez trouvé votre diplôme de médecine dans une boîte de céréales ? Refaites un geste utile.",
            "👨‍⚕️ [DR HESS] Drôle d'idée. Si l'incompétence était douloureuse, vous seriez sous morphine."
        ],
        exam_clinical: [
            "👨‍⚕️ [DR HESS] Regarder le scope ne va pas réparer ses organes. Vous comptez contempler son agonie encore longtemps ou vous allez agir ?",
            "👨‍⚕️ [DR HESS] Félicitations, vous savez lire des chiffres sur un écran. Maintenant, prenez une vraie décision thérapeutique."
        ],
        exam_lab: [
            "👨‍⚕️ [DR HESS] Ah, la paperasse. Les lactates explosent, mais rassurez-vous : au moins on aura un très joli dossier pour l'autopsie si vous continuez à ce rythme.",
            "👨‍⚕️ [DR HESS] Demander des bilans c'est bien, avoir un cerveau pour les interpréter c'est mieux."
        ],
        antibio_success: [
            "👨‍⚕️ [DR HESS] Miracle ! L'amoxicilline est injectée. Les bactéries font leurs valises. Vous voulez une médaille ou on s'occupe du reste ?"
        ],
        antibio_missing_shock: [
            "👨‍⚕️ [DR HESS] Bravo, les bactéries meurent. Dommage que le cœur du patient s'arrête aussi faute de sang. Pensez au contenant, pas juste au contenu !",
            "👨‍⚕️ [DR HESS] L'antibiotique navigue dans des artères complètement vides. Sans pression artérielle, votre médicament n'arrivera jamais au cerveau. Réfléchissez !"
        ],
        fluids: [
            "👨‍⚕️ [DR HESS] Tiens, vous avez compris qu'un tuyau vide ne fonctionne pas. Le remplissage est lancé. Il était presque trop tard.",
            "👨‍⚕️ [DR HESS] Remplissage vasculaire initié. Le patient récupère un semblant de dignité hémodynamique. Ne gâchez pas tout."
        ],
        oxygen: [
            "👨‍⚕️ [DR HESS] De l'oxygène. Original. Ça évitera au moins que ses neurones ne grillent avant les vôtres.",
            "👨‍⚕️ [DR HESS] Saturation en hausse. Il respire. Dommage que ça ne soigne pas la cause sous-jacente."
        ],
        victory: [
            "👨‍⚕️ [DR HESS] Le patient survit. Incroyable. Ne vous y habituez pas, c'était manifestement un malentendu ou un coup de chance.",
            "👨‍⚕️ [DR HESS] Bon, il est stabilisé. Ne venez pas vous vanter, j'aurais fait la même chose en trois fois moins de temps avec une canne et une seule main."
        ],
        death: [
            "👨‍⚕️ [DR HESS] Et voilà, arrêt cardiaque. Mort. Heureusement que ce n'est qu'un simulateur, sinon vous seriez déjà en train de préparer votre reconversion professionnelle.",
            "👨‍⚕️ [DR HESS] Game over. Le patient est parti à la morgue. La prochaine fois, essayez d'ouvrir un bouquin de médecine avant d'entrer en salle de déchocage."
        ]
    };

    const list = quotes[trigger] || ["👨‍⚕️ [DR HESS] Continuez, je vous regarde échouer avec fascination."];
    return list[Math.floor(Math.random() * list.length)];
}

// ----------------------------------------------------------------
// ⏳ BOUCLE DE DÉGRADATION CLINIQUE
// ----------------------------------------------------------------
setInterval(() => {
    if (!isGameActive || isGameOver || isStable) return;

    currentPatient.vitals.heartRate += hrIncrement;
    currentPatient.vitals.oxygenSaturation = Math.max(70, currentPatient.vitals.oxygenSaturation - satDecrement);

    if (activeDifficulty === 'difficile') {
        if (!clinicalState.fluidResuscitationDone) {
            currentPatient.vitals.heartRate += 3; 
            if (currentPatient.vitals.heartRate % 5 === 0) {
                gameLogs.push("🚨 [ALERTE CHOC] La tension s'effondre ! Le patient fait un choc distributif.");
                if (Math.random() > 0.4) gameLogs.push("👨‍⚕️ [DR HESS] (Murmure) Le poul grimpe, la tension coule... À votre avis, gros malin, qu'est-ce qui manque dans ses vaisseaux ?");
            }
        }
        if (!clinicalState.oxygenAdministered && currentPatient.vitals.oxygenSaturation < 90) {
            currentPatient.vitals.oxygenSaturation -= 0.5;
        }
    }

    if (currentPatient.vitals.heartRate >= 160 || currentPatient.vitals.oxygenSaturation <= 78) {
        isGameOver = true;
        gameLogs.push(`💀 [DÉCÈS PATIENT] Arrêt cardio-respiratoire en mode [${activeDifficulty.toUpperCase()}].`);
        gameLogs.push(generateHessComment('death'));
    }
}, 10000);



const server = http.createServer((req, res) => {
    const url = req.url || '';

    // --- 1. ROUTE API : Récupérer l'état complet ---
    if (url === '/api/status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            vitals: currentPatient.vitals, 
            logs: gameLogs, 
            isGameActive, 
            isGameOver, 
            isStable,
            caseTitle,
            caseDescription,
            activeDifficulty,
            clinicalState
        }));
        return;
    }

    // --- 2. ROUTE API : Gestion CRUD du Carnet d'Erreurs ---
    if (url === '/api/errors' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(errorLogDatabase));
        return;
    }

    if (url === '/api/errors' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                if (data.action === 'add') {
                    const newNote: ErrorNote = {
                        id: nextNoteId++,
                        item: data.item || "Item Général",
                        note: data.note,
                        timestamp: new Date().toLocaleDateString('fr-FR')
                    };
                    errorLogDatabase.unshift(newNote);
                } 
                else if (data.action === 'delete') {
                    errorLogDatabase = errorLogDatabase.filter(n => n.id !== data.id);
                } 
                else if (data.action === 'edit') {
                    const noteToEdit = errorLogDatabase.find(n => n.id === data.id);
                    if (noteToEdit) noteToEdit.note = data.note;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, database: errorLogDatabase }));
            } catch (e) {
                res.writeHead(400); res.end('Erreur traitement carnet');
            }
        });
        return;
    }

    // --- 3. ROUTE API : Initialisation d'une Urgence ---
    if (url === '/api/start' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                activeDifficulty = data.difficulty;
                
                isGameActive = true;
                isStable = false;
                isGameOver = false;
                gameLogs = [];
                clinicalState = { antibioticGiven: false, fluidResuscitationDone: false, oxygenAdministered: false };
                currentPatient = gameEngine.getInitialPatient();

                if (activeDifficulty === 'facile') {
                    caseTitle = "Item 148 - Syndrome Méningé Aigu Infantile";
                    caseDescription = "Clara Lombardi, 4 ans, 39.5°C, céphalées et photophobie. Pas de purpura cutané visible au premier examen.";
                    currentPatient.vitals.heartRate = 95;
                    currentPatient.vitals.oxygenSaturation = 97;
                    hrIncrement = 2;
                    satDecrement = 0.2;
                    gameLogs.push(generateHessComment('start_facile'));
                } 
                else if (activeDifficulty === 'modere') {
                    caseTitle = "Item 344 - Sepsis d'Origine Cutanée";
                    caseDescription = "Érysipèle étendu de jambe gauche avec frissons et marbrures débutantes aux genoux. Cinétique modérée.";
                    currentPatient.vitals.heartRate = 115;
                    currentPatient.vitals.oxygenSaturation = 93;
                    hrIncrement = 3;
                    satDecrement = 0.6;
                    gameLogs.push(generateHessComment('start_modere'));
                } 
                else if (activeDifficulty === 'difficile') {
                    caseTitle = "Item 148/344 - Purpura Fulminans & Choc Septique";
                    caseDescription = "Patient somnolent, 3 éléments purpuriques >3mm découverts. TRC allongé à 5 secondes. Choc foudroyant.";
                    currentPatient.vitals.heartRate = 135;
                    currentPatient.vitals.oxygenSaturation = 86;
                    hrIncrement = 4;
                    satDecrement = 1.0;
                    gameLogs.push(generateHessComment('start_difficile'));
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                res.writeHead(400); res.end('Erreur sélection cas');
            }
        });
        return;
    }

    // --- 4. ROUTE API : Analyse Clinique Textuelle & Sarcasme ---
    if (url === '/api/command' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const rawCommand = data.command.toLowerCase().trim();
                let reply = '';
                let hessComment = '';

                gameLogs.push(`➔ ${data.command}`);

                // Actions thérapeutiques prioritaires
                if (rawCommand.includes('remplissage') || rawCommand.includes('serum') || rawCommand.includes('perfuse')) {
                    clinicalState.fluidResuscitationDone = true;
                    reply = "💧 [SÉCURISATION] Pose d'une VVP. Remplissage par Cristalloïdes initié.";
                    hessComment = generateHessComment('fluids');
                } 
                else if (rawCommand.includes('oxygene') || rawCommand.includes('masque') || rawCommand.includes('o2')) {
                    clinicalState.oxygenAdministered = true;
                    currentPatient.vitals.oxygenSaturation = Math.min(99, currentPatient.vitals.oxygenSaturation + 8);
                    reply = "🫁 [OXYGÉNOTHÉRAPIE] Masque haute concentration à 15L/min posé.";
                    hessComment = generateHessComment('oxygen');
                }
                else {
                    const analysis = TextAnalyzer.analyze(data.command);
                    if (analysis.intent === 'TRAITEMENT' && analysis.target === 'amoxicilline') {
                        clinicalState.antibioticGiven = true;
                        reply = "💉 [ANTIBIOTHÉRAPIE] Injection IV directe d'Amoxicilline exécutée.";
                        
                        // Condition de commentaire vicieux si en difficile sans remplissage
                        if (activeDifficulty === 'difficile' && !clinicalState.fluidResuscitationDone) {
                            hessComment = generateHessComment('antibio_missing_shock');
                        } else {
                            hessComment = generateHessComment('antibio_success');
                        }
                    } 
                    else if (analysis.intent === 'EXAMEN_CLINIQUE') {
                        reply = `🩺 [EXAMEN] FC : ${currentPatient.vitals.heartRate} bpm, Sat O2 : ${currentPatient.vitals.oxygenSaturation}%. TRC : ${activeDifficulty === 'difficile' && !clinicalState.fluidResuscitationDone ? '>4s' : '<2s'}.`;
                        hessComment = generateHessComment('exam_clinical');
                    } 
                    else if (analysis.intent === 'EXAMEN_LABO') {
                        reply = `🧪 [LABO] Lactates : ${activeDifficulty === 'difficile' ? '4.2 mmol/L (Critique)' : '1.1 mmol/L'}.`;
                        hessComment = generateHessComment('exam_lab');
                    } 
                    else {
                        reply = "⚠️ [ORDRE NON RECONNU] Ce geste ne stabilise aucun paramètre vital.";
                        hessComment = generateHessComment('invalid');
                    }
                }

                gameLogs.push(reply);
                if (hessComment) gameLogs.push(hessComment);

                // CONDITIONS DE VICTOIRE ACCRUES
                if (activeDifficulty === 'facile' && clinicalState.antibioticGiven) isStable = true;
                else if (activeDifficulty === 'modere' && clinicalState.antibioticGiven) isStable = true;
                else if (activeDifficulty === 'difficile' && clinicalState.antibioticGiven && clinicalState.fluidResuscitationDone) {
                    isStable = true;
                }

                if (isStable) {
                    gameLogs.push(`🎉 [VICTOIRE CLINIQUE] Patient stabilisé avec succès.`);
                    gameLogs.push(generateHessComment('victory'));
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ vitals: currentPatient.vitals, logs: gameLogs, isGameOver, isStable, clinicalState }));
            } catch (e) {
                res.writeHead(400); res.end('Erreur commande');
            }
        });
        return;
    }

    // --- 5. INTERFACE DASHBOARD (HTML AVEC STYLE HESS SPECIAL) ---
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <title>Dr-Hess — Hub EDN</title>
        <style>
            body { background-color: #060b13; color: #e2e8f0; font-family: monospace; padding: 20px; margin: 0; }
            header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 15px; margin-bottom: 25px; }
            
            .nav-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
            .tab-btn { background: #0f172a; border: 1px solid #1e293b; color: #94a3b8; padding: 12px 24px; font-weight: bold; cursor: pointer; border-radius: 4px; font-family: monospace; }
            .tab-btn.active { background: #00f2fe; color: #000; border-color: #00f2fe; box-shadow: 0 0 8px rgba(0,242,254,0.2); }

            .tab-panel { display: none; }
            .tab-panel.active { display: block; }
            .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; padding: 20px; margin-bottom: 20px; }
            
            .launcher-box { text-align: center; max-width: 600px; margin: 40px auto; padding: 30px; border: 1px dashed #334155; }
            .selector-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 25px 0; }
            .tile { background: #1e293b; border: 1px solid #334155; padding: 20px; border-radius: 6px; cursor: pointer; transition: 0.2s; }
            input[type="radio"] { display: none; }
            input[type="radio"]:checked + .tile { border-color: #00f2fe; background: rgba(0,242,254,0.05); color: #00f2fe; }

            .workspace { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .monitor { background: #020617; border: 2px solid #39ff14; padding: 15px; font-size: 24px; color: #39ff14; border-radius: 4px; margin: 15px 0; }
            .monitor.danger-pulse { animation: blink 0.6s infinite; border-color: #ef4444; color: #ef4444; }
            .log-box { background: #020617; border: 1px solid #1e293b; height: 350px; overflow-y: auto; padding: 12px; color: #38bdf8; font-size: 14px; margin-bottom: 12px; }
            .btn-prime { background: #00f2fe; color: #000; border: none; padding: 12px 24px; font-weight: bold; cursor: pointer; border-radius: 4px; font-family: monospace; }
            .btn-danger { background: #ef4444; color: #fff; border: none; padding: 8px 16px; cursor: pointer; border-radius: 4px; font-family: monospace; }

            .item-row { display: flex; align-items: center; background: #1e293b; padding: 12px; margin-bottom: 8px; border-radius: 4px; }
            .note-card { background: #111827; border-left: 4px solid #00f2fe; padding: 15px; margin-bottom: 12px; border-radius: 4px; }
            .note-card.error-type { border-left-color: #ef4444; }
            .note-actions { display: flex; gap: 10px; margin-top: 10px; justify-content: flex-end; }
            .inline-btn { background: none; border: 1px solid #4b5563; color: #94a3b8; padding: 4px 8px; cursor: pointer; font-size: 12px; }
            .inline-btn:hover { color: #fff; border-color: #fff; }

            .post-game-box { background: rgba(0, 242, 254, 0.05); border: 1px solid #00f2fe; padding: 15px; margin-top: 15px; border-radius: 4px; }
            @keyframes blink { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        </style>
    </head>
    <body>

        <header>
            <div>
                <h2 style="margin:0; color:#00f2fe;">DR-HESS // DISPATCHER CLINIQUE</h2>
                <small style="color:#64748b;">Chef de service : Dr Hess (Méprisant et disponible)</small>
            </div>
            <div id="progressHeader" style="color:#39ff14; font-weight:bold;">Référentiel EDN : 0%</div>
        </header>

        <nav class="nav-tabs">
            <button class="tab-btn active" id="btn-tab-sim" onclick="switchTab('sim')">🎮 Salle de Déchocage</button>
            <button class="tab-btn" id="btn-tab-ref" onclick="switchTab('ref')">📚 Programme EDN</button>
            <button class="tab-btn" id="btn-tab-err" onclick="switchTab('err')">📓 Carnet d'Erreurs (<span id="errCount">0</span>)</button>
        </nav>

        <div id="tab-sim" class="tab-panel active">
            
            <!-- ACCUEIL NEUTRE -->
            <div id="launcher-view" class="launcher-box card">
                <h3 style="margin-top:0; color:#00f2fe;">🔬 Initialisation d'une Urgence Standardisée</h3>
                <p style="color:#94a3b8;">Choisissez votre épreuve. Le Dr Hess évaluera sévèrement votre rapidité d'exécution.</p>
                
                <div class="selector-grid">
                    <label>
                        <input type="radio" name="diffSelect" value="facile" checked>
                        <div class="tile">🟢<br><b>FACILE</b><br><small style="color:#64748b;">Syndrome méningé</small></div>
                    </label>
                    <label>
                        <input type="radio" name="diffSelect" value="modere">
                        <div class="tile">🟡<br><b>MODÉRÉ</b><br><small style="color:#64748b;">Sepsis cutané</small></div>
                    </label>
                    <label>
                        <input type="radio" name="diffSelect" value="difficile">
                        <div class="tile">🔴<br><b>DIFFICILE</b><br><small style="color:#64748b;">Purpura & Choc vitale</small></div>
                    </label>
                </div>
                
                <button class="btn-prime" style="width:100%; padding:15px;" onclick="launchScenario()">PRENDRE LE CAS EN CHARGE</button>
            </div>

            <!-- ESPACE SIMULATION -->
            <div id="active-game-view" class="workspace" style="display:none;">
                <div class="card">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h3 id="txtCaseTitle" style="margin:0; color:#ef4444;">--</h3>
                        <button class="btn-danger" onclick="abortGame()">Abandonner le patient</button>
                    </div>
                    <p id="txtCaseDesc" style="color:#94a3b8; font-size:14px; line-height:1.5; min-height:60px;">--</p>
                    
                    <div class="monitor" id="monitorBox">
                        <div>❤️ Fréquence Cardiaque : <span id="lblFc">--</span> bpm</div>
                        <div style="margin-top:10px;">🫁 Saturation Oxygène : <span id="lblSat">--</span> %</div>
                    </div>

                    <div id="targetsIndicator" style="font-size:12px; color:#94a3b8; line-height:1.6;">
                        🎯 Objectifs requis : <br>
                        - Antibiothérapie efficace : <span id="tgtAnti">❌</span><br>
                        - Oxygénothérapie adéquate : <span id="tgtO2">❌</span><br>
                        - Remplissage (si choc résistant) : <span id="tgtFluids">❌</span>
                    </div>

                    <div id="postGamePanel" class="post-game-box" style="display:none;">
                        <h4 style="margin:0 0 8px 0; color:#00f2fe;">📝 Consigner une erreur de raisonnement</h4>
                        <p style="margin:0 0 10px 0; font-size:12px; color:#cbd5e1;">Qu'est-ce que vous avez raté ou appris sur ce cas ? Écrivez-le ici :</p>
                        <input type="text" id="txtNewErrorInput" style="width:100%; background:#020617; border:1px solid #334155; padding:8px; color:#fff; margin-bottom:8px;" placeholder="Ex: Ne pas oublier le remplissage en cas de purpura fulminans...">
                        <button class="btn-prime" style="padding:6px 12px; font-size:12px;" onclick="saveErrorFromPostGame()">Sauvegarder au carnet</button>
                    </div>
                </div>

                <div class="card" style="display:flex; flex-direction:column; justify-content:space-between;">
                    <h3 style="margin-top:0; color:#94a3b8;">Terminal de prescriptions</h3>
                    <div class="log-box" id="logBox"></div>
                    <div style="display:flex; gap:10px;">
                        <input type="text" id="cmdInput" style="flex:1; background:#020617; border:1px solid #1e293b; padding:12px; color:#fff;" placeholder="Ex: prescrire amoxicilline, poser remplissage..." onkeypress="if(event.key==='Enter') submitCommand()">
                        <button class="btn-prime" id="sendBtn" onclick="submitCommand()">Ordonner</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ONGLET 2 : PROGRAMME -->
        <div id="tab-ref" class="tab-panel">
            <div class="card">
                <h3>Suivi Référentiel</h3>
                <div class="item-row"><input type="checkbox" id="c1" onchange="updateProgress()"><label for="c1" style="margin-left:10px;"><b>Item 148</b> — Méningites / Purpura Fulminans</label></div>
                <div class="item-row"><input type="checkbox" id="c2" onchange="updateProgress()"><label for="c2" style="margin-left:10px;"><b>Item 344</b> — Sepsis / Parties molles</label></div>
            </div>
        </div>

        <!-- ONGLET 3 : CARNET CRUD -->
        <div id="tab-err" class="tab-panel">
            <div class="card">
                <h3 style="color:#00f2fe; margin-top:0;">📓 Mes Pièges & Erreurs Courantes</h3>
                
                <div style="background:#1e293b; padding:15px; border-radius:6px; margin-bottom:20px; display:flex; gap:10px; align-items:flex-end;">
                    <div style="flex:1;">
                        <label style="font-size:11px; color:#94a3b8;">Code Item :</label>
                        <input type="text" id="manualItem" placeholder="Item 148" style="width:100%; background:#060b13; border:1px solid #334155; padding:8px; color:#fff;">
                    </div>
                    <div style="flex:3;">
                        <label style="font-size:11px; color:#94a3b8;">Notion ou erreur apprise :</label>
                        <input type="text" id="manualNote" placeholder="La règle d'or pour le concours..." style="width:100%; background:#060b13; border:1px solid #334155; padding:8px; color:#fff;">
                    </div>
                    <button class="btn-prime" style="padding:8px 16px;" onclick="addManualError()">Ajouter</button>
                </div>

                <div id="errorNotesContainer"></div>
            </div>
        </div>

        <script>
            let currentActiveTab = 'sim';

            function switchTab(tabId) {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                document.getElementById('btn-tab-' + tabId).classList.add('active');
                document.getElementById('tab-' + tabId).classList.add('active');
                if(tabId === 'err') fetchErrorDatabase();
            }

            function updateProgress() {
                let checked = document.querySelectorAll('.item-row input:checked').length;
                let pct = Math.round((checked / 2) * 100);
                document.getElementById('progressHeader').innerText = "Référentiel EDN : " + pct + "%";
            }

            async function launchScenario() {
                const diff = document.querySelector('input[name="diffSelect"]:checked').value;
                const res = await fetch('/api/start', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ difficulty: diff })
                });
                const data = await res.json();
                if(data.success) {
                    document.getElementById('launcher-view').style.display = 'none';
                    document.getElementById('active-game-view').style.display = 'grid';
                    document.getElementById('postGamePanel').style.display = 'none';
                    document.getElementById('cmdInput').disabled = false;
                    document.getElementById('sendBtn').disabled = false;
                    fetchStatus();
                }
            }

            function abortGame() {
                if(confirm("Abandonner la simulation en cours ?")) window.location.reload();
            }

            async function fetchStatus() {
                try {
                    const res = await fetch('/api/status');
                    const data = await res.json();
                    if (!data.isGameActive) return;

                    document.getElementById('txtCaseTitle').innerText = data.caseTitle;
                    document.getElementById('txtCaseDesc').innerText = data.caseDescription;
                    document.getElementById('lblFc').innerText = data.vitals.heartRate;
                    document.getElementById('lblSat').innerText = data.vitals.oxygenSaturation;

                    if(data.vitals.heartRate >= 130 || data.vitals.oxygenSaturation <= 90) {
                        document.getElementById('monitorBox').classList.add('danger-pulse');
                    } else {
                        document.getElementById('monitorBox').classList.remove('danger-pulse');
                    }

                    document.getElementById('tgtAnti').innerText = data.clinicalState.antibioticGiven ? "✅" : "❌";
                    document.getElementById('tgtO2').innerText = data.clinicalState.oxygenAdministered ? "✅" : "❌";
                    document.getElementById('tgtFluids').innerText = data.clinicalState.fluidResuscitationDone ? "✅" : "❌";

                    document.getElementById('logBox').innerHTML = data.logs.map(l => {
                        if(l.includes('👨‍⚕️')) return `<div style="color:#e9d5ff; background:rgba(168,85,247,0.1); border-left:3px solid #c084fc; padding:6px; margin-bottom:8px; font-style:italic;">${l}</div>`;
                        if(l.includes('🚨') || l.includes('💀')) return `<div style="color:#ef4444; font-weight:bold; margin-bottom:5px;">${l}</div>`;
                        if(l.includes('🎉') || l.includes('💉') || l.includes('💧')) return `<div style="color:#10b981; font-weight:bold; margin-bottom:5px;">${l}</div>`;
                        return `<div style="margin-bottom:4px; color:#94a3b8;">${l}</div>`;
                    }).join('');
                    
                    if(data.isGameOver || data.isStable) {
                        document.getElementById('cmdInput').disabled = true;
                        document.getElementById('sendBtn').disabled = true;
                        document.getElementById('postGamePanel').style.display = 'block';
                    }
                } catch(e) {}
            }
            setInterval(fetchStatus, 2000);

            async function submitCommand() {
                const input = document.getElementById('cmdInput');
                if(!input.value.trim()) return;
                
                await fetch('/api/command', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ command: input.value.trim() })
                });
                input.value = '';
                fetchStatus();
            }

            async function fetchErrorDatabase() {
                const res = await fetch('/api/errors');
                const list = await res.json();
                document.getElementById('errCount').innerText = list.length;
                const container = document.getElementById('errorNotesContainer');
                
                if(list.length === 0) {
                    container.innerHTML = `<p style="color:#64748b; text-align:center;">Aucune fiche.</p>`;
                    return;
                }

                container.innerHTML = list.map(n => `
                    <div class="note-card">
                        <div style="display:flex; justify-content:space-between; font-size:11px; color:#64748b; margin-bottom:6px;">
                            <span>📌 <b>${n.item}</b></span>
                            <span>📅 ${n.timestamp}</span>
                        </div>
                        <div id="note-txt-${n.id}" style="font-size:14px; color:#cbd5e1;">${n.note}</div>
                        <div class="note-actions">
                            <button class="inline-btn" onclick="triggerEditNote(${n.id}, \`${n.note}\`)">✏️ Modifier</button>
                            <button class="inline-btn" style="color:#ef4444;" onclick="deleteNote(${n.id})">🗑️ Supprimer</button>
                        </div>
                    </div>
                `).join('');
            }

            async function addManualError() {
                const item = document.getElementById('manualItem').value.trim();
                const note = document.getElementById('manualNote').value.trim();
                if(!note) return alert("Contenu obligatoire.");
                await fetch('/api/errors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'add', item: item || "Général", note: note })
                });
                document.getElementById('manualItem').value = '';
                document.getElementById('manualNote').value = '';
                fetchErrorDatabase();
            }

            async function saveErrorFromPostGame() {
                const text = document.getElementById('txtNewErrorInput').value.trim();
                if(!text) return alert("Rédigez la note.");
                await fetch('/api/errors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'add', item: "Retour Simulation", note: text })
                });
                alert("Erreur consignée !");
                document.getElementById('postGamePanel').style.display = 'none';
                fetchErrorDatabase();
            }

            async function deleteNote(id) {
                if(confirm("Supprimer ?")) {
                    await fetch('/api/errors', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'delete', id: id })
                    });
                    fetchErrorDatabase();
                }
            }

            function triggerEditNote(id, oldText) {
                const div = document.getElementById('note-txt-' + id);
                div.innerHTML = `
                    <textarea id="edit-area-${id}" style="width:100%; background:#060b13; color:#fff; border:1px solid #00f2fe; padding:6px; font-family:monospace;">${oldText}</textarea>
                    <button class="btn-prime" style="padding:4px 8px; font-size:11px; margin-top:5px;" onclick="saveEditedNote(${id})">Sauver</button>
                `;
            }

            async function saveEditedNote(id) {
                const newText = document.getElementById('edit-area-' + id).value.trim();
                if(!newText) return;
                await fetch('/api/errors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'edit', id: id, note: newText })
                });
                fetchErrorDatabase();
            }

            fetchErrorDatabase();
        </script>
    </body>
    </html>
    `);
});

server.listen(port, () => {
    console.log(`🚀 Hub EDN avec Dr Hess actif sur le port ${port}`);
});
