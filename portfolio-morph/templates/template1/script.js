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
            skillsGrid.innerHTML = '';
            
            data.skills.list.forEach(skill => {
                if (skill.name) {
                    const skillElement = document.createElement('div');
                    skillElement.className = 'skill-item';
                    
                    const finalIcon = data.skills.globalIconOverride || skill.iconClass;

                    if (data.skills.iconsEnabled && finalIcon) {
                        let iconElement;
                        if (finalIcon.startsWith('data:image')) {
                            iconElement = document.createElement('img');
                            iconElement.src = finalIcon;
                            // THE KEY FIX: Add a class for specific styling
                            iconElement.className = 'custom-skill-icon';
                        } else {
                            iconElement = document.createElement('i');
                            iconElement.className = finalIcon;
                        }
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
// Inside the updatePage function in template1/script.js
    if (data.experience) {
        setSectionVisibility('experience1', data.experience.enabled);
        const timeline = document.querySelector('.timeline');
        if (timeline) {
            timeline.innerHTML = '';
            
            data.experience.list.forEach(item => {
                const timelineItem = document.createElement('div');
                timelineItem.className = 'timeline-item';
                
                // THE KEY FIX: Directly map the array to <li> elements
                const pointsHTML = item.points.map(point => `<li>${point}</li>`).join('');
                
                timelineItem.innerHTML = `
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <h3>${item.title || ''}</h3>
                        <p class="company">${item.company || ''} | ${item.startYear || ''} - ${item.isPresent ? 'Present' : item.endYear || ''}</p>
                        <ul>
                            ${pointsHTML}
                        </ul>
                    </div>
                `;
                timeline.appendChild(timelineItem);
            });
        }
    }

    if (data.projects) {
        setSectionVisibility('projects1', data.projects.enabled);
        const projectsGrid = document.querySelector('.projects-grid');
        if (projectsGrid) {
            projectsGrid.innerHTML = ''; // Clear defaults
            
            data.projects.list.forEach(project => {
                const projectCard = document.createElement('div');
                projectCard.className = 'project-card';

                let imageHTML = '';
                // Only show the image if the master toggle is on and an image URL exists
                if (data.projects.imagesEnabled && project.imageUrl) {
                    imageHTML = `<img src="${project.imageUrl}" alt="${project.title} Screenshot">`;
                }
                
                projectCard.innerHTML = `
                    ${imageHTML}
                    <h3>${project.title || ''}</h3>
                    <p>${project.description || ''}</p>
                    <div class="project-links">
                        <a href="${project.link || '#'}" target="_blank">View</a>
                    </div>
                `;
                projectsGrid.appendChild(projectCard);
            });
        }
    }

      if (data.contact) {
        setSectionVisibility('contact1', data.contact.enabled);
        if (data.contact.enabled) {
            setText('.contact-section > .container > p', data.contact.intro);

            const emailLink = document.querySelector('.contact-info a[href^="mailto:"]');
            if (emailLink && data.contact.email != null) {
                emailLink.href = `mailto:${data.contact.email}`;
                emailLink.textContent = data.contact.email;
            }

            const phoneLink = document.querySelector('.contact-info a[href^="tel:"]');
            if (phoneLink && data.contact.phone != null) {
                phoneLink.href = `tel:${data.contact.phone}`;
                phoneLink.textContent = data.contact.phone;
            }
            
            const locationP = document.querySelector('.contact-info p:last-of-type');
            if (locationP && data.contact.location != null) {
                locationP.innerHTML = `<i class="fas fa-map-marker-alt"></i> Location: ${data.contact.location}`;
            }
            
            const socialLinksContainer = document.querySelector('.social-links');
            if (socialLinksContainer) {
                // THE KEY FIX: Show or hide the entire social links container
                // based on the master toggle.
                socialLinksContainer.style.display = data.contact.socialsEnabled ? '' : 'none';
                
                if (data.contact.socialsEnabled && data.contact.social) {
                    // Clear only the links, keeping the "Connect With Me" H2 title
                    socialLinksContainer.querySelectorAll('a').forEach(link => link.remove());
                    
                    data.contact.social.forEach(social => {
                        if (social.url) {
                            const link = document.createElement('a');
                            link.href = social.url;
                            link.target = '_blank';
                            link.innerHTML = `<i class="fab fa-${social.type}"></i>`;
                            socialLinksContainer.appendChild(link);
                        }
                    });
                }
            }
            
            const sayHelloBtn = document.querySelector('.contact-section .btn-primary');
            if (sayHelloBtn) {
                setText('.contact-section .btn-primary', data.contact.buttonText);
                setLink('.contact-section .btn-primary', `mailto:${data.contact.email}`);
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

