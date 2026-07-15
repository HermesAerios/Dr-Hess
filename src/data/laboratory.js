// src/data/laboratory.js

export const NFS = {
    id: "bio_nfs",
    name: "Numération Formule Sanguine (NFS)",
    category: "Hématologie",
    service: ["Urgences", "Réanimation", "Médecine", "Oncologie"],
    specimen: "Sang total (Tube EDTA - Violet)",
    duration: 15, // minutes de temps virtuel in-game
    parameters: [
        "hemoglobine",
        "hematocrite",
        "leucocytes",
        "plaquettes",
        "vgm"
    ]
};

export const HEMOSTASE = {
    id: "bio_hemostase",
    name: "Bilan d'Hémostase standard",
    category: "Hématologie",
    service: ["Urgences", "Réanimation", "Chirurgie"],
    specimen: "Plasma (Tube Citrate - Bleu)",
    duration: 20,
    parameters: [
        "tp",
        "inr",
        "tca_ratio"
    ]
};

export const IONOGRAMME = {
    id: "bio_ionogramme",
    name: "Ionogramme sanguin et fonction rénale",
    category: "Biochimie",
    service: ["Urgences", "Réanimation", "Médecine"],
    specimen: "Sérum ou Plasma (Tube Héparine - Vert / Sec - Rouge)",
    duration: 30,
    parameters: [
        "sodium",
        "potassium",
        "chlore",
        "uree",
        "creatinine"
    ]
};

export const CRP = {
    id: "bio_crp",
    name: "Protéine C-Réactive",
    category: "Immunologie / Inflammation",
    service: ["Urgences", "Médecine", "Infectiologie"],
    specimen: "Sérum (Tube Sec ou Héparine)",
    duration: 25,
    parameters: [
        "crp"
    ]
};

export const GDS_LACTATES = {
    id: "bio_gds_lactates",
    name: "Gaz du sang artériels et Lactates",
    category: "Réanimation",
    service: ["Urgences", "Réanimation", "Pneumologie"],
    specimen: "Sang artériel (Seringue héparinée spécifique)",
    duration: 5, // Examen quasi immédiat sur automate délocalisé
    parameters: [
        "ph",
        "pao2",
        "paco2",
        "hco3",
        "lactates"
    ]
};

export const LABORATORY_EXAMS = [
    NFS,
    HEMOSTASE,
    IONOGRAMME,
    CRP,
    GDS_LACTATES
];
