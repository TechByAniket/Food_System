import './style.css'

let inbox=document.getElementById("charity_inbox_section");
let user_profile=document.getElementById("user_profile_and_food_list_section");
let past_donations=document.getElementById("received_donations_section");

let list_food_btn=document.getElementById("list_food_btn_div");
let inbox_btn=document.getElementById("inbox_btn_div");
let past_donations_btn=document.getElementById("received_donations_btn_div");

inbox_btn.addEventListener("click", ()=>{
    user_profile.classList.add("hidden");
    past_donations.classList.add("hidden");
    inbox.classList.remove("hidden");

})

list_food_btn.addEventListener("click", ()=>{
    inbox.classList.add("hidden");
    past_donations.classList.add("hidden");
    user_profile.classList.remove("hidden");
})

past_donations_btn.addEventListener("click", ()=>{
    inbox.classList.add("hidden");
    user_profile.classList.add("hidden");
    past_donations.classList.remove("hidden");
})

document.getElementById("logoutbtn").addEventListener("click", async function (event) {
    event.preventDefault();  // ✅ Prevent default form submission

    const response = await fetch("http://127.0.0.1:5000/logout", {
        method: "POST",
        credentials: "include"  // ✅ Send session cookies
    });

    const data = await response.json();

    if (response.ok) {
        window.location.href = `http://localhost:5173${data.redirect}`;  // ✅ Redirect to login page
    } else {
        alert("Logout failed. Try again.");
    }
});




async function loadUserData() {
    const response = await fetch("http://127.0.0.1:5000/user-info", {
        method: "GET",
        credentials: "include"  // Required to send session cookies
    });

    const data = await response.json();

    if (data.redirect) {
        window.location.href = `http://localhost:5173${data.redirect}`;  //  Redirect to login if needed
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