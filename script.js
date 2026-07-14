const CONFIG = {
  apiUrl: "YOUR_BACKEND_API_URL"
};

const fields = {
  form: document.querySelector("#signupForm"),
  name: document.querySelector("#name"),
  phone: document.querySelector("#phone"),
  website: document.querySelector("#website"),
  message: document.querySelector("#message"),
  apiUrl: document.querySelector("#apiUrl"),
  saveSettings: document.querySelector("#saveSettings"),
  submitButton: document.querySelector("#submitButton")
};

function getApiUrl() {
  return localStorage.getItem("signupApiUrl") || CONFIG.apiUrl;
}

function setMessage(text, ok = false) {
  fields.message.textContent = text;
  fields.message.classList.toggle("ok", ok);
}

function normalizePhone(value) {
  return value.replace(/[^\d+() -]/g, "").trim();
}

function validate(name, phone) {
  if (name.length < 2) {
    return "Please enter a name with at least 2 characters.";
  }

  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) {
    return "Please enter a valid phone number.";
  }

  return "";
}

function loadSettings() {
  const apiUrl = getApiUrl();
  fields.apiUrl.value = apiUrl === CONFIG.apiUrl ? "" : apiUrl;
}

fields.form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const apiUrl = getApiUrl();
  if (apiUrl === CONFIG.apiUrl) {
    setMessage("Please enter the registration API URL in API settings first.");
    document.querySelector(".settings").open = true;
    return;
  }

  const name = fields.name.value.trim();
  const phone = normalizePhone(fields.phone.value);
  const error = validate(name, phone);

  if (error) {
    setMessage(error);
    return;
  }

  fields.submitButton.disabled = true;
  fields.submitButton.textContent = "Submitting...";
  setMessage("Submitting your registration...", true);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        phone,
        website: fields.website.value
      })
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.ok) {
      throw new Error(result.message || "Submission failed. Please try again later.");
    }

    fields.form.reset();
    setMessage("Registration received. Thank you!", true);
  } catch (error) {
    setMessage(error.message || "Submission failed. Please try again later.");
  } finally {
    fields.submitButton.disabled = false;
    fields.submitButton.textContent = "Submit registration";
  }
});

fields.saveSettings.addEventListener("click", () => {
  const apiUrl = fields.apiUrl.value.trim();

  if (!apiUrl) {
    setMessage("Please enter the registration API URL.");
    return;
  }

  localStorage.setItem("signupApiUrl", apiUrl);
  setMessage("Settings saved. You can submit registrations now.", true);
});

loadSettings();
