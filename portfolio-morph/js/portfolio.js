document.addEventListener('DOMContentLoaded', () => {
    // This script is for the template selection page (portfolio-morph.html)

    const userStatus = localStorage.getItem('userStatus');
    const header = document.querySelector('.main-header');

    // Make sure the header element exists before trying to use it
    if (!header) {
        console.error("Header element not found on this page!");
        return;
    }

    // --- 1. HEADER LOGIC (This is your original, correct code) ---
    const loginPageUrl = '../login.html';

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
        return; // Stop script execution if redirecting
    }

    // --- 2. NEW GLOBAL THEME LOGIC ---

    // Get all the preview iframes on this page
    const allPreviewFrames = document.querySelectorAll('.card-preview-frame');

    // A helper function to send messages to all iframes
    function postMessageToAllPreviews(message) {
        allPreviewFrames.forEach(frame => {
            // Check if the iframe has loaded before trying to send a message
            if (frame.contentWindow) {
                frame.contentWindow.postMessage(message, '*');
            }
        });
    }

    // The main function to set and synchronize the theme
    function setTheme(theme) {
        // a) Save the user's choice to localStorage so other pages can read it
        localStorage.setItem('selectedTheme', theme);

        // b) Update the active state of the toggle buttons on this page
        document.querySelectorAll('#global-theme-controls .control-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });

        // c) Send the 'themeChange' command to all live preview iframes on this page
        postMessageToAllPreviews({ type: 'themeChange', theme: theme });
    }

    // Find the theme toggle buttons and add click listeners to them
    document.querySelectorAll('#global-theme-controls .control-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setTheme(btn.dataset.theme);
        });
    });
    
    // --- 3. INITIALIZATION ---

    // When the page first loads, check for a previously saved theme. Default to 'light'.
    const savedTheme = localStorage.getItem('selectedTheme') || 'light';
    
    // Set the initial state of the toggle and the iframes
    setTheme(savedTheme);

    // Some iframes might load slower than the script runs.
    // This timeout sends the message again after a brief delay to ensure even slow-loading iframes get the theme command.
    setTimeout(() => {
        postMessageToAllPreviews({ type: 'themeChange', theme: savedTheme });
    }, 500); // 500ms delay

});