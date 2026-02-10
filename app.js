const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRDT76hxjB5fjAnmD7MQmZElz0Fh33Gl0I0Em32YlSucr9toCypjyqSaSykrtkQFrXAta32bkQH_noe/pub?gid=1376617034&single=true&output=csv';

function irA(categoria) {
    document.getElementById('inicio').classList.add('oculto');
    document.getElementById('catalogo').classList.remove('oculto');
    document.getElementById('titulo-categoria').textContent = 
        categoria === 'plantas' ? '🌱 Catálogo de Plantas' : '🍹 Catálogo de Cócteles';
    
    cargarProductos(categoria);
}

function volverInicio() {
    document.getElementById('catalogo').classList.add('oculto');
    document.getElementById('inicio').classList.remove('oculto');
}

async function cargarProductos(categoria) {
    const grid = document.getElementById('grid-productos');
    grid.innerHTML = '<p style="color: white; text-align: center; font-size: 1.5rem;">Cargando...</p>';
    
    try {
        const cached = localStorage.getItem('productos_plantas');
        if (cached) {
            renderizarProductos(JSON.parse(cached));
        }
        
        const response = await fetch(CSV_URL);
        const text = await response.text();
        
        const lines = text.split('\n').slice(1);
        const productos = lines.map(line => {
            const cols = line.split(',');
            return {
                nombre: cols[1]?.replace(/"/g, '') || '',
                cientifico: cols[2]?.replace(/"/g, '') || '',
                foto: cols[4]?.replace(/"/g, '') || '',
                descripcion: cols[5]?.replace(/"/g, '') || '',
                precio: cols[7]?.replace(/"/g, '') || ''
            };
        }).filter(p => p.nombre && p.foto);
        
        localStorage.setItem('productos_plantas', JSON.stringify(productos));
        renderizarProductos(productos);
        
    } catch (error) {
        console.error(error);
        grid.innerHTML = '<p style="color: white; text-align: center;">Error: ' + error.message + '</p>';
    }
}

function renderizarProductos(productos) {
    const grid = document.getElementById('grid-productos');
    
    if (productos.length === 0) {
        grid.innerHTML = '<p style="color: white; text-align: center;">No hay productos</p>';
        return;
    }
    
    grid.innerHTML = productos.map(p => `
        <div class="producto-card">
            <img src="${p.foto}" alt="${p.nombre}" loading="lazy">
            <div class="producto-info">
                <div class="producto-nombre">${p.nombre}</div>
                ${p.cientifico ? `<div class="producto-cientifico">${p.cientifico}</div>` : ''}
                <div class="producto-descripcion">${p.descripcion}</div>
                ${p.precio ? `<div class="producto-precio">$${p.precio}</div>` : ''}
            </div>
        </div>
    `).join('');
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/catalogo_silvestra/sw.js');
}
