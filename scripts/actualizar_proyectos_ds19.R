# Convierte la planilla de actividades DS19 en el archivo que lee la página web.
# Ejecutar desde la raíz del proyecto:
# source("scripts/actualizar_proyectos_ds19.R")

paquetes <- c("readxl", "jsonlite")
faltantes <- paquetes[!vapply(paquetes, requireNamespace, logical(1), quietly = TRUE)]
if (length(faltantes)) {
  stop("Faltan paquetes: ", paste(faltantes, collapse = ", "),
       ". Instálalos una vez con: install.packages(c(",
       paste(sprintf('"%s"', faltantes), collapse = ", "), "))")
}

archivo_entrada <- file.path("data", "proyectos_ds19.xlsx")
archivo_salida <- file.path("data", "proyectos_ds19.json")
if (!file.exists(archivo_entrada)) stop("No se encontró ", archivo_entrada)

datos <- readxl::read_excel(archivo_entrada, sheet = "Actividades")
proyectos <- readxl::read_excel(archivo_entrada, sheet = "Proyectos")
requeridas <- c("Proyecto DS19", "Comuna", "Próxima actividad", "Fecha", "Horario", "Lugar", "Visible")
faltan_columnas <- setdiff(requeridas, names(datos))
if (length(faltan_columnas)) {
  stop("Faltan estas columnas en la planilla: ", paste(faltan_columnas, collapse = ", "))
}
requeridas_proyectos <- c("Proyecto DS19", "Comuna", "Correo de contacto", "Visible")
faltan_proyectos <- setdiff(requeridas_proyectos, names(proyectos))
if (length(faltan_proyectos)) {
  stop("Faltan estas columnas en la hoja Proyectos: ", paste(faltan_proyectos, collapse = ", "))
}

limpiar <- function(x) {
  x <- as.character(x)
  x[is.na(x)] <- ""
  trimws(gsub("\\s+", " ", x))
}

# Acepta fechas de Excel y textos como 06/10/2026 o 2026-10-06.
# Evita que R interprete fechas chilenas como si fueran mes/día/año.
convertir_fecha <- function(x) {
  if (inherits(x, "Date") || inherits(x, "POSIXt")) return(as.Date(x))
  texto <- limpiar(x)
  salida <- as.Date(rep(NA_character_, length(texto)))
  formatos <- c("%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d", "%d.%m.%Y")
  for (formato in formatos) {
    pendientes <- which(is.na(salida) & nzchar(texto))
    if (length(pendientes)) salida[pendientes] <- as.Date(texto[pendientes], format = formato)
  }
  # Respaldo para números de serie de Excel que puedan venir como texto.
  pendientes <- which(is.na(salida) & grepl("^[0-9]+$", texto))
  if (length(pendientes)) salida[pendientes] <- as.Date(as.numeric(texto[pendientes]), origin = "1899-12-30")
  salida
}

# Fecha legible para las personas visitantes, independiente de la configuración regional de R.
formatear_fecha_larga <- function(fecha) {
  meses <- c("enero", "febrero", "marzo", "abril", "mayo", "junio",
             "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre")
  paste(as.integer(format(fecha, "%d")), "de", meses[as.integer(format(fecha, "%m"))],
        "de", format(fecha, "%Y"))
}

datos <- as.data.frame(datos, stringsAsFactors = FALSE)
datos$`Proyecto DS19` <- limpiar(datos$`Proyecto DS19`)
datos$Comuna <- limpiar(datos$Comuna)
datos$`Próxima actividad` <- limpiar(datos$`Próxima actividad`)
datos$Horario <- limpiar(datos$Horario)
datos$Lugar <- limpiar(datos$Lugar)
datos$Visible <- tolower(limpiar(datos$Visible))
datos$.fecha <- convertir_fecha(datos$Fecha)

proyectos <- as.data.frame(proyectos, stringsAsFactors = FALSE)
proyectos$`Proyecto DS19` <- limpiar(proyectos$`Proyecto DS19`)
proyectos$Comuna <- limpiar(proyectos$Comuna)
proyectos$`Correo de contacto` <- limpiar(proyectos$`Correo de contacto`)
proyectos$Visible <- tolower(limpiar(proyectos$Visible))
# Las filas se muestran por defecto. Escribe "No" en Visible solo si deseas ocultarlas.
proyectos <- proyectos[!(proyectos$Visible %in% c("no", "n")) & nzchar(proyectos$`Proyecto DS19`), , drop = FALSE]
proyectos <- proyectos[!duplicated(tolower(proyectos$`Proyecto DS19`)), , drop = FALSE]

filas_con_error <- which(
  !(datos$Visible %in% c("no", "n")) &
    nzchar(datos$`Proyecto DS19`) & nzchar(datos$`Próxima actividad`) &
    is.na(datos$.fecha)
)
if (length(filas_con_error)) {
  stop("Revisa la fecha de la(s) fila(s) ", paste(filas_con_error + 1, collapse = ", "),
       ". Usa un formato como 06/10/2026.")
}

# Solo se publican filas completas marcadas como "Sí".
datos <- datos[
  !(datos$Visible %in% c("no", "n")) &
    nzchar(datos$`Proyecto DS19`) & nzchar(datos$`Próxima actividad`) &
    !is.na(datos$.fecha), , drop = FALSE
]

# Se publica solo la próxima actividad de cada proyecto.
datos <- datos[order(tolower(datos$`Proyecto DS19`), datos$.fecha), , drop = FALSE]
datos <- datos[!duplicated(tolower(datos$`Proyecto DS19`)), , drop = FALSE]

publicaciones <- lapply(seq_len(nrow(datos)), function(i) {
  indice_proyecto <- match(tolower(datos$`Proyecto DS19`[[i]]), tolower(proyectos$`Proyecto DS19`))
  correo_proyecto <- if (!is.na(indice_proyecto)) proyectos$`Correo de contacto`[[indice_proyecto]] else ""
  list(
    proyecto = datos$`Proyecto DS19`[[i]],
    comuna = datos$Comuna[[i]],
    actividad = datos$`Próxima actividad`[[i]],
    fecha = formatear_fecha_larga(datos$.fecha[[i]]),
    horario = datos$Horario[[i]],
    lugar = datos$Lugar[[i]],
    correo = correo_proyecto
  )
})

listado_proyectos <- lapply(seq_len(nrow(proyectos)), function(i) {
  list(proyecto = proyectos$`Proyecto DS19`[[i]], comuna = proyectos$Comuna[[i]], correo = proyectos$`Correo de contacto`[[i]])
})

jsonlite::write_json(list(proyectos = listado_proyectos, actividades = publicaciones), archivo_salida, auto_unbox = TRUE, pretty = TRUE)
message("Listo: ", length(listado_proyectos), " proyecto(s) y ", length(publicaciones), " actividad(es) DS19 guardada(s) en ", archivo_salida)
