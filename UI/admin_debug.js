// Función auxiliar para formatear valores
function formatValue(value, type = 'text') {
    if (value === null || value === undefined) return '-';
    
    switch (type) {
        case 'currency':
            return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
        case 'date':
            try {
                const fecha = new Date(value);
                if (!isNaN(fecha)) {
                    return fecha.toLocaleString('es-CO');
                }
            } catch (e) {}
            return value;
        default:
            return value.toString();
    }
}

// Función para crear una fila de la tabla
function createTableRow(item, columnConfig) {
    const row = document.createElement('tr');
    
    columnConfig.forEach(column => {
        const td = document.createElement('td');
        const value = item[column.key];
        
        // Determinar el tipo de formato
        let formatType = 'text';
        if (column.key.includes('total') || column.key.includes('precio')) {
            formatType = 'currency';
        } else if (column.key.includes('fecha')) {
            formatType = 'date';
        }
        
        td.textContent = formatValue(value, formatType);
        row.appendChild(td);
    });
    
    return row;
}

// Configuración de columnas por tipo de vista
const TABLE_CONFIG = {
    ventas: [
        { key: 'id_venta', display: 'ID Venta' },
        { key: 'id_vendedor', display: 'Vendedor' },
        { key: 'id_cliente', display: 'Cliente' },
        { key: 'fecha_venta', display: 'Fecha' },
        { key: 'total', display: 'Total' }
    ],
    detalle: [
        { key: 'id_venta', display: 'ID Venta' },
        { key: 'id_vendedor', display: 'Vendedor' },
        { key: 'id_cliente', display: 'Cliente' },
        { key: 'fecha_venta', display: 'Fecha' },
        { key: 'total', display: 'Total' }
    ],
    historial: [
        { key: 'id_historial', display: 'ID Historial' },
        { key: 'id_venta', display: 'ID Venta' },
        { key: 'fecha_venta', display: 'Fecha' },
        { key: 'tipo_venta', display: 'Tipo' },
        { key: 'id_usuario', display: 'Usuario' },
        { key: 'observacion', display: 'Observación' }
    ]
};

// Función principal para crear la tabla
function createTableDebug(data, type) {
    console.log('Creando tabla con:', { type, data });
    
    const container = document.getElementById('tableContainer');
    container.innerHTML = '';
    
    const title = document.createElement('h2');
    title.className = 'table-title';
    title.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    container.appendChild(title);
    
    if (!Array.isArray(data) || data.length === 0) {
        const noData = document.createElement('div');
        noData.className = 'no-data';
        noData.innerHTML = '<p>No se encontraron datos.</p>';
        container.appendChild(noData);
        return;
    }
    
    // Obtener la configuración de columnas
    const columnConfig = TABLE_CONFIG[type] || Object.keys(data[0]).map(key => ({
        key: key,
        display: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
    }));
    
    // Crear la tabla
    const table = document.createElement('table');
    table.className = 'table';
    
    // Crear encabezados
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    columnConfig.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column.display;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Crear cuerpo de la tabla
    const tbody = document.createElement('tbody');
    data.forEach(item => {
        tbody.appendChild(createTableRow(item, columnConfig));
    });
    table.appendChild(tbody);
    container.appendChild(table);
}

// Función para manejar la respuesta del chatbot con el nuevo sistema
function handleChatbotResponseDebug(response) {
    console.log('Respuesta completa:', response);
    
    if (!response || !response.data) {
        console.error('Respuesta inválida');
        return;
    }
    
    const { tool, result } = response.data;
    console.log('Herramienta:', tool);
    console.log('Resultado:', result);
    
    // Determinar el tipo de vista
    let type = 'default';
    if (tool === 'get_sales') type = 'ventas';
    if (tool === 'get_sales_history') type = 'historial';
    if (tool === 'get_sale_by_id') type = 'detalle';
    
    // Preparar los datos
    let tableData = result;
    if (tool === 'get_sale_by_id' && result && !Array.isArray(result)) {
        tableData = [result];
    }
    
    // Crear la tabla
    createTableDebug(tableData, type);
}