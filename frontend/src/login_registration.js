document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.querySelector("#loginForm input[type='text']").value;
        const password = document.querySelector("#loginForm input[type='password']").value;

        if (!username || !password) {
            alert("Please enter both username and password");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Login successful!");

                localStorage.setItem("userType", data.userType); // Save user type in localStorage
                
                // Redirect based on user type
                if (data.userType === "donor") {
                    window.location.href = "/donor_dashboard.html";
                } else if (data.userType === "charity") {
                    window.location.href = "/charity_dashboard.html";
                } else {
                    alert("Unknown user type. Please contact support.");
                }
            } else {
                alert(data.message || "Login failed. Please check your credentials.");
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("An error occurred. Please try again.");
        }
    });
});
