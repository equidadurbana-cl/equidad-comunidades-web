<script>
window.iniciarMapaComunas = function (el) {
  const map = el.map;

  async function iniciar() {
    let indice;

    try {
      const respuesta = await fetch("datos/comunas.json");

      if (!respuesta.ok) {
        throw new Error("No se encontró datos/comunas.json");
      }

      indice = await respuesta.json();
    } catch (error) {
      console.error(error);
      return;
    }

    map.addSource("territorio", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: []
      }
    });

    const capas = [
      {
        id: "comuna",
        type: "line",
        filter: ["==", ["get", "capa"], "comuna"],
        paint: {
          "line-color": "#363432",
          "line-width": 2
        }
      },
      {
  id: "ds19",
  type: "fill",
  filter: ["==", ["get", "capa"], "ds19"],
  paint: {
    "fill-color": "#007C91",
    "fill-opacity": 0.55
  }
},
{
  id: "ds19-bordes",
  type: "line",
  filter: ["==", ["get", "capa"], "ds19"],
  paint: {
    "line-color": "#003F4B",
    "line-width": 2.2,
    "line-opacity": 1
  }
},
{
  id: "ds19-etiquetas",
  type: "symbol",
  filter: ["==", ["get", "capa"], "ds19"],
  minzoom: 10,
  layout: {
    "text-field": ["get", "etiqueta"],
    "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
    "text-size": 11,
    "text-max-width": 12,
    "text-allow-overlap": false
  },
  paint: {
    "text-color": "#003F4B",
    "text-halo-color": "#FFFFFF",
    "text-halo-width": 1.5
  }
},
      {
        id: "colegios",
        type: "circle",
        filter: ["==", ["get", "capa"], "colegios"],
        paint: {
          "circle-color": "#f0941f",
          "circle-radius": 7,
          "circle-opacity": 0.85
        }
      },
      {
        id: "jardines",
        type: "circle",
        filter: ["==", ["get", "capa"], "jardines"],
        paint: {
          "circle-color": "#7B2CBF",
          "circle-radius": 7,
          "circle-opacity": 0.85
        }
      },
      {
        id: "bomberos",
        type: "circle",
        filter: ["==", ["get", "capa"], "bomberos"],
        paint: {
          "circle-color": "#d62828",
          "circle-radius": 7,
          "circle-opacity": 0.9
        }
      },
      {
        id: "comisarias",
        type: "circle",
        filter: ["==", ["get", "capa"], "comisarias"],
        paint: {
          "circle-color": "#2e8b57",
          "circle-radius": 7,
          "circle-opacity": 0.90
        }
      },
      {
        id: "salud",
        type: "circle",
        filter: ["==", ["get", "capa"], "salud"],
        paint: {
          "circle-color": "#1976D2",
          "circle-radius": 7,
          "circle-opacity": 0.85
        }
      }
    ];

    capas.forEach(capa => {
      map.addLayer({
        ...capa,
        source: "territorio"
      });
    });

    const controlBuscador = {
      onAdd: function () {
        const contenedor = document.createElement("div");
        contenedor.className = "maplibregl-ctrl";
        contenedor.style.cssText =
          "background:#fff;padding:8px;border-radius:4px;" +
          "box-shadow:0 1px 4px rgba(0,0,0,.25);";

        const input = document.createElement("input");
        input.type = "search";
        input.placeholder = "Buscar comuna";
        input.setAttribute("list", "lista-comunas");
        input.style.cssText =
          "width:210px;padding:6px;border:1px solid #bbb;border-radius:3px;";

        const lista = document.createElement("datalist");
        lista.id = "lista-comunas";

        indice
          .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
          .forEach(comuna => {
            const opcion = document.createElement("option");
            opcion.value = comuna.nombre;
            lista.appendChild(opcion);
          });

        document.body.appendChild(lista);
        contenedor.appendChild(input);

        input.addEventListener("change", async function () {
          const texto = input.value.trim().toLocaleLowerCase("es");

          const comuna = indice.find(
            item => item.nombre.toLocaleLowerCase("es") === texto
          );

          if (!comuna) return;

          input.disabled = true;
          input.value = "Cargando…";

          try {
            const respuesta = await fetch(
              `datos/${comuna.codigo}.geojson`
            );

            if (!respuesta.ok) {
              throw new Error("No se pudo cargar la comuna");
            }

            const datos = await respuesta.json();

            map.getSource("territorio").setData(datos);

            map.fitBounds(comuna.bbox, {
              padding: 40,
              maxZoom: 13,
              duration: 700
            });

            input.value = comuna.nombre;
          } catch (error) {
            console.error(error);
            input.value = "Error al cargar";
          } finally {
            input.disabled = false;
          }
        });

        return contenedor;
      },

      onRemove: function () {}
    };

    map.addControl(controlBuscador, "top-left");
    
   const controlLeyenda = {
  onAdd: function () {
    const contenedor = document.createElement("div");

    contenedor.className = "maplibregl-ctrl";
    contenedor.style.cssText =
      "background:#fff;padding:10px 12px;border-radius:4px;" +
      "box-shadow:0 1px 4px rgba(0,0,0,.25);font-size:13px;" +
      "line-height:1.9;";

    contenedor.innerHTML = `
      <strong>Equipamientos</strong><br>
      <span style="color:#007C91;font-size:17px;">■</span> Proyectos DS19<br>
      <span style="color:#f0941f;font-size:20px;">●</span> Educación básica y media<br>
      <span style="color:#7B2CBF;font-size:20px;">●</span> Jardines infantiles Integra y JUNJI<br>
      <span style="color:#d62828;font-size:20px;">●</span> Bomberos<br>
      <span style="color:#2e8b57;font-size:20px;">●</span> Carabineros<br>
      <span style="color:#1976D2;font-size:20px;">●</span> Centros de Salud <br>
    `;

    return contenedor;
  },

  onRemove: function () {}
};

map.addControl(controlLeyenda, "bottom-right");

    const controlCapas = {
      onAdd: function () {
        const contenedor = document.createElement("div");
        contenedor.className = "maplibregl-ctrl";
        contenedor.style.cssText = "background:#fff;padding:10px 12px;border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,.25);font:13px Arial,sans-serif;min-width:180px;";
        contenedor.innerHTML = "<strong style='display:block;margin-bottom:6px;'>Filtrar capas</strong>";
        const opciones = [
          ["ds19", "Proyectos DS19", ["ds19", "ds19-bordes", "ds19-etiquetas"]],
          ["colegios", "Educación básica y media", ["colegios"]],
          ["jardines", "Jardines infantiles", ["jardines"]],
          ["bomberos", "Bomberos", ["bomberos"]],
          ["comisarias", "Carabineros", ["comisarias"]],
          ["salud", "Centros de Salud", ["salud"]]
        ];
        const filtrosOriginales = capas.reduce(function (resultado, capa) {
          resultado[capa.id] = capa.filter;
          return resultado;
        }, {});
        const actualizarVisibilidad = function (ids, visible) {
          ids.forEach(function (id) {
            if (map.getLayer(id)) {
              // Se cambia el filtro de cada capa, no solo su apariencia. Esto funciona
              // también con puntos y polígonos cargados dinámicamente por comuna.
              map.setFilter(id, visible ? filtrosOriginales[id] : ["==", ["get", "capa"], "__oculta__"]);
            }
          });
          map.triggerRepaint();
        };
        opciones.forEach(function (opcion) {
          const etiqueta = document.createElement("label");
          etiqueta.style.cssText = "display:flex;gap:7px;align-items:center;margin:5px 0;cursor:pointer;";
          const casilla = document.createElement("input"); casilla.type = "checkbox"; casilla.checked = true;
          casilla.addEventListener("change", function () {
            actualizarVisibilidad(opcion[2], casilla.checked);
          });
          etiqueta.appendChild(casilla); etiqueta.appendChild(document.createTextNode(opcion[1])); contenedor.appendChild(etiqueta);
        });
        return contenedor;
      },
      onRemove: function () {}
    };
    map.addControl(controlCapas, "top-right");

    map.on("click", function (evento) {
      const elementos = map.queryRenderedFeatures(evento.point, {
        layers: capas.map(capa => capa.id)
      });

      const elemento = elementos.find(
        item => item.properties && item.properties.popup
      );

      if (!elemento) return;

      new maplibregl.Popup({ maxWidth: "360px" })
        .setLngLat(evento.lngLat)
        .setHTML(elemento.properties.popup)
        .addTo(map);
    });

    capas.forEach(capa => {
      map.on("mouseenter", capa.id, function () {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", capa.id, function () {
        map.getCanvas().style.cursor = "";
      });
    });
  }

  if (map.loaded()) {
    iniciar();
  } else {
    map.once("load", iniciar);
  }
};
</script>
