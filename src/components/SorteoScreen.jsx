// src/components/SorteoScreen.jsx
import React, { useState } from 'react';
import RouletteWheel from './RouletteWheel';
import WinnerModal from './WinnerModal';
import logoProdispro from '../assets/logo-prodispro.svg';

const SorteoScreen = ({ prize, participants, zoneName, currentUnit, onUnitComplete, onBack, previousWinners = [], previousLosers = [] }) => {
  const [currentRound, setCurrentRound]           = useState(1);
  const [roundLosers, setRoundLosers]             = useState([]);
  const [isRoundActive, setIsRoundActive]         = useState(false);
  const [currentWinner, setCurrentWinner]         = useState(null);
  const [showResult, setShowResult]               = useState(false);
  const [showWinnerModal, setShowWinnerModal]     = useState(false);
  const [unitWinner, setUnitWinner]               = useState(null);
  const [spinningParticipant, setSpinningParticipant] = useState(null); // nombre que va girando

  const totalRounds   = 3;
  const isWinnerRound = currentRound === 3;

  const handleRoundComplete = (selected) => {
    setCurrentWinner(selected);
    setShowResult(true);
    if (isWinnerRound) {
      setUnitWinner({ participant: selected, prize, round: currentRound, unit: currentUnit });
    } else {
      setRoundLosers(prev => [...prev, { participant: selected, round: currentRound }]);
    }
    setTimeout(() => setShowWinnerModal(true), 1000);
  };

  const continueToNextRound = () => {
    setShowResult(false);
    setCurrentWinner(null);
    setShowWinnerModal(false);
    setIsRoundActive(false);
    setSpinningParticipant(null);
    if (isWinnerRound && unitWinner) {
      onUnitComplete(unitWinner, roundLosers);
    } else {
      setCurrentRound(prev => prev + 1);
    }
  };

  const getPrizeImage = (p) => {
    if (!p.imagen?.trim()) return null;
    return p.imagen.startsWith('data:image') ? p.imagen : `data:image/jpeg;base64,${p.imagen}`;
  };

  const roundColor = isWinnerRound
    ? { bg: 'rgba(16,185,129,0.12)', border: '#10b981', text: '#10b981', label: '🏆 GANADOR' }
    : { bg: 'rgba(239,68,68,0.12)',  border: '#ef4444', text: '#ef4444', label: '❌ ELIMINADO' };

  // participante visible en col derecha: el ganador/eliminado confirmado, o el que está girando
  const visibleParticipant = currentWinner || spinningParticipant;

  return (
    <div className="h-full flex flex-col overflow-hidden gap-2">

      <WinnerModal
        isOpen={showWinnerModal}
        winner={currentWinner}
        prize={prize}
        unit={currentUnit}
        totalUnits={prize.cantidad}
        onContinue={continueToNextRound}
        isWinnerRound={isWinnerRound}
      />

      {/* Info bar compacta */}
      <div className="flex-shrink-0 flex items-center gap-3 bg-slate-800/50 border border-white/[0.06] rounded-xl px-3 py-2">
        <div className="w-9 h-9 rounded-lg overflow-hidden border border-prodispro-blue/40 flex-shrink-0">
          {getPrizeImage(prize)
            ? <img src={getPrizeImage(prize)} alt={prize.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center bg-slate-700 text-base">🎁</div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm truncate">{prize.name}</p>
          <p className="text-xs text-gray-400">
            Unidad <span className="text-prodispro-blue font-bold">{currentUnit}</span>/{prize.cantidad}
            {' · '}Ronda <span className="font-bold text-white">{currentRound}</span>/{totalRounds}
            {zoneName && <span className="text-cyan-400"> · {zoneName}</span>}
          </p>
        </div>
        <div className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold border"
          style={{ background: roundColor.bg, borderColor: roundColor.border, color: roundColor.text }}>
          {roundColor.label}
        </div>

        {/* Eliminados centrado */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400">
            ❌ Eliminados <span className="text-white">{roundLosers.length}/{totalRounds - 1}</span>
          </div>
        </div>

        {/* Ronda counter */}
        <div className="flex-shrink-0 flex items-end gap-0.5">
          <span className="text-2xl font-extrabold text-prodispro-blue leading-none">{currentRound}</span>
          <span className="text-gray-500 text-sm mb-0.5">/{totalRounds}</span>
        </div>

        {/* Botón volver */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-medium transition-colors border border-white/10"
          >
            ← Inicio
          </button>
        )}
      </div>

      {/* 3 columnas */}
      <div className="flex-1 min-h-0 flex gap-2">

        {/* COL 1 — Eliminados (anteriores + actuales) */}
        {(() => {
          const allLosers = [...previousLosers, ...roundLosers];
          return (
            <div className="flex flex-col w-64 flex-shrink-0 bg-slate-800/60 border border-red-500/20 rounded-2xl overflow-hidden">
              <div className="flex-shrink-0 px-3 py-2 bg-red-500/10 border-b border-red-500/20 flex items-center gap-2">
                <span className="text-xs font-bold text-red-400">❌ Eliminados</span>
                <span className="ml-auto text-xs bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded-full font-bold">{allLosers.length}</span>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto p-2 sorteo-scroll">
                {allLosers.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600 text-xs gap-1 py-6">
                    <span className="text-2xl">⏳</span>Sin eliminados
                  </div>
                ) : (
                  <div className="space-y-1">
                    {allLosers.map((loser, i) => (
                      <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-red-500/5 border border-red-500/10">
                        <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-xs font-bold text-red-400 flex-shrink-0">
                          {loser.participant.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white leading-tight break-words">{loser.participant.name}</p>
                          <p className="text-xs text-red-400/60">{loser.participant.invoiceNumber}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* COL 2 — Ruleta (centro, toma todo el espacio restante) */}
        <div className="flex-1 min-w-0 min-h-0 relative">
          {/* Logo marca de agua — fondo estático tenue, sin animación */}
          <img
            src={logoProdispro}
            alt="" aria-hidden="true"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
            style={{ zIndex: 0, padding: '8%', opacity: 0.10 }}
          />
          <div className="relative h-full" style={{ zIndex: 1 }}>
          <RouletteWheel
            compact
            participants={participants}
            onWinnerSelected={handleRoundComplete}
            isActive={isRoundActive}
            onStart={() => setIsRoundActive(true)}
            showResult={showResult}
            currentWinner={currentWinner}
            isWinnerRound={isWinnerRound}
            onParticipantChange={setSpinningParticipant}
          />
          </div>
        </div>

        {/* COL 3 — Participante girando + Ganador */}
        <div className="flex flex-col gap-2 w-64 flex-shrink-0">

          {/* Participante actual (girando o resultado) */}
          <div className={`flex-shrink-0 rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
            showResult
              ? isWinnerRound ? 'border-emerald-500' : 'border-red-500'
              : 'border-prodispro-blue/40'
          }`} style={{
            background: showResult
              ? isWinnerRound ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)'
              : 'rgba(30,41,59,0.7)'
          }}>
            <div className="px-3 py-1.5 border-b border-white/[0.06] flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isRoundActive && !showResult ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
              <p className="text-xs text-gray-400 uppercase tracking-wider">
                {showResult
                  ? isWinnerRound ? '🏆 Ganador' : '❌ Eliminado'
                  : isRoundActive ? 'Seleccionando...' : 'Participante'}
              </p>
            </div>
            <div className="p-3">
              {visibleParticipant ? (
                <div className="space-y-1.5">
                  <p className="font-bold text-white text-xs leading-tight">{visibleParticipant.name}</p>
                  <p className="text-xs text-gray-400">📄 <span className="text-prodispro-blue font-mono">{visibleParticipant.invoiceNumber}</span></p>
                  <p className="text-xs text-gray-400">📍 <span className="text-white">{visibleParticipant.ciudad}</span></p>
                  <p className="text-xs text-gray-400">👤 <span className="text-white truncate block">{visibleParticipant.vendedor || 'N/A'}</span></p>
                  <p className="text-xs text-gray-400">📅 <span className="text-white">{visibleParticipant.fechaFormateada}</span></p>
                </div>
              ) : (
                <p className="text-xs text-gray-600 text-center py-3">Presiona para girar</p>
              )}
            </div>
          </div>

          {/* Ganadores: anteriores + actual */}
          <div className="flex-1 min-h-0 bg-slate-800/60 border border-emerald-500/20 rounded-2xl overflow-hidden flex flex-col">
            <div className="flex-shrink-0 px-3 py-2 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400">🏆 Ganadores</span>
              <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">
                {previousWinners.length + (unitWinner ? 1 : 0)}/{prize.cantidad}
              </span>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-2 sorteo-scroll">
              {previousWinners.length === 0 && !unitWinner ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 text-xs text-center gap-1 py-6">
                  <span className="text-2xl">🎯</span>Pendiente...
                </div>
              ) : (
                <div className="space-y-1">
                  {/* Ganadores anteriores */}
                  {previousWinners.map((w, i) => (
                    <div key={`prev-${i}`} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400 flex-shrink-0">
                        {w.participant.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white leading-tight break-words">{w.participant.name}</p>
                        <p className="text-xs text-emerald-400/60">U{w.unit} · {w.participant.invoiceNumber}</p>
                      </div>
                    </div>
                  ))}
                  {/* Ganador unidad actual */}
                  {unitWinner && (
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-400/40">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/30 border border-emerald-400 flex items-center justify-center text-xs font-bold text-emerald-300 flex-shrink-0">
                        {unitWinner.participant.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white leading-tight break-words">{unitWinner.participant.name}</p>
                        <p className="text-xs text-emerald-400/70">U{currentUnit} · {unitWinner.participant.invoiceNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .sorteo-scroll { scrollbar-width: thin; scrollbar-color: #334155 #1e293b; }
        .sorteo-scroll::-webkit-scrollbar { width: 3px; }
        .sorteo-scroll::-webkit-scrollbar-track { background: #1e293b; }
        .sorteo-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }

      `}</style>
    </div>
  );
};

export default SorteoScreen;
