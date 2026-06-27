from flask import Flask, request, jsonify, send_from_directory
from flask_mysqldb import MySQL
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ================= MYSQL CONFIG =================
app.config["MYSQL_HOST"] = "127.0.0.1"
app.config["MYSQL_USER"] = "root"
app.config["MYSQL_PASSWORD"] = ""
app.config["MYSQL_DB"] = "elite_food"
app.config["MYSQL_PORT"] = 3306

mysql = MySQL(app)

# ================= HTML PAGES =================
@app.route("/")
def home():
    return send_from_directory(".", "index.html")

@app.route("/index.html")
def index_html():
    return send_from_directory(".", "index.html")

@app.route("/login")
@app.route("/login.html")
def login_page():
    return send_from_directory(".", "login.html")

@app.route("/signup-page")
@app.route("/signup.html")
def signup_page():
    return send_from_directory(".", "signup.html")

@app.route("/dashboard")
@app.route("/dashboard.html")
def dashboard_page():
    return send_from_directory(".", "dashboard.html")

@app.route("/profile")
@app.route("/profile.html")
def profile_page():
    return send_from_directory(".", "profile.html")

@app.route("/wishlist")
@app.route("/wishlist.html")
def wishlist_page():
    return send_from_directory(".", "wishlist.html")

@app.route("/checkout")
@app.route("/checkout.html")
def checkout_page():
    return send_from_directory(".", "checkout.html")

@app.route("/payment")
@app.route("/payment.html")
def payment_page():
    return send_from_directory(".", "payment.html")

@app.route("/success")
@app.route("/success.html")
def success_page():
    return send_from_directory(".", "success.html")

# ================= STATIC FILES =================
@app.route("/style.css")
def css():
    return send_from_directory(".", "style.css")

@app.route("/script.js")
def js():
    return send_from_directory(".", "script.js")

@app.route("/auth.js")
def auth_js():
    return send_from_directory(".", "auth.js")

@app.route("/Website-images/<path:filename>")
def website_images(filename):
    return send_from_directory("Website-images", filename)

@app.route("/favicon.ico")
def favicon():
    return "", 204

# ================= SIGNUP API =================
@app.route("/signup", methods=["POST"])
def signup_api():
    try:
        data = request.get_json()

        name = data.get("name")
        email = data.get("email")
        phone = data.get("phone")
        password = data.get("password")

        if not name or not email or not password:
            return jsonify({
                "status": "error",
                "message": "Name, email and password are required."
            })

        cur = mysql.connection.cursor()

        cur.execute(
            "SELECT * FROM users WHERE email=%s",
            (email,)
        )

        user = cur.fetchone()

        if user:
            cur.close()
            return jsonify({
                "status": "error",
                "message": "Email already exists."
            })

        cur.execute("""
            INSERT INTO users (name, email, phone, password)
            VALUES (%s, %s, %s, %s)
        """, (
            name,
            email,
            phone,
            password
        ))

        mysql.connection.commit()
        cur.close()

        return jsonify({
            "status": "success",
            "message": "Signup successful."
        })

    except Exception as e:
        print("Signup Error:", e)
        return jsonify({
            "status": "error",
            "message": str(e)
        })

# ================= LOGIN API =================
@app.route("/login", methods=["POST"])
def login_api():
    try:
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        cur = mysql.connection.cursor()

        cur.execute(
            "SELECT id, name, email, phone, password FROM users WHERE email=%s",
            (email,)
        )

        user = cur.fetchone()
        cur.close()

        if not user:
            return jsonify({
                "status": "error",
                "message": "User not found."
            })

        user_id, name, email, phone, saved_password = user

        if password != saved_password:
            return jsonify({
                "status": "error",
                "message": "Invalid password."
            })

        return jsonify({
            "status": "success",
            "message": "Login successful.",
            "user": {
                "id": user_id,
                "name": name,
                "email": email,
                "phone": phone
            }
        })

    except Exception as e:
        print("Login Error:", e)
        return jsonify({
            "status": "error",
            "message": str(e)
        })

# ================= SAVE ORDER API =================
@app.route("/save_order", methods=["POST"])
def save_order():
    try:
        data = request.get_json()

        customer = data.get("customer")
        cart = data.get("cart")
        payment = data.get("payment")
        total = data.get("total")

        if not customer or not cart:
            return jsonify({
                "status": "error",
                "message": "Missing customer or cart data"
            })

        cur = mysql.connection.cursor()

        cur.execute("""
            INSERT INTO orders
            (customer_name, phone, address, payment_method, total)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            customer.get("name"),
            customer.get("phone"),
            customer.get("address"),
            payment,
            total
        ))

        order_id = cur.lastrowid

        for item in cart:
            cur.execute("""
                INSERT INTO order_items
                (order_id, product_name, quantity, price)
                VALUES (%s, %s, %s, %s)
            """, (
                order_id,
                item.get("name"),
                item.get("qty"),
                item.get("price")
            ))

        mysql.connection.commit()
        cur.close()

        return jsonify({
            "status": "success",
            "order_id": order_id
        })

    except Exception as e:
        print("Order Error:", e)
        return jsonify({
            "status": "error",
            "message": str(e)
        })

# ================= RUN =================
if __name__ == "__main__":
    app.run(debug=True)