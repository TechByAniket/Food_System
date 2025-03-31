import './style.css'

document.getElementById("imageInput").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewImg = document.getElementById("previewImg");
            previewImg.src = e.target.result;
            previewImg.classList.remove("hidden");
        };
        reader.readAsDataURL(file);
    }
});

let inbox=document.getElementById("donor_inbox_section");
let user_profile=document.getElementById("user_profile_and_food_list_section");
let past_donations=document.getElementById("past_donations_section");

let list_food_btn=document.getElementById("list_food_btn_div");
let inbox_btn=document.getElementById("inbox_btn_div");
let past_donations_btn=document.getElementById("past_donations_btn_div");

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

