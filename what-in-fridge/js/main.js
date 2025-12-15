

document.addEventListener("DOMContentLoaded", () => {
  // --- Поточний рік (для ©) ---
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- Поточна дата у футері ---
  const dateEl = document.getElementById("currentDate");
  if (dateEl) {
    const now = new Date();
    const formatted = now.toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    dateEl.textContent = formatted;
  }
});

