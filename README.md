# SFJ Prayer Cells Manager

**Students for Jesus — Chennai Prayer Cells (2026-2027)**

A simple web app to keep track of the SFJ prayer cells ministry. It lets the team
record details about each prayer cell, the students and bachelors who attend, the
leaders and shepherds who run them, and the prayer points used during the year.

This document is written for everyone — no technical background needed.

---

## What this app is for

The ministry runs small "prayer cells" at schools, colleges, hostels and homes
around Chennai. Each cell meets on a fixed day and time, has a leader, a shepherd,
and a list of members (students or bachelors).

This app helps the SFJ team to:

- Keep one up-to-date list of **all prayer cells** (who meets where, when, and who leads it).
- Record **members** of each cell and what standard/class they study in.
- Track **leaders** and **shepherds**.
- Keep a **follow-up list** of students — whether they are still praying, have become
  believers, have been baptised, etc.
- Store the **prayer points** used during meetings.
- View a **summary dashboard** (numbers and charts) to see how the ministry is doing.
- **Print or download a neat PDF report** of everything, ready to share.

---

## Who can use it

There are three types of users, called **roles**:

| Role     | What they can do |
|----------|------------------|
| **Admin**   | Everything: add, edit and delete all records, and manage who can sign in (add / delete users, reset passwords). |
| **Shepherd**| Add, edit and delete records (data entry), but cannot manage user accounts. |
| **Viewer**  | Look at the dashboard and reports only. Cannot change anything. |

---

## The main screens

### 1. Login screen
The first page everyone sees. Type your **username** and **password** to sign in.
Your username and role are set up by an admin. After signing in you are taken to the
right screen for your role.

### 2. The Manager screen (for Admin and Shepherds)
This is where records are added, edited and deleted. On the left is a menu with six
lists, called **collections**:

1. **Cells** — each prayer cell (e.g. "Loyola College, Choolaimedu"). You record the
   category (student / bachelor / institute), status (active, plan, yet to start, not
   active), meeting day and time, leader, shepherd and capacity.
2. **Members** — the people in each cell, and their standard/class.
3. **Leaders** — the names of cell leaders and which cell they lead.
4. **Shepherds** — the shepherds and the cells they look after.
5. **Follow-up Students** — students being followed up, and their status
   (praying / converted / baptised / backslidden).
6. **Prayer Points** — the prayer topics used, with a summary, scripture and order.

You can **search** any list, **add** a new record, **edit** one with a pencil button,
or **delete** one with the bin button. An admin can also **clear a whole list**
(a small "x" icon next to the menu name).

The same screen lets you **change your own password**. Admins can open the
**Users** screen to add new user accounts, reset passwords, or remove users.

### 3. The Dashboard / Report screen (everyone)
Shows a summary at a glance:

- Big number cards (how many cells, active cells, members, shepherds, leaders,
  follow-up students, prayer points).
- Charts: members per cell, cells by day of the week, and an overview of all people.
- A **Details** page with the full nicely-formatted report (all cells with their
  members, shepherds, leaders, follow-up list and prayer points).
- **Print** button (prints the current page) and **Download PDF** button (downloads
  the full report as a PDF file).

---

## Where is the data stored?

There is no office computer holding the data. The records live in the **cloud**, on
a service called **jsonbin.io**. The app talks to that service to read and save
records, so everyone using the app always sees the same up-to-date information.

Login (user) details are also stored there, but passwords are stored only as a
**hashed** value — the actual password is never saved, and even an admin cannot see
your password.

---

## How to run it

You don't need to install anything.

1. Copy the whole **sfj** folder to the computer or web server where the app will live.
2. Open **login.html** with a web browser (or open the folder through any web
   hosting service).
3. Sign in with the username and password the admin created for you.

> Tip: opening the files directly from the folder (double-clicking) works fine in
> most browsers, but some browsers place security limits on pages opened this way.
> Hosting the folder on any website or web server gives the most reliable experience.

---

## The files in this project

| File / folder          | What it is |
|------------------------|------------|
| `login.html`           | The sign-in page. |
| `index.html`           | The Manager screen for admins and shepherds. |
| `stats.html`           | The dashboard and report screen. |
| `css/style.css`        | The styling (colors, layout) of all pages. |
| `js/`                  | The app's logic — see below. |
| `sfj_*.json`           | Local copy of the data, useful as backup. |
| `new Prayer cells list MAR 2026 updated.pdf` | A sample printed report in PDF form. |

### The files inside `js/` (for the technically curious)

| File | Purpose |
|------|---------|
| `config.js` | Defines the six collections and their fields. |
| `api.js`    | Connects to jsonbin.io to read and save data. |
| `auth.js`   | Handles signing in, roles, users, passwords. |
| `login.js`  | Logic behind the login page. |
| `app.js`    | Logic behind the Manager screen. |
| `stats.js`  | Builds the text report. |
| `dashboard.js` | Builds the numbers and charts. |
| `pdf.js`    | Creates the downloadable PDF report. |
| `chart.umd.js`, `html2canvas.min.js`, `jspdf.umd.min.js` | Ready-made helper libraries used by the app. |

---

## A note for the admins

- **Where is the data key?** The app connects to jsonbin.io with a **master key**,
  which is listed in the file `js/api.js`. Anyone who can see that file and the
  person's browser could view the data, so treat the key like a password and do not
  share it. If you ever need extra safety, contact someone technical to move the key
  to a more private place.
- **Default sign-in:** check with the person who set up the app for the starting
  admin username and password, and change it soon after your first sign-in.

---

## Questions?

Ask whoever in the SFJ team manages this app — they can add users, fix problems and
answer questions about the data.