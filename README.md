# 🎶 Sisi Arundathee – Official Event Website

A modern, interactive web platform built for the university musical event **Sisi Arundathee**, designed with a **time travel theme**.
The website showcases event details, memories, sponsorships, and includes a **teaser puzzle system** to unlock the main experience.

---

## 🚀 Tech Stack

* **Next.js (App Router)**
* **React + TypeScript**
* **Tailwind CSS**
* **Firebase (Firestore + Storage + Auth)**

---

## 🌐 Features

### 🎭 Main Website

* Hero section with futuristic design
* Event introduction and history
* Timeline of upcoming events
* Memories gallery (photos & videos)
* Sponsorship showcase
* Team members section

---

### 🧩 Teaser Puzzle System

* Interactive terminal-style interface
* Time-travel themed puzzles
* Hidden clues across media
* Unlock mechanism for main event content

---

### 🛠️ Admin Dashboard

* Manage timeline events
* Upload memories (images/videos)
* Manage sponsors
* Secure access (restricted to admins)

---

## 📁 Project Structure

```bash
src/
  app/              # Routing (pages)
  components/       # UI & sections
  services/         # Data fetching logic
  lib/firebase/     # Firebase config
  types/            # TypeScript types
  data/             # Static data (team)
```

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/sisi-arundathee.git
cd sisi-arundathee
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Setup environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

---

### 4. Run the development server

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

---

## 🌿 Git Workflow

* `main` → production-ready code
* `dev` → development branch
* `feature/*` → individual features

Example:

```bash
git checkout -b feature/timeline-section
```

---

## 👥 Team Collaboration

* Do not push directly to `main`
* Always create pull requests to `dev`
* Follow commit conventions:

```bash
feat: add timeline section
fix: memory loading bug
```

---

## 🔐 Security Notes

* Firebase rules restrict write access to admins only
* `.env.local` is not committed
* Admin dashboard is protected via authentication

---

## 🎯 Future Enhancements

* Ticket booking system
* Artist reveal system
* Advanced puzzle stages
* Real-time updates

---

## 📌 Project Status

🚧 Currently in development

---

## 🤝 Contributing

This is a team project. Follow the established structure and workflow when contributing.

---

## 📜 License

This project is for university event purposes.
