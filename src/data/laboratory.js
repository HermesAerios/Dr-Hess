// src/data/laboratory.js
// Modèle de Données Médicales — Examens de Laboratoire (Scalable & FHIR-Ready)

export const NFS = {
    id: "bio_nfs",
    name: "Numération Formule Sanguine (NFS / Hémogramme)",
    category: "Biologie médicale",
    specialty: "Hématologie",
    department: "Laboratoire Central d'Hématologie",
    description: "Évaluation quantitative et qualitative des éléments figurés du sang (érythrocytes, leucocytes, plaquettes) et de leurs indices.",
    type: "laboratory",
    specimen: "blood",
    preparation: {
        conditions: "Pas de jeûne strict obligatoire, mais recommandé. Éviter un effort physique intense avant le prélèvement.",
        fasting: false,
        medicationStop: "Signaler tout traitement anticoagulant ou chimiothérapie en cours.",
        consentRequired: false
    },
    execution: {
        duration: 2, // Temps du geste (minutes virtuelles)
        technique: "Impédancemétrie et cytométrie en flux laser sur automate d'hématologie",
        equipment: "Tube EDTA K3 (Bouchon Violet) - 4mL"
    },
    turnaroundTime: 45, // Délai de rendu standard à l'hôpital (minutes virtuelles)
    urgency: "emergency", // Peut être demandé en urgence vitale (délai réduit à 15 min)
    parameters: [
        "hemoglobine",
        "hematocrite",
        "erythrocytes",
        "leucocytes",
        "plaquettes",
        "vgm",
        "tcmh",
        "ccmh",
        "rdw",
        "reticulocytes",
        "polynucleaires_neutrophiles",
        "neutrophiles_pct",
        "lymphocytes",
        "monocytes",
        "eosinophiles",
        "basophiles",
        "blastes"
    ],
    possibleResults: {
        profile: ["Normal", "Anémie microcytaire", "Anémie macrocytaire", "Thrombopénie isolée", "Hyperleucocytose à PNN", "Pancytopénie", "Agranulocytose"]
    },
    referenceRanges: {
        hemoglobine: { male: [13.0, 17.0], female: [12.0, 16.0], pregnancy_t3: [11.0, 14.0] },
        leucocytes: { adult: [4.0, 10.0], child_under_5: [6.0, 15.0] },
        plaquettes: { general: [150, 400] }
    },
    criticalValues: {
        hemoglobine: { low: 7.0, high: 20.0, msg: "⚠️ ALERTE CRITIQUE : Anémie sévère nécessitant une transfusion immédiate ou Polyglobulie majeure." },
        plaquettes: { low: 20, high: 1000, msg: "⚠️ ALERTE CRITIQUE : Risque hémorragique central majeur (Seuil de sécurité thrombopénique dépassé)." },
        polynucleaires_neutrophiles: { low: 0.5, msg: "⚠️ ALERTE CRITIQUE : Agranulocytose / Neutropénie profonde. Risque de choc septique foudroyant." }
    },
    associatedDiseases: [
        "anemie_ferriprive",
        "leucemie_aigue",
        "sepsis_grave",
        "syndrome_hellp",
        "aplasie_medullaire",
        "paludisme_acces_pernicieux"
    ],
    indications: [
        "Fièvre inexpliquée ou suspicion de syndrome infectieux",
        "Pâleur cutanéo-muqueuse, asthénie, suspicion d'anémie",
        "Syndrome hémorragique spontané (pétéchies, ecchymoses, épistaxis)",
        "Bilan pré-opératoire systématique",
        "Surveillance d'une chimiothérapie cytotoxique"
    ],
    contraindications: [
        "Aucune contre-indication absolue. Éviter de prélever du côté d'une fistule artério-veineuse ou d'un curage ganglionnaire axillaire."
    ],
    interpretation: "Une baisse de l'hémoglobine définit l'anémie. Le VGM classe l'anémie en microcytaire (<80fL) ou macrocytaire (>100fL). Une hyperleucocytose à PNN oriente vers une infection bactérienne ou une nécrose tissulaire. Une thrombopénie <150 G/L impose l'exclusion d'un faux dicot en vérifiant l'absence d'agrégats sur le frottis.",
    linkedExams: ["bio_crp", "bio_frottis_sanguin", "bio_ferritine", "bio_hemostase"],
    cost: 15.20,
    coding: {
        LOINC: "55284-4",
        SNOMED: "26604007",
        CCAM: "0901"
    }
};

export const HEMOSTASE = {
    id: "bio_hemostase",
    name: "Bilan d'Hémostase standard (TP, TCA, INR)",
    category: "Biologie médicale",
    specialty: "Hématologie",
    department: "Laboratoire Central d'Hématologie / Coagulation",
    description: "Exploration globale de la voie endogène (TCA) et de la voie exogène (TP/INR) de la coagulation plasmatique.",
    type: "laboratory",
    specimen: "blood",
    preparation: {
        conditions: "Prélèvement soigné sans garrot prolongé pour éviter l'activation des facteurs de coagulation.",
        fasting: false,
        medicationStop: "Préciser impérativement si le patient est sous Héparine, AVK ou Anticoagulants Oraux Directs (AOD).",
        consentRequired: false
    },
    execution: {
        duration: 2,
        technique: "Chronométrie optique automatisée de la formation du caillot de fibrine",
        equipment: "Tube Citrate de Sodium 3.2% (Bouchon Bleu) - Remplissage à 100% obligatoire"
    },
    turnaroundTime: 40,
    urgency: "emergency",
    parameters: ["tp", "inr", "tca"],
    possibleResults: {
        profile: ["Normal", "Allongement isolé du TCA", "Baisse isolée du TP", "Coagulopathie de consommation (CIVD)", "Profil sous AVK", "Profil sous Héparine"]
    },
    referenceRanges: {
        tp: { general: [70, 130] },
        inr: { healthy: [0.8, 1.2], avk_target_standard: [2.0, 3.0], avk_target_valve: [2.5, 3.5] },
        tca: { ratio: [0.8, 1.2] }
    },
    criticalValues: {
        inr: { high: 5.0, msg: "⚠️ ALERTE CRITIQUE : Surdosage majeur en AVK, risque d'hémorragie intracrânienne spontanée." },
        tp: { low: 30, msg: "⚠️ ALERTE CRITIQUE : Insuffisance hépatocellulaire sévère ou CIVD cataclysmique. Risque de saignement incoercible." }
    },
    associatedDiseases: [
        "cirrhose_hepatique",
        "civd",
        "hemophilie",
        "surdosage_anticoagulants",
        "insuffisance_hepatocellulaire_aigue"
    ],
    indications: [
        "Bilan pré-opératoire ou avant un geste invasif à risque hémorragique",
        "Surveillance d'un traitement par Anti-Vitamine K (AVK) ou Héparine Non Fractionnée (HNF)",
        "Exploration d'un syndrome hémorragique ou de suffusions sanguines",
        "Suspicion d'insuffisance hépatique sévère ou de sepsis avec CIVD"
    ],
    contraindications: ["Aucune."],
    interpretation: "Un TP effondré associé à un allongement du TCA et une chute du fibrinogène signe une CIVD en contexte de choc ou de sepsis. Un INR élevé justifie l'arrêt immédiat des AVK et l'injection de Vitamine K +/- PPSB selon la gravité du saignement.",
    linkedExams: ["bio_fibrinogene", "bio_ddimeres", "bio_nfs", "bio_bilan_hepatique"],
    cost: 22.40,
    coding: {
        LOINC: "34714-6",
        SNOMED: "43739002",
        CCAM: "0912"
    }
};

export const LABORATORY_EXAMS = [NFS, HEMOSTASE];
