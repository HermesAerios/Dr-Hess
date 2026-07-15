// src/data/parameters.js

export const LAB_PARAMETERS = {
    // --- HÉMATOLOGIE ---
    hemoglobine: {
        name: "Hémoglobine",
        unit: "g/dL",
        normal: { male: [13.0, 17.0], female: [12.0, 16.0], child: [11.0, 14.0] }
    },
    hematocrite: {
        name: "Hématocrite",
        unit: "%",
        normal: { male: [40, 52], female: [37, 47] }
    },
    leucocytes: {
        name: "Leucocytes (Globules blancs)",
        unit: "G/L",
        normal: [4.0, 10.0]
    },
    plaquettes: {
        name: "Plaquettes",
        unit: "G/L",
        normal: [150, 400]
    },
    vgm: {
        name: "Volume Globulaire Moyen (VGM)",
        unit: "fL",
        normal: [80, 100]
    },
    
    // --- HÉMOSTASE ---
    tp: {
        name: "Taux de Prothrombine (TP)",
        unit: "%",
        normal: [70, 130]
    },
    inr: {
        name: "INR",
        unit: "",
        normal: [0.8, 1.2]
    },
    tca_ratio: {
        name: "Ratio TCA (Patient/Témoin)",
        unit: "",
        normal: [0.8, 1.2]
    },
    fibrinogene: {
        name: "Fibrinogène",
        unit: "g/L",
        normal: [2.0, 4.0]
    },
    ddimeres: {
        name: "D-Dimères",
        unit: "ng/mL",
        normal: [0, 500] // Seuil d'exclusion classique, ajustable selon l'âge
    },

    // --- BIOCHIMIE & ÉLECTROLYTES ---
    sodium: {
        name: "Sodium (Na+)",
        unit: "mmol/L",
        normal: [135, 145]
    },
    potassium: {
        name: "Potassium (K+)",
        unit: "mmol/L",
        normal: [3.5, 4.5]
    },
    chlore: {
        name: "Chlore (Cl-)",
        unit: "mmol/L",
        normal: [95, 105]
    },
    uree: {
        name: "Urée",
        unit: "mmol/L",
        normal: [2.5, 7.5]
    },
    creatinine: {
        name: "Créatinine",
        unit: "µmol/L",
        normal: { male: [80, 115], female: [60, 90] }
    },
    crp: {
        name: "Protéine C-Réactive (CRP)",
        unit: "mg/L",
        normal: [0, 5]
    },
    lactates: {
        name: "Lactates artériels",
        unit: "mmol/L",
        normal: [0.5, 2.0]
    },
    
    // --- GAZ DU SANG (GDS) ---
    ph: {
        name: "pH artériel",
        unit: "",
        normal: [7.35, 7.45]
    },
    pao2: {
        name: "PaO2",
        unit: "mmHg",
        normal: [80, 100]
    },
    paco2: {
        name: "PaCO2",
        unit: "mmHg",
        normal: [35, 45]
    },
    hco3: {
        name: "Bicarbonates (HCO3-)",
        unit: "mmol/L",
        normal: [22, 26]
    }
};
