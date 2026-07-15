// src/data/imaging.js
// Modèle de Données Médicales — Examens d'Imagerie & Tracés (Scalable & FHIR-Ready)

export const ANGIO_TDM_PULMONAIRE = {
    id: "img_ct_angioscanner_pulm",
    name: "Angio-TDM des artères pulmonaires (Scanner Embolie Pulmonaire)",
    category: "Imagerie médicale",
    specialty: "Radiologie diagnostique / Pneumologie",
    department: "Service d'Imagerie Médicale / Scanner Urgences",
    description: "Tomodensitométrie thoracique avec injection de produit de contraste iodé synchronisée sur le tronc de l'artère pulmonaire (Bolus Tracking).",
    type: "imaging",
    specimen: "imaging",
    preparation: {
        conditions: "Vérification de la fonction rénale (Créatininémie/DFG) obligatoire. Recherche d'antécédents d'allergie grave aux produits de contraste iodés.",
        fasting: false,
        medicationStop: "Arrêt de la Metformine le jour de l'examen et reprise à H+48 après contrôle de la fonction rénale si insuffisance rénale préexistante.",
        consentRequired: true // Consentement oral éclairé recueilli, sauf si urgence vitale avec patient inconscient
    },
    execution: {
        duration: 10, // minutes in-game pour le passage dans la machine
        technique: "Acquisition hélicoïdale multi-barrettes millimétrique haute résolution avec reconstruction 3D",
        equipment: "Scanner tomodensitométrique, injecteur automatique double tête, cathéter veineux de bon calibre (Minimum 18G au pli du coude)"
    },
    turnaroundTime: 30, // Temps de reconstruction et d'interprétation par le radiologue
    urgency: "emergency",
    parameters: [
        "img_permeabilite_arteres_pulmonaires",
        "img_dilatation_vd",
        "img_epanchement_pleural",
        "img_foyer_condensation"
    ],
    possibleResults: {
        profile: ["Normal", "Embolie pulmonaire proximale bilatérale", "Embolie pulmonaire segmentaire lobaire inférieure droite", "Infarctus pulmonaire constitué", "Diagnostic alternatif (Pneumopathie, Dissection)"]
    },
    referenceRanges: {
        diametre_art_pulm: { max_normal_mm: 29 },
        rapport_vd_vg: { max_normal: 0.9 }
    },
    criticalValues: {
        img_permeabilite_arteres_pulmonaires: { 
            defect: "proximal", 
            msg: "⚠️ ALERTE RADIOLOGIQUE : Thrombose massive du tronc ou des branches principales de l'artère pulmonaire. Risque de cœur pulmonaire aigu et d'arrêt cardio-respiratoire par désamorçage." 
        }
    },
    associatedDiseases: [
        "embolie_pulmonaire_grave",
        "thrombose_veineuse_profonde",
        "coeur_pulmonaire_aigu"
    ],
    indications: [
        "Dyspnée aiguë ou douleur thoracique subite à forte suspicion clinique d'embolie pulmonaire",
        "Score de Wells ou de Genève clinique en faveur d'une probabilité intermédiaire ou forte",
        "D-Dimères positifs chez un patient sans contre-indication à l'iode"
    ],
    contraindications: [
        "Contre-indications absolues (hors extrême urgence) : Insuffisance rénale terminale sans dialyse (DFG < 30 mL/min), allergie vraie anaphylactique à l'iode.",
        "Contre-indication relative : Grossesse (envisager une scintigraphie de perfusion ou une écho-Doppler des membres inférieurs d'abord, sauf si détresse maternelle vitale)."
    ],
    interpretation: "La visualisation d'un défaut de rehaussement (lacune endoluminale) cerclé par le produit de contraste affirme le thrombus. La dilatation du ventricule droit avec un rapport VD/VG > 1 traduit un retentissement hémodynamique sévère imposant une prise en charge en soins intensifs ou une thrombolyse si choc associé.",
    linkedExams: ["spec_ecg_12_derivations", "bio_ddimeres", "bio_creatinine", "img_us_vasculaire"],
    cost: 142.50,
    coding: {
        LOINC: "44139-4",
        SNOMED: "419133005",
        CCAM: "0403"
    }
};

export const MONITORAGE_FOETAL_CTG = {
    id: "spec_monitorage_foetal_ctg",
    name: "Enregistrement Cardiotocographique fœtal (RCF / Monitoring)",
    category: "Explorations fonctionnelles",
    specialty: "Obstétrique",
    department: "Salle de Naissance / Urgences Gynéco-Obstétriques",
    description: "Enregistrement simultané du rythme cardiaque fœtal de base par capteur Doppler ultrasonore et de l'activité contractile utérine par capteur de pression externe.",
    type: "monitoring",
    specimen: "none",
    preparation: {
        conditions: "Installation de la patiente en décubitus latéral gauche (DLG) ou en position semi-assise pour éviter le syndrome de compression de la veine cave inférieure.",
        fasting: false,
        medicationStop: "Aucun.",
        consentRequired: false
    },
    execution: {
        duration: 30, // Durée minimale d'un tracé interprétable (minutes virtuelles)
        technique: "Monitorage cardiotocographique externe continu non invasif",
        equipment: "Cardiotocographe, capteur ultrasonique focalisé (RCF), capteur tocométrique (CU), gel échographique, sangles de maintien"
    },
    turnaroundTime: 0, // Lecture en temps réel à l'écran par l'obstétricien/la sage-femme
    urgency: "emergency",
    parameters: [
        "spec_rcf_rythme_base",
        "spec_rcf_variabilite",
        "spec_rcf_accelerations",
        "spec_rcf_decelerations",
        "spec_cu_frequence"
    ],
    possibleResults: {
        profile: [
            "Tracé de type I (Normal / Rassurant)", 
            "Tracé de type II (Indéterminé / À surveiller : Tachycardie, Ralentissements précoces)", 
            "Tracé de type III (Pathologique / Souffrance fœtale aiguë : Bradycardie constante, Ralentissements tardifs ou variables répétés, Rythme sinusoïdal)"
        ]
    },
    referenceRanges: {
        rythme_base: { normal_bpm: [110, 160] },
        variabilite: { normal_bpm: [6, 25] },
        cu_frequence: { normal_max_10_min: 5 }
    },
    criticalValues: {
        spec_rcf_rythme_base: { low: 90, msg: "🚨 ALERTE OBSTÉTRICALE: Bradycardie fœtale sévère et prolongée. Risque d'anoxie cérébrale fœtale irréversible. Extraction immédiate requise." },
        spec_rcf_variabilite: { type: "sinusoidal", msg: "🚨 ALERTE OBSTÉTRICALE: Rythme sinusoïdal pathognomonique d'une anémie fœtale aiguë catastrophique (Hémorragie de Benckiser ou décollement massif)." }
    },
    associatedDiseases: [
        "souffrance_foetale_aigue",
        "hematome_retroplacentaire",
        "menace_accouchement_premature",
        "chorioamniotite",
        "pre_eclampsie_severe"
    ],
    indications: [
        "Toute admission au 3e trimestre (>24-25 SA) pour motif obstétrical aigu (fièvre, douleur, saignements, contractions)",
        "Suspicion de diminution des mouvements fœtaux perçus par la mère",
        "Rupture prématurée des membranes suspecte ou confirmée",
        "Suivi du travail d'accouchement actif"
    ],
    contraindications: ["Aucune contre-indication."],
    interpretation: "Classifié selon la nomenclature de la FIGO. Un rythme de base >160 bpm avec fièvre maternelle signe la chorioamniotite ou la listériose in utero. Des ralentissements tardifs (Dips II) ou une bradycardie <110 bpm persistante traduisent une hypoxie tissulaire fœtale imposant l'extraction par césarienne immédiate en cas d'HRP associé.",
    linkedExams: ["img_us_obstetricale", "clin_score_bishop", "bio_betahcg"],
    cost: 45.00,
    coding: {
        LOINC: "30467-5",
        SNOMED: "276840003",
        CCAM: "0401"
    }
};

export const IMAGING_EXAMS = [ANGIO_TDM_PULMONAIRE, MONITORAGE_FOETAL_CTG];
