document.addEventListener('DOMContentLoaded', () => {

    const header = document.querySelector('.main-header');
    const mainPreviewFrame = document.getElementById('main-preview-frame');
    const miniPreviewFrame = document.getElementById('mini-preview-frame');
    const editPanelBtn = document.getElementById('edit-panel-btn');
    const editingPanel = document.getElementById('editing-panel');
    const closePanelBtn = document.getElementById('close-panel-btn');
    const panelBackdrop = document.getElementById('panel-backdrop');
    
    const urlParams = new URLSearchParams(window.location.search);
    const selectedTemplate = urlParams.get('template');
    
    let portfolioData = {
        template: selectedTemplate,
        theme: 'light',
    };

    function buildHeader(userStatus) {
        const loginPageUrl = '../login.html';
        let headerHTML = '';

        if (userStatus === 'loggedIn') {
            const userName = localStorage.getItem('userName');
            const userPicture = localStorage.getItem('userPicture');
            headerHTML = `
                <div class="user-info">
                    <img src="${userPicture || '../assets/images/default-avatar.png'}" alt="Profile Picture" class="profile-picture">
                    <div class="welcome-message">Welcome, <span id="user-name">${userName || 'User'}</span>!</div>
                </div>
                <button id="logout-btn" class="logout-button">Logout</button>
            `;
        } else {
            headerHTML = `<div class="site-title">Portfolio<span>Morph</span></div><a href="${loginPageUrl}" id="login-btn" class="login-button">Login</a>`;
        }
        
        header.innerHTML = headerHTML;

        if (userStatus === 'loggedIn') {
            document.getElementById('logout-btn').addEventListener('click', () => {
                localStorage.clear(); window.location.href = loginPageUrl;
            });
        } else if(document.getElementById('login-btn')) {
            document.getElementById('login-btn').addEventListener('click', (event) => {
                event.preventDefault(); localStorage.removeItem('userStatus'); window.location.href = loginPageUrl;
            });
        }
    }
    
    const openPanel = () => { editingPanel.classList.add('visible'); panelBackdrop.classList.add('visible'); };
    const closePanel = () => { editingPanel.classList.remove('visible'); panelBackdrop.classList.remove('visible'); };
    editPanelBtn.addEventListener('click', openPanel);
    closePanelBtn.addEventListener('click', closePanel);
    panelBackdrop.addEventListener('click', closePanel);

    function postMessageToPreviews(message) {
        if (mainPreviewFrame.contentWindow) mainPreviewFrame.contentWindow.postMessage(message, '*');
        if (miniPreviewFrame.contentWindow) miniPreviewFrame.contentWindow.postMessage(message, '*');
    }

    function setTheme(theme) {
        portfolioData.theme = theme;
        document.querySelectorAll('.control-btn[data-theme]').forEach(btn => {
            if (btn.dataset.theme === theme) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        postMessageToPreviews({ type: 'themeChange', theme: portfolioData.theme });
    }

    function setupThemeButtonListeners() {
        document.querySelectorAll('.control-btn[data-theme]').forEach(btn => {
            btn.addEventListener('click', () => setTheme(btn.dataset.theme));
        });
    }

    const userStatus = localStorage.getItem('userStatus');
    if (!userStatus) {
        window.location.href = '../login.html'; return;
    }
    
    buildHeader(userStatus);
    setupThemeButtonListeners();

    if (selectedTemplate) {
        const templateUrl = `templates/${selectedTemplate}/index.html`;
        mainPreviewFrame.src = templateUrl;
        miniPreviewFrame.src = templateUrl;
    } else {
        document.body.innerHTML = '<h2>Error: No template selected. Please go back.</h2>';
        return;
    }
    
    mainPreviewFrame.onload = () => {
        console.log(`Main preview for ${selectedTemplate} loaded.`);
        setTheme(portfolioData.theme);
    };
});