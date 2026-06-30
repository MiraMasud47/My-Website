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


# ================= CREATE TABLES =================
def create_tables():
    try:
        cur = mysql.connection.cursor()

        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) NOT NULL UNIQUE,
                phone VARCHAR(20),
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                customer_name VARCHAR(100),
                phone VARCHAR(20),
                address TEXT,
                payment_method VARCHAR(50),
                total DECIMAL(10,2),
                order_status VARCHAR(50) DEFAULT 'Confirmed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT,
                product_id INT,
                product_name VARCHAR(255),
                image VARCHAR(255),
                quantity INT,
                price DECIMAL(10,2)
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS coupons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                type VARCHAR(20) NOT NULL,
                value DECIMAL(10,2) NOT NULL,
                active TINYINT DEFAULT 1
            )
        """)

        cur.execute("""
            INSERT IGNORE INTO coupons (code, type, value, active)
            VALUES
            ('WELCOME20', 'percent', 20, 1),
            ('FREESHIP', 'shipping', 0, 1)
        """)

        mysql.connection.commit()
        cur.close()
        print("✅ Tables ready")

    except Exception as e:
        print("❌ Table Error:", e)


# ================= HTML PAGES =================
@app.route("/")
@app.route("/index.html")
def home():
    return send_from_directory(".", "index.html")


@app.route("/login.html")
def login_page():
    return send_from_directory(".", "login.html")


@app.route("/signup.html")
def signup_page():
    return send_from_directory(".", "signup.html")


@app.route("/dashboard.html")
def dashboard_page():
    return send_from_directory(".", "dashboard.html")


@app.route("/profile.html")
def profile_page():
    return send_from_directory(".", "profile.html")


@app.route("/wishlist.html")
def wishlist_page():
    return send_from_directory(".", "wishlist.html")


@app.route("/checkout.html")
def checkout_page():
    return send_from_directory(".", "checkout.html")


@app.route("/payment.html")
def payment_page():
    return send_from_directory(".", "payment.html")


@app.route("/success.html")
def success_page():
    return send_from_directory(".", "success.html")


@app.route("/my_orders.html")
@app.route("/my_orders")
def my_orders_page():
    return send_from_directory(".", "my_orders.html")


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


# ================= COUPON API =================
@app.route("/apply-coupon", methods=["POST"])
def apply_coupon():
    try:
        data = request.get_json(silent=True) or {}

        code = data.get("code", "").upper().strip()
        cart_total = float(data.get("cart_total", 0))
        shipping = float(data.get("shipping", 50))

        cur = mysql.connection.cursor()
        cur.execute("""
            SELECT code, type, value
            FROM coupons
            WHERE code=%s AND active=1
        """, (code,))
        coupon = cur.fetchone()
        cur.close()

        if not coupon:
            return jsonify({
                "success": False,
                "message": "Invalid coupon code"
            })

        discount = 0

        if coupon[1] == "percent":
            discount = cart_total * float(coupon[2]) / 100

        elif coupon[1] == "shipping":
            discount = shipping

        final_total = cart_total + shipping - discount

        return jsonify({
            "success": True,
            "message": "Coupon applied successfully",
            "code": coupon[0],
            "discount": round(discount, 2),
            "final_total": round(final_total, 2)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        })


# ================= SIGNUP API =================
@app.route("/signup", methods=["POST"])
def signup_api():
    try:
        data = request.get_json(silent=True) or {}

        name = data.get("name")
        email = data.get("email")
        phone = data.get("phone")
        password = data.get("password")

        if not name or not email or not password:
            return jsonify({
                "status": "error",
                "message": "Name, email and password are required."
            }), 400

        cur = mysql.connection.cursor()

        cur.execute("SELECT id FROM users WHERE email=%s", (email,))
        old_user = cur.fetchone()

        if old_user:
            cur.close()
            return jsonify({
                "status": "error",
                "message": "Email already exists."
            }), 409

        cur.execute("""
            INSERT INTO users (name, email, phone, password)
            VALUES (%s, %s, %s, %s)
        """, (name, email, phone, password))

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
        }), 500


# ================= LOGIN API =================
@app.route("/login", methods=["POST"])
def login_api():
    try:
        data = request.get_json(silent=True) or {}

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({
                "status": "error",
                "message": "Email and password are required."
            }), 400

        cur = mysql.connection.cursor()

        cur.execute("""
            SELECT id, name, email, phone, password
            FROM users
            WHERE email=%s
        """, (email,))

        user = cur.fetchone()
        cur.close()

        if not user:
            return jsonify({
                "status": "error",
                "message": "User not found."
            }), 404

        user_id, name, email, phone, saved_password = user

        if password != saved_password:
            return jsonify({
                "status": "error",
                "message": "Invalid password."
            }), 401

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
        }), 500


# ================= SAVE ORDER API =================
@app.route("/save_order", methods=["POST"])
def save_order():
    try:
        data = request.get_json(silent=True) or {}

        user_id = data.get("user_id")
        customer = data.get("customer", {})
        cart = data.get("cart", [])
        payment = data.get("payment")
        total = data.get("total")

        if not user_id:
            return jsonify({
                "status": "error",
                "message": "Please login first"
            }), 401

        if not customer or not cart:
            return jsonify({
                "status": "error",
                "message": "Missing customer or cart data"
            }), 400

        cur = mysql.connection.cursor()

        cur.execute("""
            INSERT INTO orders
            (user_id, customer_name, phone, address, payment_method, total, order_status)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id,
            customer.get("name"),
            customer.get("phone"),
            customer.get("address"),
            payment,
            total,
            "Confirmed"
        ))

        order_id = cur.lastrowid

        for item in cart:
            cur.execute("""
                INSERT INTO order_items
                (order_id, product_id, product_name, image, quantity, price)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                order_id,
                item.get("id"),
                item.get("name"),
                item.get("image"),
                item.get("qty", 1),
                item.get("price")
            ))

        mysql.connection.commit()
        cur.close()

        return jsonify({
            "status": "success",
            "message": "Order saved successfully.",
            "order_id": order_id
        })

    except Exception as e:
        print("Order Error:", e)
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# ================= MY ORDERS API =================
@app.route("/my-orders")
def get_my_orders():
    try:
        user_id = request.args.get("user_id")

        if not user_id:
            return jsonify([])

        cur = mysql.connection.cursor()

        cur.execute("""
            SELECT id, total, order_status, payment_method, created_at
            FROM orders
            WHERE user_id=%s
            ORDER BY created_at DESC
        """, (user_id,))

        orders = cur.fetchall()

        result = []

        for order in orders:
            order_id = order[0]

            cur.execute("""
                SELECT product_name, image, quantity, price
                FROM order_items
                WHERE order_id=%s
            """, (order_id,))

            items = cur.fetchall()

            result.append({
                "order_id": order[0],
                "total": float(order[1]) if order[1] else 0,
                "status": order[2],
                "payment": order[3],
                "date": str(order[4]),
                "items": items
            })

        cur.close()
        return jsonify(result)

    except Exception as e:
        print("My Orders Error:", e)
        return jsonify([])


# ================= OLD ORDERS API OPTIONAL =================
@app.route("/orders/<int:user_id>", methods=["GET"])
def get_user_orders(user_id):
    try:
        cur = mysql.connection.cursor()

        cur.execute("""
            SELECT id, customer_name, phone, address, payment_method, total, order_status, created_at
            FROM orders
            WHERE user_id=%s
            ORDER BY id DESC
        """, (user_id,))

        orders = cur.fetchall()
        result = []

        for order in orders:
            order_id = order[0]

            cur.execute("""
                SELECT product_name, image, quantity, price
                FROM order_items
                WHERE order_id=%s
            """, (order_id,))

            items = cur.fetchall()

            result.append({
                "id": order[0],
                "customer_name": order[1],
                "phone": order[2],
                "address": order[3],
                "payment_method": order[4],
                "total": float(order[5]) if order[5] else 0,
                "status": order[6],
                "created_at": str(order[7]),
                "items": items
            })

        cur.close()

        return jsonify({
            "status": "success",
            "orders": result
        })

    except Exception as e:
        print("Get Orders Error:", e)
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# ================= RUN =================
if __name__ == "__main__":
    with app.app_context():
        create_tables()

    app.run(debug=True)