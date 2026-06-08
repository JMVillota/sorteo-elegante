// src/components/ZoneSelectionScreen.jsx
import React, { useState, useMemo } from 'react';
import { FaPlay, FaMapMarkerAlt, FaUsers, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const ZoneSelectionScreen = ({ prize, participants, currentUnit, onConfirm, onBack }) => {
  const [filterType, setFilterType] = useState('provincia'); // 'provincia' | 'supervisor'
  const [selectedZone, setSelectedZone] = useState(null);
  const [expandedZone, setExpandedZone] = useState(null);

  const getPrizeImage = (prize) => {
    if (prize.imagen && prize.imagen.trim()) {
      if (prize.imagen.startsWith('data:image')) return prize.imagen;
      return `data:image/jpeg;base64,${prize.imagen}`;
    }
    return null;
  };

  const getPrizeIcon = (prizeName) => {
    if (prizeName.includes("CAFETERA")) return "☕";
    if (prizeName.includes("ASPIRADORA")) return "🧹";
    if (prizeName.includes("MOTO")) return "🏍️";
    if (prizeName.includes("REFRIGERADORA")) return "🧊";
    return "🎁";
  };

  // Agrupar participantes por provincia o supervisor
  const zones = useMemo(() => {
    const grouped = {};
    participants.forEach(p => {
      const key = filterType === 'provincia'
        ? (p.provincia || 'SIN PROVINCIA')
        : (p.supervisor || 'SIN SUPERVISOR');

      if (!grouped[key]) {
        grouped[key] = {
          name: key,
          participants: [],
          codigoSPV: p.codigoSPV,
          codigoProvincia: p.codigoProvincia,
        };
      }
      grouped[key].participants.push(p);
    });

    return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
  }, [participants, filterType]);

  const selectedParticipants = useMemo(() => {
    if (!selectedZone) return [];
    return zones.find(z => z.name === selectedZone)?.participants || [];
  }, [selectedZone, zones]);

  const handleConfirm = () => {
    if (selectedZone && selectedParticipants.length > 0) {
      onConfirm(selectedParticipants, selectedZone);
    }
  };

  return (
    <div className="animate-fade-in-up px-2 sm:px-4 max-w-5xl mx-auto">
      {/* Premio actual */}
      <div className="mb-6 card-modern p-4 flex items-center space-x-4">
        <div className="w-14 h-14 flex-shrink-0 relative">
          {getPrizeImage(prize) ? (
            <img
              src={getPrizeImage(prize)}
              alt={prize.name}
              className="w-full h-full object-cover rounded-xl border-2 border-prodispro-blue/50 shadow-lg"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl border-2 border-prodispro-blue/50 shadow-lg">
              {getPrizeIcon(prize.name)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 mb-0.5">Premio seleccionado</p>
          <h2 className="text-lg font-bold text-gradient-primary truncate">{prize.name}</h2>
          <p className="text-sm text-gray-300">
            Unidad <span className="text-prodispro-blue font-bold">{currentUnit}</span> de {prize.cantidad}
          </p>
        </div>
        {currentUnit === 1 && (
          <button
            onClick={onBack}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white rounded-lg text-sm transition-colors"
          >
            Cambiar premio
          </button>
        )}
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gradient-primary text-center">
        Seleccionar Zona — Unidad {currentUnit} de {prize.cantidad}
      </h2>
      <p className="text-center text-gray-400 text-sm mb-6">
        Elige de qué zona quieres que salga el ganador de la <span className="text-prodispro-blue font-semibold">unidad {currentUnit}</span> de <span className="text-white font-semibold">{prize.name}</span>
      </p>

      {/* Toggle tipo de filtro */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-600">
          <button
            onClick={() => { setFilterType('provincia'); setSelectedZone(null); }}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filterType === 'provincia'
                ? 'bg-prodispro-blue text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Por Provincia
          </button>
          <button
            onClick={() => { setFilterType('supervisor'); setSelectedZone(null); }}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filterType === 'supervisor'
                ? 'bg-prodispro-blue text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Por Supervisor
          </button>
        </div>
      </div>

      {/* Lista de zonas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
        {zones.map((zone) => {
          const isSelected = selectedZone === zone.name;
          const isExpanded = expandedZone === zone.name;
          const count = zone.participants.length;

          return (
            <div
              key={zone.name}
              className={`rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                isSelected
                  ? 'border-prodispro-blue bg-prodispro-blue/15 shadow-lg shadow-prodispro-blue/20'
                  : 'border-slate-600 bg-slate-800/50 hover:border-prodispro-blue/50 hover:bg-slate-800/70'
              }`}
            >
              <div
                className="p-3 sm:p-4 cursor-pointer"
                onClick={() => setSelectedZone(isSelected ? null : zone.name)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-prodispro-blue' : 'bg-slate-700'
                  }`}>
                    <FaMapMarkerAlt className="text-white text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm truncate">{zone.name}</h3>
                    {filterType === 'supervisor' && zone.codigoSPV && (
                      <p className="text-xs text-gray-400">Cód. {zone.codigoSPV}</p>
                    )}
                    {filterType === 'provincia' && zone.codigoProvincia && (
                      <p className="text-xs text-gray-400">Prov. {zone.codigoProvincia}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold ${
                      isSelected ? 'bg-prodispro-blue/30 text-prodispro-blue' : 'bg-slate-700 text-gray-300'
                    }`}>
                      <FaUsers className="text-xs" />
                      <span>{count}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpandedZone(isExpanded ? null : zone.name); }}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {isExpanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Detalle de participantes */}
              {isExpanded && (
                <div className="border-t border-slate-600/50 px-4 pb-3 pt-2 max-h-40 overflow-y-auto custom-scrollbar">
                  <div className="space-y-1">
                    {zone.participants.slice(0, 20).map((p, i) => (
                      <div key={p.id} className="flex items-center space-x-2 text-xs text-gray-300">
                        <span className="text-gray-500 w-5 text-right flex-shrink-0">{i + 1}.</span>
                        <span className="truncate">{p.name}</span>
                        <span className="text-gray-500 flex-shrink-0">{p.ciudad}</span>
                      </div>
                    ))}
                    {zone.participants.length > 20 && (
                      <p className="text-xs text-gray-500 text-center pt-1">
                        ... y {zone.participants.length - 20} más
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Panel inferior de confirmación */}
      {selectedZone && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-auto sm:min-w-96 bg-gradient-to-r from-slate-800/95 to-slate-700/95 backdrop-blur-sm border border-prodispro-blue/50 rounded-2xl p-4 shadow-2xl z-40 animate-scale-up">
          <div className="flex items-center space-x-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400">Zona seleccionada</p>
              <h3 className="font-bold text-white text-sm truncate">{selectedZone}</h3>
              <p className="text-xs text-prodispro-blue">
                {selectedParticipants.length} participantes disponibles
              </p>
            </div>
            <button
              onClick={handleConfirm}
              className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl text-sm font-bold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:scale-105"
            >
              <FaPlay className="text-xs" />
              <span>Iniciar Sorteo</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #019BDC #374151;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #374151; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #019BDC, #22D3EE);
          border-radius: 3px;
        }
        @keyframes scale-up {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-scale-up { animation: scale-up 0.25s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ZoneSelectionScreen;
