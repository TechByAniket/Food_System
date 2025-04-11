import './style.css'

const BASE_URL = import.meta.env.VITE_BASE_URL;

async function checkLoginStatus() {
    const response = await fetch(`${BASE_URL}/user-status`, {
        method: "GET",
        credentials: "include"  // ✅ Required for session cookies
    });

    const data = await response.json();
    console.log("User status:", data);
    const home = document.getElementById("home");
    const logotext=document.getElementById("logotext");
    const logotext2=document.getElementById("logotext2");


    if (data.logged_in) {
        home.textContent = "Dashboard";  // Change text to Dashboard
        
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
document.addEventListener('DOMContentLoaded', () => {
    
});


async function checkLoginStatusRole() {
    const response = await fetch(`${BASE_URL}/user-status`, {
        method: "GET",
        credentials: "include"
    });

    const data = await response.json();

   return data.role;
}


document.addEventListener("DOMContentLoaded", async () => {
    const aniketDiv = document.querySelector("#aniket");

    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('request-btn')) {
            e.preventDefault();
            const listingId = e.target.dataset.listingId;
            await handleRequest(listingId);
        }
    });

    if (!aniketDiv) {
        console.error("#aniket div not found");
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/food-list-info`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
        });

        if (response.status === 401) {
            window.location.href = "/login";
            return;
        }

        if (response.status === 404) {
            // No listings found
            aniketDiv.innerHTML = `<p class="text-2xl text-center mt-10 text-gray-700">No active food listings available at the moment.</p>`;
            return;
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch food listings");
        }

        const foodList = await response.json();
        console.log(foodList);

        const userRole = await checkLoginStatusRole();

        foodList.forEach(foodData => {
            let food_category_logo = "Veg.jpg";
            if (foodData.food_category === "NonVeg") {
                food_category_logo = "NonVeg.jpg";
            }

            const newListing = document.createElement("div");
            newListing.className = "listing min-h-96 w-[1300px] mt-4 ml-[2%] p-5 rounded-3xl border-2 border-transparent hover:border-black bg-cyan-100 shadow-2xl shadow-gray-300 hover:shadow-2xl hover:shadow-black text-xl cursor-pointer";

            newListing.innerHTML = `
                <div>
                    <h2 class="font-[Poppins] text-3xl font-bold inline text-yellow-800">${foodData.food_name}</h2>
                    <img src="${food_category_logo}" alt="" class="h-10 w-10 block float-right">
                </div>
                <div class="h-40 w-[30%] inline-block">
                    <h2 class="font-[Poppins] text-xl font-semibold inline">${foodData.org_name}</h2>
                    <h5 class="font-[Poppins] text-lg inline">${foodData.donor_type}</h5>
                    <h3 class="text-lg"><i class="fa-solid fa-location-dot text-xl text-red-500 mr-2 mt-7"></i>${foodData.area_city}</h3>
                    <h3 class="text-lg"><i class="fa-solid fa-box text-xl mr-2 mt-2"></i>${foodData.food_quantity}</h3>
                    <h3 class="text-lg"><i class="fa-solid fa-utensils text-xl mr-2 mt-2"></i>${foodData.food_type}</h3>
                    <h3 class="text-lg"><i class="fa-solid fa-truck text-xl mr-2 mt-2"></i>${foodData.pickup_delivery}</h3>
                    <h3 class="text-lg"><i class="fa-solid fa-phone text-xl mr-2 mt-2"></i>${foodData.phone}</h3>
                    <p class="text-lg mt-2">${foodData.description}</p>
                </div>

                <div id="donors_listing_photos" class="h-44 w-[55%] float-right mt-12 -mr-6 flex">
                    <img src="${foodData.imageurl}" alt="" class="min-h-full w-44 mr-2 ml-36">
                    <img src="${foodData.imageurl}" alt="" class="min-h-full w-44 mr-2">
                    <img src="${foodData.imageurl}" alt="" class="min-h-full w-44 mr-2">
                </div>

                ${userRole === 'charity' ? `
                    <button data-listing-id="${foodData.listing_id}" class="request-btn h-12 w-56 bg-green-400 rounded-3xl text-lg float-right cursor-pointer text-black border-2 border-transparent hover:border-black">
                        Request
                    </button>
                ` : ''}
            `;
            aniketDiv.appendChild(newListing);
        });

    } catch (error) {
        console.error("Error:", error);
        alert("Error: " + error.message);
    }
});

//---------------------------------------------------------------------------------------------------------------

async function handleRequest(listingId) {
    try {
        console.log("handleRequest called with listingId:", listingId);
        const message = prompt("Add a message to the donor (optional):") || "";
        
        // Add timeout handling
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(`${BASE_URL}/create-request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                listing_id: listingId,
                message: message
            }),
            credentials: 'include',
            signal: controller.signal
        });
        clearTimeout(timeout);

        // Handle non-OK responses
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Server error: ${response.status}`);
        }

        const result = await response.json();
        alert(result.message || "Request sent successfully!");
        
    } catch (error) {
        console.error("Full error:", error);
        
        // User-friendly error messages
        let message = "Failed to send request";
        if (error.name === 'AbortError') {
            message = "Request timed out - server not responding";
        } else if (error.message.includes('Failed to fetch')) {
            message = "Could not connect to server. Please:\n1. Check your internet\n2. Ensure backend is running\n3. Try refreshing the page";
        } else {
            message = error.message;
        }
        
        alert(message);
    }
}