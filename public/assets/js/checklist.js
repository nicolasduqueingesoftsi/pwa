// 📌 Verificar autenticación antes de permitir el envío del checklist
function checkAuth() {
    const token = localStorage.getItem("oauth_token");

    if (!token) {
        alert("⚠️ Debes iniciar sesión para enviar el checklist.");
        window.location.href = "/"; // Redirigir al login si no hay token
    }
}

// 📌 Función para obtener el token almacenado
function getAuthToken() {
    return localStorage.getItem("oauth_token");
}

// 📌 Enviar checklist a la API externa
document.getElementById("submitChecklist").addEventListener("click", async () => {
    const token = getAuthToken();
    
    if (!token) {
        alert("⚠️ No tienes una sesión activa. Inicia sesión nuevamente.");
        return;
    }

    // 📌 Obtener valores de los radio buttons del checklist
    const luces = document.querySelector('input[name="luces"]:checked')?.value;
    const frenos = document.querySelector('input[name="frenos"]:checked')?.value;
    const motor = document.querySelector('input[name="motor"]:checked')?.value;

    if (!luces || !frenos || !motor) {
        alert("❌ Todos los campos son obligatorios.");
        return;
    }

    // 📌 Datos a enviar
    const checklistData = {
        luces: luces === "si",
        frenos: frenos === "si",
        motor: motor === "si"
    };

    console.log("📤 Enviando datos a la API externa:", checklistData);

    try {
        const response = await fetch("/api/tow/sendCheckListTow", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(checklistData)
        });

        const data = await response.json();
        console.log("📋 Respuesta de la API:", data);

        if (data.success) {
            alert("✅ Checklist enviado correctamente.");
        } else {
            alert(`❌ Error en la respuesta: ${data.message}`);
        }
    } catch (error) {
        console.error("❌ Error en la API externa:", error);
        alert("❌ Hubo un error al enviar el checklist.");
    }
});

// 📌 Ejecutar autenticación al cargar la página
document.addEventListener("DOMContentLoaded", checkAuth);
