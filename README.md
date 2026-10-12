# Caprae Lead Generation Tool

A full-stack lead management application built with React, Node.js, Express, and MongoDB. It helps users manage leads, search and filter records, update lead statuses, and export lead data to CSV.

## Features

- View leads stored in MongoDB.
- Add new leads with email duplicate validation.
- Search leads.
- Filter leads by industry and status.
- Update lead statuses.
- Calculate lead scores.
- Export lead data to CSV.

## Tech Stack

**Frontend:** React, Vite, JavaScript
**Backend:** Node.js, Express.js
**Database:** MongoDB with Mongoose
**Data Export:** CSV

## Prerequisites

- Node.js and npm
- MongoDB connection
- Git (optional, for cloning the repository)

## Getting Started

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd caprae-lead-tool
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual GitHub repository URL.

### 2. Install frontend dependencies

From the project root:

```bash
npm install
```

### 3. Configure the backend

Open a terminal and navigate to the backend folder:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder and add your MongoDB connection string:

```env
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
```

Use your own connection string locally. **Never commit your `.env` file or database credentials to GitHub.**

### 4. Start the backend

From the `backend` folder, run:

```bash
node server.js
```

The API should be available at:

`http://localhost:5000`

### 5. Start the frontend

Open a second terminal at the project root and run:

```bash
npm run dev
```

Open the local URL displayed in the terminal by Vite.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/leads` | Retrieve leads, with supported search and filters |
| POST | `/api/leads` | Add a lead |
| PATCH | `/api/leads/:id` | Update a lead's status |

## Verification

The following features have been manually tested:

- Lead loading
- Search and industry/status filters
- Adding leads and rejecting duplicate emails
- Status updates persisting after refresh
- CSV export with correct lead data

## Future Improvements

- Deploy the application for public access.
- Improve validation and error messages.
- Add authentication and role-based access if required.

## Author

Developed as a lead generation and management project for the Caprae application process.