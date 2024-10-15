function historialLS(conversion) {
 let historial = JSON.parse(localStorage.getItem("historial")) || [];

 historial.push(conversion);

 localStorage.setItem("historial", JSON.stringify(historial));
}

document.getElementById("filtro").addEventListener("input", function () {
 const montoMinimo = parseFloat(this.value);
 mostrarHistorial(montoMinimo);
});

function filtrarHistorial(historial, montoMinimo) {
 return historial.filter((conversion) => {
  const monto = parseFloat(conversion.split(" ")[0]);
  return monto >= montoMinimo;
 });
}

function mostrarHistorial(montoMinimo = 0) {
 const historial = JSON.parse(localStorage.getItem("historial")) || [];
 const historialFiltrado = montoMinimo > 0 ? filtrarHistorial(historial, montoMinimo) : historial;

 const historialDiv = document.getElementById("historial");
 historialDiv.innerHTML = "";

 historialFiltrado.forEach((conversion) => {
  const p = document.createElement("p");
  p.textContent = conversion;
  historialDiv.appendChild(p);
 });
}

document.getElementById("delete").addEventListener("click", function (e) {
 e.preventDefault();

 localStorage.clear();

 mostrarHistorial();

 const tbody = document.getElementById("tbody");
 tbody.innerHTML = ``;
});

document.getElementById("form").addEventListener("submit", async function (e) {
 e.preventDefault();

 const cantidad = document.getElementById("cantidad").value;
 const valorActual = document.getElementById("valorActual").value;
 const valorCambio = document.getElementById("valorCambio").value;

 if (cantidad === "") {
  Swal.fire({
   icon: "error",
   title: "Monto Vacío",
   text: "Campo monto Vacío, por favor ingrese un monto válido",
  });
  return;
 }

 const apiKey = "de49035d7e8fe2fa62e14108";
 const paisesUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/codes`;
 const conversionUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${valorActual}`;

 try {
  const paisesResponse = await fetch(paisesUrl);
  const paisesData = await paisesResponse.json();
  const codes = paisesData.supported_codes;

  const conversionResponse = await fetch(conversionUrl);
  const conversionData = await conversionResponse.json();
  const rate = conversionData.conversion_rates[valorCambio];
  const resultado = cantidad * rate;

  const nombreValorActual = codes.find((code) => code[0] === valorActual)[1];
  const nombreValorCambio = codes.find((code) => code[0] === valorCambio)[1];

  const conversion = `${cantidad} ${valorActual} a ${valorCambio}: ${resultado.toFixed(2)} ${valorCambio}`;
  historialLS(conversion);
  mostrarHistorial();

  const tbody = document.getElementById("tbody");
  tbody.innerHTML = ``;

  const tr1 = document.createElement("tr");
  const tr2 = document.createElement("tr");

  tr1.innerHTML = `
   <td scope="row" class="text-center fs-5">Divisa Elegida</td>
   <td scope="row" class="text-center fs-5">${nombreValorActual}</td>
   <td scope="row" class="text-center fs-5">${valorActual}</td>
   <td scope="row" class="text-center fs-5">$${cantidad}</td>
  `;

  tr2.innerHTML = `
   <td scope="row" class="text-center fs-5">Divisa Conversión</td>
   <td scope="row" class="text-center fs-5">${nombreValorCambio}</td>
   <td scope="row" class="text-center fs-5">${valorCambio}</td>
   <td scope="row" class="text-center fs-5">$${resultado.toFixed(2)}</td>
  `;

  tbody.append(tr1, tr2);
 } catch (error) {
  console.error("Error al obtener los datos:", error);
 }
});

mostrarHistorial();