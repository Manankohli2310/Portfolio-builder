function buildTemplate1HeroForm(formContainer, data, previewDoc) {
    const heroSection = document.createElement('div');
    heroSection.className = 'form-section';
    heroSection.dataset.sectionKey = 'hero';

    const header = document.createElement('div');
    header.className = 'form-section-header';
    header.innerHTML = `
        <h4>Main Section</h4>
        <div class="header-controls">
            <div class="arrow">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>
        </div>
    `;
    
    const content = document.createElement('div');
    content.className = 'form-section-content';

    // --- DEFINITIVE FIX FOR DATA INITIALIZATION ---

    // Step 1: Scrape all default values from the live preview.
    const defaultLogoText = previewDoc.querySelector('.logo')?.textContent || 'John Doe';
    const defaultName = previewDoc.querySelector('.hero-text h1')?.textContent || 'Your Name';
    const defaultSubtitle = previewDoc.querySelector('.hero-text .subtitle')?.textContent || 'Your subtitle here';

    // Step 2: If the data object is still null (on first run), immediately save the scraped values.
    if (data.navigation.logoText === null) {
        data.navigation.logoText = defaultLogoText;
    }
    if (data.hero.name === null) {
        data.hero.name = defaultName;
    }
    if (data.hero.subtitle === null) {
        data.hero.subtitle = defaultSubtitle;
    }

    // Step 3: Create the input fields using the reliable data object values.
    content.appendChild(
        createInputField('Website Name (Navbar & Title)', 'navigation.logoText', data.navigation.logoText, 'text', { wordLimit: 4 })
    );
    
    content.appendChild(
        createInputField('Name / Main Heading', 'hero.name', data.hero.name, 'text', { wordLimit: 8 })
    );
    
    content.appendChild(
        createInputField('Subtitle', 'hero.subtitle', data.hero.subtitle, 'textarea', { wordLimit: 15 })
    );
    
    // --- END OF FIX ---
    
    const imageValidation = { minHeight: 550, maxWidth: 625, aspectRatio: 1, ratioTolerance: 0.2 };
    content.appendChild(createFileInput('Profile Image', (fileUrl) => {
        window.setObjectValue(data, 'hero.profileImageUrl', fileUrl);
        window.sendFullUpdate();
    }, 'image/*', imageValidation));

    content.appendChild(createFileInput('Resume File', (fileUrl) => {
        window.setObjectValue(data, 'hero.resumeUrl', fileUrl);
        window.sendFullUpdate();
    }, '.pdf,.doc,.docx'));
    content.appendChild(createPreviewButton('navbar'));
    heroSection.appendChild(header);
    heroSection.appendChild(content);
    formContainer.appendChild(heroSection);
}