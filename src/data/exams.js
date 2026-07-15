// src/data/exams.js
// src/data/exams.js
// Index centralisateur des modèles d'examens médicaux de l'application ScribECN

import { LABORATORY_EXAMS } from './laboratory.js';
import { IMAGING_EXAMS } from './imaging.js';
// Les futurs modules (specialties.js, pathology.js, genetic.js) seront importés ici au fur et à mesure.

export const COMPLETE_MEDICAL_EXAMS_DATABASE = [
    ...LABORATORY_EXAMS,
    ...IMAGING_EXAMS
];

// Helper d'interrogation rapide pour le moteur de simulation
export function getExamById(examId) {
    return COMPLETE_MEDICAL_EXAMS_DATABASE.find(exam => exam.id === examId) || null;
}

export default COMPLETE_MEDICAL_EXAMS_DATABASE;
// Catalogue exhaustif de tous les examens, procédures et explorations du moteur ScribECN

export const EXAM_CATALOG = {
    // ==========================================
    // 1. BIOLOGIE MÉDICALE — HÉMATOLOGIE
    // ==========================================
    "bio_nfs": "NFS (Hémogramme)",
    "bio_formule_leucocytaire": "Formule leucocytaire complète",
    "bio_reticulocytes": "Taux de réticulocytes",
    "bio_frottis_sanguin": "Frottis sanguin",
    "bio_myelogramme": "Myélogramme (Ponction de moelle)",
    "interv_biopsie_medullaire": "Biopsie ostéo-médullaire (BOM)",
    "bio_cytologie_medullaire": "Cytologie médullaire",
    "bio_immunophenotypage_lymph": "Immunophénotypage lymphocytaire",
    "bio_cytometrie_flux": "Cytométrie en flux (Sang/Moelle)",

    // ==========================================
    // 2. BIOLOGIE MÉDICALE — HÉMOSTASE
    // ==========================================
    "bio_tp": "Taux de Prothrombine (TP)",
    "bio_inr": "INR",
    "bio_tca": "Temps de Céphaline Activée (TCA)",
    "bio_temps_quick": "Temps de Quick",
    "bio_fibrinogene": "Fibrinogène",
    "bio_ddimeres": "D-Dimères",
    "bio_facteurs_coagulation": "Dosage global des facteurs de coagulation",
    "bio_facteur_v": "Dosage Facteur V",
    "bio_facteur_viii": "Dosage Facteur VIII",
    "bio_facteur_ix": "Dosage Facteur IX",
    "bio_facteur_xi": "Dosage Facteur XI",
    "bio_antithrombine": "Dosage Antithrombine III",
    "bio_proteine_c": "Dosage Protéine C",
    "bio_proteine_s": "Dosage Protéine S",
    "bio_lupus_anticoagulant": "Recherche d'anticoagulant circulant (Lupus)",
    "bio_von_willebrand": "Dosage Facteur Willebrand (VWF)",
    "bio_agregation_plaquettaire": "Test d'agrégation plaquettaire",

    // ==========================================
    // 3. BIOLOGIE MÉDICALE — BIOCHIMIE
    // ==========================================
    "bio_uree": "Urée sanguine",
    "bio_creatinine": "Créatininémie",
    "bio_dfg": "Débit de Filtration Glomérulaire (DFG)",
    "bio_clairance_creatinine": "Clairance de la créatinine (sur urines 24h)",
    "bio_cystatine_c": "Cystatine C",
    "bio_ionogramme": "Ionogramme sanguin",
    "bio_bilan_hepatique": "Bilan hépatique complet",
    "bio_alat": "ALAT (SGPT)",
    "bio_asat": "ASAT (SGOT)",
    "bio_ggt": "Gamma-GT",
    "bio_pal": "Phosphatases alcalines (PAL)",
    "bio_bilirubine_totale": "Bilirubine totale",
    "bio_bilirubine_conjuguee": "Bilirubine conjuguée",
    "bio_albumine": "Albuminémie",
    "bio_proteines_totales": "Protéines totales",
    "bio_ammoniemie": "Ammoniémie",
    "bio_glycemie": "Glycémie",
    "bio_hba1c": "Hémoglobine glyquée (HbA1c)",
    "bio_bilan_lipidique": "Bilan lipidique (EAL)",
    "bio_cholesterol_total": "Cholestérol total",
    "bio_hdl": "Cholestérol HDL",
    "bio_ldl": "Cholestérol LDL",
    "bio_triglycerides": "Triglycérides",
    "bio_acide_urique": "Acide urique",

    // ==========================================
    // 4. BIOLOGIE MÉDICALE — GAZ DU SANG
    // ==========================================
    "bio_gds_arteriel": "Gaz du sang artériel",
    "bio_gds_veineux": "Gaz du sang veineux",
    "bio_gds_ph": "pH sanguin",
    "bio_gds_pao2": "PaO2",
    "bio_gds_paco2": "PaCO2",
    "bio_gds_hco3": "Bicarbonates (HCO3-)",
    "bio_gds_be": "Base Excess (BE)",
    "bio_lactates": "Lactates sanguins",
    "bio_co_oxymetrie": "CO-oxymétrie",
    "bio_carboxyhemoglobine": "Carboxyhémoglobine",
    "bio_methemoglobine": "Méthémoglobine",

    // ==========================================
    // 5. MICROBIOLOGIE
    // ==========================================
    "bio_hemocultures": "Hémocultures (Aéro/Anaérobies)",
    "bio_ecbu": "ECBU (Examen Cyto-Bactériologique des Urines)",
    "bio_coproculture": "Coproculture",
    "bio_prelevement_bronchique": "Prélèvement distal protégé (PDP)",
    "bio_examen_crachats": "Examen cyto-bactériologique des crachats (ECBC)",
    "bio_lba_culture": "Culture de Lavage Broncho-Alvéolaire (LBA)",
    "bio_culture_lcr": "Culture de LCR",
    "bio_culture_pleurale": "Culture de liquide pleural",
    "bio_culture_ascite": "Culture de liquide d'ascite",
    "bio_culture_synoviale": "Culture de liquide synovial",
    "bio_culture_peau": "Culture cutanée/mucueuse",
    "bio_culture_plaie": "Prélèvement bactériologique de plaie",
    "bio_antibiogramme": "Antibiogramme",
    "bio_cmi": "Concentration Minimale Inhibitrice (CMI)",
    "bio_pcr_virale": "PCR virale (Panel)",
    "bio_charge_virale": "Mesure de charge virale",
    "bio_sero_virale": "Sérologie virale complète",
    "bio_vih": "Sérologie / PCR VIH",
    "bio_vhb": "Sérologie / PCR VHB",
    "bio_vhc": "Sérologie / PCR VHC",
    "bio_cmv": "Sérologie / PCR CMV",
    "bio_ebv": "Sérologie / PCR EBV",
    "bio_hsv": "PCR HSV 1/2",
    "bio_vzv": "PCR VZV",
    "bio_sars_cov_2": "PCR SARS-CoV-2",
    "bio_grippe": "PCR Grippe A/B",
    "bio_vrs": "PCR VRS",
    "bio_myco_direct": "Examen direct mycologique",
    "bio_myco_culture": "Culture fongique",
    "bio_galactomannane": "Antigène Galactomannane",
    "bio_beta_d_glucane": "Bêta-D-Glucane",
    "bio_cryptocoque": "Recherche d'antigène cryptococcique",
    "bio_parasito_selles": "Examen parasitologique des selles (EPS)",
    "bio_goutte_epaisse": "Goutte épaisse (Paludisme)",
    "bio_frottis_parasitaire": "Frottis sanguin parasitaire",
    "bio_pcr_parasitaire": "PCR parasitaire",

    // ==========================================
    // 6. IMMUNOLOGIE
    // ==========================================
    "bio_immunoglobulines": "Dosage des Immunoglobulines (Ig)",
    "bio_iga": "Dosage IgA",
    "bio_igg": "Dosage IgG",
    "bio_igm": "Dosage IgM",
    "bio_ige": "Dosage IgE totales",
    "bio_complement": "Bilan du complément",
    "bio_c3": "Fraction C3 du complément",
    "bio_c4": "Fraction C4 du complément",
    "bio_ch50": "CH50",
    "bio_autoanticorps": "Recherche d'auto-anticorps",
    "bio_ana": "Anticorps antinucléaires (ANA)",
    "bio_anti_dna": "Ac Anti-DNA natif",
    "bio_anca": "ANCA (Ac anti-cytoplasme des PNN)",
    "bio_anti_ccp": "Anti-CCP",
    "bio_facteur_rhumatoide": "Facteur rhumatoïde",

    // ==========================================
    // 7. ANATOMOPATHOLOGIE
    // ==========================================
    "path_examen_histologique": "Examen histologique standard",
    "path_biopsie": "Biopsie tissulaire",
    "path_biopsie_cutanee": "Biopsie cutanée",
    "path_biopsie_hepatique": "Ponction-Biopsie hépatique (PBH)",
    "path_biopsie_renale": "Ponction-Biopsie rénale (PBR)",
    "path_biopsie_prostatique": "Biopsie prostatique",
    "path_biopsie_digestive": "Biopsie digestive",
    "path_biopsie_medullaire": "Biopsie ostéo-médullaire",
    "path_piece_operatoire": "Analyse anapath de pièce opératoire",
    "path_cytologie": "Examen cytologique",
    "path_frottis_cervical": "Frottis cervico-vaginal (FCV)",
    "path_cytologie_urinaire": "Cytologie urinaire",
    "path_autopsie_medicale": "Autopsie médicale",

    // ==========================================
    // 8. GÉNÉTIQUE MÉDICALE
    // ==========================================
    "bio_caryotype": "Caryotype constitutionnel",
    "bio_fish": "Hybridation in situ en fluorescence (FISH)",
    "bio_pcr_genetique": "Test PCR génétique",
    "bio_sequencage_sanger": "Séquençage Sanger",
    "bio_ngs": "Séquençage haut débit (NGS)",
    "bio_panel_genetique": "Panel de gènes ciblés",
    "bio_exome": "Séquençage de l'exome",
    "bio_genome_complet": "Séquençage du génome complet",
    "bio_analyse_mitochondriale": "Analyse de l'ADN mitochondrial",
    "bio_microarray": "Puce à ADN (Microarray)",
    "bio_cgh_array": "CGH-array (ACPA)",

    // ==========================================
    // 9. RADIOLOGIE STANDARD
    // ==========================================
    "img_rx_thorax": "Radiographie du thorax",
    "img_rx_abdomen": "Radiographie de l'abdomen (ASP)",
    "img_rx_bassin": "Radiographie du bassin",
    "img_rx_crane": "Radiographie du crâne",
    "img_rx_colonne_cervicale": "Radiographie du rachis cervical",
    "img_rx_colonne_thoracique": "Radiographie du rachis thoracique",
    "img_rx_colonne_lombaire": "Radiographie du rachis lombaire",
    "img_rx_main": "Radiographie de la main",
    "img_rx_pied": "Radiographie du pied",
    "img_rx_genou": "Radiographie du genou",
    "img_rx_epaule": "Radiographie de l'épaule",

    // ==========================================
    // 10. ÉCHOGRAPHIE
    // ==========================================
    "img_us_abdominale": "Échographie abdominale",
    "img_us_pelvienne": "Échographie pelvienne",
    "img_us_renale": "Échographie rénale et voies urinaires",
    "img_us_hepatique": "Échographie hépato-biliaire",
    "img_us_thyroidienne": "Échographie cervicale/thyroïdienne",
    "img_us_mammaire": "Échographie mammaire",
    "img_us_musculaire": "Échographie musculaire",
    "img_us_articulaire": "Échographie ostéo-articulaire",
    "img_us_pulmonaire": "Échographie pleuro-pulmonaire",
    "img_us_obstetricale": "Échographie obstétricale",

    // ==========================================
    // 11. ÉCHOCARDIOGRAPHIE
    // ==========================================
    "img_echo_cardiaque_tt": "Échographie cardiaque transthoracique (ETT)",
    "img_echo_cardiaque_to": "Échographie transœsophagienne (ETO)",
    "img_echo_stress": "Échographie de stress (Dobutamine / Effort)",
    "img_echo_3d_cardiaque": "Échocardiographie 3D",
    "img_doppler_cardiaque": "Doppler tissulaire et flux cardiaques",

    // ==========================================
    // 12. SCANNER (TDM)
    // ==========================================
    "img_ct_crane": "Scanner du crâne",
    "img_ct_cerebral": "Scanner cérébral",
    "img_ct_thoracique": "Scanner thoracique",
    "img_ct_abdominal": "Scanner abdominal",
    "img_ct_pelvien": "Scanner pelvien",
    "img_ct_corps_entier": "Scanner corps entier (Trauma/Pan-scan)",
    "img_ct_angioscanner": "Angioscanner",
    "img_ct_cardiaque": "Scanner cardiaque",
    "img_ct_coronaire": "Coroscanner",
    "img_ct_dentaire": "Cone-Beam / Dentascanner",
    "img_ct_osseux": "Scanner ostéo-articulaire",

    // ==========================================
    // 13. IRM
    // ==========================================
    "img_mri_cerebrale": "IRM cérébrale",
    "img_mri_medullaire": "IRM médullaire",
    "img_mri_rachis": "IRM du rachis",
    "img_mri_cardiaque": "IRM cardiaque",
    "img_mri_prostate": "IRM prostatique",
    "img_mri_pelvienne": "IRM pelvienne",
    "img_mri_foie": "IRM hépatique / Bili-IRM",
    "img_mri_pancreas": "IRM pancréatique",
    "img_mri_mammaire": "IRM mammaire",
    "img_mri_articulaire": "IRM ostéo-articulaire",
    "img_mri_diffusion": "IRM de diffusion",
    "img_mri_perfusion": "IRM de perfusion",
    "img_mri_spectroscopie": "Spectroscopie RM",

    // ==========================================
    // 14. MÉDECINE NUCLÉAIRE
    // ==========================================
    "img_scinti_osseuse": "Scintigraphie osseuse",
    "img_scinti_thyroidienne": "Scintigraphie thyroïdienne",
    "img_scinti_cardiaque": "Scintigraphie myocardique",
    "img_scinti_renale": "Scintigraphie rénale",
    "img_scinti_pulmonaire": "Scintigraphie pulmonaire (V/Q)",
    "img_scinti_digestive": "Scintigraphie digestive / Vidange gastrique",
    "img_tep_scan": "TEP-Scan",
    "img_tep_fdg": "TEP-Scan au 18F-FDG",
    "img_spect": "SPECT (Tomographie d'émission monophotonique)",

    // ==========================================
    // 15. CARDIOLOGIE
    // ==========================================
    "spec_ecg_12_derivations": "Électrocardiogramme 12 dérivations",
    "spec_holter_ecg": "Holter ECG (24-48h)",
    "spec_holter_tensionnel": "Holter Tensionnel (MAPA)",
    "spec_epreuve_effort": "Épreuve d'effort",
    "spec_test_d_effort_cardiaque": "Test d'effort cardio-respiratoire",
    "interv_coronarographie": "Coronarographie",
    "interv_arteriographie": "Artériographie",
    "interv_catheterisme_cardiaque": "Cathétérisme cardiaque",
    "spec_etude_electrophysiologique": "Exploration électrophysiologique (EEP)",
    "interv_ablation_cardiaque": "Ablation par radiofréquence/cryothérapie",

    // ==========================================
    // 16. PNEUMOLOGIE
    // ==========================================
    "spec_spirometrie": "Spirométrie",
    "spec_efr": "Explorations Fonctionnelles Respiratoires (EFR)",
    "spec_plethysmographie": "Pléthysmographie corporelle",
    "spec_dlco": "Capacité de diffusion du CO (DLCO)",
    "spec_test_marche_6_minutes": "Test de marche de 6 minutes (TM6)",
    "interv_fibroscopie_bronchique": "Fibroscopie bronchique",
    "interv_lba": "Lavage Broncho-Alvéolaire (LBA)",
    "spec_polysomnographie": "Polysomnographie nocturne",
    "spec_polygraphie_sommeil": "Polygraphie ventilatoire",

    // ==========================================
    // 17. NEUROLOGIE
    // ==========================================
    "spec_eeg": "Électroencéphalogramme (EEG)",
    "spec_emg": "Électromyogramme (ENMG)",
    "spec_potentiels_evoques": "Potentiels évoqués (PE)",
    "spec_doppler_transcranien": "Doppler transcrânien (DTC)",
    "interv_ponction_lombaire": "Ponction Lombaire (PL)",
    "clin_test_neuropsychologique": "Bilan neuropsychologique cognitif",
    "spec_monitorage_eeg": "Monitorage vidéo-EEG continu",

    // ==========================================
    // 18. ENDOSCOPIE
    // ==========================================
    "interv_fibroscopie_digestive_haute": "Endoscopie œso-gastro-duodénale (EOGD)",
    "interv_coloscopie": "Coloscopie totale",
    "interv_rectoscopie": "Rectosigmoïdoscopie",
    "interv_echo_endoscopie": "Écho-endoscopie",
    "interv_cpre": "CPRE",
    "interv_capsule_endoscopique": "Vidéocapsule de l'intestin grêle",
    "interv_bronchoscopie": "Bronchoscopie rigide/souple",
    "interv_cystoscopie": "Cystoscopie",
    "interv_hysteroscopie": "Hystéroscopie",
    "interv_arthroscopie": "Arthroscopie",

    // ==========================================
    // 19. OPHTALMOLOGIE
    // ==========================================
    "spec_fond_oeil": "Fond d'œil",
    "spec_oct_retinien": "OCT Rétinien (Macula)",
    "spec_oct_nerf_optique": "OCT Papillaire (Nerf optique)",
    "spec_champ_visuel": "Champ visuel",
    "spec_tonometrie": "Tonométrie (Pression intraoculaire)",
    "spec_angiographie_retinienne": "Angiographie rétinienne",
    "spec_biometrie_oculaire": "Biométrie oculaire",
    "spec_topographie_cornee": "Topographie cornéenne",

    // ==========================================
    // 20. ORL
    // ==========================================
    "spec_audiometrie": "Audiométrie tonale et vocale",
    "spec_tympanometrie": "Tympanométrie",
    "spec_pea": "Potentiels Évoqués Auditifs (PEA)",
    "interv_fibroscopie_orl": "Nasofibroscopie ORL",
    "spec_videonystagmographie": "Vidéonystagmographie (VNG)",
    "spec_tests_vestibulaires": "Épreuves vestibulaires complètes",

    // ==========================================
    // 21. UROLOGIE
    // ==========================================
    "spec_urodynamique": "Bilan urodynamique",
    "spec_debitmetrie_urinaire": "Débitmétrie urinaire",
    "interv_uro_cystoscopie": "Fibroscopie urétro-vésicale (Cystoscopie)", // alias
    "interv_biopsie_prostate": "Biopsie prostatique écho-guidée",
    "img_echographie_prostatique": "Échographie endorectale de la prostate",
    "bio_spermogramme": "Spermogramme / Spermocytogramme",

    // ==========================================
    // 22. OBSTÉTRIQUE / MATERNITÉ
    // ==========================================
    "clin_consultation_prenatale": "Consultation prénatale",
    "img_echo_obstetricale_t1": "Échographie T1 (11-13 SA)",
    "img_echo_obstetricale_t2": "Échographie morphologique T2 (22 SA)",
    "img_echo_obstetricale_t3": "Échographie de croissance T3 (32 SA)",
    "img_echo_morpho_foetale": "Échographie fœtale ciblée de référence",
    "img_doppler_foetal": "Doppler fœtal global",
    "img_doppler_uterin": "Doppler des artères utérines",
    "img_doppler_artere_ombilicale": "Doppler de l'artère ombilicale",
    "img_doppler_artere_cerebrale": "Doppler de l'artère cérébrale moyenne fœtale",
    "spec_monitorage_foetal_ctg": "Cardiotocographie (RCF)",
    "spec_test_non_stress": "Test de non-stress fœtal",
    "spec_test_stress_oxytocine": "Test de tolérance fœtale à l'oxytocine",
    "interv_amniocentese": "Amniocentèse",
    "interv_biopsie_trophoblaste": "Choriocentèse (Biopsie de trophoblaste)",
    "interv_cordocentese": "Cordocentèse",
    "bio_analyse_liquide_amniotique": "Analyse du liquide amniotique",
    "bio_depistage_trisomie": "Dépistage des marqueurs sériques T21",
    "bio_dpni": "DPNI (Test ADN fœtal libre circulant)",
    "bio_depistage_diabete_gest": "Dépistage du diabète gestationnel (HGPO/O'Sullivan)",
    "bio_o_sullivan": "Test de O'Sullivan",
    "bio_hgpo_75g": "Hyperglycémie Provoquée Per Os (HGPO 75g)",
    "bio_pv_streptocoque_b": "Recherche de Streptocoque B vaginal",
    "clin_evaluation_col_uterin": "Évaluation clinique du col utérin",
    "clin_score_bishop": "Calcul du Score de Bishop",

    // ==========================================
    // 23. NÉONATOLOGIE
    // ==========================================
    "clin_score_apgar": "Score d'Apgar (1, 3, 5, 10 min)",
    "clin_examen_neonatal_complet": "Examen clinique complet du nouveau-né",
    "bio_depistage_neonatal": "Dépistage néonatal (Guthrie étendu)",
    "bio_test_guthrie": "Test de Guthrie",
    "bio_depistage_mucoviscidose": "Dépistage mucoviscidose néonatal",
    "bio_depistage_hypothyroidie": "Dépistage hypothyroïdie congénitale",
    "clin_depistage_surdite": "Dépistage néonatal de la surdité (OEA)",
    "spec_pea_neonatal": "PEA néonatal automatisé",
    "spec_oxymetrie_depistage": "Oxymétrie de pouls (dépistage cardiopathie)",
    "img_echo_transfontanellaire": "Échographie transfontanellaire (ETF)",
    "img_echo_renale_neonatale": "Échographie rénale néonatale",
    "img_rx_thorax_neonatal": "Radiographie du thorax néonatal",
    "bio_gds_cordon": "Gaz du sang au cordon ombilical",
    "bio_bilirubinemie_neonatale": "Bilirubinémie (transcutanée/sanguine)",
    "bio_test_coombs_neonatal": "Test de Coombs direct néonatal",

    // ==========================================
    // 24. PÉDIATRIE
    // ==========================================
    "clin_courbe_croissance": "Évaluation des courbes de croissance",
    "clin_mesure_poids_taille_pc": "Mesures anthropométriques (Poids, Taille, PC)",
    "clin_eval_dev_psychomoteur": "Évaluation du développement psychomoteur",
    "clin_test_audition_enfant": "Test d'audition comportemental",
    "spec_spirometrie_enfant": "Spirométrie pédiatrique",
    "spec_test_allergologique_cutane": "Test allergologique cutané global",
    "spec_prick_test": "Prick-tests",
    "spec_patch_test": "Patch-tests",
    "img_echo_hanches_nourrisson": "Échographie des hanches du nourrisson",
    "img_rx_age_osseux": "Radiographie pour âge osseux",
    "img_age_osseux_main": "Radiographie main gauche (Âge osseux Greulich-Pyle)",
    "clin_eval_nutritionnelle_pediat": "Évaluation nutritionnelle pédiatrique",

    // ==========================================
    // 25. RÉANIMATION / SOINS INTENSIFS
    // ==========================================
    // Monitorage cardiovasculaire
    "spec_monitorage_ecg_continu": "Monitorage ECG continu (Scope)",
    "spec_pni": "Pression Artérielle Non Invasive (PNI)",
    "spec_pai": "Pression Artérielle Invasive (Cathéter artériel)",
    "spec_pam": "Pression Artérielle Moyenne (PAM)",
    "spec_pvc": "Pression Veineuse Centrale (PVC)",
    "interv_catheterisme_swan_ganz": "Cathéter de Swan-Ganz",
    "spec_debit_cardiaque": "Mesure du débit cardiaque continu",
    "spec_index_cardiaque": "Calcul de l'index cardiaque",
    "spec_rsv": "Résistances Vasculaires Systémiques (RVS)",
    "spec_vve": "Variation du Volume d'Éjection (VVE)",
    "spec_vpp": "Variation de la Pression Pulsée (VPP)",
    "img_echo_cardiaque_rea": "Échocardiographie au lit de réanimation",
    "img_echo_pulmonaire_rea": "Échographie pleuropulmonaire de réanimation",
    // Monitorage respiratoire
    "spec_capnographie": "Capnographie continue",
    "spec_etco2": "Mesure de l'EtCO2",
    "spec_spirometrie_ventilateur": "Spirométrie sur ventilateur mécanique",
    "spec_volume_courant": "Volume courant expiré (Vt)",
    "spec_volume_minute": "Volume minute (Ve)",
    "spec_frequence_respiratoire": "Fréquence respiratoire",
    "spec_pression_plateau": "Pression de plateau (Pplat)",
    "spec_pression_pic": "Pression de pic (Pmax)",
    "spec_peep": "PEP (Pression Expiratoire Positive)",
    "spec_compliance_pulmonaire": "Compliance pulmonaire statique/dynamique",
    "spec_resistance_airways": "Résistances des voies aériennes (Raw)",
    "spec_rapport_pf": "Rapport PaO2/FiO2 (P/F ratio)",
    // Neuromonitoring
    "clin_score_glasgow": "Score de Glasgow (GCS)",
    "clin_score_rass": "Score de sédation RASS",
    "clin_score_cam_icu": "Score de confusion CAM-ICU",
    "spec_pic": "Pression Intracrânienne (PIC)",
    "spec_dtc_rea": "Doppler transcrânien de réanimation",
    "spec_bis": "Index Bispectral (BIS)",
    "spec_nirs": "Saturation régionale en oxygène cérébrale (NIRS)",

    // ==========================================
    // 26. ANESTHÉSIE
    // ==========================================
    "clin_consultation_anesthesique": "Consultation pré-anesthésique",
    "clin_classification_asa": "Score ASA",
    "clin_eval_voie_aerienne": "Évaluation des voies aériennes",
    "clin_score_mallampati": "Score de Mallampati",
    "clin_distance_thyromentonniere": "Distance thyro-mentonnière",
    "clin_ouverture_buccale": "Mesure de l'ouverture buccale",
    "clin_eval_risque_intubation": "Évaluation du risque d'intubation difficile",
    "spec_monitorage_bis_anesth": "Monitorage BIS per-anesthésique",
    "spec_monitorage_curarisation_tof": "Monitorage de curarisation (TOF)",
    "spec_temperature_perop": "Monitorage continu de la température centrale",
    "spec_profondeur_anesthesie": "Monitorage de la profondeur de l'anesthésie",
    "spec_gaz_anesthesiques_expires": "Fraction expirée des gaz halogénés (MAC)",

    // ==========================================
    // 27. EXPLORATIONS VASCULAIRES
    // ==========================================
    "img_doppler_arteriel": "Écho-Doppler artériel",
    "img_doppler_veineux": "Écho-Doppler veineux",
    "img_doppler_carotidien": "Écho-Doppler des TSA (Carotides)",
    "img_doppler_mi": "Écho-Doppler des membres inférieurs",
    "img_doppler_ms": "Écho-Doppler des membres supérieurs",
    "spec_ips": "Indice de Pression Systolique (IPS)",
    "spec_pression_segmentaire": "Pressions artérielles segmentaires",
    "spec_plethysmographie_vasculaire": "Pléthysmographie artérielle",
    "spec_capillaroscopie": "Capillaroscopie périunguéale",
    "img_angioscanner_vasculaire": "Angioscanner artériel",
    "interv_arteriographie_vasc": "Artériographie diagnostique",
    "interv_phlebographie": "Phlébographie",

    // ==========================================
    // 28. RHUMATOLOGIE
    // ==========================================
    "img_rx_articulaire_rhumato": "Radiographie articulaire ciblée",
    "img_echo_articulaire_rhumato": "Échographie ostéo-articulaire de spécialité",
    "img_irm_articulaire_rhumato": "IRM articulaire spécialisée",
    "interv_ponction_articulaire": "Ponction articulaire",
    "bio_analyse_liquide_synovial": "Analyse du liquide synovial",
    "img_densitometrie_osseuse_dexa": "Ostéodensitométrie (DEXA)",
    "clin_eval_force_musculaire": "Évaluation clinique de la force musculaire (Testing)",
    "spec_capillaroscopie_ongles": "Capillaroscopie des lits unguéaux",
    "interv_biopsie_musculaire": "Biopsie musculaire",
    "spec_emg_musculaire": "Électromyogramme de détection",

    // ==========================================
    // 29. DERMATOLOGIE
    // ==========================================
    "clin_examen_dermatologique": "Examen dermatologique complet",
    "spec_dermoscopie": "Dermoscopie optique/numérique",
    "interv_biopsie_cutanee_dermato": "Biopsie cutanée",
    "bio_examen_mycologique_cutane": "Examen mycologique cutané direct",
    "bio_culture_cutanee": "Culture bactériologique cutanée",
    "bio_prelevement_mycosique": "Prélèvement pour culture fongique (peau/ongles)",
    "spec_patch_tests_dermato": "Patch-tests allergologiques",
    "spec_prick_tests_dermato": "Prick-tests allergologiques",
    "spec_phototest": "Phototests (Exploration de photosensibilité)",
    "spec_photopatch_test": "Photopatch-tests",
    "spec_trichogramme": "Trichogramme",
    "spec_examen_capillaire": "Dermoscopie du cuir chevelu (Trichoscopie)",

    // ==========================================
    // 30. PSYCHIATRIE / NEUROPSYCHOLOGIE
    // ==========================================
    "clin_evaluation_psychiatrique": "Évaluation psychiatrique globale",
    "clin_entretien_clinique": "Entretien clinique semi-structuré",
    "clin_test_mmse": "Mini-Mental State Examination (MMSE)",
    "clin_test_moca": "Montreal Cognitive Assessment (MoCA)",
    "clin_evaluation_cognitive": "Évaluation cognitive globale",
    "clin_test_depression_hamilton": "Échelle de dépression de Hamilton",
    "clin_test_depression_beck": "Inventaire de dépression de Beck",
    "clin_test_anxiete_hamilton": "Échelle d'anxiété de Hamilton",
    "clin_test_personnalite": "Tests projectifs et questionnaires de personnalité",
    "clin_test_attention": "Tests d'attention soutenue",
    "clin_test_memoire": "Batterie de tests mnésiques",
    "clin_test_executif": "Évaluation des fonctions exécutives (BREF)",
    "clin_evaluation_autisme": "Échelles d'évaluation des TSA (ADOS/ADI)",
    "clin_evaluation_tda_h": "Évaluation des troubles déficitaires de l'attention (TDA/H)",

    // ==========================================
    // 31. MÉDECINE PHYSIQUE ET RÉADAPTATION (MPR)
    // ==========================================
    "clin_evaluation_marche": "Analyse clinique et instrumentale de la marche",
    "clin_tug": "Timed Up and Go test (TUG)",
    "clin_test_6_minutes_marche": "Test de marche de 6 minutes (TM6)",
    "clin_evaluation_equilibre": "Évaluation de l'équilibre (Berg, Tinetti)",
    "clin_evaluation_adl": "Grille ADL (Activités de base de la vie quotidienne)",
    "clin_evaluation_iadl": "Grille IADL (Activités instrumentales)",
    "clin_force_musculaire_mrc": "Évaluation de la force musculaire (Échelle MRC)",
    "clin_amplitude_articulaire": "Goniométrie (Amplitudes articulaires)",
    "clin_evaluation_douleur_mpr": "Évaluation multidimensionnelle de la douleur",
    "clin_echelle_eva": "Échelle Visuelle Analogique (EVA)",
    "clin_echelle_dnpm": "Questionnaire DN4 (Douleur neuropathique)",

    // ==========================================
    // 32. CHIRURGIE — ÉVALUATION PRÉOPÉRATOIRE
    // ==========================================
    "clin_bilan_preoperatoire": "Bilan préopératoire chirurgical et anesthésique",
    "bio_nfs_preop": "NFS préopératoire",
    "bio_coagulation_preop": "Bilan d'hémostase préopératoire",
    "bio_ionogramme_preop": "Ionogramme sanguin préopératoire",
    "bio_fonction_renale_preop": "Fonction rénale préopératoire",
    "spec_ecg_preoperatoire": "ECG 12 dérivations de repos préop",
    "img_rx_thorax_preop": "Radiographie du thorax préopératoire",
    "clin_eval_nutritionnelle_preop": "Évaluation nutritionnelle préopératoire",
    "bio_albuminemie_preop": "Albuminémie préopératoire",
    "clin_score_nutritionnel": "Calcul du score de risque nutritionnel (NRI)",
    "clin_consultation_chirurgicale": "Consultation spécialisée de chirurgie",

    // ==========================================
    // 33. RADIOLOGIE INTERVENTIONNELLE
    // ==========================================
    "interv_biopsie_sous_scanner": "Ponction-Biopsie sous contrôle TDM",
    "interv_biopsie_sous_echographie": "Ponction-Biopsie écho-guidée",
    "interv_drainage_percutane": "Drainage d'abcès percutané",
    "interv_nephrostomie": "Mise en place de néphrostomie percutanée",
    "interv_gastrostomie_percutanee": "Gastrostomie percutanée radiologique",
    "interv_embolisation": "Embolisation artérielle thérapeutique",
    "interv_chimioembolisation": "Chimio-embolisation transartérielle (TACE)",
    "interv_radiofrequence_tumorale": "Ablation tumorale par radiofréquence",
    "interv_cryoablation": "Cryoablation tumorale",
    "interv_vertebroplastie": "Vertébroplastie / Cyphoplastie percutanée",
    "interv_infiltration_guidage": "Infiltration articulaire / rachidienne radio-guidée",
    "interv_angioplastie_ir": "Angioplastie transluminale percutanée",
    "interv_pose_stent_ir": "Mise en place de stent vasculaire",

    // ==========================================
    // 34. CARDIOLOGIE INTERVENTIONNELLE
    // ==========================================
    "interv_coronarographie_ci": "Coronarographie diagnostique",
    "interv_angioplastie_coronaire": "Angioplastie coronaire transluminale",
    "interv_pose_stent_coronaire": "Pose de stent coronaire (actif ou nu)",
    "interv_valvuloplastie": "Valvuloplastie percutanée",
    "interv_tavi": "Implantation de valve aortique percutanée (TAVI)",
    "interv_fermeture_fop": "Fermeture percutanée de Foramen Ovale Perméable (FOP)",
    "interv_fermeture_cia": "Fermeture de Communication Inter-Auriculaire (CIA)",
    "interv_ablation_fa": "Ablation de Fibrillation Atriale (FA)",
    "interv_pacemaker_implantation": "Implantation de stimulateur cardiaque (Pacemaker)",
    "interv_defibrillateur_implantation": "Implantation de défibrillateur automatique (DAI)",
    "interv_explo_electrophysio_ci": "Exploration électrophysiologique endocavitaire",

    // ==========================================
    // 35. CHIRURGIE VASCULAIRE
    // ==========================================
    "img_echo_doppler_aorte": "Écho-Doppler de l'Aorte abdominale",
    "img_angioscanner_aorte_cv": "Angioscanner de l'aorte thoracique / abdominale",
    "img_arteriographie_peripherique": "Artériographie diagnostique périphérique",
    "img_cartographie_veineuse": "Cartographie veineuse pré-opératoire",
    "spec_pressions_digitales": "Mesure des pressions systoliques d'orteil / digitales",
    "clin_evaluation_varices": "Évaluation clinique de la maladie veineuse chronique",
    "img_cartographie_saphene": "Cartographie des veines saphènes (Stripping / Pontage)",

    // ==========================================
    // 36. ONCOLOGIE
    // ==========================================
    "clin_bilan_extension": "Bilan d'extension clinique et radiologique",
    "img_scanner_extension": "Scanner TAP d'extension tumorale",
    "img_tep_fdg_onco": "TEP-Scan au FDG d'extension/suivi",
    "img_irm_extension": "IRM dédiée de stadification tumorale",
    "interv_biopsie_tumorale": "Biopsie tissulaire tumorale",
    "path_analyse_histologique_tumeur": "Typage histologique tumoral",
    "path_immunohistochimie_tumeur": "Marqueurs d'immunohistochimie tumorale",
    "bio_profil_moleculaire_tumeur": "Profilage moléculaire (Séquençage tumoral)",
    "bio_biopsie_liquide": "Biopsie liquide (Sang)",
    "bio_adn_tumoral_circulant": "Recherche d'ADN tumoral circulant (ADNtc)",
    "bio_recherche_mutations": "Recherche de mutations ciblées de résistance/sensibilité",

    // ==========================================
    // 37. MÉDECINE NUCLÉAIRE SPÉCIALISÉE
    // ==========================================
    "img_tep_psma": "TEP-Scan au PSMA (Prostate)",
    "img_tep_dotatate": "TEP-Scan au DOTATATE (Tumeurs neuro-endocrines)",
    "img_tep_amiloide": "TEP-Scan aux traceurs amyloïdes (Alzheimer)",
    "img_scinti_parathyroide": "Scintigraphie parathyroïdienne (Sestamibi)",
    "img_scinti_mibg": "Scintigraphie au MIBG (Phéochromocytome/Neuroblastome)",
    "img_scinti_rein_dmsa": "Scintigraphie rénale corticale au DMSA",
    "img_scinti_rgo": "Scintigraphie de reflux gastro-œsophagien",
    "img_scinti_leucocytes": "Scintigraphie aux leucocytes marqués (Infection ostéo-articulaire)",

    // ==========================================
    // 38. EXAMENS OPHTALMOLOGIQUES AVANCÉS
    // ==========================================
    "spec_angio_fluoresceine": "Angiographie à la fluorescéine",
    "spec_angio_vert_indocyanine": "Angiographie au vert d'indocyanine (ICG)",
    "spec_topographie_corneenne": "Topographie cornéenne orbscan / pentacam",
    "spec_pachymetrie": "Pachymétrie (Épaisseur cornéenne)",
    "spec_aberrometrie": "Aberrométrie",
    "spec_microscopie_speculaire": "Microscopie spéculaire (Comptage endothélial)",
    "spec_biometrie_laser": "Biométrie optique / Laser",
    "img_echographie_oculaire": "Échographie oculaire mode B",
    "spec_oct_angiographie": "OCT-Angiographie (Sans injection)",

    // ==========================================
    // 39. ORL AVANCÉ
    // ==========================================
    "interv_nasofibroscopie": "Nasofibroscopie diagnostique",
    "interv_laryngoscopie": "Laryngoscopie directe sous AG",
    "spec_stroboscopie_laryngee": "Vidéostroboscopie laryngée",
    "spec_audiometrie_vocale": "Audiométrie vocale dans le silence et dans le bruit",
    "spec_audiometrie_tonale": "Audiométrie tonale (Aérienne / Osseuse)",
    "spec_impedancemetrie": "Impédancemétrie",
    "spec_test_calorique": "Épreuve calorique vestibulaire",
    "spec_vemp": "Potentiels évoqués myogéniques vestibulaires (VEMP)",
    "spec_pea_orl": "PEA diagnostiques de recherche de seuil",

    // ==========================================
    // 40. DOULEUR
    // ==========================================
    "clin_eval_douleur_eva": "Évaluation de la douleur (EVA/EN/EVS)",
    "clin_eval_douleur_enfant": "Échelles de douleur pédiatrique (FLACC / EVENDOL)",
    "clin_questionnaire_dn4": "Questionnaire DN4 (Douleur neuropathique)",
    "clin_questionnaire_nociception": "Questionnaires spécifiques d'impact de la douleur",
    "spec_algometrie": "Algométrie de pression",
    "spec_test_quantitatif_sensoriel": "Test sensoriel quantitatif (QST)",

    // ==========================================
    // 41. TRANSPLANTATION / GREFFE
    // ==========================================
    // Compatibilité donneur-receveur
    "bio_groupage_abo_complet": "Groupage ABO complet et Rhésus",
    "bio_typage_hla_classe_I": "Typage HLA Classe I (A, B, C) haute résolution",
    "bio_typage_hla_classe_II": "Typage HLA Classe II (DR, DQ, DP) haute résolution",
    "bio_hla_a": "Locus HLA-A",
    "bio_hla_b": "Locus HLA-B",
    "bio_hla_c": "Locus HLA-C",
    "bio_hla_drb1": "Locus HLA-DRB1",
    "bio_hla_dqb1": "Locus HLA-DQB1",
    "bio_hla_dpb1": "Locus HLA-DPB1",
    "bio_cross_match_lymphocytaire": "Cross-match lymphocytaire CDC",
    "bio_cross_match_flow": "Cross-match en cytométrie en flux",
    "bio_anticorps_anti_hla": "Recherche d'anticorps anti-HLA (Luminex)",
    "bio_anticorps_donneur_spec": "Anticorps spécifiques du donneur (DSA)",
    "bio_pra": "Panel Reactive Antibodies (PRA %)",
    // Suivi de greffe
    "interv_biopsie_greffe_renale": "PBR de greffon rénal",
    "interv_biopsie_greffe_hepatique": "PBH de greffon hépatique",
    "interv_biopsie_greffe_cardiaque": "Biopsie endomyocardique de greffon",
    "interv_biopsie_greffe_pulmonaire": "Biopsie transbronchique de greffon pulmonaire",
    "path_recherche_rejet_aigu": "Grading anapath de rejet aigu (Banff / ISHLT)",
    "path_recherche_rejet_chronique": "Évaluation anapath de fibrose / rejet chronique",
    "bio_charge_virale_cmv_post_greffe": "Charge virale CMV de suivi post-greffe",
    "bio_charge_virale_ebv_post_greffe": "Charge virale EBV (Prévention PTLD)",
    "bio_dosage_immunosuppresseurs": "Dosage résiduel d'immunosuppresseurs (T0)",
    "bio_tacrolimus": "Tacrolémie résiduelle",
    "bio_ciclosporine": "Ciclosporinémie résiduelle",
    "bio_sirolimus": "Sirolimus sanguin",
    "bio_everolimus": "Évérolimus sanguin",
    "bio_mycophenolate": "Acide mycophénolique (MPA)",

    // ==========================================
    // 42. CYTOMÉTRIE EN FLUX
    // ==========================================
    // Immunophénotypage lymphocytaire
    "bio_cd3": "Lymphocytes T CD3+",
    "bio_cd4": "Lymphocytes T CD4+",
    "bio_cd8": "Lymphocytes T CD8+",
    "bio_rapport_cd4_cd8": "Rapport CD4/CD8",
    "bio_cd19": "Lymphocytes B CD19+",
    "bio_cd20": "Lymphocytes B CD20+",
    "bio_cd56_nk_cells": "Cellules NK (CD56+/CD16+)",
    "bio_cd16": "Marqueur CD16",
    "bio_hla_dr": "Expression HLA-DR",
    "bio_cd25": "Marqueur CD25",
    "bio_cd27": "Marqueur CD27",
    "bio_cd28": "Marqueur CD28",
    "bio_cd38": "Marqueur CD38",
    "bio_cd45": "Marqueur CD45 (LCA)",
    "bio_cd45ra": "Isoforme CD45RA (Naïfs)",
    "bio_cd45ro": "Isoforme CD45RO (Mémoire)",
    // Hémopathies malignes
    "bio_blastes_cd34": "Cellules souches / Blastes CD34+",
    "bio_cd117": "Marqueur myéloïde CD117",
    "bio_cd13": "Marqueur myéloïde CD13",
    "bio_cd33": "Marqueur myéloïde CD33",
    "bio_cd14": "Marqueur monocytaire CD14",
    "bio_cd64": "Marqueur myélo-monocytaire CD64",
    "bio_cd10": "Marqueur lymphoïde B CD10 (CALLA)",
    "bio_cd79a": "Marqueur lymphoïde B CD79a",
    "bio_cd5": "Marqueur CD5 aberrant (B-CLL)",
    "bio_cd23": "Marqueur CD23 (B-CLL)",
    "bio_cd103": "Marqueur CD103 (Tricholeucocytes)",
    "bio_cyclin_d1": "Expression Cycline D1 (Manteau)",
    "bio_bcl2": "Expression protéine BCL-2",
    "bio_bcl6": "Expression protéine BCL-6",

    // ==========================================
    // 43. ONCOLOGIE MOLÉCULAIRE (Mutations & Signatures)
    // ==========================================
    // Poumon
    "bio_egfr_mutation": "Statut mutationnel EGFR",
    "bio_alk_rearrangement": "Translocation / Réarrangement ALK",
    "bio_ros1_rearrangement": "Réarrangement ROS1",
    "bio_ntrk_fusion": "Fusion des gènes NTRK",
    "bio_kras_mutation": "Statut mutationnel KRAS",
    "bio_braf_mutation": "Statut mutationnel BRAF",
    "bio_met_exon14": "Mutation skipping MET Exon 14",
    "bio_ret_fusion": "Fusion du gène RET",
    "bio_pd_l1_expression": "Expression de PD-L1 (TPS / CPS)",
    // Mélanome
    "bio_braf_v600": "Recherche de mutation BRAF V600",
    "bio_nras_mutation": "Statut mutationnel NRAS",
    "bio_kit_mutation": "Statut mutationnel c-KIT",
    // Sein
    "bio_her2_amplification": "Amplification HER2 (FISH/IHC)",
    "bio_er_expression": "Expression des récepteurs aux œstrogènes (ER)",
    "bio_pr_expression": "Expression des récepteurs à la progestérone (PR)",
    "bio_brca1": "Recherche de mutations somatiques/germinales BRCA1",
    "bio_brca2": "Recherche de mutations somatiques/germinales BRCA2",
    "bio_pik3ca": "Statut mutationnel PIK3CA",
    // Colon
    "bio_msi_dmmr": "Statut MSI (Instabilité Microsatellitaire) / dMMR",
    // Hématologie
    "bio_bcr_abl": "Recherche du transcrit BCR-ABL (Chromosome Philadelphie)",
    "bio_jak2_v617f": "Recherche de mutation JAK2 V617F",
    "bio_calr_mutation": "Recherche de mutation de la Calréticuline (CALR)",
    "bio_mpl_mutation": "Recherche de mutation du gène MPL",
    "bio_flt3": "Recherche de mutation FLT3 (ITD/TKD)",
    "bio_npm1": "Recherche de mutation NPM1",
    "bio_tp53": "Délétion/Mutation de TP53 (17p)",

    // ==========================================
    // 44. GÉNÉTIQUE MÉDICALE AVANCÉE
    // ==========================================
    "bio_analyse_exome": "Séquençage et analyse de l'exome clinique (WES)",
    "bio_analyse_genome": "Séquençage et analyse du génome (WGS)",
    "bio_sequencage_long_read": "Séquençage longue lecture (PacBio/Nanopore)",
    "bio_analyse_variants": "Analyse bio-informatique des variants",
    "bio_annotation_variants": "Annotation des variants détectés",
    "bio_interpretation_acmg": "Classification des variants selon l'ACMG (Classes 1 à 5)",
    "bio_microdeletion": "Recherche ciblée de microdélétion syndromique",
    "bio_microduplication": "Recherche de microduplication (CNV)",
    "bio_analyse_mitochondriale_gen": "Séquençage de l'ADN mitochondrial",
    "bio_expansion_triplets": "Recherche d'expansion de triplets (ex: X fragile, Huntington)",
    "bio_repeat_expansion_analysis": "Analyse globale des répétitions nucléotidiques",

    // ==========================================
    // 45. PHARMACOGÉNÉTIQUE
    // ==========================================
    "bio_cyp2c19": "Génotypage CYP2C19 (Métabolisme Clopidogrel)",
    "bio_cyp2d6": "Génotypage CYP2D6 (Antidépresseurs, Codéine)",
    "bio_cyp2c9": "Génotypage CYP2C9 (AVK)",
    "bio_cyp3a5": "Génotypage CYP3A5 (Tacrolimus)",
    "bio_ugt1a1": "Génotypage UGT1A1 (Irinotécan, Gilbert)",
    "bio_slco1b1": "Génotypage SLCO1B1 (Toxicité statines)",
    "bio_dpyd": "Déficit en DPD / Génotypage DPYD (5-FU, Capécitabine)",
    "bio_tpmt": "Génotypage / Activité TPMT (Azathioprine)",
    "bio_nudt15": "Génotypage NUDT15 (Thiopurines)",
    "bio_hla_b5701": "Typage HLA-B*57:01 (Hypersensibilité Abacavir)",
    "bio_hla_b1502": "Typage HLA-B*15:02 (Carbamazépine Asiatiques)",

    // ==========================================
    // 46. MALADIES MÉTABOLIQUES RARES
    // ==========================================
    "bio_acylcarnitines": "Profil des acylcarnitines sur tache de sang",
    "bio_acides_organiques_urinaires": "Chromatographie des acides organiques urinaires",
    "bio_acides_amines_plasma": "Chromatographie des acides aminés plasmatiques",
    "bio_profil_metabolique": "Profil métabolomique complet",
    "bio_activite_gaucher": "Activité béta-glucosidase (Gaucher)",
    "bio_activite_pompe": "Activité alpha-glucosidase acide (Pompe)",
    "bio_activite_fabry": "Activité alpha-galactosidase A (Fabry)",
    "bio_activite_niemann_pick": "Activité sphingomyélinase acide",
    "bio_activite_mucopolysaccharidose": "Activité enzymatique pour MPS",
    "bio_lactate_pyruvate": "Dosage couplé Lactate/Pyruvate plasmatique",
    "bio_ratio_lactate_pyruvate": "Rapport Lactate/Pyruvate",
    "bio_analyse_adn_mitochondrial": "Analyse moléculaire de l'ADNmt (Myopathies mito)",

    // ==========================================
    // 47. NEUROLOGIE SPÉCIALISÉE
    // ==========================================
    "spec_eeg_standard": "EEG de veille standard de 20 min",
    "spec_eeg_longue_duree": "EEG Holter ambulatoire (24h)",
    "spec_video_eeg": "Monitorage vidéo-EEG prolongé",
    "spec_eeg_sommeil": "EEG de sieste ou de nuit complète",
    "spec_cartographie_eeg": "Cartographie EEG quantitative",
    "spec_electromyogramme_neuro": "Électromyogramme (EMG)",
    "spec_vitesse_conduction_nerveuse": "Vitesse de conduction nerveuse motrice et sensitive (VCM/VCS)",
    "interv_biopsie_musculaire_neuro": "Biopsie musculaire à visée myopathique",
    "interv_biopsie_nerveuse": "Biopsie de nerf périphérique (sural)",
    "bio_anticorps_myasthenie": "Panel d'anticorps de myasthénie",
    "bio_anti_achr": "Ac anti-récepteurs à l'acétylcholine (RACh)",
    "bio_anti_musk": "Ac anti-MuSK",
    "bio_biomarqueurs_lcr_alzheimer": "Panel de biomarqueurs LCR (Alzheimer)",
    "bio_beta_amyloide_42": "Bêta-amyloïde Aβ42 dans LCR",
    "bio_tau_total": "Protéine Tau totale dans LCR",
    "bio_tau_p181": "Protéine Tau phosphorylée (p-Tau181) dans LCR",
    "bio_neurofilament_nfl": "Neurofilaments à chaîne légère (NfL) sériques",

    // ==========================================
    // 48. NÉPHROLOGIE SPÉCIALISÉE
    // ==========================================
    "interv_biopsie_renale_nephro": "Ponction Biopsie Rénale (PBR)",
    "path_microscopie_optique_renale": "Examen anapath du rein en MO",
    "path_immunofluorescence_renale": "Examen du rein en immunofluorescence (IF)",
    "path_microscopie_electronique_renale": "Examen du rein en ME",
    "bio_proteinurie_selective": "Étude de la sélectivité de la protéinurie",
    "bio_electrophorese_urinaire": "Électrophorèse des protéines urinaires",
    "bio_chaine_legere_urinaire": "Recherche de chaînes légères urinaires (Bence-Jones)",
    "bio_sediment_urinaire": "Analyse du sédiment urinaire quantitatif (HLM/Addis)",

    // ==========================================
    // 49. HÉPATOLOGIE SPÉCIALISÉE
    // ==========================================
    "spec_fibroscan": "Fibroscan (Élastométrie hépatique)",
    "img_elastographie_hepatique": "Échographie avec élastographie par onde de cisaillement (SWE)",
    "interv_biopsie_hepatique_specialisee": "PBH pour score métabolique/fibrose",
    "path_score_fibrose": "Score de fibrose histologique (Metavir)",
    "bio_fibrotest": "FibroTest",
    "bio_actitest": "ActiTest",
    "bio_autoanticorps_hepatiques": "Recherche d'auto-anticorps hépatiques",
    "bio_anti_mitochondries": "Ac anti-mitochondries de type 2 (CBP)",
    "bio_anti_lkm": "Ac anti-LKM1 (Hépatite auto-immune type 2)",
    "bio_anti_smooth_muscle": "Ac anti-muscle lisse (Hépatite auto-immune type 1)",

    // ==========================================
    // 50. GASTRO-ENTÉROLOGIE AVANCÉE
    // ==========================================
    "spec_manometrie_oesophagienne": "Manométrie œsophagienne haute résolution",
    "spec_ph_metrique_oesophagienne": "pH-métrie œsophagienne des 24h",
    "spec_impedancemetrie": "Impédancemétrie œsophagienne",
    "spec_manometrie_anorectale": "Manométrie ano-rectale",
    "spec_test_haleine_lactose": "Breath test au lactose (Intolérance)",
    "spec_test_haleine_urease": "Breath test à l'urée 13C (Helicobacter pylori)",
    "interv_capsule_endoscopique_avancee": "Vidéocapsule de diagnostic (grêle/côlon)",
    "img_entero_irm": "Entéro-IRM",
    "img_entero_scanner": "Entéro-scanner",

    // ==========================================
    // 51. PNEUMOLOGIE AVANCÉE
    // ==========================================
    "spec_gds_exercice": "Gaz du sang artériel à l'effort",
    "spec_test_bronchodilatateur": "EFR avec test de réversibilité (bronchodilatateur)",
    "spec_test_methacholine": "Test de provocation à la métacholine",
    "spec_test_no_exhale": "Mesure du NO exhalé (FeNO)",
    "spec_fraction_no_expire": "Fraction de monoxyde d'azote expiré",
    "spec_ergospirometrie": "Épreuve fonctionnelle d'exercice (EFX / Ergospirométrie)",
    "spec_vo2_max": "Mesure de la VO2 Max",
    "spec_pression_respiratoire_max": "Pressions respiratoires maximales",
    "spec_pimax": "Pression inspiratoire maximale (PImax)",
    "spec_pemax": "Pression expiratoire maximale (PEmax)",

    // ==========================================
    // 52. CARDIOLOGIE AVANCÉE
    // ==========================================
    "img_irm_cardiaque_avancee": "IRM cardiaque morphologique et fonctionnelle",
    "img_stress_test_nucleaire": "Test de stress couplé à l'imagerie nucléaire",
    "img_scintigraphie_myocardique": "Scintigraphie de perfusion myocardique",
    "img_coroscanner": "Scanner des artères coronaires avec calcul du score calcique",
    "spec_holter_longue_duree": "Holter ECG de longue durée (jusqu'à 14 jours)",
    "interv_loop_recorder": "Implantation d'un moniteur cardiaque insérable (Holter implantable)",
    "spec_test_inclinaison_tilt_test": "Tilt test (Test d'inclinaison orthostatique)",
    "spec_cartographie_3d_cardiaque": "Cartographie électro-anatomique 3D (Rytmologie)",

    // ==========================================
    // 53. MÉDECINE DU SOMMEIL
    // ==========================================
    "spec_polysomnographie_complete": "Polysomnographie complète sous surveillance",
    "spec_polygraphie_respiratoire": "Polygraphie ventilatoire ambulatoire",
    "spec_actimetrie": "Actimétrie sur 7-14 jours",
    "spec_test_latence_endormissement": "Test Itératif de Latence d'Endormissement (TILE)",
    "spec_test_maintien_eveil": "Test de Maintien de l'Éveil (TME)",
    "clin_evaluation_apnee_sommeil": "Consultation d'évaluation clinique des apnées",
    "spec_index_apnee_hypopnee": "Calcul de l'IAH (Index d'Apnées-Hypopnées)",
    "spec_index_desaturation": "Calcul de l'Index de Désaturation en oxygène (ODI)",

    // ==========================================
    // 54. MÉDECINE DU SPORT
    // ==========================================
    "spec_test_effort_maximal": "Test d'effort maximal continu",
    "spec_ergospirometrie_sport": "Ergospirométrie sur tapis ou cycloergomètre",
    "spec_vo2max_sport": "Détermination de la VO2 Max et des seuils ventilatoires",
    "bio_lactatemie_effort": "Dosage des lactates capillaires per-effort",
    "clin_evaluation_force": "Évaluation isocinétique de la force musculaire",
    "clin_evaluation_puissance": "Tests de puissance neuromusculaire (Détente)",
    "clin_analyse_course": "Analyse biomécanique de la foulée/course",
    "clin_analyse_posturale": "Bilan podologique et postural dynamique",
    "clin_evaluation_flexibilite": "Bilan de souplesse et rétractations musculo-tendineuses",
    "img_composition_corporelle_dexa": "Analyse de la composition corporelle par absorptiométrie DEXA",

    // ==========================================
    // 55. MÉDECINE DU TRAVAIL
    // ==========================================
    "clin_visite_medicale_travail": "Visite médicale d'aptitude / de prévention",
    "spec_audiometrie_professionnelle": "Audiométrie de dépistage en santé au travail",
    "spec_spirometrie_professionnelle": "Spirométrie de dépistage (Exposition pneumotoxique)",
    "spec_vision_professionnelle": "Exploration de la fonction visuelle (Ergovision)",
    "clin_evaluation_exposition": "Évaluation clinique des expositions professionnelles",
    "bio_dosage_plomb": "Plombémie (Suivi exposition au plomb)",
    "bio_dosage_mercure": "Dosage urinaire/sanguin du mercure",
    "bio_dosage_solvants": "Dosage urinaire des métabolites de solvants",
    "bio_dosage_benzene": "Dosage de l'acide t,t-muconique urinaire (Benzène)",
    "bio_dosage_amiante_marqueurs": "Recherche de corps asymptotiques / Marqueurs associés",

    // ==========================================
    // 56. MÉDECINE LÉGALE
    // ==========================================
    "path_autopsie_medico_legale": "Autopsie médico-légale sur réquisition",
    "clin_examen_lesions": "Examen clinique de constations de coups et blessures (ITT)",
    "spec_photographie_medico_legale": "Prises de vues médico-légales de lésions",
    "bio_toxicologie_post_mortem": "Prélèvements et analyses toxicologiques post-mortem",
    "bio_identification_adn": "Profilage génétique d'identification",
    "bio_empreintes_genetiques": "Analyse des empreintes génétiques",
    "img_determination_age_osseux": "Radiographies pour détermination médico-légale de l'âge",

    // ==========================================
    // 57. TOXICOLOGIE MÉDICO-LÉGALE
    // ==========================================
    "bio_screening_toxicologique_large": "Screening toxicologique sanguin et urinaire large (LC-MS/MS)",
    "bio_chromatographie_gazeuse": "Chromatographie en phase gazeuse (GC-MS)",
    "bio_spectrometrie_masse": "Spectrométrie de masse (Identification formelle)",
    "bio_dosage_alcool_sang": "Dosage légal de l'éthanolémie",
    "bio_dosage_stupefiants": "Dosage sanguin de confirmation des stupéfiants",
    "bio_dosage_medicaments": "Dosage quantitatif des médicaments psychotropes",
    "bio_recherche_poison": "Recherche ciblée de toxiques minéraux, végétaux ou chimiques",

    // ==========================================
    // 58. EXAMENS INTERVENTIONNELS GUIDÉS
    // ==========================================
    "interv_biopsie_echo_guidee": "Micro/Macro-biopsie sous contrôle échographique",
    "interv_biopsie_scanner_guidee": "Biopsie sous guidage tomodensitométrique",
    "interv_ponction_drainage": "Ponction-drainage de collection profonde",
    "interv_infiltration_articulaire": "Infiltration intra-articulaire sous guidage radiologique",
    "interv_infiltration_rachidienne": "Infiltration épidurale/foraminale radio-guidée",
    "interv_thermoablation": "Thermoablation tumorale par micro-ondes ou RF",
    "interv_cryoablation_guidee": "Cryoablation percutanée sous imagerie",
    "interv_radioembolisation": "Radioembolisation hépatique (SIRT, Yttrium-90)",

    // ==========================================
    // 59. EXAMENS DE RADIOLOGIE AVANCÉE
    // ==========================================
    "img_irm_fonctionnelle": "IRM fonctionnelle (IRMf - activation cérébrale)",
    "img_irm_diffusion": "IRM de diffusion (DWI) / Apparent Diffusion Coefficient",
    "img_irm_spectroscopique": "IRM spectroscopique (Profils métaboliques tumoraux)",
    "img_irm_perfusion_avancee": "IRM de perfusion (PWI / Cerebral Blood Volume)",
    "img_tractographie_dti": "Tractographie par tenseur de diffusion (DTI)",
    "img_scanner_perfusion_cerebrale": "Scanner de perfusion cérébrale (AVC ischémique)",
    "img_angiographie_3d": "Angiographie rotationnelle 3D",
    "img_reconstruction_volumique": "Reconstruction radiologique 3D / Volume Rendering"
};
