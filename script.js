const foods = [
  {
    id: 1,
    name: "Hyderabadi Chicken Biryani",
    category: "biryani",
    price: 249,
    desc: "Aromatic rice with royal spices.",
    image: "/website-images/Hydrabadi-Chicken-Biryani.png"
  },
  {
    id: 2,
    name: "Butter Chicken",
    category: "chicken",
    price: 299,
    desc: "Creamy, rich and full of flavor.",
    image: "/website-images/Butter-Chicken.png"
  },
  {
    id: 3,
    name: "Paneer Khurchan Roll",
    category: "paneer",
    price: 159,
    desc: "Soft paneer with spicy filling.",
    image: "/website-images/Paneer-Khurchan-Roll.png"
  },
  {
    id: 4,
    name: "Chilly Chicken Dry",
    category: "chicken",
    price: 229,
    desc: "Crispy chicken with spicy sauce.",
    image: "/website-images/Chilly-Chicken-Dry.png"
  },
  {
    id: 5,
    name: "Soft Drinks",
    category: "drinks",
    price: 79,
    desc: "Refreshing chilled drinks.",
    image: "/website-images/Soft-Drinks.png"
  },
  {
    id: 6,
    name: "Zafrani Malai Kofta",
    category: "paneer",
    price: 269,
    desc: "Royal creamy kofta curry.",
    image: "/website-images/Zafrani-Malai-Kofta.png"
  }
];

let cart = JSON.parse(localStorage.getItem("eliteCart")) || [];
let currentCategory = "all";

const menuGrid = document.getElementById("menuGrid");
const cartPanel = document.getElementById("cartPanel");
const cartItems = document.getElementById("cartItems");
const totalPrice = document.getElementById("totalPrice");
const cartCount = document.getElementById("cartCount");
const searchInput = document.getElementById("searchInput");

function saveCart() {
  localStorage.setItem("eliteCart", JSON.stringify(cart));
}

function displayFoods(items) {
  if (!menuGrid) return;

  menuGrid.innerHTML = "";

  items.forEach(food => {
    menuGrid.innerHTML += `
      <div class="food-card">
        <img src="${food.image}" alt="${food.name}">
        <div class="food-info">
          <h3>${food.name}</h3>
          <p>${food.desc}</p>

          <div class="price-row">
            <h4>₹${food.price}</h4>
            <button type="button" onclick="addToCart(${food.id})">
              Add
            </button>
          </div>

          <button type="button" class="buy-now-btn" onclick="buyNow(${food.id})">
            ORDER NOW
          </button>
        </div>
      </div>
    `;
  });
}

function filterItems(category) {
  currentCategory = category;
  applyFilters();
}

function applyFilters() {
  const searchValue = searchInput ? searchInput.value.toLowerCase() : "";

  const filtered = foods.filter(food => {
    const matchCategory =
      currentCategory === "all" || food.category === currentCategory;

    const matchSearch =
      food.name.toLowerCase().includes(searchValue);

    return matchCategory && matchSearch;
  });

  displayFoods(filtered);
}

function addToCart(id) {
  const food = foods.find(item => item.id === id);

  if (!food) {
    alert("Product not found");
    return;
  }

  const existingItem = cart.find(item => item.id === id);

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({
      id: food.id,
      name: food.name,
      price: food.price,
      image: food.image,
      qty: 1
    });
  }

  saveCart();
  updateCart();

  if (cartPanel) {
    cartPanel.classList.add("active");
  }
}

function buyNow(id) {
  addToCart(id);
}

function updateCart() {
  if (!cartItems || !totalPrice || !cartCount) return;

  cartItems.innerHTML = "";

  let total = 0;
  let count = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = `<p class="empty-cart">Your cart is empty</p>`;
  }

  cart.forEach(item => {
    total += item.price * item.qty;
    count += item.qty;

    cartItems.innerHTML += `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" width="60">

        <div>
          <h4>${item.name}</h4>
          <p>₹${item.price} × ${item.qty}</p>

          <div class="qty-box">
            <button type="button" onclick="changeQty(${item.id}, -1)">-</button>
            <span>${item.qty}</span>
            <button type="button" onclick="changeQty(${item.id}, 1)">+</button>
          </div>

          <button type="button" class="remove-btn" onclick="removeItem(${item.id})">
            Remove
          </button>
        </div>
      </div>
    `;
  });

  totalPrice.innerText = total;
  cartCount.innerText = count;
}

function changeQty(id, value) {
  const item = cart.find(product => product.id === id);

  if (!item) return;

  item.qty += value;

  if (item.qty <= 0) {
    cart = cart.filter(product => product.id !== id);
  }

  saveCart();
  updateCart();
}

function removeItem(id) {
  cart = cart.filter(product => product.id !== id);
  saveCart();
  updateCart();
}

function toggleCart() {
  if (cartPanel) {
    cartPanel.classList.toggle("active");
  }
}

function goToCheckout() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  window.location.href = "checkout.html";
}

/* Checkout Page */
const checkoutItems = document.getElementById("checkoutItems");
const checkoutTotal = document.getElementById("checkoutTotal");

function showCheckout() {
  if (!checkoutItems || !checkoutTotal) return;

  checkoutItems.innerHTML = "";

  let total = 0;

  if (cart.length === 0) {
    checkoutItems.innerHTML = `<p>Your cart is empty</p>`;
  }

  cart.forEach(item => {
    total += item.price * item.qty;

    checkoutItems.innerHTML += `
      <div class="cart-item">
        <h4>${item.name}</h4>
        <p>Price: ₹${item.price}</p>
        <p>Quantity: ${item.qty}</p>
        <p>Subtotal: ₹${item.price * item.qty}</p>
      </div>
    `;
  });

  checkoutTotal.innerText = total;
  localStorage.setItem("eliteTotal", total);
}

function saveCheckout(event) {
  event.preventDefault();

  const customer = {
    name: document.getElementById("customerName").value,
    phone: document.getElementById("customerPhone").value,
    address: document.getElementById("customerAddress").value
  };

  localStorage.setItem("eliteCustomer", JSON.stringify(customer));
  window.location.href = "payment.html";
}

/* Payment Page */
const paymentTotal = document.getElementById("paymentTotal");
const paymentRadios = document.querySelectorAll('input[name="payment"]');
const cardDetails = document.getElementById("cardDetails");
const upiDetails = document.getElementById("upiDetails");

if (paymentTotal) {
  paymentTotal.innerText = localStorage.getItem("eliteTotal") || 0;
}

paymentRadios.forEach(radio => {
  radio.addEventListener("change", function () {
    if (cardDetails) cardDetails.style.display = "none";
    if (upiDetails) upiDetails.style.display = "none";

    if (this.value === "Card Payment" && cardDetails) {
      cardDetails.style.display = "block";
    }

    if (this.value === "UPI" && upiDetails) {
      upiDetails.style.display = "block";
    }
  });
});

function placeOrder() {
  const selectedPayment = document.querySelector('input[name="payment"]:checked');

  if (!selectedPayment) {
    alert("Please select payment method.");
    return;
  }

  const payment = selectedPayment.value;

  if (payment === "Card Payment") {
    const cardNumber = document.getElementById("cardNumber").value.trim();
    const cardName = document.getElementById("cardName").value.trim();
    const expiryDate = document.getElementById("expiryDate").value.trim();
    const cvv = document.getElementById("cvv").value.trim();

    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      alert("Please fill all card details.");
      return;
    }
  }

  if (payment === "UPI") {
    const upiId = document.getElementById("upiId").value.trim();
    const upiNumber = document.getElementById("upiNumber").value.trim();

    if (!upiId && !upiNumber) {
      alert("Please enter UPI ID or UPI mobile number.");
      return;
    }
  }

  const customer = JSON.parse(localStorage.getItem("eliteCustomer")) || {};
  const finalCart = JSON.parse(localStorage.getItem("eliteCart")) || [];
  const total = localStorage.getItem("eliteTotal") || 0;

  fetch("http://127.0.0.1:5000/save_order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      customer: customer,
      cart: finalCart,
      payment: payment,
      total: total
    })
  })
    .then(response => response.json())
    .then(data => {
      if (data.status === "success") {
        localStorage.setItem("elitePayment", payment);
        localStorage.removeItem("eliteCart");
        window.location.href = "success.html";
      } else {
        alert("Order not saved: " + data.message);
      }
    })
    .catch(error => {
      console.log(error);
      alert("Database connection error!");
    });
}

/* Success Page */
const successName = document.getElementById("successName");
const successPayment = document.getElementById("successPayment");
const successTotal = document.getElementById("successTotal");

if (successName && successPayment && successTotal) {
  const customer = JSON.parse(localStorage.getItem("eliteCustomer")) || {};
  const payment = localStorage.getItem("elitePayment") || "Not selected";
  const total = localStorage.getItem("eliteTotal") || 0;

  successName.innerText = "Name: " + (customer.name || "Customer");
  successPayment.innerText = "Payment Method: " + payment;
  successTotal.innerText = "Total Paid: ₹" + total;
}

if (searchInput) {
  searchInput.addEventListener("input", applyFilters);
}

displayFoods(foods);
updateCart();
showCheckout();

/* IMPORTANT: make functions work with onclick="" */
window.addToCart = addToCart;
window.buyNow = buyNow;
window.changeQty = changeQty;
window.removeItem = removeItem;
window.toggleCart = toggleCart;
window.goToCheckout = goToCheckout;
window.filterItems = filterItems;
window.saveCheckout = saveCheckout;
window.placeOrder = placeOrder;

window.addToCart = addToCart;

function togglePassword() {
  const password = document.getElementById("loginPassword");

  if (password.type === "password") {
    password.type = "text";
  } else {
    password.type = "password";
  }
}

function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (email === "" || password === "") {
    alert("Please fill all fields");
    return;
  }

  localStorage.setItem("eliteLoggedIn", "true");

  window.location.href = "/";
}

function logoutUser(){

    localStorage.removeItem("eliteLoggedIn");

    window.location.href="/";

}

function toggleSignupPassword() {

  const pass = document.getElementById("signupPassword");

  if (pass.type === "password") {

    pass.type = "text";

  } else {

    pass.type = "password";

  }

}

function signupUser(event) {

  event.preventDefault();

  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const phone = document.getElementById("signupPhone").value;
  const password = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("confirmPassword").value;

  if (password !== confirm) {

    alert("Passwords do not match.");

    return;

  }

  fetch("http://127.0.0.1:5000/signup", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({

      name: name,
      email: email,
      phone: phone,
      password: password

    })

  })

    .then(res => res.json())

    .then(data => {

      if (data.status === "success") {

        alert("Account Created Successfully");

        window.location.href = "login.html";

      } else {

        alert(data.message);

      }

    });

}

// Check login status
window.onload = function () {

  const loggedIn = localStorage.getItem("eliteLoggedIn");

  if (loggedIn === "true") {

    document.getElementById("loginLink").style.display = "none";
    document.getElementById("logoutLink").style.display = "inline-block";

  }

}