// /js/data/template2-data.js

// This file defines the default data structure for Template 2.
// The structure is based on the visual components in template2/index.html.
window.portfolioData = {
    template: 'template2',
    theme: 'light',
    sections: {
        hero: {
            enabled: true,
            greeting: undefined, // undefined so we know to scrape it on first load
            name: undefined,
            intro: undefined,
            typewriter: [],
            profileImage: "profile.jpg",
        },
        // We will define other sections like 'about', 'skills', etc. later
    }
};