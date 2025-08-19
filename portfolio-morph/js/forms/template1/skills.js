// js/forms/template1/skills.js

const skillIconMap = {
    'html': { class: 'fa fab fa-html5', name: 'HTML5' },
    'css': { class: 'fa fab fa-css3-alt', name: 'CSS3' },
    'javascript': { class: 'fa fab fa-js-square', name: 'JavaScript' },
    'react': { class: 'fa fab fa-react', name: 'React' },
    'node': { class: 'fa fab fa-node-js', name: 'Node.js' },
    'python': { class: 'fa fab fa-python', name: 'Python' },
    'java': { class: 'fa fab fa-java', name: 'Java' },
    'git': { class: 'fa fab fa-git-alt', name: 'Git' },
    'github': { class: 'fa fab fa-github', name: 'GitHub' },
    'docker': { class: 'fa fab fa-docker', name: 'Docker' },
    'figma': { class: 'fa fab fa-figma', name: 'Figma' },
    'sql': { class: 'fa fas fa-database', name: 'Database' },
    'js': 'javascript', 'scss': 'css',
};

const categoryIcons = {
    'Tech': 'fas fa-laptop-code',
    'Design': 'fas fa-palette',
    'Business': 'fas fa-briefcase',
    'Science': 'fas fa-flask',
    'Medical': 'fas fa-briefcase-medical',
    'Tools': 'fas fa-tools'
};

function predictIcons(skillName) {
    if (!skillName) return [];
    const lowerCaseSkill = skillName.toLowerCase();
    const matches = new Set();
    for (const keyword in skillIconMap) {
        let iconData = skillIconMap[keyword];
        if (typeof iconData === 'string') { iconData = skillIconMap[iconData]; }
        if (lowerCaseSkill.includes(keyword)) { matches.add(iconData); }
    }
    if (matches.size === 0) {
        matches.add({ class: 'fas fa-code', name: 'Generic' });
    }
    return Array.from(matches).slice(0, 5);
}

// --- DEFINITIVE AND CORRECTED toggleIconDialog FUNCTION ---
function toggleIconDialog(skill, parentElement, data, buildFormCallback) {
    const existingDialog = document.querySelector('.icon-dialog');
    if (existingDialog) existingDialog.remove();

    const dialog = document.createElement('div');
    dialog.className = 'icon-dialog';
    
    const currentIcon = data.skills.globalIconOverride || skill.iconClass;
    
    // THE KEY FIX #1: Correctly build the display element
    let currentIconDisplayHTML = '';
    if (currentIcon && currentIcon.startsWith('data:image')) {
        currentIconDisplayHTML = `<img src="${currentIcon}" alt="Custom Icon">`;
    } else if (currentIcon) {
        currentIconDisplayHTML = `<i class="${currentIcon}"></i>`;
    }

    dialog.innerHTML = `
        <div class="current-icon-preview">
            <div class="icon-display">${currentIconDisplayHTML}</div>
            <!-- THE KEY FIX #2: Removed the unnecessary <p> tag -->
        </div>
        <div class="icon-dialog-nav">
            <button data-tab="suggestions" class="active">Suggestions & Library</button>
            <button data-tab="custom">Custom Upload</button>
        </div>
        <div id="tab-suggestions" class="icon-dialog-tab-content active">
            <p class="panel-label">Suggestions for "${skill.name || 'New Skill'}"</p>
            <div class="icon-suggestion-grid"></div>
            <div class="icon-library">
                <p class="panel-label">Or, set a universal icon for all skills</p>
                <div class="category-grid"></div>
            </div>
        </div>
        <div id="tab-custom" class="icon-dialog-tab-content"></div>
    `;
    parentElement.appendChild(dialog);
    
    // Populate Suggestions Tab
    const suggestionGrid = dialog.querySelector('.icon-suggestion-grid');
    const suggestions = predictIcons(skill.name);
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'icon-suggestion-item';
        if (currentIcon === suggestion.class && !data.skills.globalIconOverride) {
            item.classList.add('selected');
        }
        item.innerHTML = `<i class="${suggestion.class}"></i><span>${suggestion.name}</span>`;
        item.onclick = () => {
            data.skills.globalIconOverride = null;
            skill.iconClass = suggestion.class;
            sendFullUpdate();
            buildFormCallback();
            dialog.remove();
        };
        suggestionGrid.appendChild(item);
    });

    // Populate Category Library
    const categoryGrid = dialog.querySelector('.category-grid');
    for (const category in categoryIcons) {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.innerHTML = `<i class="${categoryIcons[category]}"></i> ${category}`;
        btn.onclick = () => {
            data.skills.globalIconOverride = categoryIcons[category];
            sendFullUpdate();
            buildFormCallback();
            dialog.remove();
        };
        categoryGrid.appendChild(btn);
    }
    const clearBtn = document.createElement('button');
    clearBtn.className = 'category-btn clear-btn';
    clearBtn.textContent = 'Use Automatic';
    clearBtn.onclick = () => {
        data.skills.globalIconOverride = null;
        sendFullUpdate();
        buildFormCallback();
        dialog.remove();
    };
    categoryGrid.appendChild(clearBtn);

    // Populate Custom Upload Tab
    const customTab = dialog.querySelector('#tab-custom');
    const findSkillIndex = data.skills.list.findIndex(s => s.id === skill.id);
    if (findSkillIndex !== -1) {
        const onFileUpload = (fileUrl) => {
            const targetSkill = data.skills.list[findSkillIndex];
            if (targetSkill) {
                targetSkill.iconClass = fileUrl;
                data.skills.globalIconOverride = null;
                sendFullUpdate();
                buildFormCallback();
                dialog.remove();
            }
        };
        const customUploadForm = createFileInput(`Upload Image (will be resized to 20x20)`, onFileUpload, 'image/*', { resizeTo: 20 });
        customTab.appendChild(customUploadForm);
    }
    
    // Tab switching logic
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


function buildTemplate1SkillsForm(formContainer, data, previewDoc, buildFormCallback) {
    if (!data.skills.enabled) return;

    const skillsSection = createFormSection('Skills Section', 'skills', true);
    
    const masterToggleWrapper = document.createElement('div');
    masterToggleWrapper.className = 'section-controls';
    masterToggleWrapper.innerHTML = `<label for="enable-icons-toggle">Enable Icons</label><input type="checkbox" id="enable-icons-toggle">`;
    const enableToggle = masterToggleWrapper.querySelector('#enable-icons-toggle');
    enableToggle.checked = data.skills.iconsEnabled;
    enableToggle.onchange = (e) => {
        data.skills.iconsEnabled = e.target.checked;
        sendFullUpdate();
        buildFormCallback();
    };
    skillsSection.appendChild(masterToggleWrapper);

    if (data.skills.list.length === 0 && previewDoc.readyState === 'complete') {
        data.skills.list = Array.from(previewDoc.querySelectorAll('.skills-grid .skill-item')).map((item, index) => ({
            id: Date.now() + index,
            name: item.textContent.trim(),
            iconClass: predictIcons(item.textContent.trim())[0]?.class
        }));
    }
    
    const skillListContainer = document.createElement('div');
    skillListContainer.className = 'skill-list';

    data.skills.list.forEach(skill => {
        const skillFormItem = document.createElement('div');
        skillFormItem.className = 'skill-item-form';
        
        const iconPreview = document.createElement('div');
        iconPreview.className = 'predicted-icon';
        
        const finalIcon = data.skills.globalIconOverride || skill.iconClass || predictIcons(skill.name)[0]?.class || 'fas fa-code';
        if (finalIcon && finalIcon.startsWith('data:image')) {
            iconPreview.innerHTML = `<img src="${finalIcon}" alt="Custom Icon">`;
        } else {
            iconPreview.innerHTML = `<i class="${finalIcon}"></i>`;
        }

        if (!data.skills.iconsEnabled) {
            iconPreview.style.display = 'none';
        }
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = skill.name;
        input.placeholder = 'e.g., React';
        input.oninput = (e) => {
            skill.name = e.target.value;
            if (!data.skills.globalIconOverride) {
                skill.iconClass = predictIcons(skill.name)[0]?.class;
                const updatedIcon = skill.iconClass;
                 if (updatedIcon && updatedIcon.startsWith('data:image')) {
                    iconPreview.innerHTML = `<img src="${updatedIcon}" alt="Custom Icon">`;
                } else {
                    iconPreview.innerHTML = `<i class="${updatedIcon}"></i>`;
                }
            }
            sendFullUpdate();
        };

        const manageBtn = document.createElement('button');
        manageBtn.className = 'manage-icon-btn';
        manageBtn.title = 'Manage Icon';
        manageBtn.innerHTML = `<svg viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path></svg><span>Manage</span>`;
        if (!data.skills.iconsEnabled) {
            manageBtn.style.display = 'none';
        }
        manageBtn.onclick = () => { toggleIconDialog(skill, skillFormItem, data, buildFormCallback); };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-item-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.title = 'Delete Skill';
        deleteBtn.onclick = () => {
            data.skills.list = data.skills.list.filter(s => s.id !== skill.id);
            sendFullUpdate();
            buildFormCallback();
        };

        skillFormItem.appendChild(iconPreview);
        skillFormItem.appendChild(input);
        skillFormItem.appendChild(manageBtn);
        skillFormItem.appendChild(deleteBtn);
        skillListContainer.appendChild(skillFormItem);
    });

    skillsSection.appendChild(skillListContainer);

    if (data.skills.list.length < 15) {
        const addBtn = document.createElement('button');
        addBtn.className = 'add-item-btn';
        addBtn.textContent = '+ Add Skill';
        addBtn.onclick = () => {
            if (data.skills.list.length < 15) {
                const newIcon = data.skills.globalIconOverride || predictIcons('')[0]?.class || 'fas fa-code';
                data.skills.list.push({ id: Date.now(), name: '', iconClass: newIcon });
                sendFullUpdate();
                buildFormCallback();
            }
        };
        skillsSection.appendChild(addBtn);
    }
    formContainer.appendChild(skillsSection);
}