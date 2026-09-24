// Extrae preguntas y respuestas del Manual Resolución de dudas frecuentes PIS.
// Ejecutar: node scripts/extraer_faq_pis_completa.js --write
// El PDF está diagramado a dos columnas. Las respuestas pueden continuar en la
// segunda columna o en la página siguiente; por eso se procesa de forma continua.

const fs = require("fs");
const path = require("path");
const raiz = path.resolve(__dirname, "..");
const indice = JSON.parse(fs.readFileSync(path.join(raiz, "Bilbioteca", "indice_biblioteca.json"), "utf8"));
const manual = indice.find(function(documento) {
  return /manual resoluci[oó]n de dudas frecuentes pis/i.test(documento.nombre);
});

if (!manual || !Array.isArray(manual.paginas) || !manual.paginas.some(Boolean)) {
  throw new Error("No se encontró texto extraíble del Manual de dudas frecuentes PIS.");
}

const subtemas = {
  "0.1": { tema: "0. Introducción", subtema: "0.1 Introducción al Plan de Integración Social" },
  "0.2": { tema: "0. Introducción", subtema: "0.2 Actividades del PIS" },
  "1.1": { tema: "1. Visita a la obra", subtema: "1.1 Proceso constructivo de la obra" },
  "1.2": { tema: "1. Visita a la obra", subtema: "1.2 Aspectos generales de entrega de viviendas" },
  "1.3": { tema: "1. Visita a la obra", subtema: "1.3 Pasos el día de la entrega" },
  "2.1": { tema: "2. Uso, cuidado y mantención", subtema: "2.1 Garantías y modificaciones de las viviendas" },
  "2.2": { tema: "2. Uso, cuidado y mantención", subtema: "2.2 Sello verde" },
  "2.3": { tema: "2. Uso, cuidado y mantención", subtema: "2.3 Gas de las viviendas" },
  "3.1": { tema: "3. Derechos y deberes", subtema: "3.1 Patrimonio reservado de la mujer casada" },
  "3.2": { tema: "3. Derechos y deberes", subtema: "3.2 Administración del condominio" },
  "3.3": { tema: "3. Derechos y deberes", subtema: "3.3 Asambleas de copropietarios/as" },
  "3.4": { tema: "3. Derechos y deberes", subtema: "3.4 Comité de Administración" },
  "3.5": { tema: "3. Derechos y deberes", subtema: "3.5 Reglamento de copropiedad" },
  "3.6": { tema: "3. Derechos y deberes", subtema: "3.6 Gastos comunes" },
  "4.1": { tema: "4. Organización comunitaria", subtema: "4.1 Organizaciones comunitarias" },
  "4.2": { tema: "4. Organización comunitaria", subtema: "4.2 Seguridad comunitaria" }
};

function limpiar(texto) {
  return texto.replace(/[\u200b\ufeff]/g, "").replace(/([a-záéíóúñ])-\s+([a-záéíóúñ])/gi, "$1$2").replace(/\s+/g, " ").replace(/\s+([,.;:!?])/g, "$1").trim();
}

function clasificacionInicial(pagina) {
  if (pagina === 5) return "0.1";
  if (pagina <= 10) return "0.2";
  if (pagina === 12) return "1.1";
  if (pagina === 13) return "1.2";
  if (pagina <= 15) return "1.3";
  if (pagina <= 22) return "2.1";
  if (pagina <= 24) return "2.3";
  if (pagina <= 28) return "3.1";
  if (pagina <= 31) return "3.2";
  if (pagina <= 33) return "3.3";
  if (pagina <= 36) return "3.4";
  if (pagina <= 39) return "3.6";
  if (pagina <= 45) return "4.1";
  return "4.2";
}

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

function detectarSubtema(texto) {
  const plano = limpiar(texto).toLowerCase();
  if (/^0\.?1\.?\s*(introducci[oó]n|plan de integraci[oó]n)/.test(plano)) return "0.1";
  if (/^0\.?2\.?\s*actividades/.test(plano)) return "0.2";
  if (/^2\.?1\.?\s*garant[ií]as/.test(plano)) return "2.1";
  if (/^2\.?2\.?\s*sello verde/.test(plano)) return "2.2";
  if (/^2\.?3\.?\s*gas/.test(plano)) return "2.3";
  if (/^3\.?1\.?\s*patrimonio/.test(plano)) return "3.1";
  if (/^3\.?2\.?\s*administraci[oó]n/.test(plano)) return "3.2";
  if (/^3\.?3\.?\s*asambleas/.test(plano)) return "3.3";
  if (/^3\.?4\.?\s*comit[eé]/.test(plano)) return "3.4";
  if (/^3\.?5\.?\s*reglamento/.test(plano)) return "3.5";
  if (/^3\.?6\.?\s*gastos/.test(plano)) return "3.6";
  if (/^4\.?1\.?\s*organizaciones/.test(plano)) return "4.1";
  if (/^4\.?2\.?\s*seguridad/.test(plano)) return "4.2";
  return null;
}

const preguntas = [];
let actual = null;
let subtemaActual = null;

function guardarActual() {
  if (!actual) return;
  const pregunta = limpiar(actual.pregunta);
  const respuesta = limpiar(actual.respuesta.join(" "));
  if (pregunta && respuesta) {
    preguntas.push({ tema: subtemas[actual.clave].tema, subtema: subtemas[actual.clave].subtema, pregunta: pregunta, respuesta: respuesta, pagina: actual.pagina, documento: manual.nombre, ruta: manual.ruta });
  }
  actual = null;
}

manual.paginas.forEach(function(pagina, indicePagina) {
  const numeroPagina = indicePagina + 1;
  subtemaActual = subtemaActual || clasificacionInicial(numeroPagina);
  separarColumnas(pagina).forEach(function(columna) {
    columna.forEach(function(linea) {
      const texto = linea.trim();
      if (!texto || /EQUIDAD URBANA CONSULTORA|^\d{2}$/.test(texto)) return;
      const encabezado = detectarSubtema(texto);
      if (encabezado) { guardarActual(); subtemaActual = encabezado; return; }
      const numerada = texto.match(/^(\d\.\d)\.?\s*(¿.*)$/);
      const letra = texto.match(/^[A-Z][.)]?\s*(¿.*)$/);
      if (numerada || letra) {
        guardarActual();
        actual = { pregunta: numerada ? numerada[2] : letra[1], respuesta: [], pagina: numeroPagina, clave: numerada ? numerada[1] : subtemaActual };
        return;
      }
      if (!actual) return;
      if (!actual.pregunta.includes("?")) actual.pregunta += " " + texto;
      else actual.respuesta.push(texto);
    });
  });
});
guardarActual();

const subtemaPorPregunta = {
  "¿Es obligación pagar los gastos comunes?": "3.6",
  "¿Existen sanciones por ley en caso de no pagar los gastos comunes?": "3.6",
  "¿Qué tipos de gastos comunes existen?": "3.6",
  "¿Cómo se pagan los gastos comunes?": "3.6",
  "¿Qué es el fondo común de reserva?": "3.6"
};

const respuestasPorPregunta = {
  "¿Cuáles son las actividades del Plan de Integración Social?": "El Plan de Integración Social consta de cinco actividades, en las que se abordan distintas temáticas y orientaciones.\n\n1) Visita a la obra: revisa avances de construcción y características de las viviendas y espacios comunes.\n\n2) Uso, cuidado y mantención: entrega consejos para el buen uso de viviendas y espacios comunes, y aborda garantías legales y postventa.\n\n3) Derechos y deberes: revisa las implicancias de ser propietario/a en condominio, formas de organización, obligaciones como beneficiarios/as del subsidio, divorcio y herencias.\n\n4) Organización comunitaria: refuerza la organización, identidad barrial, seguridad, convivencia, limpieza, administración y reglamento de copropiedad.\n\n5) Redes comunitarias: vincula a las familias con instituciones del territorio, como municipalidad y Bomberos, para conocer su funcionamiento y formas de contacto.",
  "¿Cómo es el proceso constructivo de la obra?": "A continuación se resume el proceso constructivo.\n\nA) Preparación: se prepara el área de construcción, se realiza el cierre perimetral, se despeja el terreno y, según las condiciones del suelo, se ejecutan excavaciones.\n\nB) Obra gruesa: se instalan fontanería y cimientos; luego se monta la estructura del edificio o casas, incluidos revestimientos, techos, puertas y ventanas exteriores.\n\nC) Instalaciones: se implementan servicios como cableado eléctrico, tuberías de residuos e iluminación.\n\nD) Terminaciones: se ejecutan los detalles finales, como pintura, marcos de ventanas, puertas, revestimientos e iluminación.\n\nE) Certificaciones: terminada la obra, se inicia la recepción municipal. La Dirección de Obras revisa el cumplimiento normativo y, si corresponde, emite el certificado de aprobación. En paralelo, SERVIU revisa el proyecto y sus instalaciones.",
  "¿Cuáles son los aspectos generales de entrega?": "Cuando se cumplan las condiciones definidas por la inmobiliaria, se avisará a los futuros propietarios/as para iniciar trámites y firmar la escritura de compraventa.\n\nPara preparar la escrituración, la inmobiliaria puede solicitar: cuentas de servicios y contribuciones al día; verificación de datos de la vivienda y propietario/a; cuadre de saldo y pago de fondo; y coordinación con banco o institución financiera. Estos requisitos pueden variar según el caso.\n\nUna vez firmada la escritura, debe inscribirse en el Conservador de Bienes Raíces. Después, la inmobiliaria verifica los requisitos y coordina la fecha de entrega. Si recibirá un tercero, se debe consultar previamente el procedimiento respectivo.",
  "¿Cuáles son los pasos a seguir el día de la entrega?": "El proceso puede variar según la inmobiliaria. El día de la entrega, un/a representante explicará los pasos y el proceso suele durar entre 30 y 90 minutos, según las características de la vivienda.\n\nSe revisará el estado de la propiedad y se realizará una inducción sobre cada equipo e instalación: iluminación, electricidad, calefón, llaves de paso de gas y agua, medidores y tableros eléctricos.\n\nSi existen fallas o defectos, deben registrarse al momento de la entrega. Observaciones como rayas, manchas, piquetes o abolladuras informadas posteriormente no son responsabilidad de la inmobiliaria.\n\nLuego se entrega la documentación disponible, como manual de uso, recomendaciones, reglamento de copropiedad y manual de mantención. Finalmente, se firma el Acta de Entrega y se reciben las llaves.",
  "¿Desde cuándo entran en vigencia las garantías?": "Depende del tipo de garantía: para elementos estructurales soportantes y para elementos constructivos o instalaciones, el plazo comienza desde la recepción municipal. Para terminaciones, comienza desde la inscripción de la vivienda en el Conservador de Bienes Raíces.",
  "¿Qué establece el reglamento?": "El reglamento regula lineamientos de la vida en comunidad: administración y conservación de los bienes de dominio común; multas e intereses por incumplimiento; periodicidad y época de las asambleas ordinarias; y las conductas que constituyen infracciones, junto con sus multas o sanciones según gravedad.",
  "¿A la vivienda adquirida por subsidio puede aplicarse el Artículo 150 de Patrimonio reservado de la mujer casada?": "Sí, si se respetan los requisitos señalados. Puede aplicarse cuando el subsidio se adquiere a partir de ahorros generados de forma independiente del cónyuge.",
  "¿Cuáles son los pilares de la seguridad comunitaria?": "Los pilares son la prevención comunitaria, mediante participación activa y compromiso de la comunidad para disminuir oportunidades de delito; el trabajo en red con instituciones para coordinar acciones; y la prevención situacional, que reconfigura participativamente los espacios para reducir condiciones de riesgo y favorecer el encuentro comunitario."
  ,"¿Puedo utilizar un cilindro de gas en un departamento?": "La normativa no permite utilizar cilindros en edificios de más de cuatro pisos para aparatos fijos, como cocinas y calefones. Solo permite cilindros de hasta 15 kg en artefactos móviles —por ejemplo, estufas, parrillas o lámparas— cuando el cilindro está incorporado al artefacto.\n\nPor lo tanto, se prohíbe el uso de cilindros de gas en la cocina y el calefón. Respetar esta norma protege a la comunidad vecinal y a cada hogar."
  ,"¿Qué tipo de asambleas existen?": "Existen tres tipos de asambleas.\n\nOrdinarias: deben realizarse al menos una vez al año. Revisan la rendición de cuentas, balance, designación del comité y designación o remoción de la administración.\n\nExtraordinarias: se realizan cuando lo requieren las necesidades del condominio o a petición del comité o copropietarios/as. Pueden abordar modificaciones del reglamento, delegación de facultades, remoción de integrantes y uso del fondo de reserva.\n\nExtraordinarias de mayoría reforzada: tratan alteraciones de unidades o del condominio, y procesos de reconstrucción o demolición. Cada tipo de asamblea tiene los quórums establecidos por la Ley de Copropiedad.",
  "¿Cuáles son sus funciones?": "El Comité establece reglas mínimas sobre el uso habitual o periódico de los bienes comunes.\n\nTambién imparte instrucciones a la administración del condominio.\n\nPuede imponer las multas contempladas en el reglamento de copropiedad.",
  "¿En qué instancia se conforma?": "El primer Comité de Administración se conforma en la primera asamblea de copropietarios/as convocada por la administración. Posteriormente, se conforma en asambleas ordinarias.",
  "¿Qué es el fondo común de reserva?": "Las comunidades regidas por la copropiedad deben contar con un fondo de reserva para disponer de recursos ante circunstancias inesperadas.\n\nEs obligatorio y se forma agregando el 5% del gasto común."
};

const preguntasCorregidas = preguntas.map(function(item) {
  const clave = subtemaPorPregunta[item.pregunta];
  const respuesta = respuestasPorPregunta[item.pregunta];
  return Object.assign({}, item, clave ? subtemas[clave] : {}, respuesta ? { respuesta: respuesta } : {});
});

// Estas letras se separan del signo de pregunta en la extracción del PDF.
// Se transcriben para mantener todas las preguntas A-I, A-J, etc. del manual.
const complementos = [
  ["2.1", "¿Qué podría hacer que pierda las garantías de la vivienda?", "El mal uso de artefactos de la vivienda, las modificaciones estructurales inadecuadas, los daños a la estructura o al circuito eléctrico, los riesgos para viviendas vecinas y las modificaciones sin autorización municipal pueden causar pérdida de garantías, daños o multas.", 21],
  ["2.1", "¿Qué otras consideraciones son importantes sobre las garantías?", "El primer vendedor no responde por defectos o fallas provocados por transformaciones, ampliaciones o adecuaciones efectuadas posteriormente a la compraventa, ni por defectos en bienes muebles, objetos de comodidad u ornato señalados por el Código Civil.", 22],
  ["3.1", "¿Cuáles son los requisitos para que aplique el patrimonio reservado de la mujer casada?", "Debe existir régimen de sociedad conyugal y el bien debe haber sido adquirido por la mujer a partir de un trabajo remunerado, desarrollado durante el matrimonio y de forma separada de su cónyuge.", 27],
  ["3.1", "¿Se aplica este Artículo de forma automática?", "No. Al adquirir un bien, la mujer debe solicitar que la escritura especifique que está siendo adquirido bajo el Artículo 150 del Código Civil.", 27],
  ["3.1", "Bajo este Artículo, ¿qué ocurre con los bienes de la mujer en caso de divorcio?", "Si el bien se adquirió antes del matrimonio, permanece como bien propio. Si se adquirió durante el matrimonio y forma parte del patrimonio reservado, la mujer puede renunciar a los gananciales y conservar ese patrimonio, o no renunciar; en este último caso, sus bienes propios pasan a la sociedad conyugal para su liquidación en partes iguales.", 28],
  ["3.2", "¿Existe un tiempo mínimo o máximo del cargo de administrador/a?", "No existe un tiempo mínimo ni máximo. Cuando el contrato está a cargo del comité de administración, los copropietarios y copropietarias estipulan la duración del cargo.", 30],
  ["3.4", "¿En qué consiste el Comité de Administración?", "Es un grupo de vecinos y vecinas del condominio que representa a los copropietarios, resguarda los acuerdos adoptados en asamblea y es elegido por la propia comunidad vecinal.", 34],
  ["3.4", "¿Quiénes pueden conformarlo?", "Pueden integrarlo propietarios/as del condominio, sus cónyuges o convivientes civiles, mandatarios con poder suficiente, representantes de personas jurídicas propietarias y personas hábiles al día en el pago de gastos comunes.", 35],
  ["3.4", "¿Cómo se eligen a los miembros del Comité?", "Se eligen en la asamblea de copropietarios. Deben ser como mínimo tres y como máximo cinco integrantes, siempre en número impar.", 35],
  ["3.4", "¿Qué ocurre si nadie quiere ser parte del Comité?", "Los integrantes se eligen por sorteo durante la asamblea; cualquier propietario o propietaria podría resultar seleccionado/a para integrar el comité de administración.", 35],
  ["3.6", "¿Qué son los gastos comunes?", "Son los gastos en que incurre una comunidad para su funcionamiento normal y para servicios compartidos por residentes y copropietarios/as. Permiten mantener el condominio en buen estado y se pagan según el tamaño de cada departamento, mediante prorrateos por metros cuadrados.", 37],
  ["4.1", "¿Para qué sirve una junta de vecinos (JJ.VV.)?", "Sirve para promover la participación, desarrollo e integración vecinal: representar a vecinos ante autoridades, gestionar soluciones, proponer y ejecutar proyectos, identificar carencias de infraestructura y organizar actividades que fortalezcan la identidad barrial.", 42],
  ["4.1", "¿Cuáles son los beneficios de pertenecer a una JJ.VV.?", "Permite postular a fondos concursables para proyectos comunitarios y contar con mayor autoridad y representación ante solicitudes dirigidas a las autoridades comunales.", 43],
  ["4.1", "¿Dónde se puede encontrar más información respecto a las JJ.VV.?", "En la municipalidad correspondiente y con el o la encargada territorial asignada para el territorio.", 45],
  ["4.2", "¿Por qué es importante este enfoque de la seguridad?", "Porque promueve la confianza y las redes de la comunidad vecinal para prevenir el delito mediante la organización comunitaria y el trabajo en red con instituciones, superando un enfoque centrado solo en lo punitivo y la desconfianza.", 46]
].map(function(item) {
  return { tema: subtemas[item[0]].tema, subtema: subtemas[item[0]].subtema, pregunta: item[1], respuesta: item[2], pagina: item[3], documento: manual.nombre, ruta: manual.ruta };
});

const sinDuplicados = preguntasCorregidas.concat(complementos).filter(function(item, indice, lista) {
  return lista.findIndex(function(otro) { return otro.pregunta === item.pregunta && otro.subtema === item.subtema; }) === indice;
});
const salida = JSON.stringify(sinDuplicados, null, 2);
if (process.argv.includes("--write")) {
  fs.writeFileSync(path.join(raiz, "data", "faq_pis.json"), salida, "utf8");
  console.log("FAQ creada con " + sinDuplicados.length + " preguntas.");
} else console.log(salida);
