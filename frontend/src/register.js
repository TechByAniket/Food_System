const API_BASE_URL = "http://127.0.0.1:5000";  // Flask API URL

document.getElementById("registerFORM").addEventListener("submit", async (event) => {
    event.preventDefault();

    const userType = document.querySelector('input[name="userType"]:checked')?.value;
    const org_name = document.getElementById("org_name").value;
    const owner = document.getElementById("owner").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;
    const location = document.getElementById("location").value;
    const area_city = document.getElementById("area_city").value;
    const government_id = document.getElementById("government_id").value;
    const pickup_method = document.getElementById("pickup_method").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const agree = document.getElementById("agree_checkbox").checked;

    if (!agree) {
        alert("You must agree to the food donation terms.");
        return;
    }

    const userData = { userType, org_name, owner, phone, email, location, area_city, government_id, pickup_method, username, password };

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {  // 👈 Uses API_BASE_URL
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error("Registration Error:", error);
    }
});
