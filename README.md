# 🌌 Celestial Gatherings

Celestial Gatherings is a **space-themed event management platform** that makes it easy to create, share, and join events under the stars. Built with **Node.js, Express.js, MongoDB Atlas, and EJS**, it follows the MVC pattern and provides a smooth, secure experience for both event hosts and guests.  

The app combines **robust backend functionality** with a **clean, responsive UI/UX**, giving users everything they need to plan astronomy meetups, science talks, watch parties, or any gathering that feels *out of this world*.

🔗 **Live Demo:** [celestialgatherings.com](https://www.celestialgatherings.com)  
>📌 *Note: Demo resets daily.*

Want to explore without signing up?  
Use the following demo credentials:

- **Email:** `johndoe2@gmail.com`  
- **Password:** `JaaL42$Aa`  

---

## ✨ Core Functionality

- **Event Management**  
  Create, edit, and manage events with full CRUD capabilities. Each event includes title, category, location, description, start/end dates, and optional image.

- **RSVP System**  
  Registered users can RSVP `YES / NO / MAYBE`. Hosts are prevented from RSVPing to their own events to keep data clean and meaningful.

- **Authentication & Profiles**  
  Secure sign-up and login with session-based auth. Logged-in users can view their profile, hosted events, and RSVPs.

- **Image Hosting**  
  Upload event images via **Cloudinary** (with Multer). If no image is uploaded, a placeholder is used.

- **User Feedback**  
  Flash messages and custom error pages provide clear guidance for success, warning, and error states.

- **Responsive UI/UX**  
  Space-inspired theme with accessible forms, visible focus states, and navigation that adapts to login state.

---

## 🛠️ Tech Stack

- **Frontend**: EJS templates, Bootstrap 4, custom CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas with Mongoose
- **Authentication**: `express-session` + `connect-mongo` session storage
- **File Uploads**: Multer + Cloudinary (`multer-storage-cloudinary`)
- **Validation & Security**: express-validator, validator, Helmet, express-rate-limit, bcryptjs
- **Performance & Logging**: compression, morgan
- **Utilities**: Luxon (date/time), he (HTML entity encoding)

---

## 🔐 Authentication & Authorization

- **Guests** can:
  - Browse events

- **Registered Users** can:
  - Sign up / log in securely
  - RSVP to events
  - Host new events
  - Edit or delete events they created
  - Manage RSVPs

- **Authorization** middleware ensures only event hosts can modify their own events.

---

## 🧑‍🎨 UI/UX

- **Space-inspired theme** with deep blues and cosmic accents  
- **Accessible forms** with visible focus states, proper input validation, and keyboard-friendly navigation  
- **Dynamic header navigation**: changes based on login state (Sign Up/Login vs. Profile/New Event/Logout)  
- **Custom error views**: informative 400, 401, 404, and 500 pages  
- **Responsive layouts**: looks great on desktop, tablet, and mobile

---

## 🧩 Design System

- Shared style variables in one place (colors, spacing, corners, shadows, type)
- Consistent hover/active/focus states across main nav and account links
- Text scales smoothly on all screens; clean spacing; sticky footer; no layout shift

---

## ♿ Accessibility
- Full keyboard support: clear focus outline + "skip to content" link
- Semantic landmarks (header, nav, main, footer), time elements, meaningful headings
- Forms announce errors; labels tied to inputs; status messages are announced
- Large, readable text and strong color contrast (meets WCAG AA level)
- Respects "Reduce Motion" preference

---

## 🧪 Validation & Error Handling

- Uses **express-validator** to validate/sanitize form input  
- Passwords are hashed securely with **bcrypt** before storage  
- Friendly error pages for:
  - Invalid IDs  
  - Unauthorized access  
  - Missing resources  
  - Server/database errors

---

## 📚 Key Libraries

- Backend: `express`, `mongoose`, `express-session`, `connect-mongo`
- Auth/Security: `bcryptjs`, `express-rate-limit`, `helmet`, `validator`
- File Uploads: `multer`, `multer-storage-cloudinary`, `cloudinary`
- Validation/Formatting: `express-validator`, `luxon`, `he`
- UX/Feedback: `connect-flash`
- Performance/Logging: `compression`, `morgan`

---

## 🧱 Project Structure (MVC)
This codebase follows the Model-View-Controller (MVC) pattern. This keeps the app maintainable, testable, and easy to extend.

- **Models (Mongoose):** data schema + validation.
- **Views (EJS):** server-rendered HTML templates.
- **Controllers (Express):** request in → response out.
- **Routes:** HTTP method + path → controller.
- **Middleware:** pre-route logic (auth/sessions/logging).

```bash
├─ app.js                         #app entrypoint: Express config, sessions, MongoDB, routes, views
├─ middlewares.js                 #auth/role checks (isAuthenticated, isGuest, isHost/isNotHost)
├─ controllers/                   #controllers (request handlers)
│  ├─ mainController.js           #home/about/contact
│  ├─ userController.js           #auth, profile
│  └─ eventController.js          #event CRUD, RSVP
├─ models/                        #models (Mongoose schemas)
│  ├─ user.js
│  ├─ eventModel.js
│  └─ rsvp.js
├─ routes/                        #express routers
│  ├─ mainRoutes.js
│  ├─ userRoutes.js
│  └─ eventRoutes.js
├─ views/                         #views (EJS templates)
│  ├─ about.ejs
│  ├─ contact.ejs -
│  ├─ edit.ejs -
│  ├─ error.ejs
│  ├─ event.ejs -
│  ├─ events.ejs
│  ├─ index.ejs
│  ├─ login.ejs
│  ├─ newEvent.ejs
│  ├─ profile.ejs
│  ├─ signup.ejs -
│  └─ partials/                   #shared UI
│     ├─ header.ejs
│     ├─ footer.ejs
│     └─ nav.ejs
├─ public/                        #static assets served by Express
│  ├─ css/
│  ├─ images/
│  └─ javascript/                 #client-side scripts
├─ package.json
└─ package-lock.json
```
---

## 🚀 Getting Started (Local Dev)

1) Clone repository

```bash
git clone https://github.com/yourusername/celestial-gatherings.git
cd celestial-gatherings
```

2) Install dependencies

```bash
npm install
```

3) Create a .env file with your keys

```bash
MONGODB_URI=...
SECRET_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_URL=...
```

4) Run the app

```bash
npm start
```

5) Visit: http://localhost:3000

---

## 📜 License
This project is licensed under the MIT License. See the [License](./LICENSE) file for details.

## If you find this project useful, consider giving it a star! ⭐