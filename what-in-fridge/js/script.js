/* What in Fridge? — Minimal vanilla JS (no external deps) */
(function () {
  "use strict";

  const STORAGE = {
    ingredients: "wif_selected_ingredients",
    favorites: "wif_favorites"
  };

  const INGREDIENTS = [
    { id: "eggs", name: "Яйця", category: "Базове", icon: "i-eggs" },
    { id: "milk", name: "Молоко", category: "Молочні", icon: "i-milk" },
    { id: "tomato", name: "Помідори", category: "Овочі", icon: "i-tomato" },
    { id: "cheese", name: "Сир", category: "Молочні", icon: "i-cheese" },
    { id: "butter", name: "Масло", category: "Молочні", icon: "i-butter" },
    { id: "onion", name: "Цибуля", category: "Овочі", icon: "i-onion" },
    { id: "potato", name: "Картопля", category: "Овочі", icon: "i-potato" },
    { id: "carrot", name: "Морква", category: "Овочі", icon: "i-carrot" },
    { id: "pasta", name: "Макарони", category: "Крупи/Паста", icon: "i-pasta" },
    { id: "chicken", name: "Курка", category: "М'ясо", icon: "i-chicken" },
    { id: "flour", name: "Борошно", category: "Випічка", icon: "i-flour" },
    { id: "sugar", name: "Цукор", category: "Випічка", icon: "i-sugar" }
  ];

  const RECIPES = [
    {
      id: "omelette-cheese",
      title: "Омлет із сиром",
      minutes: 12,
      difficulty: "Легко",
      type: "Сніданок",
      image: "images/recipe-omelette.svg",
      ingredients: ["eggs", "milk", "cheese", "butter"],
      optional: ["tomato", "onion"],
      steps: [
        "Збийте яйця з молоком у мисці, додайте дрібку солі.",
        "Розігрійте сковороду, розтопіть масло.",
        "Вилийте суміш, готуйте 2–3 хв, додайте тертий сир.",
        "Складіть омлет навпіл і доведіть до готовності."
      ]
    },
    {
      id: "tomato-egg-salad",
      title: "Салат з яйцем і помідором",
      minutes: 10,
      difficulty: "Легко",
      type: "Перекус",
      image: "images/recipe-salad.svg",
      ingredients: ["eggs", "tomato", "onion"],
      optional: ["cheese"],
      steps: [
        "Відваріть яйця (якщо вже готові — пропустіть).",
        "Наріжте помідори та цибулю, додайте нарізані яйця.",
        "За бажанням додайте сир, заправте за смаком."
      ]
    },
    {
      id: "chicken-pasta",
      title: "Паста з куркою",
      minutes: 25,
      difficulty: "Середньо",
      type: "Обід",
      image: "images/recipe-pasta.svg",
      ingredients: ["pasta", "chicken", "onion", "butter"],
      optional: ["tomato", "carrot"],
      steps: [
        "Відваріть пасту до стану al dente.",
        "Обсмажте цибулю на маслі, додайте курку і готуйте до готовності.",
        "Змішайте пасту з куркою, за бажанням додайте помідори/моркву."
      ]
    },
    {
      id: "potato-soup",
      title: "Картопляний суп",
      minutes: 35,
      difficulty: "Середньо",
      type: "Вечеря",
      image: "images/recipe-soup.svg",
      ingredients: ["potato", "carrot", "onion"],
      optional: ["chicken", "butter"],
      steps: [
        "Наріжте картоплю, моркву та цибулю.",
        "Залийте водою, варіть до м'якості овочів.",
        "За бажанням додайте курку та трохи масла для смаку."
      ]
    },
    {
      id: "pancakes",
      title: "Млинці (базові)",
      minutes: 20,
      difficulty: "Середньо",
      type: "Сніданок",
      image: "images/recipe-pancakes.svg",
      ingredients: ["milk", "flour", "eggs", "sugar"],
      optional: ["butter"],
      steps: [
        "Змішайте молоко, яйця, борошно і цукор до однорідності.",
        "Розігрійте сковороду, змастіть маслом.",
        "Смажте млинці з обох боків до рум’яності."
      ]
    }
  ];

  function $(sel, root = document) { return root.querySelector(sel); }
  function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  function safeJsonParse(str, fallback) {
    try { return JSON.parse(str); } catch { return fallback; }
  }

  function getSelectedIngredients() {
    return safeJsonParse(localStorage.getItem(STORAGE.ingredients), []);
  }
  function setSelectedIngredients(arr) {
    localStorage.setItem(STORAGE.ingredients, JSON.stringify(arr));
  }
  function getFavorites() {
    return safeJsonParse(localStorage.getItem(STORAGE.favorites), []);
  }
  function setFavorites(arr) {
    localStorage.setItem(STORAGE.favorites, JSON.stringify(arr));
  }

  function ingredientName(id) {
    const ing = INGREDIENTS.find(i => i.id === id);
    return ing ? ing.name : id;
  }

  function matchInfo(recipe, selectedIds) {
    const required = recipe.ingredients;
    const matchCount = required.filter(id => selectedIds.includes(id)).length;
    const percent = Math.round((matchCount / required.length) * 100);
    const missing = required.filter(id => !selectedIds.includes(id));
    const fullMatch = missing.length === 0;
    return { matchCount, percent, missing, fullMatch };
  }

  // Mobile nav toggle (A11Y-friendly)
  function initNav() {
    const btn = $("#navToggle");
    const menu = $("#navMenu");
    if (!btn || !menu) return;

    function close() {
      menu.dataset.open = "false";
      btn.setAttribute("aria-expanded", "false");
    }
    function open() {
      menu.dataset.open = "true";
      btn.setAttribute("aria-expanded", "true");
    }
    btn.addEventListener("click", () => {
      const isOpen = menu.dataset.open === "true";
      isOpen ? close() : open();
    });

    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && !btn.contains(e.target)) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  function initIngredientsPage() {
    const form = $("#ingredientsForm");
    if (!form) return;

    // Restore selection
    const selected = new Set(getSelectedIngredients());
    $all('input[type="checkbox"][name="ingredient"]', form).forEach((cb) => {
      if (selected.has(cb.value)) cb.checked = true;
    });

    const countEl = $("#selectedCount");
    function updateCount() {
      const c = $all('input[type="checkbox"][name="ingredient"]:checked', form).length;
      if (countEl) countEl.textContent = String(c);
    }
    updateCount();

    form.addEventListener("change", (e) => {
      if (e.target && e.target.matches('input[type="checkbox"][name="ingredient"]')) updateCount();
    });

    $("#resetBtn")?.addEventListener("click", () => {
      $all('input[type="checkbox"][name="ingredient"]', form).forEach(cb => cb.checked = false);
      updateCount();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const chosen = $all('input[type="checkbox"][name="ingredient"]:checked', form).map(cb => cb.value);
      setSelectedIngredients(chosen);
      window.location.href = "recipes.html";
    });
  }

  function renderRecipes(recipes, selectedIds) {
    const list = $("#recipeList");
    if (!list) return;

    list.innerHTML = "";
    const favorites = new Set(getFavorites());

    if (recipes.length === 0) {
      list.innerHTML = `
        <div class="card">
          <div class="card-body">
            <p><strong>Нічого не знайдено.</strong> Спробуйте обрати більше продуктів або увімкніть часткову відповідність.</p>
            <a class="btn btn-primary" href="ingredients.html">Повернутися до продуктів</a>
          </div>
        </div>
      `;
      return;
    }

    for (const r of recipes) {
      const m = matchInfo(r, selectedIds);
      const missingText = m.missing.length ? `Не вистачає: ${m.missing.map(ingredientName).join(", ")}` : "Усі інгредієнти є!";
      const fav = favorites.has(r.id);

      const card = document.createElement("article");
      card.className = "card recipe-card";
      card.innerHTML = `
        <div class="recipe-thumb">
          <img src="${r.image}" alt="${r.title}" loading="lazy" />
        </div>
        <div class="recipe-meta">
          <h2>${r.title}</h2>
          <div class="meta-row">
            <span class="pill strong" aria-label="Відповідність">${m.percent}%</span>
            <span class="pill accent">${r.minutes} хв</span>
            <span class="pill">${r.difficulty}</span>
            <span class="pill">${r.type}</span>
          </div>
          <p class="helper">${missingText}</p>
          <div class="recipe-actions">
            <a class="btn btn-primary" href="recipe.html?id=${encodeURIComponent(r.id)}">Переглянути рецепт</a>
            <button class="btn btn-secondary" type="button" data-fav="${r.id}">
              ${fav ? "У вибраному" : "У вибране"}
            </button>
          </div>
        </div>
      `;
      list.appendChild(card);
    }

    // favorites
    list.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-fav]");
      if (!btn) return;

      const id = btn.getAttribute("data-fav");
      const current = new Set(getFavorites());
      if (current.has(id)) {
        current.delete(id);
        btn.textContent = "У вибране";
      } else {
        current.add(id);
        btn.textContent = "У вибраному";
      }
      setFavorites([...current]);
    }, { passive: true });
  }

  function initRecipesPage() {
    const list = $("#recipeList");
    if (!list) return;

    const selected = getSelectedIngredients();
    const selectedWrap = $("#selectedSummary");
    if (selectedWrap) {
      selectedWrap.textContent = selected.length
        ? selected.map(ingredientName).join(", ")
        : "Нічого не обрано.";
    }

    const mode = $("#matchMode");
    const maxTime = $("#maxTime");
    const q = $("#q");

    function applyFilters() {
      const onlyFull = mode?.value === "full";
      const max = maxTime?.value ? Number(maxTime.value) : Infinity;
      const query = (q?.value || "").trim().toLowerCase();

      const withMatch = RECIPES
        .map(r => ({ r, m: matchInfo(r, selected) }))
        .filter(x => selected.length > 0 ? x.m.matchCount > 0 : true);

      const filtered = withMatch
        .filter(x => (onlyFull ? x.m.fullMatch : true))
        .filter(x => x.r.minutes <= max)
        .filter(x => query ? x.r.title.toLowerCase().includes(query) : true)
        .sort((a, b) => b.m.percent - a.m.percent || a.r.minutes - b.r.minutes)
        .map(x => x.r);

      renderRecipes(filtered, selected);

      const countEl = $("#recipesCount");
      if (countEl) countEl.textContent = String(filtered.length);
    }

    $("#clearSelected")?.addEventListener("click", () => {
      setSelectedIngredients([]);
      window.location.href = "ingredients.html";
    });

    [mode, maxTime, q].forEach(el => el?.addEventListener("input", applyFilters));
    applyFilters();
  }

  function initRecipePage() {
    const root = $("#recipeRoot");
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id") || "omelette-cheese";
    const r = RECIPES.find(x => x.id === id);

    if (!r) {
      root.innerHTML = `
        <div class="card">
          <div class="card-body">
            <p><strong>Рецепт не знайдено.</strong></p>
            <a class="btn btn-primary" href="recipes.html">До списку рецептів</a>
          </div>
        </div>
      `;
      return;
    }

    const selected = getSelectedIngredients();
    const m = matchInfo(r, selected);
    const missing = m.missing.map(ingredientName);

    root.innerHTML = `
      <article class="card">
        <div class="card-body">
          <header>
            <h1 style="margin-top:0">${r.title}</h1>
            <div class="meta-row" aria-label="Параметри рецепта">
              <span class="pill strong">${m.percent}% відповідність</span>
              <span class="pill accent">${r.minutes} хв</span>
              <span class="pill">${r.difficulty}</span>
              <span class="pill">${r.type}</span>
            </div>
          </header>

          <div class="grid" style="grid-template-columns: 1fr; gap: 14px; margin-top: 12px;">
            <img src="${r.image}" alt="${r.title}" style="border-radius: 18px; border: 2px solid rgba(105,30,6,.16); background: rgba(255,255,255,.55);" />
          </div>

          <section aria-labelledby="ingTitle" style="margin-top:14px;">
            <h2 id="ingTitle">Інгредієнти</h2>
            <ul>
              ${r.ingredients.map(i => {
                const ok = selected.includes(i);
                return `<li>${ok ? "✅" : "❌"} ${ingredientName(i)}</li>`;
              }).join("")}
            </ul>
            ${missing.length ? `<p class="notice"><strong>Не вистачає:</strong> ${missing.join(", ")}.</p>` : `<p class="notice"><strong>Усі інгредієнти є!</strong> Можна готувати.</p>`}
          </section>

          <section aria-labelledby="stepsTitle" style="margin-top:14px;">
            <h2 id="stepsTitle">Приготування</h2>
            <ol>
              ${r.steps.map(s => `<li>${s}</li>`).join("")}
            </ol>
          </section>

          <div class="recipe-actions" style="margin-top:16px;">
            <a class="btn btn-secondary" href="recipes.html">Назад до рецептів</a>
            <button class="btn btn-primary" type="button" id="favBtn">У вибране</button>
          </div>
        </div>
      </article>
    `;

    // JSON-LD (basic Recipe schema for SEO)
    const ld = {
      "@context": "https://schema.org",
      "@type": "Recipe",
      "name": r.title,
      "recipeCategory": r.type,
      "totalTime": `PT${r.minutes}M`,
      "recipeIngredient": r.ingredients.map(ingredientName),
      "recipeInstructions": r.steps.map((t, idx) => ({
        "@type": "HowToStep",
        "position": idx + 1,
        "text": t
      }))
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(ld);
    document.head.appendChild(script);

    // favorites
    const favBtn = $("#favBtn");
    const fav = new Set(getFavorites());
    const setText = () => favBtn && (favBtn.textContent = fav.has(r.id) ? "У вибраному" : "У вибране");
    setText();
    favBtn?.addEventListener("click", () => {
      if (fav.has(r.id)) fav.delete(r.id); else fav.add(r.id);
      setFavorites([...fav]);
      setText();
    });
  }

  // Boot
  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initIngredientsPage();
    initRecipesPage();
    initRecipePage();
  });
})();
