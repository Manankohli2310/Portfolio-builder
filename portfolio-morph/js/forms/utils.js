// js/forms/utils.js

// This file contains shared helper functions for all form modules.

window.countWords = function(str) {
    if (!str) return 0;
    return str.trim().split(/\s+/).filter(word => word.length > 0).length;
}

window.createInputField = function(label, propertyPath, currentValue = '', type = 'text', options = {}) {
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
    inputElement.value = currentValue; // Use a different variable name for clarity
    let warningElement;
    if (wordLimit > 0) {
        warningElement = document.createElement('p');
        warningElement.className = 'word-limit-warning';
        const initialWordCount = countWords(currentValue);
        warningElement.textContent = `${initialWordCount} / ${wordLimit} words`;
        if (initialWordCount > wordLimit) warningElement.classList.add('visible');
    }
    
    // --- THIS IS THE DEFINITIVE FIX ---
    inputElement.addEventListener('input', (e) => {
        const newText = e.target.value;
        if (wordLimit > 0) {
            const wordCount = countWords(newText);
            warningElement.textContent = `${wordCount} / ${wordLimit} words`;
            warningElement.classList.toggle('visible', wordCount > wordLimit);
        }
        // Step 1: Update the global data object.
        window.setObjectValue(window.portfolioData, propertyPath, newText);
        // Step 2: ONLY send the update. Do NOT rebuild the entire form on every keystroke.
        window.sendFullUpdate();
    });
    // --- END OF FIX ---

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

// ================== ADD THIS NEW, SIMPLE HELPER FUNCTION ==================
/**
 * Creates a "Preview Section" button.
 * @param {string} sectionId - The ID of the element to scroll to in the main preview (e.g., 'about').
 */
window.createPreviewButton = function(sectionId) {
    const button = document.createElement('button');
    button.className = 'preview-section-btn';
    button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        <span>Preview This Section</span>
    `;

    button.onclick = () => {
        const mainPreviewFrame = document.getElementById('main-preview-frame');
        if (mainPreviewFrame && mainPreviewFrame.contentWindow) {
            mainPreviewFrame.contentWindow.postMessage({ type: 'scrollToSection', sectionId: sectionId }, '*');
        }

        const editingPanel = document.getElementById('editing-panel');
        const panelBackdrop = document.getElementById('panel-backdrop');
        editingPanel.classList.remove('visible');
        panelBackdrop.classList.remove('visible');
    };
    
    return button;
}
// ========================================================================