// /js/builder.js

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

    // --- 1. TEMPLATE & DATA CONFIG ---
    const TEMPLATE_CONFIG = {
        template1: {
            sections: ['hero', 'about', 'skills', 'experience', 'projects', 'contact', 'footer'],
            cssFiles: ['common.css', 'skills.css', 'experience.css', 'projects.css', 'contact.css'],
            realWidth: 1400, realHeight: 800, scaleNumerator: 380
        },
        template2: {
            sections: ['hero'],
            cssFiles: ['common.css'],
            realWidth: 1200, realHeight: 800, scaleNumerator: 380
        }
    };

    // --- 2. ELEMENT SELECTION ---
    const header = document.querySelector('.main-header');
    const mainPreviewFrame = document.getElementById('main-preview-frame');
    const miniPreviewFrame = document.getElementById('mini-preview-frame');
    const miniPreviewContainer = document.getElementById('mini-preview-container');
    const editPanelBtn = document.getElementById('edit-panel-btn');
    const editingPanel = document.getElementById('editing-panel');
    const closePanelBtn = document.getElementById('close-panel-btn');
    const panelBackdrop = document.getElementById('panel-backdrop');
    const formControlsContainer = document.getElementById('form-controls');
    const submitBtn = document.getElementById('submit-btn');
    const downloadFabContainer = document.getElementById('download-fab-container');
    const downloadCodeBtn = document.getElementById('download-code-btn');
    const downloadOverlay = document.getElementById('download-overlay');
    const downloadPopup = document.getElementById('download-popup');
    const popupLoadingState = document.getElementById('popup-loading-state');
    const popupReadyState = document.getElementById('popup-ready-state');
    const finalDownloadLink = document.getElementById('final-download-link');
    const loadingMessagesContainer = document.getElementById('loading-messages');
    const closePopupBtn = document.getElementById('close-popup-btn');

    // --- 3. DYNAMIC INITIALIZATION ---
    const urlParams = new URLSearchParams(window.location.search);
    const templateId = urlParams.get('template');
    window.isFormDirty = false;

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(script);
            script.onerror = () => reject(new Error(`Script load error for ${src}`));
            document.head.append(script);
        });
    }

    function loadTemplateFormAssets(templateId) {
        document.querySelectorAll('link[data-template-form-style]').forEach(el => el.remove());
        const config = TEMPLATE_CONFIG[templateId];
        if (config && config.cssFiles) {
            config.cssFiles.forEach(fileName => {
                const cssPath = `css/forms/${templateId}/${fileName}`;
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = cssPath;
                link.setAttribute('data-template-form-style', 'true');
                document.head.appendChild(link);
            });
        }
    }

    async function initializeApp() {
        if (!templateId || !TEMPLATE_CONFIG[templateId]) {
            document.body.innerHTML = '<h2>Error: Invalid or no template selected. Please go back.</h2>';
            return;
        }

        try {
            await loadScript(`js/data/${templateId}-data.js`);
        } catch (error) {
            console.error(`Could not load data file for ${templateId}`, error);
            document.body.innerHTML = '<h2>Error: Could not load template data.</h2>';
            return;
        }

        loadTemplateFormAssets(templateId);

        const templateUrl = `templates/${templateId}/index.html`;
        mainPreviewFrame.src = templateUrl;
        miniPreviewFrame.src = templateUrl;

        mainPreviewFrame.onload = () => {
            console.log(`Main preview for ${templateId} loaded.`);
            const config = TEMPLATE_CONFIG[templateId];
            if (miniPreviewContainer) {
                miniPreviewContainer.style.aspectRatio = `${config.realWidth} / ${config.realHeight}`;
            }
            miniPreviewFrame.style.width = `${config.realWidth}px`;
            miniPreviewFrame.style.height = `${config.realHeight}px`;
            const scaleFactor = config.scaleNumerator / config.realWidth;
            miniPreviewFrame.style.transform = `scale(${scaleFactor})`;
            buildForm();
            setTheme(window.portfolioData.theme || 'light');
        };

        const userStatus = localStorage.getItem('userStatus');
        if (!userStatus) {
            window.location.href = '../login.html';
            return;
        }
        buildHeader(userStatus);
        setupThemeButtonListeners();
        
        downloadCodeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            startDownloadProcess();
        });

        formControlsContainer.addEventListener('click', (event) => {
            const target = event.target;
            const deleteBtn = target.closest('.delete-section-btn');
            
            if (deleteBtn) {
                const sectionEl = deleteBtn.closest('.form-section');
                if (!sectionEl) return;

                const sectionKey = sectionEl.dataset.sectionKey;
                
                if (window.portfolioData.sections && window.portfolioData.sections[sectionKey]) {
                    window.portfolioData.sections[sectionKey].enabled = false;
                } else if (window.portfolioData[sectionKey]) {
                    window.portfolioData[sectionKey].enabled = false;
                }
                
                window.isFormDirty = true;
                window.sendFullUpdate();

                sectionEl.classList.add('form-section--removing');
                setTimeout(() => {
                    sectionEl.remove();
                }, 350);
                
                return;
            }
            
            const header = target.closest('.form-section-header');
            if (header) {
                const section = header.parentElement;
                const wasActive = section.classList.contains('active');
                
                const currentlyActive = formControlsContainer.querySelector('.form-section.active');
                if (currentlyActive && currentlyActive !== section) {
                    currentlyActive.classList.remove('active');
                }
                
                section.classList.toggle('active');
            }
        });
        
        window.addEventListener('message', (event) => { if (event.data?.type === 'iframeClick' && editingPanel.classList.contains('visible')) closePanel(); });
        document.body.addEventListener('click', (event) => { const openDialog = document.querySelector('.icon-dialog'); if (openDialog && !openDialog.contains(event.target) && !openDialog.closest('.manage-icon-btn')) openDialog.remove(); });
    }

    // --- 4. MASTER FORM BUILDER ---
    async function buildForm() {
        formControlsContainer.innerHTML = '';
        const iframeDoc = mainPreviewFrame.contentDocument;
        const config = TEMPLATE_CONFIG[templateId];
        if (!config) return;

        const modulePromises = config.sections.map(sectionName => {
            const modulePath = `./forms/${templateId}/${sectionName}.js`;
            return import(modulePath).catch(error => {
                console.error(`Failed to load form module for section: ${sectionName}`, error);
                return null;
            });
        });

        const modules = await Promise.all(modulePromises);

        modules.forEach((module) => {
            if (module && module.default && typeof module.default === 'function') {
                // Pass nothing for buildFormCallback as it's no longer needed
                module.default(formControlsContainer, window.portfolioData, iframeDoc);
            }
        });

        // ================== START: RESTORE DEFAULT OPEN SECTION ==================
        // After building the form for the first time, open the 'hero' section by default.
        const heroSection = formControlsContainer.querySelector('[data-section-key="hero"]');
        if (heroSection) {
            heroSection.classList.add('active');
        }
        // =================== END: RESTORE DEFAULT OPEN SECTION ===================
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
    const closePanel = () => { editingPanel.classList.remove('visible'); panelBackdrop.classList.remove('visible'); if (window.isFormDirty) { downloadFabContainer.classList.remove('hidden'); } };
    editPanelBtn.addEventListener('click', openPanel);
    closePanelBtn.addEventListener('click', closePanel);
    panelBackdrop.addEventListener('click', closePanel);
    submitBtn.addEventListener('click', closePanel);
    function postMessageToPreviews(message) { const allIframes = document.querySelectorAll('iframe'); allIframes.forEach(frame => { if (frame.contentWindow) { frame.contentWindow.postMessage(message, '*'); } }); }
    function setTheme(theme) { window.portfolioData.theme = theme; localStorage.setItem('selectedTheme', theme); document.querySelectorAll('.control-btn[data-theme]').forEach(btn => { btn.classList.toggle('active', btn.dataset.theme === theme); }); editingPanel.classList.toggle('dark', theme === 'dark'); postMessageToPreviews({ type: 'themeChange', theme: window.portfolioData.theme }); }
    function setupThemeButtonListeners() { editingPanel.addEventListener('click', (event) => { const themeBtn = event.target.closest('.control-btn[data-theme]'); if (themeBtn) { setTheme(themeBtn.dataset.theme); } }); }

    // --- 6. CODE GENERATION & DOWNLOAD PROCESS ---
    let messageInterval = null;
    function closePopup() { downloadOverlay.classList.add('hidden'); if (messageInterval) { clearInterval(messageInterval); messageInterval = null; } }
    closePopupBtn.addEventListener('click', closePopup);
    downloadOverlay.addEventListener('click', (event) => { if (event.target === downloadOverlay) { closePopup(); } });
    async function startDownloadProcess() {
        downloadOverlay.classList.remove('hidden');
        popupLoadingState.classList.remove('hidden');
        popupReadyState.classList.add('hidden');
        finalDownloadLink.classList.add('hidden');
        popupReadyState.querySelector('h2').textContent = "Your Portfolio is Ready!";
        popupReadyState.querySelector('p').textContent = "Your personalized website has been generated successfully.";
        const messages = loadingMessagesContainer.querySelectorAll('.loading-message');
        messages.forEach(msg => msg.classList.remove('visible'));
        let currentMessageIndex = 0;
        messages[0].classList.add('visible');
        messageInterval = setInterval(() => { messages[currentMessageIndex].classList.remove('visible'); currentMessageIndex = (currentMessageIndex + 1) % messages.length; messages[currentMessageIndex].classList.add('visible'); }, 1500);
        try {
            const zipPromise = generateZip();
            const minDelayPromise = new Promise(resolve => setTimeout(resolve, 3000));
            const [zipBlob] = await Promise.all([zipPromise, minDelayPromise]);
            clearInterval(messageInterval);
            messageInterval = null;
            popupLoadingState.classList.add('hidden');
            popupReadyState.classList.remove('hidden');
            const url = URL.createObjectURL(zipBlob);
            finalDownloadLink.href = url;
            finalDownloadLink.classList.remove('hidden');
        } catch (error) {
            console.error("Failed to generate file:", error);
            clearInterval(messageInterval);
            messageInterval = null;
            if (popupLoadingState) { popupLoadingState.innerHTML = `<p style="color: red;">Error: Could not generate file.</p>`; }
        }
    }

    async function generateZip() {
        if (templateId === 'template1') {
            const zip = new JSZip();
            const templatePath = `templates/template1`;
            const data = window.portfolioData;
            const processedData = JSON.parse(JSON.stringify(data));
            const processFile = async (url, prefix, index, subfolder) => { if (!url) return 'assets/placeholder.png'; if (url.startsWith('data:')) { const response = await fetch(url); const blob = await response.blob(); const extension = blob.type.split('/')[1] || 'bin'; const newPath = `${subfolder}/${prefix}-${index}.${extension}`; zip.file(newPath, blob); return newPath; } try { const response = await fetch(`${templatePath}/${url}`); if (!response.ok) throw new Error('File not found'); const blob = await response.blob(); const newPath = `${subfolder}/${url.split('/').pop()}`; zip.file(newPath, blob); return newPath; } catch (e) { console.warn(`Default file not found: ${url}.`); return url; } };
            processedData.hero.profileImageUrl = await processFile(data.hero.profileImageUrl, 'profile', 0, 'images');
            processedData.hero.resumeUrl = await processFile(data.hero.resumeUrl, 'resume', 0, 'resume');
            for (const [index, project] of data.projects.list.entries()) { processedData.projects.list[index].imageUrl = await processFile(project.imageUrl, 'project', index, 'images'); }
            for (const [index, skill] of data.skills.list.entries()) { if (skill.iconClass && skill.iconClass.startsWith('data:image')) { processedData.skills.list[index].iconClass = await processFile(skill.iconClass, 'skill-icon', index, 'images'); } }
            const [styleCss, scriptJs, responsivenessCss] = await Promise.all([ fetch(`${templatePath}/style.css`).then(res => res.text()), fetch(`${templatePath}/script.js`).then(res => res.text()), fetch(`${templatePath}/responsiveness.css`).then(res => res.text()) ]);
            const buildFinalHtml = (data) => { const buildSectionHTML = (sectionKey, id, title, contentGenerator) => { if (!data[sectionKey]?.enabled) return ''; const className = id.replace('1', '-section'); const hrId = id.replace('1', ''); return `\n        <hr id="${hrId}">\n        <section id="${id}" class="${className}">\n            <div class="container">\n                <h2 class="section-title ${hrId}">${title}</h2>\n                ${contentGenerator()}\n            </div>\n        </section>`; }; const buildSkillsContent = () => { return `<div class="skills-grid">${data.skills.list.map(skill => { let iconHTML = ''; if (data.skills.iconsEnabled && skill.name) { const finalIcon = data.skills.globalIconOverride || skill.iconClass; if (finalIcon) { iconHTML = finalIcon.includes('/') ? `<img src="${finalIcon}" alt="" class="custom-skill-icon">` : `<i class="${finalIcon}"></i>`; } } return `<div class="skill-item">${iconHTML} ${skill.name}</div>`; }).join('\n                        ')}</div>`; }; const buildExperienceContent = () => { const items = data.experience.list.map(item => { const pointsHTML = item.points.map(point => `<li>${point}</li>`).join('\n                                '); const dateRange = `${item.startYear || ''} - ${item.isPresent ? 'Present' : item.endYear || ''}`; return `<div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-content"><h3>${item.title || ''}</h3><p class="company">${item.company || ''} | ${dateRange}</p><ul>${pointsHTML}</ul></div></div>`; }).join('\n                        '); return `<div class="timeline">${items}</div>`; }; const buildProjectsContent = () => { const items = data.projects.list.map(project => { const imageHTML = (data.projects.imagesEnabled && project.imageUrl) ? `<img src="${project.imageUrl}" alt="${project.title || 'Project'} Screenshot">` : ''; return `<div class="project-card">${imageHTML}<h3>${project.title || ''}</h3><p>${project.description || ''}</p><div class="project-links"><a href="${project.link || '#'}" target="_blank">View</a></div></div>`; }).join('\n                        '); return `<div class="projects-grid">${items}</div>`; }; const buildContactContent = () => { const socialLinks = data.contact.socialsEnabled ? data.contact.social.map(social => social.url ? `<a href="${social.url}" target="_blank"><i class="fab fa-${social.type}"></i></a>` : '' ).join('\n                        ') : ''; const socialHTML = data.contact.socialsEnabled ? `<div class="social-links"><h2>Connect With Me</h2>${socialLinks}</div>` : ''; return `<p>${data.contact.intro || ''}</p><div class="contact-info"><p><i class="fas fa-envelope"></i> Email: <a href="mailto:${data.contact.email}">${data.contact.email}</a></p><p><i class="fas fa-phone"></i> Phone: <a href="tel:${data.contact.phone}">${data.contact.phone}</a></p><p><i class="fas fa-map-marker-alt"></i> Location: ${data.contact.location}</p></div>${socialHTML}<a href="mailto:${data.contact.email}" class="btn btn-primary">${data.contact.buttonText || 'Say Hello'}</a>`; }; const buildFooterHTML = () => { if (!data.footer.enabled) return ''; const year = data.footer.year || new Date().getFullYear(); const name = data.footer.name || 'Your Name'; const copyrightText = data.footer.customText || `© ${year} ${name}. All Rights Reserved.`; return `<footer id="footer" class="footer"><div class="container"><p>${copyrightText}</p></div></footer>`; }; return `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>${data.navigation.logoText || 'Portfolio'} | Portfolio</title>\n    <link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">\n    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossorigin="anonymous" referrerpolicy="no-referrer" />\n    <link rel="stylesheet" href="style.css">\n    <link rel="stylesheet" href="responsiveness.css">\n</head>\n<body${data.theme === 'dark' ? ' class="dark"' : ''}>\n    <header class="header">\n        <div class="container"><nav class="main-nav"><a href="#hero" class="logo">${data.navigation.logoText}</a><ul class="nav-links">${data.about.enabled ? '<li><a href="#about">About</a></li>' : ''}${data.experience.enabled ? '<li><a href="#experience">Experience</a></li>' : ''}${data.projects.enabled ? '<li><a href="#projects">Projects</a></li>' : ''}${data.contact.enabled ? '<li><a href="#contact">Contact</a></li>' : ''}</ul><div class="hamburger" onclick="toggleMenu()"><span></span><span></span><span></span></div><div class="mobile-menu" id="mobileMenu"><ul>${data.about.enabled ? '<li><a href="#about" onclick="closeMenu()">About</a></li>' : ''}${data.experience.enabled ? '<li><a href="#experience" onclick="closeMenu()">Experience</a></li>' : ''}${data.projects.enabled ? '<li><a href="#projects" onclick="closeMenu()">Projects</a></li>' : ''}${data.contact.enabled ? '<li><a href="#contact" onclick="closeMenu()">Contact</a></li>' : ''}</ul></div></nav></div>\n    </header>\n    <main>\n        <section id="hero" class="hero"><div class="container hero-content"><div class="hero-text"><h1>${data.hero.name}</h1><p class="subtitle">${data.hero.subtitle}</p><div class="hero-buttons"><a href="${data.contact.enabled ? '#contact' : '#'}" class="btn btn-primary">Get in Touch</a><a href="${data.hero.resumeUrl}" class="btn btn-secondary" download>Download Resume <i class="fas fa-download"></i></a></div></div><div class="hero-image"><img src="${data.hero.profileImageUrl}" alt="Profile photo"></div></div></section>\n        ${data.about.enabled ? `<hr id="about"><section id="about1" class="about-section"><div class="container"><h2 class="section-title about">About Me</h2><p>${data.about.description}</p></div></section>` : ''}\n        ${data.skills.enabled ? `<section id="skills" class="skills-section"><div class="container"><h2 class="section-title skills">My Skills</h2>${buildSkillsContent()}</div></section>` : ''}\n        ${buildSectionHTML('experience', 'experience1', 'Work Experience', buildExperienceContent)}\n        ${buildSectionHTML('projects', 'projects1', 'My Projects', buildProjectsContent)}\n        ${buildSectionHTML('contact', 'contact1', 'Get In Touch', buildContactContent)}\n    </main>\n    ${buildFooterHTML()}\n    <script src="script.js"></script>\n</body>\n</html>`;}
            const finalGeneratedHTML = buildFinalHtml(processedData);
            zip.file("index.html", finalGeneratedHTML); zip.file("style.css", styleCss); zip.file("script.js", scriptJs); zip.file("responsiveness.css", responsivenessCss);
            return await zip.generateAsync({ type: "blob" });

        } else if (templateId === 'template2') {
            alert('Download for Template 2 is not yet implemented.');
            throw new Error('Download for T2 not implemented.');
        }
    }
    
    // --- 7. KICK OFF THE APPLICATION ---
    initializeApp();
});