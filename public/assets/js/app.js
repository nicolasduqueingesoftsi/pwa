// 📌 Verificar autenticación y actualizar la interfaz
function checkAuth() {
    const token = localStorage.getItem("oauth_token");

    if (token) {
        document.getElementById("loginContainer").style.display = "none";
        document.getElementById("mainContainer").style.display = "block";
        cargarNotas();  // Cargar notas después del login
        initMap();  // Iniciar mapa después del login
    } else {
        document.getElementById("loginContainer").style.display = "block";
        document.getElementById("mainContainer").style.display = "none";
    }
}

// 📌 Autenticación con la API externa
document.getElementById("loginBtn").addEventListener("click", async () => {
    const username = document.getElementById("dniLogin").value.trim();
    const password = document.getElementById("passwordLogin").value.trim();

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username,
                password,
                imei: "eimei",
                device_model: "device_model",
                android_version: "android_version",
                app_version: "1"
            })
        });

        const data = await response.json();
        if (data.token) {
            console.log("✅ Usuario autenticado:", data);

            // 📌 Guardar datos en localStorage para persistencia
            localStorage.setItem("oauth_token", data.token);
            localStorage.setItem("oauth_expiration", Date.now() + data.expires_in * 1000);
            localStorage.setItem("user_email", username);

            alert("✅ Inicio de sesión exitoso.");
            checkAuth();
        } else {
            alert("❌ Usuario o contraseña incorrectos.");
        }
    } catch (error) {
        console.error("❌ Error en autenticación:", error);
        alert("❌ Error en el servidor.");
    }
});

// 📌 Cerrar sesión
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("oauth_token");
    localStorage.removeItem("oauth_expiration");
    localStorage.removeItem("user_email");

    checkAuth();
});

// 📌 Verificar expiración del token y renovarlo si es necesario
async function checkTokenExpiration() {
    const expirationTime = localStorage.getItem("oauth_expiration");

    if (!expirationTime || Date.now() > expirationTime) {
        console.log("🔄 Token expirado. Solicitando nuevo...");
        await renewAuthToken();
    }
}

// 📌 Renovar Token OAuth2
async function renewAuthToken() {
    try {
        const response = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: localStorage.getItem("oauth_token") })
        });

        const data = await response.json();

        if (data.token) {
            console.log("✅ Token renovado correctamente.");
            localStorage.setItem("oauth_token", data.token);
            localStorage.setItem("oauth_expiration", Date.now() + data.expires_in * 1000);
        } else {
            console.log("❌ No se pudo renovar el token. Redirigiendo al login.");
            localStorage.removeItem("oauth_token");
            checkAuth();
        }
    } catch (error) {
        console.error("❌ Error renovando token:", error);
        localStorage.removeItem("oauth_token");
        checkAuth();
    }
}

// 📌 Modo Oscuro/Día
const toggleButton = document.getElementById("modoToggle");
toggleButton.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("modoOscuro", document.body.classList.contains("dark-mode"));
});

// Aplicar el modo oscuro si estaba activado
if (localStorage.getItem("modoOscuro") === "true") {
    document.body.classList.add("dark-mode");
}

// 📌 IndexedDB: Almacenar notas offline
let db;
const request = indexedDB.open("pwaDB", 1);

request.onupgradeneeded = event => {
    db = event.target.result;
    db.createObjectStore("notas", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = event => {
    db = event.target.result;
    cargarNotas();
};

request.onerror = event => {
    console.error("❌ Error al abrir IndexedDB:", event.target.errorCode);
};

// 📌 Guardar una nota en IndexedDB
function guardarNota(texto) {
    const tx = db.transaction(["notas"], "readwrite");
    const store = tx.objectStore("notas");
    store.add({ texto, fecha: new Date() });
}

// 📌 Cargar notas desde IndexedDB
function cargarNotas() {
    const tx = db.transaction(["notas"], "readonly");
    const store = tx.objectStore("notas");
    const request = store.getAll();

    request.onsuccess = () => {
        const listaNotas = document.getElementById("listaNotas");
        listaNotas.innerHTML = "";
        request.result.forEach(nota => {
            const li = document.createElement("li");
            li.textContent = `${nota.texto} (📅 ${new Date(nota.fecha).toLocaleDateString()})`;
            listaNotas.appendChild(li);
        });
    };
}

// 📌 Obtener ubicación y mostrar en Google Maps
let map;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 0, lng: 0 },
        zoom: 15,
    });
}

// 📌 Botón para obtener ubicación
document.getElementById("getLocation").addEventListener("click", () => {
    if (!map) {
        alert("⚠️ El mapa aún no se ha inicializado.");
        return;
    }

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
            const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };

            map.setCenter(userLocation);
            new google.maps.Marker({
                position: userLocation,
                map: map,
                title: "Tu Ubicación",
            });

            console.log("📍 Ubicación obtenida:", userLocation);
        }, error => {
            console.error("❌ Error obteniendo la ubicación:", error);
            alert("No se pudo obtener tu ubicación. Revisa los permisos.");
        });
    } else {
        alert("❌ Tu navegador no soporta geolocalización.");
    }
});

// 📌 Ejecutar autenticación y verificar token al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
    await checkTokenExpiration(); // Verifica si el token aún es válido
    checkAuth();
});
