from flask import Flask, request, render_template, redirect, url_for, session, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor
from werkzeug.security import check_password_hash

DB_CONFIG={
    "user":"postgres",
    "password":"Aniket@2023",
    "host":"db.bdsyggaigzmrnurkmzkn.supabase.co",
    "port":"5432",
    "dbname":"postgres"
}

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)