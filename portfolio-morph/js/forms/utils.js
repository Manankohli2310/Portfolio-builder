// js/forms/utils.js

// This file contains shared helper functions for all form modules.
// These functions are attached to the window object to be globally accessible.

window.countWords = function(str) {
    if (!str) return 0;
    return str.trim().split(/\s+/).filter(word => word.length > 0).length;
}

window.createInputField = function(label, propertyPath, placeholder = '', type = 'text', options = {}) {
    const { wordLimit = 0, minHeight = 'auto' } = options;
    const wrapper = document.createElement('div');
    wrapper.className = 'form-group';
    wrapper.innerHTML = `<label>${label}</label>`;
    const isTextarea = type === 'textarea';
    const inputElement = document.createElement(isTextarea ? 'textarea' : 'input');
    if (!isTextarea) inputElement.type = 'text';
    else {
        inputElement.rows = 4;
        if (minHeight !== 'auto') inputElement.style.minHeight = `${minHeight}px`;
    }
    inputElement.value = placeholder;
    let warningElement;
    if (wordLimit > 0) {
        warningElement = document.createElement('p');
        warningElement.className = 'word-limit-warning';
        const initialWordCount = countWords(placeholder);
        warningElement.textContent = `${initialWordCount} / ${wordLimit} words`;
        if (initialWordCount > wordLimit) warningElement.classList.add('visible');
    }
    inputElement.addEventListener('input', (e) => {
        const currentText = e.target.value;
        if (wordLimit > 0) {
            const wordCount = countWords(currentText);
            warningElement.textContent = `${wordCount} / ${wordLimit} words`;
            warningElement.classList.toggle('visible', wordCount > wordLimit);
        }
        window.setObjectValue(window.portfolioData, propertyPath, currentText);
        window.sendFullUpdate();
    });
    wrapper.appendChild(inputElement);
    if (warningElement) wrapper.appendChild(warningElement);
    return wrapper;
}

window.createFileInput = function(label, onFileSelect, accept, validation = {}) {
    const { minHeight = 0, maxWidth = 0, aspectRatio = 0, ratioTolerance = 0.1, resizeTo = 0 } = validation;
    const wrapper = document.createElement('div');
    wrapper.className = 'form-group';
    wrapper.innerHTML = `<label>${label}</label>`;
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.accept = accept;
    const warningElement = document.createElement('p');
    warningElement.className = 'file-limit-warning';
    inputElement.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) {
            warningElement.classList.remove('visible'); return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const fileUrl = event.target.result;
            if (file.type.startsWith('image/')) {
                const img = new Image();
                img.onload = () => {
                    const meetsDimensionRules = (minHeight === 0 || img.naturalHeight >= minHeight) && (maxWidth === 0 || img.naturalWidth <= maxWidth);
                    const actualRatio = img.naturalWidth / img.naturalHeight;
                    const lowerBound = aspectRatio - ratioTolerance;
                    const upperBound = aspectRatio + ratioTolerance;
                    const meetsAspectRatioRule = aspectRatio === 0 || (actualRatio >= lowerBound && actualRatio <= upperBound);
                    const isImageValid = meetsDimensionRules || meetsAspectRatioRule;
                    if (!isImageValid) {
                        warningElement.textContent = `Image size is wrong (should be nearly square).`;
                        warningElement.classList.add('visible');
                        e.target.value = '';
                    } else {
                        warningElement.classList.remove('visible');
                        if (resizeTo > 0) {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            canvas.width = resizeTo;
                            canvas.height = resizeTo;
                            ctx.drawImage(img, 0, 0, resizeTo, resizeTo);
                            const resizedUrl = canvas.toDataURL(file.type);
                            onFileSelect(resizedUrl);
                        } else {
                            onFileSelect(fileUrl);
                        }
                    }
                };
                img.src = fileUrl;
            } else {
                warningElement.classList.remove('visible');
                onFileSelect(fileUrl);
            }
        };
        reader.readAsDataURL(file);
    });
    wrapper.appendChild(inputElement);
    wrapper.appendChild(warningElement);
    return wrapper;
}

window.createFormSection = function(title, sectionKey, isRemovable = false) {
    const section = document.createElement('div');
    section.className = 'form-section';
    const titleElement = document.createElement('h4');
    titleElement.textContent = title;
    if (isRemovable) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-section-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.title = `Remove ${title}`;
        deleteBtn.dataset.section = sectionKey;
        titleElement.appendChild(deleteBtn);
    }
    section.appendChild(titleElement);
    return section;
}