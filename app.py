from flask import Flask, request, jsonify, send_from_directory
from flask_mysqldb import MySQL
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config["MYSQL_HOST"] = "127.0.0.1"
app.config["MYSQL_USER"] = "root"
app.config["MYSQL_PASSWORD"] = ""
app.config["MYSQL_DB"] = "elite_food"
app.config["MYSQL_PORT"] = 3306

mysql = MySQL(app)


@app.route("/")
def home():
    return send_from_directory(".", "index.html")


@app.route("/checkout.html")
def checkout():
    return send_from_directory(".", "checkout.html")


@app.route("/payment.html")
def payment():
    return send_from_directory(".", "payment.html")


@app.route("/success.html")
def success():
    return send_from_directory(".", "success.html")


@app.route("/style.css")
def css():
    return send_from_directory(".", "style.css")


@app.route("/script.js")
def js():
    return send_from_directory(".", "script.js")


@app.route("/website images/<path:filename>")
def website_images(filename):
    return send_from_directory("website images", filename)

@app.route("/login.html")
def login():
    return send_from_directory(".", "login.html")

@app.route("/signup.html")
def signup_page():
    return send_from_directory(".", "signup.html")

@app.route("/signup", methods=["POST"])
def signup():

    data=request.get_json()

    cur=mysql.connection.cursor()

    cur.execute(
        "SELECT * FROM users WHERE email=%s",
        (data["email"],)
    )

    user=cur.fetchone()

    if user:

        return jsonify({

            "status":"error",
            "message":"Email already exists."

        })

    cur.execute("""

        INSERT INTO users
        (name,email,phone,password)

        VALUES(%s,%s,%s,%s)

    """,(

        data["name"],
        data["email"],
        data["phone"],
        data["password"]

    ))

    mysql.connection.commit()

    cur.close()

    return jsonify({

        "status":"success"

    })


@app.route("/save_order", methods=["POST"])
def save_order():
    try:
        data = request.get_json()

        customer = data.get("customer")
        cart = data.get("cart")
        payment = data.get("payment")
        total = data.get("total")

        if not customer or not cart:
            return jsonify({"status": "error", "message": "Missing customer or cart data"})

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
        print("Error:", e)
        return jsonify({
            "status": "error",
            "message": str(e)
        })


if __name__ == "__main__":
    app.run(debug=True)