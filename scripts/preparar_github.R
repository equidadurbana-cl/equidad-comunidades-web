# Prepara el proyecto para su primer envío a GitHub.
# No crea commits ni publica archivos.

raiz <- normalizePath(".", winslash = "/")
if (!file.exists(file.path(raiz, "_quarto.yml"))) {
  stop("Abre el proyecto equidad-comunidades en RStudio y ejecuta este script desde su carpeta principal.")
}

if (system2("git", "--version", stdout = FALSE, stderr = FALSE) != 0) {
  stop("Git no está disponible. Avísame para instalarlo o usar otra alternativa.")
}

system2("git", c("config", "--global", "--add", "safe.directory", raiz))

url_remota <- "https://github.com/equidadurbana-cl/equidad-comunidades.git"
estado_remoto <- system2("git", c("remote", "get-url", "origin"), stdout = TRUE, stderr = FALSE)
if (length(estado_remoto) == 0) {
  system2("git", c("remote", "add", "origin", url_remota))
} else if (!identical(trimws(estado_remoto[[1]]), url_remota)) {
  stop("El proyecto ya tiene otro repositorio remoto configurado: ", estado_remoto[[1]])
}

system2("git", c("add", "."))
cat("Proyecto preparado para GitHub. Aún no se ha publicado nada.\n\n")
system2("git", c("status", "--short"))
