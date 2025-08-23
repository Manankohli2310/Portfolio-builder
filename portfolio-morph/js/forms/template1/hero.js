// --- NEW CODE TO ADD ---
function buildTemplate1HeroForm(formContainer, data, previewDoc) {
    const heroSection = document.createElement('div');
    heroSection.className = 'form-section';
    heroSection.dataset.sectionKey = 'hero'; // Important for the accordion

    // Create the clickable header
    const header = document.createElement('div');
    header.className = 'form-section-header';
    header.innerHTML = `
        <h4>Hero Section</h4>
        <div class="arrow" style=" font-size: 28px;">&#129172;</div>
    `;
    
    // Create the collapsible content area
    const content = document.createElement('div');
    content.className = 'form-section-content';

    // Build and append form fields to the content area
    const defaultName = previewDoc.querySelector('.hero-text h1')?.textContent || '';
    const defaultSubtitle = previewDoc.querySelector('.hero-text .subtitle')?.textContent || '';
    content.appendChild(createInputField('Name / Main Heading', 'hero.name', defaultName, 'text', { wordLimit: 8 }));
    content.appendChild(createInputField('Subtitle', 'hero.subtitle', defaultSubtitle, 'textarea', { wordLimit: 15 }));
    const imageValidation = { minHeight: 550, maxWidth: 625, aspectRatio: 1, ratioTolerance: 0.2 };
    content.appendChild(createFileInput('Profile Image', (fileUrl) => {
        setObjectValue(data, 'hero.profileImageUrl', fileUrl);
        sendFullUpdate();
    }, 'image/*', imageValidation));
    content.appendChild(createFileInput('Resume File', (fileUrl) => {
        setObjectValue(data, 'hero.resumeUrl', fileUrl);
        sendFullUpdate();
    }, '.pdf,.doc,.docx'));
    
    // Assemble the parts
    heroSection.appendChild(header);
    heroSection.appendChild(content);
    formContainer.appendChild(heroSection);
}