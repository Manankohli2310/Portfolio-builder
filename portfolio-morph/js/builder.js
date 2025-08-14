// This is the main builder CONTROLLER. It orchestrates everything.

// --- GLOBAL SHARED FUNCTIONS ---
// These are attached to the 'window' object to be globally accessible by all scripts.
window.sendFullUpdate = function() {
    const mainPreviewFrame = document.getElementById('main-preview-frame');
    const miniPreviewFrame = document.getElementById('mini-preview-frame');
    if (mainPreviewFrame?.contentWindow) {
        mainPreviewFrame.contentWindow.postMessage({ type: 'fullUpdate', data: window.portfolioData }, '*');
    }
    if (miniPreviewFrame?.contentWindow) {
        miniPreviewFrame.contentWindow.postMessage({ type: 'fullUpdate', data: window.portfolioData }, '*');
    }
}

window.setObjectValue = function(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((acc, part) => {
        if (acc && typeof acc[part] !== 'undefined') { return acc[part]; }
        return {};
    }, obj);
    if (target && typeof target === 'object') { target[lastKey] = value; }
}

// --- MAIN BUILDER SCRIPT ---
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ELEMENT SELECTION ---
    const header = document.querySelector('.main-header');
    const mainPreviewFrame = document.getElementById('main-preview-frame');
    const miniPreviewFrame = document.getElementById('mini-preview-frame');
    const miniPreviewContainer = document.getElementById('mini-preview-container');
    const editPanelBtn = document.getElementById('edit-panel-btn');
    const editingPanel = document.getElementById('editing-panel');
    const closePanelBtn = document.getElementById('close-panel-btn');
    const panelBackdrop = document.getElementById('panel-backdrop');
    const formControlsContainer = document.getElementById('form-controls');

    // --- 2. TEMPLATE CONFIG ---
    const templateConfig = {
        template1: { realWidth: 1400, realHeight: 800, scaleNumerator: 375 },
        template2: { realWidth: 1400, realHeight: 800, scaleNumerator: 390 },
        template3: { realWidth: 1400, realHeight: 800, scaleNumerator: 390 }
    };
    
    // --- 3. GLOBAL DATA SETUP ---
    const urlParams = new URLSearchParams(window.location.search);
    const selectedTemplate = urlParams.get('template');
    
    // Make portfolioData a global variable
    window.portfolioData = {
        template: selectedTemplate,
        theme: localStorage.getItem('selectedTheme') || 'light',
        hero: { name: null, subtitle: null, resumeUrl: null, profileImageUrl: null },
        about: { description: null, enabled: true },
        skills: { list: [], enabled: true, iconsEnabled: true, globalIconOverride: null },
        contact: { email: null, phone: null, location: null, social: { linkedin: null, github: null, twitter: null }, enabled: true },
        footer: { copyright: null, enabled: true },
        experience: [],
        projects: [],
    };

    // --- 4. MASTER FORM BUILDER ---
    function buildForm() {
        formControlsContainer.innerHTML = '';
        const iframeDoc = mainPreviewFrame.contentDocument;

        if (selectedTemplate === 'template1') {
            // Call the globally available build functions from the other files
            buildTemplate1HeroForm(formControlsContainer, window.portfolioData, iframeDoc);
            buildTemplate1AboutForm(formControlsContainer, window.portfolioData, iframeDoc);
            buildTemplate1SkillsForm(formControlsContainer, window.portfolioData, iframeDoc, buildForm);
        }
    }
    
    // --- 5. THEME, HEADER, PANEL LOGIC ---
    function buildHeader(userStatus) {
        const loginPageUrl = '../login.html';
        let headerHTML = '';
        if (userStatus === 'loggedIn') {
            const userName = localStorage.getItem('userName');
            const userPicture = localStorage.getItem('userPicture');
            headerHTML = `<div class="user-info"><img src="${userPicture || '../assets/images/default-avatar.png'}" alt="Profile Picture" class="profile-picture"><div class="welcome-message">Welcome, <span id="user-name">${userName || 'User'}</span>!</div></div><button id="logout-btn" class="logout-button">Logout</button>`;
        } else {
            headerHTML = `<div class="site-title">Portfolio<span>Morph</span></div><a href="${loginPageUrl}" id="login-btn" class="login-button">Login</a>`;
        }
        header.innerHTML = headerHTML;
        if (userStatus === 'loggedIn') {
            document.getElementById('logout-btn').addEventListener('click', () => { localStorage.clear(); window.location.href = loginPageUrl; });
        } else if(document.getElementById('login-btn')) {
            document.getElementById('login-btn').addEventListener('click', (event) => { event.preventDefault(); localStorage.removeItem('userStatus'); window.location.href = loginPageUrl; });
        }
    }
    
    const openPanel = () => { editingPanel.classList.add('visible'); panelBackdrop.classList.add('visible'); };
    const closePanel = () => { editingPanel.classList.remove('visible'); panelBackdrop.classList.remove('visible'); };
    editPanelBtn.addEventListener('click', openPanel);
    closePanelBtn.addEventListener('click', closePanel);
    panelBackdrop.addEventListener('click', closePanel);

    function postMessageToPreviews(message) {
        if (mainPreviewFrame?.contentWindow) {
            mainPreviewFrame.contentWindow.postMessage(message, '*');
        }
        if (miniPreviewFrame?.contentWindow) {
            miniPreviewFrame.contentWindow.postMessage(message, '*');
        }
    }

    function setTheme(theme) {
        window.portfolioData.theme = theme;
        localStorage.setItem('selectedTheme', theme);
        document.querySelectorAll('.control-btn[data-theme]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
        
        // THE KEY FIX: Send the correct message type for theme changes
        postMessageToPreviews({ 
            type: 'themeChange', 
            theme: window.portfolioData.theme 
        });
    }

    function setupThemeButtonListeners() {
        document.querySelectorAll('.control-btn[data-theme]').forEach(btn => {
            btn.addEventListener('click', () => setTheme(btn.dataset.theme));
        });
    }

    // --- 6. INITIALIZATION & EVENT LISTENERS ---
    const userStatus = localStorage.getItem('userStatus');
    if (!userStatus) {
        window.location.href = '../login.html'; 
        return;
    }
    
    buildHeader(userStatus);
    setupThemeButtonListeners();

    formControlsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-section-btn')) {
            const sectionKey = event.target.dataset.section;
            if (sectionKey && window.portfolioData[sectionKey]) {
                window.portfolioData[sectionKey].enabled = false;
                window.sendFullUpdate();
                buildForm();
            }
        }
    });

    document.body.addEventListener('click', (event) => {
        const openDialog = document.querySelector('.icon-dialog');
        if (openDialog && !openDialog.contains(event.target) && !event.target.closest('.manage-icon-btn')) {
            openDialog.remove();
        }
    });

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
        const config = templateConfig[selectedTemplate] || templateConfig.template1;
        if (miniPreviewContainer) {
            miniPreviewContainer.style.aspectRatio = `${config.realWidth} / ${config.realHeight}`;
        }
        miniPreviewFrame.style.width = `${config.realWidth}px`;
        miniPreviewFrame.style.height = `${config.realHeight}px`;
        const scaleFactor = config.scaleNumerator / config.realWidth;
        miniPreviewFrame.style.transform = `scale(${scaleFactor})`;
        
        buildForm(); 
        setTheme(window.portfolioData.theme);
    };
});