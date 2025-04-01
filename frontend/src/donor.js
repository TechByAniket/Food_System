import './style.css'

async function checkLoginStatus() {
    const response = await fetch("http://127.0.0.1:5000/user-status", {
        method: "GET",
        credentials: "include"  // ✅ Required for session cookies
    });

    const data = await response.json();
    console.log("User status:", data);
    const home = document.getElementById("home");
    const logotext=document.getElementById("logotext");
    const logotext2=document.getElementById("logotext2");


    if (data.logged_in) {
        home.textContent = "Dashboard";  // ✅ Change text to Dashboard
        
        if (data.role === "donor") {
            home.href = "donor_dashboard.html";  // ✅ Redirect donors to their dashboard
            logotext.href = "donor_dashboard.html";
            logotext2.href = "donor_dashboard.html";
        } else {
            home.href = "charity_dashboard.html";  // ✅ Redirect charities to their dashboard
            logotext.href = "charity_dashboard.html";
            logotext2.href = "charity_dashboard.html";
        }
    } else {
        home.textContent = "Home";  // 🔄 Reset to Home if not logged in
        home.href = "index.html";
        logotext.href = "index.html";
        logotext2.href = "index.html";
    }
}

checkLoginStatus();
document.addEventListener('DOMContentLoaded', () => {
    
});



export async function loadListingData(listingData) {
    console.log("Loading listing:", listingData);
    let container2 = document.getElementById("FOODLIST");

    if (!container2) {
        console.error("ERROR: Container2 not found!");
        return;
    }

    const food_quantity = listingData["food_quantity"] || "Unknown";
    const food_type = listingData["food_type"] || "Unknown";

    const newDiv = document.createElement("div");
    newDiv.className = "listing min-h-96 w-[1300px] mt-4 ml-[2%] p-5 rounded-3xl border-2 border-transparent hover:border-black bg-cyan-100 shadow-2xl shadow-gray-300 hover:shadow-2xl hover:shadow-black text-xl cursor-pointer";
    
    newDiv.innerHTML = `
        <div>
            <h2 class="font-[Poppins] text-3xl font-bold inline text-yellow-800">${listingData["food_name"]}</h2>
        </div>
        <div class="h-40 w-[30%] inline-block">
            <h2 class="font-[Poppins] text-xl font-semibold inline">${listingData["org_name"]}</h2>
            <h5 class="font-[Poppins] text-lg inline">RESTAURANT</h5>
            <h3 class="text-lg"><i class="fa-solid fa-location-dot text-xl text-red-500 mr-2 mt-7"></i>${listingData["area_city"]}</h3>
            <h3 class="text-lg"><i class="fa-solid fa-box text-xl mr-2 mt-2"></i>${food_quantity} Servings</h3>
            <h3 class="text-lg"><i class="fa-solid fa-utensils text-xl mr-2 mt-2"></i>${food_type}</h3>
            <h3 class="text-lg"><i class="fa-solid fa-truck text-xl mr-2 mt-2"></i>${listingData["pickup_delivery"]}</h3>
            <h3 class="text-lg"><i class="fa-solid fa-phone text-xl mr-2 mt-2"></i>${listingData["phone"]}</h3>
        </div>
        <form action="/index.html">
            <button class="h-12 w-56 bg-green-400 rounded-3xl text-lg float-right cursor-pointer text-black border-2 border-transparent hover:border-black">
                Request
            </button>
        </form>
    `;
    container2.appendChild(newDiv);
}












// export async function loadListingData(listingData) {
//     alert(listingData);
//     console.log("Helooooooo",listingData);

//     const container = document.getElementById("donors_foodlistings");
//     console.log(container);
//     // Create a new div
//     const newDiv = document.createElement("div");
//     newDiv.className = "listing min-h-96 w-[1300px] mt-4 ml-[2%] p-5 rounded-3xl border-2 border-transparent hover:border-black bg-cyan-100 shadow-2xl shadow-gray-300 hover:shadow-2xl hover:shadow-black text-xl cursor-pointer";
    
//     // Set inner HTML
//     newDiv.innerHTML = `
//         <div>
//             <h2 class="font-[Poppins] text-3xl font-bold inline text-yellow-800">${listingData["food_name"]}</h2>
//             <img src="Veg.jpg" alt="" class="h-10 w-10 block float-right">
//         </div>
//         <div id="donors_listing_deatils" class="h-40 w-[30%] inline-block">
//             <h2 class="font-[Poppins] text-xl font-semibold inline">${listingData["org_name"]}</h2>
//             <h5 class="font-[Poppins] text-lg inline">RESTAURANT</h5>
//             <h3 class="text-lg"><i class="fa-solid fa-location-dot text-xl text-red-500 mr-2 mt-7"></i>${listingData["area_city"]}</h3>
//             <h3 class="text-lg"><i class="fa-solid fa-box text-xl mr-2 mt-2"></i>${food_quantity} Servings</h3>
//             <h3 class="text-lg"><i class="fa-solid fa-utensils text-xl mr-2 mt-2"></i>${food_type}</h3>
//             <h3 class="text-lg"><i class="fa-solid fa-truck text-xl mr-2 mt-2"></i>${listingData["pickup_delivery"]}</h3>
//             <h3 class="text-lg"><i class="fa-solid fa-phone text-xl mr-2 mt-2"></i>${listingData["phone"]}</h3>
//         </div>
//         <div id="donors_listing_photos" class="h-44 w-[55%] bg-amber-300 float-right mt-12 -mr-6 flex">
//             <img src="/bg img 1.jpg" alt="" class="min-h-full w-44">
//             <img src="/BGIMG3.png" alt="" class="min-h-full w-44">
//             <img src="/bg img 1.jpg" alt="" class="min-h-full w-44">
//             <img src="/BGIMG3.png" alt="" class="min-h-full w-44">
//         </div>
//         <form action="/index.html">
//             <button class="h-12 w-56 bg-green-400 rounded-3xl text-lg float-right cursor-pointer text-black border-2 border-transparent hover:border-black">
//                 Request
//             </button>
//         </form>
//     `;

//     // Append new listing to the container
//     container.appendChild(newDiv);

    
// }

// // loadListingData();