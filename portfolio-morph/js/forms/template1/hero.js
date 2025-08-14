// js/forms/template1/hero.js
function buildTemplate1HeroForm(formContainer, data, previewDoc) {
    const heroSection = createFormSection('Hero Section', 'hero', false);
    const defaultName = previewDoc.querySelector('.hero-text h1')?.textContent || '';
    const defaultSubtitle = previewDoc.querySelector('.hero-text .subtitle')?.textContent || '';
    heroSection.appendChild(createInputField('Name / Main Heading', 'hero.name', defaultName, 'text', { wordLimit: 8 }));
    heroSection.appendChild(createInputField('Subtitle', 'hero.subtitle', defaultSubtitle, 'textarea', { wordLimit: 15 }));
    const imageValidation = { minHeight: 550, maxWidth: 625, aspectRatio: 1, ratioTolerance: 0.2 };
    heroSection.appendChild(createFileInput('Profile Image', (fileUrl) => {
        setObjectValue(data, 'hero.profileImageUrl', fileUrl);
        sendFullUpdate();
    }, 'image/*', imageValidation));
    heroSection.appendChild(createFileInput('Resume File', (fileUrl) => {
        setObjectValue(data, 'hero.resumeUrl', fileUrl);
        sendFullUpdate();
    }, '.pdf,.doc,.docx'));
    formContainer.appendChild(heroSection);
}