from flask import Flask, request, jsonify, render_template,flash
from flask import Flask, request, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from supabase.client import Client, create_client
import requests

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
CORS(app)  # Enable CORS

@app.route("/register", methods=["POST"])
def register():
    try:
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form
            
        hashed_password=generate_password_hash(data["password"], method="pbkdf2:sha256",salt_length=16 )
        
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
        print("Error:", e)  # ✅ Debugging: Check errors
        return jsonify({"message": "An error occurred", "error": str(e)}), 500
   

if __name__ == '__main__':
    app.run(debug=True)
