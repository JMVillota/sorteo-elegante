// src/services/api.js

// NUEVA FUNCIÓN: Cargar participantes desde archivo JSON local
export const getParticipants = async () => {
  try {
    console.log('🔄 Cargando participantes desde archivo local...');
    const startTime = Date.now();
    
    const response = await fetch('./participantes.json');
    
    if (!response.ok) {
      throw new Error(`Error cargando participantes.json: ${response.status}`);
    }
    
    const data = await response.json();
    const endTime = Date.now();
    
    console.log(`✅ Participantes cargados desde JSON en ${endTime - startTime}ms`);
    console.log(`📊 Total participantes: ${data.length}`);
    
    const processedData = data.map((participant, index) => ({
      id: index + 1,
      name: participant.NCliente,
      ticketNumber: participant.Documento.replace('FC', ''),
      invoiceNumber: participant.Documento,
      vendedor: participant.Vendedor,
      ciudad: participant.Ciudad,
      fechaFormateada: participant.FechaFormateada || participant.FechaFactura?.split('T')[0] || 'N/A',
      cliente: participant.Cliente,
      valorSinIva: participant.ValorSinIva,
      totalFactura: participant.TotalFactura,
      direccion: participant.Direccion,
      telefono: participant.Telefono,
      parroquia: participant.Parroquia,
      zona: participant.Zona,
      codigo: participant.Codigo,
      codigoProvincia: participant.CodigoProvincia,
      provincia: participant.Provincia,
      codigoSPV: participant.Codigo_SPV,
      supervisor: participant.Supervisor
    }));
    
    console.log(`✅ Datos procesados: ${processedData.length} participantes válidos`);
    return processedData;
    
  } catch (error) {
    console.error('❌ Error cargando participantes desde JSON:', error);
    
    // Si falla el JSON local, mostrar error específico
    console.error('💥 No se pudo cargar participantes.json - Verifique que el archivo esté en /public/participantes.json');
    return [];
  }
};

// NUEVA FUNCIÓN: Cargar premios desde archivo JSON local
export const getPrizes = async () => {
  try {
    console.log('🔄 Cargando premios desde archivo local...');
    const startTime = Date.now();

    const response = await fetch('./premios.json');

    if (!response.ok) {
      throw new Error(`Error cargando premios.json: ${response.status}`);
    }
    
    const data = await response.json();
    const endTime = Date.now();
    
    console.log(`✅ Premios cargados desde JSON en ${endTime - startTime}ms`);
    console.log(`🎁 Total premios: ${data.length}`);
    
    const processedData = data.map((prize) => ({
      id: prize.Id,
      name: prize.NombrePremio,
      cantidad: prize.Cantidad,
      cantidadOriginal: prize.Cantidad,
      codigoGanador: prize.CodigoGanador,
      imagen: prize.Imagen // La imagen ya viene en base64 desde el JSON
    }));
    
    console.log(`✅ Premios procesados: ${processedData.length} premios válidos`);
    
    // Mostrar resumen de premios
    const totalUnits = processedData.reduce((sum, prize) => sum + prize.cantidad, 0);
    console.log(`🎯 Total unidades a sortear: ${totalUnits}`);
    
    return processedData;
    
  } catch (error) {
    console.error('❌ Error cargando premios desde JSON:', error);
    console.error('💥 No se pudo cargar premios.json - Verifique que el archivo esté en /public/premios.json');
    return [];
  }
};

// Función para verificar que ambos archivos JSON están disponibles
export const checkLocalFiles = async () => {
  try {
    const [participantsResponse, prizesResponse] = await Promise.all([
      fetch('/participantes.json'),
      fetch('/premios.json')
    ]);
    
    const results = {
      participantsAvailable: participantsResponse.ok,
      prizesAvailable: prizesResponse.ok,
      bothAvailable: participantsResponse.ok && prizesResponse.ok
    };
    
    console.log('📁 Estado de archivos JSON:', results);
    return results;
  } catch (error) {
    console.error('❌ Error verificando archivos JSON:', error);
    return {
      participantsAvailable: false,
      prizesAvailable: false,
      bothAvailable: false
    };
  }
};

// Función para obtener estadísticas completas del sistema
export const getSystemStats = async () => {
  try {
    console.log('📊 Calculando estadísticas del sistema...');
    
    const [participants, prizes] = await Promise.all([
      getParticipants(),
      getPrizes()
    ]);
    
    if (participants.length === 0 || prizes.length === 0) {
      throw new Error('No se pudieron cargar los datos necesarios');
    }
    
    // Estadísticas de participantes
    const participantStats = {
      total: participants.length,
      cities: [...new Set(participants.map(p => p.ciudad))].sort(),
      citiesCount: [...new Set(participants.map(p => p.ciudad))].length,
      vendors: [...new Set(participants.map(p => p.vendedor))].sort(),
      vendorsCount: [...new Set(participants.map(p => p.vendedor))].length,
      totalValue: participants.reduce((sum, p) => sum + (p.totalFactura || 0), 0),
      averageValue: participants.reduce((sum, p) => sum + (p.totalFactura || 0), 0) / participants.length,
      dateRange: {
        earliest: participants.reduce((earliest, p) => 
          p.fechaFormateada < earliest ? p.fechaFormateada : earliest, 
          participants[0]?.fechaFormateada || ''
        ),
        latest: participants.reduce((latest, p) => 
          p.fechaFormateada > latest ? p.fechaFormateada : latest, 
          participants[0]?.fechaFormateada || ''
        )
      }
    };
    
    // Estadísticas de premios
    const prizeStats = {
      totalPrizeTypes: prizes.length,
      totalUnits: prizes.reduce((sum, p) => sum + p.cantidad, 0),
      prizeDetails: prizes.map(p => ({
        name: p.name,
        units: p.cantidad,
        hasImage: !!p.imagen
      }))
    };
    
    const systemStats = {
      participants: participantStats,
      prizes: prizeStats,
      system: {
        readyToStart: true,
        totalDrawsNeeded: prizeStats.totalUnits * 3, // 2 perdedores + 1 ganador por unidad
        estimatedDuration: `${Math.ceil(prizeStats.totalUnits * 0.5)} minutos`
      }
    };
    
    console.log('✅ Estadísticas calculadas:', systemStats);
    return systemStats;
    
  } catch (error) {
    console.error('❌ Error calculando estadísticas:', error);
    return null;
  }
};

// Función de utilidad para validar datos
export const validateData = async () => {
  try {
    const [participants, prizes] = await Promise.all([
      getParticipants(),
      getPrizes()
    ]);
    
    const validation = {
      participants: {
        loaded: participants.length > 0,
        count: participants.length,
        hasRequiredFields: participants.every(p => p.name && p.invoiceNumber && p.ciudad),
        duplicateInvoices: participants.length - [...new Set(participants.map(p => p.invoiceNumber))].length
      },
      prizes: {
        loaded: prizes.length > 0,
        count: prizes.length,
        hasRequiredFields: prizes.every(p => p.name && p.cantidad > 0),
        totalUnits: prizes.reduce((sum, p) => sum + p.cantidad, 0)
      }
    };
    
    validation.isValid = validation.participants.loaded && 
                        validation.prizes.loaded && 
                        validation.participants.hasRequiredFields && 
                        validation.prizes.hasRequiredFields;
    
    console.log('🔍 Validación de datos:', validation);
    
    if (validation.participants.duplicateInvoices > 0) {
      console.warn(`⚠️ Se encontraron ${validation.participants.duplicateInvoices} facturas duplicadas`);
    }
    
    return validation;
  } catch (error) {
    console.error('❌ Error validando datos:', error);
    return { isValid: false, error: error.message };
  }
};

// Función para precargar las imágenes de los premios
export const preloadPrizeImages = async () => {
  try {
    const prizes = await getPrizes();
    const imageLoadPromises = [];
    
    prizes.forEach(prize => {
      if (prize.imagen && prize.imagen.trim()) {
        const img = new Image();
        const imageData = prize.imagen.startsWith('data:image') 
          ? prize.imagen 
          : `data:image/jpeg;base64,${prize.imagen}`;
        
        const loadPromise = new Promise((resolve) => {
          img.onload = () => {
            console.log(`✅ Imagen precargada para: ${prize.name}`);
            resolve(true);
          };
          img.onerror = () => {
            console.warn(`⚠️ Error precargando imagen para: ${prize.name}`);
            resolve(false);
          };
          img.src = imageData;
        });
        
        imageLoadPromises.push(loadPromise);
      }
    });
    
    if (imageLoadPromises.length > 0) {
      console.log(`🖼️ Precargando ${imageLoadPromises.length} imágenes de premios...`);
      const results = await Promise.all(imageLoadPromises);
      const successCount = results.filter(r => r).length;
      console.log(`✅ ${successCount}/${imageLoadPromises.length} imágenes precargadas exitosamente`);
    }
    
  } catch (error) {
    console.error('❌ Error precargando imágenes:', error);
  }
};