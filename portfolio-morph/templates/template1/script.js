document.addEventListener('DOMContentLoaded', function () {
    // --- Fade-in on Scroll Animation ---
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
function toggleMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
}

function closeMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
}

// Close menu when clicking outside
document.addEventListener('click', function (event) {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (!hamburger.contains(event.target) && !mobileMenu.contains(event.target)) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
    }
});


// // night theme toggle
// document.addEventListener("DOMContentLoaded", () => {
//   const toggleBtn = document.getElementById("themeToggleBtn");

//   toggleBtn.addEventListener("click", () => {
//     const body = document.body;

//     if (body.classList.contains("dark")) {
//       body.classList.remove("dark");
//     } else {
//       body.classList.add("dark");
//     }
//   });
// });
  // The function to change the theme
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }

    // Listen for messages from the parent window (builder.html)
    window.addEventListener('message', (event) => {
        const message = event.data;

        if (message.type === 'themeChange') {
            applyTheme(message.theme);
        }

        // We will add more message types later, like 'updateName', 'addSkill', etc.
    });
