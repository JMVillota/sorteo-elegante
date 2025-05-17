import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-dark">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-pink mb-6">
          PRODISPRO
        </h1>
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute top-0 w-16 h-16 border-4 border-transparent border-t-accent border-b-pink rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-300">Cargando datos del sorteo...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;