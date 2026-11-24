# 🗂️ Office Hub — Events & Attendance

A simple offline-first website for encoding employee attendance and managing an office
event calendar, with CSV import/export that opens directly in Excel.

Built with plain **HTML + CSS + JavaScript** — no frameworks, no server needed.

## Files
| File | Purpose |
|---|---|
| `index.html` | Page structure and tabs |
| `style.css` | All styling |
| `app.js` | All logic (calendar, attendance, CSV, login) |

## How to run
Just open `index.html` in any browser (double-click it). No installation needed.

## What each role sees
- **Employees (no login):** read-only monthly calendar — click a day to see event details (title, type, time, venue). No edit/delete buttons, and attendance is invisible.
- **Admin (password `admin123`):**
  - 📅 **Manage Events** — click a day to add, or click an event chip to edit/delete
  - 📋 **Attendance** — full table, filter by employee + date range, add/edit/delete
  - 📊 **Excel Connection** — export Events/Attendance as CSV, download templates, import a CSV back (in Excel: *File → Save As → CSV UTF-8* first)

## Changing the admin password
Open `app.js` and edit the first lines:

```js
const CONFIG = {
  ADMIN_PASSWORD: "admin123",   // ← change this
};
```

## Data storage (important)
Data is saved in the browser's **localStorage** on the device where you enter it.
- Clearing browser data or opening the site on another computer will not show the same records.
- Use the **Excel Connection** tab to back up your data as CSV files regularly.

## Deploying for real
- **Single office PC:** keep this file-based version; it is a local, self-contained demo.
- **Company-wide:** host it online with a real database backend, or export the calendar
  sheet from Excel to SharePoint/Teams for passive viewing while you keep editing rights.
