const foods = [
  { id: 1, name: "Hydrabadi Chicken Biryani", category: "biryani", price: 249, desc: "Aromatic rice with royal spices.", image: "./Website-images/Hydrabadi-Chicken-Biryani.png" },
  { id: 2, name: "Butter Chicken", category: "chicken", price: 299, desc: "Creamy, rich and full of flavor.", image: "./Website-images/Butter-Chicken.png" },
  { id: 3, name: "Paneer Khurchan Roll", category: "paneer", price: 159, desc: "Soft paneer with spicy filling.", image: "./Website-images/Paneer-Khurchan-Roll.png" },
  { id: 4, name: "Chilly Chicken Dry", category: "chicken", price: 229, desc: "Crispy chicken with spicy sauce.", image: "./Website-images/Chilly-Chicken-Dry.png" },
  { id: 5, name: "Soft Drinks", category: "drinks", price: 79, desc: "Refreshing chilled drinks.", image: "./Website-images/Soft-Drinks.png" },
  { id: 6, name: "Zafrani Malai Kofta", category: "paneer", price: 269, desc: "Royal creamy kofta curry.", image: "./Website-images/Zafrani-Malai-Kofta.png" }
];

let cart = JSON.parse(localStorage.getItem("eliteCart")) || [];
let wishlist = JSON.parse(localStorage.getItem("eliteWishlist")) || [];
let currentCategory = "all";

const menuGrid = document.getElementById("menuGrid");
const cartPanel = document.getElementById("cartPanel");
const cartItems = document.getElementById("cartItems");
const totalPrice = document.getElementById("totalPrice");
const cartCount = document.getElementById("cartCount");
const wishlistCount = document.getElementById("wishlistCount");
const searchInput = document.getElementById("searchInput");

function saveCart() {
  localStorage.setItem("eliteCart", JSON.stringify(cart));
}

function saveWishlist() {
  localStorage.setItem("eliteWishlist", JSON.stringify(wishlist));
}

function updateWishlistCount() {
  if (wishlistCount) wishlistCount.innerText = wishlist.length;
}

function updateCartCountOnly() {
  if (!cartCount) return;
  let count = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  cartCount.innerText = count;
}

function checkLoginStatus() {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const loggedIn = localStorage.getItem("eliteLoggedIn");

  if (loginBtn && logoutBtn) {
    if (loggedIn === "true") {
      loginBtn.style.display = "none";
      logoutBtn.style.display = "inline-block";
    } else {
      loginBtn.style.display = "inline-block";
      logoutBtn.style.display = "none";
    }
  }
}

function isInWishlist(id) {
  return wishlist.some(item => item.id === id);
}

function toggleWishlist(id) {
  const loggedIn = localStorage.getItem("eliteLoggedIn");

  if (loggedIn !== "true") {
    alert("Please login first!");
    window.location.href = "login.html";
    return;
  }

  const food = foods.find(item => item.id === id);
  if (!food) {
    alert("Product not found");
    return;
  }

  if (isInWishlist(id)) {
    wishlist = wishlist.filter(item => item.id !== id);
    alert("Removed from wishlist");
  } else {
    wishlist.push({
      id: food.id,
      name: food.name,
      price: food.price,
      image: food.image,
      desc: food.desc
    });
    alert("Added to wishlist ❤️");
  }

  saveWishlist();
  updateWishlistCount();
  applyFilters();
}

function displayFoods(items) {
  if (!menuGrid) return;

  menuGrid.innerHTML = "";

  items.forEach(food => {
    const heartIcon = isInWishlist(food.id) ? "❤️" : "🤍";

    menuGrid.innerHTML += `
      <div class="food-card">
        <button type="button" class="wishlist-btn" onclick="toggleWishlist(${food.id})">
          ${heartIcon}
        </button>

        <img src="${food.image}" alt="${food.name}">

        <div class="food-info">
          <h3>${food.name}</h3>
          <p>${food.desc}</p>

          <div class="price-row">
            <h4>₹${food.price}</h4>
            <button type="button" onclick="addToCart(${food.id})">Add</button>
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
    const matchCategory = currentCategory === "all" || food.category === currentCategory;
    const matchSearch = food.name.toLowerCase().includes(searchValue);
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

/* FIXED ORDER NOW */
function buyNow(id) {
  const loggedIn = localStorage.getItem("eliteLoggedIn");

  if (loggedIn !== "true") {
    alert("Please login first!");
    window.location.href = "login.html";
    return;
  }

  const food = foods.find(item => item.id === id);

  if (!food) {
    alert("Product not found");
    return;
  }

  const buyNowProduct = [{
    id: food.id,
    name: food.name,
    price: food.price,
    image: food.image,
    qty: 1
  }];

  localStorage.setItem("eliteBuyNow", JSON.stringify(buyNowProduct));
  localStorage.setItem("eliteCheckoutType", "buy-now");

  window.location.href = "checkout.html?type=buy-now";
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
    total += Number(item.price) * Number(item.qty);
    count += Number(item.qty);

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

  const loggedIn = localStorage.getItem("eliteLoggedIn");

  if (loggedIn !== "true") {
    alert("Please login first!");
    window.location.href = "login.html";
    return;
  }

  localStorage.setItem("eliteCheckoutType", "cart");
  window.location.href = "checkout.html";
}

/* Checkout Page */
function getCheckoutCart() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type") || localStorage.getItem("eliteCheckoutType");

  if (type === "buy-now") {
    localStorage.setItem("eliteCheckoutType", "buy-now");
    return JSON.parse(localStorage.getItem("eliteBuyNow")) || [];
  }

  localStorage.setItem("eliteCheckoutType", "cart");
  return JSON.parse(localStorage.getItem("eliteCart")) || [];
}

function showCheckout() {
  const checkoutItems = document.getElementById("checkoutItems");
  const checkoutTotal = document.getElementById("checkoutTotal");
  const finalTotal = document.getElementById("finalTotal");

  if (!checkoutItems || !checkoutTotal) return;

  const checkoutCart = getCheckoutCart();

  checkoutItems.innerHTML = "";

  let total = 0;

  if (checkoutCart.length === 0) {
    checkoutItems.innerHTML = `<p>Your cart is empty</p>`;
    checkoutTotal.innerText = "0";
    if (finalTotal) finalTotal.innerText = "0";
    localStorage.setItem("eliteTotal", 0);
    return;
  }

  checkoutCart.forEach(item => {
    const qty = item.qty || 1;
    const subtotal = Number(item.price) * qty;

    total += subtotal;

    checkoutItems.innerHTML += `
      <div class="cart-item">
        <h4>${item.name}</h4>
        <p>Price: ₹${item.price}</p>
        <p>Quantity: ${qty}</p>
        <p>Subtotal: ₹${subtotal}</p>
      </div>
    `;
  });

  checkoutTotal.innerText = total;
  if (finalTotal) finalTotal.innerText = total;

  localStorage.setItem("eliteTotal", total);
}

function saveCheckout(event) {
  event.preventDefault();

  const customer = {
    name: document.getElementById("customerName")?.value.trim() || "",
    phone: document.getElementById("customerPhone")?.value.trim() || "",
    address: document.getElementById("customerAddress")?.value.trim() || ""
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

async function placeOrder() {
  const selectedPayment = document.querySelector('input[name="payment"]:checked');

  if (!selectedPayment) {
    alert("Please select payment method.");
    return;
  }

  const user = JSON.parse(localStorage.getItem("eliteUser")) || {};
  const customer = JSON.parse(localStorage.getItem("eliteCustomer")) || {};
  const checkoutType = localStorage.getItem("eliteCheckoutType");

  let finalCart = [];

  if (checkoutType === "buy-now") {
    finalCart = JSON.parse(localStorage.getItem("eliteBuyNow")) || [];
  } else {
    finalCart = JSON.parse(localStorage.getItem("eliteCart")) || [];
  }

  const total = localStorage.getItem("eliteTotal") || 0;
  const payment = selectedPayment.value;

  if (finalCart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const response = await fetch("/save_order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user_id: user.id || null,
      customer: customer,
      cart: finalCart,
      payment: payment,
      total: total
    })
  });

  const result = await response.json();

  if (result.status === "success") {
    localStorage.setItem("elitePayment", payment);
    localStorage.setItem("eliteOrderId", result.order_id);

    if (checkoutType === "buy-now") {
      localStorage.removeItem("eliteBuyNow");
    } else {
      localStorage.removeItem("eliteCart");
    }

    localStorage.removeItem("eliteCheckoutType");

    alert("Order saved successfully!");
    window.location.href = "success.html";
  } else {
    alert(result.message || "Order not saved.");
  }
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

/* Login / Signup */
function togglePassword() {
  const password = document.getElementById("loginPassword");
  if (!password) return;

  password.type = password.type === "password" ? "text" : "password";
}

function toggleSignupPassword() {
  const pass = document.getElementById("signupPassword");
  if (!pass) return;

  pass.type = pass.type === "password" ? "text" : "password";
}

async function signupUser(event) {
  event.preventDefault();

  const data = {
    name: document.getElementById("signupName").value,
    email: document.getElementById("signupEmail").value,
    phone: document.getElementById("signupPhone").value,
    password: document.getElementById("signupPassword").value
  };

  const res = await fetch("/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  alert(result.message);

  if (result.status === "success") {
    window.location.href = "login.html";
  }
}

async function loginUser(event) {
  event.preventDefault();

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: document.getElementById("loginEmail").value,
      password: document.getElementById("loginPassword").value
    })
  });

  const result = await res.json();
  alert(result.message);

  if (result.status === "success") {
    localStorage.setItem("eliteLoggedIn", "true");
    localStorage.setItem("eliteUser", JSON.stringify(result.user));
    window.location.href = "dashboard.html";
  }
}

function logoutUser() {
  localStorage.removeItem("eliteLoggedIn");
  localStorage.removeItem("eliteUser");

  alert("Logout successful!");
  window.location.href = "index.html";
}

/* Run */
if (searchInput) {
  searchInput.addEventListener("input", applyFilters);
}

displayFoods(foods);
updateCart();
updateCartCountOnly();
updateWishlistCount();
showCheckout();
checkLoginStatus();

/* onclick support */
window.addToCart = addToCart;
window.buyNow = buyNow;
window.changeQty = changeQty;
window.removeItem = removeItem;
window.toggleCart = toggleCart;
window.goToCheckout = goToCheckout;
window.filterItems = filterItems;
window.saveCheckout = saveCheckout;
window.placeOrder = placeOrder;
window.togglePassword = togglePassword;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.toggleSignupPassword = toggleSignupPassword;
window.signupUser = signupUser;
window.toggleWishlist = toggleWishlist;