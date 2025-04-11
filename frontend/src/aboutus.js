import './style.css'

const BASE_URL = "https://annasetu-backend.onrender.com";
async function checkLoginStatus() {
    const response = await fetch(`${BASE_URL}/user-status`, {
        method: "GET",
        credentials: "include"  //  Required for session cookies
    });

    const data = await response.json();
    console.log("User status:", data);
    const home = document.getElementById("home");
    const logotext=document.getElementById("logotext");
    const logotext2=document.getElementById("logotext2");


    if (data.logged_in) {
        home.textContent = "Dashboard";  //  Change text to Dashboard
        
        if (data.role === "donor") {
            home.href = "donor_dashboard.html";  //  Redirect donors to their dashboard
            logotext.href = "donor_dashboard.html";
            logotext2.href = "donor_dashboard.html";
        } else {
            home.href = "charity_dashboard.html";  //  Redirect charities to their dashboard
            logotext.href = "charity_dashboard.html";
            logotext2.href = "charity_dashboard.html";
        }
    } else {
        home.textContent = "Home";  //  Reset to Home if not logged in
        home.href = "index.html";
        logotext.href = "index.html";
        logotext2.href = "index.html";
    }
}

checkLoginStatus();