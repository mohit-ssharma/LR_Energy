# LR Energy SCADA Monitoring System

A web-based SCADA monitoring system for biogas plant data visualization.

## 📁 Project Structure

```
/app/
├── frontend/           → React dashboard application
├── php-api/           → PHP REST API for GoDaddy hosting
├── sync-script/       → Python script for SCADA data sync
├── docs/              → Technical documentation
├── memory/            → Project requirements & changelog
└── test_reports/      → Testing results
```

## 🚀 Quick Start

### 1. Local Testing (XAMPP)

```bash
# Copy php-api folder to XAMPP
Copy: /app/php-api/*  →  C:\xampp\htdocs\scada-api\

# Import database schema
Open phpMyAdmin → Create database 'scada_db' → Run schema.sql
```

### 2. Test API

```
http://localhost/scada-api/test.php
```

### 3. Login Credentials

| Role | Email | Password |
|------|-------|----------|
| HEAD_OFFICE | it@lrenergy.in | qwerty |
| MNRE | it1@lrenergy.in | qwerty |

## 📖 Documentation

- [Database Setup](docs/DATABASE_SETUP.md)
- [Sync Architecture](docs/Sync_Doc.md)

## 🔧 Tech Stack

- **Frontend:** React, Tailwind CSS, Chart.js
- **Backend:** PHP REST API
- **Database:** MySQL
- **Sync:** Python (for SCADA communication)
