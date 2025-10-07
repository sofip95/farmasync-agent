document.addEventListener('DOMContentLoaded', function() {
    const clienteBtn = document.getElementById('cliente-btn');
    const adminBtn = document.getElementById('admin-btn');
    const clienteSection = document.getElementById('cliente-section');
    const adminSection = document.getElementById('admin-section');

    // Data
    const productos = [
        { nombre: 'Paracetamol 500mg', precio: 5000, descripcion: 'Alivia dolor y fiebre.' },
        { nombre: 'Ibuprofeno 400mg', precio: 6500, descripcion: 'Reduce inflamación y dolor.' }
    ];

    const inventario = [
        { nombre: 'Vitamina C 1g', stock: 3, proveedor: 'Proveedor B' },
        { nombre: 'Amoxicilina 500mg', stock: 5, proveedor: 'Proveedor A' }
    ];

    // Populate products
    const productosGrid = document.getElementById('productos-grid');
    productos.forEach(item => {
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto';
        productoDiv.innerHTML = `
            <div class="producto-image"></div>
            <h3>${item.nombre}</h3>
            <p class="precio"><strong>$${item.precio}</strong></p>
            <p class="descripcion">${item.descripcion}</p>
            <button onclick="agregarCarrito('${item.nombre}')">Agregar al carrito</button>
        `;
        productosGrid.appendChild(productoDiv);
    });

    // Populate inventory
    const inventarioTbody = document.getElementById('inventario-tbody');
    inventario.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.nombre}</td>
            <td>${p.stock}</td>
            <td>${p.proveedor}</td>
            <td><button onclick="reordenar('${p.nombre}')">Reordenar</button></td>
        `;
        inventarioTbody.appendChild(tr);
    });

    // Navigation
    clienteBtn.addEventListener('click', function() {
        clienteSection.classList.remove('hidden');
        adminSection.classList.add('hidden');
        clienteBtn.classList.add('active');
        adminBtn.classList.remove('active');
    });

    adminBtn.addEventListener('click', function() {
        adminSection.classList.remove('hidden');
        clienteSection.classList.add('hidden');
        adminBtn.classList.add('active');
        clienteBtn.classList.remove('active');
    });
});

// Functions
function agregarCarrito(nombre) {
    alert(nombre + ' agregado al carrito!');
}

function reordenar(nombre) {
    alert('Se ha solicitado reordenar: ' + nombre);
}
