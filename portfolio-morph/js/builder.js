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

    // --- 2. TEMPLATE CONFIG & ICON PREDICTION ENGINE ---
    const templateConfig = {
        template1: { realWidth: 1400, realHeight: 800, scaleNumerator: 375 },
        template2: { realWidth: 1400, realHeight: 800, scaleNumerator: 390 },
        template3: { realWidth: 1400, realHeight: 800, scaleNumerator: 390 }
    };
    
    const skillIconMap = {
        'html': { class: 'fab fa-html5', name: 'HTML5' },
        'css': { class: 'fab fa-css3-alt', name: 'CSS3' },
        'javascript': { class: 'fab fa-js-square', name: 'JavaScript' },
        'react': { class: 'fab fa-react', name: 'React' },
        'node': { class: 'fab fa-node-js', name: 'Node.js' },
        'python': { class: 'fab fa-python', name: 'Python' },
        'java': { class: 'fab fa-java', name: 'Java' },
        'git': { class: 'fab fa-git-alt', name: 'Git' },
        'github': { class: 'fab fa-github', name: 'GitHub' },
        'docker': { class: 'fab fa-docker', name: 'Docker' },
        'figma': { class: 'fab fa-figma', name: 'Figma' },
        'sql': { class: 'fas fa-database', name: 'Database' },
        'php': { class: 'fab fa-php', name: 'PHP' },
        'angular': { class: 'fab fa-angular', name: 'Angular' },
        'vue': { class: 'fab fa-vuejs', name: 'Vue.js' },
        'bootstrap': { class: 'fab fa-bootstrap', name: 'Bootstrap' },
        'sass': { class: 'fab fa-sass', name: 'Sass' },
        'less': { class: 'fab fa-less', name: 'Less' },
        'aws': { class: 'fab fa-aws', name: 'AWS' },
        // Aliases point to the primary keyword
        'js': 'javascript', 'es6': 'javascript', 'scss': 'sass',
    };

    function predictIcons(skillName) {
        if (!skillName) return [];
        const lowerCaseSkill = skillName.toLowerCase();
        const matches = new Set();
        for (const keyword in skillIconMap) {
            let iconData = skillIconMap[keyword];
            if (typeof iconData === 'string') {
                iconData = skillIconMap[iconData];
            }
            if (lowerCaseSkill.includes(keyword)) {
                matches.add(iconData);
            }
        }
        matches.add({ class: 'fas fa-code', name: 'Generic' });
        matches.add({ class: 'fas fa-star', name: 'Star' });
        return Array.from(matches).slice(0, 8); // Return up to 8 matches
    }
    
    // --- 3. DATA SETUP ---
    const urlParams = new URLSearchParams(window.location.search);
    const selectedTemplate = urlParams.get('template');
    
    let portfolioData = {
        template: selectedTemplate,
        theme: localStorage.getItem('selectedTheme') || 'light',
        hero: { name: null, subtitle: null, resumeUrl: null, profileImageUrl: null },
        about: { description: null, enabled: true },
        skills: { list: [], enabled: true, iconsEnabled: true },
        contact: { email: null, phone: null, location: null, social: { linkedin: null, github: null, twitter: null }, enabled: true },
        footer: { copyright: null, enabled: true },
        experience: [],
        projects: [],
    };

    // --- 4. DYNAMIC FORM BUILDER ---
    function countWords(str) { if (!str) return 0; return str.trim().split(/\s+/).filter(word => word.length > 0).length; }

    function createInputField(label, propertyPath, placeholder = '', type = 'text', options = {}) {
        const { wordLimit = 0, minHeight = 'auto' } = options;
        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';
        wrapper.innerHTML = `<label>${label}</label>`;
        const isTextarea = type === 'textarea';
        const inputElement = document.createElement(isTextarea ? 'textarea' : 'input');
        if (!isTextarea) inputElement.type = 'text';
        else {
            inputElement.rows = 4;
            if (minHeight !== 'auto') inputElement.style.minHeight = `${minHeight}px`;
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
                warningElement.classList.remove('visible'); return;
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

    function buildTemplate1Form() {
        const formFragment = document.createDocumentFragment();
        const iframeDoc = mainPreviewFrame.contentDocument;
        
        // Hero and About Sections
        const heroSection = createFormSection('Hero Section', 'hero', false);
        const defaultName = iframeDoc.querySelector('.hero-text h1')?.textContent || '';
        const defaultSubtitle = iframeDoc.querySelector('.hero-text .subtitle')?.textContent || '';
        heroSection.appendChild(createInputField('Name / Main Heading', 'hero.name', defaultName, 'text', { wordLimit: 8 }));
        heroSection.appendChild(createInputField('Subtitle', 'hero.subtitle', defaultSubtitle, 'textarea', { wordLimit: 15 }));
        const imageValidation = { minHeight: 550, maxWidth: 625, aspectRatio: 1, ratioTolerance: 0.2 };
        heroSection.appendChild(createFileInput('Profile Image', 'hero.profileImageUrl', 'image/*', imageValidation));
        heroSection.appendChild(createFileInput('Resume File', 'hero.resumeUrl', '.pdf,.doc,.docx'));
        formFragment.appendChild(heroSection);
        if (portfolioData.about.enabled) {
            const aboutSection = createFormSection('About Section', 'about', true);
            const defaultAbout = iframeDoc.querySelector('.about-section p')?.textContent || '';
            aboutSection.appendChild(createInputField('About Me Paragraph', 'about.description', defaultAbout, 'textarea', { wordLimit: 200, minHeight: 160 }));
            formFragment.appendChild(aboutSection);
        }
        
        // Skills Section
        if (portfolioData.skills.enabled) {
            const skillsSection = createFormSection('Skills Section', 'skills', true);
            const masterToggleWrapper = document.createElement('div');
            masterToggleWrapper.className = 'section-controls';
            masterToggleWrapper.innerHTML = `<label for="disable-all-icons-toggle">Enable Automatic Icons</label><input type="checkbox" id="disable-all-icons-toggle">`;
            const disableToggle = masterToggleWrapper.querySelector('#disable-all-icons-toggle');
            disableToggle.checked = portfolioData.skills.iconsEnabled;
            disableToggle.onchange = (e) => {
                portfolioData.skills.iconsEnabled = e.target.checked;
                sendFullUpdate();
            };
            skillsSection.appendChild(masterToggleWrapper);
            if (portfolioData.skills.list.length === 0 && iframeDoc.readyState === 'complete') {
                portfolioData.skills.list = Array.from(iframeDoc.querySelectorAll('.skills-grid .skill-item')).map((item, index) => ({
                    id: Date.now() + index, name: item.textContent.trim(), iconClass: predictIcons(item.textContent.trim())[0]?.class || skillIconMap.default.class
                }));
            }
            const skillListContainer = document.createElement('div');
            skillListContainer.className = 'skill-list';
            portfolioData.skills.list.forEach(skill => {
                const skillFormItem = document.createElement('div');
                skillFormItem.className = 'skill-item-form';
                const iconPreview = document.createElement('i');
                const predictedIcon = predictIcons(skill.name)[0];
                iconPreview.className = `predicted-icon ${skill.iconClass || predictedIcon.class}`;
                const input = document.createElement('input');
                input.type = 'text';
                input.value = skill.name;
                input.placeholder = 'e.g., React';
                input.oninput = (e) => {
                    skill.name = e.target.value;
                    skill.iconClass = predictIcons(skill.name)[0].class;
                    iconPreview.className = `predicted-icon ${skill.iconClass}`;
                    sendFullUpdate();
                };
                const manageBtn = document.createElement('button');
                manageBtn.className = 'manage-icon-btn';
                manageBtn.title = 'Manage Icon';
                manageBtn.innerHTML = `<svg viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path></svg><span>Manage</span>`;
                manageBtn.onclick = () => { toggleIconDialog(skill, skillFormItem); };
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-item-btn';
                deleteBtn.innerHTML = '&times;';
                deleteBtn.title = 'Delete Skill';
                deleteBtn.onclick = () => {
                    portfolioData.skills.list = portfolioData.skills.list.filter(s => s.id !== skill.id);
                    sendFullUpdate();
                    buildForm();
                };
                skillFormItem.appendChild(iconPreview);
                skillFormItem.appendChild(input);
                skillFormItem.appendChild(manageBtn);
                skillFormItem.appendChild(deleteBtn);
                skillListContainer.appendChild(skillFormItem);
            });
            skillsSection.appendChild(skillListContainer);
            if (portfolioData.skills.list.length < 15) {
                const addBtn = document.createElement('button');
                addBtn.className = 'add-item-btn';
                addBtn.textContent = '+ Add Skill';
                addBtn.onclick = () => {
                    if (portfolioData.skills.list.length < 15) {
                        portfolioData.skills.list.push({ id: Date.now(), name: '', iconClass: skillIconMap.default.class });
                    }
                    sendFullUpdate();
                    buildForm();
                };
                skillsSection.appendChild(addBtn);
            }
            formFragment.appendChild(skillsSection);
        }

        formControlsContainer.appendChild(formFragment);
    }
    
    // --- 5. INLINE ICON DIALOG LOGIC ---
    function toggleIconDialog(skill, parentElement) {
        const existingDialog = document.querySelector('.icon-dialog');
        if (existingDialog) existingDialog.remove();
        const dialogForThisSkill = parentElement.querySelector('.icon-dialog');
        if (dialogForThisSkill) {
            dialogForThisSkill.remove();
            return;
        }
        const dialog = document.createElement('div');
        dialog.className = 'icon-dialog';
        dialog.dataset.skillId = skill.id;
        dialog.innerHTML = `
            <div class="icon-dialog-nav">
                <button data-tab="automatic" class="active">Automatic</button>
                <button data-tab="custom">Custom Upload</button>
                <button data-tab="library">Library</button>
            </div>
            <div id="tab-automatic" class="icon-dialog-tab-content active">
                <p class="panel-label">Suggestions based on skill name:</p>
                <div class="icon-suggestion-grid"></div>
            </div>
            <div id="tab-custom" class="icon-dialog-tab-content"><p>Custom upload coming soon.</p></div>
            <div id="tab-library" class="icon-dialog-tab-content"><p>Category library coming soon.</p></div>
        `;
        parentElement.appendChild(dialog);
        const suggestionGrid = dialog.querySelector('.icon-suggestion-grid');
        const suggestions = predictIcons(skill.name);
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'icon-suggestion-item';
            if (skill.iconClass === suggestion.class) {
                item.classList.add('selected');
            }
            item.innerHTML = `<i class="${suggestion.class}"></i><span>${suggestion.name}</span>`;
            item.onclick = () => {
                skill.iconClass = suggestion.class;
                sendFullUpdate();
                const iconPreview = parentElement.querySelector('.predicted-icon');
                if (iconPreview) iconPreview.className = `predicted-icon ${suggestion.class}`;
                dialog.remove();
            };
            suggestionGrid.appendChild(item);
        });
        const navButtons = dialog.querySelectorAll('.icon-dialog-nav button');
        const tabContents = dialog.querySelectorAll('.icon-dialog-tab-content');
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                navButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                button.classList.add('active');
                dialog.querySelector(`#tab-${button.dataset.tab}`).classList.add('active');
            });
        });
        setTimeout(() => dialog.classList.add('visible'), 10);
    }

    // --- 6. PREVIEW COMMUNICATION ---
    function sendFullUpdate() { postMessageToPreviews({ type: 'fullUpdate', data: portfolioData }); }
    function postMessageToPreviews(message) {
        if (mainPreviewFrame.contentWindow) mainPreviewFrame.contentWindow.postMessage(message, '*');
        if (miniPreviewFrame.contentWindow) miniPreviewFrame.contentWindow.postMessage(message, '*');
    }
    
    // --- 7. HELPER FUNCTIONS ---
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
    
    // --- 8. THEME, HEADER, PANEL LOGIC ---
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

    // --- 9. INITIALIZATION & EVENT LISTENERS ---
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
        setTheme(portfolioData.theme);
    };
});