// --- NEW CODE TO ADD ---
function buildTemplate1AboutForm(formContainer, data, previewDoc) {
    if (!data.about.enabled) return;

    const aboutSection = document.createElement('div');
    aboutSection.className = 'form-section';
    aboutSection.dataset.sectionKey = 'about';

    const header = document.createElement('div');
    header.className = 'form-section-header';
    header.innerHTML = `
        <h4>About Section</h4>
        <div class="header-controls" style="display: flex; align-items: center;">
            <button class="delete-section-btn" title="Remove About Section">&times;</button>
            <div class="arrow" style=" font-size: 28px;">&#129172;</div>
        </div>
    `;

    const content = document.createElement('div');
    content.className = 'form-section-content';

    const defaultAbout = previewDoc.querySelector('.about-section p')?.textContent || '';
    content.appendChild(createInputField('About Me Paragraph', 'about.description', defaultAbout, 'textarea', { wordLimit: 200, minHeight: 160 }));
    
    aboutSection.appendChild(header);
    aboutSection.appendChild(content);
    formContainer.appendChild(aboutSection);
}