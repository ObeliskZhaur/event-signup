const CONFIG = {
  registrationEndpoint: "https://event-signup-api.mo8095321.workers.dev"
};

const fields = {
  form: document.querySelector("#signupForm"),
  name: document.querySelector("#name"),
  phone: document.querySelector("#phone"),
  email: document.querySelector("#email"),
  website: document.querySelector("#website"),
  message: document.querySelector("#message"),
  submitButton: document.querySelector("#submitButton")
};

function setMessage(text, ok = false) {
  fields.message.textContent = text;
  fields.message.classList.toggle("ok", ok);
}

function normalizePhone(value) {
  return value.replace(/[^\d+() -]/g, "").trim();
}

function validate(name, phone, email) {
  if (name.length < 2) {
    return "Please enter a name with at least 2 characters.";
  }

  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) {
    return "Please enter a valid phone number.";
  }
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Please enter a valid email address.";
  }
  return "";
}

fields.form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (CONFIG.registrationEndpoint === "YOUR_WORKER_URL") {
    setMessage("Registration service is not configured yet.");
    return;
  }

  const name = fields.name.value.trim();
  const phone = normalizePhone(fields.phone.value);
  const email = fields.email.value.trim();
  const error = validate(name, phone, email);

  if (error) {
    setMessage(error);
    return;
  }

  fields.submitButton.disabled = true;
  fields.submitButton.textContent = "Submitting...";
  setMessage("Submitting your registration...", true);

  try {
    const response = await fetch(CONFIG.registrationEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        phone,
        email,
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
