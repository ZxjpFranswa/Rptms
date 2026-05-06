# Municipal Property Registration & Record Management System (RPTMS)

## Project Description
This system is designed to manage property records within a municipality. It streamlines the process of property,
The goal is to improve efficiency, accuracy, and accessibility of property data for local government units (LGUs).

---

## Tech Stack
- **Frontend:** Vue.js + Tailwind CSS
- **Backend:** Laravel (PHP Framework)
- **Database:** MySQL
- **Authentication:** JWT + RBAC
- **Charts & Reports:** Chart.js
- **Development Environment:** XAMPP

---

## Installation Guide

### 1. Clone the Repository
```bash
git clone https://github.com/rptms---pm.git
cd rptms---pm

2. Backend Setup (Laravel)
cd backend
composer install
cp .env.example .env
php artisan key:generate

3. Configure Database
Open .env
Set:
DB_DATABASE=your_db
DB_USERNAME=root
DB_PASSWORD=

4. Run Migrations
php artisan migrate

5. Start Backend Server
php artisan serve

6. Frontend Setup (Vue)
cd frontend
npm install
npm run dev

Team Member (RPTMS)
Payago, Joseph Francois S. - Leader
Abellano, Vince A - Member
Julia, Vincent L - Member

