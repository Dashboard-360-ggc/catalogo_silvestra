const CSV_URL_PLANTAS = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRDT76hxjB5fjAnmD7MQmZElz0Fh33Gl0I0Em32YlSucr9toCypjyqSaSykrtkQFrXAta32bkQH_noe/pub?gid=1376617034&single=true&output=csv';

const CSV_URL_COCTELES = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRDT76hxjB5fjAnmD7MQmZElz0Fh33Gl0I0Em32YlSucr9toCypjyqSaSykrtkQFrXAta32bkQH_noe/pub?gid=948135332&single=true&output=csv';

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
        const cached = localStorage.getItem(`productos_${categoria}`);
        if (cached) {
            renderizarProductos(JSON.parse(cached));
        }
        
        const csvUrl = categoria === 'plantas' ? CSV_URL_PLANTAS : CSV_URL_COCTELES;
        const response = await fetch(csvUrl);
        const text = await response.text();
        
        const rows = parseCSV(text);
        const productos = rows.map(cols => {
            if (categoria === 'cocteles') {
                return {
                    nombre: cols[0] || '',
                    foto: cols[1] || '',
                    cientifico: '',
                    descripcion: '',
                    precio: ''
                };
            } else {
                return {
                    nombre: cols[1] || '',
                    cientifico: cols[2] || '',
                    foto: cols[4] || '',
                    descripcion: cols[5] || '',
                    precio: cols[7] || ''
                };
            }
        }).filter(p => p.nombre && p.foto);
        
        localStorage.setItem(`productos_${categoria}`, JSON.stringify(productos));
        renderizarProductos(productos);
        
    } catch (error) {
        console.error(error);
        grid.innerHTML = '<p style="color: white;">Error: ' + error.message + '</p>';
    }
}

let imagenesActuales = [];
let indiceActual = 0;

function renderizarProductos(productos) {
    const grid = document.getElementById('grid-productos');
    
    if (productos.length === 0) {
        grid.innerHTML = '<p style="color: white;">No hay productos</p>';
        return;
    }
    
    imagenesActuales = productos.map(p => p.foto);
    
    grid.innerHTML = productos.map((p, index) => `
        <div class="producto-card" onclick="abrirLightbox(${index})">
            <img src="${p.foto}" alt="${p.nombre}" loading="lazy">
        </div>
    `).join('');
    
    // Crear lightbox si no existe
    if (!document.getElementById('lightbox')) {
        const lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <button class="lightbox-close" onclick="cerrarLightbox()">×</button>
            <button class="lightbox-nav lightbox-prev" onclick="navegarLightbox(-1)">‹</button>
            <div class="lightbox-content">
                <img id="lightbox-img" class="lightbox-img" src="" alt="">
            </div>
            <button class="lightbox-nav lightbox-next" onclick="navegarLightbox(1)">›</button>
        `;
        document.body.appendChild(lightbox);
    }
}

function abrirLightbox(index) {
    indiceActual = index;
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    img.src = imagenesActuales[index];
    lightbox.classList.add('active');
}

function cerrarLightbox() {
    document.getElementById('lightbox').classList.remove('active');
}

function navegarLightbox(direccion) {
    indiceActual += direccion;
    if (indiceActual < 0) indiceActual = imagenesActuales.length - 1;
    if (indiceActual >= imagenesActuales.length) indiceActual = 0;
    document.getElementById('lightbox-img').src = imagenesActuales[indiceActual];
}
