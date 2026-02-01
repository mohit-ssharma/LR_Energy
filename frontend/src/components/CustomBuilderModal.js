import React, { useState } from 'react';
import { X, Eye, Check } from 'lucide-react';

const CustomBuilderModal = ({ show, onClose, onPreview }) => {
  const [customParams, setCustomParams] = useState([]);

  const allParameters = {
    'Gas Flow': ['Raw Biogas Flow', 'Purified Gas Flow', 'Product Gas Flow'],
    'Gas Composition': ['CH₄ Concentration', 'CO₂ Levels', 'O₂ Concentration', 'H₂S Content', 'Dew Point'],
    'Digester 1': ['D1 Temperature Bottom', 'D1 Temperature Top', 'D1 Balloon Gas Pressure', 'D1 Balloon Air Pressure', 'D1 Gas Level'],
    'Digester 2': ['D2 Temperature Bottom', 'D2 Temperature Top', 'D2 Balloon Gas Pressure', 'D2 Balloon Air Pressure', 'D2 Gas Level'],
    'Tank Levels': ['Buffer Tank Slurry Level', 'Lagoon Tank Water Level'],
    'Water Flow': ['Feed FM - I', 'Feed FM - II', 'Fresh Water FM', 'Recycle Water FM']
  };

  const toggleParam = (param) => {
    setCustomParams(prev => 
      prev.includes(param) ? prev.filter(p => p !== param) : [...prev, param]
    );
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Custom Report Builder</h2>
            <p className="text-slate-300 text-sm mt-1">Select parameters to include in your custom report</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          <div className="grid grid-cols-2 gap-6">
            {Object.entries(allParameters).map(([category, params]) => (
              <div key={category} className="bg-gradient-to-br from-slate-50 to-white rounded-lg p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center justify-between">
                  <span>{category}</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                    {params.filter(p => customParams.includes(p)).length}/{params.length}
                  </span>
                </h3>
                <div className="space-y-2">
                  {params.map((param) => (
                    <label 
                      key={param} 
                      className="flex items-center space-x-2 p-2 rounded hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      <input 
                        type="checkbox" 
                        checked={customParams.includes(param)} 
                        onChange={() => toggleParam(param)} 
                        className="w-4 h-4 rounded border-slate-300" 
                      />
                      <span className="text-sm text-slate-700">{param}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <div className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-emerald-900">Selected Parameters: {customParams.length}</h4>
                <p className="text-sm text-emerald-700 mt-1">
                  {customParams.length > 0 ? customParams.join(', ') : 'No parameters selected'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end space-x-3">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => { onClose(); onPreview(); }} 
            disabled={customParams.length === 0} 
            className="px-6 py-2 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors flex items-center space-x-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Custom Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomBuilderModal;
