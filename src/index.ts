import http from 'http';
import { HouseEngine } from './core/engine/HouseEngine';
import { TextAnalyzer } from './core/nlp/TextAnalyzer';

const port = process.env.PORT || 3000;
const gameEngine = new HouseEngine('CASE_HOUSE_001_WILSON');

// --- ÉTAT DU JEU (Mémoire vive du serveur) ---
let currentPatient = gameEngine.getInitialPatient();
let gameLogs: string[] = ["[SYSTEME] Moteur d'évolution en temps réel activé. Le chronomètre clinique a démarré."];
let isStable = false; // Passe à true si le bon traitement est donné
let isGameOver = false;

// ----------------------------------------------------------------
// ⏳ LE MOTEUR D'ÉVOLUTION TEMPOREL (Tourne en tâche de fond)
// ----------------------------------------------------------------
setInterval(() => {
    if (isGameOver) return;

    if (!isStable) {
        // Le patient s'aggrave toutes les 10 secondes sans traitement ciblé
        currentPatient.vitals.heartRate += 2; // Le cœur s'emballe
        currentPatient.vitals.oxygenSaturation = Math.max(75, currentPatient.vitals.oxygenSaturation - 0.5); // L'oxygène chute

        // Alertes cliniques autonomes
        if (currentPatient.vitals.heartRate >= 110 && currentPatient.vitals.heartRate < 113) {
            gameLogs.push("🚨 [ALERTE] Le patient commence à s'agiter. Tachycardie modérée détectée.");
        }
        if (currentPatient.vitals.heartRate >= 130 && currentPatient.vitals.heartRate < 133) {
            gameLogs.push("🚨 [ALERTE CRITIQUE] Le moniteur s'emballe ! Fréquence cardiaque > 130 bpm ! Reprise thermique suspecte.");
        }
        if (currentPatient.vitals.oxygenSaturation <= 92 && currentPatient.vitals.oxygenSaturation > 91) {
            gameLogs.push("🚨 [ALERTE OXYGÈNE] Clara Lombardi désature ! Saturation sous la barre des 92%. Elle a besoin d'aide.");
        }

        // Condition de défaite (Arrêt cardiaque)
        if (currentPatient.vitals.heartRate >= 160 || currentPatient.vitals.oxygenSaturation <= 80) {
            isGameOver = true;
            gameLogs.push("💀 [FIN DE PARTIE] Arrêt cardio-respiratoire. Clara Lombardi a sombré dans le coma. Le protocole a échoué.");
        }
    } else {
        // Récupération progressive sous antibiothérapie
        if (currentPatient.vitals.heartRate > 72) currentPatient.vitals.heartRate -= 1;
        if (currentPatient.vitals.oxygenSaturation < 98) currentPatient.vitals.oxygenSaturation += 0.5;
    }
}, 10000);



const server = http.createServer((req, res) => {
    // --- 1. ROUTE API : Récupérer l'état clinique (Polling) ---
    if (req.url === '/api/status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ vitals: currentPatient.vitals, logs: gameLogs, isGameOver }));
        return;
    }

    // --- 2. ROUTE API : Traiter l'analyse de l'ordre médical (NLP) ---
    if (req.url === '/api/command' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            if (isGameOver) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ vitals: currentPatient.vitals, logs: gameLogs, isGameOver }));
                return;
            }

            try {
                const data = JSON.parse(body);
                const userCommand = data.command;
                const analysis = TextAnalyzer.analyze(userCommand);
                let reply = '';

                switch (analysis.intent) {
                    case 'TRAITEMENT':
                        if (analysis.target === 'amoxicilline') {
                            isStable = true;
                            reply = `💉 [SUCCÈS] Injection d'Amoxicilline 1g IV effectuée. L'antibiothérapie cible précisément l'infection. Le patient se stabilise.`;
                        } else if (analysis.target === 'paracetamol') {
                            reply = `💊 [TRAITEMENT] Paracétamol administré. Baisse temporaire des céphalées, mais le foyer infectieux progresse !`;
                        } else {
                            reply = `⚠️ [TRAITEMENT] Molécule non adaptée ou inconnue. Le moniteur continue de grimper.`;
                        }
                        break;

                    case 'EXAMEN_LABO':
                        reply = `🧪 [LABO] Bilan reçu : Potassium : ${currentPatient.vitals.potassium} mmol/L, Créatinine : ${currentPatient.vitals.creatinine} µmol/L.`;
                        break;

                    case 'EXAMEN_CLINIQUE':
                        reply = `🩺 [CLINIQUE] Constantes au lit du patient : FC ${currentPatient.vitals.heartRate} bpm, Sat : ${currentPatient.vitals.oxygenSaturation}%.`;
                        break;

                    default:
                        reply = `❌ [MOTEUR] Ordre non compris. Le temps presse, utilisez des verbes d'action clairs !`;
                }

                gameLogs.push(`➔ ${userCommand}`);
                gameLogs.push(reply);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ vitals: currentPatient.vitals, logs: gameLogs, isGameOver }));
            } catch (e) {
                res.writeHead(400); res.end('Erreur de parsing');
            }
        });
        return;
    }

    // --- 3. ROUTE INTERFACE VISUELLE : Tableau de bord EDN ---
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <title>Dr-Hess — Hub de Révision EDN</title>
        <style>
            /* --- DESIGN GLOBAL SYSTEM --- */
            body { background-color: #0a0f1d; color: #e2e8f0; font-family: 'Courier New', monospace; padding: 20px; margin: 0; }
            header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1f2937; padding-bottom: 15px; margin-bottom: 20px; }
            h1 { color: #00f2fe; margin: 0; font-size: 24px; }
            
            /* --- BARRE D'ONGLETS (NAVIGATION) --- */
            .nav-tabs { display: flex; gap: 10px; margin-bottom: 20px; }
            .tab-btn { background: #111827; border: 1px solid #1f2937; color: #94a3b8; padding: 12px 20px; font-weight: bold; cursor: pointer; border-radius: 6px; font-family: monospace; transition: all 0.2s; }
            .tab-btn:hover { background: #1f2937; color: #fff; }
            .tab-btn.active { background: #00f2fe; color: #000; border-color: #00f2fe; box-shadow: 0 0 10px rgba(0, 242, 254, 0.3); }

            /* --- CONTENUS DES PANELS --- */
            .tab-panel { display: none; }
            .tab-panel.active { display: block; }
            .panel-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .card { background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 20px; }
            
            /* --- Simulation médicale --- */
            .monitor { border: 2px solid #39ff14; background: #050b05; padding: 15px; color: #39ff14; font-size: 22px; border-radius: 4px; }
            .danger-pulse { animation: red-blink 0.5s infinite !important; border-color: #f43f5e !important; color: #f43f5e !important; }
            .log-box { background: #000; border: 1px solid #334155; padding: 10px; height: 320px; overflow-y: auto; color: #38bdf8; margin-bottom: 15px; border-radius: 4px; }
            .input-area { display: flex; gap: 10px; }
            input[type="text"] { flex: 1; background: #1f2937; border: 1px solid #4b5563; color: #fff; padding: 12px; font-size: 16px; border-radius: 4px; font-family: monospace; }
            .btn-action { background: #00f2fe; color: #000; border: none; padding: 0 25px; font-weight: bold; cursor: pointer; border-radius: 4px; }
            
            /* --- Référentiel EDN --- */
            .edn-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
            .progress-bar-container { background: #1f2937; height: 10px; width: 100%; border-radius: 5px; margin-bottom: 20px; overflow: hidden; }
            .progress-bar-fill { background: #39ff14; height: 100%; width: 0%; transition: width 0.3s ease; }
            .item-list { display: flex; flex-direction: column; gap: 10px; max-height: 450px; overflow-y: auto; padding-right: 5px; }
            .edn-item { display: flex; align-items: center; justify-content: space-between; background: #1e293b; padding: 12px; border-radius: 6px; border-left: 4px solid #64748b; }
            .edn-item.checked { border-left-color: #39ff14; background: rgba(57, 255, 20, 0.05); }
            .item-info { display: flex; align-items: center; gap: 12px; }
            
            /* --- Lanceur & Difficultés --- */
            .difficulty-selector { display: flex; gap: 10px; margin: 15px 0; }
            .radio-label { flex: 1; }
            .radio-tile { text-align: center; background: #1e293b; border: 1px solid #334155; padding: 15px; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
            .radio-label input[type="radio"] { display: none; }
            .radio-label input[type="radio"]:checked + .radio-tile { background: rgba(0, 242, 254, 0.1); border-color: #00f2fe; color: #00f2fe; }

            @keyframes red-blink { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
        </style>
    </head>
    <body>

        <header>
            <div>
                <h1>Dr-Hess : Hub Clinique EDN</h1>
                <small style="color: #64748b;">Statut Session : Connecté en tant que médecin interne</small>
            </div>
            <div>
                <span style="color: #39ff14; font-weight: bold; font-size: 18px;" id="globalProgressText">EDN : 0%</span>
            </div>
        </header>

        <!-- NAVIGATION PAR ONGLETS -->
        <nav class="nav-tabs">
            <button class="tab-btn active" onclick="switchTab('simulation')">🎮 Accueil & Urgences</button>
            <button class="tab-btn" onclick="switchTab('programme')">📚 Référentiel EDN</button>
            <button class="tab-btn" onclick="switchTab('erreurs')">📓 Carnet de Pièges</button>
            <button class="tab-btn" onclick="switchTab('stats')">📊 Métriques de Survie</button>
        </nav>

        <!-- Onglet 1 : Accueil & Simulation -->
        <div id="panel-simulation" class="tab-panel active">
            <div class="panel-layout">
                <div class="card">
                    <h3 style="color: #00f2fe; margin-top:0;">⚡ Configurer un Cas Clinique</h3>
                    <p style="color: #94a3b8; font-size: 14px;">Sélectionnez la criticité du patient avant d'entrer en salle d'examen :</p>
                    
                    <div class="difficulty-selector">
                        <label class="radio-label">
                            <input type="radio" name="difficulty" value="facile" checked>
                            <div class="radio-tile">🟢<br><b>Facile</b></div>
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="difficulty" value="modere">
                            <div class="radio-tile">🟡<br><b>Modéré</b></div>
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="difficulty" value="difficile">
                            <div class="radio-tile">🔴<br><b>Difficile</b></div>
                        </label>
                    </div>
                    
                    <button class="btn-action" style="width:100%; padding: 15px; margin-bottom: 25px;" onclick="alert('Chargement du moteur dynamique du cas...')">
                        LANCER L'URGENCE SÉLECTIONNÉE
                    </button>

                    <h3 style="color: #f43f5e; margin-top: 15px;">Dossier Patient : Clara Lombardi</h3>
                    <div class="monitor" id="monitorBox">
                        <p>❤️ Fréquence Cardiaque : <span id="fc">--</span> bpm</p>
                        <p>🫁 Saturation Oxygène : <span id="sat">--</span> %</p>
                    </div>
                    <p style="color:#64748b; font-size:12px; margin-top:10px;">⚠️ L'évolution se fait de manière autonome toutes les 10 secondes en tâche de fond.</p>
                </div>
                
                <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
                    <h3 style="margin-top:0;">Terminal d'Intervention</h3>
                    <div class="log-box" id="logBox">Initialisation du flux...</div>
                    <div class="input-area">
                        <input type="text" id="cmdInput" placeholder="Saisir un ordre (ex: Injecter amoxicilline)..." onkeypress="if(event.key==='Enter') submitText()">
                        <button class="btn-action" id="sendBtn" onclick="submitText()">Envoyer</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Onglet 2 : Référentiel EDN -->
        <div id="panel-programme" class="tab-panel">
            <div class="card">
                <div class="edn-header">
                    <h2 style="color: #00f2fe; margin: 0;">Items du Programme</h2>
                    <span id="checkedCount" style="color: #94a3b8;">0 / 4 cochés</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" id="progressBar"></div>
                </div>

                <div class="item-list">
                    <div class="edn-item" id="item-148">
                        <div class="item-info">
                            <input type="checkbox" id="chk-148" onchange="toggleItem(148)">
                            <label for="chk-148" style="cursor:pointer; margin-left:10px;">
                                <b>Item 148</b> — Méningites, encéphalites chez l'adulte et l'enfant
                            </label>
                        </div>
                    </div>

                    <div class="edn-item" id="item-232">
                        <div class="item-info">
                            <input type="checkbox" id="chk-232" onchange="toggleItem(232)">
                            <label for="chk-232" style="cursor:pointer; margin-left:10px;">
                                <b>Item 232</b> — Insuffisance cardiaque de l'adulte
                            </label>
                        </div>
                    </div>

                    <div class="edn-item" id="item-344">
                        <div class="item-info">
                            <input type="checkbox" id="chk-344" onchange="toggleItem(344)">
                            <label for="chk-344" style="cursor:pointer; margin-left:10px;">
                                <b>Item 344</b> — Infection aiguë des parties molles / Sepsis
                            </label>
                        </div>
                    </div>

                    <div class="edn-item" id="item-330">
                        <div class="item-info">
                            <input type="checkbox" id="chk-330" onchange="toggleItem(330)">
                            <label for="chk-330" style="cursor:pointer; margin-left:10px;">
                                <b>Item 330</b> — Prescription et surveillance des diurétiques
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Onglet 3 : Carnet d'Erreurs -->
        <div id="panel-erreurs" class="tab-panel">
            <div class="card">
                <h2 style="color: #00f2fe; margin-top:0;">📓 Carnet de Pièges Personnalisé</h2>
                <p style="color: #94a3b8;">Notes cliniques rédigées suite à un échec thérapeutique en simulation :</p>
                
                <div style="background: #1e293b; padding: 15px; border-radius: 6px; border-left: 4px solid #f43f5e; margin-bottom: 15px;">
                    <h4 style="margin: 0 0 5px 0; color: #f43f5e;">⚠️ Rappel Critique — Item 148 (Méningite)</h4>
                    <p style="margin: 0; font-size: 14px; color: #cbd5e1;">"Ne jamais attendre le bilan biologique si un purpura fulminans est visible ou si la suspicion de méningite à méningocoque est forte. L'antibiothérapie probabiliste immédiate (Amoxicilline / Céfotaxime) prime sur l'attente du laboratoire."</p>
                </div>
            </div>
        </div>

        <!-- Onglet 4 : Statistiques -->
        <div id="panel-stats" class="tab-panel">
            <div class="panel-layout">
                <div class="card">
                    <h3 style="color: #39ff14; margin-top:0;">Points Forts</h3>
                    <p>🟢 <b>Infectiologie :</b> 100% de survie patient sur les diagnostics de première intention.</p>
                </div>
                <div class="card">
                    <h3 style="color: #f43f5e; margin-top:0;">Axes d'Amélioration</h3>
                    <p>🔴 <b>Vitesse d'Exécution :</b> Temps moyen de réaction avant premier traitement valide : 42 secondes.</p>
                </div>
            </div>
        </div>

        <!-- --- LOGIQUE CLIENT --- -->
        <script>
            function switchTab(tabId) {
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
                
                event.currentTarget.classList.add('active');
                document.getElementById('panel-' + tabId).classList.add('active');
            }

            function toggleItem(itemId) {
                const checkbox = document.getElementById('chk-' + itemId);
                const itemDiv = document.getElementById('item-' + itemId);
                
                if (checkbox.checked) {
                    itemDiv.classList.add('checked');
                } else {
                    itemDiv.classList.remove('checked');
                }
                calculateProgress();
            }

            function calculateProgress() {
                const totalItems = document.querySelectorAll('.edn-item').length;
                const checkedItems = document.querySelectorAll('.edn-item input[type="checkbox"]:checked').length;
                const percentage = Math.round((checkedItems / totalItems) * 100);
                
                document.getElementById('checkedCount').innerText = \`\${checkedItems} / \${totalItems} items maîtrisés\`;
                document.getElementById('progressBar').style.width = percentage + '%';
                document.getElementById('globalProgressText').innerText = 'EDN : ' + percentage + '%';
            }

            function updateDisplay(data) {
                document.getElementById('fc').innerText = data.vitals.heartRate;
                document.getElementById('sat').innerText = data.vitals.oxygenSaturation;

                if(data.vitals.heartRate >= 130 || data.vitals.oxygenSaturation <= 91) {
                    document.getElementById('monitorBox').classList.add('danger-pulse');
                } else {
                    document.getElementById('monitorBox').classList.remove('danger-pulse');
                }

                if(data.isGameOver) {
                    document.getElementById('cmdInput').disabled = true;
                    document.getElementById('sendBtn').disabled = true;
                    document.getElementById('cmdInput').placeholder = "ARRÊT CARDIAQUE : SESSION CLINIQUE TERMINÉE";
                }

                const logBox = document.getElementById('logBox');
                logBox.innerHTML = data.logs.map(l => {
                    if(l.includes('🚨') || l.includes('💀')) return \`<div style="color:#f43f5e; font-weight:bold;">\${l}</div>\`;
                    if(l.includes('💉')) return \`<div style="color:#39ff14;">\${l}</div>\`;
                    return \`<div>\${l}</div>\`;
                }).join('');
            }

            async function fetchServerStatus() {
                try {
                    const response = await fetch('/api/status');
                    const data = await response.json();
                    updateDisplay(data);
                } catch(e) { console.error("Échec de synchronisation avec le lit du patient", e); }
            }
            setInterval(fetchServerStatus, 2000);

            async function sendServerCommand(commandText) {
                const response = await fetch('/api/command', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ command: commandText })
                });
                const data = await response.json();
                updateDisplay(data);
            }

            function submitText() {
                const input = document.getElementById('cmdInput');
                if(!input.value.trim()) return;
                sendServerCommand(input.value.trim());
                input.value = '';
            }
            
            fetchServerStatus();
            calculateProgress();
        </script>
    </body>
    </html>
    `);
});

server.listen(port, () => {
    console.log(`🚀 Serveur Dr-Hess en ligne sur le port ${port}`);
});
