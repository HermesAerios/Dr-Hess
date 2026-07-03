import React from 'react';
import { EcgGenerator } from '../../../core/procedural/EcgGenerator';
import { useGameEngine } from '../../store/GameState';

export const EcgViewer: React.FC = () => {
    const { patientData } = useGameEngine();
    const ecgGen = new EcgGenerator();
    
    const leads = ['DI', 'DII', 'DIII', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'];
    const width = 280;
    const height = 120;

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-inner border border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-red-400 tracking-wide font-mono">🫀 CARDIO-OS v1.0 - Électrocardiogramme 12 Dérivations</h3>
                <span className="text-xs bg-red-950 text-red-400 px-3 py-1 rounded border border-red-900 font-mono">Vitesse : 25mm/s | Amplitude : 10mm/mV</span>
            </div>

            {/* Grille ECG 3x4 classique */}
            <div className="grid grid-cols-3 gap-4 bg-[#fde8e4] p-2 rounded border border-red-300 relative overflow-hidden">
                {/* Injection du background quadrillé SVG répétable */}
                <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='25' height='25' viewBox='0 0 25 25'><g stroke='red' stroke-width='0.2'><path d='M 0,5 L 25,5 M 0,10 L 25,10 M 0,15 L 25,15 M 0,20 L 25,20 M 5,0 L 5,25 M 10,0 L 10,25 M 15,0 L 15,25 M 20,0 L 20,25'/></g><g stroke='red' stroke-width='0.7'><path d='M 0,0 L 25,0 M 0,25 L 25,25 M 0,0 L 0,25 M 25,0 L 25,25'/></g></svg>")` }} />

                {leads.map(lead => {
                    const pathD = ecgGen.generateLeadPath(patientData, lead, width, height);
                    return (
                        <div key={lead} className="bg-transparent h-32 rounded relative flex flex-col justify-between p-1 z-10">
                            <span className="text-xs font-bold text-red-900 font-mono absolute top-1 left-2">{lead}</span>
                            <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
                                <path 
                                    d={pathD} 
                                    fill="none" 
                                    stroke="#1a1a1a" 
                                    strokeWidth="1.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                />
                            </svg>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};