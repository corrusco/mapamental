const URL_BASE = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR6XujajlsE5zknJSIU7uzHCOlawQtQxHyU-GKlkcpMhNI4DzTOZjOeXYoAcdh6LXT3YyKSGiX_IakR/pub?output=csv";

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
    { id: 7, cat: 'tema-verde', nombre: 'TEMA 7. Área de Conocimiento del medio. Enfoque, competencias y relación curricular.' },
    { id: 8, cat: 'tema-verde', nombre: 'TEMA 8. Tiempo histórico. Etapas históricas. Documentos e intervención educativa.' },
    { id: 9, cat: 'tema-verde', nombre: 'TEMA 9. El entorno y su conservación. Ecosistemas. Acción humana.' },
    { id: 10, cat: 'tema-verde', nombre: 'TEMA 10. Fenómenos físicos y cambios químicos. Materia y energía.' },
    { id: 14, cat: 'tema-rojo', nombre: 'TEMA 14. Área de Lengua castellana y Literatura. Competencia comunicativa.' },
    { id: 15, cat: 'tema-rojo', nombre: 'TEMA 15. Reflexión sobre el lenguaje. Adquisición lectura y escritura.' },
    { id: 16, cat: 'tema-rojo', nombre: 'TEMA 16. Educación literaria. Biblioteca escolar y de aula.' },
    { id: 17, cat: 'tema-rojo', nombre: 'TEMA 17. Adquisición y desarrollo del lenguaje. Comunicación oral.' },
    { id: 18, cat: 'tema-rojo', nombre: 'TEMA 18. Proceso lector. Comprensión y fomento de la lectura.' },
    { id: 19, cat: 'tema-rojo', nombre: 'TEMA 19. Expresión escrita. Métodos y composición de textos.' },
    { id: 20, cat: 'tema-azul', nombre: 'TEMA 20. Área de Matemáticas. Enfoque y competencias.' },
    { id: 21, cat: 'tema-azul', nombre: 'TEMA 21. Resolución de problemas. Métodos y estrategias.' },
    { id: 22, cat: 'tema-azul', nombre: 'TEMA 22. Números y cálculo. Sistemas de numeración.' },
    { id: 23, cat: 'tema-azul', nombre: 'TEMA 23. Magnitudes y su medida. Estimación.' },
    { id: 24, cat: 'tema-azul', nombre: 'TEMA 24. Percepción espacial. Geometría.' },
    { id: 25, cat: 'tema-azul', nombre: 'TEMA 25. Tratamiento de la información. Estadística y TIC.' }
];

let mensajeActual = null;
let estaPausado = false;

function inicializar() {
    const grid = document.getElementById('grid-temas');
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
    contenedor.innerHTML = '<p style="text-align:center">Cargando contenido...</p>';

    try {
        const response = await fetch(`${URL_BASE}&gid=${GIDS[temaObj.id]}`);
        const csvText = await response.text();
        const filas = parsearCSV(csvText);
        const arbol = construirArbol(filas);
        renderizarCascada(arbol, contenedor);
    } catch (e) {
        contenedor.innerHTML = '<p>Error al cargar los datos.</p>';
    }
}

function parsearCSV(texto) {
    const lineas = texto.split(/\r?\n(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    return lineas.map(linea => {
        const cols = linea.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        return cols.map(c => c.replace(/^"|"$/g, '').trim());
    }).filter(cols => cols.length >= 5 && (cols[0] || cols[3]));
}

function construirArbol(filas) {
    const arbol = {};
    filas.forEach(f => {
        const [a, b, c, d, e] = f;
        if (!arbol[a]) arbol[a] = {};
        if (!arbol[a][b]) arbol[a][b] = {};
        if (!arbol[a][b][c]) arbol[a][b][c] = [];
        if (d) arbol[a][b][c].push({ d, e });
    });
    return arbol;
}

function renderizarCascada(arbol, contenedor) {
    contenedor.innerHTML = '';
    Object.keys(arbol).forEach(a => {
        const btnA = crearBotonNivel(a, 'sec-A ' + getColorClase(a));
        const divB = document.createElement('div');
        divB.className = 'hidden';

        Object.keys(arbol[a]).forEach(b => {
            const containerB = b === "" ? divB : document.createElement('div');
            if (b !== "") {
                const btnB = crearBotonNivel(b, 'nivel-B');
                const divC = document.createElement('div');
                divC.className = 'hidden';
                btnB.onclick = () => divC.classList.toggle('hidden');
                containerB.appendChild(btnB);
                containerB.appendChild(divC);
                
                Object.keys(arbol[a][b]).forEach(c => {
                    const containerC = c === "" ? divC : document.createElement('div');
                    if (c !== "") {
                        const btnC = crearBotonNivel(c, 'nivel-C');
                        const divD = document.createElement('div');
                        divD.className = 'hidden';
                        btnC.onclick = () => divD.classList.toggle('hidden');
                        containerC.appendChild(btnC);
                        containerC.appendChild(divD);
                        dibujarBloquesFinales(arbol[a][b][c], divD);
                    } else {
                        dibujarBloquesFinales(arbol[a][b][c], divC);
                    }
                    if (c !== "") containerB.lastChild.appendChild(containerC);
                });
            } else {
                // Si B está vacío, miramos si C también
                Object.keys(arbol[a][b]).forEach(c => {
                    dibujarBloquesFinales(arbol[a][b][c], divB);
                });
            }
        });

        btnA.onclick = () => divB.classList.toggle('hidden');
        contenedor.appendChild(btnA);
        contenedor.appendChild(divB);
    });
}

function crearBotonNivel(texto, clase) {
    const b = document.createElement('button');
    b.className = 'btn ' + clase;
    b.innerText = texto;
    return b;
}

function dibujarBloquesFinales(bloques, contenedor) {
    bloques.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bloque-final';
        card.innerHTML = `
            <span class="titulo-D">${item.d}</span>
            <div class="contenido-E">${item.e}</div>
            <div class="controles-voz">
                <button class="btn-voz" onclick="gestionarVoz(this, 'play')">▶️</button>
                <button class="btn-voz" onclick="gestionarVoz(this, 'pause')">⏸️</button>
                <button class="btn-voz" onclick="gestionarVoz(this, 'stop')">⏹️</button>
            </div>
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

function gestionarVoz(btn, accion) {
    const texto = btn.closest('.bloque-final').querySelector('.contenido-E').innerText;

    if (accion === 'stop') {
        window.speechSynthesis.cancel();
        estaPausado = false;
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
        const mensaje = new SpeechSynthesisUtterance(texto);
        mensaje.lang = 'es-ES';
        window.speechSynthesis.speak(mensaje);
    }
}

function irAlMenu() {
    window.speechSynthesis.cancel();
    document.getElementById('pantalla-tema').classList.add('hidden');
    document.getElementById('pantalla-menu').classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', inicializar);
