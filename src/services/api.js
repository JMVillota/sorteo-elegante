// generateParticipants.js
export const generateParticipants = () => {
  const nombres = [
    'María', 'Juan', 'Carlos', 'Ana', 'Luis', 'Laura', 'Jorge', 'Patricia', 
    'Pedro', 'Sofía', 'Fernando', 'Gabriela', 'Miguel', 'Lucía', 'Roberto', 
    'Alejandra', 'José', 'Daniela', 'David', 'Diana', 'Andrea', 'Sebastián',
    'Carolina', 'Javier', 'Valeria', 'Andrés', 'Rosa', 'Alberto', 'Silvia',
    'Raúl', 'Mónica', 'Héctor', 'Claudia', 'Eduardo', 'Isabel', 'Francisco',
    'Elena', 'Gustavo', 'Adriana', 'Arturo', 'Martha', 'Ricardo', 'Natalia'
  ];
  
  const apellidos = [
    'González', 'Rodríguez', 'López', 'Martínez', 'Pérez', 'Gómez', 'Sánchez', 
    'Fernández', 'Ramírez', 'Torres', 'Díaz', 'Morales', 'Ortiz', 'Castro', 
    'Ruiz', 'Vargas', 'Reyes', 'Romero', 'Suárez', 'Navarro', 'Jiménez',
    'Álvarez', 'Mendoza', 'Vega', 'Herrera', 'Flores', 'Rivera', 'Medina',
    'Delgado', 'Aguilar', 'Chávez', 'Guerrero', 'Rojas', 'Acosta', 'Molina',
    'Salazar', 'Contreras', 'Maldonado', 'Palacios', 'Valencia', 'Castillo'
  ];
  
  const participants = [];
  
  // Generar 3000 participantes
  for (let i = 1; i <= 3000; i++) {
    const randomNombre = nombres[Math.floor(Math.random() * nombres.length)];
    const randomApellido = apellidos[Math.floor(Math.random() * apellidos.length)];
    
    // Formato de factura SRI: 001-001-000000001
    const establecimiento = Math.floor(1 + Math.random() * 999).toString().padStart(3, '0');
    const puntoEmision = Math.floor(1 + Math.random() * 999).toString().padStart(3, '0');
    const secuencial = Math.floor(1 + Math.random() * 999999999).toString().padStart(9, '0');
    
    participants.push({
      id: i,
      name: `${randomNombre} ${randomApellido}`,
      ticketNumber: Math.floor(10000 + Math.random() * 90000).toString(),
      invoiceNumber: `${establecimiento}-${puntoEmision}-${secuencial}`
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