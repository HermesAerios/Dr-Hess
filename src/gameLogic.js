// gameLogic.js
const patient = {
    heartRate: 130,
    bloodPressure: "80/50",
    oxygen: 88,
    isAlive: true
};

const errorDatabase = [];

const drHessQuotes = {
    welcome: "Bienvenue en déchocage. Essayez de ne pas tuer ce patient en moins de 5 minutes...",
    bad_med: "De l'adrénaline maintenant ? Vous avez eu votre diplôme dans une pochette surprise ?",
    good_action: "Miracle. Vous avez fait chose de correct. Ne prenez pas la confiance.",
    death: "Heure du décès : maintenant. Félicitations, vous venez de libérer un lit."
};

function startTimeLoop() {
    setInterval(() => {
        if (patient.isAlive) {
            patient.heartRate -= Math.floor(Math.random() * 5);
            patient.oxygen -= Math.floor(Math.random() * 2);
            
            if (patient.heartRate <= 0 || patient.oxygen <= 50) {
                patient.isAlive = false;
                patient.heartRate = 0;
                patient.oxygen = 0;
                patient.bloodPressure = "0/0";
            }
        }
    }, 5000);
}

function processAction(actionType) {
    let responseQuote = "";

    if (!patient.isAlive) {
        return { quote: "Arrêtez de vous acharner, il est mort.", patient };
    }

    if (actionType === 'oxygen') {
        patient.oxygen = Math.min(100, patient.oxygen + 10);
        responseQuote = drHessQuotes.good_action;
    } else if (actionType === 'shock') {
        responseQuote = "Un choc sans vérifier le tracé ? Danger public.";
        errorDatabase.push({
            time: new Date().toLocaleTimeString(),
            action: "Choc électrique à l'aveugle",
            comment: "Mise en danger de la vie du patient."
        });
    } else if (actionType === 'adrenaline') {
        patient.heartRate += 30;
        responseQuote = drHessQuotes.bad_med;
        errorDatabase.push({
            time: new Date().toLocaleTimeString(),
            action: "Injection Adrénaline injustifiée",
            comment: "Tachycardie iatrogène provoquée."
        });
    }

    return { quote: responseQuote, patient };
}

module.exports = {
    patient,
    errorDatabase,
    startTimeLoop,
    processAction
};
