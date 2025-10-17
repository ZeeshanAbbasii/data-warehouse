// Frontend JavaScript for Hello World website
document.addEventListener('DOMContentLoaded', function() {
    // Check database connection status
    checkDatabaseStatus();

    // Function to check database connection
    async function checkDatabaseStatus() {
        try {
            const response = await fetch('http://localhost:3000/api/database-status');
            const data = await response.json();
            
            const statusElement = document.getElementById('database-status');
            
            if (data.connected) {
                statusElement.textContent = '✅ Database Connected Successfully!';
                statusElement.className = 'status-connected';
            } else {
                statusElement.textContent = '❌ Database Connection Failed';
                statusElement.className = 'status-disconnected';
            }
        } catch (error) {
            console.error('Error checking database status:', error);
            const statusElement = document.getElementById('database-status');
            statusElement.textContent = '❌ Error checking database connection';
            statusElement.className = 'status-disconnected';
        }
    }

    // Optional: Add some interactive features
    const container = document.querySelector('.container');
    container.addEventListener('click', function() {
        this.style.transform = 'scale(1.02)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 200);
    });
});
