"use strict";
// import { DotLottie } from "@lottiefiles/dotlottie-web";
import { DotLottie } from "https://cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-web/+esm";

// const dotLottie = new DotLottie({
//   autoplay: true,
//   loop: true,
//   canvas: document.querySelector("#dotlottie-canvas"),
//   src: "https://lottie.host/aef27441-79ba-4a76-b81e-40f05021539c/uQoj6tXa4t.lottie", // replace with your .lottie or .json file URL
// });

/*
=========================================================
   CALCULADORA DE SENSACIÓN TÉRMICA
=========================================================
*/

// -------------------------------------------------------
// ELEMENTOS
// -------------------------------------------------------

const tarjetaActual = document.getElementById("tarjetaActual");
const tarjetaLocal = document.getElementById("tarjetaLocal");
const temperaturaInput = document.getElementById("temperatura");
const vientoInput = document.getElementById("viento");
const btnCalcular = document.getElementById("btnCalcular");
const btnUbicacion = document.getElementById("btnUbicacion");
const btnUbicacionLocal = document.getElementById("btnUbicacionLocal");
const btnUbicacionCoordenadas = document.querySelector(
  "#btnUbicacionCoordenadas",
);
const sensacionTermica = document.getElementById("sensacionTermica");
const descripcion = document.getElementById("descripcion");
const tempActual = document.getElementById("tempActual");
const tempActualLocal = document.getElementById("tempActualLocal");
const vientoActual = document.getElementById("vientoActual");
const vientoActualLocal = document.getElementById("vientoActualLocal");
const sensacionActual = document.getElementById("sensacionActual");
const sensacionActualLocal = document.getElementById("sensacionActualLocal");
const ubicacion = document.getElementById("ubicacion");
const ubicacionLocal = document.getElementById("ubicacionLocal");
const estadoConexion = document.getElementById("estadoConexion");
const resultadoTitulo = document.querySelector(".resultado-titulo");

const iconoTermometro = document.querySelectorAll(".imgTermo");
const iconoViento = document.querySelectorAll(".imgWind");
const iconoSensacion = document.querySelectorAll(".imgSens");

let origen = null;
let origenUbicacion;
let data = null;
let resp = null;
let localidad = null;
let provincia = null;
let pais = null;
let latitud = null;
let longitud = null;
let horas = null;
let selector = null;
let source = null;
let dia;
let tempFormateada;

const imgs = {
  termometro:
    "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/thermometer-celsius.svg",
  termometroNoche:
    "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/thermometer-moon.svg",
  termometroDia:
    "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/thermometer-sun.svg",
  viento: "https://cdn.meteocons.com/3.0.0-next.10/svg/monochrome/wind.svg",
  viento2:
    "https://img.icons8.com/?id=F4su0C1QrkX4&format=gif&size=40&name=icons8-windy-weather.gif&fromSite=true",
  viento3:
    "https://lottie.host/7bc7f304-a2a5-420d-af8f-8fa5b8a8bdf0/GLGMgXyhls.lottie",
  calor:
    "https://lottie.host/7c978296-1a84-4f99-80f7-1ea7a8dc3c0c/jhw4B69iuv.lottie",
  frio: "https://lottie.host/aef27441-79ba-4a76-b81e-40f05021539c/uQoj6tXa4t.lottie",
  agradable:
    "https://lottie.host/516da975-3be8-4e39-a463-a825c434c68a/2HpX4nEUMI.lottie",
};

const valoresIniciales = {
  ubicacion: "Ubicación no determinada",
  tempActual: "-- °C",
  vientoActual: "-- km/h",
  sensacionActual: "-- °C",
};

function limpiarCondicionesActuales(origen) {
  if (origen === "Local") {
    document.querySelector("#ubicacion").textContent =
      valoresIniciales.ubicacion;

    document.querySelector("#tempActual").textContent =
      valoresIniciales.tempActual;

    document.querySelector("#vientoActual").textContent =
      valoresIniciales.vientoActual;

    document.querySelector("#sensacionActual").textContent =
      valoresIniciales.sensacionActual;
  } else if (origen === "Actual") {
    document.querySelector("#ubicacionLocal").textContent =
      valoresIniciales.ubicacion;

    document.querySelector("#tempActualLocal").textContent =
      valoresIniciales.tempActual;

    document.querySelector("#vientoActualLocal").textContent =
      valoresIniciales.vientoActual;

    document.querySelector("#sensacionActualLocal").textContent =
      valoresIniciales.sensacionActual;
  }
}

async function obtenerSol(latitud, longitud) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&daily=sunrise,sunset&timezone=auto`;

    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      throw new Error("No se pudieron obtener los datos solares");
    }

    const datos = await respuesta.json();

    const amanecer = datos.daily.sunrise[0];
    const puestaSol = datos.daily.sunset[0];

    return {
      amanecer: formatearHora(amanecer),
      amanecer2: amanecer,
      puestaSol: formatearHora(puestaSol),
      puestaSol2: puestaSol,
      fecha: datos.daily.time[0],
    };
  } catch (error) {
    console.error("Error obteniendo amanecer y puesta del sol:", error);

    return {
      amanecer: null,
      puestaSol: null,
      fecha: null,
    };
  }
}

function esDeDia(amanecer, puestaSol, ahora = new Date()) {
  const minutos = (fecha) => fecha.getHours() * 60 + fecha.getMinutes();

  return (
    minutos(ahora) >= minutos(amanecer) && minutos(ahora) < minutos(puestaSol)
  );
}

function formatearHora(fechaHora) {
  const fecha = new Date(fechaHora);

  return fecha.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  const date = new Date();
  horas = date.toLocaleString("es-ES", { hour: "numeric", hour24: true });
  try {
    const location = await getLocationWithAddress();
    //console.log(location);
    localidad = location.localidad || location.provincia || location.pais;
    //console.log(localidad);
    if (localidad.includes("Aluminé") || localidad.includes("Villa Pehuenia")) {
      tarjetaLocal.style.order = "1";
      tarjetaActual.style.order = "2";
      //   tarjetaLocal.style.display = "block";
      //   tarjetaActual.style.display = "none";
    } else {
      //   tarjetaLocal.style.display = "none";
      //   tarjetaActual.style.display = "block";
    }
    const datosSol = await obtenerSol(location.latitude, location.longitude);

    const amanecer = new Date(datosSol.amanecer2);
    const puestaSol = new Date(datosSol.puestaSol2);

    const deDia = esDeDia(amanecer, puestaSol);
    if (deDia) {
      iconoTermometro.forEach((item) => {
        item.src = imgs.termometroDia;
      });
    } else {
      iconoTermometro.forEach((item) => {
        item.src = imgs.termometroNoche;
      });
    }
    const canvasWind = document.querySelectorAll("#dotlottie-canvas-wind");

    canvasWind.forEach((canvas) => {
      new DotLottie({
        autoplay: true,
        loop: true,
        canvas: canvas,
        src: imgs.viento3,
      });
    });

    //console.log(deDia);
  } catch (err) {
    console.error(err.message);
  }
});

/**
 * Obtiene latitud, longitud y localidad/provincia/país del usuario.
 * Combina Geolocation API (navegador) + reverse geocoding (BigDataCloud).
 *
 * @param {Object} options
 * @param {boolean} [options.enableHighAccuracy=true] - GPS vs. red/WiFi
 * @param {number} [options.timeout=10000] - ms antes de abortar la geolocalización
 * @param {number} [options.maximumAge=0] - ms de caché aceptable para la posición
 * @param {string} [options.language='es'] - idioma de la respuesta de localidad
 * @returns {Promise<{
 *   latitude: number,
 *   longitude: number,
 *   accuracy: number,
 *   localidad: string|null,
 *   provincia: string|null,
 *   pais: string|null,
 *   raw: Object
 * }>}
 */
async function getLocationWithAddress(options = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    language = "es",
  } = options;

  // --- Paso 1: coordenadas ---
  const coords = await getCurrentPosition({
    enableHighAccuracy,
    timeout,
    maximumAge,
  });

  // --- Paso 2: reverse geocoding ---
  const address = await reverseGeocode(
    coords.latitude,
    coords.longitude,
    language,
  );

  return {
    ...coords,
    ...address,
  };
}

/**
 * Wrapper con Promise sobre navigator.geolocation.getCurrentPosition.
 */
function getCurrentPosition({ enableHighAccuracy, timeout, maximumAge }) {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(
        new Error(
          "GEOLOCATION_UNSUPPORTED: la API no está disponible en este navegador",
        ),
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }),
      (error) => reject(mapGeolocationError(error)),
      { enableHighAccuracy, timeout, maximumAge },
    );
  });
}

/**
 * Reverse geocoding vía BigDataCloud (gratis, sin key, CORS abierto).
 */
async function reverseGeocode(lat, lon, language = "es") {
  //console.log(`lat = ${lat} - long = ${lon}`);
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${language}`;

  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw new Error(`REVERSE_GEOCODE_NETWORK_ERROR: ${err.message}`);
  }

  if (!response.ok) {
    throw new Error(`REVERSE_GEOCODE_HTTP_ERROR: ${response.status}`);
  }

  const data = await response.json();

  return {
    localidad: data.locality || data.city || null,
    provincia: data.principalSubdivision || null,
    pais: data.countryName || null,
    raw: data,
  };
}

/**
 * Traduce códigos de error de Geolocation API a mensajes claros.
 */
function mapGeolocationError(error) {
  const errorMap = {
    1: "PERMISSION_DENIED: el usuario rechazó el permiso de ubicación",
    2: "POSITION_UNAVAILABLE: no se pudo determinar la posición",
    3: "TIMEOUT: se agotó el tiempo de espera",
  };
  return new Error(
    errorMap[error.code] || `GEOLOCATION_UNKNOWN_ERROR: ${error.message}`,
  );
}

// -------------------------------------------------------
// CALCULAR SENSACIÓN TÉRMICA
// -------------------------------------------------------

function calcularSensacionTermica(temperatura, viento) {
  /*
    Fórmula Wind Chill:

    Tst = 13.12
        + 0.6215 * T
        - 11.37 * V^0.16
        + 0.3965 * T * V^0.16

    T = temperatura en °C
    V = viento en km/h
    */

  // Si no hay viento significativo,
  // la sensación es aproximadamente la temperatura.

  if (viento <= 4.8) {
    return temperatura;
  }

  /*
    La fórmula se utiliza para condiciones frías.
    Para temperaturas superiores a 10 °C
    no resulta apropiado utilizar Wind Chill.
    */

  if (temperatura > 10) {
    return temperatura;
  }

  const resultado =
    13.12 +
    0.6215 * temperatura -
    11.37 * Math.pow(viento, 0.16) +
    0.3965 * temperatura * Math.pow(viento, 0.16);

  return resultado;
}

// -------------------------------------------------------
// DESCRIPCIÓN
// -------------------------------------------------------

// function obtenerDescripcion2(temperatura, origen) {
//   console.log(temperatura);
//   if (origen === "local") {
//     selector = "#dotlottie-canvas-local";
//   } else {
//     selector = "#dotlottie-canvas-actual";
//   }
//   if (temperatura >= 15) {
//     return "Sensación agradable";
//   }

//   if (temperatura >= 10) {
//     return "Fresco";
//   }

//   if (temperatura > 5 && temperatura <= 10) {
//     return "Frío";
//   }

//   if (temperatura >= 0 && temperatura <= 5) {
//     return "Frío intenso";
//   }

//   if (temperatura >= -10) {
//     return "Muy frío";
//   }

//   if (temperatura >= -20) {
//     return "Frío extremo";
//   }

//   return "Frío peligroso";
// }

function obtenerDescripcion(temperatura, origen) {
  if (origen === "local") {
    selector = "#dotlottie-canvas-local";
  } else if (origen === "resultado") {
    selector = "#dotlottie-canvas-resultado";
  } else {
    selector = "#dotlottie-canvas-actual";
  }

  if (temperatura >= 15) {
    return {
      descripcion: "Caluroso",
      nivel: 1,
      selector: selector,
    };
  }

  if (temperatura >= 0) {
    return {
      descripcion: "Cómodo o fresco",
      nivel: 1,
      selector: selector,
    };
  }

  if (temperatura >= -10) {
    return {
      descripcion: "Frío moderado",
      nivel: 2,
      selector: selector,
    };
  }

  if (temperatura >= -25) {
    return {
      descripcion: "Muy frío",
      nivel: 3,
      selector: selector,
    };
  }

  if (temperatura >= -45) {
    return {
      descripcion: "Frío peligroso",
      nivel: 4,
      selector: selector,
    };
  }

  return {
    descripcion: "Frío extremo",
    nivel: 5,
    selector: selector,
  };
}

// -------------------------------------------------------
// MOSTRAR RESULTADO
// -------------------------------------------------------

function mostrarResultado(temperatura, viento) {
  const resultado = calcularSensacionTermica(temperatura, viento);
  if (
    btnUbicacion.classList.contains("presionado") ||
    btnUbicacionCoordenadas.classList.contains("presionado")
  ) {
    sensacionTermica.textContent = `${resultado.toFixed(1)} °C`;
    tempFormateada = resultado;
  } else {
    const tempCsensacion = (resultado - 32) / 1.8;
    tempFormateada = (resultado - 32) / 1.8;
    if (localidad.includes("Aluminé") || localidad.includes("Villa Pehuenia")) {
      sensacionTermica.textContent = `${tempCsensacion.toFixed(1)} °C`;
      tempFormateada = (resultado - 32) / 1.8;
    } else {
      sensacionTermica.textContent = `${resultado.toFixed(1)} °C`;
      tempFormateada = resultado;
    }
  }
  const lade = obtenerDescripcion(tempFormateada, origenUbicacion);
  //console.log(lade.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
  //console.log(lade);
  if (
    lade.descripcion
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .includes("frio")
  ) {
    source = `${imgs.frio}`;
  } else if (
    lade.descripcion
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .includes("comodo")
  ) {
    source = `${imgs.agradable}`;
  } else if (
    lade.descripcion
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .includes("caluroso")
  ) {
    source = `${imgs.calor}`;
  }
  const dotLottie = new DotLottie({
    autoplay: true,
    loop: true,
    canvas: document.querySelector(`${selector}`),
    src: `${source}`, // replace with your .lottie or .json file URL
  });
  const dotLottie2 = new DotLottie({
    autoplay: true,
    loop: true,
    canvas: document.querySelector(`#dotlottie-canvas-resultado`),
    src: `${source}`, // replace with your .lottie or .json file URL
  });

  descripcion.textContent = lade.descripcion; //obtenerDescripcion(resultado, origenUbicacion);
  document.querySelector(`#dotlottie-canvas-resultado`).style.display = "unset";

  return resultado;
}

function mostrarResultadoManual(temperatura, viento) {
  const resultado = calcularSensacionTermica(temperatura, viento);

  sensacionTermica.textContent = `${resultado.toFixed(1)} °C`;
  //}
  origenUbicacion = "resultado";
  const lade = obtenerDescripcion(resultado, origenUbicacion);
  //console.log(lade);
  if (
    lade.descripcion
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .includes("frio")
  ) {
    source = `${imgs.frio}`;
  } else if (
    lade.descripcion
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .includes("comodo")
  ) {
    source = `${imgs.agradable}`;
  } else if (
    lade.descripcion
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .includes("caluroso")
  ) {
    source = `${imgs.calor}`;
  }
  const dotLottie = new DotLottie({
    autoplay: true,
    loop: true,
    canvas: document.querySelector(`${selector}`),
    src: `${source}`, // replace with your .lottie or .json file URL
  });

  descripcion.textContent = lade.descripcion; //obtenerDescripcion(resultado, origenUbicacion);
  document.querySelector(`#dotlottie-canvas-resultado`).style.display = "unset";

  return resultado;
}

// -------------------------------------------------------
// CALCULO MANUAL
// -------------------------------------------------------

function calcularManual() {
  const temperatura = parseFloat(temperaturaInput.value);

  const viento = parseFloat(vientoInput.value);

  if (Number.isNaN(temperatura) || Number.isNaN(viento)) {
    alert("Ingresá la temperatura y la velocidad del viento.");

    return;
  }

  if (viento < 0) {
    alert("La velocidad del viento no puede ser negativa.");

    return;
  }

  mostrarResultadoManual(temperatura, viento);
}

// -------------------------------------------------------
// OBTENER UBICACIÓN
// -------------------------------------------------------

function obtenerUbicacion() {
  if (!navigator.geolocation) {
    alert("Tu navegador no permite obtener la ubicación.");

    return;
  }

  estadoConexion.textContent = "●";

  navigator.geolocation.getCurrentPosition(
    (posicion) => {
      latitud = posicion.coords.latitude;

      longitud = posicion.coords.longitude;
      //console.log(posicion.coords);

      obtenerClima(latitud, longitud);
    },

    (error) => {
      console.error(error);

      alert("No fue posible obtener tu ubicación.");
    },

    {
      enableHighAccuracy: true,

      timeout: 10000,

      maximumAge: 300000,
    },
  );
}

async function obtenerUbicacionLocal() {
  if (!navigator.geolocation) {
    alert("Tu navegador no permite obtener la ubicación.");

    return;
  }
  origen =
    "https://api.weather.com/v2/pws/observations/current?stationId=IALUMI7&format=json&units=e&numericPrecision=decimal&apiKey=a781055ea4224f7b81055ea4224f7b78";
  const options = {
    headers: {
      "Accept-Encoding": "gzip",
    },
  };
  resp = await fetch(origen, options);
  data = await resp.json();
  //console.log(data);
  const temperatura = data.observations[0].imperial.temp;
  const viento = data.observations[0].imperial.windSpeed;
  const tempC = (temperatura - 32) / 1.8;
  origenUbicacion = "local";
  const resultado = mostrarResultado(temperatura, viento);
  const tempCsensacion = (resultado - 32) / 1.8;
  latitud = data.observations[0].lat;
  longitud = data.observations[0].lon;

  sensacionActualLocal.textContent = `${tempCsensacion.toFixed(1)} °C`;
  tempActualLocal.textContent = `${tempC.toFixed(1)} °C`;
  vientoActualLocal.textContent = `${viento.toFixed(1)} km/h`;
  temperaturaInput.value = tempC.toFixed(1);
  vientoInput.value = viento.toFixed(1);
  //resultadoTitulo.textContent = ` Sensación térmica ${data.observations[0].neighborhood}`;

  (async () => {
    const address = await reverseGeocode(latitud, longitud, "es");
    //console.log(address);
    localidad = address.localidad.replace("Departamento", "");
    provincia = address.provincia;
    pais = address.pais;
    ubicacionLocal.textContent =
      localidad + " · " + latitud.toFixed(4) + ", " + longitud.toFixed(4);
    resultadoTitulo.textContent = ` Sensación térmica ${localidad}, ${provincia} - ${pais}`;
  })();
}

// -------------------------------------------------------
// OBTENER CLIMA ACTUAL
// -------------------------------------------------------

async function obtenerClima(latitud, longitud) {
  try {
    estadoConexion.textContent = "●";
    (async () => {
      const address = await reverseGeocode(latitud, longitud, "es");
      //console.log(address);
      localidad = address.localidad.replace("Departamento", "");
      provincia = address.provincia;
      pais = address.pais;
      resultadoTitulo.textContent = ` Sensación térmica ${localidad}, ${provincia} - ${pais}`;
    })();

    const url = //`https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&hourly=temperature_2m,wind_speed_10m,apparent_temperature&timezone=auto&forecast_days=1`;
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitud}` +
      `&longitude=${longitud}` +
      `&current=temperature_2m,wind_speed_10m,wind_direction_10m` +
      `&temperature_unit=celsius` +
      `&wind_speed_unit=kmh` +
      `&timezone=auto`;

    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      throw new Error("Error al consultar el servicio meteorológico.");
    }

    const datos = await respuesta.json();
    //console.log(datos);

    const temperatura = datos.current.temperature_2m;

    const viento = datos.current.wind_speed_10m;

    const direccion = datos.current.wind_direction_10m;

    tempActual.textContent = `${temperatura.toFixed(1)} °C`;

    vientoActual.textContent = `${viento.toFixed(1)} km/h`;
    origenUbicacion = "actual";

    const resultado = mostrarResultado(temperatura, viento);

    sensacionActual.textContent = `${resultado.toFixed(1)} °C`;

    ubicacion.textContent =
      `${latitud.toFixed(4)}, ` +
      `${longitud.toFixed(4)} · ` +
      `Viento ${direccion}°`;

    // También cargamos los valores
    // en el formulario.

    temperaturaInput.value = temperatura.toFixed(1);

    vientoInput.value = viento.toFixed(1);

    estadoConexion.textContent = "●";
  } catch (error) {
    console.error(error);

    estadoConexion.textContent = "●";

    alert("No fue posible obtener los datos meteorológicos.");
  }
}

function crearModalCoordenadas() {
  // Evitar crear el modal más de una vez
  if (document.querySelector("#modalCoordenadas")) {
    document.querySelector("#modalCoordenadas").classList.add("mostrar");
    return;
  }

  const modal = document.createElement("div");

  modal.id = "modalCoordenadas";
  modal.className = "modal-coordenadas";

  modal.innerHTML = `
    <div class="modal-contenido">

      <button class="modal-cerrar" id="cerrarModalCoordenadas">
        &times;
      </button>

      <h2>Ingresar coordenadas</h2>

      <p>Ingresá la ubicación para obtener la temperatura.</p>

      <div class="campo">
        <label for="latitud">Latitud</label>
        <input
          type="number"
          id="latitud"
          placeholder="-38.9000"
          step="any"
        >
      </div>

      <div class="campo">
        <label for="longitud">Longitud</label>
        <input
          type="number"
          id="longitud"
          placeholder="-71.0500"
          step="any"
        >
      </div>

      <button id="btnObtenerTemperatura" class="btn-obtener">
        Obtener temperatura
      </button>

    </div>
  `;

  document.body.appendChild(modal);

  // Mostrar modal
  requestAnimationFrame(() => {
    modal.classList.add("mostrar");
  });

  // Cerrar
  document
    .querySelector("#cerrarModalCoordenadas")
    .addEventListener("click", () => {
      cerrarModalCoordenadas();
    });

  // Cerrar haciendo click fuera del contenido
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      cerrarModalCoordenadas();
    }
  });

  // Botón obtener temperatura
  document
    .querySelector("#btnObtenerTemperatura")
    .addEventListener("click", () => {
      const latitud = parseFloat(document.querySelector("#latitud").value);

      const longitud = parseFloat(document.querySelector("#longitud").value);

      // Validar coordenadas
      if (isNaN(latitud) || isNaN(longitud)) {
        alert("Ingresá una latitud y longitud válidas.");
        return;
      }

      if (latitud < -90 || latitud > 90) {
        alert("La latitud debe estar entre -90 y 90.");
        return;
      }

      if (longitud < -180 || longitud > 180) {
        alert("La longitud debe estar entre -180 y 180.");
        return;
      }

      // Acá llamamos a tu función para obtener la temperatura
      obtenerClima(latitud, longitud);

      cerrarModalCoordenadas();
    });
}

function cerrarModalCoordenadas() {
  const modal = document.querySelector("#modalCoordenadas");

  if (!modal) return;

  modal.classList.remove("mostrar");
}

// -------------------------------------------------------
// EVENTOS
// -------------------------------------------------------

btnUbicacionCoordenadas.addEventListener("click", () => {
  btnUbicacionCoordenadas.classList.add("presionado");
  crearModalCoordenadas();
  limpiarCondicionesActuales("Actual");
});

btnCalcular.addEventListener("click", () => {
  calcularManual();
  limpiarCondicionesActuales("Actual");
  limpiarCondicionesActuales("Local");
  resultadoTitulo.textContent = ` Sensación térmica `;
});

//btnUbicacion.addEventListener("click", obtenerUbicacion);
btnUbicacion.addEventListener("click", function (e) {
  btnUbicacion.classList.add("presionado");
  obtenerUbicacion();
  limpiarCondicionesActuales("Actual");
});
btnUbicacionLocal.addEventListener("click", () => {
  if (btnUbicacion.className.includes("presionado")) {
    btnUbicacion.classList.remove("presionado");
  }
  if (btnUbicacionCoordenadas.className.includes("presionado")) {
    btnUbicacionCoordenadas.classList.remove("presionado");
  }
  obtenerUbicacionLocal();
  limpiarCondicionesActuales("Local");
});

// Permitir ENTER en los campos

temperaturaInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    calcularManual();
  }
});

vientoInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    calcularManual();
  }
});
