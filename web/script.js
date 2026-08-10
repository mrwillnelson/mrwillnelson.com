const form = document.querySelector("#signup-form");
const email = document.querySelector("#email");
const note = document.querySelector("#form-note");
const button = form?.querySelector("button");

const setNote = (message) => {
  note.textContent = message;
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  email.setAttribute("aria-invalid", "false");
  setNote("");

  if (!email.checkValidity()) {
    email.setAttribute("aria-invalid", "true");
    setNote("Enter a valid email address.");
    email.focus();
    return;
  }

  button.disabled = true;
  button.textContent = "Submitting...";

  try {
    const response = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.value }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.ok) {
      throw new Error(result.message || "Could not subscribe right now.");
    }

    form.reset();
    setNote("You're on the list.");
  } catch (error) {
    setNote(error.message || "Could not subscribe right now.");
  } finally {
    button.disabled = false;
    button.innerHTML = 'Get the breakdowns <span aria-hidden="true">&rarr;</span>';
  }
});
