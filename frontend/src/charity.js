import './style.css'

const BASE_URL = "https://annasetu-backend.onrender.com";
async function checkLoginStatus() {
    const response = await fetch(`${BASE_URL}/user-status`, {
        method: "GET",
        credentials: "include"  // Required for session cookies
    });

    const data = await response.json();
    console.log("User status:", data);
    const home = document.getElementById("home");
    const logotext=document.getElementById("logotext");
    const logotext2=document.getElementById("logotext2");


    if (data.logged_in) {
        home.textContent = "Dashboard";  // Change text to Dashboard
        
        if (data.role === "donor") {
            home.href = "donor_dashboard.html";  // Redirect donors to their dashboard
            logotext.href = "donor_dashboard.html";
            logotext2.href = "donor_dashboard.html";
        } else {
            home.href = "charity_dashboard.html";  // Redirect charities to their dashboard
            logotext.href = "charity_dashboard.html";
            logotext2.href = "charity_dashboard.html";
        }
    } else {
        home.textContent = "Home";  // Reset to Home if not logged in
        home.href = "index.html";
        logotext.href = "index.html";
        logotext2.href = "index.html";
    }
}

checkLoginStatus();



// 3------------------------------------------------------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", async () => {
    const aniketDiv = document.querySelector("#aniket2");

    if (!aniketDiv) {
        console.error("#aniket div not found");
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/charity-info`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch charity details");
        }

        const charityList = await response.json(); // Expecting array of charity objects
        console.log(charityList);

        charityList.forEach(charity => {
            const newCard = document.createElement("div");
            newCard.className = "w-[90%] mx-auto mt-6 p-8 rounded-2xl shadow-lg border border-gray-200 text-gray-800 bg-cyan-100";

            newCard.innerHTML = `
                <h2 class="text-3xl font-bold text-blue-800 font-[Poppins] mb-4">${charity.org_name}</h2>
                 <h2 class="text-xl font-bold text-gray-400 font-[Poppins]">NGO</h2>
                <p class="text-lg"><i class="fa-solid fa-user text-blue-600 mr-2"></i><strong>Representative/Owner:</strong> ${charity.owner}</p>
                <p class="text-lg"><i class="fa-solid fa-phone text-black mr-2"></i><strong>Phone:</strong> ${charity.phone}</p>
                <p class="text-lg"><i class="fa-solid fa-truck text-black mr-2"></i><strong>Preffered Type:</strong> ${charity.pickup_method}</p>
                <p class="text-lg"><i class="fa-solid fa-location-dot text-red-500 mr-2"></i><strong>Location:</strong> ${charity.area_city}</p>
                <p class="text-lg"><i class="fa-solid fa-envelope text-black mr-2"></i><strong>Email:</strong> ${charity.email}</p>
                <p class="text-lg"><i class="fa-solid fa-id-badge text-black mr-2"></i><strong>Charity ID:</strong> ${charity.charity_id}</p>
            `;

            aniketDiv.appendChild(newCard);
        });

    } catch (error) {
        console.error("Error:", error);
        alert("Error: " + error.message);
    }
});
