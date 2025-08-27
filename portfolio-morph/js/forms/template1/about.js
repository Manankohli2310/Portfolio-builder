// --- NEW CODE TO ADD ---
function buildTemplate1AboutForm(formContainer, data, previewDoc) {
    if (!data.about.enabled) return;

    const aboutSection = document.createElement('div');
    aboutSection.className = 'form-section';
    aboutSection.dataset.sectionKey = 'about';

        const header = document.createElement('div');
header.className = 'form-section-header';
header.innerHTML = `
    <h4>About</h4>
    <div class="header-controls" style="display: flex; align-items: center;">
        <button class="delete-section-btn" title="Remove Contact Section">&times;</button>
        <div class="arrow">
            <svg xmlns="http://www.w3.org/2000/svg"
                 viewBox="0 0 24 24"
                 fill="none"
                 stroke="currentColor"
                 stroke-width="2.75"
                 stroke-linecap="round"
                 stroke-linejoin="round"
                 width="20" height="20">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        </div>
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