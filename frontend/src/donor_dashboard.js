import './style.css';

import { createClient } from "@supabase/supabase-js";
const BASE_URL = "https://annasetu-backend.onrender.com";
const SUPABASE_URL = "https://bdsyggaigzmrnurkmzkn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkc3lnZ2FpZ3ptcm51cmttemtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzM0NTgsImV4cCI6MjA1ODc0OTQ1OH0.a4KyrWebWxUIKFxAX6JHLIFGSyVQ3TKyN5OvDGv5y38";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let inbox=document.getElementById("donor_inbox_section");
let user_profile=document.getElementById("user_profile_and_food_list_section");
let past_donations=document.getElementById("past_donations_section");
let current_listing=document.getElementById("current_listing_section");
let past_donations_box=document.getElementById("past_donations_box");

let list_food_btn=document.getElementById("list_food_btn_div");
let inbox_btn=document.getElementById("inbox_btn_div");
let past_donations_btn=document.getElementById("past_donations_btn_div");
let current_listing_btn=document.getElementById("current_listing_btn_div");




inbox_btn.addEventListener("click", ()=>{
    user_profile.classList.add("hidden");
    past_donations.classList.add("hidden");
    current_listing.classList.add("hidden");
    inbox.classList.remove("hidden");

})

list_food_btn.addEventListener("click", ()=>{
    inbox.classList.add("hidden");
    past_donations.classList.add("hidden");
    current_listing.classList.add("hidden");
    user_profile.classList.remove("hidden");
})

past_donations_btn.addEventListener("click", ()=>{
    inbox.classList.add("hidden");
    user_profile.classList.add("hidden");
    current_listing.classList.add("hidden");
    past_donations.classList.remove("hidden");
})

current_listing_btn.addEventListener("click",()=>{
    inbox.classList.add("hidden");
    user_profile.classList.add("hidden");
    past_donations.classList.add("hidden");
    current_listing.classList.remove("hidden");
})

document.getElementById("logoutbtn").addEventListener("click", async function (event) {
    event.preventDefault();  // Prevent default form submission

    const response = await fetch(`${BASE_URL}/logout`, {
        method: "POST",
        credentials: "include"  //  Send session cookies
    });

    const data = await response.json();

    if (response.ok) {
        window.location.href = `/${data.redirect}`;  // Redirect to login page
    } else {
        alert("Logout failed. Try again.");
    }
});


// --------------------------------------------------------------------------------------------------------------------
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
        document.getElementById("type").innerText = data.type;
        document.getElementById("owner").innerText = data.owner;
        document.getElementById("area_city").innerText = data.area_city;
        document.getElementById("phone").innerHTML = "+91 "+data.phone;
    }
}

loadUserData();


// --------------------------------------------------------------------------------------------------------------------
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




// --------------------------------------------------------------------------------------------------------------------


document.addEventListener("DOMContentLoaded", () => {
    const imageInput = document.getElementById('imageInput');
    const previewImg = document.getElementById('previewImg');

    // Preview image on file select
    imageInput.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                previewImg.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            previewImg.src = '';
        }
    });

    document.getElementById('food_list_form').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form values
        const food_name = document.getElementById('food_name').value;
        const food_quantity = document.getElementById('food_quantity').value;
        const food_type = document.getElementById('food_type').value;
        const food_category = document.getElementById('food_category').value;
        const description = document.getElementById('description').value;
        const file = imageInput.files[0];

        let imageurl = "";

        // Upload image to Supabase
        if (file) {
            try {
                const filePath = `foods/${Date.now()}_${file.name}`;

                const { error: uploadError } = await supabase.storage
                    .from('uploaded-images')
                    .upload(filePath, file, {
                        contentType: file.type,
                        upsert: false
                    });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('uploaded-images')
                    .getPublicUrl(filePath);

                imageurl = publicUrl;
                console.log("Image uploaded:", imageurl);

            } catch (error) {
                console.error("Upload error:", error);
                alert("Failed to upload image. Please try again.");
                return;
            }
        }

        // Submit form data
        try {
            const response = await fetch(`${BASE_URL}/list-food`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    food_name,
                    food_quantity,
                    food_type,
                    description,
                    food_category,
                    imageurl
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Submission failed");
            }

            const result = await response.json();
            console.log("Success:", result);
            alert("Food listing created successfully!");

            // Optional: Reset form and image preview
            document.getElementById('food_list_form').reset();
            previewImg.src = "";

        } catch (error) {
            console.error("Submission error:", error);
            alert("Error: " + error.message);
        }
    });
});

// --------------------------------------------------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    // const current_listing_btn = document.querySelector("#current_listing_btn");
    const current_listings_box = document.querySelector("#current_listings_box");

    if (!current_listing_btn || !current_listings_box) {
        console.error("Missing required elements");
        return;
    }

    // DELETE BUTTON HANDLER
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-listing-btn')) {
            e.preventDefault();
            const listingId = e.target.dataset.listingId;
            await deleteListing(listingId);
            current_listing_btn.click(); // Refresh list
        }
    });

    // LOAD CURRENT LISTINGS ON BUTTON CLICK
    current_listing_btn.addEventListener("click", async () => {
        current_listings_box.innerHTML = ""; // Clear previous content

        try {
            const response = await fetch(`${BASE_URL}/current-listings`, {
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

                // If it's a "no listings" case (404), show message in div instead of alert
                if (response.status === 404 && data.message === "No Current Listing!") {
                    const noListingMsg = document.createElement("div");
                    noListingMsg.className = "text-center text-gray-800 py-6 text-2xl";
                    noListingMsg.textContent = "There are no current listings.";
                    current_listings_box.appendChild(noListingMsg);
                    return;
                }

                throw new Error(data.message || "Failed to fetch your current food listings");
            }

            const myFoodList = data.listings;

            if (!myFoodList || myFoodList.length === 0) {
                const noListingMsg = document.createElement("div");
                noListingMsg.className = "text-center text-gray-600 py-6 text-2xl";
                noListingMsg.textContent = "There are no current listings.";
                current_listings_box.appendChild(noListingMsg);
                return;
            }

            myFoodList.forEach(myFoodData => {
                const newCurrentListing = document.createElement("div");
                newCurrentListing.className = "relative p-4 bg-white shadow-md rounded-2xl flex flex-col gap-2 border border-gray-200";

                newCurrentListing.innerHTML = `
                    <div class="absolute top-2 right-3 text-lg text-gray-600 font-mono">Listing ID: ${myFoodData.food_listing_id}</div>
                    <h3 class="text-xl font-semibold text-gray-800">${myFoodData.food_name}</h3>

                    <div class="flex gap-4 text-sm text-gray-600 mt-1">
                        <span class="px-2 py-1 bg-gray-100 rounded-full">Quantity: ${myFoodData.food_quantity}</span>
                        <span class="px-2 py-1 bg-gray-100 rounded-full">Type: ${myFoodData.food_type}</span>
                        <span class="px-2 py-1 bg-gray-100 rounded-full">Category: ${myFoodData.food_category}</span>
                        <button data-listing-id="${myFoodData.food_listing_id}" class="delete-listing-btn w-20 px-2 py-1 rounded-3xl bg-red-500 text-white">Delete</button>
                    </div>
                `;

                current_listings_box.appendChild(newCurrentListing);
            });

        } catch (error) {
            console.error("Error:", error);
            current_listings_box.innerHTML = `
                <div class="text-red-500 text-center p-4 border rounded-md bg-red-50">
                    Failed to load listings. ${error.message}
                </div>`;
        }
    });
});

// --------------------------------------------------------------------------------------------------------------------

async function deleteListing(listingId) {
    try {
        console.log("Delete Listing Request called with listingId:", listingId);
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5 sec timeout

        const response = await fetch(`${BASE_URL}/delete-listing`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                listing_id: listingId,
            }),
            credentials: 'include',
            signal: controller.signal
        });
        clearTimeout(timeout);

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Server error: ${response.status}`);
        }

        const result = await response.json();
        alert(result.message || "Food Listing deleted successfully!");
        
    } catch (error) {
        console.error("Full error:", error);

        let message = "Failed to delete listing";
        if (error.name === 'AbortError') {
            message = "Request timed out - server not responding";
        } else if (error.message.includes('Failed to delete')) {
            message = "Could not connect to server. Please:\n1. Check your internet\n2. Ensure backend is running\n3. Try refreshing the page";
        } else {
            message = error.message;
        }

        alert(message);
    }
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
let charity_id_for_request_delete;
document.addEventListener("DOMContentLoaded", () => {

    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('accept-btn')) {
            e.preventDefault();
            const reqListingId = e.target.dataset.reqListingId;
            console.log(reqListingId);
            await acceptRequest(reqListingId);
            inbox_btn.click(); // Refresh list
        }

        if (e.target.classList.contains('deny-btn')) {
            e.preventDefault();
            const reqListingId = e.target.dataset.reqListingId;
            if (!reqListingId) {
                console.error("Missing reqListingId in Deny button");
                return;
            }
            await denyRequest(reqListingId);
            inbox_btn.click(); // Refresh list
        }
    });
    
    const donor_inbox_box = document.querySelector("#donor_inbox_box");

    if (!inbox_btn || !donor_inbox_box) {
        console.error("Missing required elements for donor requests");
        return;
    }

    // LOAD DONOR REQUESTS ON BUTTON CLICK
    inbox_btn.addEventListener("click", async () => {


        donor_inbox_box.innerHTML = ""; // Clear previous content

        try {
            const response = await fetch(`${BASE_URL}/donor-requests`, {
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
                    donor_inbox_box.appendChild(noRequestsMsg);
                    return;
                }

                throw new Error(data.error || "Failed to fetch donor requests");
            }

            if (data.length === 0) {
                const noRequestsMsg = document.createElement("div");
                noRequestsMsg.className = "text-center text-gray-600 py-6 text-2xl";
                noRequestsMsg.textContent = "You have no current requests.";
                donor_inbox_box.appendChild(noRequestsMsg);
                return;
            }

            data.forEach(req => {
                charity_id_for_request_delete=req.charity_id;
                const requestCard = document.createElement("div");
                requestCard.className = "p-4 bg-white shadow-md rounded-xl border border-gray-200 mb-4";

                requestCard.innerHTML = `
                    <div class="relative p-4 bg-white shadow-md rounded-2xl border border-gray-200 flex flex-col gap-3">

                        <div class="absolute top-2 right-3 text-sm text-gray-500 font-mono">Request ID: ${req.request_id}</div>

                        <h3 class="text-xl font-semibold text-gray-800">Request from: ${req.charity.org_name}</h3>

                        <div class="text-sm text-gray-600">
                            <span class="inline-block px-2 py-1 bg-gray-100 rounded-full mb-1">
                                <strong>Message:</strong> ${req.message}
                            </span>
                        </div>

                        <div class="text-sm flex gap-5 text-gray-700 flex-wrap">
                            <div><strong>REQUESTED AT:</strong> ${new Date(req.time).toLocaleString()}</div>
                            <div><strong>CHARITY REPRESENTATIVE:</strong> ${req.charity.owner}</div>
                            <div><strong>CONTACT:</strong> ${req.charity.phone}</div>
                            <div><strong>LOCATION:</strong> ${req.charity.area_city}</div>
                        </div>

                        <div class="pt-2 border-t border-gray-200">
                            <p class="text-base font-medium text-gray-800 mb-1">Food Details</p>
                            <div class="flex flex-wrap gap-2 text-sm text-gray-700 items-center">
                                <span class="px-2 py-1 bg-gray-100 rounded-full">Name: ${req.food_listing.food_name}</span>
                                <span class="px-2 py-1 bg-gray-100 rounded-full">Quantity: ${req.food_listing.food_quantity}</span>
                                <span class="px-2 py-1 bg-gray-100 rounded-full">Type: ${req.food_listing.food_type}</span>
                                <span class="px-2 py-1 bg-gray-100 rounded-full">Category: ${req.food_listing.food_category}</span>

                                <div class="ml-auto flex gap-2">
                                    <button data-req-listing-id="${req.food_listing.food_listing_id}" class="accept-btn px-4 py-1 rounded-3xl bg-green-500 text-white hover:bg-green-600 transition">Accept</button>
                                    <button data-req-listing-id="${req.food_listing.food_listing_id}" class="deny-btn px-4 py-1 rounded-3xl bg-red-500 text-white hover:bg-red-600 transition">Deny</button>
                                </div>
                            </div>
                        </div>
                    </div>


                `;

                donor_inbox_box.appendChild(requestCard);
            });

        } catch (error) {
            console.error("Error:", error);
            donor_inbox_box.innerHTML = `
                <div class="text-red-500 text-center p-4 border rounded-md bg-red-50">
                    Failed to load donor requests. ${error.message}
                </div>`;
        }
    });
});


//------------------------------------------------------------------------------------------------------------------------------
async function acceptRequest(reqListingId) {
    try {
        console.log("Changing the status of listing having listingId:", reqListingId);
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5 sec timeout

        const response = await fetch(`${BASE_URL}/update-listing-status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                listing_id: reqListingId,
                action:"Accept",
                charity_id:charity_id_for_request_delete
            }),
            credentials: 'include',
            signal: controller.signal
        });
        clearTimeout(timeout);

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Server error: ${response.status}`);
        }

        const result = await response.json();
        alert(result.message || "Food Listing status updated successfully!");
        
    } catch (error) {
        console.error("Full error:", error);

        let message = "Failed to update listing status";
        if (error.name === 'AbortError') {
            message = "Request timed out - server not responding";
        } else if (error.message.includes('Failed to update')) {
            message = "Could not connect to server. Please:\n1. Check your internet\n2. Ensure backend is running\n3. Try refreshing the page";
        } else {
            message = error.message;
        }

        alert(message);
    }
}


//--------------------------------------------------------------------------------------------------------------------------------
async function denyRequest(reqListingId) {
    try {
        console.log("Changing the status of listing having listingId:", reqListingId);
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5 sec timeout

        const response = await fetch(`${BASE_URL}/update-listing-status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                listing_id: reqListingId,
                action:"Deny",
                charity_id:charity_id_for_request_delete
            }),
            credentials: 'include',
            signal: controller.signal
        });
        clearTimeout(timeout);

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Server error: ${response.status}`);
        }

        const result = await response.json();
        alert(result.message || "Request status updated successfully!");
        
    } catch (error) {
        console.error("Full error:", error);

        let message = "Failed to update Request Status";
        if (error.name === 'AbortError') {
            message = "Request timed out - server not responding";
        } else if (error.message.includes('Failed to update')) {
            message = "Could not connect to server. Please:\n1. Check your internet\n2. Ensure backend is running\n3. Try refreshing the page";
        } else {
            message = error.message;
        }

        alert(message);
    }
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {

    if (!past_donations_btn || !past_donations_box) {
        console.error("Missing required elements!");
        return;
    }

    // LOAD DONOR APPROVED REQUESTS
    past_donations_btn.addEventListener("click", async () => {
        past_donations_box.innerHTML = ""; // Clear previous content

        try {
            const response = await fetch(`${BASE_URL}/donor-approved-requests`, {
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
                past_donations_box.appendChild(noRequestsMsg);
                return;
            }

            data.forEach(req => {
                const requestCard = document.createElement("div");
                requestCard.className = "p-4 bg-white shadow-md rounded-xl border border-gray-200 mb-4";

                requestCard.innerHTML = `
                    <div class="relative p-4 bg-white shadow-md rounded-2xl border border-gray-200 flex flex-col gap-3">

                        <h3 class="text-xl font-semibold text-gray-800">Request from: ${req.charity?.org_name || 'N/A'}</h3>

                        <div class="text-sm flex gap-5 text-gray-700 flex-wrap">
                            <div><strong>CHARITY REPRESENTATIVE:</strong> ${req.charity?.owner || 'N/A'}</div>
                            <div><strong>CONTACT:</strong> ${req.charity?.phone || 'N/A'}</div>
                            <div><strong>LOCATION:</strong> ${req.charity?.area_city || 'N/A'}</div>
                        </div>

                        <div class="pt-2 border-t border-gray-200">
                            <p class="text-base font-medium text-gray-800 mb-1">Food Details</p>
                            <div class="flex flex-wrap gap-2 text-sm text-gray-700 items-center">
                                <span class="px-2 py-1 bg-gray-100 rounded-full">Name: ${req.food_listing?.food_name || 'N/A'}</span>
                                <span class="px-2 py-1 bg-gray-100 rounded-full">Quantity: ${req.food_listing?.food_quantity || 'N/A'}</span>
                                <span class="px-2 py-1 bg-gray-100 rounded-full">Type: ${req.food_listing?.food_type || 'N/A'}</span>
                                <span class="px-2 py-1 bg-gray-100 rounded-full">Category: ${req.food_listing?.food_category || 'N/A'}</span>

                                <div class="ml-auto flex gap-2">
                                    <button class="px-4 py-1 rounded-3xl bg-green-500 text-white hover:bg-green-600 transition">Accepted & Delivered</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                past_donations_box.appendChild(requestCard);
            });

        } catch (error) {
            console.error("Error:", error);
            past_donations_box.innerHTML = `
                <div class="text-red-500 text-center p-4 border rounded-md bg-red-50">
                    Failed to load approved donations. ${error.message}
                </div>`;
        }
    });
});
