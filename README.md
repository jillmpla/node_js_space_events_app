# 🌌 Celestial Gatherings

A space-themed full-stack event management web application built with Node.js, Express.js, EJS, and MongoDB Atlas. Designed with the MVC architecture, it allows users to create, view, edit, RSVP to, and manage events with full authentication, image hosting, and a user-friendly UI.

🔗 **Live Demo:** [celestialgatherings.com](https://www.celestialgatherings.com)  

---

## ✨ Features

- **Event Management**: Full CRUD functionality for creating, editing, viewing, and deleting space-related events  
- **RSVP System**: RSVP options with logic to prevent hosts from RSVPing to their own events
- **Authentication & Authorization**: Secure user login, registration, and role-based access control
- **Image Upload**: Cloudinary integration via Multer for storing event images
- **Session Management**: Persistent sessions using `express-session` and `connect-mongo`
- **Flash Messaging**: Feedback messages for success and error states
- **Error Handling**: Custom error pages for common issues (400, 401, 404, 500)
- **Security**: Input validation, rate limiting, secure HTTP headers (Helmet), and XSS prevention
- **Responsive UI**: EJS-based front-end rendered dynamically based on user state

---

## 🛠️ Tech Stack

- **Frontend**: EJS, Bootstrap, HTML, CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: Sessions with MongoDB storage
- **File Uploads**: Multer + Cloudinary

---

## 🔐 Authentication
- Users can register and log in
- Hosts can create/edit/delete events
- Guests can view and RSVP to events

---

## 📸 Cloudinary Integration
- Image uploads are handled through Multer and stored on Cloudinary
- Events can have a custom image or use a default placeholder

---

## 🧪 Validation & Error Handling
- Uses `express-validator` to ensure all form inputs are clean and well-formatted
- All major HTTP errors have custom views with friendly messages

---

## 📚 Key Libraries
- `express`
- `mongoose`
- `cloudinary`
- `multer` / `multer-storage-cloudinary`
- `express-session` / `connect-mongo`
- `express-validator`
- `he` (HTML entity encoding)
- `luxon` (date formatting)
- `helmet` / `express-rate-limit` / `validator`

---

## 📜 License
This project is licensed under the MIT License. See the [License](./LICENSE) file for details.

## If you find this project useful, consider giving it a star! ⭐
