/* =====================================================
   Office Hub — Events & Attendance (localStorage demo)
   Change the admin password here:
===================================================== */
const CONFIG = {
  ADMIN_PASSWORD: "admin123",
};

/* ================= Storage ================= */
const KEYS = {
  events: "oh_events",
  employees: "oh_employees",
  attendance: "oh_attendance",
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

let events = load(KEYS.events, null);
let employees = load(KEYS.employees, null);
let attendance = load(KEYS.attendance, null);

function pad(n) { return String(n).padStart(2, "0"); }
function toDateStr(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ================= Sample data ================= */
function seedSampleData() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const day = (base, d) => y + "-" + pad(m + 1) + "-" + pad(d);

  events = [
    { id: uid(), date: day(y, 3),  title: "Monthly Staff Meeting", type: "Meeting",  time: "09:00", venue: "Conference Room A" },
    { id: uid(), date: day(y, 8),  title: "Fire Safety Training",  type: "Training", time: "13:30", venue: "Training Hall" },
    { id: uid(), date: day(y, 14), title: "Company Foundation Day",type: "Holiday",  time: "All day", venue: "Whole Office" },
    { id: uid(), date: day(y, 21), title: "Team Building Party",   type: "Party",    time: "16:00", venue: "Rooftop Deck" },
    { id: uid(), date: day(y, 26), title: "Client Presentation",   type: "Meeting",  time: "10:00", venue: "Boardroom" },
  ];

  employees = [
    { id: "emp1", name: "Ana Reyes" },
    { id: "emp2", name: "Ben Santos" },
    { id: "emp3", name: "Carla Cruz" },
    { id: "emp4", name: "David Lim" },
  ];

  attendance = [
    { id: uid(), date: day(y, 1), employee: "Ana Reyes",   status: "Present", timeIn: "08:02", timeOut: "17:05", remarks: "" },
    { id: uid(), date: day(y, 1), employee: "Ben Santos",  status: "Late",    timeIn: "09:14", timeOut: "18:00", remarks: "Traffic" },
    { id: uid(), date: day(y, 1), employee: "Carla Cruz",  status: "Present", timeIn: "07:55", timeOut: "17:00", remarks: "" },
    { id: uid(), date: day(y, 2), employee: "David Lim",   status: "Absent",  timeIn: "",      timeOut: "",      remarks: "Sick leave" },
    { id: uid(), date: day(y, 2), employee: "Ana Reyes",   status: "Present", timeIn: "08:00", timeOut: "17:02", remarks: "" },
    { id: uid(), date: day(y, 2), employee: "Ben Santos",  status: "Half-day",timeIn: "08:10", timeOut: "12:30", remarks: "Doctor visit" },
  ];

  save(KEYS.events, events);
  save(KEYS.employees, employees);
  save(KEYS.attendance, attendance);
}
if (!events || !employees || !attendance) seedSampleData();

/* ================= Tabs / login ================= */
let isAdmin = false;

const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

tabs.forEach(t => t.addEventListener("click", () => activateTab(t.dataset.tab)));

function activateTab(name) {
  tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === name));
  panels.forEach(p => p.classList.toggle("hidden", p.id !== "tab-" + name));
  if (name === "calendar") renderCalendar();
  if (name === "manage") renderManage();
  if (name === "attendance") renderAttendance();
}

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginStatus = document.getElementById("loginStatus");

loginBtn.addEventListener("click", () => {
  openModal("🔐 Admin Login", formHtml({ id: "login-form", fields: [
    { label: "Password", name: "password", type: "password", required: true },
  ], submitLabel: "Login" }));
  bindFormById("login-form", (vals, formEl, ev) => {
    ev.preventDefault();
    if (vals.password === CONFIG.ADMIN_PASSWORD) {
      isAdmin = true;
      applyAdminState();
      closeModal();
    } else {
      formEl.querySelector(".error-msg").textContent = "Wrong password. Try again.";
    }
  });
});

logoutBtn.addEventListener("click", () => {
  isAdmin = false;
  applyAdminState();
  activateTab("calendar");
});

function applyAdminState() {
  document.querySelectorAll(".admin-only").forEach(el => el.classList.toggle("hidden", !isAdmin));
  loginBtn.classList.toggle("hidden", isAdmin);
  logoutBtn.classList.toggle("hidden", !isAdmin);
  loginStatus.textContent = isAdmin ? "Admin ✔" : "";
}

/* ================= Modal helpers ================= */
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");

function openModal(title, html) {
  modalTitle.textContent = title;
  modalBody.innerHTML = html;
  modal.classList.remove("hidden");
}
function closeModal() { modal.classList.add("hidden"); }

document.getElementById("modalClose").addEventListener("click", closeModal);
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

function formHtml({ id, fields, submitLabel, extraHtml = "" }) {
  const inputs = fields.map(f => `
    <div class="field">
      <label>${f.label}</label>
      ${f.type === "select"
        ? `<select name="${f.name}">${f.options.map(o => `<option value="${o}">${o}</option>`).join("")}</select>`
        : `<input type="${f.type}" name="${f.name}" ${f.required ? "required" : ""} value="${f.value ?? ""}">`}
    </div>`).join("");
  return `<form id="${id}">${inputs}<div class="error-msg"></div>${extraHtml}
    <div class="form-actions"><button type="button" class="btn" data-close>Cancel</button>
    <button type="submit" class="btn btn-primary">${submitLabel}</button></div></form>`;
}

function bindFormById(id, onSubmit) {
  const formEl = document.getElementById(id);
  formEl.querySelector("[data-close]").addEventListener("click", closeModal);
  formEl.addEventListener("submit", ev => {
    ev.preventDefault();
    const vals = {};
    new FormData(formEl).forEach((v, k) => vals[k] = v.trim());
    onSubmit(vals, formEl, ev);
  });
}

/* ================= Calendar rendering ================= */
const EVENT_TYPES = ["Meeting", "Holiday", "Training", "Party", "Other"];
const EVENT_TIME_OPTIONS = ["All day", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

const calTitle = document.getElementById("calTitle");
const mgrTitle = document.getElementById("mgrTitle");
let calView = { y: new Date().getFullYear(), m: new Date().getMonth() };
let mgrView = { y: calView.y, m: calView.m };

document.getElementById("calPrev").addEventListener("click", () => shiftView(calView, renderCalendar));
document.getElementById("calNext").addEventListener("click", () => shiftView(calView, renderCalendar));
document.getElementById("calToday").addEventListener("click", () => { calView = { y: new Date().getFullYear(), m: new Date().getMonth() }; renderCalendar(); });
document.getElementById("mgrPrev").addEventListener("click", () => shiftView(mgrView, renderManage));
document.getElementById("mgrNext").addEventListener("click", () => shiftView(mgrView, renderManage));
document.getElementById("mgrToday").addEventListener("click", () => { mgrView = { y: new Date().getFullYear(), m: new Date().getMonth() }; renderManage(); });

function shiftView(view, rerender) {
  view.m++;
  if (view.m > 11) { view.m = 0; view.y++; }
  rerender();
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function buildCalCells(view) {
  const first = new Date(view.y, view.m, 1).getDay();
  const daysIn = new Date(view.y, view.m + 1, 0).getDate();
  const prevDays = new Date(view.y, view.m, 0).getDate();
  const cells = [];
  for (let i = first - 1; i >= 0; i--) cells.push({ d: prevDays - i, other: true });
  for (let d = 1; d <= daysIn; d++) cells.push({ d, other: false });
  while (cells.length % 7 !== 0) cells.push({ filler: true });
  return cells;
}

function renderCalendar() {
  calTitle.textContent = MONTHS[calView.m] + " " + calView.y;
  const grid = document.getElementById("calGrid");
  const today = toDateStr(new Date());
  grid.innerHTML = buildCalCells(calView).map(c => {
    if (c.filler) return `<div class="cal-cell empty"></div>`;
    const ds = calView.y + "-" + pad(calView.m + 1) + "-" + pad(c.d);
    const chips = events.filter(e => e.date === ds).map(e =>
      `<span class="chip ${e.type.toLowerCase()}" data-open="${ds}" data-id="${e.id}">${escapeHtml(e.title)}</span>`).join("");
    return `<div class="cal-cell ${c.other ? "other" : ""} ${ds === today ? "today" : ""}" data-open="${ds}">
      <span class="day-num">${c.d}</span>${chips}</div>`;
  }).join("");

  grid.querySelectorAll("[data-open]").forEach(el =>
    el.addEventListener("click", () => openDayView(el.dataset.open)));
}

function openDayView(ds) {
  const dayEvents = events.filter(e => e.date === ds);
  const list = dayEvents.length
    ? dayEvents.map(e => `
        <div class="event-item">
          <div class="e-title">${escapeHtml(e.title)}</div>
          <div class="e-meta">Type: ${e.type} • Time: ${e.time} • Venue: ${escapeHtml(e.venue)}</div>
        </div>`).join("")
    : `<p class="hint">No events on this day.</p>`;
  openModal("📅 Events — " + ds, list);
}

function renderManage() {
  mgrTitle.textContent = MONTHS[mgrView.m] + " " + mgrView.y;
  const grid = document.getElementById("mgrGrid");
  const today = toDateStr(new Date());
  grid.innerHTML = buildCalCells(mgrView).map(c => {
    if (c.filler) return `<div class="cal-cell empty"></div>`;
    const ds = mgrView.y + "-" + pad(mgrView.m + 1) + "-" + pad(c.d);
    const chips = events.filter(e => e.date === ds).map(e =>
      `<span class="chip ${e.type.toLowerCase()}" data-edit="${e.id}" title="Click to edit">${escapeHtml(e.title)}</span>`).join("");
    return `<div class="cal-cell ${c.other ? "other" : ""} ${ds === today ? "today" : ""}" data-add="${ds}">
      <span class="day-num">+ ${c.d}</span>${chips}</div>`;
  }).join("");

  grid.querySelectorAll("[data-add]").forEach(el =>
    el.addEventListener("click", e => {
      if (e.target.dataset.edit) return;
      openEventForm(null, el.dataset.add);
    }));
  grid.querySelectorAll("[data-edit]").forEach(el =>
    el.addEventListener("click", e => {
      e.stopPropagation();
      openEventForm(el.dataset.edit, null);
    }));
}

function eventFormHtml(ev, date) {
  const typeOptions = EVENT_TYPES.map(t =>
    `<option value="${t}" ${ev && ev.type === t ? "selected" : ""}>${t}</option>`).join("");
  const timeOptions = EVENT_TIME_OPTIONS.map(t =>
    `<option value="${t}" ${ev && ev.time === t ? "selected" : ""}>${t}</option>`).join("");
  return `
  <form id="event-form">
    <div class="field"><label>Date</label><input type="date" name="date" required value="${date}"></div>
    <div class="field"><label>Title</label><input type="text" name="title" required value="${ev ? escapeHtml(ev.title) : ""}"></div>
    <div class="field"><label>Type</label><select name="type">${typeOptions}</select></div>
    <div class="field"><label>Time</label><select name="time">${timeOptions}</select></div>
    <div class="field"><label>Venue</label><input type="text" name="venue" required value="${ev ? escapeHtml(ev.venue) : ""}"></div>
    <div class="form-actions">
      ${ev ? `<button type="button" class="btn btn-danger" id="delEvent" style="margin-right:auto">🗑 Delete</button>` : ""}
      <button type="button" class="btn" data-close>Cancel</button>
      <button type="submit" class="btn btn-primary">${ev ? "Save Changes" : "Add Event"}</button>
    </div>
  </form>`;
}

function openEventForm(id, dateStr) {
  const ev = id ? events.find(e => e.id === id) : null;
  const date = ev ? ev.date : dateStr;
  openModal(ev ? "✏️ Edit Event" : "➕ Add Event — " + date, eventFormHtml(ev, date));

  const formEl = document.getElementById("event-form");
  formEl.querySelector("[data-close]").addEventListener("click", closeModal);
  formEl.addEventListener("submit", e => {
    e.preventDefault();
    const vals = {};
    new FormData(formEl).forEach((v, k) => vals[k] = v.trim());
    if (ev) Object.assign(ev, vals);
    else events.push({ id: uid(), ...vals });
    save(KEYS.events, events);
    closeModal();
    renderManage();
  });

  const delBtn = document.getElementById("delEvent");
  if (delBtn) delBtn.addEventListener("click", () => {
    if (confirm("Delete this event?")) {
      events = events.filter(e => e.id !== id);
      save(KEYS.events, events);
      closeModal();
      renderManage();
    }
  });
}

/* ================= Attendance ================= */
const ATT_STATUSES = ["Present", "Late", "Absent", "Leave", "Half-day"];

const filterEmployee = document.getElementById("filterEmployee");
const filterFrom = document.getElementById("filterFrom");
const filterTo = document.getElementById("filterTo");

document.getElementById("filterClear").addEventListener("click", () => {
  filterEmployee.value = "";
  filterFrom.value = "";
  filterTo.value = "";
  renderAttendance();
});
[filterEmployee, filterFrom, filterTo].forEach(el => el.addEventListener("change", renderAttendance));

function populateEmployeeFilter() {
  const current = filterEmployee.value;
  filterEmployee.innerHTML = `<option value="">All employees</option>` +
    employees.map(e => `<option value="${escapeHtml(e.name)}">${escapeHtml(e.name)}</option>`).join("");
  if (current && employees.some(e => e.name === current)) filterEmployee.value = current;
}

function renderAttendance() {
  populateEmployeeFilter();
  const tbody = document.querySelector("#attTable tbody");
  const rows = attendance
    .filter(a => (!filterEmployee.value || a.employee === filterEmployee.value))
    .filter(a => (!filterFrom.value || a.date >= filterFrom.value))
    .filter(a => (!filterTo.value || a.date <= filterTo.value))
    .sort((a, b) => b.date.localeCompare(a.date) || a.employee.localeCompare(b.employee));

  tbody.innerHTML = rows.map(a => `
    <tr>
      <td>${a.date}</td>
      <td>${escapeHtml(a.employee)}</td>
      <td><span class="badge ${a.status}">${a.status}</span></td>
      <td>${a.timeIn || "—"}</td>
      <td>${a.timeOut || "—"}</td>
      <td>${escapeHtml(a.remarks || "")}</td>
      <td>
        <button class="btn btn-sm" data-edit="${a.id}">✏️</button>
        <button class="btn btn-sm btn-danger" data-del="${a.id}">🗑</button>
      </td>
    </tr>`).join("") || `<tr><td colspan="7" class="hint">No records match the filters.</td></tr>`;

  document.getElementById("attCount").textContent = rows.length + " record(s) shown.";

  tbody.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => openAttendanceForm(b.dataset.edit)));
  tbody.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => {
    if (confirm("Delete this attendance record?")) {
      attendance = attendance.filter(a => a.id !== b.dataset.del);
      save(KEYS.attendance, attendance);
      renderAttendance();
    }
  }));
}

document.getElementById("attAdd").addEventListener("click", () => openAttendanceForm(null));

function attendanceFormHtml(rec) {
  const empOptions = employees.map(e =>
    `<option value="${escapeHtml(e.name)}" ${rec && rec.employee === e.name ? "selected" : ""}>${escapeHtml(e.name)}</option>`).join("");
  const statusOptions = ATT_STATUSES.map(s =>
    `<option value="${s}" ${rec && rec.status === s ? "selected" : ""}>${s}</option>`).join("");
  return `
  <form id="att-form">
    <div class="field"><label>Date</label><input type="date" name="date" required value="${rec ? rec.date : toDateStr(new Date())}"></div>
    <div class="field"><label>Employee</label><input type="text" name="employee" required list="emp-list" value="${rec ? escapeHtml(rec.employee) : ""}">
      <datalist id="emp-list">${employees.map(e => `<option value="${escapeHtml(e.name)}">`).join("")}</datalist></div>
    <div class="field"><label>Status</label><select name="status">${statusOptions}</select></div>
    <div class="field"><label>Time In (HH:MM)</label><input type="time" name="timeIn" value="${rec ? rec.timeIn : ""}"></div>
    <div class="field"><label>Time Out (HH:MM)</label><input type="time" name="timeOut" value="${rec ? rec.timeOut : ""}"></div>
    <div class="field"><label>Remarks</label><input type="text" name="remarks" value="${rec ? escapeHtml(rec.remarks || "") : ""}"></div>
    <div class="form-actions">
      <button type="button" class="btn" data-close>Cancel</button>
      <button type="submit" class="btn btn-primary">${rec ? "Save Changes" : "Add Record"}</button>
    </div>
  </form>`;
}

function openAttendanceForm(id) {
  const rec = id ? attendance.find(a => a.id === id) : null;
  openModal(rec ? "✏️ Edit Attendance" : "➕ Add Attendance", attendanceFormHtml(rec));

  const formEl = document.getElementById("att-form");
  formEl.querySelector("[data-close]").addEventListener("click", closeModal);
  formEl.addEventListener("submit", e => {
    e.preventDefault();
    const vals = {};
    new FormData(formEl).forEach((v, k) => vals[k] = v.trim());
    if (rec) Object.assign(rec, vals);
    else {
      attendance.push({ id: uid(), ...vals });
      if (!employees.some(e => e.name === vals.employee)) {
        employees.push({ id: uid(), name: vals.employee });
        save(KEYS.employees, employees);
      }
    }
    save(KEYS.attendance, attendance);
    closeModal();
    renderAttendance();
  });
}

/* ================= CSV helpers ================= */
const CSV_BOM = "\uFEFF";

function csvEscape(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function toCsv(headers, rows) {
  return CSV_BOM + headers.join(",") + "\n" +
    rows.map(r => headers.map((_, i) => csvEscape(r[i])).join(",")).join("\n");
}

function parseCsv(text) {
  text = text.replace(CSV_BOM, "").replace(/\r\n?/g, "\n").trim();
  const rows = [];
  let row = [], cell = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else inQuotes = false;
      } else cell += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell); cell = "";
    } else if (ch === "\n") {
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

const EVENT_HEADERS = ["Date", "Title", "Type", "Time", "Venue"];
const ATT_HEADERS = ["Date", "Employee", "Status", "TimeIn", "TimeOut", "Remarks"];

function exportEventsCsv() {
  const rows = [...events].sort((a, b) => a.date.localeCompare(b.date))
    .map(e => [e.date, e.title, e.type, e.time, e.venue]);
  downloadCsv("events.csv", toCsv(EVENT_HEADERS, rows));
}

function exportAttendanceCsv() {
  const rows = [...attendance].sort((a, b) => a.date.localeCompare(b.date))
    .map(a => [a.date, a.employee, a.status, a.timeIn, a.timeOut, a.remarks]);
  downloadCsv("attendance.csv", toCsv(ATT_HEADERS, rows));
}

function templateEventsCsv() {
  downloadCsv("events-template.csv",
    toCsv(EVENT_HEADERS, [["2025-01-15", "Monthly Staff Meeting", "Meeting", "09:00", "Conference Room A"]]));
}

function templateAttendanceCsv() {
  downloadCsv("attendance-template.csv",
    toCsv(ATT_HEADERS, [["2025-01-15", "Ana Reyes", "Present", "08:00", "17:00", ""]]));
}

function importCsv(file, headers, onRows) {
  const reader = new FileReader();
  reader.onload = () => {
    const rows = parseCsv(reader.result);
    if (!rows.length) return alert("The file is empty.");
    const head = rows[0].map(h => h.trim().toLowerCase());
    const idx = headers.map(h => head.indexOf(h.toLowerCase()));
    if (idx.some(i => i === -1)) {
      return alert("Columns don't match. Expected: " + headers.join(", ") +
        "\nTip: in Excel use File → Save As → CSV UTF-8.");
    }
    const mapped = rows.slice(1)
      .filter(r => r.some(c => c.trim() !== ""))
      .map(r => idx.map(i => (r[i] || "").trim()));
    onRows(mapped);
  };
  reader.readAsText(file, "utf-8");
}

document.getElementById("expEvents").addEventListener("click", exportEventsCsv);
document.getElementById("expAttendance").addEventListener("click", exportAttendanceCsv);
document.getElementById("tplEvents").addEventListener("click", templateEventsCsv);
document.getElementById("tplAttendance").addEventListener("click", templateAttendanceCsv);

document.getElementById("impEvents").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  importCsv(file, EVENT_HEADERS, rows => {
    let added = 0, updated = 0;
    rows.forEach(([date, title, type, time, venue]) => {
      const found = events.find(ev => ev.date === date && ev.title === title);
      if (found) { Object.assign(found, { type, time, venue }); updated++; }
      else { events.push({ id: uid(), date, title, type, time, venue }); added++; }
    });
    save(KEYS.events, events);
    renderManage();
    alert(`Events import done. Added: ${added}, updated: ${updated}.`);
  });
  e.target.value = "";
});

document.getElementById("impAttendance").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  importCsv(file, ATT_HEADERS, rows => {
    let added = 0, updated = 0;
    rows.forEach(([date, employee, status, timeIn, timeOut, remarks]) => {
      const found = attendance.find(a => a.date === date && a.employee === employee);
      if (found) { Object.assign(found, { status, timeIn, timeOut, remarks }); updated++; }
      else { attendance.push({ id: uid(), date, employee, status, timeIn, timeOut, remarks }); added++; }
      if (!employees.some(e => e.name === employee)) {
        employees.push({ id: uid(), name: employee });
        save(KEYS.employees, employees);
      }
    });
    save(KEYS.attendance, attendance);
    renderAttendance();
    alert(`Attendance import done. Added: ${added}, updated: ${updated}.`);
  });
  e.target.value = "";
});

/* ================= Init ================= */
applyAdminState();
renderCalendar();
