import { supabase } from "../../services/supabase.js";

const year = 2026;
const week = 5;

const grid = document.getElementById("planningGrid");


const DAYS = [
  { label: "Maandag", value: 1 },
  { label: "Dinsdag", value: 2 },
  { label: "Woensdag", value: 3 },
  { label: "Donderdag", value: 4 },
  { label: "Vrijdag", value: 5 },
  { label: "Zaterdag", value: 6 },
  { label: "Zondag", value: 7 }
];

const { data: shifts, error } = await supabase
  .from("planning")
  .select(`day_of_week, medewerkers ( naam )`)
  .eq("year", year)
  .eq("week_number", week);

if (error) {
  console.error(error);
  grid.innerHTML = "Fout bij laden";
  throw error;
}

// Structuur per dag
const perDag = {};
DAYS.forEach(d => (perDag[d.value] = []));

shifts.forEach(s => {
  if (s.medewerkers?.naam) {
    perDag[s.day_of_week].push(s.medewerkers.naam);
  }
});

// Render
grid.innerHTML = "";

// headers
DAYS.forEach(d => {
  grid.innerHTML += `<div class="cell header">${d.label}</div>`;
});

// dagkolommen
DAYS.forEach(d => {
  grid.innerHTML += `
    <div class="cell">
      ${perDag[d.value]
        .map(name => `<div class="name-cell">${name}</div>`)
        .join("")}
    </div>
  `;
});