// js/forms/template1/projects.js

function buildTemplate1ProjectsForm(formContainer, data, previewDoc, buildFormCallback) {
    if (!data.projects.enabled) return;

    const section = document.createElement('div');
    section.className = 'form-section';
    section.dataset.sectionKey = 'projects';

    const header = document.createElement('div');
    header.className = 'form-section-header';
    header.innerHTML = `
        <h4>Projects</h4>
        <div class="header-controls">
            <button class="delete-section-btn" title="Remove Projects Section">&times;</button>
            <div class="arrow"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><polyline points="6 9 12 15 18 9"></polyline></svg></div>
        </div>
    `;

    const content = document.createElement('div');
    content.className = 'form-section-content';

    const masterToggleWrapper = document.createElement('div');
    masterToggleWrapper.className = 'section-controls';
    masterToggleWrapper.innerHTML = `<label for="enable-project-images-toggle">Enable Project Images</label><input type="checkbox" id="enable-project-images-toggle">`;
    const enableToggle = masterToggleWrapper.querySelector('#enable-project-images-toggle');
    enableToggle.checked = data.projects.imagesEnabled;
    enableToggle.onchange = (e) => {
        window.isFormDirty = true; // --- NEW ---
        data.projects.imagesEnabled = e.target.checked;
        sendFullUpdate();
        buildFormCallback();
    };
    content.appendChild(masterToggleWrapper);
    
    if (data.projects.list.length === 0 && previewDoc.readyState === 'complete') {
        data.projects.list = Array.from(previewDoc.querySelectorAll('.projects-grid .project-card')).map((item, index) => ({
            id: Date.now() + index,
            title: item.querySelector('h3')?.textContent || '',
            description: item.querySelector('p')?.textContent || '',
            imageUrl: item.querySelector('img')?.getAttribute('src') || '',
            link: item.querySelector('.project-links a')?.getAttribute('href') || ''
        }));
    }
    
    const projectListContainer = document.createElement('div');
    projectListContainer.className = 'project-list';
    
    data.projects.list.forEach((projectItem, index) => {
        const itemForm = document.createElement('div');
        itemForm.className = 'project-item-form';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-project-item-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.title = 'Delete Project';
        deleteBtn.onclick = () => {
            window.isFormDirty = true; // --- NEW ---
            data.projects.list.splice(index, 1);
            sendFullUpdate();
            buildFormCallback();
        };
        itemForm.appendChild(deleteBtn);

        itemForm.appendChild(createInputField('Project Title', `projects.list.${index}.title`, projectItem.title, 'text', { wordLimit: 5 }));
        itemForm.appendChild(createInputField('Description', `projects.list.${index}.description`, projectItem.description, 'textarea', { wordLimit: 20 }));
        
        itemForm.appendChild(createInputField('Project URL', `projects.list.${index}.link`, projectItem.link));
        
        if (data.projects.imagesEnabled) {
            const imageInputGroup = createFileInput(`Image`, (fileUrl) => {
                projectItem.imageUrl = fileUrl;
                sendFullUpdate();
            }, 'image/*');
            
            const guidance = document.createElement('p');
            guidance.className = 'input-guidance';
            guidance.textContent = 'A landscape image is recommended for the best view.';
            imageInputGroup.appendChild(guidance);
            
            itemForm.appendChild(imageInputGroup);
        }

        projectListContainer.appendChild(itemForm);
    });
    
    content.appendChild(projectListContainer);

    if (data.projects.list.length < 10) {
        const addBtn = document.createElement('button');
        addBtn.className = 'add-item-btn';
        addBtn.textContent = '+ Add Project';
        addBtn.onclick = () => {
            if (data.projects.list.length < 10) {
                window.isFormDirty = true; // --- NEW ---
                data.projects.list.push({
                    id: Date.now(), title: '', description: '', imageUrl: '', link: ''
                });
                sendFullUpdate();
                buildFormCallback();
            }
        };
        content.appendChild(addBtn);
    }
    content.appendChild(createPreviewButton('projects'));

    section.appendChild(header);
    section.appendChild(content);
    formContainer.appendChild(section);
}