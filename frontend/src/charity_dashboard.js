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

