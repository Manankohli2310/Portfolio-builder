document.addEventListener('DOMContentLoaded', () => {
    // This script is ONLY for the template selection page (portfolio-morph.html)

    const userStatus = localStorage.getItem('userStatus');
    const header = document.querySelector('.main-header');

    // Make sure the header element exists before trying to use it
    if (!header) {
        console.error("Header element not found on this page!");
        return;
    }

    const loginPageUrl = '../login.html'; // Correct path to go up and then to login.html

    if (userStatus === 'loggedIn') {
        const userName = localStorage.getItem('userName');
        const userPicture = localStorage.getItem('userPicture');
        
        header.innerHTML = `
            <div class="user-info">
                <img src="${userPicture || '../assets/images/default-avatar.png'}" alt="Profile Picture" class="profile-picture">
                <div class="welcome-message">
                    Welcome, <span id="user-name">${userName || 'User'}</span>!
                </div>
            </div>
            <button id="logout-btn" class="logout-button">Logout</button>
        `;

        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.clear(); 
            window.location.href = loginPageUrl;
        });

    } else if (userStatus === 'skipped') {
        header.innerHTML = `
            <div class="site-title">
                Portfolio<span>Morph</span>
            </div>
            <a href="${loginPageUrl}" id="login-btn" class="login-button">Login</a>
        `;
        
        document.getElementById('login-btn').addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('userStatus');
            window.location.href = loginPageUrl;
        });

    } else {
        // If no status, protect the page
        window.location.href = loginPageUrl;
    }
});