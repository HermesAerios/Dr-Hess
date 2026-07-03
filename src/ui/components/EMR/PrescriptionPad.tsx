import React, { useState } from 'react';
import { PHARMACOLOGY_BASE } from '../../../domain/medical_knowledge/PharmacologyBase';
import { useGameEngine } from '../../store/GameState';

export const PrescriptionPad: React.FC = () => {
    const { prescriptions, emitAction, alerts } = useGameEngine();
    const [selectedMolecule, setSelectedMolecule] = useState<string>('AMOXICILLINE');
    const [dosage, setDosage] = useState<number>(500);
    const [route, setRoute] = useState<'PO' | 'IV' | 'PSE'>('PO');

    const handlePrescribe = () => {
        emitAction('SUBMIT_PRESCRIPTION', {
            molecule: selectedMolecule,
            dosage: dosage,
            route: route,
            timestamp: Date.now()
        });
    };

    const handleStopTreatment = (id: string) => {
        emitAction('STOP_PRESCRIPTION', { prescriptionId: id });
    };

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Alertes de sécurité en cours (Pharmaco-Vigilance) */}
            {alerts.length > 0 && (
                <div className="bg-red-950 border border-red-800 rounded p-4 text-red-200 text-sm max-h-32 overflow-y-auto">
                    <div className="font-bold uppercase tracking-wide text-xs text-red-400 mb-1">🚨 Alertes Pharmaco-Vigilance :</div>
                    <ul className="list-disc pl-5 flex flex-col gap-1">
                        {alerts.map((alert, idx) => (
                            <li key={idx}>[Min {alert.timestamp}] <span className={alert.type === 'ERROR' ? 'font-bold text-red-300' : 'text-orange-300'}>{alert.message}</span></li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex flex-1 gap-6">
                {/* Formulaire d'Ordonnance Clinique */}
                <div className="w-1/2 bg-gray-800 p-5 rounded shadow border border-gray-700 flex flex-col">
                    <h3 className="text-xl text-blue-400 border-b border-gray-700 pb-2 mb-4">Nouvel Ordre Thérapeutique</h3>
                    
                    <label className="text-xs text-gray-400 uppercase font-bold mb-1">Molécule (DCI)</label>
                    <select 
                        className="bg-gray-900 border border-gray-600 text-gray-200 p-2 rounded mb-4 focus:ring-blue-500 font-mono text-sm"
                        value={selectedMolecule}
                        onChange={(e) => {
                            setSelectedMolecule(e.target.value);
                            setRoute(PHARMACOLOGY_BASE[e.target.value].standardRoute as any);
                        }}
                    >
                        {Object.keys(PHARMACOLOGY_BASE).map(key => (
                            <option key={key} value={key}>{PHARMACOLOGY_BASE[key].name} [{PHARMACOLOGY_BASE[key].class}]</option>
                        ))}
                    </select>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-xs text-gray-400 uppercase font-bold mb-1">Dose (mg ou mg/h)</label>
                            <input 
                                type="number" 
                                className="w-full bg-gray-900 border border-gray-600 text-gray-200 p-2 rounded font-mono"
                                value={dosage}
                                onChange={(e) => setDosage(Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 uppercase font-bold mb-1">Voie d'administration</label>
                            <select 
                                className="w-full bg-gray-900 border border-gray-600 text-gray-200 p-2 rounded"
                                value={route}
                                onChange={(e) => setRoute(e.target.value as any)}
                            >
                                <option value="PO">Per Os (Voie Orale)</option>
                                <option value="IV">Intraveineuse Directe (Bolus)</option>
                                <option value="PSE">Seringue Électrique (Continu)</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={handlePrescribe}
                        className="w-full bg-blue-700 hover:bg-blue-600 font-bold text-white p-3 rounded transition-colors uppercase mt-auto"
                    >
                        Signer et Administrer l'Ordre
                    </button>
                </div>

                {/* Traitements en cours & Concentrations en temps réel */}
                <div className="w-1/2 bg-gray-800 p-5 rounded shadow border border-gray-700 flex flex-col overflow-y-auto">
                    <h3 className="text-xl text-blue-400 border-b border-gray-700 pb-2 mb-4">Plan de Soins Actif</h3>
                    
                    {prescriptions.filter(p => p.isActive).length === 0 ? (
                        <div className="text-gray-500 italic text-center mt-10">Aucun traitement en cours d'administration.</div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {prescriptions.filter(p => p.isActive).map(rx => (
                                <div key={rx.id} className="border border-gray-600 bg-gray-900 rounded p-3 flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-gray-200 font-mono">{PHARMACOLOGY_BASE[rx.molecule].name}</div>
                                        <div className="text-xs text-gray-400">
                                            {rx.route === 'PSE' ? `${rx.dosageMgPerHour} mg/h en continu` : `${rx.dosageMgPerDose} mg en bolus`}
                                        </div>
                                        <div className="text-xs text-blue-400 font-mono mt-1">
                                            C. plasmo : {rx.currentPlasmaConcentration} mg/L
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleStopTreatment(rx.id)}
                                        className="bg-red-950 text-red-300 hover:bg-red-900 px-3 py-1 rounded text-xs border border-red-700 transition-colors"
                                    >
                                        Arrêter
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};