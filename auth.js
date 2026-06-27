function signupUser(event) {
  event.preventDefault();

  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim().toLowerCase();
  const password = document.getElementById("signupPassword").value.trim();

  const user = {
    name: name,
    email: email,
    password: password,
    phone: "",
    address: ""
  };

  localStorage.setItem("eliteUserAccount", JSON.stringify(user));

  alert("Signup successful! Please login.");
  window.location.href = "login.html";
}

function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value.trim();

  const savedUser = JSON.parse(localStorage.getItem("eliteUserAccount"));

  if (!savedUser) {
    alert("No account found. Please signup first.");
    window.location.href = "signup.html";
    return;
  }

  if (email === savedUser.email && password === savedUser.password) {
    localStorage.setItem("eliteUser", JSON.stringify(savedUser));
    alert("Login successful!");
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid email or password!");
  }
}

function logoutUser() {
  localStorage.removeItem("eliteUser");
  alert("Logout successful!");
  window.location.href = "index.html";
}

function checkLoginStatus() {
  const user = localStorage.getItem("eliteUser");

  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const profileBtn = document.getElementById("profileBtn");

  if (user) {
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    if (profileBtn) profileBtn.style.display = "inline-block";
  } else {
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (profileBtn) profileBtn.style.display = "none";
  }
}

function loadProfile() {
  const profileName = document.getElementById("profileName");

  if (!profileName) return;

  const user = JSON.parse(localStorage.getItem("eliteUser"));

  if (!user) {
    alert("Please login first!");
    window.location.href = "login.html";
    return;
  }

  document.getElementById("profileName").value = user.name || "";
  document.getElementById("profileEmail").value = user.email || "";
  document.getElementById("profilePhone").value = user.phone || "";
  document.getElementById("profileAddress").value = user.address || "";
}

function saveProfile(event) {
  event.preventDefault();

  const oldUser = JSON.parse(localStorage.getItem("eliteUser")) || {};

  const user = {
    name: document.getElementById("profileName").value.trim(),
    email: document.getElementById("profileEmail").value.trim().toLowerCase(),
    password: oldUser.password || "",
    phone: document.getElementById("profilePhone").value.trim(),
    address: document.getElementById("profileAddress").value.trim()
  };

  localStorage.setItem("eliteUser", JSON.stringify(user));
  localStorage.setItem("eliteUserAccount", JSON.stringify(user));

  alert("Profile saved successfully!");
  window.location.href = "index.html";
}

checkLoginStatus();
loadProfile();