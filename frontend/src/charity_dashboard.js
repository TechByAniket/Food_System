import './style.css'


const BASE_URL = import.meta.env.VITE_BASE_URL;

let inbox=document.getElementById("charity_inbox_section");
let user_profile=document.getElementById("user_profile_and_food_list_section");
let received_donations_section=document.getElementById("received_donations_section");
let received_donations_box=document.getElementById("received_donations_box");
let denied_donations_box=document.getElementById("denied_donations_box");
let denied_donations_section=document.getElementById("denied_donations_section");
let charity_inbox_div=document.getElementById("charity_inbox_div");


let list_food_btn=document.getElementById("list_food_btn_div");
let denied_donations_btn=document.getElementById("denied_donations_btn");
let inbox_btn=document.getElementById("inbox_btn_div");
let received_donations_btn=document.getElementById("received_donations_btn");

inbox_btn.addEventListener("click", ()=>{
    user_profile.classList.add("hidden");
    received_donations_section.classList.add("hidden");
    denied_donations_section.classList.add("hidden");
    inbox.classList.remove("hidden");

})

list_food_btn.addEventListener("click", ()=>{
    inbox.classList.add("hidden");
    denied_donations_section.classList.add("hidden");
    received_donations_section.classList.add("hidden");
    user_profile.classList.remove("hidden");
})

received_donations_btn.addEventListener("click", ()=>{
    inbox.classList.add("hidden");
    denied_donations_section.classList.add("hidden");
    user_profile.classList.add("hidden");
    received_donations_section.classList.remove("hidden");
})

denied_donations_btn.addEventListener("click", ()=>{
    inbox.classList.add("hidden");
    user_profile.classList.add("hidden");
    received_donations_section.classList.add("hidden");
    denied_donations_section.classList.remove("hidden");
})



document.getElementById("logoutbtn").addEventListener("click", async function (event) {
    event.preventDefault();  // Prevent default form submission

    const response = await fetch(`${BASE_URL}/logout`, {
        method: "POST",
        credentials: "include"  // Send session cookies
    });

    const data = await response.json();

    if (response.ok) {
        window.location.href = `/${data.redirect}`;  // Redirect to login page
    } else {
        alert("Logout failed. Try again.");
    }
});




async function loadUserData() {
    const response = await fetch(`${BASE_URL}/user-info`, {
        method: "GET",
        credentials: "include"  // Required to send session cookies
    });

    const data = await response.json();

    if (data.redirect) {
        window.location.href = `/${data.redirect}`;  //  Redirect to login if needed
    } else {
        document.getElementById("username").innerText ="Hello, "+ data.username;
        // document.getElementById("role").innerText = data.role;
        document.getElementById("org_name").innerText = data.org_name;
        document.getElementById("owner").innerText = data.owner;
        document.getElementById("area_city").innerText = data.area_city;
        document.getElementById("phone").innerHTML = "+91 "+data.phone;
    }
}

loadUserData();



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


//------------------------------------------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    // const charityInboxBox = document.querySelector("#charity_inbox_box");

    if (!charity_inbox_div) {
        console.error("Charity inbox div not found!");
        return;
    }

    //const inboxBtn = document.querySelector("#charity_inbox_btn");

    inbox_btn.addEventListener("click", async () => {
        charity_inbox_div.innerHTML = "";

        try {
            const response = await fetch(`${BASE_URL}/charity-requests`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Failed to load requests");

            if (data.length === 0) {
                charity_inbox_div.innerHTML = `
                    <div class="text-center text-gray-600 py-6 text-2xl">You have not made any requests yet.</div>`;
                return;
            }

            data.forEach(req => {
                const requestCard = document.createElement("div");
                requestCard.className = "p-4 bg-white shadow-md rounded-xl border border-gray-200 mb-4";

                requestCard.innerHTML = `
                    <div class="relative p-4 bg-white shadow-md rounded-2xl border border-gray-200 flex flex-col gap-3">

                        <!-- Request ID -->
                        <div class="absolute top-2 right-3 text-sm text-gray-500 font-mono">
                            Request ID: ${req.request_id}
                        </div>

                        <!-- Sent To & Status Badge -->
                        <div class="flex justify-between items-center">
                            <h3 class="text-xl font-semibold text-gray-800">Sent To: ${req.donor.org_name}</h3>
                        </div>

                        <!-- Message -->
                        <div class="text-sm text-gray-600">
                            <strong>Message:</strong> ${req.message}
                        </div>

                        <!-- Donor Info -->
                        <div class="text-sm flex gap-5 text-gray-700 flex-wrap">
                            <div><strong>REQUESTED AT:</strong> ${new Date(req.time).toLocaleString()}</div>
                            <div><strong>DONOR REPRESENTATIVE/OWNER:</strong> ${req.donor.owner}</div>
                            <div><strong>CONTACT:</strong> ${req.donor.phone}</div>
                            <div><strong>LOCATION:</strong> ${req.donor.area_city}</div>
                        </div>

                        <!-- Food Info -->
                        <div class="pt-2 border-t border-gray-200">
                            <p class="text-base font-medium text-gray-800 mb-1">Food Details</p>
                            <div class="flex flex-wrap gap-2 text-sm text-gray-700 items-center">
                                <span class="px-2 py-1 bg-gray-100 rounded-full">Name: ${req.food_listing.food_name}</span>
                                <span class="px-2 py-1 bg-gray-100 rounded-full">Qty: ${req.food_listing.food_quantity}</span>
                                <span class="px-2 py-1 bg-gray-100 rounded-full">Type: ${req.food_listing.food_type}</span>
                                <span class="px-2 py-1 bg-gray-100 rounded-full">Category: ${req.food_listing.food_category}</span>

                                <div class="ml-auto flex gap-2">
                                    <span class="px-4 py-1 text-sm font-semibold rounded-full border 
                                        ${req.food_listing.status === 'Approved' ? 'bg-green-100 text-green-700 border-green-300' : 
                                        req.food_listing.status === 'Denied' ? 'bg-red-100 text-red-700 border-red-300' : 
                                        req.food_listing.status === 'Pending' ? 'bg-orange-100 text-orange-400 border-orange-300' :
                                        'bg-yellow-100 text-yellow-700 border-yellow-300'}">
                                        ${req.food_listing.status.charAt(0).toUpperCase() + req.food_listing.status.slice(1)}
                                    </span>                  
                                </div>
                            </div>
                        </div>
                    </div>

                `;

                charity_inbox_div.appendChild(requestCard);
            });
        } catch (err) {
            console.error("Error loading charity requests:", err);
            charity_inbox_div.innerHTML = `
                <div class="text-red-500 text-center p-4 border rounded-md bg-red-50">
                    Failed to load charity requests. ${err.message}
                </div>`;
        }
    });
});


//-------------------------------------------------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {

    if (!received_donations_btn || !received_donations_box) {
        console.error("Missing required elements!");
        return;
    }

    // LOAD DONOR APPROVED REQUESTS
    received_donations_btn.addEventListener("click", async () => {
        received_donations_box.innerHTML = ""; // Clear previous content

        try {
            const response = await fetch(`${BASE_URL}/charity-approved-requests`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = "/donor_dashboard";
                    return;
                }

                if (response.status === 404 && data.error === "Donor not found") {
                    const noRequestsMsg = document.createElement("div");
                    noRequestsMsg.className = "text-center text-gray-600 py-6 text-2xl";
                    noRequestsMsg.textContent = "No requests found for this donor.";
                    past_donations_box.appendChild(noRequestsMsg);
                    return;
                }

                throw new Error(data.error || "Failed to fetch donor requests");
            }

            if (data.length === 0) {
                const noRequestsMsg = document.createElement("div");
                noRequestsMsg.className = "text-center text-gray-600 py-6 text-2xl";
                noRequestsMsg.textContent = "You have no approved donations yet.";
                received_donations_box.appendChild(noRequestsMsg);
                return;
            }

            data.forEach(req => {
                const requestCard = document.createElement("div");
                requestCard.className = "p-4 bg-white shadow-md rounded-xl border border-gray-200 mb-4";

                requestCard.innerHTML = `
                    <div class="relative p-4 bg-white shadow-md rounded-2xl border border-gray-200 flex flex-col gap-4">
                        <h3 class="text-xl font-semibold text-gray-800">Received from: ${req.donor?.org_name || 'N/A'}</h3>
        
                        <div>
                            <h3 class="text-xl font-semibold text-gray-800 mb-2">Donor Details</h3>
                            <div class="flex flex-wrap gap-2 text-sm text-gray-700 items-center">
                                <span class="px-2 py-1 bg-blue-100 rounded-full">Name: ${req.donor?.owner || 'N/A'}</span>
                                <span class="px-2 py-1 bg-blue-100 rounded-full">Phone: ${req.donor?.phone || 'N/A'}</span>
                                <span class="px-2 py-1 bg-blue-100 rounded-full">City: ${req.donor?.area_city || 'N/A'}</span>
                            </div>
                        </div>

                        <div class="border-t border-gray-200 pt-3">
                            <h3 class="text-xl font-semibold text-gray-800 mb-2">Food Details</h3>
                            <div class="flex flex-wrap gap-2 text-sm text-gray-700 items-center">
                                <span class="px-2 py-1 bg-gray-100 rounded-full">Name: ${req.food_listing?.food_name || 'N/A'}</span>
                                <span class="px-2 py-1 bg-gray-100 rounded-full">Quantity: ${req.food_listing?.food_quantity || 'N/A'}</span>
                                <span class="px-2 py-1 bg-gray-100 rounded-full">Type: ${req.food_listing?.food_type || 'N/A'}</span>
                                <span class="px-2 py-1 bg-gray-100 rounded-full">Category: ${req.food_listing?.food_category || 'N/A'}</span>
                               
                                <div class="ml-auto flex gap-2">
                                    <button class="px-4 py-1 rounded-3xl bg-green-500 text-white hover:bg-green-600 transition">Received</button>
                                </div>

                            </div>
                        </div>

                    </div>
                `;

                received_donations_box.appendChild(requestCard);
            });

        } catch (error) {
            console.error("Error:", error);
            received_donations_box.innerHTML = `
                <div class="text-red-500 text-center p-4 border rounded-md bg-red-50">
                    Failed to load approved donations. ${error.message}
                </div>`;
        }
    });
});

//---------------------------------------------------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {

    if (!denied_donations_btn || !denied_donations_box) {
        console.error("Missing required elements!");
        return;
    }

    // LOAD DENIED DONATIONS
    denied_donations_btn.addEventListener("click", async () => {
        denied_donations_box.innerHTML = ""; // Clear previous content

        try {
            const response = await fetch(`${BASE_URL}/charity-denied-requests`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const data = await response.json();
            console.log("Denied data:", data);


            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = "/donor_dashboard";
                    return;
                }

                if (response.status === 404 && data.error === "Donor not found") {
                    const noRequestsMsg = document.createElement("div");
                    noRequestsMsg.className = "text-center text-gray-600 py-6 text-2xl";
                    noRequestsMsg.textContent = "No requests found for this donor.";
                    denied_donations_box.appendChild(noRequestsMsg);
                    return;
                }

                throw new Error(data.error || "Failed to fetch donor requests");
            }

            if (data.length === 0) {
                const noRequestsMsg = document.createElement("div");
                noRequestsMsg.className = "text-center text-gray-600 py-6 text-2xl";
                noRequestsMsg.textContent = "You have no denied donations.";
                denied_donations_box.appendChild(noRequestsMsg);
                return;
            }

            data.forEach(req => {
                const requestCard = document.createElement("div");
                requestCard.className = "p-4 bg-white shadow-md rounded-xl border border-gray-200 mb-4";

                requestCard.innerHTML = `
                    <div class="relative p-4 bg-white shadow-md rounded-2xl border border-gray-200 flex flex-col gap-4">
                        <h3 class="text-xl font-semibold text-gray-800">Denied from: ${req.donor?.org_name || 'N/A'}</h3>

                        <div>
                            <h3 class="text-xl font-semibold text-gray-800 mb-2">Donor Details</h3>
                            <div class="flex flex-wrap gap-2 text-sm text-gray-700 items-center">
                                <span class="px-2 py-1 bg-blue-100 rounded-full">Name: ${req.donor?.owner || 'N/A'}</span>
                                <span class="px-2 py-1 bg-blue-100 rounded-full">Phone: ${req.donor?.phone || 'N/A'}</span>
                                <span class="px-2 py-1 bg-blue-100 rounded-full">City: ${req.donor?.area_city || 'N/A'}</span>
                            </div>
                        </div>

                        <div class="border-t border-gray-200 pt-3">
                            <h3 class="text-xl font-semibold text-gray-800 mb-2">Food Details</h3>
                            <div class="flex flex-wrap gap-2 text-sm text-gray-700 items-center">
                                <span class="px-2 py-1 bg-gray-100 rounded-full">Name: ${req.food_listing?.food_name || 'N/A'}</span>
                                <span class="px-2 py-1 bg-gray-100 rounded-full">Quantity: ${req.food_listing?.food_quantity || 'N/A'}</span>
                                <span class="px-2 py-1 bg-gray-100 rounded-full">Type: ${req.food_listing?.food_type || 'N/A'}</span>
                                <span class="px-2 py-1 bg-gray-100 rounded-full">Category: ${req.food_listing?.food_category || 'N/A'}</span>

                                 <div class="ml-auto flex gap-2">
                                    <button class="px-4 py-1 rounded-3xl bg-red-500 text-white hover:bg-red-600 transition">Denied</button>
                                </div>

                            </div>
                        </div>

                    </div>
                `;

                denied_donations_box.appendChild(requestCard);
            });

        } catch (error) {
            console.error("Error:", error);
            denied_donations_box.innerHTML = `
                <div class="text-red-500 text-center p-4 border rounded-md bg-red-50">
                    Failed to load denied donations. ${error.message}
                </div>`;
        }
    });
});
