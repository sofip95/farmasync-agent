function renderProductGrid(products) {
    displayContainer.innerHTML = '';
    if (!products || products.length === 0) {
        showError("No encontré productos que coincidan con tu búsqueda.");
        return;
    }
    displayContainer.className = 'productos-grid';
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'producto';
        card.innerHTML = `
            <div class="producto-image"></div>
            <h3>${product.nombre}</h3>
            <p class="precio"><strong>$${product.precio}</strong></p>
            <p class="descripcion">${product.descripcion}</p>
            <button onclick="agregarCarrito('${product.nombre}')">Agregar al carrito</button>
        `;
        displayContainer.appendChild(card);
    });
}

async function processQuery(consulta) {
    showLoading();
    const dataFormat = await fetchData(consulta);
    
    if (dataFormat && dataFormat.result) {
        if (dataFormat.tool === "get_all_products") {
            if (Array.isArray(dataFormat.result)) {
                renderProductGrid(dataFormat.result);
            } else {
                showError("Recibí una respuesta inesperada del agente.");
            }
        } else if (dataFormat.tool === "get_product_by_name") {
            if (dataFormat.result) {
                renderProductGrid([dataFormat.result]); // Envolvemos el producto único en un array
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