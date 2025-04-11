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
from datetime import *

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
app.config['PROPAGATE_EXCEPTIONS'] = True
app.secret_key='1234'
# Configuration
app.config.update(
    # Session configuration
    SECRET_KEY=os.urandom(24),  # Random secret key
    SESSION_TYPE='filesystem',   # Stores session on the server
    SESSION_FILE_DIR='./flask_sessions',  # Directory for session files
    SESSION_PERMANENT=True,
    PERMANENT_SESSION_LIFETIME=3600,  # 1 hour

    # Fix for cross-site cookie rejection
    SESSION_COOKIE_SECURE=True,    # Required when SameSite=None
    SESSION_COOKIE_SAMESITE='None',  # Allows cross-origin requests
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
        return jsonify({"redirect": "/dashboard"}) 
    return send_from_directory("../frontend", "index.html")


#-----------------------------------------------------------------------------------------------------------------------

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

#-----------------------------------------------------------------------------------------------------------------------

@app.route("/donor_dashboard")
def donor_dashboard():
    if "role" not in session or session["role"] != "donor":
        return redirect("/")
    return send_from_directory("../frontend", "donor_dashboard.html")

#-----------------------------------------------------------------------------------------------------------------------

@app.route("/charity_dashboard")
def charity_dashboard():
    if "role" not in session or session["role"] != "charity":
        return redirect("/")
    return send_from_directory("../frontend", "charity_dashboard.html")




#-----------------------------------------------------------------------------------------------------------------------


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

        # Base fields common to both
        insert_data = {
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
        }

        # Add donor_type only if it's a donor
        if table_name == "donors" and "type" in data:
            insert_data["type"] = data["type"]

        # Insert into Supabase
        response = supabase.table(table_name).insert(insert_data).execute()


        return jsonify({"message": "Registration successful!"}), 201

    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

#-----------------------------------------------------------------------------------------------------------------------

@app.route("/logout", methods=["POST"])
def logout():
    session.clear()  #Clears all session data
    return jsonify({"message": "Logout successful", "redirect": "/login"}), 200



#-----------------------------------------------------------------------------------------------------------------------

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
        cursor.execute("SELECT org_name, owner, phone, email, area_city, type FROM donors WHERE username = %s", (username,))
    else:
        cursor.execute("SELECT org_name, owner, phone, email, area_city FROM charity WHERE username = %s", (username,))
    
    user = cursor.fetchone()
    conn.close()

    if not user:
        return jsonify({"error": "User not found"}), 404

    if role=="donor":
        return jsonify({
            "username": username,
            "role": role,
            "org_name": user[0],
            "owner": user[1],
            "phone": user[2],
            "email": user[3],
            "area_city":user[4],
            "type": user[5]
        })
    else:
         return jsonify({
            "username": username,
            "role": role,
            "org_name": user[0],
            "owner": user[1],
            "phone": user[2],
            "email": user[3],
            "area_city":user[4]
        })
            


#-----------------------------------------------------------------------------------------------------------------------

@app.route("/user-status")
def user_status():
    if "username" in session:
        return jsonify({"logged_in": True, "username": session["username"], "role": session["role"]})
    return jsonify({"logged_in": False})  # Not logged in


#-----------------------------------------------------------------------------------------------------------------------

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
                cursor.execute("SELECT org_name, phone, pickup_method, area_city,type, donor_id FROM donors WHERE username = %s", (username,))
        
            user2 = cursor.fetchone()
            conn.close()
        
            username=username
            role=role
            org_name=user2[0]
            phone=user2[1]
            pickup_delivery=user2[2]
            area_city=user2[3]
            donor_type=user2[4]
            donor_id=user2[5]
            food_category=data2["food_category"]
            food_name=data2["food_name"]
            food_type=data2["food_type"]
            food_quantity=data2["food_quantity"]
            description=data2["description"]
            imageurl=data2["imageurl"]
        
            supabase.table("food_listing").insert({
                "org_name": org_name,
                "phone": phone,
                "area_city": area_city,
                "pickup_delivery": pickup_delivery,
                "username": username,
                "food_name":food_name,
                "donor_type":donor_type,
                "food_category":food_category,
                "food_type": food_type,
                "food_quantity": food_quantity,
                "description": description,
                "imageurl":imageurl,
                "donor_id":donor_id
            }).execute()
        
            return jsonify({
                "org_name": org_name,
                "phone": phone,
                "area_city": area_city,
                "pickup_delivery": pickup_delivery,
                "username": username,
                "food_name":food_name,
                "donor_type":donor_type,
                "food_category":food_category,
                "food_type": food_type,
                "food_quantity": food_quantity,
                "description": description,
                "imageurl":imageurl,
                "donor_id":donor_id
            }), 201
            
    
    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "An error occurred", "error": str(e)}), 500
           

#-----------------------------------------------------------------------------------------------------------------------
           
@app.route("/food-list-info", methods=["GET"])
def food_list_info():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT food_name, org_name, area_city, food_quantity, food_type,
               pickup_delivery, phone, description, donor_type, food_category, imageurl, food_listing_id 
        FROM food_listing
        WHERE status = 'Pending'
    """)

    listings = cursor.fetchall()
    conn.close()

    if not listings:
        return jsonify({"error": "No active listings found"}), 404

    return jsonify([{
        "food_name": l[0],
        "org_name": l[1],
        "area_city": l[2],
        "food_quantity": l[3],
        "food_type": l[4],
        "pickup_delivery": l[5],
        "phone": l[6],
        "description": l[7],
        "donor_type": l[8],
        "food_category": l[9],
        "imageurl": l[10],
        "listing_id":l[11]
    } for l in listings])
    
#-----------------------------------------------------------------------------------------------------------------------
@app.route('/create-request', methods=['POST'])
def create_request():
    try:
        # 1. Validate session
        if 'username' not in session:
            print("No username in session")
            return jsonify({"error": "Not authenticated"}), 401

        # 2. Get and validate request data
        request_data = request.get_json()
        if not request_data:
            print("No data received")
            return jsonify({"error": "No data provided"}), 400

        listing_id = request_data.get('listing_id')
        if not listing_id:
            print("No listing_id provided")
            return jsonify({"error": "Listing ID is required"}), 400

        # 3. Get charity info
        charity_res = supabase.table('charity') \
            .select('charity_id') \
            .eq('username', session['username']) \
            .execute()

        if not charity_res.data:
            print("Charity not found for username:", session['username'])
            return jsonify({"error": "Charity not found"}), 404

        charity_id = charity_res.data[0]['charity_id']

        # 4. Verify listing exists
        listing_res = supabase.table('food_listing') \
            .select('food_listing_id, donor_id') \
            .eq('food_listing_id', listing_id) \
            .execute()

        if not listing_res.data:
            print("Listing not found:", listing_id)
            return jsonify({"error": "Listing not found"}), 404

        listing = listing_res.data[0]

        # 5. Check for duplicate requests
        existing_request = supabase.table('requests') \
            .select('*') \
            .eq('food_listing_id', listing_id) \
            .eq('charity_id', charity_id) \
            .execute()

        if existing_request.data:
            print("Duplicate request detected")
            return jsonify({
                "error": "You've already requested this listing",
                "request_id": existing_request.data[0]['request_id']
            }), 400

        # 6. Create new request
        new_request = {
            "food_listing_id": listing_id,
            "donor_id": listing['donor_id'],            
            "charity_id": charity_id,
            "message": request_data.get('message', ''),
            "time": datetime.now().isoformat(),
            # "status": "pending"
        }

        result = supabase.table('requests') \
            .insert(new_request) \
            .execute()

        # Safe error handling
        if getattr(result, 'error', None):
            print("Supabase insert error:", result.error)
            return jsonify({
                "error": "Failed to insert request",
                "details": str(result.error)
            }), 500

        if not result.data:
            print("Insert successful but result.data is empty")
            return jsonify({
                "error": "Request created but no data returned"
            }), 500

        print("Request created successfully:", result.data)
        return jsonify({
            "success": True,
            "message": "Request sent successfully",
            "request_id": result.data[0]['request_id']
        }), 201

    except Exception as e:
        print("Error in create_request:", str(e))
        return jsonify({
            "error": "Internal server error",
            "message": "Failed to process request"
        }), 500

#-----------------------------------------------------------------------------------------------------------------------

@app.route('/current-listings', methods=['POST','GET'])
def current_listings():
    try:
        if 'username' not in session:
            print("No username in session")
            return jsonify({"error": "Not authenticated"}), 401
        
        username=session["username"]
        
        current_listing = supabase.table('food_listing') \
            .select('food_listing_id, food_quantity, food_name, food_type, food_category') \
            .eq('username', username) \
            .execute()

        if not current_listing.data:
            return jsonify({
                "success": True,
                "listings": []
            }), 200


        current_listings_dict = current_listing.data
        
        return jsonify({
            "success": True,
            "listings": current_listings_dict
        }), 200

        
    except Exception as e:    
        print("Error in current_listing_fetch_request:", str(e))
        return jsonify({
            "error": "Internal server error",
            "message": "Failed to fetch request"
        }), 500
        
        
        

#-----------------------------------------------------------------------------------------------------------------------

@app.route('/delete-listing', methods=['POST','GET'])
def delete_listing():
    try:
        print("Hello Im here!")
        if 'username' not in session:
            print("No username in session")
            return jsonify({"error": "Not authenticated"}), 401
        
        request_data = request.get_json()
        if not request_data:
            print("No data received")
            return jsonify({"error": "No data provided"}), 400

        delete_listing_id = request_data.get('listing_id')
        if not delete_listing_id:
            print("No listing_id provided")
            return jsonify({"error": "Listing ID is required"}), 400
                
        # print("Received data:", request_data)        
        # delete_listing_id=int(data3["listing_id"])        
        
        delete_listing = supabase.table('food_listing') \
            .delete() \
            .eq('food_listing_id', delete_listing_id) \
            .execute()

        
        return jsonify({
            "success": True,
            "message":"Food Listing Deleted succesfully!" 
        }), 200

        
    except Exception as e:    
        print("Error in delete_listing_request:", str(e))
        return jsonify({
            "error": "Internal server error",
            "message": "Failed to fetch request"
        }), 500        

        
        
        
#------------------------------------------------------------------------------------------------------------
@app.route('/donor-requests', methods=['GET', 'POST'])
def get_donor_requests():
    print("I'm here!")
    if 'username' not in session:
        return jsonify({"error": "Not authenticated"}), 401

    # Step 1: Get donor_id from donors table using session username
    donor_res = supabase.table('donors') \
        .select('donor_id') \
        .eq('username', session['username']) \
        .limit(1) \
        .execute()

    if not donor_res.data:
        return jsonify({"error": "Donor not found"}), 404

    donor_id = donor_res.data[0]['donor_id']

    # Step 2: Get all requests made to this donor
    requests_res = supabase.table('requests') \
        .select('request_id, food_listing_id, charity_id, time, message') \
        .eq('donor_id', donor_id) \
        .execute()

    requests_data = requests_res.data
    full_requests = []

    # Step 3: For each request, fetch charity and food listing data
    for req in requests_data:
        # Fetch charity info (safe fetch)
        charity_info = supabase.table('charity') \
            .select('org_name, phone, area_city, owner') \
            .eq('charity_id', req['charity_id']) \
            .limit(1) \
            .execute()

        charity_data = charity_info.data[0] if charity_info.data else {}

        # Fetch food listing info (safe fetch)
        food_info = supabase.table('food_listing') \
            .select('food_name, food_quantity, food_type, food_category, food_listing_id') \
            .eq('food_listing_id', req['food_listing_id']) \
            .limit(1) \
            .execute()

        food_data = food_info.data[0] if food_info.data else {}

        # Combine all the data into one object
        full_request = {
            "request_id": req["request_id"],
            "time": req["time"],
            "message": req["message"],
            "charity_id": req["charity_id"],
            "charity": charity_data,
            "food_listing": food_data
        }

        full_requests.append(full_request)

    return jsonify(full_requests)

#----------------------------------------------------------------------------------------------------------------
@app.route('/charity-requests', methods=['GET','POST'])
def get_charity_requests():
    if 'username' not in session:
        return jsonify({"error": "Not authenticated"}), 401

    # Get charity_id
    charity_res = supabase.table('charity') \
        .select('charity_id') \
        .eq('username', session['username']) \
        .execute()

    if not charity_res.data:
        return jsonify({"error": "Charity not found"}), 404

    charity_id = charity_res.data[0]['charity_id']

    # Get requests made by this charity
    requests_res = supabase.table('requests') \
        .select('request_id, food_listing_id, donor_id, time, message') \
        .eq('charity_id', charity_id) \
        .execute()

    full_requests = []

    for req in requests_res.data:
        # Fetch donor info
        donor_info = supabase.table('donors') \
            .select('org_name, phone, area_city, owner') \
            .eq('donor_id', req['donor_id']) \
            .single() \
            .execute()

        # Fetch food listing info
        food_info = supabase.table('food_listing') \
            .select('food_name, food_quantity, food_type, food_category, status') \
            .eq('food_listing_id', req['food_listing_id']) \
            .single() \
            .execute()

        full_request = {
            "request_id": req["request_id"],
            "time": req["time"],
            "message": req["message"],
            "donor": donor_info.data if donor_info.data else {},
            "food_listing": food_info.data if food_info.data else {}
        }

        full_requests.append(full_request)

    return jsonify(full_requests)


#---------------------------------------------------------------------------------------------------------------------------

@app.route('/update-listing-status', methods=['GET', 'POST'])
def update_listing_status():
    try:
        if 'username' not in session:
            return jsonify({"error": "Not authenticated"}), 401

        request_data = request.get_json()
        if not request_data:
            return jsonify({"error": "No data provided"}), 400

        action = request_data.get('action')
        listing_id = request_data.get('listing_id')
        charity_id = request_data.get('charity_id')

        if not listing_id:
            return jsonify({"error": "Listing ID is required"}), 400

        if action == "Accept":
            # Step 1: Update status
            supabase.table('food_listing') \
                .update({"status": "Approved"}) \
                .eq('food_listing_id', listing_id) \
                .execute()

            # Step 2: Fetch food listing
            listing_response = supabase.table('food_listing') \
                .select("*") \
                .eq('food_listing_id', listing_id) \
                .execute()

            listing_data = listing_response.data
            if not listing_data or len(listing_data) == 0:
                return jsonify({"error": "Listing not found"}), 404

            insert_data = listing_data[0]
            insert_data['charity_id'] = charity_id

            # Step 3: Insert into approved_listings
            insert_response = supabase.table('approved_listings') \
                .insert(insert_data) \
                .execute()

            if not insert_response.data:
                return jsonify({"error": "Insertion to approved_listings failed"}), 500

            # Step 4: Fetch and move all denied requests
            all_requests_res = supabase.table('requests') \
                .select("*") \
                .eq('food_listing_id', listing_id) \
                .neq('charity_id', charity_id) \
                .execute()

            denied_requests = all_requests_res.data

            if denied_requests:
                # Insert denied requests into denied_requests table
                supabase.table('denied_requests') \
                    .insert(denied_requests) \
                    .execute()

            # Step 5: Delete ALL requests for this food_listing
            supabase.table('requests') \
                .delete() \
                .eq('food_listing_id', listing_id) \
                .execute()

            # Step 6: Delete food listing
            supabase.table('food_listing') \
                .delete() \
                .eq('food_listing_id', listing_id) \
                .execute()

            return jsonify({
                "success": True,
                "message": "Request accepted !."
            }), 200

        elif action == "Deny":
            # Update status
            supabase.table('food_listing') \
                .update({"status": "Denied"}) \
                .eq('food_listing_id', listing_id) \
                .execute()

            # Move this denied request to denied_requests table
            denied_req_data = supabase.table('requests') \
                .select("*") \
                .eq('food_listing_id', listing_id) \
                .eq('charity_id', charity_id) \
                .execute()

            if denied_req_data.data:
                supabase.table('denied_requests') \
                    .insert(denied_req_data.data) \
                    .execute()

            # Remove from requests table
            supabase.table('requests') \
                .delete() \
                .eq('charity_id', charity_id) \
                .eq('food_listing_id', listing_id) \
                .execute()

            return jsonify({
                "success": True,
                "message": "Request Denied!"
            }), 200

        else:
            return jsonify({"error": "Invalid action provided"}), 400

    except Exception as e:
        print("Server error:", str(e))
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500



#-----------------------------------------------------------------------------------------------------------------------------
@app.route('/donor-approved-requests', methods=['GET', 'POST'])
def get_donor_approved_requests():
    if 'username' not in session:
        return jsonify({"error": "Not authenticated"}), 401

    # Step 1: Get donor_id using session username
    donor_res = supabase.table('donors') \
        .select('donor_id') \
        .eq('username', session['username']) \
        .limit(1) \
        .execute()

    if not donor_res.data:
        return jsonify({"error": "Donor not found"}), 404

    donor_id = donor_res.data[0]['donor_id']

    # Step 2: Get all approved requests made to this donor
    requests_res = supabase.table('approved_listings') \
        .select('food_listing_id, charity_id, food_name, food_quantity, food_type, food_category') \
        .eq('donor_id', donor_id) \
        .execute()

    requests_data = requests_res.data
    full_approved_requests = []

    # Step 3: For each request, fetch charity info only
    for req in requests_data:
        charity_info = supabase.table('charity') \
            .select('org_name, phone, area_city, owner') \
            .eq('charity_id', req['charity_id']) \
            .limit(1) \
            .execute()

        charity_data = charity_info.data[0] if charity_info.data else {}

        full_request = {
            "charity_id": req["charity_id"],
            "charity": charity_data,
            "food_listing": {
                "food_listing_id": req["food_listing_id"],
                "food_name": req["food_name"],
                "food_quantity": req["food_quantity"],
                "food_type": req["food_type"],
                "food_category": req["food_category"]
            }
        }

        full_approved_requests.append(full_request)

    return jsonify(full_approved_requests)


#-------------------------------------------------------------------------------------------------------------------------
@app.route('/charity-approved-requests', methods=['GET', 'POST'])
def get_charity_approved_requests():
    if 'username' not in session:
        return jsonify({"error": "Not authenticated"}), 401

    # Step 1: Get charity_id using session username
    charity_res = supabase.table('charity') \
        .select('charity_id') \
        .eq('username', session['username']) \
        .limit(1) \
        .execute()

    if not charity_res.data:
        return jsonify({"error": "Charity not found"}), 404

    charity_id = charity_res.data[0]['charity_id']

    # Step 2: Get all approved requests of charity
    requests_res = supabase.table('approved_listings') \
        .select('food_listing_id, donor_id, food_name, food_quantity, food_type, food_category') \
        .eq('charity_id', charity_id) \
        .execute()

    requests_data = requests_res.data
    full_approved_requests = []

    # Step 3: For each request, fetch donor info only
    for req in requests_data:
        donor_info = supabase.table('donors') \
            .select('org_name, phone, area_city, owner') \
            .eq('donor_id', req['donor_id']) \
            .limit(1) \
            .execute()

        donor_data = donor_info.data[0] if donor_info.data else {}

        full_request = {
            "donor_id": req["donor_id"],
            "donor": donor_data,
            "food_listing": {
                "food_listing_id": req["food_listing_id"],
                "food_name": req["food_name"],
                "food_quantity": req["food_quantity"],
                "food_type": req["food_type"],
                "food_category": req["food_category"]
            }
        }

        full_approved_requests.append(full_request)

    return jsonify(full_approved_requests)

#--------------------------------------------------------------------------------------------------------------------------------------
@app.route('/charity-denied-requests', methods=['GET', 'POST'])
def get_charity_denied_requests():
    if 'username' not in session:
        return jsonify({"error": "Not authenticated"}), 401

    # Step 1: Get charity_id using session username
    charity_res = supabase.table('charity') \
        .select('charity_id') \
        .eq('username', session['username']) \
        .limit(1) \
        .execute()

    if not charity_res.data:
        return jsonify({"error": "Charity not found"}), 404

    charity_id = charity_res.data[0]['charity_id']

    # Step 2: Get all denied requests of charity
    requests_res = supabase.table('denied_requests') \
        .select('food_listing_id, donor_id') \
        .eq('charity_id', charity_id) \
        .execute()

    requests_data = requests_res.data
    full_denied_requests = []

    # Step 3: For each request, fetch donor info and food info
    for req in requests_data:
        donor_data = {}
        food_data = {}

        # Get donor info
        donor_res = supabase.table('donors') \
            .select('org_name, phone, area_city, owner') \
            .eq('donor_id', req['donor_id']) \
            .limit(1) \
            .execute()

        if donor_res.data:
            donor_data = donor_res.data[0]

        # Get food listing info
        food_res = supabase.table('approved_listings') \
            .select('food_name, food_quantity, food_type, food_category') \
            .eq('food_listing_id', req['food_listing_id']) \
            .limit(1) \
            .execute()

        if food_res.data:
            food_data = food_res.data[0]

        # Full structured request
        full_request = {
            "donor_id": req["donor_id"],
            "donor": donor_data,
            "food_listing": food_data  # this will ensure JS can use req.food_listing?.food_name
        }

        full_denied_requests.append(full_request)

    return jsonify(full_denied_requests)


#-----------------------------------------------------------------------------------------------------------------------
@app.route('/charity-info', methods=['GET'])
def get_all_charity_info():
    try:
        # Fetch all records from the charity table
        charity_res = supabase.table('charity') \
            .select('*') \
            .execute()

        return jsonify(charity_res.data), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

#-------------------------------------------------------------------------------------------------------------------------


        
if __name__ == '__main__':
    app.run(debug=True)
