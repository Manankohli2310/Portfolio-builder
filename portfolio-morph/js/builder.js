// This is the main builder CONTROLLER. It orchestrates everything.

// --- GLOBAL SHARED FUNCTIONS ---
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
        template1: { realWidth: 1400, realHeight: 800, scaleNumerator: 380 },
        template2: { realWidth: 1400, realHeight: 800, scaleNumerator: 390 },
        template3: { realWidth: 1400, realHeight: 800, scaleNumerator: 390 }
    };
    
    // --- 3. GLOBAL DATA & STATE SETUP ---
    const urlParams = new URLSearchParams(window.location.search);
    const selectedTemplate = urlParams.get('template');

    window.portfolioData = {
        template: selectedTemplate,
        theme: localStorage.getItem('selectedTheme') || 'light',
        hero: { name: null, subtitle: null, resumeUrl: null, profileImageUrl: null },
        about: { description: null, enabled: true },
        skills: { list: [], enabled: true, iconsEnabled: true, globalIconOverride: null },
        experience: { list: [], enabled: true },
        projects: { list: [], enabled: true, imagesEnabled: true },
        contact: {
            enabled: true,
            intro: null,
            email: null,
            phone: null,
            location: null,
            socialsEnabled: true, // The new master toggle
            social: [], // The dynamic array
            buttonText: null,
            isPopulated: false // Flag to get defaults once
        },
        footer: { copyright: null, enabled: true },
    };

    let activeSectionKey = 'hero';

    // --- 4. MASTER FORM BUILDER (with scroll/accordion fix) ---
    function buildForm() {
        let scrollPosition = 0;
        let keyToRestore = activeSectionKey;

        const activeSection = formControlsContainer.querySelector('.form-section.active');
        if (activeSection) {
            keyToRestore = activeSection.dataset.sectionKey;
            const activeScroller = activeSection.querySelector('.form-section-content');
            if (activeScroller) {
                scrollPosition = activeScroller.scrollTop;
            }
        }
        
        formControlsContainer.innerHTML = '';
        const iframeDoc = mainPreviewFrame.contentDocument;

        if (selectedTemplate === 'template1') {
            buildTemplate1HeroForm(formControlsContainer, window.portfolioData, iframeDoc);
            buildTemplate1AboutForm(formControlsContainer, window.portfolioData, iframeDoc);
            buildTemplate1SkillsForm(formControlsContainer, window.portfolioData, iframeDoc, buildForm);
            buildTemplate1ExperienceForm(formControlsContainer, window.portfolioData, iframeDoc, buildForm);
            buildTemplate1ProjectsForm(formControlsContainer, window.portfolioData, iframeDoc, buildForm);
            buildTemplate1ContactForm(formControlsContainer, window.portfolioData, iframeDoc, buildForm);
        }

        if (keyToRestore) {
            const sectionToReopen = formControlsContainer.querySelector(`[data-section-key="${keyToRestore}"]`);
            if (sectionToReopen) {
                sectionToReopen.classList.add('active');
                const newlyActiveScroller = sectionToReopen.querySelector('.form-section-content');
                if (newlyActiveScroller) {
                    requestAnimationFrame(() => {
                        newlyActiveScroller.scrollTop = scrollPosition;
                    });
                }
            }
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
        editingPanel.classList.toggle('dark', theme === 'dark');
        postMessageToPreviews({ type: 'themeChange', theme: window.portfolioData.theme });
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

    // ================== CORRECTED EVENT LISTENER ==================
    // This listener now correctly distinguishes between clicks on different elements.
    formControlsContainer.addEventListener('click', (event) => {
        const target = event.target;

        // CASE 1: Click was on a section's DELETE button
        const deleteBtn = target.closest('.delete-section-btn');
        if (deleteBtn) {
            const sectionEl = deleteBtn.closest('.form-section');
            const sectionKey = sectionEl.dataset.sectionKey;
            if (sectionKey && window.portfolioData[sectionKey]) {
                window.portfolioData[sectionKey].enabled = false;
                activeSectionKey = null;
                window.sendFullUpdate();
                buildForm();
            }
            return; // Stop processing this click
        }

        // CASE 2: Click was on a section HEADER (for accordion)
        const header = target.closest('.form-section-header');
        if (header) {
            const section = header.parentElement;
            const sectionKey = section.dataset.sectionKey;
            const wasActive = section.classList.contains('active');
            
            // Close all sections
            formControlsContainer.querySelectorAll('.form-section.active').forEach(sec => {
                sec.classList.remove('active');
            });

            // If the clicked section wasn't active, open it and save its key.
            if (!wasActive) {
                section.classList.add('active');
                activeSectionKey = sectionKey;
            } else {
                // Otherwise, it's now closed, so no section is active.
                activeSectionKey = null;
            }
            return; // Stop processing this click
        }

        // If the click was not on a delete button or a header (e.g., it was on "Manage Icon"),
        // this listener will do nothing, allowing the button's own .onclick handler in skills.js to function correctly.
    });
    // ===============================================================

    // This listener for closing the icon dialog is correct and separate.
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