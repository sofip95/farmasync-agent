// --- LÓGICA DEL FRONTEND ---
const logContainer = document.getElementById('log-container');
const displayContainer = document.getElementById('product-display');
const chatInput = document.getElementById('chat-input');

/**
 * Realiza la llamada a la API del backend.
 */
async function fetchData(consulta) {
    try {
        const response = await fetch('http://localhost:5000/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ consulta: consulta })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.data; // Accedemos a data porque la API devuelve {data: resultado}
    } catch (error) {
        console.error('Error:', error);
        return `Error al procesar tu consulta: ${error.message}`;
    }
}

// Asegúrate de que el formulario tiene un event listener
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#query-form');
    const input = document.querySelector('#query-input');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const consulta = input.value.trim();
        
        if (consulta) {
            await processQuery(consulta);
            input.value = ''; // Limpiar el input después del envío
        }
    });
});

function showLoading() {
    displayContainer.innerHTML = `<p class="loading-text">Consultando al agente...</p>`;
}

function showError(message) {
    displayContainer.innerHTML = `<p class="error-text">⚠️ ${message}</p>`;
}

// Añade un mensaje DEL AGENTE al log
function addAgentMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'log-message';
    messageDiv.textContent = text;
    logContainer.appendChild(messageDiv);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// Añade un mensaje DEL USUARIO al log
function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'user-message';
    messageDiv.textContent = text;
    logContainer.appendChild(messageDiv);
    logContainer.scrollTop = logContainer.scrollHeight;
}

function renderSalesTable(sales) {
    displayContainer.innerHTML = '';
    if (!sales || sales.length === 0) {
        showError("No encontré ventas que coincidan con tu búsqueda.");
        return;
    }
    const table = document.createElement('table');
    table.className = 'sales-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID Venta</th>
                <th>ID Vendedor</th>
                <th>ID Cliente</th>
                <th>Fecha Venta</th>
                <th>Total</th>
                <th>Acción</th>
            </tr>
        </thead>
        <tbody>
            ${sales.map(sale => `
                <tr>
                    <td>${sale.id_venta}</td>
                    <td>${sale.id_vendedor}</td>
                    <td>${sale.id_cliente}</td>
                    <td>${new Date(sale.fecha_venta).toLocaleDateString()}</td>
                    <td>$${sale.total}</td>
                    <td><button onclick="verDetalles('${sale.id_venta}')">Ver Detalles</button></td>
                </tr>
            `).join('')}
        </tbody>
    `;
    displayContainer.appendChild(table);
}

function renderSaleDetail(sale) {
    displayContainer.innerHTML = '';
    if (!sale) {
         showError('La venta solicitada no fue encontrada.');
         return;
    }
    displayContainer.className = 'sale-detail';
    displayContainer.innerHTML = `
        <h3>Detalles de Venta ${sale.id_venta}</h3>
        <p><strong>ID Vendedor:</strong> ${sale.id_vendedor}</p>
        <p><strong>ID Cliente:</strong> ${sale.id_cliente}</p>
        <p><strong>Fecha Venta:</strong> ${new Date(sale.fecha_venta).toLocaleDateString()}</p>
        <p><strong>Total:</strong> $${sale.total}</p>
    `;
}

function renderSaleDetails(details) {
    displayContainer.innerHTML = '';
    if (!details || details.length === 0) {
        showError("No encontré detalles para esta venta.");
        return;
    }
    const table = document.createElement('table');
    table.className = 'sales-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID Detalle</th>
                <th>ID Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
            </tr>
        </thead>
        <tbody>
            ${details.map(detail => `
                <tr>
                    <td>${detail.id_detalle}</td>
                    <td>${detail.id_producto}</td>
                    <td>${detail.cantidad}</td>
                    <td>$${detail.precio_unitario}</td>
                    <td>$${detail.subtotal}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    displayContainer.appendChild(table);
}

function renderSalesHistory(history) {
    displayContainer.innerHTML = '';
    if (!history || history.length === 0) {
        showError("No encontré historial de ventas.");
        return;
    }
    const table = document.createElement('table');
    table.className = 'sales-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID Historial</th>
                <th>ID Venta</th>
                <th>Fecha Venta</th>
                <th>Tipo Venta</th>
                <th>ID Usuario</th>
                <th>Observación</th>
            </tr>
        </thead>
        <tbody>
            ${history.map(h => `
                <tr>
                    <td>${h.id_historial}</td>
                    <td>${h.id_venta}</td>
                    <td>${new Date(h.fecha_venta).toLocaleDateString()}</td>
                    <td>${h.tipo_venta}</td>
                    <td>${h.id_usuario}</td>
                    <td>${h.observacion}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    displayContainer.appendChild(table);
}

/**
 * Procesa la consulta del usuario, llama a la API y renderiza la respuesta.
 * @param {string} consulta - El texto ingresado por el usuario.
 */
async function processQuery(consulta) {
    showLoading();
    const dataFormat = await fetchData(consulta);
    
    if (dataFormat && dataFormat.result) {
        if (dataFormat.tool === "get_all_sales") {
            if (Array.isArray(dataFormat.result)) {
                renderSalesTable(dataFormat.result);
            } else {
                showError("Recibí una respuesta inesperada del agente.");
            }
        } else if (dataFormat.tool === "get_sale_details") {
            if (Array.isArray(dataFormat.result)) {
                renderSaleDetails(dataFormat.result);
            } else {
                showError("Recibí una respuesta inesperada del agente.");
            }
        } else if (dataFormat.tool === "get_sales_history") {
            if (Array.isArray(dataFormat.result)) {
                renderSalesHistory(dataFormat.result);
            } else {
                showError("Recibí una respuesta inesperada del agente.");
            }
        } else {
            displayContainer.innerHTML = '';
            addAgentMessage(dataFormat.result || "No entendí tu consulta.");
        }
    } else if (typeof dataFormat === 'string') {
        displayContainer.innerHTML = '';
        addAgentMessage(dataFormat);
    } else {
        showError("Respuesta inesperada del agente.");
    }
}

// --- ESTADO INICIAL ---
function startConversation() {
    addAgentMessage("Hola, soy tu asistente de farmacia para administradores. ¿Qué te gustaría consultar?");
}

startConversation();

// Function
function verDetalles(id) {
    addUserMessage(`Ver detalles de venta ${id}`);
    processQuery(`detalles de la venta ${id}`);
}

function reordenar(nombre) {
    alert('Se ha solicitado reordenar: ' + nombre);
}
