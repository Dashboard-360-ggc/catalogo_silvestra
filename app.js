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

function parseCSV(text) {
    const lines = text.split('\n');
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const cols = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < lines[i].length; j++) {
            const char = lines[i][j];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                cols.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        cols.push(current.trim());
        result.push(cols);
    }
    
    return result;
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
        
        const rows = parseCSV(text);
        const productos = rows.map(cols => ({
            nombre: cols[1] || '',
            cientifico: cols[2] || '',
            foto: cols[4] || '',
            descripcion: cols[5] || '',
            precio: cols[7] || ''
        })).filter(p => p.nombre && p.foto);
        
        localStorage.setItem('productos_plantas', JSON.stringify(productos));
        renderizarProductos(productos);
        
    } catch (error) {
        console.error(error);
        grid.innerHTML = '<p style="color: white;">Error: ' + error.message + '</p>';
    }
}

function renderizarProductos(productos) {
    const grid = document.getElementById('grid-productos');
    
    if (productos.length === 0) {
        grid.innerHTML = '<p style="color: white;">No hay productos</p>';
        return;
    }
    
    grid.innerHTML = productos.map(p => `
        <div class="producto-card">
            <img src="${p.foto}" alt="${p.nombre}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x250?text=Sin+Imagen'">
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
    navigator.serviceWorker.register('/catalogo_silvestra/sw.js').catch(() => {});
}
