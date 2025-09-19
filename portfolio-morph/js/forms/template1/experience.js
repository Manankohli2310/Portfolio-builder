// js/forms/template1/experience.js

function buildTemplate1ExperienceForm(formContainer, data, previewDoc, buildFormCallback) {
    if (!data.experience.enabled) return;

    const section = document.createElement('div');
    section.className = 'form-section';
    section.dataset.sectionKey = 'experience';

    const header = document.createElement('div');
    header.className = 'form-section-header';
    header.innerHTML = `
        <h4>Work Experience</h4>
        <div class="header-controls">
            <button class="delete-section-btn" title="Remove Experience Section">&times;</button>
            <div class="arrow"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><polyline points="6 9 12 15 18 9"></polyline></svg></div>
        </div>
    `;

    const content = document.createElement('div');
    content.className = 'form-section-content';

    if (data.experience.list.length === 0 && previewDoc.readyState === 'complete') {
        data.experience.list = Array.from(previewDoc.querySelectorAll('.timeline .timeline-item')).map((item, index) => {
            const companyElement = item.querySelector('.company');
            const dateText = companyElement ? companyElement.textContent.split('|')[1]?.trim() || '' : '';
            const [startYear, endYear] = dateText.split(' - ');
            return {
                id: Date.now() + index,
                title: item.querySelector('h3')?.textContent || '',
                company: companyElement ? companyElement.textContent.split('|')[0]?.trim() || '' : '',
                startYear: startYear || '',
                endYear: endYear === 'Present' ? '' : endYear || '',
                isPresent: endYear === 'Present',
                points: Array.from(item.querySelectorAll('ul li')).map(li => li.textContent)
            };
        });
    }
    
    const experienceListContainer = document.createElement('div');
    experienceListContainer.className = 'experience-list';
    
    data.experience.list.forEach((expItem, index) => {
        const itemForm = document.createElement('div');
        itemForm.className = 'experience-item-form';

        const deleteItemBtn = document.createElement('button');
        deleteItemBtn.className = 'delete-experience-item-btn';
        deleteItemBtn.innerHTML = '&times;';
        deleteItemBtn.title = 'Delete Experience Item';
        deleteItemBtn.onclick = () => {
            window.isFormDirty = true; // --- NEW ---
            data.experience.list.splice(index, 1);
            sendFullUpdate();
            buildFormCallback();
        };
        itemForm.appendChild(deleteItemBtn);

        itemForm.appendChild(createInputField('Job Title', `experience.list.${index}.title`, expItem.title));
        itemForm.appendChild(createInputField('Company Name', `experience.list.${index}.company`, expItem.company));

        const dateRangeGroup = document.createElement('div');
        dateRangeGroup.className = 'date-range-group';
        
        dateRangeGroup.appendChild(createInputField('Start Year', `experience.list.${index}.startYear`, expItem.startYear));
        
        const endYearInputGroup = createInputField('End Year', `experience.list.${index}.endYear`, expItem.endYear);
        const endYearInput = endYearInputGroup.querySelector('input');
        
        const presentGroup = document.createElement('div');
        presentGroup.className = 'present-checkbox-group';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `present-check-${expItem.id}`;
        checkbox.checked = expItem.isPresent;
        if (checkbox.checked) endYearInput.disabled = true;

        checkbox.onchange = (e) => {
            window.isFormDirty = true; // --- NEW ---
            expItem.isPresent = e.target.checked;
            endYearInput.disabled = e.target.checked;
            if(e.target.checked) {
                endYearInput.value = '';
                expItem.endYear = '';
            }
            sendFullUpdate();
        };

        const presentLabel = document.createElement('label');
        presentLabel.htmlFor = `present-check-${expItem.id}`;
        presentLabel.textContent = 'Present';
        
        presentGroup.appendChild(checkbox);
        presentGroup.appendChild(presentLabel);

        dateRangeGroup.appendChild(endYearInputGroup);
        dateRangeGroup.appendChild(presentGroup);
        itemForm.appendChild(dateRangeGroup);

        const pointsGroup = document.createElement('div');
        pointsGroup.className = 'form-group';
        pointsGroup.innerHTML = '<label>Achievements / Responsibilities</label>';
        
        const pointList = document.createElement('div');
        pointList.className = 'point-list';

        expItem.points.forEach((point, pointIndex) => {
            const pointItemForm = document.createElement('div');
            pointItemForm.className = 'point-item-form';

            const pointInput = document.createElement('input');
            pointInput.type = 'text';
            pointInput.value = point;
            pointInput.oninput = (e) => {
                expItem.points[pointIndex] = e.target.value;
                sendFullUpdate();
            };

            const deletePointBtn = document.createElement('button');
            deletePointBtn.className = 'delete-item-btn';
            deletePointBtn.innerHTML = '&times;';
            deletePointBtn.title = 'Delete Point';
            deletePointBtn.onclick = () => {
                window.isFormDirty = true; // --- NEW ---
                expItem.points.splice(pointIndex, 1);
                sendFullUpdate();
                buildFormCallback();
            };

            pointItemForm.appendChild(pointInput);
            pointItemForm.appendChild(deletePointBtn);
            pointList.appendChild(pointItemForm);
        });

        pointsGroup.appendChild(pointList);

        const addPointBtn = document.createElement('button');
        addPointBtn.className = 'add-item-btn';
        addPointBtn.textContent = '+ Add Achievement';
        addPointBtn.onclick = () => {
            window.isFormDirty = true; // --- NEW ---
            expItem.points.push('');
            sendFullUpdate();
            buildFormCallback();
        };
        pointsGroup.appendChild(addPointBtn);

        itemForm.appendChild(pointsGroup);
        experienceListContainer.appendChild(itemForm);
    });
    
    content.appendChild(experienceListContainer);

    if (data.experience.list.length < 10) {
        const addBtn = document.createElement('button');
        addBtn.className = 'add-item-btn';
        addBtn.textContent = '+ Add Experience';
        addBtn.onclick = () => {
            window.isFormDirty = true; // --- NEW ---
            data.experience.list.push({
                id: Date.now(),
                title: '',
                company: '',
                startYear: '',
                endYear: '',
                isPresent: false,
                points: ['']
            });
            sendFullUpdate();
            buildFormCallback();
        };
        content.appendChild(addBtn);
    }
    content.appendChild(createPreviewButton('experience'));
    
    section.appendChild(header);
    section.appendChild(content);
    formContainer.appendChild(section);
}