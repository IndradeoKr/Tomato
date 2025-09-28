function showRegister() {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("register-form").style.display = "block";
}

function showLogin() {
  document.getElementById("register-form").style.display = "none";
  document.getElementById("login-form").style.display = "block";
}

function showApp() {
  document.getElementById("auth-section").style.display = "none";
  document.getElementById("app").style.display = "block";
}

function logout() {
  document.getElementById("auth-section").style.display = "block";
  document.getElementById("app").style.display = "none";
  document.getElementById("login-form").reset();
  document.getElementById("register-form").reset();
  showLogin();
}

// login handler
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const response = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    showApp();
  } else {
    alert("Login failed");
  }
});

// register handler
document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  const response = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    alert("Account created! Please log in.");
    showLogin();
  } else {
    alert("Registration failed");
  }
});

document.getElementById("darkToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

function classifyImage() {
  const resultDiv = document.getElementById("result");
  resultDiv.textContent = "Processing image...";

  const fileInput = document.getElementById("imageInput");
 
  const file = fileInput.files[0];

  if (!file) {
    resultDiv.textContent = "Please select an image first.";
    return;
  }

  const formData = new FormData();
  formData.append("image", file);

  fetch("/predict", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    resultDiv.textContent = `Prediction: ${data.prediction}`;
    // You can also render a chart here if you like
  })
  .catch(err => {
    console.error(err);
    resultDiv.textContent = "Error during prediction.";
  });
}

