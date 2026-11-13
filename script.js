const selectorLocalidad = document.getElementById("selector-localidad");
const estado = document.getElementById("estado");
const panelActual = document.getElementById("panel-actual");
const nombreLocalidad = document.getElementById("nombre-localidad");
const iconoActual = document.getElementById("icono-actual");
const descripcion = document.getElementById("descripcion");
const temperatura = document.getElementById("temperatura");
const humedad = document.getElementById("humedad");
const viento = document.getElementById("viento");
const fechaHora = document.getElementById("fecha-hora");
const contenedorHoras = document.getElementById("contenedor-horas");

function obtenerMeteocon(codigo) {
  if (codigo === 0) return { texto: "Desp                                                                                        ejado", icono: "clear-day" };
  if (codigo >= 1 && codigo <= 3) return { texto: "Nublado", icono: "partly-cloudy-day" };
  if (codigo === 45 || codigo === 48) return { texto: "Niebla", icono: "fog" };
  if (codigo >= 51 && codigo <= 57) return { texto: "Llovizna", icono: "drizzle" };
  if ((codigo >= 61 && codigo <= 67) || (codigo >= 80 && codigo <= 82)) return { texto: "Lluvia", icono: "rain" };
  if ((codigo >= 71 && codigo <= 77) || codigo === 85 || codigo === 86) return { texto: "Nieve", icono: "snow" };
  if (codigo >= 95) return { texto: "Tormenta", icono: "thunderstorms-day" };
  return { texto: "Despejado", icono: "clear-day" };
}

function consultarTiempo() {
  const [latitud, longitud] = selectorLocalidad.value.split(",");
  const localidad = selectorLocalidad.options[selectorLocalidad.selectedIndex].text;

  estado.textContent = "Cargando...";
  estado.hidden = false;
  panelActual.hidden = true;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=weather_code&forecast_hours=8&timezone=auto`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }
      return response.json();
    })
    .then(data => {
      const actual = data.current;
      const unidades = data.current_units;
      const infoActual = obtenerMeteocon(actual.weather_code);

      nombreLocalidad.textContent = localidad;
      iconoActual.innerHTML = `<img src="./icons/${infoActual.icono}.svg" width="80" height="80" alt="${infoActual.texto}">`;
      descripcion.textContent = infoActual.texto;
      temperatura.textContent = `Temperatura: ${actual.temperature_2m} ${unidades.temperature_2m}`;
      humedad.textContent = `Humedad relativa: ${actual.relative_humidity_2m} ${unidades.relative_humidity_2m}`;
      viento.textContent = `Velocidad del viento: ${actual.wind_speed_10m} ${unidades.wind_speed_10m}`;
      fechaHora.textContent = `Fecha y hora: ${actual.time.replace("T", " ")}`;

      contenedorHoras.innerHTML = "";
      data.hourly.time.forEach((horaISO, indice) => {
        const codigoHora = data.hourly.weather_code[indice];
        const infoHora = obtenerMeteocon(codigoHora);
        const horaTexto = horaISO.split("T")[1];

        const tarjeta = document.createElement("div");
        tarjeta.classList.add("tarjeta-hora");
        tarjeta.innerHTML = `
          <p>${horaTexto}</p>
          <img src="./icons/${infoHora.icono}.svg" width="40" height="40" alt="${infoHora.texto}">
          <p>${infoHora.texto}</p>
        `;
        contenedorHoras.appendChild(tarjeta);
      });

      estado.hidden = true;
      panelActual.hidden = false;
    })
    .catch(error => {
      console.error(error);
      estado.textContent = "No se ha podido consultar el tiempo";
    });
}

selectorLocalidad.addEventListener("change", consultarTiempo);

consultarTiempo();