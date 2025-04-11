import './style.css'

var featureCards=document.getElementsByClassName('feature-cards');
var loginBoxButtons=document.getElementsByClassName('loginbox-buttons');
let currentRole = '';

//FEATURE-CARDS------>>>>>>>>
for(let i=0;i<featureCards.length;i++){
    featureCards[i].addEventListener('mouseover',function (){
        this.style.backgroundColor="rgba(187, 247, 208, 1)";
    })
    
    featureCards[i].addEventListener('mouseleave',function(){
        this.style.backgroundColor="";
    })
}

//LOGINBOX-BUTTONS---------->>>>>>>>>>>>>>>
for(let i=0;i<loginBoxButtons.length;i++){
    loginBoxButtons[i].addEventListener('mouseover',function (){
        this.style.backgroundColor="black";
        this.style.border="1px solid green";
    })

    loginBoxButtons[i].addEventListener('mouseleave',function (){
        this.style.backgroundColor="";
        this.style.border="";
    })
}

console.log("Width:", window.innerWidth, "Height:", window.innerHeight);




function loginStart() {
    document.getElementById("loginbtns").classList.add("hidden");  // Hide login buttons
    document.getElementById("loginForm").classList.remove("hidden");  // Show login form
    document.getElementById("loginas").classList.add("hidden");
}
document.getElementById("donor").addEventListener("click",loginStart);
document.getElementById("charity").addEventListener("click",loginStart);

function clickOnRegister(){
    document.getElementById("rightdiv-section1").classList.add("hidden");
    document.getElementById("registerForm").classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
}

document.getElementById("registerlink").addEventListener("click",clickOnRegister);


//----------------------------------------------------------------------------------------------------------------------------------------------------
const apiKey = "pk.b7d3bfbe43b1ced8a286b05c3d5cac3e"; 
const input = document.getElementById("location");
const suggestions = document.getElementById("suggestions");

// Autocomplete suggestions
input.addEventListener("input", async () => {
    let query = input.value.trim();
    if (query.length < 3) {
        suggestions.innerHTML = "";
        suggestions.classList.add("hidden");
        return;
    }

    const url = `https://api.locationiq.com/v1/autocomplete.php?key=${apiKey}&q=${query}&limit=5&format=json`;

    try {
        let response = await fetch(url);
        if (!response.ok) throw new Error("API Error: " + response.statusText);
        let data = await response.json();

        if (data.length === 0) {
            suggestions.classList.add("hidden");
            return;
        }

        suggestions.innerHTML = data
            .map(item => `<li class="cursor-pointer p-2 hover:bg-gray-200" data-address="${item.display_name}">${item.display_name}</li>`)
            .join("");

        suggestions.classList.remove("hidden");

        document.querySelectorAll("#suggestions li").forEach(li => {
            li.addEventListener("click", function () {
                input.value = this.getAttribute("data-address");
                suggestions.innerHTML = "";
                suggestions.classList.add("hidden");
            });
        });
    } catch (error) {
        console.error("Error fetching location:", error);
    }
});

// Hide dropdown when clicking outside
document.addEventListener("click", (event) => {
    if (!input.contains(event.target) && !suggestions.contains(event.target)) {
        suggestions.classList.add("hidden");
    }
});

// Get current location and populate input
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const url = `https://us1.locationiq.com/v1/reverse.php?key=${apiKey}&lat=${latitude}&lon=${longitude}&format=json`;

                try {
                    let response = await fetch(url);
                    if (!response.ok) throw new Error("Reverse geocoding failed");
                    let data = await response.json();
                    input.value = data.display_name;
                } catch (err) {
                    console.error("Reverse geocoding failed:", err);
                    alert("Failed to fetch location details.");
                }
            },
            (error) => {
                console.error("Geolocation error:", error.message);
                alert("Unable to fetch current location.");
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

document.getElementById("currentLocation").addEventListener("click", getCurrentLocation);

//----------------------------------------------------------------------------------------------------------------------------------------------------
document.querySelectorAll(".formbtns").forEach(btn => {
    btn.addEventListener("change", function () {
        // Remove styles from all radio labels
        document.querySelectorAll(".radio-label").forEach(label => {
            label.classList.remove("h-16", "bg-[#f08223]", "text-white");
        });

        // Find the associated label and apply styles
        const selectedLabel = this.closest("label").querySelector(".radio-label");
        if (selectedLabel) {
            selectedLabel.classList.add("h-16", "bg-[#f08223]", "text-white");
        }
    });
});

document.querySelectorAll(".formbtns").forEach(btn => {
    if("input[name='userType']"==="Donor"){
        document.getElementById("CharityBtnBox").classList.remove("h-16", "bg-[#f08223]", "text-white");
        document.getElementById("DonorBtnBox").classList.add("h-16", "bg-[#f08223]", "text-white");
    }
    else if("input[name='userType']"==="Charity"){
        document.getElementById("DonorBtnBox").classList.remove("h-16", "bg-[#f08223]", "text-white");
        document.getElementById("CharityBtnBox").classList.add("h-16", "bg-[#f08223]", "text-white");
    }

});







let index = 0;
const totalSlides = 2; // Since two images are visible at a time

function slideBoxes() {
    index++;
    if (index > totalSlides) index = 0; // Loop back after last slide

    document.querySelector("#slider").style.transform = `translateX(-${index * 50}%)`;
}

// Auto-slide every 2 seconds
setInterval(slideBoxes, 2000);





document.getElementById("registerFORM").addEventListener("submit", async (event) => {
    event.preventDefault();

    const userType = document.querySelector("input[name='userType']:checked")?.value;

    const UserData = {
        userType: userType,
        org_name: document.getElementById("org_name").value,
        owner: document.getElementById("owner").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
        location: document.getElementById("location").value,
        area_city: document.getElementById("area_city").value,
        government_id: document.getElementById("government_id").value,
        pickup_method: document.getElementById("pickup_method").value,
        username: document.getElementById("register_username").value,
        password: document.getElementById("register_password").value,
    };

    const donorTypeElement = document.getElementById("donor_type_registration");
    const donorType = document.getElementById("donor_type_registration").value;
    if (userType === "Donor") {
        donorTypeElement.setAttribute("required", "true");
        UserData.type = donorType;
    }
    else {
        donorTypeElement.removeAttribute("required");
    }

    try {
        const response = await fetch("http://127.0.0.1:5000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(UserData),
        });

        
        const result = await response.json();
        console.log("Server Response:", result); // ✅ Debugging
        alert(result.message);

        if (response.ok) {
            alert("Registration successful! Redirecting to homepage...");
            window.location.replace("index.html");

        } else {
            alert("Error: " + result.message);
        }
    } 
    catch (error) {
        console.error("Error:", error);
    }

    
});

document.getElementById("registerFORM").onsubmit = function() {
    setTimeout(() => {
        document.getElementById("registerFORM").reset();
    }, 500);  // Small delay to ensure form submission
};


// Set up event listeners for role buttons
document.getElementById('donor').addEventListener('click', () => setRole('donor'));
document.getElementById('charity').addEventListener('click', () => setRole('charity'));

function setRole(role) {
    currentRole = role;
    document.getElementById('userRole').value = role;
    document.getElementById('loginForm').classList.remove('hidden');
    
    // Visual feedback (optional)
    document.querySelectorAll('.loginbox-buttons').forEach(btn => {
        btn.classList.remove('bg-blue-500', 'text-white');
    });
    document.getElementById(role).classList.add('bg-blue-500', 'text-white');
}






document.getElementById('donor').addEventListener('click', () => {
    document.getElementById('loginForm').classList.remove('hidden');
});

document.getElementById('charity').addEventListener('click', () => {
    document.getElementById('loginForm').classList.remove('hidden');
});

// Handle login form submission
document.getElementById('loginBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('userRole').value;

    try {
        const response = await fetch("http://127.0.0.1:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ username, password, role })
        });

        const data = await response.json();

        if (response.ok) {
            window.location.href = `http://localhost:5173${data.redirect}`;
        } else {
            alert(data.error || "Login failed");
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Login error: " + error.message);
    }
});



const donorRadio=document.getElementById("donorRadio");
const charityRadio=document.getElementById("charityRadio");
const donorTypeOption= document.getElementById("donor_type_option");

donorRadio.addEventListener("change",()=>{
    if(donorRadio.checked){
        donorTypeOption.style.display="block";
    }
})

charityRadio.addEventListener("change",()=>{
    if(charityRadio.checked){
        donorTypeOption.style.display="";
    }
})