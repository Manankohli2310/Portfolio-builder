// js/forms/template1/contact.js

function buildTemplate1ContactForm(formContainer, data, previewDoc, buildFormCallback) {
    if (!data.contact.enabled) return;

    // --- Create the main section container with accordion structure ---
    const section = document.createElement('div');
    section.className = 'form-section';
    section.dataset.sectionKey = 'contact';

    // --- Create the clickable header ---
    const header = document.createElement('div');
header.className = 'form-section-header';
header.innerHTML = `
    <h4>Get In Touch</h4>
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


    // --- Create the collapsible content area ---
    const content = document.createElement('div');
    content.className = 'form-section-content';

    // --- Populate data with defaults from the template ONCE ---
    if (!data.contact.isPopulated) {
        const contactContainer = previewDoc.querySelector('#contact1 .container');
        if (contactContainer) {
            data.contact.intro = contactContainer.querySelector('p:not(.contact-info p)')?.textContent.trim() || '';
            data.contact.email = contactContainer.querySelector('.contact-info a[href^="mailto:"]')?.textContent || '';
            data.contact.phone = contactContainer.querySelector('.contact-info a[href^="tel:"]')?.textContent || '';
            data.contact.location = (contactContainer.querySelector('.contact-info p:last-of-type')?.textContent.replace('Location:', '') || '').trim();
            data.contact.social = [
                { id: Date.now() + 1, type: 'linkedin', url: contactContainer.querySelector('.social-links a[href*="linkedin"]')?.href || '' },
                { id: Date.now() + 2, type: 'github', url: contactContainer.querySelector('.social-links a[href*="github"]')?.href || '' },
                { id: Date.now() + 3, type: 'twitter', url: contactContainer.querySelector('.social-links a[href*="twitter"]')?.href || '' }
            ];
            data.contact.buttonText = contactContainer.querySelector('.btn-primary')?.textContent || 'Say Hello';
            data.contact.isPopulated = true;
        }
    }
    
    // --- Build and append the form fields to the content div ---
    content.appendChild(createInputField('Intro Paragraph', 'contact.intro', data.contact.intro, 'textarea', { wordLimit: 30 }));
    content.appendChild(createInputField('Email Address', 'contact.email', data.contact.email));
    content.appendChild(createInputField('Phone Number', 'contact.phone', data.contact.phone));
    content.appendChild(createInputField('Location', 'contact.location', data.contact.location));
    
    // --- DYNAMIC SOCIAL LINKS SECTION (Final Version) ---
    const socialSection = document.createElement('div');
    socialSection.className = 'form-group';
    socialSection.innerHTML = '<h5 style="margin-bottom: 15px; font-weight: 600;">Social Links</h5>';

    const masterToggleWrapper = document.createElement('div');
    masterToggleWrapper.className = 'section-controls';
    masterToggleWrapper.innerHTML = `<label for="enable-social-links-toggle">Enable Social Links Section</label><input type="checkbox" id="enable-social-links-toggle">`;
    const enableToggle = masterToggleWrapper.querySelector('#enable-social-links-toggle');
    enableToggle.checked = data.contact.socialsEnabled;
    enableToggle.onchange = (e) => {
        data.contact.socialsEnabled = e.target.checked;
        sendFullUpdate();
        buildFormCallback();
    };
    socialSection.appendChild(masterToggleWrapper);
    
    if (data.contact.socialsEnabled) {
        const socialListContainer = document.createElement('div');
        socialListContainer.className = 'point-list';

        data.contact.social.forEach((link, index) => {
            const linkItemForm = document.createElement('div');
            linkItemForm.className = 'social-link-item';

            const select = document.createElement('select');
            select.className = 'social-type-select';
            const socialTypes = ['linkedin', 'github', 'twitter', 'instagram', 'youtube', 'facebook'];
            socialTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
                if (type === link.type) option.selected = true;
                select.appendChild(option);
            });
            select.onchange = (e) => {
                link.type = e.target.value;
                sendFullUpdate();
            };

            const urlInput = document.createElement('input');
            urlInput.type = 'text';
            urlInput.placeholder = 'https://...';
            urlInput.value = link.url;
            urlInput.oninput = (e) => {
                link.url = e.target.value;
                sendFullUpdate();
            };
            
            const deleteLinkBtn = document.createElement('button');
            deleteLinkBtn.className = 'delete-item-btn';
            deleteLinkBtn.innerHTML = '&times;';
            deleteLinkBtn.title = 'Delete Link';
            deleteLinkBtn.onclick = () => {
                data.contact.social.splice(index, 1);
                sendFullUpdate();
                buildFormCallback(); // Re-render the entire form
            };

            linkItemForm.appendChild(select);
            linkItemForm.appendChild(urlInput);
            linkItemForm.appendChild(deleteLinkBtn);
            socialListContainer.appendChild(linkItemForm);
        });
        
        socialSection.appendChild(socialListContainer);
        
        if (data.contact.social.length < 5) {
        const addLinkBtn = document.createElement('button');
        addLinkBtn.className = 'add-item-btn';
        addLinkBtn.textContent = '+ Add Social Link';
        addLinkBtn.onclick = () => {
            // A final safety check inside the click handler
            if (data.contact.social.length < 5) {
                data.contact.social.push({ id: Date.now(), type: 'linkedin', url: '' });
                sendFullUpdate();
                buildFormCallback();
            }
        };
        socialSection.appendChild(addLinkBtn);
    }
    }
    content.appendChild(socialSection);

    const buttonGroup = createInputField('Button Text', 'contact.buttonText', data.contact.buttonText);
    const guidance = document.createElement('p');
    guidance.className = 'input-guidance';
    guidance.textContent = 'This button will link to your entered email address.';
    buttonGroup.appendChild(guidance);
    content.appendChild(buttonGroup);

    content.appendChild(createPreviewButton('contact'));
    // --- Assemble the final section ---
    section.appendChild(header);
    section.appendChild(content);
    formContainer.appendChild(section);
}