const EXAM_CATALOG = {
    // ==========================================
    // 1. EXAMENS CLINIQUES (clin_)
    // ==========================================
    "clin_complet": "Examen clinique complet",
    "clin_general": "Examen général",
    "clin_neuro": "Examen neurologique",
    "clin_cardio": "Examen cardiovasculaire",
    "clin_resp": "Examen respiratoire",
    "clin_digestif": "Examen digestif",
    "clin_abdominal": "Examen abdominal",
    "clin_orl": "Examen ORL",
    "clin_ophta": "Examen ophtalmologique",
    "clin_dermato": "Examen dermatologique",
    "clin_gyneco": "Examen gynécologique",
    "clin_obstet": "Examen obstétrical",
    "clin_uro": "Examen urologique",
    "clin_rhumato": "Examen rhumatologique",
    "clin_locomot": "Examen locomoteur",
    "clin_psych": "Examen psychiatrique",
    "clin_geriat": "Examen gériatrique",
    "clin_pediat": "Examen pédiatrique",
    "clin_neonat": "Examen néonatal",
    "clin_dentaire": "Examen bucco-dentaire",
    "clin_nutri": "Examen nutritionnel",
    "clin_vasc_periph": "Examen vasculaire périphérique",
    "clin_endo": "Examen endocrinologique",
    "clin_infectieux": "Examen infectieux",

    // ==========================================
    // 2. BIOLOGIE MÉDICALE (bio_)
    // ==========================================
    // Hématologie
    "bio_nfs": "NFS (Numération Formule Sanguine)",
    "bio_plaquettes": "Dosage des Plaquettes",
    "bio_reticulocytes": "Numération des Réticulocytes",
    "bio_frottis": "Frottis sanguin sur lame",
    "bio_vs": "Vitesse de Sédimentation (VS)",
    "bio_hb": "Dosage de l'Hémoglobine",
    "bio_ht": "Hématocrite",
    "bio_indices_eryth": "Indices érythrocytaires (VGM, TCMH, Ccmh)",
    "bio_myelogramme": "Myélogramme",
    "bio_biopsie_medullaire": "Biopsie médullaire",
    "bio_immunophenotypage": "Immunophénotypage",

    // Coagulation
    "bio_tp": "Taux de Prothrombine (TP)",
    "bio_inr": "INR (International Normalized Ratio)",
    "bio_tca": "Temps de Céphaline Activée (TCA)",
    "bio_fibrinogene": "Dosage pondéral du Fibrinogène",
    "bio_ddimeres": "Dosage des D-dimères",
    "bio_facteurs_coag": "Dosage des Facteurs de coagulation (I à XIII)",
    "bio_antixa": "Activité Anti-Xa",
    "bio_temps_thrombine": "Temps de thrombine",
    "bio_temps_reptilase": "Temps de reptilase",
    "bio_antithrombine": "Dosage de l'Antithrombine",
    "bio_proteine_c": "Dosage de la Protéine C",
    "bio_proteine_s": "Dosage de la Protéine S",

    // Biochimie (Fonctions & Dosages)
    "bio_glucose": "Glycémie veineuse",
    "bio_uree": "Urée plasmatique",
    "bio_creatinine": "Créatininémie",
    "bio_acide_urique": "Acide urique plasmatique",
    "bio_sodium": "Natrémie (Sodium sanguin)",
    "bio_potassium": "Kaliémie (Potassium sanguin)",
    "bio_chlore": "Chlorémie (Chlore sanguin)",
    "bio_calcium": "Calcémie",
    "bio_magnesium": "Magnésémie",
    "bio_phosphore": "Phosphorémie",
    "bio_bicarbonates": "Bicarbonates plasmatiques (HCO3-)",
    "bio_albumine": "Albuminémie",
    "bio_proteines": "Protéines totales plasmatiques",
    "bio_bilirubine": "Bilirubinémie (libre, conjuguée, totale)",
    "bio_alat": "Transaminases ALAT",
    "bio_asat": "Transaminases ASAT",
    "bio_ggt": "Gamma-GT (GGT)",
    "bio_pal": "Phosphatases Alcalines (PAL)",
    "bio_ldh": "Lactate Déshydrogénase (LDH)",
    "bio_ck": "Créatine Kinase (CK)",
    "bio_ck_mb": "Fraction CK-MB",
    "bio_amylase": "Amylasémie",
    "bio_lipase": "Lipasémie",
    "bio_lactates": "Lacticémie (Lactates sanguins)",
    "bio_osmolarite": "Osmolarité plasmatique",
    "bio_gds": "Gaz du sang (GDS artériels)",

    // Immunologie
    "bio_crp": "Protéine C-Réactive (CRP)",
    "bio_procalcitonine": "Procalcitonine (PCT)",
    "bio_facteur_rhumato": "Facteur rhumatoïde",
    "bio_ana": "Anticorps Anti-Nucléaires (ANA)",
    "bio_anca": "Anticorps Anti-Cytoplasme des Polynucléaires Neutrophiles (ANCA)",
    "bio_anticcp": "Anticorps Anti-CCP (anti-peptides cycliques citrullinés)",
    "bio_antidna": "Anticorps Anti-ADN natif",
    "bio_ena": "Anticorps Anti-Antigènes Nucléaires Solubles (ENA)",
    "bio_c3": "Fraction C3 du Complément",
    "bio_c4": "Fraction C4 du Complément",
    "bio_igg": "Dosage des Immunoglobulines IgG",
    "bio_iga": "Dosage des Immunoglobulines IgA",
    "bio_igm": "Dosage des Immunoglobulines IgM",
    "bio_ige": "Dosage des Immunoglobulines IgE totales",
    "bio_cryoglobulines": "Recherche de Cryoglobulines",
    "bio_electrophorese": "Électrophorèse des Protéines Sérigues (EPS)",
    "bio_immunofixation": "Immunofixation des protéines sériques",

    // Endocrinologie
    "bio_tsh": "TSH ultra-sensible",
    "bio_t3": "Triiodothyronine libre (T3L)",
    "bio_t4": "Thyroxine libre (T4L)",
    "bio_cortisol": "Cortisolémie",
    "bio_acth": "ACTH plasmatique",
    "bio_aldosterone": "Aldostérone plasmatique",
    "bio_renine": "Rénine plasmatique",
    "bio_pth": "Parathormone (PTH)",
    "bio_calcitonine": "Calcitonine plasmatique",
    "bio_insuline": "Insulinémie",
    "bio_cpeptide": "C-peptide",
    "bio_hba1c": "Hémoglobine glyquée (HbA1c)",
    "bio_gh": "Hormone de croissance (GH)",
    "bio_igf1": "IGF-1 (Somatomédine C)",
    "bio_prolactine": "Prolactinémie",
    "bio_lh": "Hormone Lutéinisante (LH)",
    "bio_fsh": "Hormone Folliculo-Stimulante (FSH)",
    "bio_estradiol": "Estradiol plasmatique",
    "bio_progesterone": "Progestéronémie",
    "bio_testosterone": "Testostéronémie totale",
    "bio_betahcg": "Bêta-HCG plasmatique quantitative",

    // Toxicologie
    "bio_tox_urines": "Dépistage toxicologique urinaire qualitatif",
    "bio_alcoolemie": "Alcoolémie veineuse (Éthanolémie)",
    "bio_metaux_lourds": "Recherche et dosage des métaux lourds (Plomb, Cadmium, etc.)",
    "bio_meds_dosage": "Recherche toxicologique de médicaments (Barbituriques, ATC, etc.)",
    "bio_dosages_therap": "Dosage thérapeutique de médicaments (Digoxine, Lithium, Tégrétol, etc.)",
    "bio_intox_recherche": "Bilan de recherche d'intoxication aiguë",

    // Sérologies infectieuses
    "bio_sero_vih": "Sérologie VIH 1 et 2 (Dépistage ELISA de 4e génération)",
    "bio_sero_hepatites": "Bilan sérologique des Hépatites (A, B, C, E)",
    "bio_sero_ebv": "Sérologie EBV (VCA IgG/IgM, EBNA)",
    "bio_sero_cmv": "Sérologie CMV (IgG/IgM)",
    "bio_sero_hsv": "Sérologie HSV-1 et HSV-2",
    "bio_sero_vzv": "Sérologie VZV",
    "bio_sero_rougeole": "Sérologie de la Rougeole",
    "bio_sero_rubeole": "Sérologie de la Rubéole",
    "bio_sero_syphilis": "Sérologie de la Syphilis (Syphilis Screening : TPHA / VDRL)",
    "bio_sero_lyme": "Sérologie de Lyme (Dépistage ELISA +/- Western-Blot)",

    // Microbiologie (Bactériologie, Virologie, Mycologie, Parasitologie)
    "bio_micro_ecbu": "ECBU (Examen Cyto-Bactériologique des Urines)",
    "bio_micro_hemoc": "Hémocultures (Aérobie/Anaérobie)",
    "bio_micro_copro": "Coproculture standard (Salmonelle, Shigelle, Campylobacter)",
    "bio_micro_ecbc": "ECBC (Examen Cyto-Bactériologique des Crachats)",
    "bio_micro_cutanes": "Prélèvements bactériologiques cutanés / de pus",
    "bio_micro_liq_bio": "Analyse cyto-bactériologique d'un liquide biologique (LCR, Pleural, Ascite, Articulaire)",
    "bio_micro_antibiogramme": "Antibiogramme",
    "bio_micro_pcr": "Analyse par PCR microbiologique",
    "bio_micro_charge_virale": "Mesure de charge virale",
    "bio_micro_culture_virale": "Culture virale",
    "bio_micro_culture_fongique": "Culture fongique mycologique",
    "bio_micro_direct_fongique": "Examen direct mycologique",
    "bio_micro_parasito_selles": "Examen parasitologique des selles (EPS)",
    "bio_micro_parasito_sang": "Recherche de parasites sanguins",
    "bio_micro_parasito_frottis": "Frottis sanguin / Goutte épaisse parasitaire",
    "bio_micro_parasito_pcr": "PCR parasitaire",

    // Génétique
    "bio_gen_caryotype": "Caryotype constitutionnel",
    "bio_gen_fish": "Analyse par hybridation in situ (FISH)",
    "bio_gen_pcr": "PCR génétique quantitative",
    "bio_gen_sequencage": "Séquençage de gènes ciblés (Sanger)",
    "bio_gen_ngs": "Séquençage à haut débit (NGS)",
    "bio_gen_panels": "Séquençage de panels de gènes",
    "bio_gen_exome": "Séquençage de l'exome complet (WES)",
    "bio_gen_genome_complet": "Séquençage du génome complet (WGS)",

    // Anatomopathologie (anapath_)
    "anapath_cytologie": "Examen cytologique d'un liquide ou frottis",
    "anapath_histologie": "Examen histologique standard d'un tissu",
    "anapath_immunohisto": "Analyse immunohistochimique (IHC)",
    "anapath_biopsie": "Lecture anatomopathologique d'une biopsie",
    "anapath_pieces_operatoires": "Analyse d'une pièce opératoire",
    "anapath_autopsie": "Examen autopsique",

    // ==========================================
    // 3. IMAGERIE (img_)
    // ==========================================
    // Radiographie conventionnelle
    "img_rx_thorax": "Radiographie du thorax (face/profil)",
    "img_rx_abdomen": "ASP (Abdomen sans préparation)",
    "img_rx_os": "Radiographie osseuse",
    "img_rx_articulations": "Radiographie articulaire",
    "img_rx_rachis": "Radiographie du rachis",
    "img_rx_crane": "Radiographie du crâne",
    "img_rx_membres": "Radiographie d'un membre",

    // Scanner (TDM)
    "img_ct_cerebral": "Scanner (TDM) cérébral",
    "img_ct_thoracique": "Scanner (TDM) thoracique",
    "img_ct_abdominal": "Scanner (TDM) abdominal",
    "img_ct_pelvien": "Scanner (TDM) pelvien",
    "img_ct_corps_entier": "Scanner (TDM) corps entier (Pan-scanner)",
    "img_ct_angioscanner": "Angioscanner",
    "img_ct_perfusion": "Scanner (TDM) de perfusion cérébrale",
    "img_ct_cardiaque": "Scanner (TDM) cardiaque (Coro-scanner)",

    // IRM
    "img_mri_cerveau": "IRM cérébrale",
    "img_mri_moelle": "IRM médullaire",
    "img_mri_foie": "IRM hépatique",
    "img_mri_prostate": "IRM prostatique",
    "img_mri_sein": "IRM mammaire",
    "img_mri_genou": "IRM du genou",
    "img_mri_epaule": "IRM de l'épaule",
    "img_mri_cardiaque": "IRM cardiaque",
    "img_mri_diffusion": "IRM en séquence de diffusion",
    "img_mri_perfusion": "IRM en séquence de perfusion",
    "img_mri_spectroscopie": "Spectroscopie par résonance magnétique (SRM)",

    // Échographie
    "img_us_abdominale": "Échographie abdominale",
    "img_us_pelvienne": "Échographie pelvienne",
    "img_us_cardiaque": "Échocardiographie",
    "img_us_vasculaire": "Échographie-Doppler vasculaire",
    "img_us_thyroide": "Échographie de la thyroïde",
    "img_us_obstetricale": "Échographie obstétricale",
    "img_us_pulmonaire": "Échographie pulmonaire au lit du patient (POCUS)",
    "img_us_musculaire": "Échographie ostéo-articulaire et musculaire",
    "img_us_interventionnelle": "Échographie interventionnelle (Ponction guidée)",

    // Médecine nucléaire & Autres imageries
    "img_scintigraphie": "Scintigraphie",
    "img_tep_fdg": "TEP-Scan au FDG (PET-Scan)",
    "img_tep_specifiques": "TEP-Scan avec traceurs spécifiques",
    "img_spect": "Tomographie d'Émission Monophotonique (SPECT)",
    "img_mammographie": "Mammographie de dépistage / diagnostic",
    "img_osteodensitometrie": "Ostéodensitométrie biphotonique (DEXA)",
    "img_fluoroscopie": "Radioscopie / Fluoroscopie en temps réel",
    "img_angiographie": "Angiographie numérisée de contraste",

    // ==========================================
    // 4. MODULES DE SPÉCIALITÉS (spec_)
    // ==========================================
    // Cardiologie
    "spec_cardio_ecg": "Électrocardiogramme (ECG) 12 dérivations",
    "spec_cardio_holter_ecg": "Holter ECG des 24h/48h",
    "spec_cardio_holter_ta": "MAPA (Mesure Ambulatoire de la Pression Artérielle / Holter tensionnel)",
    "spec_cardio_epreuve_effort": "Épreuve d'effort cardiologique",
    "spec_cardio_echocardio": "Échocardiographie transthoracique (ETT)",
    "spec_cardio_eto": "Échocardiographie transœsophagienne (ETO)",
    "spec_cardio_coronaro": "Coronarographie diagnostique",
    "spec_cardio_catheterisme": "Cathétérisme cardiaque droit ou gauche",
    "spec_cardio_fevg": "Mesure de la fraction d'éjection ventriculaire gauche (FEVG)",
    "spec_cardio_carto": "Cartographie électrique endocavitaire",
    "spec_cardio_tilt": "Tilt-test (Test de la table basculante)",
    "spec_cardio_doppler": "Doppler cardiaque continu et pulsé",

    // Pneumologie
    "spec_pneumo_efr": "Explorations Fonctionnelles Respiratoires (EFR complètes)",
    "spec_pneumo_spirometrie": "Spirométrie",
    "spec_pneumo_plethysmo": "Pléthysmographie corporelle globale",
    "spec_pneumo_dlco": "Mesure de la capacité de transfert du CO (DLCO)",
    "spec_pneumo_gds": "Gaz du sang artériel de repos",
    "spec_pneumo_test_marche": "Test de marche de 6 minutes (TM6)",
    "spec_pneumo_fibroscopie": "Fibroscopie bronchique",
    "spec_pneumo_lba": "Lavage Broncho-Alvéolaire (LBA)",
    "spec_pneumo_polygraphie": "Polygraphie ventilatoire nocturne",
    "spec_pneumo_polysomno": "Polysomnographie complète du sommeil",

    // Neurologie
    "spec_neuro_eeg": "Électroencéphalogramme (EEG)",
    "spec_neuro_emg": "Électromyogramme (EMG)",
    "spec_neuro_potentiels": "Potentiels Évoqués (PEV, PEA, PES)",
    "spec_neuro_doppler_trans": "Doppler transcrânien (DTC)",
    "spec_neuro_pl": "Ponction lombaire diagnostique (analyse LCR)",
    "spec_neuro_monitoring_eeg": "Monitorage vidéo-EEG continu",

    // Gastro-entérologie
    "spec_gastro_fibroscopie": "Endoscopie Œso-Gastro-Duodénale (EOGD / Fibroscopie)",
    "spec_gastro_coloscopie": "Coloscopie totale avec iléoscopie",
    "spec_gastro_rectoscopie": "Rectosigmoïdoscopie",
    "spec_gastro_capsule": "Vidéocapsule du grêle",
    "spec_gastro_echoendo": "Écho-endoscopie haute ou basse",
    "spec_gastro_cpre": "CPRE (Cholangio-Pancréatographie Rétrograde Endoscopique)",
    "spec_gastro_manometrie": "Manométrie œsophagienne ou anorectale",
    "spec_gastro_phmetrie": "pH-métrie des 24h +/- impédancemétrie œsophagienne",
    "spec_gastro_fibroscan": "Élastométrie impulsionnelle hépatique (Fibroscan)",

    // Urologie
    "spec_uro_cystoscopie": "Fibroscopie urétro-vésicale (Cystoscopie)",
    "spec_uro_debitmetrie": "Débitmétrie urinaire libre",
    "spec_uro_urodynamique": "Bilan urodynamique complet (Cystomanométrie, Profilométrie)",
    "spec_uro_biopsie_prost": "Biopsies prostatiques échoguidées",

    // Gynécologie
    "spec_gyneco_frottis": "Frottis Cervico-Vaginal (FCV) de dépistage / test HPV",
    "spec_gyneco_colposcopie": "Colposcopie diagnostique avec biopsies dirigées",
    "spec_gyneco_hystero": "Hystéroscopie diagnostique",
    "spec_gyneco_hsg": "Hystérosalpingographie (HSG)",

    // Ophtalmologie
    "spec_ophta_fond_oeil": "Examen du fond d'œil (Rétinophotographie)",
    "spec_ophta_oct": "Tomographie en Cohérence Optique (OCT maculaire/papillaire)",
    "spec_ophta_champ_visuel": "Périmétrie cinétique ou statique (Champ visuel)",
    "spec_ophta_tonometrie": "Tonométrie (Mesure de la pression intraoculaire)",
    "spec_ophta_angio": "Angiographie rétinienne à la fluorescéine ou au vert d'indocyanine",
    "spec_ophta_biometrie": "Biométrie oculaire",

    // ORL
    "spec_orl_audiometrie": "Audiométrie tonale et vocale",
    "spec_orl_tympanometrie": "Tympanométrie avec recherche de réflexe stapédien",
    "spec_orl_fibroscopie": "Nasofibroscopie laryngée",
    "spec_orl_vng": "Vidéonystagmographie (VNG)",
    "spec_orl_pea": "Potentiels Évoqués Auditifs (PEA)",

    // Dermatologie
    "spec_dermato_dermoscopie": "Dermoscopie optique ou numérique (analyse des nævus)",
    "spec_dermato_biopsie": "Biopsie cutanée diagnostique",
    "spec_dermato_patch": "Patch tests (Tests épicutanés allergologiques)",
    "spec_dermato_prick": "Prick tests (Tests cutanés allergologiques de lecture immédiate)",

    // Néphrologie
    "spec_nephro_clairance": "Clairance mesurée de la créatinine (recueil des urines de 24h)",
    "spec_nephro_proteinurie": "Protéinurie des 24h ou rapport Protéinurie/Créatininurie sur échantillon",
    "spec_nephro_microalbuminurie": "Microalbuminurie",
    "spec_nephro_biopsie": "Ponction-Biopsie Rénale (PBR)",

    // Obstétrique (obstet_)
    "obstet_echo_t1": "Échographie obstétricale du premier trimestre (11-13 SA)",
    "obstet_echo_t2": "Échographie obstétricale morphologique du deuxième trimestre (22 SA)",
    "obstet_echo_t3": "Échographie obstétricale de croissance du troisième trimestre (32 SA)",
    "obstet_monitoring": "Cardiotocographie fœtale continue (RCF / Monitoring)",
    "obstet_doppler": "Vélocimétrie Doppler fœtale (artère ombilicale, cérébrale) et maternelle",
    "obstet_amniocentese": "Amniocentèse (Ponction de liquide amniotique)",
    "obstet_choriocentese": "Choriocentèse (Biopsie de trophoblaste / villosités choriales)",

    // Réanimation
    "spec_reanim_monitoring_invasif": "Mise en place de monitorages physiologiques invasifs continu",
    "spec_reanim_picco": "Monitorage PiCCO (Analyse de contour de l'onde de pouls)",
    "spec_reanim_swanganz": "Monitorage par cathéter de Swan-Ganz (artère pulmonaire)",
    "spec_reanim_bis": "Monitorage de l'Index Bispectral (BIS - profondeur de sédation)",
    "spec_reanim_pressions_inv": "Monitorage des pressions invasives (Pression Artérielle Invasive / PVC)",
    "spec_reanim_capnographie": "Capnographie (EtCO2)",
    "spec_reanim_lactates_lit": "Dosage des lactates capillaires au lit du malade",
    "spec_reanim_echo_lit": "Échographie clinique au lit en réanimation (LUS, FOCUS, abdomen)",

    // Anesthésie
    "spec_anesth_preop": "Consultation et bilan d'évaluation préopératoire",
    "spec_anesth_monitoring_per": "Monitorage de sécurité peropératoire standard",
    "spec_anesth_tof": "Monitorage de la curarisation par Train de Quatre (TOF)",
    "spec_anesth_bis": "Monitorage BIS per-anesthésique",

    // Explorations vasculaires
    "spec_vasc_doppler_art": "Écho-Doppler artériel des membres inférieurs ou des troncs supra-aortiques",
    "spec_vasc_doppler_vein": "Écho-Doppler veineux à la recherche d'une thrombose (TVP)",
    "spec_vasc_ips": "Mesure de l'Indice de Pression Systolique (IPS)",
    "spec_vasc_pressions_seg": "Mesure des pressions segmentaires de cheville et d'orteil",
    "spec_vasc_angiographie": "Angiographie sélective d'un territoire vasculaire",

    // Explorations fonctionnelles spécialisées
    "spec_func_vestibulaires": "Explorations fonctionnelles vestibulaires complètes",
    "spec_func_urodynamiques": "Explorations urodynamiques",
    "spec_func_digestives": "Explorations fonctionnelles digestives (motricité, reflux)",
    "spec_func_respiratoires": "Explorations fonctionnelles respiratoires d'effort (Epreuve d'effort cardio-respiratoire - EFCR / VO2max)",
    "spec_func_cardiaques": "Explorations fonctionnelles cardiaques",
    "spec_func_neurologiques": "Explorations fonctionnelles neurologiques",

    // Examens microbiologiques spécialisés (avancés)
    "bio_micro_pcr_multiplex": "PCR multiplex syndromique d'identification rapide (ex: Panel méningé ou respiratoire)",
    "bio_micro_metagenomique": "Séquençage métagénomique clinique",
    "bio_micro_sequencage_micro": "Séquençage de résistance microbiologique (ex: résistance génotypique VIH/tuberculose)",
    "bio_micro_malditof": "Identification bactérienne par spectrométrie de masse MALDI-TOF",

    // Examens de pointe et typages immunologiques
    "bio_spec_cytometrie_flux": "Cytométrie en flux analytique",
    "bio_spec_hla": "Typage HLA classe I et classe II",
    "bio_spec_typage_tissulaire": "Typage tissulaire histologique d'histocompatibilité",
    "bio_spec_recherche_mutations": "Recherche de mutations génétiques acquises oncologiques",
    "bio_spec_pharmacogenetique": "Analyse pharmacogénétique personnalisée (ex: déficit en DPD, TPMT)",
    "bio_spec_pharmacocinetique": "Suivi thérapeutique pharmacocinétique individualisé",
    "bio_spec_dosages_immuno": "Dosages immunologiques spécialisés (ex: anticorps monoclonaux thérapeutiques, cytokines)"
};
