let datosGlobales = null;
let paginas = { personas: 1, habilidades: 1, social: 1 };
const porPagina = 9;

document.querySelectorAll('.btn-nav').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-nav').forEach(b => b.classList.remove('activo'));
        document.querySelectorAll('.seccion-app').forEach(s => s.classList.remove('activa'));
        btn.classList.add('activo');
        document.getElementById(btn.dataset.seccion).classList.add('activa');
    });
});

async function cargarDatos() {
    try {
        const respuesta = await fetch('DatosP3R.json');
        datosGlobales = await respuesta.json();
        
        // Llenar filtros
        const listaPersonas = datosGlobales["01 - Persona List"].filter(p => p.Persona);
        const arcanos = [...new Set(listaPersonas.map(p => p.Arcana))].sort();
        const selectArc = document.getElementById('filtro-arcano');
        arcanos.forEach(a => { if(a) selectArc.innerHTML += `<option value="${a}">${a}</option>`; });

        const listaHabs = datosGlobales["12 - Skills"].filter(h => h.Name);
        const tiposH = [...new Set(listaHabs.map(h => h.Type))].sort();
        const selectTipoH = document.getElementById('filtro-tipo-habilidad');
        tiposH.forEach(t => { if(t) selectTipoH.innerHTML += `<option value="${t}">${t}</option>`; });

        // Eventos
        document.getElementById('buscador-personas').oninput = () => { paginas.personas = 1; filtrarPersonas(); };
        document.getElementById('filtro-arcano').onchange = () => { paginas.personas = 1; filtrarPersonas(); };
        document.getElementById('orden-personas').onchange = () => { paginas.personas = 1; filtrarPersonas(); };
        document.getElementById('buscador-habilidades').oninput = () => { paginas.habilidades = 1; filtrarHabilidades(); };
        document.getElementById('filtro-tipo-habilidad').onchange = () => { paginas.habilidades = 1; filtrarHabilidades(); };

        // Paginación
        document.getElementById('next-personas').onclick = () => { paginas.personas++; filtrarPersonas(); };
        document.getElementById('prev-personas').onclick = () => { paginas.personas--; filtrarPersonas(); };
        document.getElementById('next-habilidades').onclick = () => { paginas.habilidades++; filtrarHabilidades(); };
        document.getElementById('prev-habilidades').onclick = () => { paginas.habilidades--; filtrarHabilidades(); };
        document.getElementById('next-social').onclick = () => { paginas.social++; filtrarSocial(); };
        document.getElementById('prev-social').onclick = () => { paginas.social--; filtrarSocial(); };

        filtrarPersonas();
        filtrarHabilidades();
        filtrarSocial();
    } catch (e) { console.error(e); }
}

function render(lista, pagina, idGrid, idPrev, idNext, idInfo, creador) {
    const total = Math.ceil(lista.length / porPagina);
    const inicio = (pagina - 1) * porPagina;
    const items = lista.slice(inicio, inicio + porPagina);
    document.getElementById(idInfo).innerText = `Página ${pagina} de ${total || 1}`;
    document.getElementById(idPrev).disabled = (pagina === 1);
    document.getElementById(idNext).disabled = (pagina === total || total === 0);
    const grid = document.getElementById(idGrid);
    grid.innerHTML = "";
    items.forEach(i => grid.innerHTML += creador(i));
}

// Función auxiliar para formatear la afinidad
function fmtAfin(val) {
    if (!val || val === "-") return '<span class="afin-val">-</span>';
    let clase = "";
    if (val === "Wk") clase = "val-wk";
    if (val === "Res") clase = "val-res";
    if (val === "Nu" || val === "Null") clase = "val-null";
    return `<span class="afin-val ${clase}">${val}</span>`;
}

function filtrarPersonas() {
    let l = datosGlobales["01 - Persona List"].filter(p => p.Persona);
    const b = document.getElementById('buscador-personas').value.toLowerCase();
    const a = document.getElementById('filtro-arcano').value;
    const o = document.getElementById('orden-personas').value;

    if (b) l = l.filter(p => p.Persona.toLowerCase().includes(b));
    if (a !== 'todos') l = l.filter(p => p.Arcana === a);
    l.sort((x,y) => o === 'nivel-asc' ? x.Lvl - y.Lvl : y.Lvl - x.Lvl);

    render(l, paginas.personas, 'grid-personas', 'prev-personas', 'next-personas', 'info-personas', (p) => `
        <div class="tarjeta">
            <h3>${p.Persona} (Nv. ${p.Lvl})</h3>
            <span class="etiqueta">${p.Arcana}</span>
            <div class="afinidades-grid">
                <div class="afin-item">PHY ${fmtAfin(p.Slash)}</div>
                <div class="afin-item">FIR ${fmtAfin(p.Fire)}</div>
                <div class="afin-item">ICE ${fmtAfin(p.Ice)}</div>
                <div class="afin-item">ELC ${fmtAfin(p.Elec)}</div>
                <div class="afin-item">WND ${fmtAfin(p.Wind)}</div>
                <div class="afin-item">LGT ${fmtAfin(p.Light)}</div>
                <div class="afin-item">DRK ${fmtAfin(p.Dark)}</div>
            </div>
        </div>
    `);
}

function filtrarHabilidades() {
    let l = datosGlobales["12 - Skills"].filter(h => h.Name);
    const b = document.getElementById('buscador-habilidades').value.toLowerCase();
    const t = document.getElementById('filtro-tipo-habilidad').value;
    if (b) l = l.filter(h => h.Name.toLowerCase().includes(b));
    if (t !== 'todos') l = l.filter(h => h.Type === t);
    render(l, paginas.habilidades, 'grid-habilidades', 'prev-habilidades', 'next-habilidades', 'info-habilidades', (h) => `
        <div class="tarjeta">
            <h3>${h.Name}</h3>
            <span class="etiqueta">${h.Type}</span>
            <p style="font-size:0.75rem; color:#94a3b8; margin-top:10px;">${h.Effect || 'N/A'}</p>
        </div>
    `);
}

function filtrarSocial() {
    const l = datosGlobales["24 - Social Links Availability"].filter(s => s.Character);
    render(l, paginas.social, 'grid-social', 'prev-social', 'next-social', 'info-social', (s) => `
        <div class="tarjeta">
            <h3>${s.Character}</h3>
            <span class="etiqueta">${s.Arcana}</span>
            <p style="font-size:0.8rem; margin-top:10px;">Ubicación: ${s.Location || '?'}</p>
        </div>
    `);
}

window.onload = cargarDatos;