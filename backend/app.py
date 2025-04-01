from flask import Flask, request, jsonify, render_template,flash, send_from_directory, session
from flask import Flask, request, session, redirect, url_for
from flask_session import Session
import psycopg2
from psycopg2.extras import RealDictCursor
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from supabase.client import Client, create_client
import requests
from database import get_db_connection
import os

# Supabase Credentials
SUPABASE_URL = "https://bdsyggaigzmrnurkmzkn.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkc3lnZ2FpZ3ptcm51cmttemtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzM0NTgsImV4cCI6MjA1ODc0OTQ1OH0.a4KyrWebWxUIKFxAX6JHLIFGSyVQ3TKyN5OvDGv5y38"
SUPABASE_TABLE = "donors"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}


# Initialize Supabase Client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

app = Flask(__name__)
app.secret_key='1234'
# Configuration
app.config.update(
    # Session configuration
    SECRET_KEY=os.urandom(24),  # Random secret key
    SESSION_TYPE='filesystem',   # Stores session on the server
    SESSION_FILE_DIR='./flask_sessions',  # Directory for session files
    SESSION_PERMANENT=True,
    PERMANENT_SESSION_LIFETIME=3600,  # 1 hour

    # ✅ Fix for cross-site cookie rejection
    SESSION_COOKIE_SECURE=True,    # Required when SameSite=None
    SESSION_COOKIE_SAMESITE='None',  # ✅ Allows cross-origin requests
    SESSION_COOKIE_HTTPONLY=True  # Prevents JavaScript from accessing cookies
)

# Create session directory if it doesn't exist
if not os.path.exists('./flask_sessions'):
    os.makedirs('./flask_sessions')

Session(app)

# Configure CORS
CORS(app, 
     supports_credentials=True,
     origins=["http://localhost:5173", "http://127.0.0.1:5000"],
     allow_headers=["Content-Type"],
     methods=["GET", "POST", "OPTIONS"])

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

@app.route("/")
def home():
    if "username" in session:
        return jsonify({"redirect": "/dashboard"})  # ✅ Return JSON instead of direct redirect
    return send_from_directory("../frontend", "index.html")


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data["username"]
    password = data["password"]
    role = data.get("role")  # Get the role from frontend

    # Check the appropriate table based on role
    if role == "donor":
        user = supabase.table("donors").select("*").eq("username", username).execute()
    else:
        user = supabase.table("charity").select("*").eq("username", username).execute()
    
    if user.data and check_password_hash(user.data[0]["password"], password):
        session["username"] = username
        session["role"] = role
        return jsonify({"success": True, "redirect": f"/{role}_dashboard"})
    
    return jsonify({"error": "Invalid credentials"}), 401

@app.route("/donor_dashboard")
def donor_dashboard():
    if "role" not in session or session["role"] != "donor":
        return redirect("/")
    return send_from_directory("../frontend", "donor_dashboard.html")

@app.route("/charity_dashboard")
def charity_dashboard():
    if "role" not in session or session["role"] != "charity":
        return redirect("/")
    return send_from_directory("../frontend", "charity_dashboard.html")





@app.route("/register", methods=["POST"])
def register():
    try:
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form
            
        hashed_password = generate_password_hash(data["password"], method="pbkdf2:sha256", salt_length=16)

        if not data.get("userType"):
            return jsonify({"message": "User type is required!"}), 400
        
        table_name = "donors" if data.get("userType") == "Donor" else "charity"
        response = supabase.table(table_name).insert({
            "org_name": data["org_name"],
            "owner": data["owner"],
            "phone": data["phone"],
            "email": data["email"],
            "location": data["location"],
            "area_city": data["area_city"],
            "government_id": data["government_id"],
            "pickup_method": data["pickup_method"],
            "username": data["username"],
            "password": hashed_password,
        }).execute()

        return jsonify({"message": "Registration successful!"}), 201

    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

@app.route("/logout", methods=["POST"])
def logout():
    session.clear()  # ✅ Clears all session data
    return jsonify({"message": "Logout successful", "redirect": "/login"}), 200



@app.route("/user-info", methods=["GET"])
def user_info():
    if "username" not in session:
        return jsonify({"redirect": "/login"}), 401  # If not logged in, send redirect response
    
    username = session["username"]
    role = session["role"]

    # Connect to database and get user details
    conn = get_db_connection()
    cursor = conn.cursor()

    if role == "donor":
        cursor.execute("SELECT org_name, owner, phone, email, area_city FROM donors WHERE username = %s", (username,))
    else:
        cursor.execute("SELECT org_name, owner, phone, email, area_city FROM charity WHERE username = %s", (username,))
    
    user = cursor.fetchone()
    conn.close()

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "username": username,
        "role": role,
        "org_name": user[0],
        "owner": user[1],
        "phone": user[2],
        "email": user[3],
        "area_city":user[4]
    })


@app.route("/user-status")
def user_status():
    if "username" in session:
        return jsonify({"logged_in": True, "username": session["username"], "role": session["role"]})
    return jsonify({"logged_in": False})  # Not logged in


@app.route("/list-food", methods=["POST","GET"])
def list_food():
    try:
        if "username" in session:
        
            if request.is_json:
                data2 = request.get_json()
                print(data2)
            else:
                data2 = request.form
                print(data2)
        
            username=session["username"]
            role=session["role"]
        
            conn = get_db_connection()
            cursor = conn.cursor()

            if role == "donor":
                cursor.execute("SELECT org_name, phone, pickup_method, area_city FROM donors WHERE username = %s", (username,))
        
            user2 = cursor.fetchone()
            conn.close()
        
            username=username
            role=role
            org_name=user2[0]
            phone=user2[1]
            pickup_delivery=user2[2]
            area_city=user2[3]
            food_name=data2["food_name"]
            food_type=data2["food_type"]
            food_quantity=data2["food_quantity"]
            description=data2["description"]
        
            supabase.table("food_listing").insert({
                "org_name": org_name,
                "phone": phone,
                "area_city": area_city,
                "pickup_delivery": pickup_delivery,
                "username": username,
                "food_name":food_name,
                "food_type": food_type,
                "food_quantity": food_quantity,
                "description": description,
            }).execute()
        
            return jsonify({
                "org_name": org_name,
                "phone": phone,
                "area_city": area_city,
                "pickup_delivery": pickup_delivery,
                "username": username,
                "food_name":food_name,
                "food_type": food_type,
                "food_quantity": food_quantity,
                "description": description,
            }), 201
            
            # return jsonify({"message":"Food Listed Successfully!"}), 201
    
    
    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "An error occurred", "error": str(e)}), 500
           
           
@app.route("/food-list-info", methods=["GET","POST"])
def food_list_info():
    
    if "username" not in session:
        return jsonify({"redirect": "/login"}), 401  # If not logged in, send redirect response
    
    username = session["username"]
    role = session["role"]

    # Connect to database and get user details
    conn = get_db_connection()
    cursor = conn.cursor()

    
    cursor.execute("SELECT food_name, org_name, area_city, food_quantity, food_type, pickup_delivery, phone, description FROM food_listing WHERE username = %s AND is_listed = FALSE", (username,))
    
    user3 = cursor.fetchone()
    conn.close()

    if not user3:
        return jsonify({"error": "Listing not found"}), 404

    return jsonify({
        "food_name":user3[0],
        "org_name":user3[1],
        "area_city":user3[2],
        "food_quantity":user3[3],
        "food_type":user3[4],
        "pickup_delivery":user3[5],
        "phone":user3[6],
        "description":user3[7]
    })

           

if __name__ == '__main__':
    app.run(debug=True)
