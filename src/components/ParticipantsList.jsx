import React from 'react';

const ParticipantsList = ({ participants, onStartRoulette, selectedPrize }) => {
  return (
    <div className="w-full flex flex-col">
      <h2 className="text-center text-xl font-bold text-accent mb-4">
        Participantes
      </h2>
      
      {/* Lista de participantes con scroll */}
      <div className="bg-primary-purple/30 rounded-lg p-2 h-[60vh] overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {participants.map((participant) => (
            <div 
              key={participant.id}
              className="bg-secondary-purple/50 p-3 rounded-md flex flex-col items-center text-center hover:bg-secondary-purple/70 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue to-pink flex items-center justify-center text-sm font-bold mb-2">
                {participant.name.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm truncate w-full">{participant.name}</p>
              <p className="text-xs text-accent/80 truncate w-full">#{participant.ticketNumber}</p>
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
            px-8 py-3 rounded-full font-bold uppercase tracking-wider
            ${selectedPrize ? 
              'bg-gradient-to-r from-accent to-pink text-white shadow-lg hover:-translate-y-1 transition-all duration-300' : 
              'bg-gray-700 text-gray-400 cursor-not-allowed'}
          `}
        >
          Comenzar Sorteo
        </button>
      </div>
    </div>
  );
};

export default ParticipantsList;