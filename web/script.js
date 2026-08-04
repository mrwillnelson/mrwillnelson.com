const BEEHIIV_FORM_ACTION = "";

const form = document.querySelector("#signup-form");
const email = document.querySelector("#email");
const note = document.querySelector("#form-note");

const setNote = (message) => {
  note.textContent = message;
};

form.addEventListener("submit", (event) => {
  event.preventDefault();

  email.setAttribute("aria-invalid", "false");

  if (!email.checkValidity()) {
    email.setAttribute("aria-invalid", "true");
    setNote("Enter a valid email address.");
    email.focus();
    return;
  }

  if (!BEEHIIV_FORM_ACTION) {
    setNote("Signup is not connected yet. Beehiiv still needs to be wired.");
    return;
  }

  form.action = BEEHIIV_FORM_ACTION;
  form.submit();
});
