import http from 'http';

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    // Voici l'interface visuelle (HTML/CSS/JS) que ta souris et ton clavier vont contrôler
    const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Diagnostica : Protocole EDN</title>
        <style>
            body {
                background-color: #0a0f1d;
                color: #e2e8f0;
                font-family: 'Courier New', Courier, monospace;
                margin: 0;
                padding: 20px;
                display: flex;
                flex-direction: column;
                height: 100vh;
                box-sizing: border-box;
            }
            header {
                border-bottom: 2px solid #00f2fe;
                padding-bottom: 10px;
                margin-bottom: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .game-container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                flex: 1;
                min-height: 0;
            }
            .panel {
                background: #111827;
                border: 1px solid #1f2937;
                border-radius: 8px;
                padding: 20px;
                display: flex;
                flex-direction: column;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
            }
            .monitor {
                border: 2px solid #39ff14;
                background: #050b05;
                padding: 15px;
                border-radius: 4px;
                color: #39ff14;
                margin-bottom: 15px;
            }
            .pulse {
                animation: blink 1s infinite;
                font-weight: bold;
            }
            @keyframes blink {
                0% { opacity: 0.2; }
                50% { opacity: 1; }
                100% { opacity: 0.2; }
            }
            .log-box {
                background: #000;
                border: 1px solid #334155;
                font-size: 14px;
                padding: 10px;
                flex: 1;
                overflow-y: auto;
                border-radius: 4px;
                margin-bottom: 15px;
                color: #38bdf8;
            }
            .input-area {
                display: flex;
                gap: 10px;
            }
            input[type="text"] {
                flex: 1;
                background: #1f2937;
                border: 1px solid #4b5563;
                color: #fff;
                padding: 12px;
                border-radius: 4px;
                font-size: 16px;
            }
            button {
                background: #00f2fe;
                color: #000;
                border: none;
                padding: 0 20px;
                font-weight: bold;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
            }
            button:hover {
                background: #4facfe;
            }
            .med-btn {
                background: #f43f5e;
                color: white;
                padding: 10px;
                margin-top: 5px;
                width: 100%;
            }
            .med-btn:hover {
                background: #be123c;
            }
        </style>
    </head>
    <body>

        <header>
            <h1 style="margin:0; color: #00f2fe; font-size: 24px;">🩺 DIAGNOSTICA v1.0</h1>
            <div style="color: #94a3b8;">Statut : Serveur Synchrone Actif</div>
        </header>

        <div class="game-container">
            <!-- PANNEAU GAUCHE : MONITEUR DU PATIENT -->
            <div class="panel">
                <h2 style="margin-top:0; color: #f43f5e;">Dossier Clinique : Clara Lombardi</h2>
                <p><strong>Âge :</strong> 28 ans | <strong>Motif :</strong> Céphalées et confusion</p>
                
                <div class="monitor">
                    <div class="pulse">❤️ ECG : En ligne (Sinusal)</div>
                    <p style="font-size: 24px; margin: 10px 0;">Fréquence Cardiaque : <span id="fc">78</span> bpm</p>
                    <p style="margin: 5px 0;">Tension : 120/80 mmHg</p>
                    <p style="margin: 5px 0;">Saturation O2 : 98%</p>
                </div>

                <h3 style="margin-bottom: 5px;">Prescriptions rapides (Souris)</h3>
                <button class="med-btn" onclick="sendAction('Injecter Amoxicilline 1g IV')">💉 Injecter Amoxicilline 1g IV</button>
                <button class="med-btn" onclick="sendAction('Administrer Paracétamol 1g PO')">💊 Administrer Paracétamol 1g PO</button>
            </div>

            <!-- PANNEAU DROITE : CONSOLE DE COMMANDE -->
            <div class="panel">
                <h2 style="margin-top:0; color: #38bdf8;">Console d'Action (Clavier)</h2>
                <p style="color: #64748b; margin-top:0;">Tapez un examen, une question ou une action médicale ci-dessous :</p>
                
                <div class="log-box" id="logBox">
                    [SYSTEME] Prêt. En attente de vos directives médicales...<br>
                    [INFO] Essayez de taper "Ausculter le patient" ou "Demander une prise de sang".
                </div>

                <div class="input-area">
                    <input type="text" id="cmdInput" placeholder="Que voulez-vous faire ?" onkeypress="handleKeyPress(event)">
                    <button onclick="submitCommand()">Valider</button>
                </div>
            </div>
        </div>

        <script>
            // Petite logique de simulation interactive pour tester ton clavier et ta souris
            function sendAction(text) {
                const logBox = document.getElementById('logBox');
                logBox.innerHTML += \`<br><span style="color:#f43f5e;">➔ \${text}</span>\`;
                
                if(text.includes('Amoxicilline')) {
                    logBox.innerHTML += \`<br><span style="color:#39ff14;">[PHARMA] Injection enregistrée. Calcul de la concentration plasmatique en cours...</span>\`;
                } else {
                    logBox.innerHTML += \`<br><span style="color:#e2e8f0;">[INFO] Action prise en compte dans l'historique du patient.</span>\`;
                }
                logBox.scrollTop = logBox.scrollHeight;
            }

            function submitCommand() {
                const input = document.getElementById('cmdInput');
                const val = input.value.trim();
                if(!val) return;
                
                const logBox = document.getElementById('logBox');
                logBox.innerHTML += \`<br><span style="color:#fff;">⌨️ \${val}</span>\`;
                
                // Réponses intelligentes simulées
                const cmd = val.toLowerCase();
                if(cmd.includes('sang') || cmd.includes('bilan')) {
                    logBox.innerHTML += \`<br><span style="color:#39ff14;">[LABO] Prise de sang effectuée. Créatinine : 85 µmol/L, Potassium : 4.1 mmol/L.</span>\`;
                } else if(cmd.includes('ausculter') || cmd.includes('écouter')) {
                    logBox.innerHTML += \`<br><span style="color:#39ff14;">[CLINIQUE] Murmure vésiculaire normal. Pas de bruits cardiaques surajoutés.</span>\`;
                } else {
                    logBox.innerHTML += \`<br><span style="color:#64748b;">[MOTEUR] Analyse de la commande... Action mémorisée.</span>\`;
                }
                
                input.value = '';
                logBox.scrollTop = logBox.scrollHeight;
            }

            function handleKeyPress(e) {
                if(e.key === 'Enter') {
                    submitCommand();
                }
            }
        </script>
    </body>
    </html>
    `;

    res.end(html);
});

server.listen(port, () => {
    console.log(`🚀 Interface graphique déployée sur le port ${port}`);
});
