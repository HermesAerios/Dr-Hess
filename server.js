// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const game = require('./gameLogic');

// Démarrage de l'état du patient
game.startTimeLoop();

const server = http.createServer((req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        // Lecture du fichier HTML séparé
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end("Erreur serveur : impossible de charger l'interface.");
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(content);
        });
    } 
    else if (req.url === '/api/vitals' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(game.patient));
    }
    else if (req.url === '/api/errors' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(game.errorDatabase));
    }
    else if (req.url === '/api/action' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        
        req.on('end', () => {
            const parsedBody = JSON.parse(body);
            const result = game.processAction(parsedBody.action);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        });
    } 
    else {
        res.writeHead(404);
        res.end("Route introuvable.");
    }
});

server.listen(3000, () => {
    console.log("Serveur démarré sur http://localhost:3000");
});