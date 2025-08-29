# 🌌 Celestial Gatherings

Celestial Gatherings is a **space-themed event management platform** that makes it easy to create, share, and join events under the stars. Built with **Node.js, Express.js, MongoDB Atlas, and EJS**, it follows the MVC pattern and provides a smooth, secure experience for both event hosts and guests.  

The app combines **robust backend functionality** with a **clean, responsive UI/UX**, giving users everything they need to plan astronomy meetups, science talks, watch parties, or any gathering that feels *out of this world*. 🚀

🔗 **Live Demo:** [celestialgatherings.com](https://www.celestialgatherings.com)  

---

## ✨ Core Functionality

- **Event Management**  
  Create, edit, and manage events with full CRUD capabilities. Each event includes title, category, location, description, start/end dates, and optional image.  

- **RSVP System**  
  Guests can RSVP with `YES / NO / MAYBE`. Hosts are prevented from RSVPing to their own events, keeping data clean and meaningful.  

- **Authentication & Profiles**  
  Secure sign-up and login with session-based authentication. Logged-in users can view their profile, hosted events, and RSVPs.  

- **Image Hosting**  
  Upload event images via **Cloudinary** (with Multer). If no image is uploaded, a placeholder is used.  

- **User Feedback**  
  Flash messages and custom error pages provide clear guidance for all success, warning, and error states.  

- **Responsive UI/UX**  
  Designed with usability in mind: a dark space-inspired theme, accessible form styles, visible focus states, and a navigation flow that adapts to whether you're a guest or logged-in user.  

---

## 🛠️ Tech Stack

- **Frontend**: EJS templates, Bootstrap 4, custom CSS (space-inspired theme)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas with Mongoose
- **Authentication**: `express-session` + `connect-mongo` session storage
- **File Uploads**: Multer + Cloudinary
- **Validation & Security**: express-validator, Helmet, express-rate-limit, bcrypt.js
- **Utilities**: Luxon (date/time), he (HTML entity encoding), validator

---

## 🔐 Authentication & Authorization

- **Guests** can:
  - Browse events  
  - RSVP to events  

- **Registered Users** can:
  - Sign up / log in securely  
  - Host new events  
  - Edit or delete events they created  
  - Manage RSVPs  

- **Authorization** middleware ensures that only event hosts can modify their own events.

---

## 🧑‍🎨 UI/UX Design

- **Space-inspired theme** with deep blues and cosmic accents  
- **Accessible forms** with visible focus states, proper input validation, and keyboard-friendly navigation  
- **Dynamic header navigation**: changes based on login state (Sign Up/Login vs. Profile/New Event/Logout)  
- **Custom error views**: informative 400, 401, 404, and 500 pages  
- **Responsive layouts**: looks great on desktop, tablet, and mobile  

---

## 🧪 Validation & Error Handling

- Uses **express-validator** to sanitize and validate form input  
- Passwords are hashed securely with bcrypt before storage  
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

---

## 🧱 Project Structure (MVC)
This codebase follows the Model-View-Controller (MVC) pattern: **Models** define data and rules (Mongoose), **Views** render the UI (EJS), and **Controllers** handle request/response logic. **Routes** map URLs to controller actions, while **middlewares** provide cross-cutting concerns like auth/role checks. This separation keeps the app maintainable, testable, and easy to extend as features grow.
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
│  │  └─ styles.css
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