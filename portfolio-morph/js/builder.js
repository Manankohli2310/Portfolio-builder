// This is the "brain" of the portfolio builder.

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. INITIAL SETUP AND PAGE PROTECTION ---

    // Get references to all the important elements on the page
    const header = document.querySelector('.main-header');
    const iframeContainer = document.getElementById('iframe-container');
    const previewFrame = document.getElementById('preview-frame');
    
    // Control buttons
    const portraitBtn = document.getElementById('portrait-btn');
    const landscapeBtn = document.getElementById('landscape-btn');
    const lightThemeBtn = document.getElementById('light-theme-btn');
    const darkThemeBtn = document.getElementById('dark-theme-btn');

    // Get the selected template name from the URL (e.g., "?template=template1")
    const urlParams = new URLSearchParams(window.location.search);
    const selectedTemplate = urlParams.get('template');

    // Define the 'Single Source of Truth' data object.
    // This will hold all the portfolio details. We start with defaults.
    let portfolioData = {
        template: selectedTemplate,
        theme: 'light', // 'light' or 'dark'
        // We will add more sections here later: personalInfo, skills, projects, etc.
    };


    // --- 2. HEADER LOGIC & PAGE PROTECTION ---
    // This logic is reused from our other pages, with updated paths.
    
    const userStatus = localStorage.getItem('userStatus');
    const loginPageUrl = '../login.html'; // Path from builder.html to login.html

    if (userStatus === 'loggedIn') {
        const userName = localStorage.getItem('userName');
        const userPicture = localStorage.getItem('userPicture');
        header.innerHTML = `
            <div class="user-info">
                <img src="${userPicture || '../assets/images/default-avatar.png'}" alt="Profile Picture" class="profile-picture">
                <div class="welcome-message">Welcome, <span id="user-name">${userName || 'User'}</span>!</div>
            </div>
            <button id="logout-btn" class="logout-button">Logout</button>
        `;
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.clear(); 
            window.location.href = loginPageUrl;
        });

    } else if (userStatus === 'skipped') {
        header.innerHTML = `
            <div class="site-title">Portfolio<span>Morph</span></div>
            <a href="${loginPageUrl}" id="login-btn" class="login-button">Login</a>
        `;
        document.getElementById('login-btn').addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('userStatus');
            window.location.href = loginPageUrl;
        });
    } else {
        // If no status, redirect to login. This protects the builder page.
        window.location.href = loginPageUrl;
        return; // Stop the script if redirecting
    }


    // --- 3. PREVIEW AND CONTROL LOGIC ---

    // Function to send a message to the iframe
    function postMessageToPreview(message) {
        if (previewFrame.contentWindow) {
            previewFrame.contentWindow.postMessage(message, '*');
        }
    }

    // Load the correct template into the iframe
    if (selectedTemplate) {
        previewFrame.src = `templates/${selectedTemplate}/index.html`;
    } else {
        // Handle case where no template is selected (e.g., direct URL access)
        document.getElementById('editing-pane').innerHTML = '<h2>Error: No template selected. Please go back and choose a template.</h2>';
        return;
    }

    // --- 4. EVENT LISTENERS FOR CONTROLS ---

    // Device Mode Toggle
    portraitBtn.addEventListener('click', () => {
        iframeContainer.classList.remove('landscape-mode');
        iframeContainer.classList.add('portrait-mode');
        portraitBtn.classList.add('active');
        landscapeBtn.classList.remove('active');
    });

    landscapeBtn.addEventListener('click', () => {
        iframeContainer.classList.remove('portrait-mode');
        iframeContainer.classList.add('landscape-mode');
        landscapeBtn.classList.add('active');
        portraitBtn.classList.remove('active');
    });

    // Theme Toggle
    lightThemeBtn.addEventListener('click', () => {
        // 1. Update our central data object
        portfolioData.theme = 'light';
        
        // 2. Update the button's active state
        lightThemeBtn.classList.add('active');
        darkThemeBtn.classList.remove('active');

        // 3. Send the command to the iframe
        postMessageToPreview({
            type: 'themeChange',
            theme: 'light'
        });
    });

    darkThemeBtn.addEventListener('click', () => {
        // 1. Update our central data object
        portfolioData.theme = 'dark';

        // 2. Update the button's active state
        darkThemeBtn.classList.add('active');
        lightThemeBtn.classList.remove('active');

        // 3. Send the command to the iframe
        postMessageToPreview({
            type: 'themeChange',
            theme: 'dark'
        });
    });

    // When the iframe has fully loaded, send the initial theme setting
    previewFrame.onload = () => {
        console.log(`Template ${selectedTemplate} loaded.`);
        postMessageToPreview({
            type: 'themeChange',
            theme: portfolioData.theme
        });
        // We will later send ALL portfolio data here on load.
    };

});