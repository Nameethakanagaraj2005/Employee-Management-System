# Employee Management System

This project uses the existing React/Vite frontend, Express API, and MySQL database.

## Local setup

1. Configure a root-level `.env` file with the MySQL connection and JWT settings:

   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=employee_management
   JWT_SECRET=replace_with_a_long_random_secret
   PORT=5000
   NODE_ENV=development
   ```

2. In one terminal, initialize the existing schema, seed the local demo users, and start the API:

   ```powershell
   cd backend
   npm install
   npm run init-db
   npm run seed
   npm run dev
   ```

3. In another terminal, start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

   Open the Vite URL shown in the frontend terminal. The frontend expects the API at `http://localhost:5000/api`.

## Development demo accounts

Run `npm run seed` from the backend folder while `NODE_ENV` is not `production`. Passwords are stored as bcrypt hashes. Existing matching accounts are left unchanged, and the demo seeding command refuses to run in production.

| Role | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `admin123` |
| HR Manager | `manager` | `manager123` |
| Employee | `employee` | `employee123` |

These credentials are for local development only. Configure non-demo accounts and a strong, private `JWT_SECRET` before deployment.
