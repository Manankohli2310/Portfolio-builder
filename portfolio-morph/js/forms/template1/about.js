// js/forms/template1/about.js
function buildTemplate1AboutForm(formContainer, data, previewDoc) {
    if (data.about.enabled) {
        const aboutSection = createFormSection('About Section', 'about', true);
        const defaultAbout = previewDoc.querySelector('.about-section p')?.textContent || '';
        aboutSection.appendChild(createInputField('About Me Paragraph', 'about.description', defaultAbout, 'textarea', { wordLimit: 200, minHeight: 160 }));
        formContainer.appendChild(aboutSection);
    }
}