import React, { useState } from 'react';
import { LabOrder, LabResult } from '../../../core/procedural/LabResultsGenerator';
import { LAB_RANGES, LabPanelType } from '../../../domain/medical_knowledge/ReferenceRanges';
import { useGameEngine } from '../../store/GameState';

export const LabsPanel: React.FC = () => {
    const { time, emitAction, patientData, labOrders } = useGameEngine();
    const [selectedPanel, setSelectedPanel] = useState<LabPanelType>('IONO_SANG');

    const handleOrder = (isStat: boolean) => {
        emitAction('ORDER_LABS', { panelType: selectedPanel, isStat });
    };

    return (
        <div className="flex h-full gap-6">
            {/* Colonne de Prescription */}
            <div className="w-1/3 bg-gray-800 p-5 rounded shadow border border-gray-700 flex flex-col">
                <h3 className="text-xl text-blue-400 border-b border-gray-700 pb-2 mb-4">Prescription Biologie</h3>
                
                <select 
                    className="w-full bg-gray-900 border border-gray-600 text-gray-200 p-2 rounded mb-4 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedPanel}
                    onChange={(e) => setSelectedPanel(e.target.value as LabPanelType)}
                >
                    <option value="IONO_SANG">Ionogramme Sanguin & Urée/Créat</option>
                    <option value="NFS">Hémogramme (NFS)</option>
                    <option value="GAZ_DU_SANG">Gaz du Sang artériel</option>
                    <option value="BILAN_INFLAMMATOIRE">Bilan Inflammatoire (CRP)</option>
                    <option value="TROPONINE">Troponine us</option>
                </select>

                <div className="flex gap-3 mt-auto">
                    <button 
                        onClick={() => handleOrder(false)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition-colors"
                    >
                        Standard
                    </button>
                    <button 
                        onClick={() => handleOrder(true)}
                        className="flex-1 bg-red-900 hover:bg-red-800 text-white p-2 rounded border border-red-700 transition-colors"
                        title="Demande urgente. Coûte plus cher au score économique."
                    >
                        Urgent (STAT)
                    </button>
                </div>
            </div>

            {/* Colonne des Résultats */}
            <div className="w-2/3 bg-gray-800 p-5 rounded shadow border border-gray-700 overflow-y-auto">
                <h3 className="text-xl text-blue-400 border-b border-gray-700 pb-2 mb-4">Résultats du Laboratoire</h3>
                
                {labOrders.length === 0 ? (
                    <div className="text-gray-500 italic text-center mt-10">Aucun bilan prescrit pour ce patient.</div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {labOrders.map((order, idx) => (
                            <LabResultCard key={order.orderId} order={order} currentTime={time} patientSex={patientData.sex} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const LabResultCard = ({ order, currentTime, patientSex }: { order: LabOrder, currentTime: number, patientSex: 'M'|'F' }) => {
    const isPending = currentTime < order.availableAtTime;
    const timeRemaining = order.availableAtTime - currentTime;

    if (isPending) {
        return (
            <div className="border border-gray-600 rounded p-4 bg-gray-900 opacity-70">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-gray-300">{order.panelType.replace(/_/g, ' ')}</h4>
                    <span className="text-yellow-500 text-sm animate-pulse">En cours d'analyse... ({timeRemaining} min)</span>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${Math.max(0, 100 - (timeRemaining * 2))}%` }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="border border-gray-600 rounded p-4 bg-gray-900">
            <h4 className="font-bold text-gray-200 mb-3">{order.panelType.replace(/_/g, ' ')}</h4>
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                    <tr>
                        <th className="px-3 py-2">Paramètre</th>
                        <th className="px-3 py-2 text-right">Résultat</th>
                        <th className="px-3 py-2">Unité</th>
                        <th className="px-3 py-2 text-gray-500">Antériorité</th>
                    </tr>
                </thead>
                <tbody>
                    {order.results?.map(res => {
                        const ref = LAB_RANGES[res.parameterId];
                        const normalRange = patientSex === 'M' ? `${ref.minM} - ${ref.maxM}` : `${ref.minF} - ${ref.maxF}`;
                        return (
                            <tr key={res.id} className="border-b border-gray-800">
                                <td className="px-3 py-2 font-medium text-gray-300">{ref.name}</td>
                                <td className={`px-3 py-2 text-right font-mono font-bold ${res.isCritical ? 'text-red-500 animate-pulse' : res.isAbnormal ? 'text-orange-400' : 'text-gray-300'}`}>
                                    {res.value} {res.isAbnormal && (res.value < (patientSex === 'M' ? ref.minM : ref.minF) ? '↓' : '↑')}
                                </td>
                                <td className="px-3 py-2 text-gray-400">{res.unit}</td>
                                <td className="px-3 py-2 text-gray-500 text-xs">[{normalRange}]</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};