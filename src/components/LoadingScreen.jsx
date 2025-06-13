// src/components/LoadingScreen.jsx
import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ 
  isLoading = true, 
  currentStep = 0, 
  totalSteps = 7,
  currentMessage = 'Iniciando sorteo...',
  progress = 0 
}) => {
  // Generar números aleatorios para la animación
  const generateRandomNumbers = () => {
    return Array.from({ length: 12 }, (_, i) => (
      <div
        key={i}
        className="absolute text-prodispro-blue/30 font-mono text-sm animate-pulse"
        style={{
          left: `${Math.random() * 80 + 10}%`,
          top: `${Math.random() * 80 + 10}%`,
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${1 + Math.random() * 2}s`
        }}
      >
        FC{String(Math.floor(Math.random() * 9999)).padStart(4, '0')}
      </div>
    ));
  };

  // Generar iconos de premios flotantes
  const generateFloatingPrizes = () => {
    const prizes = ['🏍️', '☕', '🧹', '🧊', '🎁', '🏆', '💎', '⭐'];
    return prizes.map((prize, i) => (
      <div
        key={i}
        className="absolute text-2xl animate-bounce opacity-20"
        style={{
          left: `${(i * 12) + 5}%`,
          top: `${20 + (i % 2) * 40}%`,
          animationDelay: `${i * 0.3}s`,
          animationDuration: `${2 + (i % 3)}s`
        }}
      >
        {prize}
      </div>
    ));
  };

  if (!isLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative overflow-hidden">
      
      {/* Fondo animado con números de facturas */}
      <div className="absolute inset-0 overflow-hidden">
        {generateRandomNumbers()}
        {generateFloatingPrizes()}
      </div>

      {/* Efectos de partículas */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-prodispro-blue/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Contenido principal */}
      <div className="text-center z-10 bg-slate-800/90 backdrop-blur-sm rounded-3xl p-12 border border-prodispro-blue/30 shadow-2xl max-w-lg mx-4">
        
        {/* Logo principal */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-prodispro-blue via-cyan-400 to-blue-500 mb-4 animate-pulse">
            PRODISPRO
          </h1>
          <div className="text-xl text-gray-300 font-medium">
            Sistema de Sorteos 2025
          </div>
        </div>

        {/* Máquina tragamonedas animada */}
        <div className="mb-8 relative">
          <div className="bg-gradient-to-b from-prodispro-blue to-cyan-600 rounded-2xl p-6 border-4 border-prodispro-blue/50 relative overflow-hidden">
            
            {/* Luces superiores */}
            <div className="flex justify-center space-x-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-white"
                  style={{
                    animation: `blink 1s infinite ${i * 0.2}s`,
                    boxShadow: '0 0 10px rgba(255, 255, 255, 0.6)'
                  }}
                />
              ))}
            </div>

            {/* Rodillos simulados */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-black rounded-lg p-3 border border-prodispro-blue/30">
                  <div className="text-prodispro-blue font-mono text-lg text-center animate-pulse">
                    {i === 0 ? 'FC' : i === 1 ? '0000' : '000000'}
                  </div>
                </div>
              ))}
            </div>

            {/* Brillo animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Barra de progreso mejorada */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-400">Progreso</span>
            <span className="text-sm font-bold text-prodispro-blue">{Math.round(progress)}%</span>
          </div>
          
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-prodispro-blue via-cyan-400 to-blue-500 rounded-full transition-all duration-500 relative"
              style={{ width: `${progress}%` }}
            >
              {/* Efecto de brillo en la barra */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Texto de carga */}
        <div className="mb-6">
          <p className="text-gray-300 text-lg font-medium animate-pulse">
            {currentMessage}
          </p>
        </div>

        {/* Spinner personalizado */}
        <div className="relative">
          <div className="w-16 h-16 mx-auto relative">
            {/* Spinner exterior */}
            <div className="absolute inset-0 border-4 border-transparent border-t-prodispro-blue border-r-cyan-400 border-b-blue-500 rounded-full animate-spin" />
            
            {/* Spinner interior */}
            <div className="absolute inset-2 border-4 border-transparent border-t-cyan-400 border-l-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
            
            {/* Centro con icono */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-2xl animate-bounce">🎰</div>
            </div>
          </div>
        </div>

        {/* Indicadores de pasos */}
        <div className="flex justify-center space-x-2 mt-6">
          {[...Array(totalSteps)].map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index <= currentStep 
                  ? 'bg-prodispro-blue scale-125' 
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Efectos de esquinas */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-prodispro-blue/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-cyan-400/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-prodispro-blue/5 to-cyan-400/5 rounded-full blur-3xl" />

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;