// Generar 100 participantes de ejemplo
const generateParticipants = () => {
  const nombres = [
    'María', 'Juan', 'Carlos', 'Ana', 'Luis', 'Laura', 'Jorge', 'Patricia', 
    'Pedro', 'Sofía', 'Fernando', 'Gabriela', 'Miguel', 'Lucía', 'Roberto', 
    'Alejandra', 'José', 'Daniela', 'David', 'Diana'
  ];
  
  const apellidos = [
    'González', 'Rodríguez', 'López', 'Martínez', 'Pérez', 'Gómez', 'Sánchez', 
    'Fernández', 'Ramírez', 'Torres', 'Díaz', 'Morales', 'Ortiz', 'Castro', 
    'Ruiz', 'Vargas', 'Reyes', 'Romero', 'Suárez', 'Navarro'
  ];
  
  const participants = [];
  
  for (let i = 1; i <= 100; i++) {
    const randomNombre = nombres[Math.floor(Math.random() * nombres.length)];
    const randomApellido = apellidos[Math.floor(Math.random() * apellidos.length)];
    
    participants.push({
      id: i,
      name: `${randomNombre} ${randomApellido}`,
      ticketNumber: Math.floor(10000 + Math.random() * 90000).toString(),
      invoiceNumber: `F-${Math.floor(1000 + Math.random() * 9000)}`
    });
  }
  
  return participants;
};

// 5 premios de ejemplo
const prizes = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    description: ""
  },
  {
    id: 2,
    name: "Smart TV 65\"",
    description: ""
  },
  {
    id: 3,
    name: "Viaje a Cancún",
    description: ""
  },
  {
    id: 4,
    name: "MacBook Pro",
    description: ""
  },

];

// Generar los participantes una sola vez
const participants = generateParticipants();

export const getParticipants = async () => {
  // Simular una llamada a API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(participants);
    }, 500);
  });
};

export const getPrizes = async () => {
  // Simular una llamada a API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(prizes);
    }, 300);
  });
};