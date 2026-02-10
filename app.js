const SHEET_ID = '1cVxDqnYc4vRFFumx38M3UwHYwC8gBtFlqFqd9J26pSc';
const SHEET_NAME_PLANTAS = 'CATALOGO_PLANTAS';
const SHEET_NAME_COCTELES = 'CATALOGO_COCTELES'; // Crear después

let productosCache = {
    plantas: [],
    cocteles: []
};

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
        if (productosCache[categoria].length > 0) {
            renderizarProductos(productosCache[categoria]);
            return;
        }
        
        const sheetName = categoria === 'plantas' ? SHEET_NAME_PLANTAS : SHEET_NAME_COCTELES;
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
        
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substring(47).slice(0, -2));
        
        const rows = json.table.rows;
        const productos = rows.slice(1).map(row => ({
            nombre: row.c[1]?.v || '',
            cientifico: row.c[2]?.v || '',
            foto: row.c[4]?.v || '',
            descripcion: row.c[5]?.v || '',
            precio: row.c[7]?.v || ''
        })).filter(p => p.nombre && p.foto);
        
        productosCache[categoria] = productos;
        localStorage.setItem(`productos_${categoria}`, JSON.stringify(productos));
        
        renderizarProductos(productos);
        
    } catch (error) {
        const cached = localStorage.getItem(`productos_${categoria}`);
        if (cached) {
            renderizarProductos(JSON.parse(cached));
        } else {
            grid.innerHTML = '<p style="color: white; text-align: center;">Error al cargar productos</p>';
        }
    }
}

function renderizarProductos(productos) {
    const grid = document.getElementById('grid-productos');
    
    if (productos.length === 0) {
        grid.innerHTML = '<p style="color: white; text-align: center;">No hay productos disponibles</p>';
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
