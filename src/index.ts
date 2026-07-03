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

// Carnet d'erreurs persistant (pendant la vie du serveur)
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
// ⏳ LE MOTEUR CLINIQUE EN TEMPS RÉEL (BOUCLE DE DÉGRADATION)
// ----------------------------------------------------------------
setInterval(() => {
    if (!isGameActive || isGameOver || isStable) return;

    // Dégradation physiologique de base
    currentPatient.vitals.heartRate += hrIncrement;
    currentPatient.vitals.oxygenSaturation = Math.max(70, currentPatient.vitals.oxygenSaturation - satDecrement);

    // LOGIQUE DE MORT COMPLEXE SELON LE SCÉNARIO
    if (activeDifficulty === 'difficile') {
        // En choc septique, si aucun remplissage n'est fait, le cœur s'emballe bcp plus vite
        if (!clinicalState.fluidResuscitationDone) {
            currentPatient.vitals.heartRate += 3; 
            if (currentPatient.vitals.heartRate % 4 === 0) {
                gameLogs.push("🚨 [ALERTE CHOC] La tension s'effondre ! Le patient fait un choc distributif. Il faut un remplissage vasculaire immédiat !");
            }
        }
        if (!clinicalState.oxygenAdministered && currentPatient.vitals.oxygenSaturation < 90) {
            currentPatient.vitals.oxygenSaturation -= 0.5;
        }
    }

    // Seuil fatidique
    if (currentPatient.vitals.heartRate >= 160 || currentPatient.vitals.oxygenSaturation <= 78) {
        isGameOver = true;
        gameLogs.push(`💀 [DÉCÈS PATIENT] Arrêt cardio-respiratoire. Échec de la prise en charge en mode [${activeDifficulty.toUpperCase()}].`);
    }
}, 10000);



const server = http.createServer((req, res) => {
    // URL parsing simple pour les requêtes API
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
                    errorLogDatabase.unshift(newNote); // Ajouter au début
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
                res.writeHead(400); res.end('Erreur traitement carnet d\'erreurs');
            }
        });
        return;
    }

    // --- 3. ROUTE API : Initialisation d'une Urgence Réelle ---
    if (url === '/api/start' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                activeDifficulty = data.difficulty;
                
                // Reboot des états mécaniques
                isGameActive = true;
                isStable = false;
                isGameOver = false;
                gameLogs = [];
                clinicalState = { antibioticGiven: false, fluidResuscitationDone: false, oxygenAdministered: false };
                currentPatient = gameEngine.getInitialPatient();

                // CONFIGURATION LOGIQUE ET BIOLOGIQUE DES CAS
                if (activeDifficulty === 'facile') {
                    caseTitle = "Item 148 - Syndrome Méningé Aigu Infantile";
                    caseDescription = "Clara Lombardi, 4 ans, amenée pour fièvre à 39.5°C, céphalées intenses et photophobie. Pas de signes de choc cutané. Constantes initiales modérément perturbées. Évolution prévisible.";
                    currentPatient.vitals.heartRate = 95;
                    currentPatient.vitals.oxygenSaturation = 97;
                    hrIncrement = 2;
                    satDecrement = 0.2;
                } 
                else if (activeDifficulty === 'modere') {
                    caseTitle = "Item 344 - Sepsis d'Origine Cutanée (Parties Molles)";
                    caseDescription = "Patient présentant un érysipèle étendu du membre inférieur gauche avec frissons, marbrures discrètes aux genoux. Dégradation hémodynamique modérée. Demande un contrôle rapide.";
                    currentPatient.vitals.heartRate = 115;
                    currentPatient.vitals.oxygenSaturation = 93;
                    hrIncrement = 3;
                    satDecrement = 0.6;
                } 
                else if (activeDifficulty === 'difficile') {
                    caseTitle = "Item 148/344 - Purpura Fulminans & Choc Septique";
                    caseDescription = "URGENCE ABSOLUE. Patient léthargique, présence de 3 éléments purpuriques de plus de 3mm sur le tronc. Extrémités froides, temps de recoloration cutanée (TRC) à 5 secondes. Décompensation foudroyante imminente.";
                    currentPatient.vitals.heartRate = 135;
                    currentPatient.vitals.oxygenSaturation = 86;
                    hrIncrement = 4; // Agonie ultra rapide
                    satDecrement = 1.0;
                }

                gameLogs.push(`[SYSTEME] Admission validée. Début de la prise en charge clinique.`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                res.writeHead(400); res.end('Erreur sélection cas');
            }
        });
        return;
    }

    // --- 4. ROUTE API : Analyse Clinique Textuelle (NLP avancé selon Scénario) ---
    if (url === '/api/command' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const rawCommand = data.command.toLowerCase().trim();
                let reply = '';

                gameLogs.push(`➔ ${data.command}`);

                // Analyse sémantique customisée pour enrichir le TextAnalyzer sur les gestes critiques
                if (rawCommand.includes('remplissage') || rawCommand.includes('serum') || rawCommand.includes('perfuse')) {
                    clinicalState.fluidResuscitationDone = true;
                    reply = "💧 [SÉCURISATION] Pose d'une VVP de gros calibre. Remplissage par 30 ml/kg de Cristalloïdes initié. La défaillance hémodynamique est freinée.";
                } 
                else if (rawCommand.includes('oxygene') || rawCommand.includes('masque') || rawCommand.includes('o2')) {
                    clinicalState.oxygenAdministered = true;
                    currentPatient.vitals.oxygenSaturation = Math.min(99, currentPatient.vitals.oxygenSaturation + 8);
                    reply = "🫁 [OXYGÉNOTHÉRAPIE] Mise en place d'un masque à haute concentration (15L/min). Amélioration immédiate de l'hématose.";
                }
                else {
                    // Passage par le NLP de base pour les molécules et examens
                    const analysis = TextAnalyzer.analyze(data.command);
                    if (analysis.intent === 'TRAITEMENT' && analysis.target === 'amoxicilline') {
                        clinicalState.antibioticGiven = true;
                        reply = "💉 [ANTIBIOTHÉRAPIE] Injection IV directe d'Amoxicilline. Le traitement bactéricide cible le compartiment vasculaire.";
                    } else if (analysis.intent === 'EXAMEN_CLINIQUE') {
                        reply = `🩺 [EXAMEN] Constantes actuelles : FC ${currentPatient.vitals.heartRate} bpm, Sat O2 ${currentPatient.vitals.oxygenSaturation}%. TRC ${activeDifficulty === 'difficile' && !clinicalState.fluidResuscitationDone ? '>4s' : '<2s'}.`;
                    } else if (analysis.intent === 'EXAMEN_LABO') {
                        reply = `🧪 [LABO] Lactates : ${activeDifficulty === 'difficile' ? '4.2 mmol/L (Hyperlactatémie)' : '1.1 mmol/L'}. Hémocultures en cours.`;
                    } else {
                        reply = "⚠️ [ORDRE NON VALIDE] Ce geste ne stabilise pas les fonctions vitales prioritaires du patient.";
                    }
                }

                gameLogs.push(reply);

                // ÉVALUATION DES CONDITIONS DE VICTOIRE SELON LA DIFFICULTÉ
                if (activeDifficulty === 'facile' && clinicalState.antibioticGiven) {
                    isStable = true;
                } 
                else if (activeDifficulty === 'modere' && clinicalState.antibioticGiven) {
                    isStable = true;
                } 
                else if (activeDifficulty === 'difficile') {
                    // En difficile, il faut ABSOLUMENT l'antibiothérapie ET le remplissage vasculaire
                    if (clinicalState.antibioticGiven && clinicalState.fluidResuscitationDone) {
                        isStable = true;
                    }
                }

                if (isStable) {
                    gameLogs.push(`🎉 [VICTOIRE CLINIQUE] Félicitations ! Le patient est stabilisé, le cap critique est franchi en mode ${activeDifficulty.toUpperCase()}. Pensez à documenter vos observations dans le carnet d'erreurs.`);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ vitals: currentPatient.vitals, logs: gameLogs, isGameOver, isStable, clinicalState }));
            } catch (e) {
                res.writeHead(400); res.end('Erreur commande');
            }
        });
        return;
    }

    // --- 5. INTERFACE DASHBOARD (HTML RUNTIME COMPLET) ---
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
            
            /* Launcher Styles */
            .launcher-box { text-align: center; max-width: 600px; margin: 40px auto; padding: 30px; border: 1px dashed #334155; }
            .selector-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 25px 0; }
            .tile { background: #1e293b; border: 1px solid #334155; padding: 20px; border-radius: 6px; cursor: pointer; transition: 0.2s; }
            input[type="radio"] { display: none; }
            input[type="radio"]:checked + .tile { border-color: #00f2fe; background: rgba(0,242,254,0.05); color: #00f2fe; }

            /* Simulation Workspace */
            .workspace { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .monitor { background: #020617; border: 2px solid #39ff14; padding: 15px; font-size: 24px; color: #39ff14; border-radius: 4px; margin: 15px 0; }
            .monitor.danger-pulse { animation: blink 0.6s infinite; border-color: #ef4444; color: #ef4444; }
            .log-box { background: #020617; border: 1px solid #1e293b; height: 300px; overflow-y: auto; padding: 12px; color: #38bdf8; font-size: 14px; margin-bottom: 12px; }
            .btn-prime { background: #00f2fe; color: #000; border: none; padding: 12px 24px; font-weight: bold; cursor: pointer; border-radius: 4px; font-family: monospace; }
            .btn-danger { background: #ef4444; color: #fff; border: none; padding: 8px 16px; cursor: pointer; border-radius: 4px; font-family: monospace; }

            /* Checklist items */
            .item-row { display: flex; align-items: center; background: #1e293b; padding: 12px; margin-bottom: 8px; border-radius: 4px; }
            
            /* Carnet d'erreurs editable board */
            .note-card { background: #111827; border-left: 4px solid #00f2fe; padding: 15px; margin-bottom: 12px; border-radius: 4px; }
            .note-card.error-type { border-left-color: #ef4444; }
            .note-actions { display: flex; gap: 10px; margin-top: 10px; justify-content: flex-end; }
            .inline-btn { background: none; border: 1px solid #4b5563; color: #94a3b8; padding: 4px 8px; cursor: pointer; font-size: 12px; }
            .inline-btn:hover { color: #fff; border-color: #fff; }

            /* Post game utility panel */
            .post-game-box { background: rgba(0, 242, 254, 0.05); border: 1px solid #00f2fe; padding: 15px; margin-top: 15px; border-radius: 4px; }

            @keyframes blink { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        </style>
    </head>
    <body>

        <header>
            <div>
                <h2 style="margin:0; color:#00f2fe;">DR-HESS // DISPATCHER MEDICAL</h2>
                <small style="color:#64748b;">Statut : Prêt à l'évaluation clinique</small>
            </div>
            <div id="progressHeader" style="color:#39ff14; font-weight:bold;">Référentiel EDN : 0%</div>
        </header>

        <nav class="nav-tabs">
            <button class="tab-btn active" id="btn-tab-sim" onclick="switchTab('sim')">🎮 Salle d'Examen</button>
            <button class="tab-btn" id="btn-tab-ref" onclick="switchTab('ref')">📚 Référentiel EDN</button>
            <button class="tab-btn" id="btn-tab-err" onclick="switchTab('err')">📓 Carnet de Pièges (<span id="errCount">0</span>)</button>
        </nav>

        <!-- ================= ONGLET 1 : EXAMEN (LAUNCHER OU WORKSPACE) ================= -->
        <div id="tab-sim" class="tab-panel active">
            
            <!-- ÉCRAN D'ACCUEIL SEUL (Si aucun cas n'est actif) -->
            <div id="launcher-view" class="launcher-box card">
                <h3 style="margin-top:0; color:#00f2fe;">🔬 Initialisation d'une Urgence Standardisée</h3>
                <p style="color:#94a3b8;">Sélectionnez un niveau d'épreuve. Le moteur construira le cas médical complet avec ses impératifs de survie cachés.</p>
                
                <div class="selector-grid">
                    <label>
                        <input type="radio" name="diffSelect" value="facile" checked>
                        <div class="tile">🟢<br><b>FACILE</b><br><small style="color:#64748b;">1 geste salvateur</small></div>
                    </label>
                    <label>
                        <input type="radio" name="diffSelect" value="modere">
                        <div class="tile">🟡<br><b>MODÉRÉ</b><br><small style="color:#64748b;">Cinétique moyenne</small></div>
                    </label>
                    <label>
                        <input type="radio" name="diffSelect" value="difficile">
                        <div class="tile">🔴<br><b>DIFFICILE</b><br><small style="color:#64748b;">Urgence vitale absolue</small></div>
                    </label>
                </div>
                
                <button class="btn-prime" style="width:100%; padding:15px;" onclick="launchScenario()">ENTRER EN SALLE DE DÉCHOCAGE</button>
            </div>

            <!-- ZONE DE JEU ACTIVE (Masquée par défaut) -->
            <div id="active-game-view" class="workspace" style="display:none;">
                <div class="card">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h3 id="txtCaseTitle" style="margin:0; color:#ef4444;">--</h3>
                        <button class="btn-danger" onclick="abortGame()">Abandonner le cas</button>
                    </div>
                    <p id="txtCaseDesc" style="color:#94a3b8; font-size:14px; line-height:1.5; min-height:60px;">--</p>
                    
                    <div class="monitor" id="monitorBox">
                        <div>❤️ Fréquence Cardiaque : <span id="lblFc">--</span> bpm</div>
                        <div style="margin-top:10px;">🫁 Saturation Oxygène : <span id="lblSat">--</span> %</div>
                    </div>

                    <div id="targetsIndicator" style="font-size:12px; color:#94a3b8; line-height:1.6;">
                        🎯 Objectifs de stabilisation : <br>
                        - Antibiothérapie efficace : <span id="tgtAnti">❌</span><br>
                        - Libération / Oxygénothérapie : <span id="tgtO2">❌</span><br>
                        - Contrôle hémodynamique (Remplissage) : <span id="tgtFluids">❌</span>
                    </div>

                    <!-- Bloc de debriefing dynamique pour alimenter le carnet d'erreurs -->
                    <div id="postGamePanel" class="post-game-box" style="display:none;">
                        <h4 style="margin:0 0 8px 0; color:#00f2fe;">📝 Analyser mon échec / succès</h4>
                        <p style="margin:0 0 10px 0; font-size:12px; color:#cbd5e1;">Rédige le piège ou la notion EDN apprise pour l'ajouter directement à ton carnet :</p>
                        <input type="text" id="txtNewErrorInput" style="width:100%; background:#020617; border:1px solid #334155; padding:8px; color:#fff; margin-bottom:8px;" placeholder="Ex: Oubli du remplissage dans le choc septique...">
                        <button class="btn-prime" style="padding:6px 12px; font-size:12px;" onclick="saveErrorFromPostGame()">Consigner le piège</button>
                    </div>
                </div>

                <div class="card" style="display:flex; flex-direction:column; justify-content:space-between;">
                    <h3 style="margin-top:0;">Terminal d'ordres médicaux</h3>
                    <div class="log-box" id="logBox"></div>
                    <div style="display:flex; gap:10px;">
                        <input type="text" id="cmdInput" placeholder="Saisir l'action thérapeutique..." onkeypress="if(event.key==='Enter') submitCommand()">
                        <button class="btn-prime" id="sendBtn" onclick="submitCommand()">Exécuter</button>
                    </div>
                </div>
            </div>

        </div>

        <!-- ================= ONGLET 2 : RÉFÉRENTIEL ================= -->
        <div id="tab-ref" class="tab-panel">
            <div class="card">
                <h3>Suivi d'avancement EDN</h3>
                <div class="item-row"><input type="checkbox" id="c1" onchange="updateProgress()"><label for="c1" style="margin-left:10px;"><b>Item 148</b> — Méningites aiguës / Purpura Fulminans</label></div>
                <div class="item-row"><input type="checkbox" id="c2" onchange="updateProgress()"><label for="c2" style="margin-left:10px;"><b>Item 344</b> — Infection des parties molles / Sepsis</label></div>
                <div class="item-row"><input type="checkbox" id="c3" onchange="updateProgress()"><label for="c3" style="margin-left:10px;"><b>Item 232</b> — Insuffisance cardiaque de l'adulte</label></div>
                <div class="item-row"><input type="checkbox" id="c4" onchange="updateProgress()"><label for="c4" style="margin-left:10px;"><b>Item 330</b> — Surveillance des Diurétiques</label></div>
            </div>
        </div>

        <!-- ================= ONGLET 3 : CARNET D'ERREURS DYNAMIQUE ================= -->
        <div id="tab-err" class="tab-panel">
            <div class="card">
                <h3 style="color:#00f2fe; margin-top:0;">📓 Mon Carnet de Pièges Cliniques</h3>
                <p style="color:#94a3b8; font-size:13px;">Ajoute, modifie ou supprime manuellement tes fiches de synthèse d'erreurs pour ne plus commettre les mêmes fautes au concours.</p>
                
                <!-- Formulaire d'ajout manuel -->
                <div style="background:#1e293b; padding:15px; border-radius:6px; margin-bottom:20px; display:flex; gap:10px; align-items:flex-end;">
                    <div style="flex:1;">
                        <label style="font-size:11px; color:#94a3b8;">Item ciblé :</label>
                        <input type="text" id="manualItem" placeholder="Ex: Item 148" style="width:100%; background:#060b13; border:1px solid #334155; padding:8px; color:#fff; font-family:monospace; margin-top:4px;">
                    </div>
                    <div style="flex:3;">
                        <label style="font-size:11px; color:#94a3b8;">Description du piège ou de la notion manquée :</label>
                        <input type="text" id="manualNote" placeholder="Rédiger la règle d'or clinique..." style="width:100%; background:#060b13; border:1px solid #334155; padding:8px; color:#fff; font-family:monospace; margin-top:4px;">
                    </div>
                    <button class="btn-prime" style="padding:8px 16px;" onclick="addManualError()">Ajouter</button>
                </div>

                <!-- Zone d'affichage des cartes d'erreurs -->
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
                currentActiveTab = tabId;
                
                if(tabId === 'err') fetchErrorDatabase();
            }

            function updateProgress() {
                let checked = document.querySelectorAll('.item-row input:checked').length;
                let pct = Math.round((checked / 4) * 100);
                document.getElementById('progressHeader').innerText = "Référentiel EDN : " + pct + "%";
            }

            // --- FLUX DE GESTION DU SCÉNARIO CLINIQUE ---
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
                    document.getElementById('txtNewErrorInput').value = '';
                    fetchStatus();
                }
            }

            function abortGame() {
                if(confirm("Confirmez-vous l'abandon de la prise en charge clinique ?")) {
                    window.location.reload();
                }
            }

            async function fetchStatus() {
                try {
                    const res = await fetch('/api/status');
                    const data = await res.json();
                    
                    if (!data.isGameActive) return;

                    // Hydrater les textes spécifiques au cas
                    document.getElementById('txtCaseTitle').innerText = data.caseTitle;
                    document.getElementById('txtCaseDesc').innerText = data.caseDescription;
                    
                    // Constantes biologiques
                    document.getElementById('lblFc').innerText = data.vitals.heartRate;
                    document.getElementById('lblSat').innerText = data.vitals.oxygenSaturation;

                    // Alerte clignotement
                    if(data.vitals.heartRate >= 130 || data.vitals.oxygenSaturation <= 90) {
                        document.getElementById('monitorBox').classList.add('danger-pulse');
                    } else {
                        document.getElementById('monitorBox').classList.remove('danger-pulse');
                    }

                    // Checklist d'objectifs validés
                    document.getElementById('tgtAnti').innerText = data.clinicalState.antibioticGiven ? "✅" : "❌";
                    document.getElementById('tgtO2').innerText = data.clinicalState.oxygenAdministrationDone || data.clinicalState.oxygenAdministered ? "✅" : "❌";
                    document.getElementById('tgtFluids').innerText = data.clinicalState.fluidResuscitationDone ? "✅" : "❌";

                    // Affichage des Logs
                    document.getElementById('logBox').innerHTML = data.logs.map(l => {
                        if(l.includes('🚨') || l.includes('💀')) return \`<div style="color:#ef4444; font-weight:bold; margin-bottom:5px;">\${l}</div>\`;
                        if(l.includes('🎉') || l.includes('💉') || l.includes('💧') || l.includes('🫁')) return \`<div style="color:#10b981; font-weight:bold; margin-bottom:5px;">\${l}</div>\`;
                        return \`<div style="margin-bottom:4px;">\${l}</div>\`;
                    }).join('');
                    
                    // Fin de partie
                    if(data.isGameOver || data.isStable) {
                        document.getElementById('cmdInput').disabled = true;
                        document.getElementById('sendBtn').disabled = true;
                        document.getElementById('postGamePanel').style.display = 'block'; // Débloque la rédaction d'erreur
                    }
                } catch(e) {}
            }
            setInterval(fetchStatus, 2000);

            async function submitCommand() {
                const input = document.getElementById('cmdInput');
                if(!input.value.trim()) return;
                
                const res = await fetch('/api/command', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ command: input.value.trim() })
                });
                const data = await res.json();
                input.value = '';
                fetchStatus();
            }

            // --- ENGINE DU CARNET D'ERREURS DYNAMIQUE (CRUD) ---
            async function fetchErrorDatabase() {
                const res = await fetch('/api/errors');
                const list = await res.json();
                document.getElementById('errCount').innerText = list.length;
                
                const container = document.getElementById('errorNotesContainer');
                if(list.length === 0) {
                    container.innerHTML = \`<p style="color:#64748b; text-align:center;">Aucun piège consigné pour le moment.</p>\`;
                    return;
                }

                container.innerHTML = list.map(n => \`
                    <div class="note-card \${n.item.toLowerCase().includes('148') ? 'error-type' : ''}">
                        <div style="display:flex; justify-content:space-between; font-size:11px; color:#64748b; margin-bottom:6px;">
                            <span>📌 <b>\${n.item}</b></span>
                            <span>📅 Archivé le \&nbsp;\${n.timestamp}</span>
                        </div>
                        <div id="note-txt-\${n.id}" style="font-size:14px; color:#cbd5e1; line-height:1.4;">\${n.note}</div>
                        <div class="note-actions">
                            <button class="inline-btn" onclick="triggerEditNote(\${n.id}, \\\`\${n.note}\\\`)">✏️ Modifier</button>
                            <button class="inline-btn" style="color:#ef4444;" onclick="deleteNote(\${n.id})">🗑️ Supprimer</button>
                        </div>
                    </div>
                \`).join('');
            }

            async function addManualError() {
                const item = document.getElementById('manualItem').value.trim();
                const note = document.getElementById('manualNote').value.trim();
                if(!note) return alert("Le contenu de la note est obligatoire.");

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
                if(!text) return alert("Rédigez d'abord votre note de révision.");
                
                await fetch('/api/errors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'add', item: "Débrief Simulation", note: text })
                });
                alert("Piège sauvegardé avec succès dans votre carnet d'erreurs !");
                document.getElementById('postGamePanel').style.display = 'none';
                fetchErrorDatabase();
            }

            async function deleteNote(id) {
                if(confirm("Supprimer cette note définitivement ?")) {
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
                div.innerHTML = \`
                    <textarea id="edit-area-\${id}" style="width:100%; background:#060b13; color:#fff; border:1px solid #00f2fe; padding:6px; font-family:monospace; min-height:60px;">\${oldText}</textarea>
                    <button class="btn-prime" style="padding:4px 8px; font-size:11px; margin-top:5px;" onclick="saveEditedNote(\${id})">Enregistrer</button>
                \`;
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

            // Synchro initiale du compteur au lancement du Hub
            fetchErrorDatabase();
        </script>
    </body>
    </html>
    `);
});

server.listen(port, () => {
    console.log(`🚀 Moteur EDN multi-scénarios connecté sur le port ${port}`);
});
