# Genera data/noticias.json para noticias.qmd.
# Ejecutar desde la raíz del proyecto: source("scripts/actualizar_noticias.R")
# La página muestra solo publicaciones de los últimos 31 días.

paquetes <- c("rvest", "jsonlite", "stringr")
faltantes <- paquetes[!vapply(paquetes, requireNamespace, logical(1), quietly = TRUE)]
if (length(faltantes)) stop("Faltan paquetes: ", paste(faltantes, collapse = ", "), ". Instálalos con install.packages(c(", paste(sprintf('"%s"', faltantes), collapse = ", "), ")).")
library(rvest); library(jsonlite); library(stringr)

archivo_salida <- file.path("data", "noticias.json")
archivo_base <- file.path("data", "convocatorias_permanentes.json")

# Gobierno de Santiago se considera GORE, no Municipalidad de Santiago.
fuentes <- list(
  list("MINVU", "", "", "https://www.minvu.gob.cl/noticias/", "^https://www\\.minvu\\.gob\\.cl/noticia/"),
  list("Municipalidad de Puente Alto", "Puente Alto", "Metropolitana de Santiago", "https://www.mpuentealto.cl/", "mpuentealto\\.cl/.+"),
  list("Municipalidad de Buin", "Buin", "Metropolitana de Santiago", "https://www.buin.cl/", "buin\\.cl/.+"),
  list("Municipalidad de Rengo", "Rengo", "O'Higgins", "https://municipalidadrengo.cl/", "municipalidadrengo\\.cl/.+"),
  list("Municipalidad de Rancagua", "Rancagua", "O'Higgins", "https://www.rancagua.cl/", "rancagua\\.cl/.+"),
  list("Municipalidad de San Bernardo", "San Bernardo", "Metropolitana de Santiago", "https://www.sanbernardo.cl/", "sanbernardo\\.cl/.+"),
  list("Municipalidad de Lampa", "Lampa", "Metropolitana de Santiago", "https://lampa.cl/noticias/", "lampa\\.cl/.+"),
  list("Municipalidad de Conchalí", "Conchalí", "Metropolitana de Santiago", "https://conchali.cl/", "conchali\\.cl/.+"),
  list("Municipalidad de La Pintana", "La Pintana", "Metropolitana de Santiago", "https://www.pintana.cl/", "pintana\\.cl/.+"),
  list("Municipalidad de Antofagasta", "Antofagasta", "Antofagasta", "https://municipalidadantofagasta.cl/", "municipalidadantofagasta\\.cl/.+"),
  list("Municipalidad de El Bosque", "El Bosque", "Metropolitana de Santiago", "https://www.municipalidadelbosque.cl/", "municipalidadelbosque\\.cl/.+"),
  list("Municipalidad de Los Andes", "Los Andes", "Valparaíso", "https://www.losandes.cl/category/noticias/", "losandes\\.cl/.+")
)

limpiar <- function(x) str_squish(str_replace_all(x, "\\u00a0", " "))
relevante <- function(x) str_detect(str_to_lower(x), "fond|concurs|subsid|viviend|habit|constru|urban|barrio|comunidad|vecin|organiz|dideco|participa|desarrollo social|infraestructura|proyecto")
fecha_ok <- function(x) {
  x <- str_to_lower(limpiar(x)); meses <- c(enero="01", febrero="02", marzo="03", abril="04", mayo="05", junio="06", julio="07", agosto="08", septiembre="09", octubre="10", noviembre="11", diciembre="12")
  iso <- str_match(x, "(20\\d{2})-(\\d{1,2})-(\\d{1,2})")
  if (!is.na(iso[1,1])) return(sprintf("%02d/%02d/%s", as.integer(iso[1,4]), as.integer(iso[1,3]), iso[1,2]))
  a <- str_match(x, "(\\d{1,2})[/-](\\d{1,2})[/-](20\\d{2})")
  if (!is.na(a[1,1])) return(sprintf("%02d/%02d/%s", as.integer(a[1,2]), as.integer(a[1,3]), a[1,4]))
  b <- str_match(x, "(\\d{1,2})\\s+de\\s+([[:alpha:]áéíóúñ]+)\\s+(?:de\\s+)?(20\\d{2})")
  if (!is.na(b[1,1]) && b[1,3] %in% names(meses)) return(sprintf("%02d/%s/%s", as.integer(b[1,2]), meses[[b[1,3]]], b[1,4]))
  ""
}

enlaces_fuente <- function(f) {
  pagina <- read_html(f[[4]]); nodos <- html_elements(pagina, "a")
  enlaces <- url_absolute(html_attr(nodos, "href"), f[[4]]); textos <- html_text2(nodos) |> limpiar()
  ok <- !is.na(enlaces) & str_detect(enlaces, f[[5]]) & !str_detect(enlaces, "#|mailto:|tel:|\\.(pdf|jpg|jpeg|png|docx?|xlsx?)(\\?|$)|wp-content")
  enlaces <- enlaces[ok]; textos <- textos[ok]
  prioridad <- relevante(paste(enlaces, textos)) | str_detect(str_to_lower(paste(enlaces, textos)), "noticia|news|actualidad|20[0-9]{2}")
  head(unique(c(enlaces[prioridad], enlaces)), 18)
}

leer <- function(enlace, f) tryCatch({
  pagina <- read_html(enlace)
  titulo <- pagina |> html_element("h1, .entry-title, .page-title") |> html_text2() |> limpiar()
  parrafos <- pagina |> html_elements("main p, article p, .entry-content p, .post-content p") |> html_text2() |> limpiar()
  parrafos <- parrafos[nchar(parrafos) >= 60]; bajada <- if(length(parrafos)) parrafos[[1]] else ""
  if (!nzchar(titulo) || !relevante(paste(titulo, bajada))) return(NULL)
  fechas <- pagina |> html_elements("time, .entry-date, .published, .post-date, .fecha") |> html_text2() |> limpiar()
  fecha <- if(length(fechas)) fecha_ok(fechas[[1]]) else ""
  if (!nzchar(fecha)) return(NULL)
  list(titulo=titulo, bajada=bajada, fecha=fecha, region=f[[3]], comuna=f[[2]], fuente=f[[1]], link=enlace)
}, error=function(e) NULL)

leer_api_wordpress <- function(f) tryCatch({
  raiz <- str_remove(f[[4]], "/(noticias|category/noticias)/?$") |> str_remove("/$")
  api <- paste0(raiz, "/wp-json/wp/v2/posts?per_page=12&_fields=link,date,title,excerpt")
  datos <- fromJSON(api, simplifyDataFrame = TRUE)
  if (!is.data.frame(datos) || !nrow(datos)) return(list())
  noticias <- lapply(seq_len(nrow(datos)), function(i) {
    titulo <- read_html(paste0("<p>", datos$title$rendered[[i]], "</p>")) |> html_text2() |> limpiar()
    bajada <- read_html(paste0("<p>", datos$excerpt$rendered[[i]], "</p>")) |> html_text2() |> limpiar()
    fecha <- fecha_ok(datos$date[[i]])
    if (!nzchar(fecha) || !relevante(paste(titulo, bajada))) return(NULL)
    list(titulo=titulo, bajada=bajada, fecha=fecha, region=f[[3]], comuna=f[[2]], fuente=f[[1]], link=datos$link[[i]])
  })
  head(Filter(Negate(is.null), noticias), 4)
}, error=function(e) list())

leer_fuente <- function(f) tryCatch({
  message("Leyendo ", f[[1]], "...")
  # MINVU no expone este feed sin autenticación; se usa directamente su listado público.
  noticias <- if (identical(f[[1]], "MINVU")) list() else leer_api_wordpress(f)
  if (!length(noticias)) {
    noticias <- Filter(Negate(is.null), lapply(enlaces_fuente(f), leer, f=f))
    noticias <- head(noticias, 4)
  }
  noticias
}, error=function(e) { message("No se pudo consultar ", f[[1]], ". Se omitirá en esta actualización."); list() })

if (!file.exists(archivo_base)) stop("No se encontró ", archivo_base)
permanentes <- fromJSON(archivo_base, simplifyVector=FALSE)
noticias <- unlist(lapply(fuentes, leer_fuente), recursive=FALSE)
if (!length(noticias)) stop("Ninguna fuente entregó noticias utilizables. No se modificó el archivo existente.")
publicaciones <- c(permanentes, noticias)
publicaciones <- publicaciones[!duplicated(vapply(publicaciones, function(x) x$link, character(1)))]
write_json(publicaciones, archivo_salida, auto_unbox=TRUE, pretty=TRUE)
message("Listo: ", length(noticias), " noticias y ", length(permanentes), " enlaces permanentes guardados.")
