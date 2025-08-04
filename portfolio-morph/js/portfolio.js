document.addEventListener('DOMContentLoaded', () => {

    const userStatus = localStorage.getItem('userStatus');
    const header = document.querySelector('.main-header');

    // All paths in this script now use '../' to go up one directory level.
    const loginPageUrl = '../login.html';
    const defaultAvatarUrl = '../assets/images/default-avatar.png';

    if (userStatus === 'loggedIn') {
        // --- LOGGED-IN USER VIEW ---
        const userName = localStorage.getItem('userName');
        const userPicture = localStorage.getItem('userPicture');
        
        header.innerHTML = `
            <div class="user-info">
                <img src="${userPicture || defaultAvatarUrl}" alt="Profile Picture" class="profile-picture">
                <div class="welcome-message">
                    Welcome, <span id="user-name">${userName || 'User'}</span>!
                </div>
            </div>
            <button id="logout-btn" class="logout-button">Logout</button>
        `;

        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.clear(); 
            window.location.href = loginPageUrl; // Use variable for redirect
        });

    } else if (userStatus === 'skipped') {
        // --- GUEST (SKIPPED) USER VIEW ---
        header.innerHTML = `
            <div class="site-title">
                Portfolio<span>Morph</span>
            </div>
            <a href="${loginPageUrl}" id="login-btn" class="login-button">Login</a>
        `;
        
        document.getElementById('login-btn').addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('userStatus');
            window.location.href = loginPageUrl; // Use variable for redirect
        });

    } else {
        // --- NO STATUS FOUND (PAGE PROTECTION) ---
        window.location.href = loginPageUrl; // Use variable for redirect
    }
});