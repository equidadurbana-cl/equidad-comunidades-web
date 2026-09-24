# =========================================================
# CREAR ÍNDICE DE LA BIBLIOTECA
# =========================================================

library(pdftools)
library(jsonlite)

# ---------------------------------------------------------
# 1. CARPETA DE LA BIBLIOTECA
# ---------------------------------------------------------

carpeta_pdf <- "Bilbioteca"


# ---------------------------------------------------------
# 2. ENCONTRAR TODOS LOS PDF
# ---------------------------------------------------------

archivos_pdf <- list.files(
  path = carpeta_pdf,
  pattern = "\\.pdf$",
  full.names = TRUE,
  recursive = TRUE,
  ignore.case = TRUE
)


cat("PDF encontrados:", length(archivos_pdf), "\n\n")


# ---------------------------------------------------------
# 3. LEER CADA PDF
# ---------------------------------------------------------

documentos <- list()


for (i in seq_along(archivos_pdf)) {
  
  archivo <- archivos_pdf[i]
  
  cat(
    "Leyendo ",
    i,
    "/",
    length(archivos_pdf),
    ": ",
    basename(archivo),
    "\n",
    sep = ""
  )
  
  
  paginas <- tryCatch(
    
    pdftools::pdf_text(archivo),
    
    error = function(e) {
      
      cat(
        "ERROR: no se pudo leer este PDF.\n"
      )
      
      character(0)
      
    }
    
  )
  
  
  # -------------------------------------------------------
  # GUARDAR DOCUMENTO
  # -------------------------------------------------------
  
  documentos[[length(documentos) + 1]] <- list(
    
    nombre = basename(archivo),
    
    ruta = archivo,
    
    paginas = paginas
    
  )
  
}


# ---------------------------------------------------------
# 4. INFORMACIÓN DEL ÍNDICE
# ---------------------------------------------------------

cat("\n")
cat("Documentos procesados:", length(documentos), "\n\n")


for (i in seq_along(documentos)) {
  
  numero_paginas <- length(
    documentos[[i]]$paginas
  )
  
  caracteres <- sum(
    nchar(documentos[[i]]$paginas)
  )
  
  
  cat(
    i,
    ". ",
    documentos[[i]]$nombre,
    " | páginas: ",
    numero_paginas,
    " | caracteres: ",
    caracteres,
    "\n",
    sep = ""
  )
  
}


# ---------------------------------------------------------
# 5. CREAR JSON
# ---------------------------------------------------------

archivo_indice <- file.path(
  carpeta_pdf,
  "indice_biblioteca.json"
)


json <- jsonlite::toJSON(
  documentos,
  auto_unbox = TRUE,
  pretty = FALSE,
  force = TRUE
)


# ---------------------------------------------------------
# 6. GUARDAR JSON
# ---------------------------------------------------------

writeLines(
  json,
  archivo_indice,
  useBytes = TRUE
)


# ---------------------------------------------------------
# 7. CONFIRMACIÓN
# ---------------------------------------------------------

cat("\n")
cat("========================================\n")
cat("ÍNDICE CREADO CORRECTAMENTE\n")
cat("========================================\n")
cat("\n")
cat("Archivo:\n")
cat(archivo_indice)
cat("\n\n")

# =========================================================
# REVISAR TAMAÑO DE LOS FRAGMENTOS
# =========================================================

for (i in seq_along(documentos)) {
  
  cat(
    "\n",
    documentos[[i]]$nombre,
    "\n"
  )
  
  longitudes <- nchar(
    documentos[[i]]$paginas
  )
  
  cat(
    "Promedio de caracteres por página:",
    round(mean(longitudes)),
    "\n"
  )
  
  cat(
    "Máximo de caracteres en una página:",
    max(longitudes),
    "\n"
  )
  
}   
