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
// ⏳ LE MOTEUR D'ÉVOLUTION TEMPOREL (Tourne en tâche de fond sur Render)
// ----------------------------------------------------------------
setInterval(() => {
    if (isGameOver) return;

    if (!isStable) {
        // Le patient s'aggrave de seconde en seconde sans traitement !
        currentPatient.vitals.heartRate += 2; // Le cœur s'emballe (+2 bpm toutes les 10s)
        currentPatient.vitals.oxygenSaturation = Math.max(75, currentPatient.vitals.oxygenSaturation - 0.5); // L'oxygène chute

        // Déclenchement des alertes dans la console du joueur
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
        // Si le traitement est actif, le patient récupère lentement !
        if (currentPatient.vitals.heartRate > 72) currentPatient.vitals.heartRate -= 1;
        if (currentPatient.vitals.oxygenSaturation < 98) currentPatient.vitals.oxygenSaturation += 0.5;
    }
}, 10000); // 10000 millisecondes = Exécution automatique toutes les 10 secondes



const server = http.createServer((req, res) => {
    // --- 1. ROUTE API : Récupérer l'état actuel en temps réel (Polling) ---
    if (req.url === '/api/status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ vitals: currentPatient.vitals, logs: gameLogs, isGameOver }));
        return;
    }

    // --- 2. ROUTE API : Traiter un ordre du joueur ---
    if (req.url === '/api/command' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            if (isGameOver) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ vitals: currentPatient.vitals, logs: gameLogs }));
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
                            isStable = true; // 🌟 Le bon traitement stoppe l'agonie mécanique !
                            reply = `💉 [SUCCÈS] Injection d'Amoxicilline 1g IV effectuée. L'antibiothérapie cible l'infection. Le patient commence à se stabiliser mécaniquement.`;
                        } else if (analysis.target === 'paracetamol') {
                            reply = `export 💊 [TRAITEMENT] Paracétamol administré. Soulagement temporaire de la douleur, mais la cause sous-jacente reste active !`;
                        } else {
                            reply = `⚠️ [TRAITEMENT] Molécule inconnue. Le moniteur continue de grimper.`;
                        }
                        break;

                    case 'EXAMEN_LABO':
                        reply = `🧪 [LABO] Bilan : Potassium : ${currentPatient.vitals.potassium} mmol/L, Créatinine : ${currentPatient.vitals.creatinine} µmol/L.`;
                        break;

                    case 'EXAMEN_CLINIQUE':
                        reply = `🩺 [CLINIQUE] Constantes actuelles lues au lit du patient : FC ${currentPatient.vitals.heartRate} bpm, Sat : ${currentPatient.vitals.oxygenSaturation}%.`;
                        break;

                    default:
                        reply = `❌ [MOTEUR] Ordre non compris. Le temps presse, agissez !`;
                }

                gameLogs.push(`➔ ${userCommand}`);
                gameLogs.push(reply);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ vitals: currentPatient.vitals, logs: gameLogs, isGameOver }));
            } catch (e) {
                res.writeHead(400); res.end('Erreur');
            }
        });
        return;
    }

    // --- 3. ROUTE INTERFACE VISUELLE (HTML) ---
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <title>Diagnostica Real-Time</title>
        <style>
            body { background-color: #0a0f1d; color: #e2e8f0; font-family: monospace; padding: 20px; }
            .game-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .panel { background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 20px; }
            .monitor { border: 2px solid #39ff14; background: #050b05; padding: 15px; color: #39ff14; font-size: 22px; }
            .danger-pulse { animation: red-blink 0.5s infinite !important; border-color: #f43f5e !important; color: #f43f5e !important; }
            .log-box { background: #000; border: 1px solid #334155; padding: 10px; height: 350px; overflow-y: auto; color: #38bdf8; margin-bottom: 15px; }
            .input-area { display: flex; gap: 10px; }
            input { flex: 1; background: #1f2937; border: 1px solid #4b5563; color: #fff; padding: 12px; font-size: 16px; }
            button { background: #00f2fe; color: #000; border: none; padding: 0 20px; font-weight: bold; cursor: pointer; }
            @keyframes red-blink { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
        </style>
    </head>
    <body>
        <header><h1 style="color: #00f2fe; margin:0 0 20px 0;">⏳ PROTOCOLE DIAGNOSTICA : TEMPS RÉEL</h1></header>
        <div class="game-container">
            <div class="panel">
                <h2 style="color: #f43f5e; margin-top:0;">Dossier : Clara Lombardi</h2>
                <div class="monitor" id="monitorBox">
                    <p>❤️ Fréquence Cardiaque : <span id="fc">--</span> bpm</p>
                    <p>🫁 Saturation Oxygène : <span id="sat">--</span> %</p>
                </div>
                <p style="color:#64748b;">⚠️ Attention : Sans traitement, l'état clinique se détériore toutes les 10 secondes.</p>
            </div>
            <div class="panel">
                <h2>Console d'urgence</h2>
                <div class="log-box" id="logBox">Chargement du flux...</div>
                <div class="input-area">
                    <input type="text" id="cmdInput" placeholder="Tape un ordre médical..." onkeypress="if(event.key==='Enter') submitText()">
                    <button id="sendBtn" onclick="submitText()">Envoyer</button>
                </div>
            </div>
        </div>

        <script>
            // Mettre à jour l'interface avec les données reçues
            function updateDisplay(data) {
                document.getElementById('fc').innerText = data.vitals.heartRate;
                document.getElementById('sat').innerText = data.vitals.oxygenSaturation;

                // Si les constantes deviennent critiques, on fait clignoter l'écran en rouge !
                if(data.vitals.heartRate >= 130 || data.vitals.oxygenSaturation <= 91) {
                    document.getElementById('monitorBox').classList.add('danger-pulse');
                } else {
                    document.getElementById('monitorBox').classList.remove('danger-pulse');
                }

                if(data.isGameOver) {
                    document.getElementById('cmdInput').disabled = true;
                    document.getElementById('sendBtn').disabled = true;
                    document.getElementById('cmdInput').placeholder = "PARTIE TERMINÉE";
                }

                const logBox = document.getElementById('logBox');
                logBox.innerHTML = data.logs.map(l => {
                    if(l.includes('🚨') || l.includes('💀')) return \`<div style="color:#f43f5e; font-weight:bold;">\${l}</div>\`;
                    if(l.includes('💉')) return \`<div style="color:#39ff14;">\${l}</div>\`;
                    return \`<div>\${l}</div>\`;
                }).join('');
            }

            // 🔄 BOUCLE DE SYNCHRONISATION AUTOMATIQUE (Interroge le serveur toutes les 2 secondes)
            async function fetchServerStatus() {
                try {
                    const response = await fetch('/api/status');
                    const data = await response.json();
                    updateDisplay(data);
                } catch(e) { console.error("Erreur synchro", e); }
            }
            setInterval(fetchServerStatus, 2000);

            // Envoyer une action manuelle
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
            
            // Premier chargement
            fetchServerStatus();
        </script>
    </body>
    </html>
    `);
});

server.listen(port, () => {
    console.log(`🚀 Moteur temps réel prêt.`);
});
