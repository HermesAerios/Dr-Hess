import React, { useState, useEffect } from 'react';
import { Patient } from '../../../domain/models/Patient';
import { VitalsMonitor } from './VitalsMonitor';
import { ClinicalExamPanel } from '../Clinical/ClinicalExamPanel';
import { ChatInterface } from '../Dialog/ChatInterface';
// Hooks globaux de gestion d'état omis pour la concision
import { useGameEngine } from '../../store/GameState';

interface Props {
    patient: Patient;
}

export const PatientDashboard: React.FC<Props> = ({ patient }) => {
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'INTERVIEW' | 'EXAM' | 'LABS' | 'IMAGING' | 'ORDERS'>('OVERVIEW');
    const { time, emitAction } = useGameEngine();

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
            {/* Sidebar de Navigation DPI */}
            <nav className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
                <div className="p-4 bg-blue-900 border-b border-blue-800">
                    <h1 className="text-xl font-bold tracking-wider">HOSPI-OS v4.2</h1>
                    <div className="text-sm text-blue-300 mt-1">Service d'Urgences / Med Interne</div>
                </div>
                
                <div className="flex-1 py-4 flex flex-col gap-2">
                    <TabButton active={activeTab === 'OVERVIEW'} onClick={() => setActiveTab('OVERVIEW')} icon="📋">Synthèse</TabButton>
                    <TabButton active={activeTab === 'INTERVIEW'} onClick={() => setActiveTab('INTERVIEW')} icon="💬">Interrogatoire</TabButton>
                    <TabButton active={activeTab === 'EXAM'} onClick={() => setActiveTab('EXAM')} icon="🩺">Examen Clinique</TabButton>
                    <TabButton active={activeTab === 'LABS'} onClick={() => setActiveTab('LABS')} icon="🩸">Biologie</TabButton>
                    <TabButton active={activeTab === 'IMAGING'} onClick={() => setActiveTab('IMAGING')} icon="🩻">PACS / Imagerie</TabButton>
                    <TabButton active={activeTab === 'ORDERS'} onClick={() => setActiveTab('ORDERS')} icon="💊">Prescriptions</TabButton>
                </div>

                <div className="p-4 border-t border-gray-700">
                    <div className="text-xs text-gray-400">Temps écoulé (Cas)</div>
                    <div className="text-2xl font-mono text-red-400">{formatTime(time)}</div>
                </div>
            </nav>

            {/* Zone principale de contenu */}
            <main className="flex-1 flex flex-col relative">
                {/* Bandeau d'identité patient */}
                <header className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center shadow-md">
                    <div>
                        <h2 className="text-2xl font-bold uppercase">{patient.name}</h2>
                        <div className="text-gray-400 flex gap-4 mt-1">
                            <span>{patient.sex} - {patient.age} ans</span>
                            <span>IPP: {patient.id.substring(0, 8).toUpperCase()}</span>
                            <span>Motif: Adressé par le SAMU</span>
                        </div>
                    </div>
                    {/* Moniteur de constantes vitales en temps réel */}
                    <VitalsMonitor vitals={patient.vitals} state={patient.state} />
                </header>

                {/* Zone de rendu dynamique des onglets */}
                <div className="flex-1 overflow-auto p-6 bg-gray-900 relative">
                    {activeTab === 'OVERVIEW' && (
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-gray-800 p-4 rounded shadow border border-gray-700">
                                <h3 className="text-lg text-blue-400 mb-3 border-b border-gray-700 pb-2">Antécédents & Terrain</h3>
                                <ul className="list-disc pl-5 text-gray-300">
                                    {patient.atcd.map((item, idx) => <li key={idx}>{item}</li>)}
                                </ul>
                            </div>
                            <div className="bg-gray-800 p-4 rounded shadow border border-gray-700">
                                <h3 className="text-lg text-blue-400 mb-3 border-b border-gray-700 pb-2">Traitements usuels</h3>
                                <p className="text-gray-400 italic">Non renseigné à l'admission. Interrogatoire requis.</p>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'INTERVIEW' && <ChatInterface patient={patient} />}
                    {activeTab === 'EXAM' && <ClinicalExamPanel patient={patient} onExamPerform={(res) => emitAction('PERFORM_EXAM', res)} />}
                    {activeTab === 'ORDERS' && <div className="text-gray-500 text-center mt-20">Interface de prescription sécurisée (CPOE) en attente d'initialisation...</div>}
                    {/* Autres composants gérés ultérieurement */}
                </div>
            </main>
        </div>
    );
};

const TabButton = ({ active, onClick, children, icon }: any) => (
    <button 
        onClick={onClick} 
        className={`w-full text-left px-6 py-3 flex gap-3 items-center transition-colors ${
            active ? 'bg-blue-600 text-white border-l-4 border-blue-400' : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200 border-l-4 border-transparent'
        }`}
    >
        <span className="text-xl">{icon}</span>
        <span className="font-medium tracking-wide">{children}</span>
    </button>
);

const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}:00`;
};