// Variables globales y estado
const chatMessages = document.getElementById('chat-messages');
const tableContainer = document.getElementById('tableContainer');
const chatInput = document.getElementById('chat-input');
const state = {
    isLoading: false,
    currentView: null
};

// Funciones de API para administración
async function fetchAdminAPI(message) {
    try {
        const response = await fetch('http://127.0.0.1:5000/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ consulta: message })
        });
        
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Respuesta del servidor:', data);
        
        if (!data || !data.data) {
            throw new Error('Respuesta inválida del servidor');
        }
        
        return data;
    } catch (error) {
        console.error('Error en fetchChatbotResponse:', error);
        return {
            data: {
                result: null,
                tool: null,
                error: error.message
            }
        };
    }
}

// Funciones de UI para mensajes y carga
function addMessage(text, isUser = false) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'user-message' : 'agent-message';
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showLoading(container) {
    const loader = document.createElement('div');
    loader.className = 'loading-spinner';
    container.appendChild(loader);
}

function showError(container, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    container.appendChild(errorDiv);
}

// Función principal para crear tablas
function createTable(data, type) {
    console.log('Iniciando createTable con tipo:', type);
    console.log('Datos recibidos:', data);

    const container = document.getElementById('tableContainer');
    container.innerHTML = ''; // Clear existing content
    
    // Si no hay datos, mostrar mensaje
    if (!data || !Array.isArray(data) || data.length === 0) {
        const noDataDiv = document.createElement('div');
        noDataDiv.className = 'no-data';
        noDataDiv.innerHTML = `
            <svg class="no-data-icon" viewBox="0 0 24 24">
                <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
            </svg>
            <p>No se encontraron ${type === 'productos' ? 'productos' : 'datos'}.</p>
        `;
        container.appendChild(noDataDiv);
        return;
    }
    
    // Detectar tipo si no está especificado
    if (!type && data[0]) {
        if ('nombre' in data[0] || 'precio' in data[0]) {
            type = 'productos';
        }
    }

    // Create title based on table type
    const title = document.createElement('h2');
    title.className = 'table-title';
    switch(type) {
        case 'ventas':
            title.textContent = 'Registro de Ventas';
            break;
        case 'historial':
            title.textContent = 'Historial de Ventas';
            break;
        case 'detalle':
            title.textContent = 'Detalle de Venta';
            break;
        case 'productos':
            title.textContent = 'Productos Encontrados';
            break;
        default:
            title.textContent = 'Resultados';
    }
    container.appendChild(title);

    if (state.isLoading) {
        showLoading(container);
        return;
    }

    // Verificar si hay datos para mostrar
    if (!Array.isArray(data) || data.length === 0 || !data[0]) {
        const noDataDiv = document.createElement('div');
        noDataDiv.className = 'no-data';
        noDataDiv.innerHTML = `
            <svg class="no-data-icon" viewBox="0 0 24 24">
                <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
            </svg>
            <p>No se encontraron datos.</p>
        `;
        container.appendChild(noDataDiv);
        return;
    }

    // Crear tabla y sus elementos
    const table = document.createElement('table');
    table.className = 'table';
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Configuración de encabezados según el tipo de tabla
    let headerConfig;
    console.log('Configurando encabezados para tipo:', type);
    switch(type) {
        case 'productos':
            headerConfig = [
                { display: 'ID', key: 'id' },
                { display: 'Nombre', key: 'nombre' },
                { display: 'Descripción', key: 'descripcion' },
                { display: 'Precio', key: 'precio' },
                { display: 'Stock', key: 'stock' }
            ];
            break;
        case 'ventas':
        case 'detalle':
            headerConfig = [
                { display: 'ID Venta', key: 'id_venta' },
                { display: 'Vendedor', key: 'id_vendedor' },
                { display: 'Cliente', key: 'id_cliente' },
                { display: 'Fecha', key: 'fecha_venta' },
                { display: 'Total', key: 'total' }
            ];
            break;
        case 'historial':
            headerConfig = [
                { display: 'ID Historial', key: 'id_historial' },
                { display: 'ID Venta', key: 'id_venta' },
                { display: 'Fecha', key: 'fecha_venta' },
                { display: 'Tipo', key: 'tipo_venta' },
                { display: 'Usuario', key: 'id_usuario' },
                { display: 'Observación', key: 'observacion' }
            ];
            break;
        default:
            headerConfig = Object.keys(data[0]).map(key => ({
                display: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
                key: key
            }));
    }

    // Crear encabezados
    headerConfig.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header.display;
        headerRow.appendChild(th);
    });

    // No se necesitan acciones, solo consulta

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Crear el cuerpo de la tabla
    const tbody = document.createElement('tbody');
    data.forEach(item => {
        const row = document.createElement('tr');
        
        headerConfig.forEach(header => {
            const td = document.createElement('td');
            let value = item[header.key];
            
            // Formatear el valor según su tipo
            if (typeof value === 'number' && !Number.isInteger(value)) {
                td.textContent = value.toLocaleString('es-CO', { 
                    style: 'currency', 
                    currency: 'COP' 
                });
            } else if (value instanceof Date || (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/))) {
                const fecha = new Date(value);
                if (!isNaN(fecha)) {
                    td.textContent = fecha.toLocaleString('es-CO');
                } else {
                    td.textContent = value;
                }
            } else {
                td.textContent = value || '-';
            }
            row.appendChild(td);
        });

        // No se necesitan botones de acción
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}

// Función para manejar las respuestas del chatbot
async function handleAdminResponse(response) {
    console.log('Procesando respuesta administrativa:', response);
    
    tableContainer.innerHTML = '';
    state.isLoading = false;
    
    if (!response || !response.data) {
        addMessage('Error al procesar la solicitud', false);
        showError('No se pudo procesar la solicitud. Inténtalo de nuevo.');
        return;
    }
    
    const data = response.data;
    state.currentView = data.tool; // Actualizar la vista actual
    
    if (!response || !response.data) {
        addMessage('Lo siento, hubo un error al procesar tu solicitud.', false);
        showError(container, 'Error al procesar la solicitud. Por favor, intenta de nuevo.');
        return;
    }

    try {
        const data = response.data;
        
        if (data && data.result) {
            console.log('DATOS RECIBIDOS:', data);
            console.log('TIPO DE RESULTADO:', typeof data.result);
            console.log('CONTENIDO DEL RESULTADO:', data.result);
            
            // Determinar el tipo de vista
            let type = 'default';
            if (data.tool === 'get_sales') type = 'ventas';
            if (data.tool === 'get_sales_history') type = 'historial';
            if (data.tool === 'get_sale_by_id' || data.tool === 'get_sale_details') type = 'detalle';
            
            console.log('TIPO DE VISTA:', type);

            // Preparar los datos para la tabla
            let tableData;
            if (data.tool === 'get_sale_by_id') {
                if (data.result) {
                    const ventaFormateada = {
                        'id_venta': data.result.id_venta,
                        'id_vendedor': data.result.id_vendedor,
                        'id_cliente': data.result.id_cliente,
                        'fecha_venta': data.result.fecha_venta,
                        'total': parseFloat(data.result.total)
                    };
                    tableData = [ventaFormateada];
                } else {
                    tableData = [];
                }
            } else {
                tableData = Array.isArray(data.result) ? data.result : [];
            }

            console.log('DATOS FORMATEADOS:', tableData);
            
            // Crear la tabla con los datos
            createTable(tableData, type);
            
            // Mostrar mensaje apropiado según el tipo de datos y la cantidad
            if (tableData && tableData.length > 0) {
                if (type === 'productos') {
                    addMessage(`Se encontraron ${tableData.length} producto(s):`, false);
                } else {
                    addMessage('Aquí tienes la información solicitada:', false);
                }
            } else {
                if (type === 'productos') {
                    addMessage('No se encontraron productos con ese nombre.', false);
                } else {
                    addMessage('No se encontraron resultados.', false);
                }
            }
        } else if (typeof data === 'string') {
            addMessage(data, false);
        } else {
            addMessage('No se encontraron resultados para tu consulta.', false);
        }
    } catch (error) {
        console.error('Error procesando respuesta:', error);
        addMessage('Ocurrió un error al procesar la respuesta.', false);
        showError(container, 'Error al procesar los datos. Por favor, intenta de nuevo.');
    }
}

// No se necesitan funciones de gestión de ventas

// No se necesitan diálogos ni notificaciones

// Inicialización y eventos
document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.getElementById('send-message');
    
    // Funciones de envío de mensajes

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            addMessage(message, true);
            chatInput.value = '';
            
            const container = document.getElementById('tableContainer');
            state.isLoading = true;
            createTable(null, 'default'); // Mostrar spinner de carga
            
            try {
                const response = await fetchAdminAPI(message);
                handleAdminResponse(response);
            } catch (error) {
                console.error('Error enviando mensaje:', error);
                state.isLoading = false;
                addMessage('Error al enviar el mensaje. Por favor, intenta de nuevo.', false);
                showError(container, 'Error de comunicación con el servidor.');
            }
        }
    }

    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    sendButton.addEventListener('click', sendMessage);

    // Mensaje inicial
    addMessage('¡Hola! Puedo ayudarte a consultar: Todas las ventas, Venta por ID, Detalle de una venta o Historial de ventas. ¿Qué deseas consultar?', false);
});
