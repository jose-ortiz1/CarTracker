# CarTracker 🚗📊

CarTracker is a full-stack vehicle management application designed to help users effortlessly track vehicle maintenance, services, reminders, and odometer history — all in one centralized place.

## 🧩 Project Structure

```
CarTrackerMain/
│
├── CarTracker/          # Angular Frontend
│
├── CarTrackerBackend/   # Node.js + Express Backend with MySQL
```

---

## 🔧 Features

- 🔐 **User Authentication** (Sign Up / Sign In)
- 🚘 **Vehicle Management** (Add, Edit, Delete)
- 🛠️ **Service History Logs**
- ⏰ **Maintenance Reminders**
- 📈 **Odometer Updates**
- 📷 **Vehicle Image Upload**
- 📊 **Dashboard Overview**
- ✅ **Responsive UI** with Angular + Bootstrap
- 🔒 **Role-based Access Control (RBAC)** *(future enhancement)*

---

## 🛠️ Tech Stack

### Frontend:
- Angular (Standalone Components)
- Bootstrap 5
- TypeScript

### Backend:
- Node.js
- Express
- MySQL
- Multer (for image uploads)
- CORS + dotenv

---

## 💾 Database Design

- Users
- Vehicles
- Service History
- Reminders
- Service Types *(for icons & consistent tracking)*

[✔️ ER Diagram PDF here ()](./Docs/CarTracker-ERDiagram.pdf)

---

## 🚀 Getting Started

### Backend (Express API)

```bash
cd CarTrackerBackend
npm install
node index.js
```

### Frontend (Angular App)

```bash
cd CarTracker
npm install
ng serve
```

> Make sure your MySQL server is running and configured in the `.env` file.


## 🙋‍♂️ Author

**Jose Luis Ortiz**  
📧 joseluis_0396@hotmail.com  
🔗 [LinkedIn] (https://www.linkedin.com/in/joseluisortizortiz96/) | [Portfolio](WORKING ON)

---
