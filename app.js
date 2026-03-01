const statusEl = document.getElementById("status");
const titleEl = document.getElementById("title");
const retryBtn = document.getElementById("retry");

const setStatus = (message) => {
  statusEl.textContent = message;
};

const copyToClipboard = async (text) => {
  await navigator.clipboard.writeText(text);
};

const openGoogleMaps = (lat, lng) => {
  const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  window.location.href = mapUrl;
};

const runSpotAutomation = async () => {
  titleEl.textContent = "Azione /spot";
  setStatus("Richiesta posizione in corso…");

  if (!navigator.geolocation) {
    throw new Error("Geolocalizzazione non supportata dal browser.");
  }

  const position = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });

  const { latitude, longitude } = position.coords;
  const coordinates = `${latitude},${longitude}`;

  await copyToClipboard(coordinates);
  setStatus("Coordinate copiate. Apertura Google Maps…");
  openGoogleMaps(latitude, longitude);
};

const boot = async () => {
  retryBtn.classList.add("hidden");

  const path = window.location.pathname.replace(/\/+$/, "") || "/";

  if (path !== "/spot") {
    titleEl.textContent = "Azione non configurata";
    setStatus(
      "Percorso non supportato. Usa /spot per avviare geolocalizzazione, copia coordinate e apertura Google Maps."
    );
    return;
  }

  try {
    await runSpotAutomation();
  } catch (error) {
    setStatus(`Errore: ${error.message}. Tocca \"Riprova\".`);
    retryBtn.classList.remove("hidden");
  }
};

retryBtn.addEventListener("click", () => {
  boot();
});

boot();
