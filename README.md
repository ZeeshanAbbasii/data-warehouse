# Hello World Website

A simple website with "Hello World" message, backend server, and MySQL database connectivity.

## Features

- ✅ Beautiful "Hello World" landing page
- ✅ Node.js backend server with Express
- ✅ MySQL database connection
- ✅ Real-time database status checking
- ✅ Responsive design with modern CSS

## Database Configuration

The application is configured to connect to MySQL database with the following credentials:

- **Host**: 127.0.0.1
- **Port**: 3306
- **Username**: root
- **Password**: Zeeshan@123
- **Database**: ai_data_warehouse

## Prerequisites

1. **Node.js** (v14 or higher)
2. **MySQL Server** running on localhost:3306
3. **Database**: `ai_data_warehouse` must exist in MySQL

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create Database** (if it doesn't exist)
   ```sql
   CREATE DATABASE ai_data_warehouse;
   ```

3. **Start the Server**
   ```bash
   npm start
   ```

4. **Access the Website**
   Open your browser and navigate to: `http://localhost:3000`

## API Endpoints

- `GET /` - Serves the main HTML page
- `GET /api/database-status` - Check database connection status
- `GET /api/hello` - Get hello message with database timestamp

## File Structure

```
/Users/zeeshanabbasi/Desktop/lol/
├── index.html      # Main HTML page
├── style.css       # CSS styles
├── script.js       # Frontend JavaScript
├── server.js       # Backend server
├── .env           # Environment variables
└── package.json   # Dependencies
```

## Development

To run in development mode:
```bash
npm run dev
```

## Troubleshooting

1. **Database Connection Issues**:
   - Ensure MySQL server is running on port 3306
   - Verify database `ai_data_warehouse` exists
   - Check database credentials in `.env` file

2. **Port Already in Use**:
   - Change the PORT in `.env` file or set PORT environment variable

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL with mysql2 driver
- **Other**: CORS for cross-origin requests
# Data Warehouse
