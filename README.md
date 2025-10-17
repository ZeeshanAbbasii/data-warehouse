# Data Warehouse Dashboard

A comprehensive, full-stack business intelligence dashboard built with Node.js, Express, MySQL, and modern web technologies. This application provides real-time analytics, user management, and data visualization for business operations.

## Features

### Core Functionality
- **Interactive Dashboard** - Real-time business metrics and KPIs
- **User Management** - Complete CRUD operations for user administration
- **Transaction Tracking** - Financial transaction monitoring and analytics
- **Product Management** - Product catalog with performance analytics
- **Support System** - Customer support ticket management
- **Session Monitoring** - User activity and session tracking
- **Form Submissions** - Contact form and submission management

### Advanced Analytics
- **Multi-Chart Visualizations** - 6 different chart types for data insights
- **Product Performance** - Revenue and sales analytics by product
- **Geographic Analytics** - User distribution by country
- **Time-Series Analysis** - Activity trends over time
- **Performance Monitoring** - Website load time analytics
- **Real-time Updates** - Auto-refresh every 30 seconds

### Technical Excellence
- **Database Integration** - Full MySQL integration with connection pooling
- **Modern UI/UX** - Dark theme with responsive design
- **Mobile-Friendly** - Works across all device sizes
- **Performance Optimized** - Efficient queries and caching
- **Error Handling** - Comprehensive error management
- **Live Updates** - Real-time data synchronization

## Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Relational database
- **mysql2** - MySQL client for Node.js

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with dark theme
- **JavaScript (ES6+)** - Client-side logic
- **Chart.js** - Data visualization library

### Development Tools
- **RESTful APIs** - Well-structured API design
- **Connection Pooling** - Database connection optimization
- **Error Handling** - Comprehensive error management
- **Responsive Design** - Mobile-first approach

## Prerequisites

Before running this application, make sure you have:

- **Node.js** (v14 or higher)
- **MySQL Server** (v5.7 or higher)
- **npm** or **yarn** package manager

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd data-warehouse-dashboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup

#### Create Database
```sql
CREATE DATABASE data_warehouse;
```

#### Import Schema
Run the SQL script to create all necessary tables:
```bash
mysql -u root -p data_warehouse < database/schema.sql
```

#### Environment Variables
Create a `.env` file in the root directory:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=data_warehouse
PORT=3000
```

### 4. Seed Database (Optional)
```bash
mysql -u root -p data_warehouse < database/seed.sql
```

### 5. Start the Application
```bash
npm start
# or
node server.js
```

### 6. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## Usage Guide

### Dashboard Sections

#### Dashboard (Overview)
- View key business metrics
- Monitor recent activity
- Access quick navigation to all sections

#### Users Management
- **Add Users:** Click "Add User" → Fill form → Submit
- **Edit Users:** Click edit icon → Modify details → Save
- **Delete Users:** Click delete icon → Confirm deletion
- **Search/Filter:** Filter users by country

#### Analytics
- **6 Chart Types:** Bar, doughnut, line charts
- **Product Performance:** Revenue by product analysis
- **Geographic Insights:** User distribution by country
- **Activity Trends:** Historical data patterns
- **Website Performance:** Load time monitoring

#### Transactions
- View all financial transactions
- Filter by payment method
- Track purchase history

#### Products
- Product catalog management
- Category-based organization
- Performance analytics

#### Support Tickets
- Customer support tracking
- Status management
- Priority handling

### Data Operations

#### Adding New Users
1. Navigate to Users section
2. Click "Add User" button
3. Fill in the form (Name and Email are required)
4. Select Country and Gender (optional)
5. Click "Add User" to save

#### Viewing Analytics
1. Navigate to Analytics section
2. Charts load automatically with real-time data
3. Hover over chart elements for detailed tooltips
4. Charts update every 30 seconds

## API Endpoints

### Core Data APIs
- `GET /api/users` - Retrieve all users
- `GET /api/transactions` - Retrieve all transactions
- `GET /api/products` - Retrieve all products
- `GET /api/support-tickets` - Retrieve all support tickets
- `GET /api/sessions` - Retrieve all user sessions
- `GET /api/submissions` - Retrieve all form submissions

### Analytics APIs
- `GET /api/analytics/users-per-month` - User registration trends
- `GET /api/analytics/users-by-country` - Geographic distribution
- `GET /api/analytics/activity-trends` - Activity over time
- `GET /api/analytics/product-performance` - Product revenue analysis
- `GET /api/analytics/product-categories` - Category performance
- `GET /api/analytics/website-load-times` - Performance metrics
- `GET /api/analytics/recent-entries` - Recent activity summary

### Dashboard APIs
- `GET /api/dashboard-stats` - Key business metrics
- `GET /api/database-status` - Database connection status

### User Management APIs
- `GET /api/users/:id` - Get specific user
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Project Structure

```
data-warehouse-dashboard/
├── server.js              # Main application server
├── index.html             # Main dashboard interface
├── dashboard.js           # Frontend JavaScript logic
├── style.css              # Application styling
├── database/
│   ├── schema.sql         # Database schema definition
│   └── seed.sql           # Sample data for testing
├── .env                   # Environment variables
├── package.json           # Node.js dependencies
└── README.md              # This file
```

## Database Schema

### Core Tables
- **users** - User account information
- **transactions** - Financial transaction records
- **products** - Product catalog
- **support_tickets** - Customer support issues
- **sessions** - User session tracking
- **submissions** - Form submission data

### Key Relationships
- Users can have multiple transactions
- Products are linked to transactions
- Support tickets are associated with users
- Sessions track user activity

## Development

### Available Scripts
```bash
npm start      # Start the application
npm install    # Install dependencies
```

### Code Organization
- **Backend Logic:** `server.js` - API routes and database operations
- **Frontend Logic:** `dashboard.js` - Client-side functionality
- **Styling:** `style.css` - Dark theme and responsive design
- **Database:** MySQL with proper indexing for performance

### Best Practices Implemented
- Connection pooling for database efficiency
- Error handling and logging
- Input validation and sanitization
- Responsive design patterns
- Performance optimization techniques

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For support and questions:
- Check the documentation above
- Review API endpoints for integration
- Examine the code structure for customization

## Key Highlights

- **Production-Ready** - Complete business application
- **Real-Time Analytics** - Live data visualization
- **Full-Stack Architecture** - Modern web technologies
- **Database-Driven** - All data from MySQL
- **Responsive Design** - Works on all devices
- **Performance Optimized** - Efficient and scalable
