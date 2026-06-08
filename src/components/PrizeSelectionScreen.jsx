// src/components/PrizeSelectionScreen.jsx
import React, { useState, useCallback } from 'react';
import { Play, X, Search, Trophy, Users, Star, MapPin } from 'lucide-react';

const PrizeSelectionScreen = ({ prizes, participants, completedPrizes, onStartSorteo, systemStats }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrize, setSelectedPrize] = useState(null);

  const filteredParticipants = participants.filter(participant =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.vendedor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrizeSelect = useCallback((prize) => {
    if (!completedPrizes.includes(prize.id)) {
      setSelectedPrize(selectedPrize?.id === prize.id ? null : prize);
    }
  }, [completedPrizes, selectedPrize]);

  const handleStartSorteo = () => {
    if (selectedPrize) {
      onStartSorteo(selectedPrize);
      setSelectedPrize(null);
    }
  };

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

  return (
    <div className="h-full flex flex-col gap-3 animate-fade-in-up">

      {/* Stats bar — fila compacta */}
      {systemStats && (
        <div className="grid grid-cols-4 gap-2 flex-shrink-0">
          {[
            { value: systemStats.participants.total, label: 'Participantes', color: 'text-prodispro-blue', icon: <Users size={16} className="text-prodispro-blue" /> },
            { value: systemStats.prizes.totalPrizeTypes, label: 'Premios', color: 'text-emerald-400', icon: <Trophy size={16} className="text-emerald-400" /> },
            { value: systemStats.prizes.totalUnits, label: 'Unidades', color: 'text-amber-400', icon: <Star size={16} className="text-amber-400" /> },
            { value: [...new Set(participants.map(p => p.provincia).filter(Boolean))].length, label: 'Provincias', color: 'text-cyan-400', icon: <MapPin size={16} className="text-cyan-400" /> },
          ].map((stat, i) => (
            <div key={i} className="stat-card flex items-center gap-2 px-3 py-2">
              <div className="text-lg flex-shrink-0">{stat.icon}</div>
              <div className="min-w-0">
                <div className={`text-lg font-bold leading-none ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-400 truncate">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contenido principal — premios más anchos que participantes */}
      <div className="flex-1 grid gap-3 min-h-0" style={{gridTemplateColumns: '3fr 2fr'}}>

        {/* Panel Premios */}
        <div className="panel flex flex-col min-h-0">
          <div className="panel-header flex-shrink-0">
            <Trophy size={14} className="text-prodispro-blue" />
            <span>Premios Disponibles</span>
            <span className="ml-auto text-xs text-gray-400 font-normal">{prizes.length} premio{prizes.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 px-1 pt-1 custom-scroll">
            <div className="prize-grid">
            {prizes.map((prize) => {
              const isCompleted = completedPrizes.includes(prize.id);
              const isSelected = selectedPrize?.id === prize.id;
              const prizeImage = getPrizeImage(prize);

              return (
                <div
                  key={prize.id}
                  onClick={() => !isCompleted && handlePrizeSelect(prize)}
                  className={`prize-card-big ${isCompleted ? 'prize-card-big--done' : isSelected ? 'prize-card-big--selected' : 'prize-card-big--idle'}`}
                >
                  {/* Imagen grande */}
                  <div className="prize-img-wrap">
                    {prizeImage ? (
                      <img
                        src={prizeImage}
                        alt={prize.name}
                        className="w-full h-full object-contain"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div className={`w-full h-full ${prizeImage ? 'hidden' : 'flex'} items-center justify-center text-5xl`}>
                      {getPrizeIcon(prize.name)}
                    </div>
                    {/* Badge cantidad */}
                    <span className="prize-badge-big">{prize.cantidad}</span>
                    {/* Estado completado */}
                    {isCompleted && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                        <span className="text-3xl">✅</span>
                      </div>
                    )}
                  </div>

                  {/* Info + acciones */}
                  <div className="prize-card-footer">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm leading-tight truncate">{prize.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {prize.cantidad} {prize.cantidad === 1 ? 'unidad' : 'unidades'} · {prize.cantidad * 3} rondas
                      </p>
                      </div>
                    {isSelected && !isCompleted && (
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStartSorteo(); }}
                          className="action-btn action-btn--go"
                          title="Iniciar Sorteo"
                        >
                          <Play size={12} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedPrize(null); }}
                          className="action-btn action-btn--cancel"
                          title="Cancelar"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </div>

        {/* Panel Participantes */}
        <div className="panel flex flex-col min-h-0">
          <div className="panel-header flex-shrink-0">
            <Users size={14} className="text-prodispro-blue" />
            <span>Participantes</span>
            <span className="ml-auto text-xs text-gray-400 font-normal">{filteredParticipants.length} de {participants.length}</span>
          </div>

          {/* Buscador */}
          <div className="relative flex-shrink-0 mb-2">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar nombre, factura, ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto min-h-0 space-y-1 custom-scroll pr-1">
            {filteredParticipants.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Search size={32} className="mb-2 opacity-30" />
                <p className="text-sm">Sin resultados</p>
              </div>
            ) : (
              filteredParticipants.map((p, i) => (
                <div key={p.id} className="participant-row">
                  <div className="participant-avatar">{p.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate leading-tight">{p.name}</p>
                    <p className="text-gray-400 text-xs truncate">{p.invoiceNumber} · {p.ciudad}</p>
                  </div>
                  <span className="rank-badge">#{i + 1}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Toast de premio seleccionado */}
      {selectedPrize && (
        <div className="selected-toast flex-shrink-0">
          <div className="w-8 h-8 flex-shrink-0">
            {getPrizeImage(selectedPrize) ? (
              <img src={getPrizeImage(selectedPrize)} alt={selectedPrize.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg bg-slate-700 rounded-lg">
                {getPrizeIcon(selectedPrize.name)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{selectedPrize.name}</p>
            <p className="text-xs text-white/70">{selectedPrize.cantidad} unidades · {selectedPrize.cantidad * 3} rondas</p>
          </div>
          <button
            onClick={handleStartSorteo}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold transition-colors flex-shrink-0"
          >
            <Play size={12} />
            Iniciar
          </button>
          <button
            onClick={() => setSelectedPrize(null)}
            className="p-2 text-white/60 hover:text-white transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <style>{`
        /* Stats card */
        .stat-card {
          background: rgba(30,41,59,0.8);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          backdrop-filter: blur(10px);
        }

        /* Panel */
        .panel {
          background: rgba(30,41,59,0.7);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 12px;
          backdrop-filter: blur(12px);
        }
        .panel-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          padding-bottom: 8px;
          margin-bottom: 8px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        /* Prize grid */
        .prize-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
          padding: 4px 2px 4px 2px;
        }

        /* Prize card grande — sin transform para evitar desbordamiento */
        .prize-card-big {
          display: flex;
          flex-direction: column;
          border-radius: 12px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          overflow: hidden;
          position: relative;
        }
        .prize-card-big--idle {
          background: rgba(51,65,85,0.45);
          border-color: rgba(255,255,255,0.07);
        }
        .prize-card-big--idle:hover {
          background: rgba(1,155,220,0.1);
          border-color: rgba(1,155,220,0.4);
          box-shadow: 0 0 0 1px rgba(1,155,220,0.2), 0 6px 20px rgba(1,155,220,0.15);
        }
        .prize-card-big--selected {
          background: rgba(1,155,220,0.13);
          border-color: rgba(1,155,220,0.65);
          box-shadow: 0 0 0 1px rgba(1,155,220,0.3), 0 0 24px rgba(1,155,220,0.2);
        }
        .prize-card-big--done {
          background: rgba(16,185,129,0.07);
          border-color: rgba(16,185,129,0.25);
          opacity: 0.55;
          cursor: not-allowed;
        }

        /* Zona de imagen — ocupa la mayor parte de la card */
        .prize-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 16/10;
          background: rgba(15,23,42,0.6);
          overflow: hidden;
          padding: 12px;
        }
        .prize-img-wrap img {
          border-radius: 6px;
        }

        /* Badge cantidad */
        .prize-badge-big {
          position: absolute;
          top: 6px;
          right: 6px;
          min-width: 22px;
          height: 22px;
          padding: 0 5px;
          background: linear-gradient(135deg, #019BDC, #22D3EE);
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        }

        /* Footer de la card */
        .prize-card-footer {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 10px;
          background: rgba(15,23,42,0.4);
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        /* Action buttons */
        .action-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: transform 0.15s;
          border: none;
        }
        .action-btn:hover { transform: scale(1.12); }
        .action-btn--go   { background: linear-gradient(135deg, #22c55e, #16a34a); }
        .action-btn--cancel { background: linear-gradient(135deg, #ef4444, #dc2626); }

        /* Participant row */
        .participant-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 8px;
          background: rgba(51,65,85,0.35);
          border: 1px solid rgba(255,255,255,0.05);
          transition: background 0.15s;
        }
        .participant-row:hover {
          background: rgba(1,155,220,0.08);
          border-color: rgba(1,155,220,0.2);
        }
        .participant-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #019BDC, #22D3EE);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 12px;
          color: white;
          flex-shrink: 0;
        }
        .rank-badge {
          font-size: 10px;
          color: #6b7280;
          font-family: monospace;
          flex-shrink: 0;
        }

        /* Search input */
        .search-input {
          width: 100%;
          padding: 7px 28px 7px 28px;
          background: rgba(15,23,42,0.6);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: white;
          font-size: 12px;
          outline: none;
          transition: border-color 0.2s;
        }
        .search-input::placeholder { color: #6b7280; }
        .search-input:focus { border-color: rgba(1,155,220,0.5); }

        /* Toast */
        .selected-toast {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: linear-gradient(135deg, rgba(1,155,220,0.25), rgba(34,211,238,0.15));
          border: 1px solid rgba(1,155,220,0.4);
          border-radius: 12px;
          backdrop-filter: blur(12px);
          animation: toast-in 0.25s ease-out;
        }
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Scrollbar */
        .custom-scroll { scrollbar-width: thin; scrollbar-color: #019BDC #1e293b; }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: #1e293b; border-radius: 2px; }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #019BDC, #22D3EE);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

export default React.memo(PrizeSelectionScreen);
