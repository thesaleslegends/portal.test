import { supabase } from "../../services/supabase.js";

/* ===============================
   WEEK STATE
================================ */
let currentYear = 2026;
let currentWeek = 5;
let activeDay = null;
let shiftToDelete = null;

/* ===============================
   DOM
================================ */
const weekLabel = document.getElementById("weekLabel");
const prevWeekBtn = document.getElementById("prevWeek");
const nextWeekBtn = document.getElementById("nextWeek");

const modal = document.getElementById("planModal");
const employeeSelect = document.getElementById("employeeSelect");
const halfDayCheckbox = document.getElementById("halfDayCheckbox");
const saveShiftBtn = document.getElementById("saveShift");
const closeModalBtn = document.getElementById("cancelShift");

/* DELETE MODAL */
const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const cancelDeleteBtn = document.getElementById("cancelDelete");

/* ===============================
   INIT
================================ */
updateWeekLabel();
loadWeek();

/* ===============================
   WEEK NAVIGATIE
================================ */
prevWeekBtn.onclick = () => {
  currentWeek--;
  if (currentWeek < 1) {
    currentWeek = 52;
    currentYear--;
  }
  updateWeekLabel();
  loadWeek();
};

nextWeekBtn.onclick = () => {
  currentWeek++;
  if (currentWeek > 52) {
    currentWeek = 1;
    currentYear++;
  }
  updateWeekLabel();
  loadWeek();
};

function updateWeekLabel() {
  weekLabel.innerText = `Week ${currentWeek} (${currentYear})`;
}

/* ===============================
   MEDEWERKERS LADEN
================================ */
async function loadEmployees() {
  const { data, error } = await supabase
    .from("medewerkers")
    .select("id, naam")
    .eq("actief", true)
    .order("naam");

  if (error) {
    console.error("Fout bij laden medewerkers:", error);
    return;
  }

  employeeSelect.innerHTML = `<option value="">Kies medewerker</option>`;

  data.forEach(emp => {
    const opt = document.createElement("option");
    opt.value = emp.id;
    opt.textContent = emp.naam;
    employeeSelect.appendChild(opt);
  });
}

/* ===============================
   WEEK LADEN
================================ */
async function loadWeek() {
  document.querySelectorAll(".day-list").forEach(l => l.innerHTML = "");
  document.querySelectorAll(".summary-cell").forEach(c => c.innerText = "0");
  document.getElementById("weekTotal").innerText = "0";

  const { data: shifts, error } = await supabase
    .from("planning")
    .select(`
      id,
      day_of_week,
      half_day,
      medewerkers ( naam )
    `)
    .eq("year", currentYear)
    .eq("week_number", currentWeek);

  if (error) {
    console.error("Fout bij laden planning:", error);
    return;
  }

  renderWeek(shifts);
  calculateTotals(shifts);
}

/* ===============================
   RENDER WEEK
================================ */
function renderWeek(shifts) {
  shifts.forEach(shift => {
    const list = document.querySelector(
      `.day-column[data-day="${shift.day_of_week}"] .day-list`
    );
    if (!list) return;

    const li = document.createElement("li");
    li.textContent =
      shift.medewerkers?.naam + (shift.half_day ? " (½)" : "");

    /* 👇 KLIKBAAR → VERWIJDER MODAL */
    li.style.cursor = "pointer";
    li.onclick = () => {
      shiftToDelete = shift.id;
      deleteModal.style.display = "flex";
    };

    list.appendChild(li);
  });
}

/* ===============================
   TOTALEN
================================ */
function calculateTotals(shifts) {
  const totals = {1:0,2:0,3:0,4:0,5:0,6:0,7:0};

  shifts.forEach(s => {
    totals[s.day_of_week] += s.half_day ? 0.5 : 1;
  });

  document.querySelectorAll(".summary-cell").forEach((c, i) => {
    c.innerText = totals[i + 1];
  });

  document.getElementById("weekTotal").innerText =
    Object.values(totals).reduce((a,b)=>a+b,0);
}

/* ===============================
   PLUSJE → MODAL
================================ */
document.querySelectorAll(".add-btn").forEach(btn => {
  btn.onclick = async () => {
    activeDay = btn.closest(".day-column").dataset.day;
    await loadEmployees();
    modal.style.display = "flex";
  };
});

/* ===============================
   MODAL SLUITEN
================================ */
closeModalBtn.onclick = () => {
  modal.style.display = "none";
  halfDayCheckbox.checked = false;
  employeeSelect.value = "";
  activeDay = null;
};

/* ===============================
   OPSLAAN SHIFT
================================ */
saveShiftBtn.onclick = async () => {
  if (!activeDay || !employeeSelect.value) return;

  const { error } = await supabase
    .from("planning")
    .insert({
      year: currentYear,
      week_number: currentWeek,
      day_of_week: Number(activeDay),
      employee_id: employeeSelect.value,
      half_day: halfDayCheckbox.checked
    });

  if (error) {
    alert("Fout bij opslaan");
    console.error(error);
    return;
  }

  modal.style.display = "none";
  halfDayCheckbox.checked = false;
  employeeSelect.value = "";
  loadWeek();
};

/* ===============================
   DELETE MODAL
================================ */
cancelDeleteBtn.onclick = () => {
  deleteModal.style.display = "none";
  shiftToDelete = null;
};

confirmDeleteBtn.onclick = async () => {
  if (!shiftToDelete) return;

  const { error } = await supabase
    .from("planning")
    .delete()
    .eq("id", shiftToDelete);

  if (error) {
    alert("Fout bij verwijderen");
    console.error(error);
    return;
  }

  deleteModal.style.display = "none";
  shiftToDelete = null;
  loadWeek();
};
async function loadFixedDaysForWeek() {
  // 1. Haal alle actieve medewerkers met vaste dagen
  const { data: employees, error } = await supabase
    .from("medewerkers")
    .select("id, vaste_dagen")
    .eq("actief", true)
    .not("vaste_dagen", "is", null);

  if (error) {
    console.error("Fout bij laden vaste dagen:", error);
    return;
  }

  // 2. Haal bestaande shifts op (om dubbels te voorkomen)
  const { data: existingShifts } = await supabase
    .from("planning")
    .select("employee_id, day_of_week")
    .eq("year", currentYear)
    .eq("week_number", currentWeek);

  const existingMap = new Set(
    existingShifts.map(s => `${s.employee_id}-${s.day_of_week}`)
  );

  // 3. Bouw nieuwe shifts
  const newShifts = [];

  employees.forEach(emp => {
    emp.vaste_dagen.forEach(day => {
      const key = `${emp.id}-${day}`;
      if (!existingMap.has(key)) {
        newShifts.push({
          year: currentYear,
          week_number: currentWeek,
          day_of_week: day,
          employee_id: emp.id,
          half_day: false
        });
      }
    });
  });

  if (newShifts.length === 0) {
    alert("Geen nieuwe vaste dagen om in te plannen");
    return;
  }

  // 4. Insert in planning
  const { error: insertError } = await supabase
    .from("planning")
    .insert(newShifts);

  if (insertError) {
    console.error("Fout bij invoegen vaste dagen:", insertError);
    alert("Fout bij invoegen vaste dagen");
    return;
  }

  loadWeek();
}
const loadFixedDaysBtn = document.getElementById("loadFixedDays");

if (loadFixedDaysBtn) {
  loadFixedDaysBtn.onclick = loadFixedDaysForWeek;
}