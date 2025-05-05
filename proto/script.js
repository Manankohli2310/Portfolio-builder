// ========== Modal Handling ==========
const openTemplatePreview = document.getElementById('openTemplatePreview');
const previewModal = document.getElementById('previewModal');
const closePreviewModal = document.getElementById('closePreviewModal');

const openFormBtn = document.getElementById('openFormBtn');
const formModal = document.getElementById('formModal');
const closeFormModal = document.getElementById('closeFormModal');

// ========== Download Elements ==========
const downloadToggleBtn = document.getElementById('downloadToggleBtn');
const downloadZipBtn = document.getElementById('downloadZipBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const downloadOptions = document.getElementById('downloadOptions');

downloadToggleBtn.disabled = true; // Disabled by default

// ========== Open Modals ==========
openTemplatePreview.addEventListener('click', () => {
  previewModal.style.display = 'flex';
});

openFormBtn.addEventListener('click', () => {
  formModal.style.display = 'flex';
});

// ========== Close Modals ==========
closePreviewModal.addEventListener('click', () => {
  previewModal.style.display = 'none';
});

closeFormModal.addEventListener('click', () => {
  formModal.style.display = 'none';
});

// Close on outside click
window.addEventListener('click', (e) => {
  if (e.target === previewModal) previewModal.style.display = 'none';
  if (e.target === formModal) formModal.style.display = 'none';
});

// ========== Toggle Download Dropdown ==========
downloadToggleBtn.addEventListener('click', () => {
  downloadOptions.style.display = downloadOptions.style.display === 'block' ? 'none' : 'block';
});

// ========== Form Submission ==========
document.getElementById('resumeForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const iframe = document.getElementById('templateFrame');
  const templateWindow = iframe.contentWindow;
  const templateDoc = iframe.contentDocument || templateWindow.document;

  if (templateDoc.readyState === 'complete') {
    try {
      // Update text content
      templateDoc.getElementById('displayName').textContent = document.getElementById('name').value;
      templateDoc.getElementById('displayAddress').textContent = document.getElementById('address').value;
      templateDoc.getElementById('displayPhone').textContent = document.getElementById('phone').value;
      templateDoc.getElementById('displayEmail').textContent = document.getElementById('email').value;
      templateDoc.getElementById('displayExperience').textContent = document.getElementById('experience').value;
      templateDoc.getElementById('displayEducation').textContent = document.getElementById('education').value;
      templateDoc.getElementById('displaySkills').textContent = document.getElementById('skills').value;

      // Profile image
      const fileInput = document.getElementById('profilePic');
      const profileImg = templateDoc.getElementById('displayProfile');

      if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          profileImg.src = e.target.result;
        };
        reader.readAsDataURL(fileInput.files[0]);
      }

      formModal.style.display = 'none'; // Close form modal

      // ✅ Enable Download Options
      downloadToggleBtn.disabled = false;
    } catch (err) {
      console.error("Error updating resume:", err);
      alert("An error occurred while updating the resume.");
    }
  } else {
    alert("Resume preview is still loading. Please wait.");
  }
});

// ========== Download as ZIP ==========
downloadZipBtn.addEventListener('click', async function () {
  const iframe = document.getElementById('templateFrame');
  const templateDoc = iframe.contentDocument || iframe.contentWindow.document;

  // Get customized HTML
  const templateHtml = '<!DOCTYPE html>\n' + templateDoc.documentElement.outerHTML;

  // Load CSS
  const cssResponse = await fetch('template-style.css');
  const cssContent = await cssResponse.text();

  // Create ZIP
  const zip = new JSZip();
  zip.file('index.html', templateHtml);
  zip.file('template-style.css', cssContent);

  // Add uploaded profile picture
  const profileInput = document.getElementById('profilePic');
  if (profileInput.files && profileInput.files[0]) {
    const file = profileInput.files[0];
    const imgBlob = await file.arrayBuffer();
    zip.file('profile.png', imgBlob);
  }

  // Trigger download
  zip.generateAsync({ type: "blob" }).then(function (blob) {
    saveAs(blob, "resume-template.zip");
  });

  // Hide dropdown after action
  downloadOptions.style.display = 'none';
});

// ========== Download as PDF ==========
downloadPdfBtn.addEventListener('click', async () => {
  const iframe = document.getElementById('templateFrame');
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

  // Grab only the relevant content from iframe
  const resumeContent = iframeDoc.body.innerHTML;

  // Load and inline the CSS
  const cssResponse = await fetch('template-style.css');
  const cssText = await cssResponse.text();

  // Create a container to render full HTML inside main document
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'fixed';
  tempContainer.style.top = '-9999px';
  tempContainer.style.left = '-9999px';
  tempContainer.style.width = '794px'; // A4 width in pixels at 96 DPI
  tempContainer.innerHTML = `
    <style>${cssText}</style>
    <div class="resume-wrapper">
      ${resumeContent}
    </div>
  `;
  document.body.appendChild(tempContainer);

  const opt = {
    margin: 0.3,
    filename: 'resume-template.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(opt).from(tempContainer).save();
  } catch (err) {
    console.error("Error generating PDF:", err);
    alert("Failed to generate PDF.");
  }

  document.body.removeChild(tempContainer);
  downloadOptions.style.display = 'none';
});


