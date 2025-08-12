// This script runs inside the template1 iframe

// --- PART 1: ORIGINAL TEMPLATE FUNCTIONALITY ---

document.addEventListener('DOMContentLoaded', function () {
    // Fade-in on Scroll Animation
    const sections = document.querySelectorAll('section');

    const observerOptions = {
        root: null, 
        rootMargin: '0px',
        threshold: 0.1 
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const container = entry.target.querySelector('.container');
                if (container) {
                    container.classList.add('visible');
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
});

// Mobile Menu Toggle
function toggleMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
}

// Mobile Menu Close
function closeMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
}

// Close mobile menu when clicking outside
document.addEventListener('click', function (event) {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    if (hamburger && mobileMenu && !hamburger.contains(event.target) && !mobileMenu.contains(event.target)) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
    }
});


// --- PART 2: PORTFOLIO BUILDER COMMUNICATION LOGIC ---

// --- UTILITY FUNCTIONS ---
function setText(selector, text) {
    const element = document.querySelector(selector);
    if (element && text != null) element.textContent = text;
}

function setLink(selector, url) {
    const element = document.querySelector(selector);
    if (element && url != null) element.href = url;
}

function setImage(selector, url) {
    const element = document.querySelector(selector);
    if (element && url != null) element.src = url;
}

// NEW: Helper to toggle the visibility of a whole section
function setSectionVisibility(sectionId, isEnabled) {
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
        // Use an empty string '' to revert to the default display value from the CSS
        sectionElement.style.display = isEnabled ? '' : 'none';
    }
    // Also hide the <hr> separator that comes before the section
    // The ID of the hr matches the section ID without the '1' at the end (e.g., about1 -> about)
    const hrElement = document.getElementById(sectionId.replace('1', ''));
    if (hrElement && hrElement.tagName === 'HR') {
        hrElement.style.display = isEnabled ? '' : 'none';
    }
}

// --- MAIN UPDATE FUNCTION ---
function updatePage(data) {
    // Navigation (not removable)
    if (data.navigation) setText('.logo', data.navigation.logoText);

    // Hero Section (not removable)
    if (data.hero) {
        setText('.hero-text h1', data.hero.name);
        setText('.hero-text .subtitle', data.hero.subtitle);
        setText('.hero-buttons .btn-primary', data.hero.primaryButtonText);
        setLink('.hero-buttons .btn-secondary', data.hero.resumeUrl);
        setImage('.hero-image img', data.hero.profileImageUrl);
    }

    // About Section (now checks the 'enabled' property)
    if (data.about) {
        setSectionVisibility('about1', data.about.enabled);
        if (data.about.enabled) {
            setText('.about-section p', data.about.description);
        }
    }
    
    // Contact Section (will also be removable)
    if (data.contact) {
        setSectionVisibility('contact1', data.contact.enabled);
        if (data.contact.enabled) {
            const emailLink = document.querySelector('.contact-info a[href^="mailto:"]');
            if(emailLink && data.contact.email != null) {
                emailLink.href = `mailto:${data.contact.email}`;
                emailLink.textContent = data.contact.email;
            }
            const phoneLink = document.querySelector('.contact-info a[href^="tel:"]');
            if(phoneLink && data.contact.phone != null) {
                phoneLink.href = `tel:${data.contact.phone}`;
                phoneLink.textContent = data.contact.phone;
            }
            setText('.contact-info p:last-of-type', data.contact.location);
            if (data.contact.social) {
                setLink('.social-links a[href*="linkedin"]', data.contact.social.linkedin);
                setLink('.social-links a[href*="github"]', data.contact.social.github);
                setLink('.social-links a[href*="twitter"]', data.contact.social.twitter);
            }
        }
    }
        // --- DYNAMIC SKILLS RENDERING (with Icons and isDirty logic removed) ---
    if (data.skills) {
        setSectionVisibility('skills', data.skills.enabled);
        const skillsGrid = document.querySelector('.skills-grid');
        if (skillsGrid) {
            skillsGrid.innerHTML = ''; // Always clear the list
            
            data.skills.list.forEach(skill => {
                if (skill.name) {
                    const skillElement = document.createElement('div');
                    skillElement.className = 'skill-item';
                    
                    // If icons are enabled and an icon class exists for this skill...
                    if (data.skills.iconsEnabled && skill.iconClass) {
                        const iconElement = document.createElement('i');
                        iconElement.className = skill.iconClass;
                        skillElement.appendChild(iconElement);
                    }
                    
                    const textNode = document.createTextNode(` ${skill.name}`);
                    skillElement.appendChild(textNode);
                    skillsGrid.appendChild(skillElement);
                }
            });
        }
    }
    // Footer (will also be removable)
    if (data.footer) {
        // The footer is a <footer class="footer"> not an ID, so we handle it differently
        const footerElement = document.querySelector('.footer');
        if (footerElement) {
            footerElement.style.display = data.footer.enabled ? '' : 'none';
            if (data.footer.enabled) {
                setText('.footer p', data.footer.copyright);
            }
        }
    }

    // --- We will add dynamic updates for Skills, Experience, and Projects here later ---
}

// --- THEME & MESSAGE LISTENER ---
function applyTheme(theme) {
    document.body.classList.toggle('dark', theme === 'dark');
}

window.addEventListener('message', (event) => {
    const message = event.data;

    if (message.type === 'themeChange') {
        applyTheme(message.theme);
    }
    
    if (message.type === 'fullUpdate') {
        updatePage(message.data);
    }
});