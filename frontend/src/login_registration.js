// import './style.css'


// const apiKey = "pk.b7d3bfbe43b1ced8a286b05c3d5cac3e"; // Replace with your actual key
// const input = document.getElementById("locationInput");
// const suggestions = document.getElementById("suggestions");

// input.addEventListener("input", async () => {
//     let query = input.value.trim();
//     if (query.length < 3) {
//         suggestions.innerHTML = "";
//         suggestions.classList.add("hidden"); // Hide suggestions if input is too short
//         return;
//     }

//     const url = `https://api.locationiq.com/v1/autocomplete.php?key=${apiKey}&q=${query}&limit=5&format=json`;

//     try {
//         let response = await fetch(url);
//         if (!response.ok) throw new Error("API Error: " + response.statusText);
//         let data = await response.json();

//         if (data.length === 0) {
//             suggestions.classList.add("hidden");
//             return;
//         }

//         suggestions.innerHTML = data
//             .map(item => `<li class="cursor-pointer p-2 hover:bg-gray-200" data-address="${item.display_name}">${item.display_name}</li>`)
//             .join("");

//         suggestions.classList.remove("hidden"); // Show suggestions when available

//         // Add click event listener to the newly created <li> elements
//         document.querySelectorAll("#suggestions li").forEach(li => {
//             li.addEventListener("click", function() {
//                 input.value = this.getAttribute("data-address"); // Set input field
//                 suggestions.innerHTML = "";
//                 suggestions.classList.add("hidden"); // Hide suggestions
//             });
//         });
//     } catch (error) {
//         console.error("Error fetching location:", error);
//     }
// });

// // Hide dropdown when clicking outside
// document.addEventListener("click", (event) => {
//     if (!input.contains(event.target) && !suggestions.contains(event.target)) {
//         suggestions.classList.add("hidden");
//     }
// });

// function getCurrentLocation() {
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(async (position) => {
//             const { latitude, longitude } = position.coords;
//             const url = `https://us1.locationiq.com/v1/reverse.php?key=${apiKey}&lat=${latitude}&lon=${longitude}&format=json`;

//             let response = await fetch(url);
//             let data = await response.json();

//             document.getElementById("locationInput").value = data.display_name;
//         });
//     } else {
//         alert("Geolocation is not supported by your browser.");
//     }
// }
// document.getElementById("currentLocation").addEventListener("click",getCurrentLocation);




// document.getElementById("registerFORM").addEventListener("submit",async (event)=>{
//     event.preventDefault();

//     const userType=document.querySelector("input[name='UserType']:checked")?.value;

//     const UserData={
//         userType:userType,
//         org_name:document.getElementById("org_name").value,
//         owner:document.getElementById("owner").value,
//         phone:document.getElementById("phone").value,
//         email:document.getElementById("email").value,
//         location:document.getElementById("location").value,
//         area_city:document.getElementById("area_city").value,
//         government_id:document.getElementById("government_id").value,
//         pickup_method:document.getElementById("pickup_method").value,
//         food_type:document.getElementById("food_type").value,
//         username:document.getElementById("username").value,
//         password:document.getElementById("password").value
//     }

//     try{
//         const response=await fetch("http://127.0.0.1:5000/register",{
//             method:"POST",
//             headers:{
//                 "Content-Type":"application/json",
//             },
//             body:JSON.stringify(UserData),
//         });

//         const result=await response.json();
//         alert(result.message);
//     }
//     catch(error){
//         console.error("Error:",error);
//     }
// })