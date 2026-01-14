# RESUMAID - Resume Builder & ATS Scanner

## Overview

Resumaid is a secure and modern **MERN stack** web application that allows users to:

- Upload their resumes in `.docx` format for **ATS (Applicant Tracking System)** analysis
- View personalized feedback and score
- Securely manage their profile with sensitive information encrypted in the database



## Features

### User Authentication

- Register and login securely
- Enforced **strong password policy** (uppercase, symbols, digits, min length 16)
- Passwords are **hashed with bcrypt** using 12 salt rounds

### Resume Builder

- Fill in resume data via profile sections (skills, education, projects, etc.)
- Select templates for resume generation

### ATS Scanner

- Upload a `.docx` resume
- Parsed into JSON and scanned against key sections like skills, summary, education, etc.
- Resume data is also **encrypted** before saving
- Score and feedback shown on the frontend

### Profile Management

- View and update personal information (email, phone, address, etc.)


## Technologies Used

- **MongoDB** - Database
- **Express.js** - Backend API
- **React.js** - Frontend UI
- **Node.js** - JavaScript runtime
- **bcryptjs** - Password hashing
---
## Installation (For Development)

## 1. Clone the repository

$ git clone

## 2. Navigate to root directory

$ cd Resumaid

## 3. Install backend dependencies

$ npm install

## 4. Navigate to client and install frontend dependencies

$ cd client && npm install && cd ..

## 5. Create .env file in root (Do NOT share this file)

- Mention all the secret keys that are required
- For example - MONGODB_URI=your_mongodb_uri

## 6. Start backend and frontend in dev mode

$ npm run dev

---
