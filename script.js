const KEY = "ajayWinterArc90_v1";

const quotes = [
  "Discipline is choosing what you want most over what you want now.",
  "You don't need motivation. You need a promise you keep.",
  "One day at a time. Ninety days at a time. Build Ajay.",
  "Your future self is watching what you do today.",
  "Cold mornings. Hard choices. Stronger Ajay.",
  "Small actions repeated become a completely different life.",
  "Don't chase a perfect streak. Protect your commitment.",
  "Show up when nobody is watching.",
  "The goal is not to feel ready. The goal is to begin.",
  "90 days from now, you'll wish you had started today."
];

const state = JSON.parse(localStorage.getItem(KEY) || "null") || {
  days: {},
  protein: {},
  target: 80
};

let selectedDay = 1;

const $ = (id) => document.getElementById(id);

function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function todayDay() {
  const start = localStorage.getItem(KEY + "_start");

  if (!start) return 1;

  return Math.min(
    90,
    Math.max(
      1,
      Math.floor((Date.now() - Number(start)) / 86400000) + 1
    )
  );
}

function render() {
  $("proteinTarget").value = state.target;

  const grid = $("daysGrid");
  grid.innerHTML = "";

  let completed = 0;
  let streak = 0;
  let totalProtein = 0;
  let proteinDays = 0;

  for (let i = 1; i <= 90; i++) {

    const status = state.days[i] || "";

    if (status === "done") {
      completed++;
    }

    if (state.protein[i] !== undefined) {
      totalProtein += Number(state.protein[i]);
      proteinDays++;
    }

    const card = document.createElement("button");

    card.className =
      "day " +
      (status || "empty") +
      (i === selectedDay ? " selected" : "");

    card.innerHTML = `
      <div class="day-num">DAY ${i}</div>

      <div class="day-date">
        ${
          i === todayDay()
            ? "TODAY"
            : i < todayDay()
            ? "PAST"
            : "UPCOMING"
        }
      </div>

      <div class="day-check">
        ${
          status === "done"
            ? "✓"
            : status === "partial"
            ? "•"
            : ""
        }
      </div>
    `;

    card.onclick = () => {
      selectedDay = i;
      loadProtein();
      render();
    };

    grid.appendChild(card);
  }

  // Calculate current streak
  for (let i = 1; i <= 90; i++) {
    if (state.days[i] === "done") {
      streak++;
    } else {
      break;
    }
  }

  $("dayStat").textContent =
    `${todayDay()} / 90`;

  $("completedStat").textContent =
    `${completed} / 90`;

  $("streakStat").textContent =
    `${streak} 🔥`;

  $("proteinStat").textContent =
    `${proteinDays ? Math.round(totalProtein / proteinDays) : 0} g`;

  $("dayBar").style.width =
    `${(todayDay() / 90) * 100}%`;

  $("completeBar").style.width =
    `${(completed / 90) * 100}%`;

  loadProtein();
}

function loadProtein() {

  const value =
    state.protein[selectedDay] ?? "";

  $("proteinInput").value = value;

  const percentage = Math.min(
    100,
    Math.round(
      (Number(value || 0) / state.target) * 100
    )
  );

  $("proteinRingValue").textContent =
    Number(value || 0);

  if (value !== "") {

    if (Number(value) >= state.target) {

      $("proteinMessage").textContent =
        "Target hit. Keep going, Ajay.";

    } else {

      const remaining =
        Math.max(
          0,
          state.target - Number(value)
        );

      $("proteinMessage").textContent =
        `Keep building — you're ${remaining} g away from target.`;
    }

  } else {

    $("proteinMessage").textContent = "";
  }

  document
    .querySelector(".protein-ring")
    .style.setProperty(
      "--progress",
      percentage + "%"
    );
}


// SAVE PROTEIN
$("saveProtein").onclick = () => {

  const value = Math.max(
    0,
    Number($("proteinInput").value || 0)
  );

  state.protein[selectedDay] = value;

  // Automatically update day status
  if (value >= state.target) {

    state.days[selectedDay] = "done";

  } else {

    state.days[selectedDay] = "partial";
  }

  save();
  render();
};


// CHANGE PROTEIN TARGET
$("proteinTarget").onchange = () => {

  state.target = Math.max(
    1,
    Number($("proteinTarget").value || 80)
  );

  save();
  render();
};


// GO TO TODAY
$("todayBtn").onclick = () => {

  selectedDay = todayDay();

  $("daysGrid").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  render();
};


// NEW MOTIVATION
$("quoteBtn").onclick = () => {

  const randomIndex =
    Math.floor(Math.random() * quotes.length);

  $("quote").textContent =
    quotes[randomIndex];
};


// RESET EVERYTHING
$("resetBtn").onclick = () => {

  const confirmReset = confirm(
    "Reset all 90-day progress? This cannot be undone."
  );

  if (confirmReset) {

    localStorage.removeItem(KEY);
    localStorage.removeItem(KEY + "_start");

    location.reload();
  }
};


// START DATE
if (!localStorage.getItem(KEY + "_start")) {

  localStorage.setItem(
    KEY + "_start",
    Date.now()
  );
}


// START WEBSITE
render();
