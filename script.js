// ========= Utility helpers =========
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

document.addEventListener("DOMContentLoaded", () => {
  // ========= Part 1: Event handling / Theme toggle =========
  const themeButton = $("#themeToggle");

  // Initialize theme from localStorage or system preference
  const applyTheme = (mode) => {
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
      themeButton.textContent = "☀️ Disable Dark Mode";
      themeButton.setAttribute("aria-pressed", "true");
    } else {
      root.classList.remove("dark");
      themeButton.textContent = "🌙 Enable Dark Mode";
      themeButton.setAttribute("aria-pressed", "false");
    }
  };

  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved ?? (prefersDark ? "dark" : "light"));

  themeButton.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    const mode = isDark ? "dark" : "light";
    localStorage.setItem("theme", mode);
    // Use textContent to change the button label safely
    themeButton.textContent = isDark ? "☀️ Disable Dark Mode" : "🌙 Enable Dark Mode";
    themeButton.setAttribute("aria-pressed", String(isDark));
  });

  // ========= Part 2: Interactive Elements =========
  // Counter game (buttons + keyboard)
  const countEl = $("#count");
  const incBtn = $("#increment");
  const decBtn = $("#decrement");
  const resetBtn = $("#reset");
  let count = 0;

  const renderCount = () => { countEl.textContent = String(count); };

  incBtn.addEventListener("click", () => { count += 1; renderCount(); });
  decBtn.addEventListener("click", () => { count -= 1; renderCount(); });
  resetBtn.addEventListener("click", () => { count = 0; renderCount(); });

  // Keyboard controls for accessibility/convenience
  document.addEventListener("keydown", (e) => {
    if (e.key === "+" || e.key === "=") { count += 1; renderCount(); }
    if (e.key === "-") { count -= 1; renderCount(); }
    if (e.key === "0") { count = 0; renderCount(); }
  });

  // FAQ accordion (accessible)
  $$(".accordion-trigger").forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      const panel = document.getElementById(btn.getAttribute("aria-controls"));
      panel.hidden = expanded;
    });
  });

  // ========= Part 3: Form Validation =========
  const form = $("#signupForm");
  const nameInput = $("#name");
  const emailInput = $("#email");
  const passwordInput = $("#password");
  const confirmInput = $("#confirm");
  const termsInput = $("#terms");

  const nameError = $("#nameError");
  const emailError = $("#emailError");
  const passwordError = $("#passwordError");
  const confirmError = $("#confirmError");
  const termsError = $("#termsError");
  const formStatus = $("#formStatus");

  const setError = (input, el, msg) => {
    input.setAttribute("aria-invalid", "true");
    el.textContent = msg;
  };
  const clearError = (input, el) => {
    input.setAttribute("aria-invalid", "false");
    el.textContent = "";
  };

  // Validation rules
  const isNameValid = (val) => typeof val === "string" && val.trim().length >= 2;

  // Simple email regex (good enough for UI validation)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const isEmailValid = (val) => emailRegex.test(val);

  // Password: min 8, upper, lower, digit, special
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
  const isPasswordValid = (val) => passwordRegex.test(val);

  // Field validators
  const validateName = () => {
    const val = nameInput.value;
    if (!isNameValid(val)) {
      setError(nameInput, nameError, "Please enter your full name (min 2 characters).");
      return false;
    }
    clearError(nameInput, nameError);
    return true;
  };

  const validateEmail = () => {
    const val = emailInput.value.trim();
    if (!isEmailValid(val)) {
      setError(emailInput, emailError, "Enter a valid email address.");
      return false;
    }
    clearError(emailInput, emailError);
    return true;
  };

  const validatePassword = () => {
    const val = passwordInput.value;
    if (!isPasswordValid(val)) {
      setError(
        passwordInput,
        passwordError,
        "Min 8 chars, include upper, lower, number, and special character."
      );
      return false;
    }
    clearError(passwordInput, passwordError);
    return true;
  };

  const validateConfirm = () => {
    if (confirmInput.value !== passwordInput.value || confirmInput.value === "") {
      setError(confirmInput, confirmError, "Passwords do not match.");
      return false;
    }
    clearError(confirmInput, confirmError);
    return true;
  };

  const validateTerms = () => {
    if (!termsInput.checked) {
      termsError.textContent = "You must accept the terms.";
      return false;
    }
    termsError.textContent = "";
    return true;
  };

  // Live validation
  nameInput.addEventListener("input", validateName);
  emailInput.addEventListener("input", validateEmail);
  passwordInput.addEventListener("input", () => {
    validatePassword();
    validateConfirm(); // keep confirm in sync
  });
  confirmInput.addEventListener("input", validateConfirm);
  termsInput.addEventListener("change", validateTerms);

  // Submit handler
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    formStatus.textContent = ""; // clear previous status

    const ok =
      validateName() &
      validateEmail() &
      validatePassword() &
      validateConfirm() &
      validateTerms();

    if (!ok) {
      formStatus.textContent = "";
      return;
    }

    // Simulate success 
    formStatus.textContent = "✅ Account created successfully!";
    form.reset();
    // Clear error styles after reset
    [nameInput, emailInput, passwordInput, confirmInput].forEach((i) =>
      i.setAttribute("aria-invalid", "false")
    );
    termsInput.checked = false;
  });
});
