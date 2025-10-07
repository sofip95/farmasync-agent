// Variables globales y utilidades de la UI
const chatMessages = document.getElementById('chat-messages');
const displayContainer = document.getElementById('product-display');
const chatInput = document.getElementById('chat-input');
const productContainer = document.getElementById('productContainer');

// Funciones principales
async function fetchChatbotResponse(message) {
    try {
        console.log('Enviando mensaje al chatbot:', message);
        const response = await fetch('http://127.0.0.1:5000/query', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ consulta: message })
        });

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Respuesta del chatbot:', responseData);
        return responseData;
    } catch (error) {
        console.error('Error al comunicarse con el chatbot:', error);
        return null;
    }
}

function addMessage(text, isUser = false) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'user-message' : 'agent-message';
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function createProductCards(products) {
    const container = document.getElementById('productContainer');
    container.innerHTML = ''; // Clear existing content
    
    console.log('Creando tarjetas de productos:', products);
    
    if (!products || products.length === 0) {
        container.innerHTML = '<p>No se encontraron productos.</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'producto';
        
        // Asegurarse de que los valores existan, sino usar valores por defecto
        const name = product.nombre || product.name || 'Sin nombre';
        const price = product.precio || product.price || 0;
        const description = product.descripcion || product.ingredients || 'Sin descripción';

        card.innerHTML = `
            <div class="producto-image"></div>
            <h3>${name}</h3>
            <p class="descripcion">${description}</p>
            <p class="precio"><strong>$${typeof price === 'number' ? price.toLocaleString('es-CO') : price}</strong></p>
            <button onclick="agregarCarrito('${name}')">Agregar al carrito</button>
        `;
        container.appendChild(card);
    });
}

function agregarCarrito(nombre) {
    alert(nombre + ' agregado al carrito!');
}

async function handleChatbotResponse(response) {
    console.log('Manejando respuesta del chatbot:', response);

    if (!response) {
        addMessage('Lo siento, hubo un error al procesar tu solicitud.', false);
        return;
    }

    // Si la respuesta completa es un string, mostrarlo como mensaje
    if (typeof response === 'string') {
        addMessage(response, false);
        return;
    }

    // Manejar la estructura de respuesta esperada
    const data = response.data;
    console.log('Datos de la respuesta:', data);

    if (!data) {
        addMessage('Respuesta del servidor no válida', false);
        return;
    }

    // Si data es un string, mostrarlo como mensaje
    if (typeof data === 'string') {
        addMessage(data, false);
        return;
    }

    // Manejar respuestas con resultados de productos
    if (data.result && Array.isArray(data.result)) {
        console.log('Productos encontrados:', data.result);
        createProductCards(data.result);
        addMessage('Aquí tienes los productos solicitados:', false);
        return;
    }

    // Si hay un mensaje en la respuesta, mostrarlo
    if (data.message) {
        addMessage(data.message, false);
    } else {
        // Si no hay mensaje pero hay algún contenido en data, mostrarlo como mensaje
        addMessage('Respuesta recibida del servidor', false);
    }
}

// Inicialización y eventos
document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-message');

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            addMessage(message, true);
            chatInput.value = '';
            const response = await fetchChatbotResponse(message);
            handleChatbotResponse(response);
        }
    }

    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    sendButton.addEventListener('click', sendMessage);

    // Initial greeting
    addMessage('¡Hola! ¿En qué puedo ayudarte hoy?', false);
});

// Agregar evento al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página cargada');
    console.log('Chat messages:', chatMessages);
    console.log('Display container:', displayContainer);
    console.log('Chat input:', chatInput);

    // Evento para el chat
    chatInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter' && chatInput.value.trim() !== '') {
            console.log('Enter presionado con mensaje:', chatInput.value);
            const mensaje = chatInput.value.trim();
            chatInput.value = '';
            addMessage(mensaje, true);
            await processQuery(mensaje);
        }
    });

    // Mensaje inicial
    addMessage('¡Hola! Puedo ayudarte a buscar productos. Prueba pidiendo "dame los productos" o busca uno específico.', false);
});

// Funciones de API
async function fetchClientAPI(message) {
    try {
        console.log('Enviando mensaje al chatbot:', message);
        const response = await fetch('http://127.0.0.1:5000/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ consulta: message })
        });
        
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log('Respuesta raw del servidor:', responseData);
        
        if (!responseData) {
            throw new Error('Respuesta vacía del servidor');
        }
        
        // Analizar la estructura de la respuesta
        console.log('Tipo de respuesta:', typeof responseData);
        console.log('Keys en la respuesta:', Object.keys(responseData));
        
        // Si hay una propiedad data, la usamos
        if (responseData.data) {
            console.log('Contenido de data:', responseData.data);
            return responseData.data;
        }
        
        // Si no hay data pero hay result, lo retornamos
        if (responseData.result) {
            console.log('Contenido de result:', responseData.result);
            return responseData.result;
        }
        
        // Si es un array directo, lo retornamos
        if (Array.isArray(responseData)) {
            console.log('Respuesta es un array:', responseData);
            return responseData;
        }
        
        console.log('Retornando responseData completo:', responseData);
        return responseData;
        
    } catch (error) {
        console.error('Error en fetchClientAPI:', error);
        showError('Error al comunicarse con el servidor');
        return null;
    }
}

// Funciones de UI
function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'user-message' : 'agent-message';
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showLoading() {
    if (displayContainer) {
        displayContainer.innerHTML = '<div class="loading-spinner">Cargando...</div>';
        console.log('Mostrando loading spinner');
    }
}

function showError(message) {
    displayContainer.innerHTML = `
        <div class="error-message">
            <p>⚠️ ${message}</p>
        </div>
    `;
}

// Renderizado de productos
function renderProductGrid(products) {
    console.log('Iniciando renderProductGrid con:', products);
    displayContainer.innerHTML = '';
    
    if (!Array.isArray(products)) {
        console.error('renderProductGrid: se esperaba un array, se recibió:', typeof products);
        showError("Error al mostrar los productos");
        return;
    }
    
    if (products.length === 0) {
        console.log('No hay productos para mostrar');
        showError("No encontré productos que coincidan con tu búsqueda.");
        return;
    }
    
    console.log('Creando grid de productos:', products);
    displayContainer.className = 'productos-grid';
    
    products.forEach(product => {
        console.log('Procesando producto para render:', product);
        const card = document.createElement('div');
        card.className = 'producto';
        
        // Procesar precio si existe
        let precioFormateado = '0';
        if (product.precio) {
            let precio = product.precio;
            if (typeof precio === 'string') {
                // Remover cualquier caracter que no sea número o punto
                precio = precio.replace(/[^0-9.]/g, '');
                precio = parseFloat(precio);
            }
            if (!isNaN(precio)) {
                precioFormateado = precio.toLocaleString('es-CO');
            }
        }
        
        // Asegurarse de que los campos existan
        const nombre = product.nombre ? product.nombre.trim() : 'Producto sin nombre';
        const descripcion = product.descripcion ? product.descripcion.trim() : 'Sin descripción';
        
        card.innerHTML = `
            <div class="producto-image"></div>
            <h3>${nombre}</h3>
            <p class="descripcion">${descripcion}</p>
            <p class="precio">$${precioFormateado}</p>
            <button>Ver detalles</button>
        `;
        displayContainer.appendChild(card);
    });
}

// Inicialización y eventos
document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.getElementById('send-message');

    // Manejar envío con Enter
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && chatInput.value.trim()) {
            const message = chatInput.value.trim();
            addMessage(message, true);
            processQuery(message);
            chatInput.value = '';
        }
    });

    // Manejar envío con botón
    if (sendButton) {
        sendButton.addEventListener('click', function() {
            if (chatInput.value.trim()) {
                const message = chatInput.value.trim();
                addMessage(message, true);
                processQuery(message);
                chatInput.value = '';
            }
        });
    }

    // Mensaje inicial
    addMessage('¡Hola! Puedo ayudarte a buscar productos. Puedes pedirme "todos los productos" o buscar uno específico por nombre.', false);
});

// Manejo de datos y renderizado
async function processQuery(consulta) {
    console.log('1. Iniciando processQuery con:', consulta);
    
    try {
        showLoading();
        const response = await fetchClientAPI(consulta);
        console.log('2. Respuesta del servidor:', response);
        
        if (!response) {
            throw new Error('No hay respuesta del servidor');
        }
        
        let productos = [];
        
        // Función auxiliar para crear un producto válido
        const crearProducto = (data) => {
            if (typeof data === 'object' && data !== null) {
                return {
                    nombre: data.nombre || '',
                    descripcion: data.descripcion || '',
                    precio: data.precio || 0,
                    stock: data.stock || 0
                };
            }
            return null;
        };
        
        if (typeof response === 'object') {
            console.log('3a. Respuesta es un objeto');
            
            // Caso 1: Respuesta tiene propiedad result
            if (response.result) {
                console.log('3b. Tiene propiedad result:', response.result);
                if (Array.isArray(response.result)) {
                    productos = response.result.map(crearProducto).filter(Boolean);
                } else {
                    const producto = crearProducto(response.result);
                    if (producto) productos = [producto];
                }
            }
            // Caso 2: Es un producto individual en la raíz
            else if (response.nombre || response.descripcion) {
                console.log('3c. Es un producto individual:', response);
                const producto = crearProducto(response);
                if (producto) productos = [producto];
            }
            // Caso 3: Tiene propiedad data
            else if (response.data) {
                console.log('3d. Tiene propiedad data:', response.data);
                if (Array.isArray(response.data)) {
                    productos = response.data.map(crearProducto).filter(Boolean);
                } else {
                    const producto = crearProducto(response.data);
                    if (producto) productos = [producto];
                }
            }
        } else if (Array.isArray(response)) {
            console.log('3e. Respuesta es un array directamente');
            productos = response.map(crearProducto).filter(Boolean);
        }
        
        console.log('4. Productos procesados:', productos);
        
        if (!Array.isArray(productos)) {
            console.error('Error: productos no es un array:', productos);
            throw new Error('Formato de respuesta inválido');
        }
        
        if (productos.length === 0) {
            showError('No se encontraron productos');
            addMessage('No encontré productos para mostrar', false);
            return;
        }
        
        console.log('5. Intentando renderizar productos...');
        renderProductGrid(productos);
        console.log('6. Renderizado completado');
        addMessage('Aquí tienes los productos encontrados:', false);
        
    } catch (error) {
        console.error('Error en processQuery:', error);
        showError(error.message);
        addMessage('Lo siento, hubo un error al procesar tu consulta.', false);
    }
}