document.addEventListener("DOMContentLoaded", () => {
  // 1) Знайти всі елементи з класом .recipe-card і змінити їм стиль
  const recipeCards = document.querySelectorAll(".recipe-card");

  recipeCards.forEach((card) => {
    // Приклад зміни стилю: фон + рамка + колір тексту
    card.style.background = "rgba(250, 188, 117, 0.25)"; // light (#FABC75) з прозорістю
    card.style.border = "2px solid rgba(202, 83, 16, 0.45)"; // #CA5310
    card.style.borderRadius = "16px";
    card.style.padding = "14px";
    card.style.color = "#691E06"; // темний текст
  });

  // 2) Додати новий елемент <p> у кінець <main> (createElement + append)
  const main = document.querySelector("main");
  if (main) {
    const note = document.createElement("p");
    note.textContent =
      "Порада: обирайте більше інгредієнтів — так ви отримаєте точніші рекомендації рецептів.";
    note.style.marginTop = "16px";
    note.style.padding = "12px 14px";
    note.style.borderRadius = "14px";
    note.style.background = "rgba(202, 83, 16, 0.10)";
    note.style.border = "1px solid rgba(202, 83, 16, 0.25)";
    note.style.color = "#691E06";

    main.append(note); // додаємо в кінець main
  }
});
;

