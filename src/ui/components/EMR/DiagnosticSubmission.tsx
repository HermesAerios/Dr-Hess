import React, { useState } from 'react';
import { useGameEngine } from '../../store/GameState';

export const DiagnosticSubmission: React.FC = () => {
    const { emitAction, scoringResult } = useGameEngine();
    const [primaryDiag, setPrimaryDiag] = useState<string>('');
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    const handleSubmit = () => {
        if (!primaryDiag.trim()) return;
        setIsSubmitted(true);
        emitAction('SUBMIT_CASE_DIAGNOSTIC', {
            primaryDiagnosticId: primaryDiag.toUpperCase().trim(),
            differentialDiagnosticIds: [],
            immediateOrdersIds: []
        });
    };

    if (isSubmitted && scoringResult) {
        return (
            <div className="bg-gray-800 p-6 rounded border border-gray-700 max-w-2xl mx-auto mt-6">
                <div className="text-center mb-6">
                    <div className="text-4xl font-black font-mono text-blue-500">{scoringResult.globalScore} / 100</div>
                    <div className="text-sm text-gray-400 mt-1">Score Global de Performance Clinique</div>
                </div>
                
                {/* Rendu Markdown du feedback */}
                <div className="prose prose-invert max-w-none text-gray-300 text-sm">
                    <div dangerouslySetInnerHTML={{ __html: scoringResult.feedbackMarkdown.replace(/\n/g, '<br/>') }} />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 p-6 rounded border border-gray-700 max-w-xl mx-auto mt-10">
            <h3 className="text-xl text-blue-400 border-b border-gray-700 pb-2 mb-4">Conclusion Clinique & Dépôt</h3>
            <p className="text-xs text-gray-400 mb-4">
                Attention : La validation de ce formulaire met fin au cas clinique. Vos choix seront comparés aux recommandations de la Haute Autorité de Santé (HAS).
            </p>

            <div className="mb-4">
                <label className="text-xs font-bold text-gray-300 uppercase block mb-1">Diagnostic Principal Fondé (Code ID / Nom DCI)</label>
                <input 
                    type="text" 
                    placeholder="Ex: EDN_228_SCA"
                    className="w-full bg-gray-900 border border-gray-600 text-gray-100 p-2 rounded font-mono text-sm"
                    value={primaryDiag}
                    onChange={(e) => setPrimaryDiag(e.target.value)}
                />
            </div>

            <button 
                onClick={handleSubmit}
                disabled={!primaryDiag}
                className={`w-full p-3 font-bold uppercase rounded text-sm transition-colors ${
                    primaryDiag ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
            >
                Valider et Signer le Compte-Rendu d'Hospitalisation
            </button>
        </div>
    );
};