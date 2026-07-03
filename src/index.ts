import http from 'http';
import { HouseEngine } from './core/engine/HouseEngine';
import { TextAnalyzer } from './core/nlp/TextAnalyzer'; // On importe notre IA !

const port = process.env.PORT || 3000;
const gameEngine = new HouseEngine('CASE_HOUSE_001_WILSON');
let currentPatient = gameEngine.getInitialPatient();
let gameLogs: string[] = ["[SYSTEME] Moteur NLP activé. Tapez vos ordres en langage naturel."];

const server = http.createServer((req, res) => {
    if (req.url === '/api/command' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const userCommand = data.command;

                // 🧠 L'IA analyse la phrase du joueur ici !
                const analysis = TextAnalyzer.analyze(userCommand);
                let reply = '';

                // On aiguille la réponse selon l'intention détectée
                switch (analysis.intent) {
                    case 'TRAITEMENT':
                        if (analysis.target === 'amoxicilline') {
                            currentPatient.vitals.heartRate = Math.max(60, currentPatient.vitals.heartRate - 8);
                            reply = `💉 [TRAITEMENT] Vous administrez 1g d'Amoxicilline IV. Le rythme cardiaque se stabilise à ${currentPatient.vitals.heartRate} bpm.`;
                        } else if (analysis.target === 'paracetamol') {
                            reply = `💊 [TRAITEMENT] Paracétamol 1g administré. Clara vous dit que sa tête tape un peu moins fort.`;
                        } else {
                            reply = `⚠️ [TRAITEMENT] Vous voulez donner un traitement, mais le nom de la molécule est inconnu ou mal orthographié.`;
                        }
                        break;

                    case 'EXAMEN_LABO':
                        reply = `🧪 [LABO] Résultat du bilan sanguin : Potassium : ${currentPatient.vitals.potassium} mmol/L, Créatinine : ${currentPatient.vitals.creatinine} µmol/L (Clearance : ${currentPatient.state.creatinineClearance} ml/min).`;
                        break;

                    case 'EXAMEN_CLINIQUE':
                        if (analysis.target === 'poumons') {
                            reply = `🫁 [CLINIQUE] Auscultation pulmonaire : Râles crépitants discrets à la base droite.`;
                        } else if (analysis.target === 'ecg') {
                            reply = `📈 [CLINIQUE] Tracé ECG : Tachycardie sinusale modérée, pas de trouble de conduction aigu.`;
                        } else {
                            reply = `🩺 [CLINIQUE] Constantes : FC ${currentPatient.vitals.heartRate} bpm, TA : ${currentPatient.vitals.systolicBP}/${currentPatient.vitals.diastolicBP} mmHg, Sat : ${currentPatient.vitals.oxygenSaturation}%.`;
                        }
                        break;

                    case 'INTERROGATOIRE':
                        if (analysis.target === 'douleur_tete') {
                            reply = `🗣️ [PATIENT] Clara répond : "J'ai l'impression que ma tête va exploser, surtout derrière les yeux, et la lumière me fait horriblement mal..."`;
                        } else {
                            reply = `🗣️ [PATIENT] Clara Lombardi semble confuse. Elle grogne et se tourne contre le mur pour éviter la lumière.`;
                        }
                        break;

                    default:
                        reply = `❌ [MOTEUR] Le protocole n'a pas compris votre directive. Essayez d'utiliser des verbes d'action (Ausculter, Donner, Demander, Interroger...).`;
                }

                gameLogs.push(`➔ ${userCommand}`);
                gameLogs.push(reply);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ vitals: currentPatient.vitals, logs: gameLogs }));
            } catch (e) {
                res.writeHead(400);
                res.end('Erreur');
            }
        });
        return;
    }

    // (Le reste du code HTML reste identique pour l'affichage)
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"><title>Diagnostica</title><style>body { background-color: #0a0f1d; color: #e2e8f0; font-family: monospace; padding: 20px; } .game-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; } .panel { background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 20px; } .monitor { border: 2px solid #39ff14; background: #050b05; padding: 15px; color: #39ff14; font-size: 20px; } .log-box { background: #000; border: 1px solid #334155; padding: 10px; height: 300px; overflow-y: auto; color: #38bdf8; margin-bottom: 15px; } .input-area { display: flex; gap: 10px; } input { flex: 1; background: #1f2937; border: 1px solid #4b5563; color: #fff; padding: 12px; font-size: 16px; } button { background: #00f2fe; color: #000; border: none; padding: 0 20px; font-weight: bold; cursor: pointer; } .med-btn { background: #f43f5e; color: white; padding: 10px; margin-top: 5px; width: 100%; border: none; cursor: pointer; }</style></head>
    <body>
        <header><h1 style="color: #00f2fe; margin:0 0 20px 0;">🩺 DIAGNOSTICA NLP INTERACTIVE</h1></header>
        <div class="game-container">
            <div class="panel">
                <h2 style="color: #f43f5e; margin-top:0;">Dossier : ${currentPatient.name}</h2>
                <div class="monitor">
                    <p>❤️ FC : <span id="fc">${currentPatient.vitals.heartRate}</span> bpm</p>
                    <p>🧪 Potassium : <span id="kaliemie">${currentPatient.vitals.potassium}</span> mmol/L</p>
                </div>
                <h3>Actions à la souris :</h3>
                <button class="med-btn" onclick="sendServerCommand('Injecter amoxicilline')">Amoxicilline 1g IV</button>
                <button class="med-btn" onclick="sendServerCommand('Ausculter les poumons')">Ausculter les poumons</button>
            </div>
            <div class="panel">
                <h2>Console IA (Écris librement ce que tu veux faire)</h2>
                <div class="log-box" id="logBox">${gameLogs.map(l => `<div>${l}</div>`).join('')}</div>
                <div class="input-area">
                    <input type="text" id="cmdInput" placeholder="Ex: 'Où as-tu mal ?', 'Fais un ECG', 'Donne du paracetamol'..." onkeypress="if(event.key==='Enter') submitText()">
                    <button onclick="submitText()">Envoyer</button>
                </div>
            </div>
        </div>
        <script>
            async function sendServerCommand(commandText) {
                const response = await fetch('/api/command', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ command: commandText })
                });
                const data = await response.json();
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
    console.log(`🚀 Serveur NLP connecté et à l'écoute.`);
});
