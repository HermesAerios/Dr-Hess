import http from 'http';
import { HouseEngine } from './core/engine/HouseEngine';

const port = process.env.PORT || 3000;

// On initialise notre moteur clinique avec le cas de Clara
const gameEngine = new HouseEngine('CASE_HOUSE_001_WILSON');
let currentPatient = gameEngine.getInitialPatient();
let gameLogs: string[] = ["[SYSTEME] Moteur clinique connecté. Clara Lombardi est admise aux urgences."];

const server = http.createServer((req, res) => {
    // ----------------------------------------------------------------
    // 1. ROUTE API : C'est ici que le serveur reçoit les ordres du joueur
    // ----------------------------------------------------------------
    if (req.url === '/api/command' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const userCommand = data.command;

                // Ici, on fait travailler le moteur de jeu (Simulation d'évolution)
                let reply = '';
                const cmd = userCommand.toLowerCase();

                if (cmd.includes('amoxicilline')) {
                    currentPatient.vitals.heartRate = Math.max(60, currentPatient.vitals.heartRate - 5);
                    reply = `[TRAITEMENT] Injection d'Amoxicilline 1g effectuée. La réaction allergique potentielle est sous surveillance.`;
                } else if (cmd.includes('sang') || cmd.includes('bilan')) {
                    reply = `[LABO] Analyse de sang : Potassium à ${currentPatient.vitals.potassium} mmol/L, Créatinine à ${currentPatient.vitals.creatinine} µmol/L.`;
                } else if (cmd.includes('ausculter')) {
                    reply = `[CLINIQUE] Auscultation : Rales crépitant discrets à la base droite.`;
                } else {
                    reply = `[MEDECIN] Ordre "${userCommand}" enregistré dans le dossier médical.`;
                }

                gameLogs.push(`➔ ${userCommand}`);
                gameLogs.push(reply);

                // On renvoie les nouvelles constantes mises à jour au navigateur
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    vitals: currentPatient.vitals,
                    logs: gameLogs
                }));
            } catch (e) {
                res.writeHead(400);
                res.end('Erreur de requête');
            }
        });
        return;
    }

    // ----------------------------------------------------------------
    // 2. ROUTE INTERFACE : Le code HTML/JS qui s'affiche à l'écran
    // ----------------------------------------------------------------
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    res.end(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <title>Diagnostica : Protocole EDN</title>
        <style>
            body { background-color: #0a0f1d; color: #e2e8f0; font-family: monospace; padding: 20px; margin: 0; display: flex; flex-direction: column; height: 100vh; box-sizing: border-box; }
            header { border-bottom: 2px solid #00f2fe; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; }
            .game-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; flex: 1; min-height: 0; }
            .panel { background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 20px; display: flex; flex-direction: column; }
            .monitor { border: 2px solid #39ff14; background: #050b05; padding: 15px; color: #39ff14; margin-bottom: 15px; }
            .log-box { background: #000; border: 1px solid #334155; padding: 10px; flex: 1; overflow-y: auto; color: #38bdf8; margin-bottom: 15px; }
            .input-area { display: flex; gap: 10px; }
            input { flex: 1; background: #1f2937; border: 1px solid #4b5563; color: #fff; padding: 12px; font-size: 16px; }
            button { background: #00f2fe; color: #000; border: none; padding: 0 20px; font-weight: bold; cursor: pointer; }
            .med-btn { background: #f43f5e; color: white; padding: 10px; margin-top: 5px; width: 100%; border: none; cursor: pointer; }
        </style>
    </head>
    <body>
        <header>
            <h1 style="margin:0; color: #00f2fe;">🩺 DIAGNOSTICA ENGINE v1.0</h1>
            <div style="color: #39ff14;">● SERVEUR CONNECTÉ AU MOTEUR CLINIQUE</div>
        </header>

        <div class="game-container">
            <div class="panel">
                <h2 style="margin-top:0; color: #f43f5e;">Patient : ${currentPatient.name}</h2>
                <p><strong>Âge :</strong> ${currentPatient.age} ans | <strong>Sexe :</strong> ${currentPatient.sex}</p>
                
                <div class="monitor">
                    <div>❤️ ECG : Rythme en temps réel</div>
                    <p style="font-size: 26px; margin: 10px 0;">Fréquence Cardiaque : <span id="fc">${currentPatient.vitals.heartRate}</span> bpm</p>
                    <p>Potassium sérique : <span id="kaliemie">${currentPatient.vitals.potassium}</span> mmol/L</p>
                </div>

                <h3>Actions Immédiates</h3>
                <button class="med-btn" onclick="sendServerCommand('Injecter de l\\'Amoxicilline')">Injecter Amoxicilline 1g IV</button>
                <button class="med-btn" onclick="sendServerCommand('Ausculter le patient')">Ausculter les poumons</button>
            </div>

            <div class="panel">
                <h2 style="margin-top:0; color: #38bdf8;">Console interactive</h2>
                <div class="log-box" id="logBox">
                    ${gameLogs.map(l => `<div>${l}</div>`).join('')}
                </div>
                <div class="input-area">
                    <input type="text" id="cmdInput" placeholder="Tapez un ordre (ex: Demander une prise de sang)..." onkeypress="if(event.key==='Enter') submitText()">
                    <button onclick="submitText()">Envoyer</button>
                </div>
            </div>
        </div>

        <script>
            // Cette fonction parle en direct avec le serveur Node.js sans recharger la page
            async function sendServerCommand(commandText) {
                const response = await fetch('/api/command', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ command: commandText })
                });
                const data = await response.json();
                
                // Mise à jour de l'écran avec les vraies valeurs du serveur
                document.getElementById('fc').innerText = data.vitals.heartRate;
                document.getElementById('kaliemie').innerText = data.vitals.potassium;
                
                const logBox = document.getElementById('logBox');
                logBox.innerHTML = data.logs.map(l => \`<div>\${l}</div>\`).join('');
                logBox.scrollTop = logBox.scrollHeight;
            }

            function submitText() {
                const input = document.getElementById('cmdInput');
                if(!input.value.trim()) return;
                sendServerCommand(input.value.trim());
                input.value = '';
            }
        </script>
    </body>
    </html>
    `);
});

server.listen(port, () => {
    console.log(`🚀 Serveur de jeu dynamique actif sur le port ${port}`);
});
