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
    return "请填写至少 2 个字的姓名。";
  }

  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) {
    return "请填写有效的电话号码。";
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
    setMessage("请先在接口设置中填写报名接口地址。");
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
  fields.submitButton.textContent = "正在提交...";
  setMessage("正在提交报名...", true);

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
      throw new Error(result.message || "提交失败，请稍后再试。");
    }

    fields.form.reset();
    setMessage("报名成功！我们已经收到你的信息。", true);
  } catch (error) {
    setMessage(error.message || "提交失败，请稍后再试。");
  } finally {
    fields.submitButton.disabled = false;
    fields.submitButton.textContent = "提交报名";
  }
});

fields.saveSettings.addEventListener("click", () => {
  const apiUrl = fields.apiUrl.value.trim();

  if (!apiUrl) {
    setMessage("请填写报名接口地址。");
    return;
  }

  localStorage.setItem("signupApiUrl", apiUrl);
  setMessage("设置已保存，可以提交报名了。", true);
});

loadSettings();
