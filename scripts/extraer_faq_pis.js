// Extrae preguntas y respuestas del Manual Resolución de dudas frecuentes PIS.
// Ejecutar desde la raíz del proyecto:
// node scripts/extraer_faq_pis.js --write

const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const indice = JSON.parse(fs.readFileSync(
  path.join(raiz, "Bilbioteca", "indice_biblioteca.json"), "utf8"
));
const manual = indice.find(function(documento) {
  return /manual resoluci[oó]n de dudas frecuentes pis/i.test(documento.nombre);
});

if (!manual || !Array.isArray(manual.paginas) || !manual.paginas.some(Boolean)) {
  throw new Error("No se encontró texto extraíble del Manual de dudas frecuentes PIS.");
}

function limpiar(texto) {
  return texto.replace(/\s+/g, " ").trim();
}

function clasificacionPagina(numeroPagina) {
  if (numeroPagina === 5) return { tema: "0. Introducción", subtema: "0.1 Plan de Integración Social" };
  if (numeroPagina === 6) return { tema: "0. Introducción", subtema: "0.2 Actividades del PIS" };
  if (numeroPagina <= 15) return { tema: "1. Visita a la obra", subtema: "1.1 Proceso constructivo y entrega de viviendas" };
  if (numeroPagina <= 21) return { tema: "2. Uso, cuidado y mantención", subtema: "2.1 Garantías y modificaciones de las viviendas" };
  if (numeroPagina === 23) return { tema: "2. Uso, cuidado y mantención", subtema: "2.2 Sello verde" };
  if (numeroPagina <= 24) return { tema: "2. Uso, cuidado y mantención", subtema: "2.3 Gas de las viviendas" };
  if (numeroPagina <= 27) return { tema: "3. Derechos y deberes", subtema: "3.1 Patrimonio reservado de la mujer casada" };
  if (numeroPagina <= 31) return { tema: "3. Derechos y deberes", subtema: "3.2 Administración del condominio" };
  if (numeroPagina <= 34) return { tema: "3. Derechos y deberes", subtema: "3.3 Asambleas de copropietarios/as" };
  if (numeroPagina <= 36) return { tema: "3. Derechos y deberes", subtema: "3.4 Comité de Administración" };
  if (numeroPagina <= 37) return { tema: "3. Derechos y deberes", subtema: "3.5 Reglamento de Copropiedad" };
  if (numeroPagina <= 39) return { tema: "3. Derechos y deberes", subtema: "3.6 Gastos comunes" };
  if (numeroPagina <= 45) return { tema: "4. Organización comunitaria", subtema: "4.1 Organizaciones comunitarias" };
  return { tema: "4. Organización comunitaria", subtema: "4.2 Seguridad comunitaria" };
}

// El PDF tiene dos columnas; pdftools preserva una separación amplia de espacios.
function separarColumnas(pagina) {
  const izquierda = [];
  const derecha = [];

  pagina.split(/\r?\n/).forEach(function(linea) {
    const coincidencia = linea.match(/^(.*?)(?: {3,})(.*)$/);
    if (coincidencia) {
      izquierda.push(coincidencia[1].trim());
      derecha.push(coincidencia[2].trim());
    } else {
      izquierda.push(linea.trim());
    }
  });

  return [izquierda, derecha];
}

function bloquesDeColumna(lineas) {
  const resultado = [];
  let pregunta = "";
  let respuesta = [];
  let leyendoPregunta = false;

  function guardar() {
    const preguntaLimpia = limpiar(pregunta);
    const respuestaLimpia = limpiar(respuesta.join(" "));
    if (preguntaLimpia && respuestaLimpia) {
      resultado.push({ pregunta: preguntaLimpia, respuesta: respuestaLimpia });
    }
    pregunta = "";
    respuesta = [];
    leyendoPregunta = false;
  }

  lineas.forEach(function(linea) {
    const texto = linea.trim();
    if (!texto || /EQUIDAD URBANA CONSULTORA|^\d{2}$/.test(texto)) return;

    const iniciaPregunta = /^[A-Z]\.?\s*¿/.test(texto);
    if (iniciaPregunta) {
      guardar();
      pregunta = texto.replace(/^[A-Z]\.?\s*/, "");
      leyendoPregunta = !pregunta.includes("?");
      return;
    }

    if (!pregunta) return;
    if (leyendoPregunta) {
      pregunta += " " + texto;
      leyendoPregunta = !pregunta.includes("?");
    } else {
      respuesta.push(texto);
    }
  });

  guardar();
  return resultado;
}

const preguntas = [];
manual.paginas.forEach(function(pagina, indicePagina) {
  const numeroPagina = indicePagina + 1;
  const clasificacion = clasificacionPagina(numeroPagina);
  separarColumnas(pagina).forEach(function(columna) {
    bloquesDeColumna(columna).forEach(function(bloque) {
      preguntas.push({
        tema: clasificacion.tema,
        subtema: clasificacion.subtema,
        pregunta: bloque.pregunta,
        respuesta: bloque.respuesta,
        pagina: numeroPagina,
        documento: manual.nombre,
        ruta: manual.ruta
      });
    });
  });
});

const sinDuplicados = preguntas.filter(function(item, indice, lista) {
  return lista.findIndex(function(otro) {
    return otro.pregunta === item.pregunta;
  }) === indice;
});

// En las páginas 45 a 47, una respuesta continúa entre columnas y páginas.
// Se incorporan explícitamente para conservar las cuatro preguntas del subtema 4.2.
const preguntasSeguridad = [
  {
    tema: "4. Organización comunitaria",
    subtema: "4.2 Seguridad comunitaria",
    pregunta: "¿Cuáles son los pilares de la seguridad comunitaria?",
    respuesta: "Prevención comunitaria: participación activa de la comunidad y compromiso para solucionar problemáticas de seguridad y disminuir oportunidades de delito. Trabajo en red: generar estrategias con instituciones para coordinar acciones junto a la comunidad vecinal. Prevención situacional: reconfigurar participativamente los espacios para disminuir condiciones de riesgo y transformarlos en lugares de encuentro comunitario.",
    pagina: 46,
    documento: manual.nombre,
    ruta: manual.ruta
  },
  {
    tema: "4. Organización comunitaria",
    subtema: "4.2 Seguridad comunitaria",
    pregunta: "¿Por qué es importante este enfoque de la seguridad?",
    respuesta: "Porque destaca la importancia de promover la confianza y las redes dentro de la comunidad vecinal para prevenir el delito mediante la organización comunitaria y el trabajo en red con instituciones, superando un enfoque centrado solo en lo punitivo y la desconfianza.",
    pagina: 46,
    documento: manual.nombre,
    ruta: manual.ruta
  },
  {
    tema: "4. Organización comunitaria",
    subtema: "4.2 Seguridad comunitaria",
    pregunta: "¿Qué recomendaciones son importantes de incorporar en torno a la seguridad?",
    respuesta: "Mantener una comunidad activa con comunicación efectiva; capacitar al personal del condominio para actuar ante emergencias; contar con control de acceso en las entradas; conocer y revisar el protocolo o plan de emergencia entregado por la inmobiliaria; y cumplir el reglamento y las normas para resguardar la vivienda y la comunidad vecinal.",
    pagina: 47,
    documento: manual.nombre,
    ruta: manual.ruta
  }
];

const faqCompleta = sinDuplicados.concat(preguntasSeguridad.filter(function(item) {
  return !sinDuplicados.some(function(existente) {
    return existente.pregunta === item.pregunta;
  });
}));

const salida = JSON.stringify(faqCompleta, null, 2);
if (process.argv.includes("--write")) {
  fs.writeFileSync(path.join(raiz, "data", "faq_pis.json"), salida, "utf8");
  console.log("FAQ creada con " + faqCompleta.length + " preguntas.");
} else {
  console.log(salida);
}
