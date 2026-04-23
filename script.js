/* --- CONFIGURACIÓN DE CONEXIÓN --- */
// URL de publicación en la web (CSV)
const URL_BASE = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRQPIxpWVhMn0NvBCI1_NVLD9cc7Yk3iqsTu1c2aJXpokd1R86pH1R77WWX0ClR3dP5Dq7rlB8tfuio/pub?output=csv";

// GIDs de cada hoja (Tema)
const GIDS = {
    2: "990874879", 3: "1711453863", 4: "1927285028", 5: "959381328", 6: "231419367",
    7: "919487249", 8: "1710258635", 9: "393049523", 10: "1245517020", 14: "917229204",
    15: "876627004", 16: "1969954777", 17: "1619511271", 18: "1587077710", 19: "1444582853",
    20: "695667951", 21: "553793814", 22: "886982703", 23: "1657034752", 24: "716705028",
    25: "1148093909"
};

const datosTemario = [
    { id: 2, cat: 'tema-naranja', nombre: 'TEMA 2. La concreción de los currículos en el marco del proyecto educativo del centro. Programación docente... Coordinación docente' },
    { id: 3, cat: 'tema-naranja', nombre: 'TEMA 3. La tutoría en la Educación Primaria. Apoyo y orientación. Colaboración familias. Funciones tutor. PAT.' },
    { id: 4, cat: 'tema-naranja', nombre: 'TEMA 4. La atención a la diversidad del alumnado. Medidas organizativas. ACNEAE.' },
    { id: 5, cat: 'tema-naranja', nombre: 'TEMA 5. La evaluación. Características, instrumentos. Promoción y refuerzo.' },
    { id: 6, cat: 'tema-amarillo', nombre: 'TEMA 6. Las tecnologías de la información y la comunicación. Aplicación en áreas.' },
    { id: 7, cat: 'tema-verde', nombre: 'TEMA 7. Área de Conocimiento del medio. Enfoque, características y propuestas.' },
    { id: 8, cat: 'tema-verde', nombre: 'TEMA 8. Construcción de la noción de tiempo histórico. Etapas y documentos.' },
    { id: 9, cat: 'tema-verde', nombre: 'TEMA 9. El entorno y su conservación. Ecosistemas.' },
    { id: 10, cat: 'tema-verde', nombre: 'TEMA 10. Fenómenos físicos y cambios químicos. Materia y energía.' },
    { id: 14, cat: 'tema-rojo', nombre: 'TEMA 14. Área de Lengua castellana y Literatura. Enfoque y competencias.' },
    { id: 15, cat: 'tema-rojo', nombre: 'TEMA 15. Reflexión sobre el lenguaje. Adquisición lectura y escritura.' },
    { id: 16, cat: 'tema-rojo', nombre: 'TEMA 16. Educación literaria. Biblioteca escolar y de aula.' },
    { id: 17, cat: 'tema-rojo', nombre: 'TEMA 17. Adquisición y desarrollo del lenguaje. Comprensión oral.' },
    { id: 18, cat: 'tema-rojo', nombre: 'TEMA 18. Proceso lector. Comprensión y fomento de la lectura.' },
    { id: 19, cat: 'tema-rojo', nombre: 'TEMA 19. Expresión escrita. Métodos y composición.' },
    { id: 20, cat: 'tema-azul', nombre: 'TEMA 20. Área de Matemáticas. Enfoque, características y competencias.' },
    { id: 21, cat: 'tema-azul', nombre: 'TEMA 21. Resolución de problemas. Clases y métodos.' },
    { id: 22, cat: 'tema-azul', nombre: 'TEMA 22. El aprendizaje de los números y el cálculo numérico.' },
    { id: 23, cat: 'tema-azul', nombre: 'TEMA 23. Las magnitudes y su medida. Unidades e instrumentos.' },
    { id: 24, cat: 'tema-azul', nombre: 'TEMA 24. Evolución de la percepción espacial. Geometría.' },
    { id: 25, cat: 'tema-azul', nombre: 'TEMA 25. Recogida, organización y representación de la información.' }
];

/* --- VARIABLES DE CONTROL --- */
let mensajeActual = null;
let estaPausado = false;
let listaLecturaPunto = [];
let indiceLecturaPunto = 0;
let modoLecturaPunto = false;

/* --- INICIALIZACIÓN --- */
function inicializar() {
    const grid = document.getElementById('grid-temas');
    if(!grid) return;
    grid.innerHTML = '';
    datosTemario.forEach(tema => {
        const btn = document.createElement('button');
        btn.className = `btn ${tema.cat}`;
        btn.innerText = tema.nombre;
        btn.onclick = () => cargarTema(tema);
        grid.appendChild(btn);
    });
}

async function cargarTema(temaObj) {
    document.getElementById('pantalla-menu').classList.add('hidden');
    document.getElementById('pantalla-tema').classList.remove('hidden');
    document.getElementById('titulo-tema-actual').innerText = temaObj.nombre;
    const contenedor = document.getElementById('contenedor-cascada');
    contenedor.innerHTML = '<p style="text-align:center; padding:20px;">Accediendo a la nube de Google...</p>';

    const urlFinal = URL_BASE.replace("output=csv", `gid=${GIDS[temaObj.id]}&output=csv`) + `&cache=${Date.now()}`;

    try {
        const response = await fetch(urlFinal);
        if (!response.ok) throw new Error("Error al obtener datos del Excel.");
        const csvText = await response.text();
        const filas = parsearCSV(csvText);
        const arbol = construirArbol(filas);
        renderizarCascada(arbol, contenedor);
    } catch (e) {
        contenedor.innerHTML = `<p style="color:red; text-align:center; padding:20px;">Error: ${e.message}</p>`;
    }
}

/* --- PROCESAMIENTO DE CSV Y ÁRBOL --- */
function parsearCSV(texto) {
    const lineas = texto.split(/\r?\n(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    return lineas.map(linea => {
        const cols = linea.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        return cols.map(c => c.replace(/^"|"$/g, '').trim());
    }).filter(cols => cols.length >= 4 && (cols[0] || cols[1] || cols[3]));
}

function construirArbol(filas) {
    const arbol = {};
    filas.forEach(f => {
        const [a, b, c, d, e] = f;
        if (!a) return;
        if (!arbol[a]) arbol[a] = {};
        const keyB = b || "_ROOT_";
        if (!arbol[a][keyB]) arbol[a][keyB] = {};
        const keyC = c || "_ROOT_";
        if (!arbol[a][keyB][keyC]) arbol[a][keyB][keyC] = [];
        if (d) arbol[a][keyB][keyC].push({ d, e });
    });
    return arbol;
}

/* --- RENDERIZADO VISUAL EN CASCADA --- */
function renderizarCascada(arbol, contenedor) {
    contenedor.innerHTML = '';
    Object.keys(arbol).forEach(a => {
        // NIVEL A: Punto Principal (Sticky)
        const btnA = document.createElement('button');
        btnA.className = 'btn sec-A ' + getColorClase(a);
        // Escapamos comillas simples para evitar errores en el onclick
        const tituloEscapado = a.replace(/'/g, "\\'");
        
        btnA.innerHTML = `
            <span>${a}</span>
            <div class="controles-punto">
                <button class="btn-punto" onclick="gestionarVozPunto(this, event, '${tituloEscapado}', 'play')">▶️</button>
                <button class="btn-punto" onclick="gestionarVozPunto(this, event, '${tituloEscapado}', 'pause')">⏸️</button>
                <button class="btn-punto" onclick="gestionarVozPunto(this, event, '${tituloEscapado}', 'stop')">⏹️</button>
            </div>
        `;

        const divB = document.createElement('div');
        divB.className = 'hidden';
        btnA.onclick = () => divB.classList.toggle('hidden');

        Object.keys(arbol[a]).forEach(b => {
            let targetContB = divB;
            if (b !== "_ROOT_") {
                const btnB = crearBotonNivel(b, 'btn nivel-B');
                const subDivC = document.createElement('div');
                subDivC.className = 'hidden';
                btnB.onclick = (ev) => { ev.stopPropagation(); subDivC.classList.toggle('hidden'); };
                divB.appendChild(btnB);
                divB.appendChild(subDivC);
                targetContB = subDivC;
            }

            Object.keys(arbol[a][b]).forEach(c => {
                let targetContC = targetContB;
                if (c !== "_ROOT_") {
                    const btnC = crearBotonNivel(c, 'btn nivel-C');
                    const subDivD = document.createElement('div');
                    subDivD.className = 'hidden';
                    btnC.onclick = (ev) => { ev.stopPropagation(); subDivD.classList.toggle('hidden'); };
                    targetContB.appendChild(btnC);
                    targetContB.appendChild(subDivD);
                    targetContC = subDivD;
                }
                dibujarTarjetasFinales(arbol[a][b][c], targetContC);
            });
        });

        contenedor.appendChild(btnA);
        contenedor.appendChild(divB);
    });
}

function crearBotonNivel(texto, clase) {
    const b = document.createElement('button');
    b.className = clase;
    b.innerText = texto;
    return b;
}

function dibujarTarjetasFinales(bloques, contenedor) {
    bloques.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bloque-final';
        card.innerHTML = `
            <span class="titulo-D">${item.d}</span>
            <div class="contenido-E">${item.e || ''}</div>
        `;
        contenedor.appendChild(card);
    });
}

function getColorClase(texto) {
    const t = texto.toLowerCase();
    if (t.includes('introducción')) return 'sec-intro';
    if (t.includes('conclusión')) return 'sec-concl';
    if (t.includes('bibliografía')) return 'sec-biblio';
    return 'sec-num';
}

/* --- SISTEMA DE VOZ CENTRALIZADO --- */
function gestionarVozPunto(btn, event, tituloTexto, accion) {
    event.stopPropagation();
    
    if (accion === 'stop') {
        window.speechSynthesis.cancel();
        modoLecturaPunto = false;
        estaPausado = false;
        document.querySelectorAll('.bloque-final').forEach(c => c.classList.remove('leyendo-ahora'));
        return;
    }
    
    if (accion === 'pause') {
        if (window.speechSynthesis.speaking && !estaPausado) {
            window.speechSynthesis.pause();
            estaPausado = true;
        }
        return;
    }
    
    if (accion === 'play') {
        if (estaPausado) {
            window.speechSynthesis.resume();
            estaPausado = false;
            return;
        }
        
        window.speechSynthesis.cancel();
        
        // Recopilamos todos los bloques de texto D/E dentro de este Punto A
        const items = [{ texto: tituloTexto, elemento: null }];
        const contenedorPadre = btn.closest('.sec-A').nextElementSibling;
        const tarjetas = contenedorPadre.querySelectorAll('.bloque-final');
        
        tarjetas.forEach(t => {
            items.push({ 
                texto: t.querySelector('.contenido-E').innerText, 
                elemento: t 
            });
        });

        if (items.length === 0) return;
        
        modoLecturaPunto = true;
        indiceLecturaPunto = 0;
        listaLecturaPunto = items;
        estaPausado = false;
        leerSiguienteDelPunto();
    }
}

function leerSiguienteDelPunto() {
    if (!modoLecturaPunto || indiceLecturaPunto >= listaLecturaPunto.length) {
        modoLecturaPunto = false;
        document.querySelectorAll('.bloque-final').forEach(c => c.classList.remove('leyendo-ahora'));
        return;
    }

    const item = listaLecturaPunto[indiceLecturaPunto];
    
    // Resaltado visual
    document.querySelectorAll('.bloque-final').forEach(c => c.classList.remove('leyendo-ahora'));
    if (item.elemento) {
        item.elemento.classList.add('leyendo-ahora');
        item.elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const mensaje = new SpeechSynthesisUtterance(item.texto);
    mensaje.lang = 'es-ES';
    mensaje.onend = () => {
        indiceLecturaPunto++;
        leerSiguienteDelPunto();
    };

    window.speechSynthesis.speak(mensaje);
}

function irAlMenu() {
    window.speechSynthesis.cancel();
    document.getElementById('pantalla-tema').classList.add('hidden');
    document.getElementById('pantalla-menu').classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', inicializar);
