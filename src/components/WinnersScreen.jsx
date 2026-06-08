// src/components/WinnersScreen.jsx
import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import useWindowSize from '../hooks/useWindowSize';
import logoProdispro from '../assets/logo-prodispro.svg';

const WinnersScreen = ({ winners, onReset }) => {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const uniqueWinners = winners.filter((winner, index, self) =>
    index === self.findIndex(w =>
      w.participant.id === winner.participant.id && w.prize.id === winner.prize.id
    )
  );

  const groupedWinners = uniqueWinners.reduce((acc, winner) => {
    if (!winner?.prize || !winner?.participant) return acc;
    const id = winner.prize.id;
    if (!acc[id]) acc[id] = { prize: winner.prize, winners: [] };
    acc[id].winners.push(winner);
    return acc;
  }, {});

  useEffect(() => {
    setShowConfetti(true);
  }, []);

  const getPrizeImage = (prize) => {
    if (!prize.imagen?.trim()) return null;
    return prize.imagen.startsWith('data:image') ? prize.imagen : `data:image/jpeg;base64,${prize.imagen}`;
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      if (!uniqueWinners.length) { alert('No hay ganadores'); return; }

      // Cargar el SVG como texto para incrustarlo inline
      let svgContent = '';
      try {
        const res = await fetch(logoProdispro);
        svgContent = await res.text();
      } catch (_) { svgContent = ''; }

      const currentDate = new Date().toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
      const fechaCorta = new Date().toLocaleDateString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });

      // Ordenar por nombre de premio para agrupar visualmente
      const sorted = [...uniqueWinners].sort((a, b) =>
        (a.prize.name || '').localeCompare(b.prize.name || '')
      );

      // Contar ganadores por nombre normalizado
      const countByPrize = {};
      sorted.forEach(w => {
        const k = (w.prize.name || '').trim().toUpperCase();
        countByPrize[k] = (countByPrize[k] || 0) + 1;
      });

      // Filas: insertar cabecera solo cuando cambia el nombre del premio
      const rows = sorted.map((w, i) => {
        const p = w.participant;
        const key = (w.prize.name || '').trim().toUpperCase();
        const prevKey = i > 0 ? (sorted[i - 1].prize.name || '').trim().toUpperCase() : null;

        const header = key !== prevKey ? `
        <tr class="prize-header">
          <td colspan="5">
            <div class="prize-header-inner">
              <span class="prize-header-name">${w.prize.name}</span>
              <span class="prize-header-badge">${countByPrize[key]} / ${w.prize.cantidad} unidades</span>
            </div>
          </td>
        </tr>` : '';

        const row = `
        <tr class="${i % 2 === 0 ? '' : 'alt'}">
          <td class="num">${w.unit}</td>
          <td>
            <div class="name">${p.name}</div>
            <div class="sub">Cod. ${p.codigoCliente || p.id || '—'}</div>
          </td>
          <td>
            <div class="factura">${p.invoiceNumber}</div>
            <div class="sub">${p.fechaFormateada || '—'}</div>
          </td>
          <td>
            <div class="city">${p.ciudad || '—'}</div>
            <div class="sub">${p.provincia || ''}</div>
          </td>
          <td>
            <div class="vendor">${p.vendedor || '—'}</div>
            <div class="sub">${p.supervisor || ''}</div>
          </td>
        </tr>`;

        return header + row;
      }).join('');

      const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ganadores Sorteo PRODISPRO 2025</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    @page { size: A4 portrait; margin: 18mm 14mm 14mm 14mm; }

    body {
      font-family: Arial, sans-serif;
      background: #fff;
      color: #1e293b;
      font-size: 12px;
    }

    /* ── HEADER ── */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #ffffff;
      border: 2px solid #019BDC;
      border-left: 6px solid #019BDC;
      padding: 16px 28px;
      margin-bottom: 20px;
      border-radius: 10px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .logo-wrap { width: 180px; flex-shrink: 0; }
    .logo-wrap svg { width: 100%; height: auto; display: block; }

    .header-info { text-align: right; color: #1e293b; }
    .header-title {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.3px;
      line-height: 1.2;
      color: #019BDC;
    }
    .header-sub {
      font-size: 10px;
      color: #64748b;
      margin-top: 5px;
    }

    /* ── STATS ── */
    .stats {
      display: flex;
      gap: 10px;
      margin-bottom: 18px;
    }
    .stat {
      flex: 1;
      border-radius: 8px;
      padding: 10px 14px;
      border-left: 3px solid #019BDC;
      background: #f0f9ff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .stat.g { border-color: #16a34a; background: #f0fdf4; }
    .stat.a { border-color: #d97706; background: #fffbeb; }
    .stat-n { font-size: 18px; font-weight: 800; color: #0f172a; line-height: 1; }
    .stat-l { font-size: 10px; color: #64748b; margin-top: 2px; }

    /* ── TABLE ── */
    table { width: 100%; border-collapse: collapse; }

    .table-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      margin-bottom: 6px;
    }

    thead tr {
      background: #019BDC;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    thead th {
      color: white;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 9px 10px;
      text-align: left;
      white-space: nowrap;
    }

    tbody tr { border-bottom: 1px solid #e2e8f0; }
    tbody tr.alt td {
      background: #f8fafc;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    td { padding: 9px 10px; vertical-align: top; }

    .num {
      width: 28px;
      text-align: center;
      font-weight: 800;
      font-size: 13px;
      color: #019BDC;
    }
    .name   { font-weight: 700; font-size: 12px; color: #0f172a; }
    .factura {
      font-family: 'Courier New', monospace;
      font-weight: 700;
      font-size: 11px;
      color: #1d4ed8;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .city   { font-weight: 600; font-size: 11px; color: #1e293b; }
    .vendor { font-weight: 600; font-size: 11px; color: #1e293b; }
    .sub    { font-size: 10px; color: #94a3b8; margin-top: 2px; }

    /* ── CABECERA DE PREMIO ── */
    .prize-header td {
      padding: 0;
      border-bottom: none;
    }
    .prize-header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(90deg, #04375a, #019BDC);
      padding: 8px 14px;
      margin-top: 14px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .prize-header-name {
      font-size: 12px;
      font-weight: 800;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .prize-header-badge {
      font-size: 10px;
      font-weight: 700;
      color: #bfdbfe;
      background: rgba(255,255,255,0.15);
      padding: 2px 10px;
      border-radius: 20px;
    }

    /* ── FOOTER ── */
    .footer {
      margin-top: 20px;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="logo-wrap">${svgContent}</div>
    <div class="header-info">
      <div class="header-title">Acta de Ganadores<br>Sorteo 2025</div>
      <div class="header-sub">Generado: ${currentDate}</div>
    </div>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="stat-n">${uniqueWinners.length}</div>
      <div class="stat-l">Ganadores</div>
    </div>
    <div class="stat g">
      <div class="stat-n">${uniqueWinners.length}</div>
      <div class="stat-l">Unidades sorteadas</div>
    </div>
    <div class="stat a">
      <div class="stat-n">${fechaCorta}</div>
      <div class="stat-l">Fecha del sorteo</div>
    </div>
  </div>

  <div class="table-label">Registro oficial de ganadores por premio</div>
  <table>
    <thead>
      <tr>
        <th>Ud.</th>
        <th>Cliente</th>
        <th>Factura ganadora</th>
        <th>Ciudad / Provincia</th>
        <th>Vendedor / Supervisor</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="footer">
    PRODISPRO Cia. Ltda. · Sistema de Sorteos 2025 · ${currentDate}
  </div>

</body>
</html>`;

      const win = window.open('', '_blank');
      win.document.write(html);
      win.document.close();
      win.onload = () => setTimeout(() => win.print(), 700);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden gap-2 relative">
      {showConfetti && (
        <Confetti width={width} height={height} numberOfPieces={250} recycle gravity={0.12}
          colors={['#019BDC','#22C55E','#EAB308','#EF4444','#8B5CF6','#F97316']}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 50, pointerEvents: 'none' }} />
      )}

      {/* Logo fondo — esquina inferior derecha, estático */}
      <img src={logoProdispro} alt="" aria-hidden="true"
        className="absolute bottom-4 right-6 pointer-events-none select-none"
        style={{ width: '520px', height: 'auto', opacity: 0.12, zIndex: 0 }} />

      {/* Banner superior compacto */}
      <div className="flex-shrink-0 flex items-center gap-4 bg-slate-800/70 border border-emerald-500/30 rounded-2xl px-5 py-3">
        <div className="text-4xl animate-bounce">🎉</div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-prodispro-blue leading-tight">
            ¡Sorteo Completado!
          </h1>
          <p className="text-xs text-gray-400">
            {uniqueWinners.length} ganador{uniqueWinners.length !== 1 ? 'es' : ''} · {Object.keys(groupedWinners).length} premio{Object.keys(groupedWinners).length !== 1 ? 's' : ''} · {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Botón confeti — icono grande y claro */}
          <button
            onClick={() => setShowConfetti(v => !v)}
            title={showConfetti ? 'Detener confeti' : 'Lanzar confeti'}
            className={`flex items-center justify-center w-9 h-9 rounded-xl text-xl border transition-all hover:scale-110 active:scale-95 ${
              showConfetti
                ? 'bg-yellow-400/20 border-yellow-400/40 hover:bg-yellow-400/30'
                : 'bg-slate-700/60 border-slate-500/40 hover:bg-slate-600/60 grayscale opacity-50'
            }`}
          >
            🎊
          </button>

          <button onClick={generatePDF} disabled={isGeneratingPDF || !uniqueWinners.length}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100">
            <span className="text-lg leading-none">{isGeneratingPDF ? '⏳' : '📄'}</span>
            <span className="text-xs">{isGeneratingPDF ? 'PDF...' : `PDF (${uniqueWinners.length})`}</span>
          </button>

          <button onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold bg-prodispro-blue text-white hover:bg-prodispro-blue/80 transition-all hover:scale-105 active:scale-95">
            <span className="text-lg leading-none">🔄</span>
            <span className="text-xs">Nuevo Sorteo</span>
          </button>

        </div>
      </div>

      {/* Contenido principal */}
      {uniqueWinners.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-500">
          <span className="text-5xl">😅</span>
          <p className="text-lg font-bold">No hay ganadores registrados</p>
          <button onClick={onReset} className="px-6 py-2 bg-prodispro-blue text-white rounded-xl text-sm font-bold">Volver al Inicio</button>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex gap-2">

          {/* Tabla completa */}
          <div className="flex-1 min-w-0 min-h-0 bg-slate-800/60 border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col">
            <div className="flex-shrink-0 px-4 py-2 border-b border-white/[0.06] flex items-center gap-2">
              <span className="text-sm font-bold text-prodispro-blue">🎯 Lista completa de ganadores</span>
              <span className="ml-auto text-xs text-gray-400">{uniqueWinners.length} registros</span>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto winners-scroll">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-sm">
                  <tr>
                    {['#','Ganador','Factura','Premio','Unidad','Ciudad','Vendedor'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-prodispro-blue font-bold border-b border-white/[0.06] whitespace-nowrap text-base">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uniqueWinners.map((w, i) => (
                    <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                      <td className="px-4 py-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-extrabold text-emerald-400 text-base">{i + 1}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-prodispro-blue/20 border border-prodispro-blue/40 flex items-center justify-center font-bold text-prodispro-blue flex-shrink-0 text-lg">
                            {w.participant.name.charAt(0)}
                          </div>
                          <span className="font-extrabold text-white text-lg leading-snug">{w.participant.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono text-prodispro-blue text-base font-semibold">{w.participant.invoiceNumber}</td>
                      <td className="px-4 py-4 text-gray-200 text-base">{w.prize.name}</td>
                      <td className="px-4 py-4 text-center">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-base">{w.unit}</span>
                      </td>
                      <td className="px-4 py-4 text-gray-300 text-base">{w.participant.ciudad}</td>
                      <td className="px-4 py-4 text-gray-300 text-base">{w.participant.vendedor || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      <style>{`
        .winners-scroll { scrollbar-width: thin; scrollbar-color: #334155 #1e293b; }
        .winners-scroll::-webkit-scrollbar { width: 4px; }
        .winners-scroll::-webkit-scrollbar-track { background: #1e293b; }
        .winners-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }

      `}</style>
    </div>
  );
};

export default WinnersScreen;
