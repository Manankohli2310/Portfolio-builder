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

    // --- 2. TEMPLATE CONFIG & DATA SETUP ---
    const templateConfig = {
        template1: { realWidth: 1400, realHeight: 800, scaleNumerator: 375 },
        template2: { realWidth: 1400, realHeight: 800, scaleNumerator: 390 },
        template3: { realWidth: 1400, realHeight: 800, scaleNumerator: 390 }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const selectedTemplate = urlParams.get('template');
    
    let portfolioData = {
        template: selectedTemplate,
        theme: localStorage.getItem('selectedTheme') || 'light',
        hero: { name: null, subtitle: null, resumeUrl: null, profileImageUrl: null },
        about: { description: null, enabled: true },
        contact: { email: null, phone: null, location: null, social: { linkedin: null, github: null, twitter: null }, enabled: true },
        footer: { copyright: null, enabled: true },
        skills: [],
        experience: [],
        projects: [],
    };

    // --- 3. DYNAMIC FORM BUILDER ---

    function countWords(str) {
        if (!str) return 0;
        return str.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    // UPDATED: createInputField now accepts an 'options' object
    function createInputField(label, propertyPath, placeholder = '', type = 'text', options = {}) {
        const { wordLimit = 0, minHeight = 'auto' } = options;
        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';
        wrapper.innerHTML = `<label>${label}</label>`;
        const isTextarea = type === 'textarea';
        const inputElement = document.createElement(isTextarea ? 'textarea' : 'input');
        
        if (!isTextarea) {
            inputElement.type = 'text';
        } else {
            inputElement.rows = 4; // A fallback
            if (minHeight !== 'auto') {
                inputElement.style.minHeight = `${minHeight}px`;
            }
        }
        
        inputElement.value = placeholder;
        
        let warningElement;
        if (wordLimit > 0) {
            warningElement = document.createElement('p');
            warningElement.className = 'word-limit-warning';
            const initialWordCount = countWords(placeholder);
            warningElement.textContent = `${initialWordCount} / ${wordLimit} words`;
            if (initialWordCount > wordLimit) warningElement.classList.add('visible');
        }

        inputElement.addEventListener('input', (e) => {
            const currentText = e.target.value;
            if (wordLimit > 0) {
                const wordCount = countWords(currentText);
                warningElement.textContent = `${wordCount} / ${wordLimit} words`;
                warningElement.classList.toggle('visible', wordCount > wordLimit);
            }
            setObjectValue(portfolioData, propertyPath, currentText);
            sendFullUpdate();
        });
        
        wrapper.appendChild(inputElement);
        if (warningElement) wrapper.appendChild(warningElement);
        return wrapper;
    }

    function createFileInput(label, propertyPath, accept, validation = {}) {
        const { minHeight = 0, maxWidth = 0, aspectRatio = 0, ratioTolerance = 0.1 } = validation;
        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';
        wrapper.innerHTML = `<label>${label}</label>`;
        const inputElement = document.createElement('input');
        inputElement.type = 'file';
        inputElement.accept = accept;
        const warningElement = document.createElement('p');
        warningElement.className = 'file-limit-warning';
        inputElement.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) {
                warningElement.classList.remove('visible');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                const fileUrl = event.target.result;
                if (file.type.startsWith('image/') && (minHeight > 0 || maxWidth > 0 || aspectRatio > 0)) {
                    const img = new Image();
                    img.onload = () => {
                        const meetsDimensionRules = (img.naturalHeight >= minHeight && img.naturalWidth <= maxWidth);
                        const actualRatio = img.naturalWidth / img.naturalHeight;
                        const lowerBound = aspectRatio - ratioTolerance;
                        const upperBound = aspectRatio + ratioTolerance;
                        const meetsAspectRatioRule = (actualRatio >= lowerBound && actualRatio <= upperBound);
                        const isImageValid = meetsDimensionRules || meetsAspectRatioRule;
                        if (!isImageValid) {
                            warningElement.textContent = `Image size is wrong (should be nearly square).`;
                            warningElement.classList.add('visible');
                            e.target.value = '';
                        } else {
                            warningElement.classList.remove('visible');
                            setObjectValue(portfolioData, propertyPath, fileUrl);
                            sendFullUpdate();
                        }
                    };
                    img.src = fileUrl;
                } else {
                    warningElement.classList.remove('visible');
                    setObjectValue(portfolioData, propertyPath, fileUrl);
                    sendFullUpdate();
                }
            };
            reader.readAsDataURL(file);
        });
        wrapper.appendChild(inputElement);
        wrapper.appendChild(warningElement);
        return wrapper;
    }
    
    function createFormSection(title, sectionKey, isRemovable = false) {
        const section = document.createElement('div');
        section.className = 'form-section';
        const titleElement = document.createElement('h4');
        titleElement.textContent = title;
        if (isRemovable) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-section-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.title = `Remove ${title}`;
            deleteBtn.dataset.section = sectionKey;
            titleElement.appendChild(deleteBtn);
        }
        section.appendChild(titleElement);
        return section;
    }

    function buildForm() {
        formControlsContainer.innerHTML = '';
        if (selectedTemplate === 'template1') {
            buildTemplate1Form();
        }
    }

    // CORRECTED: buildTemplate1Form with proper options object
    function buildTemplate1Form() {
        const formFragment = document.createDocumentFragment();
        const iframeDoc = mainPreviewFrame.contentDocument;
        
        const heroSection = createFormSection('Hero Section', 'hero', false);
        const defaultName = iframeDoc.querySelector('.hero-text h1')?.textContent || '';
        const defaultSubtitle = iframeDoc.querySelector('.hero-text .subtitle')?.textContent || '';
        
        // Correctly pass options as an object
        heroSection.appendChild(createInputField('Name / Main Heading', 'hero.name', defaultName, 'text', { wordLimit: 8 }));
        heroSection.appendChild(createInputField('Subtitle', 'hero.subtitle', defaultSubtitle, 'textarea', { wordLimit: 15 }));
        
        const imageValidation = { 
            minHeight: 550, 
            maxWidth: 625,
            aspectRatio: 1,
            ratioTolerance: 0.2
        };
        heroSection.appendChild(createFileInput('Profile Image', 'hero.profileImageUrl', 'image/*', imageValidation));
        
        heroSection.appendChild(createFileInput('Resume File', 'hero.resumeUrl', '.pdf,.doc,.docx'));
        formFragment.appendChild(heroSection);

        if (portfolioData.about.enabled) {
            const aboutSection = createFormSection('About Section', 'about', true);
            const defaultAbout = iframeDoc.querySelector('.about-section p')?.textContent || '';
            
            // Correctly pass options for the "About Me" textarea
            const aboutOptions = { wordLimit: 200, minHeight: 220 };
            aboutSection.appendChild(createInputField('About Me Paragraph', 'about.description', defaultAbout, 'textarea', aboutOptions));
            
            formFragment.appendChild(aboutSection);
        }

        formControlsContainer.appendChild(formFragment);
    }

    // --- 4. PREVIEW COMMUNICATION ---
    function sendFullUpdate() { postMessageToPreviews({ type: 'fullUpdate', data: portfolioData }); }
    function postMessageToPreviews(message) {
        if (mainPreviewFrame.contentWindow) mainPreviewFrame.contentWindow.postMessage(message, '*');
        if (miniPreviewFrame.contentWindow) miniPreviewFrame.contentWindow.postMessage(message, '*');
    }
    
    // --- 5. HELPER FUNCTIONS ---
    function getObjectValue(obj, path) { return path.split('.').reduce((acc, part) => acc && acc[part], obj); }
    function setObjectValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((acc, part) => {
            if (acc && typeof acc[part] !== 'undefined') { return acc[part]; }
            return {};
        }, obj);
        if (target && typeof target === 'object') { target[lastKey] = value; }
    }
    
    // --- 6. THEME, HEADER, PANEL LOGIC ---
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

    function setTheme(theme) {
        portfolioData.theme = theme;
        localStorage.setItem('selectedTheme', theme);
        document.querySelectorAll('.control-btn[data-theme]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
        postMessageToPreviews({ type: 'themeChange', theme: portfolioData.theme });
    }

    function setupThemeButtonListeners() {
        document.querySelectorAll('.control-btn[data-theme]').forEach(btn => {
            btn.addEventListener('click', () => setTheme(btn.dataset.theme));
        });
    }

    // --- 7. INITIALIZATION & EVENT LISTENERS ---
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
            if (sectionKey && portfolioData[sectionKey]) {
                portfolioData[sectionKey].enabled = false;
                sendFullUpdate();
                buildForm();
            }
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
        setTheme(portfolioData.theme);
    };
});