// Repara las respuestas que el extractor del PDF mezcló entre columnas.
// Fuente: EDITABLE (V2) - Manual Resolución de dudas frecuentes PIS.pptx.
// Ejecutar: node scripts/reparar_faq_desde_ppt.js
const fs = require("fs");
const path = require("path");
const raiz = path.resolve(__dirname, "..");
const archivo = path.join(raiz, "data", "faq_pis.json");
const faq = JSON.parse(fs.readFileSync(archivo, "utf8"));

const respuestas = {
  "¿Cuáles son sus objetivos?": `Entregar información y asesoría en diferentes materias.

Promover el cuidado de los espacios comunes y de viviendas.

Apoyar a las personas y familias beneficiarias del subsidio.

Fomentar la sana convivencia.

Fortalecer la organización comunitaria.`,
  "¿Cuántos años de garantía tienen las viviendas?": `La Ley General de Urbanismo y Construcciones estipula los plazos dentro de los cuales el primer vendedor debe hacerse responsable de las fallas que podría tener la vivienda, la construcción o el diseño. Los plazos varían desde los:

10 años: desde la recepción municipal en fallas o defectos de elementos estructurantes soportantes del inmueble, tales como cimientos, fundaciones, muros soportantes, losas, vigas, cadenas, estructura de techumbres, pilares y entramados horizontales o verticales de carácter estructural.

5 años: desde la recepción municipal en fallas o defectos de elementos constructivos o de las instalaciones, tales como cubiertas de techumbres, ventanas, estructuras no soportantes de muro y cielo, bases de pavimentos, estructuras o bases de pisos, impermeabilizaciones, aislamiento térmico y acústico, redes de instalaciones eléctricas, de corrientes débiles, de gas y sanitarias, entre otras.

3 años: desde la inscripción de la vivienda en el Conservador de Bienes Raíces en fallas o defectos de terminaciones o acabado de las obras, tales como cielos, pisos, puertas, revestimientos y pinturas exteriores o interiores, barnices, alfombras, cerámicas, quincallería y muebles adosados o empotrados a la construcción.

En caso de que las fallas o defectos no correspondan a ninguno de los mencionados anteriormente, o bien que no sean asimilables o equivalentes a éstos, el plazo de prescripción de las acciones será de 5 años.`,
  "¿Desde cuándo entran en vigencia las garantías?": `Depende del tipo de garantía:

Elementos estructurales soportantes: desde la recepción municipal.

Elementos constructivos o instalaciones: desde la recepción municipal.

Terminaciones: desde la inscripción de la vivienda en el Conservador de Bienes Raíces.`,
  "¿Cuándo las garantías se pueden hacer valederas?": "Cuando se respetan las indicaciones del fabricante o proveedor, y también cuando las fallas o defectos no están asociadas a un uso inadecuado del inmueble o falta de mantención.",
  "¿Necesito algún permiso para realizar alguna modificación a la vivienda?": "Sí, toda modificación debe ser ejecutada con la respectiva autorización municipal, mediante un permiso de obra menor o un permiso de alteración, reparación o reconstrucción, aprobada por la Dirección de Obras Municipal correspondiente.",
  "¿Debería consultar la modificación con algún profesional?": `Sí. En caso de realizar alguna modificación, se debe consultar previamente a un profesional calificado que revise los planos de cálculo e instalaciones; de lo contrario, se puede correr el riesgo de:

• Dañar la estructura de la vivienda.

• Intervenir el circuito eléctrico de alguna instalación.

• Perder las garantías.

• Generar daños o posibles riesgos a la vivienda de sus vecinos.

• Recibir multas por modificación por parte de la Municipalidad.`,
  "¿Se requiere algún permiso para realizar una intervención en los bienes comunes?": `En condominios o comunidades acogidas por la Ley de Copropiedad Inmobiliaria se debe contar con la aprobación de la comunidad en Asamblea para intervenir los bienes comunes.

Además, según el tipo de intervención podría ser necesario contar con autorización municipal.`,
  "¿Qué podría hacer que pierda las garantías de la vivienda?": `• Mal uso de artefactos de la vivienda.

• Modificaciones estructurales inadecuadas.`,
  "¿Se pueden perder todas las garantías por hacer una modificación?": `Depende del tipo de modificación y de los elementos que se ven involucrados en la modificación realizada. A continuación se exponen algunos casos para ejemplificar:

Cambiar la ventana de la habitación: si se modifica solo la ventana de la habitación, se perderían las garantías respecto a esa ventana, pero las demás garantías se mantendrían.

Remover un muro de tabique: si se remueve un tabique, se perderían las garantías respecto a ese muro de tabique, pero se mantendrían las otras garantías, a menos que se vean involucrados otros elementos, como el sistema eléctrico.

Es importante considerar que los elementos que son intervenidos y/o modificados son los que pierden las garantías, por lo que todo depende del caso a caso. Es sumamente importante consultar previamente cualquier modificación con un profesional para no arriesgar la pérdida de las garantías.`,
  "¿Qué otras consideraciones son importantes sobre las garantías?": `No es imputable al primer vendedor:

• Defectos o fallas que se presentan a causa de los trabajos de transformación, ampliación o adecuación efectuados en la propiedad con posterioridad a la fecha señalada en la escritura de compraventa del inmueble.

• Los defectos o fallas que se presentan en los bienes muebles y las cosas de comodidad y ornato de acuerdo a lo señalado por el artículo 572 del Código Civil.`,
  "¿Qué es el sello verde?": "Es una certificación entregada por la Superintendencia de Electricidad y Combustible a las instalaciones de gas que cumplen con la normativa vigente y que, por ende, no presentan defectos en sus artefactos individuales, colectivos y obras complementarias. El sello verde indica que las instalaciones de gas se encuentran en óptimas condiciones según la normativa.",
  "¿El condominio tiene sello verde?": "El condominio es entregado con sello verde, teniendo una duración de dos años. Después de esta fecha, es responsabilidad de la comunidad y de la administración renovarlo.",
  "¿Cada cuánto se debe renovar el certificado de sello verde?": "Se debe someter a inspección el uso de gas del condominio cada dos años. En caso de que se logren dos sellos verdes consecutivos, se alarga el período de inspección a 4 años.",
  "¿En qué tipo de matrimonio aplica este Artículo?": "Entra en vigencia en el régimen matrimonial de sociedad conyugal. En este régimen matrimonial, cada cónyuge es dueño del 50% de cada bien que es parte de la comunidad de bienes. Es el régimen matrimonial más usual en Chile, ya que rige en el silencio de la voluntad de las partes, es decir, cuando no se determinó otro tipo de régimen matrimonial al contraer matrimonio.",
  "¿Cuáles son los requisitos para que aplique el patrimonio reservado de la mujer casada?": `Tener como régimen matrimonial sociedad conyugal.

El bien fue adquirido por parte de la mujer a partir de un trabajo:

• Remunerado.

• Desarrollado durante el matrimonio.

• Por separado de su cónyuge.`,
  "¿A la vivienda adquirida por subsidio puede aplicarse el Artículo 150 de Patrimonio reservado de la mujer casada?": "Si se respetan los requisitos mencionados anteriormente, sí puede ser aplicado el Artículo 150 de Patrimonio reservado de la mujer casada, pensando en que el subsidio fue adquirido a partir de ahorros generados de forma independiente del cónyuge.",
  "Bajo este Artículo, ¿qué ocurre con los bienes de la mujer en caso de divorcio?": `Depende del momento en que la mujer adquirió el bien. Existen dos escenarios:

a) Si el bien fue adquirido por la mujer antes del matrimonio: quedará a su nombre como un bien propio.

b) Si el bien fue adquirido por la mujer durante el matrimonio: si el bien entra en el Patrimonio protegido de la mujer, deberá tomar una decisión:

• Renunciar a los gananciales: deberá renunciar a los bienes de la sociedad conyugal o los bienes comunes con su pareja y se quedará únicamente con los bienes de su Patrimonio reservado.

• No renunciar a los gananciales: todos sus bienes propios, es decir, los bienes de su Patrimonio reservado, pasarán a ser parte de la sociedad conyugal como bienes comunes, para ser repartidos y liquidados en partes iguales.`,
  "¿Cuáles son las funciones de la administración?": `La administración cuenta con diferentes atribuciones, dentro de las cuales se pueden mencionar:

• Citar a asamblea de copropietarios/as.

• Cobrar y administrar gastos comunes.

• Efectuar actos necesarios para realizar mantenciones, inspecciones y certificaciones de las instalaciones.

• Velar por las disposiciones legales y reglamentarias sobre la copropiedad inmobiliaria y el reglamento de copropiedad.

• Cuidar los bienes de toda la comunidad vecinal.

• Entre otros.`,
  "¿Cuáles son los requisitos para ser administrador/a?": `• Contar con enseñanza media completa.

• Haber realizado un curso de administración en una institución de educación superior del Estado o reconocida por éste, u organismo técnico de capacitación acreditado por el Servicio Nacional de Capacitación y Empleo; o bien contar con una certificación de competencia laboral otorgada por un centro acreditado por la Comisión del Sistema Nacional de Certificación de Competencias Laborales.

• Estar inscrito en el Registro Nacional de Administradores.`,
  "¿En qué consisten las asambleas de copropietarios/as según la Ley?": "Es el principal órgano decisorio para organizar el condominio. Las asambleas son las reuniones donde se toman los acuerdos más importantes para organizar el condominio.",
  "¿Quiénes pueden asistir a estas asambleas o reuniones?": "Puede asistir un propietario/a por unidad y, si éste no asiste, puede hacerlo su cónyuge, conviviente civil, arrendatario u ocupante de la vivienda.",
  "¿En qué formato deben ser las asambleas?": "La nueva Ley de Copropiedad permite que las asambleas puedan ser telemáticas, híbridas o presenciales. De realizarse de forma telemática o híbrida, es importante contar con los implementos adecuados para poder desarrollar la asamblea en estos formatos.",
  "¿Cuáles son sus funciones?": `• Establece reglas mínimas respecto al uso habitual o periódico de bienes comunes.

• Imparte instrucciones a la administración del condominio.

• Impone multas que estuvieron contempladas en el reglamento.`,
  "¿Quiénes pueden conformarlo?": `• Propietarios/as en el condominio, sus cónyuges o convivientes civiles, o cualquier mandatario con poder suficiente.

• Representantes de las personas jurídicas que sean propietarias.

• Personas hábiles, al día con el pago de los gastos comunes.`,
  "¿Cuál es la duración del Comité de Administración?": "Tendrá la duración que sea establecida en la Asamblea de Copropietarios/as. Sin embargo, tendrá una duración máxima de 3 años, pudiendo haber reelección de sus integrantes.",
  "¿Se entrega alguna remuneración al ser parte del Comité?": "No, ya que no es un trabajo con contrato. De todas formas, la nueva Ley establece que se puede entregar una retribución. Esto quiere decir que se podría realizar un descuento en los gastos comunes a quienes sean parte del comité, lo que debe dejarse establecido en el reglamento.",
  "¿Quién confecciona el reglamento?": "El primer reglamento lo entrega la Inmobiliaria y puede modificarse según las decisiones que se tomen en asamblea extraordinaria.",
  "¿Qué son los gastos comunes?": "Son los gastos en que incurre una comunidad para contar con su desarrollo y funcionamiento normal, como también los gastos que se derivan del uso de algunos servicios particulares de cada unidad, que se comparten entre todos/as los residentes y copropietarios/as del conjunto habitacional. Es la principal forma de asegurar la mantención periódica y de mantener en buen estado el condominio. Se paga de acuerdo al tamaño del departamento, mediante prorrateos según metros cuadrados.",
  "¿Qué tipos de gastos comunes existen?": `Según la Ley, existen dos tipos de gastos comunes:

Ordinarios: son utilizados para el mantenimiento de espacios de dominio común, reparaciones y consumo de servicios colectivos, y para temas administrativos como las remuneraciones del personal del condominio. Estos gastos son considerados dentro del presupuesto anual.

Extraordinarios: gastos que no estaban considerados para el presupuesto anual y que son gastos adicionales y distintos a los gastos comunes ordinarios, y a las sumas destinadas a nuevas obras comunes.`,
  "¿Qué es una organización comunitaria?": `Es aquella que representa un territorio velando por los intereses y valores de ese sector. No puede perseguir fines de lucro ni realizar acciones proselísticas. Existen dos tipos:

Organización comunitaria funcional: aquellas con personalidad jurídica y sin fines de lucro, cuyo objetivo es promover y representar valores e intereses específicos de la comunidad dentro del territorio de la comuna. Ejemplos: club de adulto mayor o club deportivo.

Organización comunitaria territorial: aquellas que tienen por objetivo promover el desarrollo de la comuna y los intereses de sus integrantes en el territorio respectivo, y colaborar con autoridades del Estado y de las Municipalidades. Ejemplo: juntas de vecinos.`,
  "¿Qué es una junta de vecinos (JJ.VV)?": "Se rige bajo la Ley 19.418, siendo una organización comunitaria de carácter territorial que es representativa de las personas que residen en la misma unidad vecinal, sea urbana o rural. Su objetivo principal es fomentar el desarrollo de la comunidad, defender sus intereses, velar por sus derechos y colaborar con autoridades.",
  "¿Para qué sirve una junta de vecinos (JJ.VV.)?": `Para promover la participación, desarrollo e integración de los vecinos/as del territorio, la junta de vecinos puede:

• Representar a los vecinos/as ante las autoridades para lograr convenios de desarrollo.

• Gestionar la solución de problemas ante las autoridades.

• Proponer y ejecutar proyectos que beneficien a la comunidad.

• Determinar carencias de infraestructura de la unidad vecinal, como iluminación, áreas verdes, tránsito o alcantarillado.

• Generar actividades que promuevan la identidad barrial y sentido de pertenencia.`,
  "¿Cuáles son los requisitos para legalizar una JJ.VV?": `Primero, se debe juntar cierta cantidad de firmas para legalizar la JJ.VV. El número depende del número de habitantes de la comuna:

• 50 vecinos/as en comunas de hasta 10 mil habitantes.

• 100 vecinos/as en comunas de más de 10 mil y hasta 30 mil habitantes.

• 150 vecinos/as en comunas de más de 30 mil y hasta 100 mil habitantes.

• 200 vecinos/as en comunas de más de 100 mil habitantes.

Después debe constituirse una asamblea ante un funcionario municipal designado por el municipio, un notario o un oficial del Registro Civil. En esta asamblea se debe contar con una directiva provisoria, un libro de actas, un libro de registro de socios nuevos o en blanco, y un nombre provisorio de la JJ.VV.

Es importante considerar que los jóvenes desde los 14 años pueden ser parte e inscribirse para ser socios. Es importante estar en contacto con la Municipalidad correspondiente para solicitar orientación y asesoría respecto a este proceso de constitución.`,
  "¿En qué se diferencia una junta de vecinos con una unión vecinal o comité de vecinos?": "Una unión vecinal es la agrupación de juntas de vecinos de una misma unidad comunal. Un comité de vecinos es un grupo al cual la JJ.VV. entrega y delega ciertas atribuciones para tareas específicas, pero que no cuenta con personalidad jurídica y debe estar supeditado a las decisiones de la junta.",
  "¿Qué recomendaciones son importantes de incorporar en torno a la seguridad?": `• Comunidad activa: contar con comunicación efectiva, por ejemplo por medio de WhatsApp, para mantenerse organizados, expresar preocupaciones de seguridad y prevenir situaciones de delito.

• Capacitación del personal del condominio: es importante que el personal que trabaja en el condominio esté capacitado y sepa cómo operar en caso de emergencia.

• Control de acceso en entradas: se sugiere que exista un sistema de control para acceder al condominio y que así no entren personas desconocidas.

• Protocolo de seguridad ante emergencias: tener claridad de qué forma se debe operar en caso de emergencias y revisar el plan de emergencia entregado por la Inmobiliaria.

• Cumplimiento del reglamento y de las normas: buscar mantener la seguridad del condominio, resguardando la vivienda propia y a su comunidad vecinal.`
};

for (const item of faq) if (respuestas[item.pregunta]) item.respuesta = respuestas[item.pregunta];

const orden = {
  "3.1 Patrimonio reservado de la mujer casada": ["Qué busca", "En qué tipo", "Qué es el Patrimonio", "Cuáles son los requisitos", "A la vivienda", "Se aplica", "Bajo este"],
  "3.2 Administración del condominio": ["En qué consiste", "Cómo se designa", "Cuáles son las funciones", "Cuáles son los requisitos", "Existe un tiempo", "Es obligatorio", "administrador/a puede", "Se puede reemplazar"],
  "3.4 Comité de Administración": ["En qué consiste", "Cuáles son sus funciones", "Quiénes pueden", "En qué instancia", "Cómo se eligen", "Qué ocurre", "Cuál es la duración", "Se entrega"],
  "3.6 Gastos comunes": ["Qué son", "Es obligación", "Existen sanciones", "Qué tipos", "Cómo se pagan", "Qué es el fondo"],
  "4.1 Organizaciones comunitarias": ["Qué es una unidad", "Qué es una organización", "Qué es una junta", "Para qué sirve", "Cuáles son los beneficios", "Cuáles son los requisitos", "Cómo se financia", "Qué tipo de actividades", "En qué se diferencia", "Dónde se puede encontrar"],
  "4.2 Seguridad comunitaria": ["Cuál es el enfoque", "Cuáles son los pilares", "Por qué es importante", "Qué recomendaciones"]
};
function posicion(item) { const lista = orden[item.subtema]; if (!lista) return 999; const q = item.pregunta.replace(/^¿/, ""); const p = lista.findIndex(x => q.startsWith(x)); return p < 0 ? 999 : p; }
faq.sort((a, b) => a.tema.localeCompare(b.tema, "es") || a.subtema.localeCompare(b.subtema, "es") || posicion(a) - posicion(b));
fs.writeFileSync(archivo, JSON.stringify(faq, null, 2), "utf8");
console.log(`FAQ reparada: ${faq.length} preguntas; ${Object.keys(respuestas).length} respuestas reconstruidas desde PPTX.`);
