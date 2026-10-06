library(sf)
library(jsonlite)

# Puede ejecutarse desde la raíz del proyecto o desde la carpeta Mapa.
carpeta_mapa <- if (file.exists(file.path("Mapa", "mapa_comunidad.gpkg"))) "Mapa" else "."
gpkg <- file.path(carpeta_mapa, "mapa_comunidad.gpkg")
salida <- file.path(carpeta_mapa, "datos")

dir.create(salida, recursive = TRUE, showWarnings = FALSE)

# Usar GEOS en vez de s2 y reparar geometrías inválidas
sf::sf_use_s2(FALSE)

leer_capa <- function(nombre_capa) {
  capa <- st_read(gpkg, layer = nombre_capa, quiet = TRUE)
  
  capa <- st_make_valid(capa)
  capa <- capa[!st_is_empty(capa), ]
  
  st_transform(capa, 3857)
}

como_capa <- function(x, nombre, popup = "", campo_etiqueta = NULL) {
  textos_popup <- if ("popup" %in% names(x)) {
    as.character(x$popup)
  } else {
    rep(popup, nrow(x))
  }
  
  etiquetas <- if (
    !is.null(campo_etiqueta) &&
    campo_etiqueta %in% names(x)
  ) {
    as.character(x[[campo_etiqueta]])
  } else {
    rep("", nrow(x))
  }
  
  st_sf(
    capa = rep(nombre, nrow(x)),
    popup = textos_popup,
    etiqueta = etiquetas,
    geometry = st_geometry(x)
  )
}

# Cargar y reparar las capas
comunas    <- leer_capa("comunas")
ds19       <- leer_capa("DS19_todos")
colegios   <- leer_capa("colegios")
jardines   <- leer_capa("jardines_infantiles2")
bomberos   <- leer_capa("bomberos")
comisarias <- leer_capa("comisarias")
salud <- leer_capa("establecimientos_de_salud")
municipios <- leer_capa("layer_municipios_20230915121302")

# Textos emergentes
ds19$popup <- paste0(
  "<strong>", ds19$NOM_PROY, "</strong><br><br>",
  "<strong>Programa:</strong> ", ds19$PROGRAMA, "<br>",
  "<strong>Comuna:</strong> ", ds19$COM, "<br>",
  "<strong>Región:</strong> ", ds19$REGION, "<br>",
  "<strong>Año de inicio:</strong> ", ds19$AGNO_INI
)

colegios$popup <- paste0(
  "<strong>", colegios$NOM_RBD, "</strong><br><br>",
  "<strong>Dirección:</strong> ",
  colegios$DIRECCION, " ", colegios$NUMERO
)

jardines$popup <- paste0(
  "<strong>", jardines$NOMBRE, "</strong><br><br>",
  "<strong>Dirección:</strong> ",
  jardines$DIRECCION, " ", jardines$NUMERO
)

bomberos$popup <- paste0(
  "<strong>Cuerpo de Bomberos</strong><br><br>",
  "<strong>Dirección:</strong> ",
  bomberos$NOMBRE_DE, " ", bomberos$NUMERACIó
)

comisarias$popup <- paste0(
  "<strong>", comisarias$NOMBRE_UNI, "</strong><br><br>",
  "<strong>Dirección:</strong> ",
  comisarias$NOMBRE_DE, " ", comisarias$NUMERO
)

salud$popup <- paste0(
  "<strong>", salud$NOMBRE, "</strong><br><br>",
  "<strong>Tipo de atención:</strong> ", salud$TIPO, "<br>",
  "<strong>Dirección:</strong> ",
  salud$DIRECCIÓN, " ",  salud$NUMERO
)

municipios$popup <- paste0(
  "<strong>Municipalidad de ", municipios$NOM_COM, "</strong><br><br>",
  "<strong>Dirección:</strong> ", municipios$DIRECCION, "<br>",
  "<strong>Región:</strong> ", municipios$NOM_REG
)

# Índice ligero que utilizará el buscador
indice <- vector("list", nrow(comunas))

# Crear un GeoJSON por comuna
for (i in seq_len(nrow(comunas))) {
  comuna <- comunas[i, ]
  
  codigo <- as.character(comuna$cod_comuna)
  nombre <- as.character(comuna$Comuna)
  bbox <- as.numeric(st_bbox(st_transform(comuna, 4326)))
  
  piezas <- list(
    como_capa(comuna, "comuna"),
    como_capa(
      st_filter(ds19, comuna),
      "ds19",
      campo_etiqueta = "NOM_PROY"
    ),
    como_capa(st_filter(colegios, comuna), "colegios"),
    como_capa(st_filter(jardines, comuna), "jardines"),
    como_capa(st_filter(bomberos, comuna), "bomberos"),
    como_capa(st_filter(comisarias, comuna), "comisarias"),
    como_capa(st_filter(salud, comuna), "salud"),
    como_capa(st_filter(municipios, comuna), "municipios")
  )
  
  datos_comuna <- do.call(rbind, piezas) |>
    st_transform(4326)
  
  st_write(
    datos_comuna,
    file.path(salida, paste0(codigo, ".geojson")),
    delete_dsn = TRUE,
    quiet = TRUE
  )
  
  indice[[i]] <- list(
    codigo = codigo,
    nombre = nombre,
    bbox = bbox
  )
}

# Guardar el listado que alimenta el buscador
write_json(
  indice,
  file.path(salida, "comunas.json"),
  auto_unbox = TRUE,
  pretty = FALSE
)

message("Listo: se creó la carpeta 'datos' con el índice y los GeoJSON por comuna.")
