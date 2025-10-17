const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Zeeshan@123',
    database: process.env.DB_NAME || 'ai_data_warehouse',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testDatabaseConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully!');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

// API endpoint to check database status
app.get('/api/database-status', async (req, res) => {
    const isConnected = await testDatabaseConnection();
    res.json({ connected: isConnected });
});

// API endpoint to get data from database
app.get('/api/hello', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT NOW() as current_time');
        res.json({ 
            message: 'Hello World from backend!',
            timestamp: rows[0].current_time,
            database: 'ai_data_warehouse'
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Database query failed',
            message: error.message 
        });
    }
});

// API endpoint to get all users
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT user_id, name, email, country, gender, 
                   registration_date, last_login_date 
            FROM users ORDER BY registration_date DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch users',
            message: error.message 
        });
    }
});

// API endpoint to get all transactions
app.get('/api/transactions', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT t.transaction_id, t.user_id, t.product_id, t.purchase_date, 
                   t.amount, t.payment_method, u.name as user_name, p.product_name
            FROM transactions t
            LEFT JOIN users u ON t.user_id = u.user_id
            LEFT JOIN products p ON t.product_id = p.product_id
            ORDER BY t.purchase_date DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch transactions',
            message: error.message 
        });
    }
});

// API endpoint to get all products
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT product_id, product_name, category, price 
            FROM products ORDER BY category, product_name
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch products',
            message: error.message 
        });
    }
});

// API endpoint to get all support tickets
app.get('/api/support-tickets', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT st.ticket_id, st.user_id, st.ticket_date, st.issue_type, 
                   st.status, u.name as user_name
            FROM support_tickets st
            LEFT JOIN users u ON st.user_id = u.user_id
            ORDER BY st.ticket_date DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch support tickets',
            message: error.message 
        });
    }
});

// API endpoint to get all resumes
app.get('/api/resumes', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT id, name, email, original_filename, file_size, 
                   score, uploaded_at
            FROM resumes ORDER BY uploaded_at DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch resumes',
            message: error.message 
        });
    }
});

// API endpoint to get all sessions
app.get('/api/sessions', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT s.session_id, s.user_id, s.login_time, s.logout_time, 
                   s.device, u.name as user_name
            FROM sessions s
            LEFT JOIN users u ON s.user_id = u.user_id
            ORDER BY s.login_time DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch sessions',
            message: error.message 
        });
    }
});

// API endpoint to get all submissions
app.get('/api/submissions', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT id, name, email, timestamp 
            FROM submissions ORDER BY timestamp DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch submissions',
            message: error.message 
        });
    }
});

// API endpoint for users registered per month (Bar Chart)
app.get('/api/analytics/users-per-month', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                DATE_FORMAT(registration_date, '%Y-%m') as month,
                COUNT(*) as count
            FROM users
            WHERE registration_date IS NOT NULL
            GROUP BY DATE_FORMAT(registration_date, '%Y-%m')
            ORDER BY month DESC
            LIMIT 12
        `);
        res.json(rows.reverse()); // Reverse to show chronological order
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch users per month data',
            message: error.message
        });
    }
});

// API endpoint for user distribution by country (Pie Chart)
app.get('/api/analytics/users-by-country', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                COALESCE(country, 'Unknown') as country,
                COUNT(*) as count
            FROM users
            GROUP BY country
            ORDER BY count DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch users by country data',
            message: error.message
        });
    }
});

// API endpoint for activity trends over time (Line Chart)
app.get('/api/analytics/activity-trends', async (req, res) => {
    try {
        // Get user registrations over time
        const [userTrends] = await pool.execute(`
            SELECT
                DATE_FORMAT(registration_date, '%Y-%m-%d') as date,
                COUNT(*) as user_count
            FROM users
            WHERE registration_date IS NOT NULL
            GROUP BY DATE_FORMAT(registration_date, '%Y-%m-%d')
            ORDER BY date DESC
            LIMIT 30
        `);

        // Get transaction activity over time
        const [transactionTrends] = await pool.execute(`
            SELECT
                DATE_FORMAT(purchase_date, '%Y-%m-%d') as date,
                COUNT(*) as transaction_count,
                SUM(amount) as total_amount
            FROM transactions
            WHERE purchase_date IS NOT NULL
            GROUP BY DATE_FORMAT(purchase_date, '%Y-%m-%d')
            ORDER BY date DESC
            LIMIT 30
        `);

        res.json({
            user_trends: userTrends.reverse(),
            transaction_trends: transactionTrends.reverse(),
            revenue_trends: transactionTrends.map(t => ({
                date: t.date,
                total_amount: parseFloat(t.total_amount) || 0
            })).reverse()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch activity trends data',
            message: error.message
        });
    }
});

// API endpoint for recent entries (Table Widget)
app.get('/api/analytics/recent-entries', async (req, res) => {
    try {
        // Get recent users
        const [recentUsers] = await pool.execute(`
            SELECT user_id, name, email, registration_date, 'user' as type
            FROM users
            ORDER BY registration_date DESC
            LIMIT 5
        `);

        // Get recent transactions
        const [recentTransactions] = await pool.execute(`
            SELECT t.transaction_id, u.name as user_name, p.product_name, t.amount, t.purchase_date, 'transaction' as type
            FROM transactions t
            LEFT JOIN users u ON t.user_id = u.user_id
            LEFT JOIN products p ON t.product_id = p.product_id
            ORDER BY t.purchase_date DESC
            LIMIT 5
        `);

        // Get recent support tickets
        const [recentTickets] = await pool.execute(`
            SELECT st.ticket_id, u.name as user_name, st.issue_type, st.status, st.ticket_date, 'ticket' as type
            FROM support_tickets st
            LEFT JOIN users u ON st.user_id = u.user_id
            ORDER BY st.ticket_date DESC
            LIMIT 5
        `);

        // Combine and sort all recent entries
        const allEntries = [
            ...recentUsers.map(u => ({ ...u, sort_date: u.registration_date })),
            ...recentTransactions.map(t => ({ ...t, sort_date: t.purchase_date })),
            ...recentTickets.map(t => ({ ...t, sort_date: t.ticket_date }))
        ].sort((a, b) => new Date(b.sort_date) - new Date(a.sort_date)).slice(0, 10);

        res.json(allEntries);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch recent entries data',
            message: error.message
        });
    }
});

// API endpoint to get a single user (GET)
app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.execute('SELECT * FROM users WHERE user_id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch user',
            message: error.message
        });
    }
});

// API endpoint to add a new user (POST)
app.post('/api/users', async (req, res) => {
    try {
        const { name, email, country, gender } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                error: 'Name and email are required fields'
            });
        }

        const [result] = await pool.execute(`
            INSERT INTO users (name, email, country, gender, registration_date)
            VALUES (?, ?, ?, ?, NOW())
        `, [name, email, country || null, gender || null]);

        res.status(201).json({
            message: 'User created successfully',
            user_id: result.insertId
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({
                error: 'Email already exists'
            });
        } else {
            res.status(500).json({
                error: 'Failed to create user',
                message: error.message
            });
        }
    }
});

// API endpoint to update a user (PUT)
app.put('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, country, gender } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                error: 'Name and email are required fields'
            });
        }

        const [result] = await pool.execute(`
            UPDATE users
            SET name = ?, email = ?, country = ?, gender = ?
            WHERE user_id = ?
        `, [name, email, country || null, gender || null, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.json({
            message: 'User updated successfully'
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({
                error: 'Email already exists'
            });
        } else {
            res.status(500).json({
                error: 'Failed to update user',
                message: error.message
            });
        }
    }
});

// API endpoint to delete a user (DELETE)
app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute('DELETE FROM users WHERE user_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.json({
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to delete user',
            message: error.message
        });
    }
});

// API endpoint to get all users
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM users ORDER BY registration_date DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch users',
            message: error.message
        });
    }
});

// API endpoint to get all transactions
app.get('/api/transactions', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT t.*, u.name as user_name, p.product_name
            FROM transactions t
            LEFT JOIN users u ON t.user_id = u.user_id
            LEFT JOIN products p ON t.product_id = p.product_id
            ORDER BY t.purchase_date DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch transactions',
            message: error.message
        });
    }
});

// API endpoint to get all products
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM products ORDER BY product_name');
        res.json(rows);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch products',
            message: error.message
        });
    }
});

// API endpoint to get all support tickets
app.get('/api/support-tickets', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT st.*, u.name as user_name
            FROM support_tickets st
            LEFT JOIN users u ON st.user_id = u.user_id
            ORDER BY st.ticket_date DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch support tickets',
            message: error.message
        });
    }
});

// API endpoint to get all sessions
app.get('/api/sessions', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT s.*, u.name as user_name
            FROM sessions s
            LEFT JOIN users u ON s.user_id = u.user_id
            ORDER BY s.login_time DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch sessions',
            message: error.message
        });
    }
});

// API endpoint to get all submissions
app.get('/api/submissions', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM submissions ORDER BY submission_date DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch submissions',
            message: error.message
        });
    }
});

// API endpoint for dashboard statistics
app.get('/api/dashboard-stats', async (req, res) => {
    try {
        const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
        const [transactionCount] = await pool.execute('SELECT COUNT(*) as count FROM transactions');
        const [productCount] = await pool.execute('SELECT COUNT(*) as count FROM products');
        const [ticketCount] = await pool.execute('SELECT COUNT(*) as count FROM support_tickets');
        const [sessionCount] = await pool.execute('SELECT COUNT(*) as count FROM sessions');

        // Get total revenue
        const [revenue] = await pool.execute('SELECT SUM(amount) as total FROM transactions');

        res.json({
            users: userCount[0].count,
            transactions: transactionCount[0].count,
            products: productCount[0].count,
            support_tickets: ticketCount[0].count,
            sessions: sessionCount[0].count,
            total_revenue: revenue[0].total || 0
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch dashboard statistics',
            message: error.message
        });
    }
});

// Analytics API endpoints
// API endpoint for users registered per month (Bar Chart)
app.get('/api/analytics/users-per-month', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                DATE_FORMAT(registration_date, '%Y-%m') as month,
                COUNT(*) as count
            FROM users
            WHERE registration_date IS NOT NULL
            GROUP BY DATE_FORMAT(registration_date, '%Y-%m')
            ORDER BY month DESC
            LIMIT 12
        `);
        res.json(rows.reverse()); // Reverse to show chronological order
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch users per month data',
            message: error.message
        });
    }
});

// API endpoint for user distribution by country (Pie Chart)
app.get('/api/analytics/users-by-country', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                COALESCE(country, 'Unknown') as country,
                COUNT(*) as count
            FROM users
            GROUP BY country
            ORDER BY count DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch users by country data',
            message: error.message
        });
    }
});

// API endpoint for activity trends over time (Line Chart)
app.get('/api/analytics/activity-trends', async (req, res) => {
    try {
        // Get user registrations over time
        const [userTrends] = await pool.execute(`
            SELECT
                DATE_FORMAT(registration_date, '%Y-%m-%d') as date,
                COUNT(*) as user_count
            FROM users
            WHERE registration_date IS NOT NULL
            GROUP BY DATE_FORMAT(registration_date, '%Y-%m-%d')
            ORDER BY date DESC
            LIMIT 30
        `);

        // Get transaction activity over time
        const [transactionTrends] = await pool.execute(`
            SELECT
                DATE_FORMAT(purchase_date, '%Y-%m-%d') as date,
                COUNT(*) as transaction_count,
                SUM(amount) as total_amount
            FROM transactions
            WHERE purchase_date IS NOT NULL
            GROUP BY DATE_FORMAT(purchase_date, '%Y-%m-%d')
            ORDER BY date DESC
            LIMIT 30
        `);

        res.json({
            user_trends: userTrends.reverse(),
            transaction_trends: transactionTrends.reverse(),
            revenue_trends: transactionTrends.map(t => ({
                date: t.date,
                total_amount: parseFloat(t.total_amount) || 0
            })).reverse()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch activity trends data',
            message: error.message
        });
    }
});

// API endpoint for recent entries (Table Widget)
app.get('/api/analytics/recent-entries', async (req, res) => {
    try {
        // Get recent users
        const [recentUsers] = await pool.execute(`
            SELECT user_id, name, email, registration_date, 'user' as type
            FROM users
            ORDER BY registration_date DESC
            LIMIT 5
        `);

        // Get recent transactions
        const [recentTransactions] = await pool.execute(`
            SELECT t.transaction_id, u.name as user_name, p.product_name, t.amount, t.purchase_date, 'transaction' as type
            FROM transactions t
            LEFT JOIN users u ON t.user_id = u.user_id
            LEFT JOIN products p ON t.product_id = p.product_id
            ORDER BY t.purchase_date DESC
            LIMIT 5
        `);

        // Get recent support tickets
        const [recentTickets] = await pool.execute(`
            SELECT st.ticket_id, u.name as user_name, st.issue_type, st.status, st.ticket_date, 'ticket' as type
            FROM support_tickets st
            LEFT JOIN users u ON st.user_id = u.user_id
            ORDER BY st.ticket_date DESC
            LIMIT 5
        `);

        // Combine and sort all recent entries
        const allEntries = [
            ...recentUsers.map(u => ({ ...u, sort_date: u.registration_date })),
            ...recentTransactions.map(t => ({ ...t, sort_date: t.purchase_date })),
            ...recentTickets.map(t => ({ ...t, sort_date: t.ticket_date }))
        ].sort((a, b) => new Date(b.sort_date) - new Date(a.sort_date)).slice(0, 10);

        res.json(allEntries);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch recent entries data',
            message: error.message
        });
    }
});

// API endpoint for product performance analytics (Bar Chart)
app.get('/api/analytics/product-performance', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                p.product_name,
                p.category,
                COUNT(t.transaction_id) as sales_count,
                SUM(t.amount) as total_revenue,
                AVG(t.amount) as avg_order_value,
                p.price as unit_price
            FROM products p
            LEFT JOIN transactions t ON p.product_id = t.product_id
            GROUP BY p.product_id, p.product_name, p.category, p.price
            ORDER BY total_revenue DESC, sales_count DESC
            LIMIT 15
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch product performance data',
            message: error.message
        });
    }
});

// API endpoint for website load time analytics (Bar Chart)
app.get('/api/analytics/website-load-times', async (req, res) => {
    try {
        // Simulate website load time data for different pages
        const loadTimeData = [
            { page: 'Dashboard', load_time_ms: 245, avg_load_time_ms: 280, requests: 45, page_size_kb: 512 },
            { page: 'Analytics', load_time_ms: 320, avg_load_time_ms: 350, requests: 62, page_size_kb: 789 },
            { page: 'Users Management', load_time_ms: 189, avg_load_time_ms: 220, requests: 38, page_size_kb: 445 },
            { page: 'Transactions', load_time_ms: 267, avg_load_time_ms: 295, requests: 51, page_size_kb: 623 },
            { page: 'Products', load_time_ms: 198, avg_load_time_ms: 235, requests: 42, page_size_kb: 478 },
            { page: 'Support Tickets', load_time_ms: 223, avg_load_time_ms: 260, requests: 47, page_size_kb: 556 },
            { page: 'Sessions', load_time_ms: 156, avg_load_time_ms: 190, requests: 33, page_size_kb: 387 },
            { page: 'Submissions', load_time_ms: 178, avg_load_time_ms: 215, requests: 39, page_size_kb: 423 }
        ];

        res.json(loadTimeData);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch website load time data',
            message: error.message
        });
    }
});

// API endpoint for product categories performance (Pie Chart)
app.get('/api/analytics/product-categories', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                COALESCE(p.category, 'Uncategorized') as category,
                COUNT(t.transaction_id) as sales_count,
                SUM(t.amount) as total_revenue
            FROM products p
            LEFT JOIN transactions t ON p.product_id = t.product_id
            GROUP BY p.category
            ORDER BY total_revenue DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch product categories data',
            message: error.message
        });
    }
});

// Serve static files
app.use(express.static(__dirname));

// Root route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Initialize database and start server
async function startServer() {
    console.log('🚀 Starting Hello World server...');
    
    // Test database connection on startup
    await testDatabaseConnection();
    
    app.listen(PORT, () => {
        console.log(`🌟 Server running on http://localhost:${PORT}`);
        console.log(`📁 Serving static files from: ${__dirname}`);
        console.log(`🔗 Access your website at: http://localhost:${PORT}`);
    });
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n👋 Shutting down server gracefully...');
    await pool.end();
    process.exit(0);
});

startServer().catch(console.error);
