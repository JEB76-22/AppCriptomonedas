//CONSUMINOS LA API DE COINGEKO:

//Dominio: https:https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1

// Se puede separar en tres partes:

// Es el servidor de CoinGecko al que le pedís los datos.

// Ruta: /api/v3/coins/markets
// Indica qué datos querés: información de criptomonedas en formato de mercado.

// Parámetros: todo lo que viene después de ?
// Son opciones para personalizar la consulta. Se separan con &:

// vs_currency=usd: mostrar los valores en dólares.
// order=market_cap_desc: ordenar por capitalización de mercado, de mayor a menor.
// per_page=10: pedir 10 resultados.
// page=1: pedir la primera página.
// Por eso, cambiar per_page=10 por per_page=20 pediría 20 resultados. Y vs_currency=usd se puede cambiar por otra moneda admitida, como eur.

// La variante con order=volume_desc ordena por volumen de negociación, es decir, cuánto se comerció; no necesariamente representa las más populares por capitalización.

// Variables
const criptoMonedasSelect = document.querySelector("#criptomonedas");
const monedaSelect = document.querySelector("#moneda");
const formulario = document.querySelector("#formulario");
const resultado = document.querySelector("#resultado");

const objBusqueda = {
  moneda: "",
  criptomoneda: "",
};

// Arrancamos la app
document.addEventListener("DOMContentLoaded", () => {
  objBusqueda.moneda = monedaSelect.value;
  consultarCrptoMonedas();

  formulario.addEventListener("submit", submitFormulario);

  criptoMonedasSelect.addEventListener("change", leerValor);
  monedaSelect.addEventListener("change", (e) => {
    leerValor(e);
    consultarCrptoMonedas();
  });
});

// CRear un Promise
const obtenerCriptoMonedas = (criptomonedas) =>
  new Promise((resolve) => {
    resolve(criptomonedas);
  });

function consultarCrptoMonedas() {
  const { moneda } = objBusqueda;
  const llave = apikey;
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${moneda.toLowerCase()}&order=market_cap_desc&per_page=10&page=1&x_cg_demo_api_key=${llave}`;

  fetch(url)
    .then((respuesta) => {
      if (!respuesta.ok) {
        throw new Error(`CoinGecko respondió con HTTP ${respuesta.status}`);
      }
      return respuesta.json();
    })
    .then((criptomonedas) => {
      if (!Array.isArray(criptomonedas)) {
        throw new Error("La respuesta de CoinGecko no es una lista");
      }
      selectCriptoMonedas(criptomonedas);
    })
    .catch((error) => {
      console.error("No se pudieron cargar las criptomonedas:", error);
    });
}

function selectCriptoMonedas(criptomonedas) {
  criptoMonedasSelect.length = 1;
  criptomonedas.forEach((cripto) => {
    // console.log(cripto);
    const { id, name } = cripto;

    const option = document.createElement("OPTION");
    option.value = id;
    option.textContent = name;

    criptoMonedasSelect.appendChild(option);
  });
}

function leerValor(e) {
  objBusqueda[e.target.name] = e.target.value;
  // console.log(objBusqueda);
}

function submitFormulario(e) {
  e.preventDefault();

  // Validar
  const { moneda, criptomoneda } = objBusqueda;

  if (moneda === "" || criptomoneda === "") {
    mostrarAlerta("Ambos campos son obligatorios!!");
    return;
  } else {
    //Consultar la Api con los resultados
    consultarApi();
  }
}

function mostrarAlerta(msg) {
  const existeErrror = document.querySelector(".error");

  if (!existeErrror) {
    const divMensaje = document.createElement("DIV");
    divMensaje.classList.add("error");
    divMensaje.textContent = msg;

    formulario.appendChild(divMensaje);
    setTimeout(() => {
      divMensaje.remove();
    }, 3000);
  }
}

function consultarApi() {
  const { moneda, criptomoneda } = objBusqueda;
  const llave = apikey;
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${moneda.toLowerCase()}&ids=${criptomoneda}&x_cg_demo_api_key=${llave}`;
  mostrarSpinner();

  fetch(url)
    .then((respuesta) => {
      //si es distinto de respuesta.ok, error, sino  retorna formato json.
      if (!respuesta.ok) {
        throw new Error(`CoinGecko respondió con HTTP ${respuesta.status}`);
      }
      return respuesta.json();
    })
    .then((cotizacion) => {
      // cotizacion.length indica cuántos resultados contiene.
      // cotizacion.length significa que el arreglo está vacío.
      if (!cotizacion.length) {
        // throw new Error(...) genera un error y salta al .catch() asociado, donde se muestra en consola.
        throw new Error("CoinGecko no encontró datos para esa criptomoneda");
      }
      // Si sí hay resultados, cotizacion[0] es el primer objeto devuelto, con los datos de mercado.
      mostrarCotizacionHtml(cotizacion[0]);
      // console.log(cotizacion[0])
    })
    .catch((error) => {
      console.error("No se pudo consultar la cotización:", error);
    });
}

function mostrarCotizacionHtml(cotizacion) {
  limpiarHtml();

  const {
    current_price,
    high_24h,
    low_24h,
    price_change_percentage_24h,
    last_updated,
  } = cotizacion;

  const precio = document.createElement("P");
  precio.classList.add("precio");
  precio.innerHTML = `
  El Precio es: <span>$${current_price}</span> `;

  const precioAlto = document.createElement("P");
  precioAlto.innerHTML = `El precio más alto del dia: <span>$${high_24h}</span>`;

  const precioBajo = document.createElement("P");
  precioBajo.innerHTML = `El precio más bajo del dia: <span>$${low_24h}</span>`;

  const ultimasHoras = document.createElement("P");
  ultimasHoras.innerHTML = `Variación últimas 24hs: <span>${price_change_percentage_24h}%</span>`;

  const fechaActualizacion = new Date(last_updated).toLocaleString("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  });

  const ultimaActulizacion = document.createElement("P");
  ultimaActulizacion.innerHTML = `Última actualizacion: <span>${fechaActualizacion}</span>`;

  resultado.appendChild(precio);
  resultado.appendChild(precioAlto);
  resultado.appendChild(precioBajo);
  resultado.appendChild(ultimasHoras);
  resultado.appendChild(ultimaActulizacion);
}

function limpiarHtml() {
  while (resultado.firstElementChild) {
    resultado.removeChild(resultado.firstChild);
  }
}

function mostrarSpinner() {
  limpiarHtml();

  const spinner = document.createElement("DIV");
  spinner.classList.add("spinner");

  spinner.innerHTML = `
  <div class="bounce1"></div>
  <div class="bounce2"></div>
  <div class="bounce3"></div>
  `;

  resultado.appendChild(spinner);
}
