import React from 'react';

const ParticipantsList = ({ participants, onStartRoulette, selectedPrize }) => {
  return (
    <div className="w-full flex flex-col">
      <h2 className="text-center text-xl font-bold text-accent mb-4">
        Participantes - Sorteo Día de la Madre
      </h2>
      
      <div className="bg-primary-purple/30 rounded-lg p-2 h-[65vh] overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {participants.map((participant) => (
            <div 
              key={participant.id}
              className="bg-secondary-purple/50 p-3 rounded-md flex flex-col items-center text-center hover:bg-secondary-purple/70 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg border border-transparent hover:border-accent/30 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-accent to-pink flex items-center justify-center text-lg font-bold mb-2 group-hover:scale-110 transition-transform">
                {participant.name.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-medium group-hover:text-accent transition-colors truncate w-full">{participant.name}</p>
              <p className="text-xs text-accent/80 truncate w-full">{participant.invoiceNumber}</p>
              <div className="flex justify-between w-full mt-1 text-xs text-gray-300">
                <span className="truncate">{participant.ciudad}</span>
                <span className="truncate">Vend: {participant.vendedor.split(' ')[0]}</span>
              </div>
              
              <div className="absolute inset-0 overflow-hidden rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-center mt-6">
        <p className="text-sm text-gray-300 mb-2">{participants.length} participantes en total</p>
        <button
          onClick={onStartRoulette}
          disabled={!selectedPrize}
          className={`
            px-8 py-3 rounded-full font-bold uppercase tracking-wider relative overflow-hidden
            ${selectedPrize ? 
              'bg-gradient-to-r from-accent to-pink text-white shadow-lg hover:-translate-y-1 transition-all duration-300' : 
              'bg-gray-700 text-gray-400 cursor-not-allowed'}
          `}
        >
          {selectedPrize && (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
          )}
          
          Comenzar Sorteo
        </button>
      </div>
    </div>
  );
};

export default ParticipantsList;