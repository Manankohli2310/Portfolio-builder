document.addEventListener('DOMContentLoaded', () => {

    const userStatus = localStorage.getItem('userStatus');
    const header = document.querySelector('.main-header');

    if (userStatus === 'loggedIn') {
        // --- LOGGED-IN USER VIEW ---
        // This part remains unchanged.
        console.log("User is logged in. Building user header.");
        
        const userName = localStorage.getItem('userName');
        const userPicture = localStorage.getItem('userPicture');
        
        header.innerHTML = `
            <div class="user-info">
                <img src="${userPicture || 'assets/images/default-avatar.png'}" alt="Profile Picture" class="profile-picture">
                <div class="welcome-message">
                    Welcome, <span id="user-name">${userName || 'User'}</span>!
                </div>
            </div>
            <button id="logout-btn" class="logout-button">Logout</button>
        `;

        document.getElementById('logout-btn').addEventListener('click', () => {
            console.log("User clicked logout.");
            localStorage.clear(); 
            window.location.href = 'login.html';
        });

    } else if (userStatus === 'skipped') {
        // --- GUEST (SKIPPED) USER VIEW - UPDATED ---
        console.log("User has skipped login. Building guest header with login button.");
        
        // Build the HTML for the guest header with a "Login" button.
        header.innerHTML = `
            <div class="site-title">
                Portfolio<span>Builder</span>
            </div>
            <a href="login.html" id="login-btn" class="login-button">Login</a>
        `;
        
        // NEW: Add a listener to the login button to clear the 'skipped' status.
        document.getElementById('login-btn').addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior
            console.log("Guest is going back to login.");
            localStorage.removeItem('userStatus'); // Clear the 'skipped' status
            window.location.href = 'login.html'; // Go back to the login page
        });

    } else {
        // --- NO STATUS FOUND ---
        // This logic is unchanged.
        console.log("No user session found. Redirecting to login page.");
        window.location.href = 'login.html';
    }
});