// AI Data Warehouse Dashboard JavaScript
class DashboardApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.dataCache = {};
        this.searchTimeouts = {};
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupDatabaseStatus();
        this.loadInitialData();
        this.setupSearchAndFilters();
        this.setupAutoRefresh();
    }

    // Navigation Management
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;

            // Add active class to nav link
            const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }

            // Load data for the section
            this.loadSectionData(sectionName);
        }
    }

    // Database Status Management
    async setupDatabaseStatus() {
        const statusElement = document.getElementById('db-status');

        try {
            const response = await fetch('/api/database-status');
            const data = await response.json();

            if (data.connected) {
                statusElement.className = 'status-indicator connected';
                statusElement.innerHTML = '<i class="fas fa-circle"></i> Database Connected';
            } else {
                statusElement.className = 'status-indicator disconnected';
                statusElement.innerHTML = '<i class="fas fa-circle"></i> Database Disconnected';
            }
        } catch (error) {
            statusElement.className = 'status-indicator disconnected';
            statusElement.innerHTML = '<i class="fas fa-circle"></i> Connection Error';
        }
    }

    // Data Loading Functions
    async loadInitialData() {
        this.showLoadingOverlay();

        try {
            // Load dashboard data first
            await this.loadDashboardData();

            // Load current section data
            await this.loadSectionData(this.currentSection);
        } catch (error) {
            this.showError('Failed to load initial data');
        } finally {
            this.hideLoadingOverlay();
        }
    }

    async loadDashboardData() {
        try {
            const response = await fetch('/api/dashboard-stats');
            const stats = await response.json();

            // Update stats cards
            document.getElementById('total-users').textContent = this.formatNumber(stats.users);
            document.getElementById('total-transactions').textContent = this.formatNumber(stats.transactions);
            document.getElementById('total-revenue').textContent = this.formatCurrency(stats.total_revenue);
            document.getElementById('total-products').textContent = this.formatNumber(stats.products);
            document.getElementById('total-tickets').textContent = this.formatNumber(stats.support_tickets);

            // Load recent activity
            await Promise.all([
                this.loadRecentUsers(),
                this.loadRecentTransactions(),
                this.loadRecentTickets()
            ]);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    async loadRecentUsers() {
        try {
            const users = await this.fetchData('users');
            const recentUsers = users.slice(0, 5);

            const container = document.getElementById('recent-users');
            container.innerHTML = recentUsers.map(user => `
                <div class="activity-item">
                    <span>${user.name}</span>
                    <small>${user.registration_date}</small>
                </div>
            `).join('');
        } catch (error) {
            document.getElementById('recent-users').innerHTML = '<div class="activity-item">Error loading users</div>';
        }
    }

    async loadRecentTransactions() {
        try {
            const transactions = await this.fetchData('transactions');
            const recentTransactions = transactions.slice(0, 5);

            const container = document.getElementById('recent-transactions');
            container.innerHTML = recentTransactions.map(transaction => `
                <div class="activity-item">
                    <span>${transaction.user_name} - ${transaction.product_name}</span>
                    <small>${this.formatCurrency(transaction.amount)}</small>
                </div>
            `).join('');
        } catch (error) {
            document.getElementById('recent-transactions').innerHTML = '<div class="activity-item">Error loading transactions</div>';
        }
    }

    async loadRecentTickets() {
        try {
            const tickets = await this.fetchData('support-tickets');
            const recentTickets = tickets.slice(0, 5);

            const container = document.getElementById('recent-tickets');
            container.innerHTML = recentTickets.map(ticket => `
                <div class="activity-item">
                    <span>${ticket.user_name} - ${ticket.issue_type}</span>
                    <small class="status-${ticket.status.toLowerCase().replace(' ', '-')}">${ticket.status}</small>
                </div>
            `).join('');
        } catch (error) {
            document.getElementById('recent-tickets').innerHTML = '<div class="activity-item">Error loading tickets</div>';
        }
    }

    async loadSectionData(sectionName) {
        switch (sectionName) {
            case 'users':
                await this.loadUsersData();
                break;
            case 'transactions':
                await this.loadTransactionsData();
                break;
            case 'products':
                await this.loadProductsData();
                break;
            case 'tickets':
                await this.loadTicketsData();
                break;
            case 'resumes':
                await this.loadResumesData();
                break;
            case 'sessions':
                await this.loadSessionsData();
                break;
            case 'submissions':
                await this.loadSubmissionsData();
                break;
        }
    }

    async loadUsersData() {
        try {
            const users = await this.fetchData('users');
            this.populateUsersTable(users);
            this.populateUserFilters(users);
        } catch (error) {
            this.showTableError('users-data', 'Failed to load users data');
        }
    }

    async loadTransactionsData() {
        try {
            const transactions = await this.fetchData('transactions');
            this.populateTransactionsTable(transactions);
            this.populateTransactionFilters(transactions);
        } catch (error) {
            this.showTableError('transactions-data', 'Failed to load transactions data');
        }
    }

    async loadProductsData() {
        try {
            const products = await this.fetchData('products');
            this.populateProductsTable(products);
            this.populateProductFilters(products);
        } catch (error) {
            this.showTableError('products-data', 'Failed to load products data');
        }
    }

    async loadTicketsData() {
        try {
            const tickets = await this.fetchData('support-tickets');
            this.populateTicketsTable(tickets);
        } catch (error) {
            this.showTableError('tickets-data', 'Failed to load tickets data');
        }
    }

    async loadSessionsData() {
        try {
            const sessions = await this.fetchData('sessions');
            this.populateSessionsTable(sessions);
            this.populateSessionFilters(sessions);
        } catch (error) {
            this.showTableError('sessions-data', 'Failed to load sessions data');
        }
    }

    // Table Population Functions
    populateUsersTable(users) {
        const tbody = document.getElementById('users-data');
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.user_id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.country || 'N/A'}</td>
                <td>${user.gender || 'N/A'}</td>
                <td>${this.formatDate(user.registration_date)}</td>
                <td>${this.formatDate(user.last_login_date)}</td>
                <td class="actions-cell">
                    <button class="edit-btn" onclick="openEditUserModal(${user.user_id})" title="Edit User">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteUser(${user.user_id})" title="Delete User">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    populateTransactionsTable(transactions) {
        const tbody = document.getElementById('transactions-data');
        tbody.innerHTML = transactions.map(transaction => `
            <tr>
                <td>${transaction.transaction_id}</td>
                <td>${transaction.user_name}</td>
                <td>${transaction.product_name}</td>
                <td>${this.formatCurrency(transaction.amount)}</td>
                <td>${transaction.payment_method}</td>
                <td>${this.formatDate(transaction.purchase_date)}</td>
            </tr>
        `).join('');
    }

    populateProductsTable(products) {
        const tbody = document.getElementById('products-data');
        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.product_id}</td>
                <td>${product.product_name}</td>
                <td>${product.category}</td>
                <td>${this.formatCurrency(product.price)}</td>
            </tr>
        `).join('');
    }

    populateTicketsTable(tickets) {
        const tbody = document.getElementById('tickets-data');
        tbody.innerHTML = tickets.map(ticket => `
            <tr>
                <td>${ticket.ticket_id}</td>
                <td>${ticket.user_name}</td>
                <td>${ticket.issue_type}</td>
                <td><span class="status-${ticket.status.toLowerCase().replace(' ', '-')}">${ticket.status}</span></td>
                <td>${this.formatDate(ticket.ticket_date)}</td>
            </tr>
        `).join('');
    }

    populateSessionsTable(sessions) {
        const tbody = document.getElementById('sessions-data');
        tbody.innerHTML = sessions.map(session => `
            <tr>
                <td>${session.session_id}</td>
                <td>${session.user_name}</td>
                <td>${session.device}</td>
                <td>${this.formatDateTime(session.login_time)}</td>
                <td>${session.logout_time ? this.formatDateTime(session.logout_time) : 'Active'}</td>
            </tr>
        `).join('');
    }

    // Filter Population Functions
    populateUserFilters(users) {
        const uniqueCountries = [...new Set(users.map(u => u.country).filter(c => c))];
        const countryFilter = document.getElementById('user-filter');

        countryFilter.innerHTML = '<option value="">All Countries</option>' +
            uniqueCountries.map(country => `<option value="${country}">${country}</option>`).join('');
    }

    populateTransactionFilters(transactions) {
        const uniquePayments = [...new Set(transactions.map(t => t.payment_method).filter(p => p))];
        const paymentFilter = document.getElementById('transaction-filter');

        paymentFilter.innerHTML = '<option value="">All Payment Methods</option>' +
            uniquePayments.map(payment => `<option value="${payment}">${payment}</option>`).join('');
    }

    populateProductFilters(products) {
        const uniqueCategories = [...new Set(products.map(p => p.category).filter(c => c))];
        const categoryFilter = document.getElementById('product-filter');

        categoryFilter.innerHTML = '<option value="">All Categories</option>' +
            uniqueCategories.map(category => `<option value="${category}">${category}</option>`).join('');
    }

    populateSessionFilters(sessions) {
        const uniqueDevices = [...new Set(sessions.map(s => s.device).filter(d => d))];
        const deviceFilter = document.getElementById('session-filter');

        deviceFilter.innerHTML = '<option value="">All Devices</option>' +
            uniqueDevices.map(device => `<option value="${device}">${device}</option>`).join('');
    }

    // Search and Filter Functionality
    setupSearchAndFilters() {
        // Setup search inputs
        const searchInputs = document.querySelectorAll('.search-input');
        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const section = this.getSectionFromElement(e.target);
                clearTimeout(this.searchTimeouts[section]);
                this.searchTimeouts[section] = setTimeout(() => {
                    this.performSearch(section, e.target.value);
                }, 500);
            });
        });

        // Setup filter selects
        const filterSelects = document.querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                const section = this.getSectionFromElement(e.target);
                this.applyFilter(section, e.target.value);
            });
        });
    }

    getSectionFromElement(element) {
        return element.id.split('-')[0]; // e.g., 'user-search' -> 'user'
    }

    async performSearch(section, query) {
        try {
            const data = await this.fetchData(this.getApiEndpoint(section));
            const filteredData = data.filter(item =>
                Object.values(item).some(value =>
                    value && value.toString().toLowerCase().includes(query.toLowerCase())
                )
            );
            this.updateTableData(section, filteredData);
        } catch (error) {
            this.showError('Search failed');
        }
    }

    async applyFilter(section, filterValue) {
        if (!filterValue) {
            // Load all data if no filter
            await this.loadSectionData(section + 's');
            return;
        }

        try {
            const data = await this.fetchData(this.getApiEndpoint(section));
            let filteredData = data;

            switch (section) {
                case 'user':
                    filteredData = data.filter(user => user.country === filterValue);
                    break;
                case 'transaction':
                    filteredData = data.filter(transaction => transaction.payment_method === filterValue);
                    break;
                case 'product':
                    filteredData = data.filter(product => product.category === filterValue);
                    break;
                case 'ticket':
                    filteredData = data.filter(ticket => ticket.status === filterValue);
                    break;
                case 'session':
                    filteredData = data.filter(session => session.device === filterValue);
                    break;
            }

            this.updateTableData(section, filteredData);
        } catch (error) {
            this.showError('Filter failed');
        }
    }

    getApiEndpoint(section) {
        const endpoints = {
            'user': 'users',
            'transaction': 'transactions',
            'product': 'products',
            'ticket': 'support-tickets',
            'session': 'sessions'
        };
        return endpoints[section];
    }

    updateTableData(section, data) {
        const tableId = `${section}s-data`;
        const tbody = document.getElementById(tableId);

        if (!tbody) return;

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" class="loading">No results found</td></tr>`;
            return;
        }

        // Call the appropriate population function based on section
        switch (section) {
            case 'user':
                this.populateUsersTable(data);
                break;
            case 'transaction':
                this.populateTransactionsTable(data);
                break;
            case 'product':
                this.populateProductsTable(data);
                break;
            case 'ticket':
                this.populateTicketsTable(data);
                break;
            case 'session':
                this.populateSessionsTable(data);
                break;
        }
    }

    // Utility Functions
    async fetchData(endpoint) {
        if (this.dataCache[endpoint]) {
            return this.dataCache[endpoint];
        }

        const response = await fetch(`/api/${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        this.dataCache[endpoint] = data;
        return data;
    }

    formatNumber(num) {
        return num ? num.toLocaleString() : '0';
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    }

    formatDateTime(dateTimeString) {
        if (!dateTimeString) return 'N/A';
        return new Date(dateTimeString).toLocaleString();
    }

    formatFileSize(bytes) {
        if (!bytes) return 'N/A';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    getScoreClass(score) {
        if (score >= 80) return 'high';
        if (score >= 60) return 'medium';
        return 'low';
    }

    showTableError(tableId, message) {
        const tbody = document.getElementById(tableId);
        tbody.innerHTML = `<tr><td colspan="10" class="loading" style="color: #dc3545;">${message}</td></tr>`;
    }

    // Loading and Error Management
    showLoadingOverlay() {
        document.getElementById('loading-overlay').classList.add('active');
    }

    hideLoadingOverlay() {
        document.getElementById('loading-overlay').classList.remove('active');
    }

    showError(message) {
        const errorToast = document.getElementById('error-toast');
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = message;
        errorToast.classList.add('active');

        setTimeout(() => {
            this.hideErrorToast();
        }, 5000);
    }

    hideErrorToast() {
        document.getElementById('error-toast').classList.remove('active');
    }

    // Auto-refresh functionality
    setupAutoRefresh() {
        // Refresh data every 30 seconds
        setInterval(async () => {
            try {
                await this.loadDashboardData();
                if (this.currentSection !== 'dashboard') {
                    await this.loadSectionData(this.currentSection);
                }
                // Also refresh analytics if currently on analytics section
                if (this.currentSection === 'analytics') {
                    await this.loadAnalyticsData();
                }
            } catch (error) {
                console.error('Auto-refresh failed:', error);
            }
        }, 30000);
    }

    // Analytics Chart Functions
    async loadAnalyticsData() {
        this.showLoadingOverlay();

        try {
            // Load all analytics data in parallel
            const [usersPerMonthData, usersByCountryData, activityTrendsData, recentEntriesData, productPerformanceData, productCategoriesData, websiteLoadTimesData] = await Promise.all([
                this.fetchData('analytics/users-per-month'),
                this.fetchData('analytics/users-by-country'),
                this.fetchData('analytics/activity-trends'),
                this.fetchData('analytics/recent-entries'),
                this.fetchData('analytics/product-performance'),
                this.fetchData('analytics/product-categories'),
                this.fetchData('analytics/website-load-times')
            ]);

            // Create charts
            this.createUsersPerMonthChart(usersPerMonthData);
            this.createUsersByCountryChart(usersByCountryData);
            this.createActivityTrendsChart(activityTrendsData);
            this.createProductPerformanceChart(productPerformanceData);
            this.createProductCategoriesChart(productCategoriesData);
            this.createWebsiteLoadTimesChart(websiteLoadTimesData);
            this.createRecentEntriesTable(recentEntriesData);

        } catch (error) {
            console.error('Error loading analytics data:', error);
            this.showError('Failed to load analytics data');
        } finally {
            this.hideLoadingOverlay();
        }
    }

    createUsersPerMonthChart(data) {
        const ctx = document.getElementById('usersPerMonthChart').getContext('2d');

        // Destroy existing chart if it exists
        if (this.usersPerMonthChart) {
            this.usersPerMonthChart.destroy();
        }

        this.usersPerMonthChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => {
                    const date = new Date(item.month + '-01');
                    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                }),
                datasets: [{
                    label: 'New Users',
                    data: data.map(item => item.count),
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'User Registrations by Month',
                        color: '#ffffff',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#cccccc'
                        },
                        grid: {
                            color: '#333333'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#cccccc'
                        },
                        grid: {
                            color: '#333333'
                        }
                    }
                }
            }
        });
    }

    createUsersByCountryChart(data) {
        const ctx = document.getElementById('usersByCountryChart').getContext('2d');

        // Destroy existing chart if it exists
        if (this.usersByCountryChart) {
            this.usersByCountryChart.destroy();
        }

        // Generate colors for each country
        const colors = [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(199, 199, 199, 0.8)',
            'rgba(83, 102, 255, 0.8)',
            'rgba(255, 99, 255, 0.8)',
            'rgba(99, 255, 132, 0.8)'
        ];

        this.usersByCountryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(item => item.country),
                datasets: [{
                    data: data.map(item => item.count),
                    backgroundColor: colors.slice(0, data.length),
                    borderWidth: 2,
                    borderColor: '#1a1a1a'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'User Distribution by Country',
                        color: '#ffffff',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#ffffff',
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    createActivityTrendsChart(data) {
        const ctx = document.getElementById('activityTrendsChart').getContext('2d');

        // Destroy existing chart if it exists
        if (this.activityTrendsChart) {
            this.activityTrendsChart.destroy();
        }

        // Format dates for better display
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };

        this.activityTrendsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.user_trends.map(item => formatDate(item.date)),
                datasets: [
                    {
                        label: 'User Registrations',
                        data: data.user_trends.map(item => item.user_count),
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'Transactions',
                        data: data.transaction_trends.map(item => item.transaction_count),
                        borderColor: 'rgba(255, 205, 86, 1)',
                        backgroundColor: 'rgba(255, 205, 86, 0.2)',
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'Revenue ($)',
                        data: data.revenue_trends.map(item => item.total_amount),
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        tension: 0.4,
                        fill: false,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Activity Trends Over Time',
                        color: '#ffffff',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        labels: {
                            color: '#ffffff',
                            usePointStyle: true
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date',
                            color: '#ffffff'
                        },
                        ticks: {
                            color: '#cccccc'
                        },
                        grid: {
                            color: '#333333'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Count',
                            color: '#ffffff'
                        },
                        ticks: {
                            color: '#cccccc'
                        },
                        grid: {
                            color: '#333333'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Revenue ($)',
                            color: '#ffffff'
                        },
                        ticks: {
                            color: '#cccccc',
                            callback: function(value) {
                                return '$' + value;
                            }
                        },
                        grid: {
                            drawOnChartArea: false,
                        }
                    }
                }
            }
        });
    }

    createProductPerformanceChart(data) {
        const ctx = document.getElementById('productPerformanceChart').getContext('2d');

        // Destroy existing chart if it exists
        if (this.productPerformanceChart) {
            this.productPerformanceChart.destroy();
        }

        // Generate colors for products
        const colors = [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(199, 199, 199, 0.8)',
            'rgba(83, 102, 255, 0.8)',
            'rgba(255, 99, 255, 0.8)',
            'rgba(99, 255, 132, 0.8)',
            'rgba(255, 159, 132, 0.8)',
            'rgba(159, 255, 86, 0.8)',
            'rgba(75, 192, 255, 0.8)',
            'rgba(255, 75, 192, 0.8)',
            'rgba(192, 75, 255, 0.8)'
        ];

        this.productPerformanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => item.product_name.length > 15 ?
                    item.product_name.substring(0, 15) + '...' : item.product_name),
                datasets: [{
                    label: 'Total Revenue ($)',
                    data: data.map(item => parseFloat(item.total_revenue) || 0),
                    backgroundColor: colors.slice(0, data.length),
                    borderColor: colors.slice(0, data.length).map(color => color.replace('0.8', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Top Performing Products by Revenue',
                        color: '#ffffff',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const product = data[context.dataIndex];
                                return [
                                    `Product: ${product.product_name}`,
                                    `Revenue: $${parseFloat(product.total_revenue || 0).toLocaleString()}`,
                                    `Sales Count: ${product.sales_count}`,
                                    `Category: ${product.category}`,
                                    `Avg Order: $${parseFloat(product.avg_order_value || 0).toFixed(2)}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#cccccc',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        },
                        grid: {
                            color: '#333333'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#cccccc',
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: {
                            color: '#333333'
                        }
                    }
                }
            }
        });
    }

    createProductCategoriesChart(data) {
        const ctx = document.getElementById('productCategoriesChart').getContext('2d');

        // Destroy existing chart if it exists
        if (this.productCategoriesChart) {
            this.productCategoriesChart.destroy();
        }

        // Generate colors for categories
        const colors = [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(199, 199, 199, 0.8)',
            'rgba(83, 102, 255, 0.8)'
        ];

        this.productCategoriesChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(item => item.category),
                datasets: [{
                    data: data.map(item => parseFloat(item.total_revenue) || 0),
                    backgroundColor: colors.slice(0, data.length),
                    borderWidth: 2,
                    borderColor: '#1a1a1a'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Product Categories by Revenue',
                        color: '#ffffff',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#ffffff',
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            },
                            generateLabels: function(chart) {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map((label, i) => {
                                        const value = data.datasets[0].data[i];
                                        const category = data.labels[i];
                                        return {
                                            text: `${category}: $${parseFloat(value || 0).toLocaleString()}`,
                                            fillStyle: data.datasets[0].backgroundColor[i],
                                            strokeStyle: data.datasets[0].borderColor[i],
                                            lineWidth: 2,
                                            hidden: false,
                                            index: i,
                                            fontColor: '#ffffff'
                                        };
                                    });
                                }
                                return [];
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const category = data.labels[context.dataIndex];
                                const value = data.datasets[0].data[context.dataIndex];
                                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return [
                                    `Category: ${category}`,
                                    `Revenue: $${parseFloat(value || 0).toLocaleString()}`,
                                    `Share: ${percentage}%`
                                ];
                            }
                        }
                    }
                }
            }
        });
    }

    createWebsiteLoadTimesChart(data) {
        const ctx = document.getElementById('websiteLoadTimesChart').getContext('2d');

        // Destroy existing chart if it exists
        if (this.websiteLoadTimesChart) {
            this.websiteLoadTimesChart.destroy();
        }

        // Sort data by load time (fastest to slowest)
        const sortedData = data.sort((a, b) => a.load_time_ms - b.load_time_ms);

        // Generate colors based on performance (green for fast, red for slow)
        const colors = sortedData.map(item => {
            const loadTime = item.load_time_ms;
            if (loadTime < 200) return 'rgba(76, 175, 80, 0.8)'; // Green for fast
            if (loadTime < 300) return 'rgba(255, 193, 7, 0.8)'; // Yellow for medium
            return 'rgba(244, 67, 54, 0.8)'; // Red for slow
        });

        const borderColors = colors.map(color => color.replace('0.8', '1'));

        this.websiteLoadTimesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedData.map(item => item.page.length > 15 ?
                    item.page.substring(0, 15) + '...' : item.page),
                datasets: [{
                    label: 'Current Load Time (ms)',
                    data: sortedData.map(item => item.load_time_ms),
                    backgroundColor: colors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Website Pages Load Times',
                        color: '#ffffff',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const page = sortedData[context.dataIndex];
                                const performance = page.load_time_ms < 200 ? 'Fast' :
                                                   page.load_time_ms < 300 ? 'Medium' : 'Slow';
                                return [
                                    `Page: ${page.page}`,
                                    `Load Time: ${page.load_time_ms}ms`,
                                    `Performance: ${performance}`,
                                    `Avg Load Time: ${page.avg_load_time_ms}ms`,
                                    `Requests: ${page.requests}`,
                                    `Page Size: ${page.page_size_kb}KB`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Load Time (milliseconds)',
                            color: '#ffffff'
                        },
                        ticks: {
                            color: '#cccccc',
                            callback: function(value) {
                                return value + 'ms';
                            }
                        },
                        grid: {
                            color: '#333333'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Website Pages',
                            color: '#ffffff'
                        },
                        ticks: {
                            color: '#cccccc',
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: {
                            color: '#333333'
                        }
                    }
                }
            }
        });
    }

    createRecentEntriesTable(data) {
        const container = document.getElementById('recent-entries-loading');
        const content = document.getElementById('recent-entries-content');

        if (data.length === 0) {
            container.innerHTML = '<div class="loading">No recent activity found</div>';
            return;
        }

        const entriesList = content.querySelector('.recent-entries-list');
        entriesList.innerHTML = data.map(entry => `
            <div class="recent-entry ${entry.type}">
                <div class="entry-info">
                    <h4>${entry.type === 'user' ? entry.name : entry.type === 'transaction' ? `${entry.user_name} - ${entry.product_name}` : `${entry.user_name} - ${entry.issue_type}`}</h4>
                    <p>${entry.type === 'user' ? entry.email : entry.type === 'transaction' ? `$${entry.amount}` : entry.status}</p>
                </div>
                <div class="entry-meta">
                    <span class="entry-type ${entry.type}">${entry.type}</span>
                    <div class="entry-date">${this.formatDateTime(entry.sort_date)}</div>
                </div>
            </div>
        `).join('');

        container.style.display = 'none';
        content.style.display = 'block';
    }
}

// User Management Functions
function openAddUserModal() {
    const modal = document.getElementById('add-user-modal');
    modal.classList.add('active');
    document.getElementById('add-name').focus();

    // Prevent modal from closing when clicking on backdrop
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            // Clicked on backdrop, don't close
            e.stopPropagation();
        }
    });

    // Prevent modal from closing when pressing Escape
    const handleEscape = function(e) {
        if (e.key === 'Escape') {
            e.stopPropagation();
        }
    };
    document.addEventListener('keydown', handleEscape);

    // Store the escape handler so we can remove it later
    modal._escapeHandler = handleEscape;
}

function closeAddUserModal() {
    const modal = document.getElementById('add-user-modal');
    modal.classList.remove('active');
    document.getElementById('add-user-form').reset();

    // Remove the escape key handler
    if (modal._escapeHandler) {
        document.removeEventListener('keydown', modal._escapeHandler);
        delete modal._escapeHandler;
    }
}

async function openEditUserModal(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`);
        const user = await response.json();

        document.getElementById('edit-user-id').value = user.user_id;
        document.getElementById('edit-name').value = user.name;
        document.getElementById('edit-email').value = user.email;
        document.getElementById('edit-country').value = user.country || '';
        document.getElementById('edit-gender').value = user.gender || '';

        const modal = document.getElementById('edit-user-modal');
        modal.classList.add('active');
        document.getElementById('edit-name').focus();

        // Prevent modal from closing when clicking on backdrop
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                // Clicked on backdrop, don't close
                e.stopPropagation();
            }
        });

        // Prevent modal from closing when pressing Escape
        const handleEscape = function(e) {
            if (e.key === 'Escape') {
                e.stopPropagation();
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Store the escape handler so we can remove it later
        modal._escapeHandler = handleEscape;
    } catch (error) {
        showError('Failed to load user data for editing');
    }
}

function closeEditUserModal() {
    const modal = document.getElementById('edit-user-modal');
    modal.classList.remove('active');
    document.getElementById('edit-user-form').reset();

    // Remove the escape key handler
    if (modal._escapeHandler) {
        document.removeEventListener('keydown', modal._escapeHandler);
        delete modal._escapeHandler;
    }
}

async function addUser(event) {
    event.preventDefault();

    const name = document.getElementById('add-name').value;
    const email = document.getElementById('add-email').value;
    const country = document.getElementById('add-country').value;
    const gender = document.getElementById('add-gender').value;

    if (!name || !email) {
        showError('Name and email are required');
        return;
    }

    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, country, gender })
        });

        const result = await response.json();

        if (response.ok) {
            closeAddUserModal();
            showSuccess('User added successfully');
            // Clear the users cache to ensure fresh data is fetched
            if (window.dashboardApp && window.dashboardApp.dataCache) {
                delete window.dashboardApp.dataCache['users'];
                delete window.dashboardApp.dataCache['dashboard-stats'];
            }
            // Refresh the users table
            window.dashboardApp.loadUsersData();
            // Refresh dashboard stats
            window.dashboardApp.loadDashboardData();
        } else {
            showError(result.error || 'Failed to add user');
        }
    } catch (error) {
        showError('Failed to add user');
    }
}

async function updateUser(event) {
    event.preventDefault();

    const userId = document.getElementById('edit-user-id').value;
    const name = document.getElementById('edit-name').value;
    const email = document.getElementById('edit-email').value;
    const country = document.getElementById('edit-country').value;
    const gender = document.getElementById('edit-gender').value;

    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, country, gender })
        });

        const result = await response.json();

        if (response.ok) {
            closeEditUserModal();
            showSuccess('User updated successfully');
            // Clear the users cache to ensure fresh data is fetched
            if (window.dashboardApp && window.dashboardApp.dataCache) {
                delete window.dashboardApp.dataCache['users'];
                delete window.dashboardApp.dataCache['dashboard-stats'];
            }
            // Refresh the users table
            window.dashboardApp.loadUsersData();
            // Refresh dashboard stats
            window.dashboardApp.loadDashboardData();
        } else {
            showError(result.error || 'Failed to update user');
        }
    } catch (error) {
        showError('Failed to update user');
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            showSuccess('User deleted successfully');
            // Clear the users cache to ensure fresh data is fetched
            if (window.dashboardApp && window.dashboardApp.dataCache) {
                delete window.dashboardApp.dataCache['users'];
                delete window.dashboardApp.dataCache['dashboard-stats'];
            }
            // Refresh the users table
            window.dashboardApp.loadUsersData();
            // Refresh dashboard stats
            window.dashboardApp.loadDashboardData();
        } else {
            showError(result.error || 'Failed to delete user');
        }
    } catch (error) {
        showError('Failed to delete user');
    }
}

function showSuccess(message) {
    const successToast = document.createElement('div');
    successToast.className = 'success-toast';
    successToast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(successToast);

    setTimeout(() => {
        successToast.remove();
    }, 5000);
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardApp = new DashboardApp();
});
