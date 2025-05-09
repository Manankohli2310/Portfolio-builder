let index = 0;
const carousel = document.getElementById("carousel");
let autoScroll = null;
let messageShown = false;
let holdTimer = null;
let isHolding = false;

// Project distribution and card creation
document.addEventListener("DOMContentLoaded", () => {
  // Define project template items
  const projectTemplates = document.getElementById("project-templates");
  const projectBoxes = Array.from(projectTemplates.querySelectorAll(".project-box"));
  
  // Initially distribute projects to cards
  distributeProjects(projectBoxes);
  
  // Update total slides count
  updateSlideCount();
});

// Function to distribute projects across cards
function distributeProjects(projectBoxes) {
  // Get the skills card and projects container
  const skillsCard = document.getElementById("skills-card");
  const projectsContainer = document.getElementById("projects-container");
  
  // Clear existing projects
  projectsContainer.innerHTML = "";
  
  // Remove any existing project cards (except the skills card)
  const existingProjectCards = document.querySelectorAll(".card-projects");
  existingProjectCards.forEach(card => card.remove());
  
  // Add projects to first container
  let currentContainer = projectsContainer;
  let currentCard = skillsCard;
  let projectCardsCreated = 0;
  
  // Add each project and check if it fits
  projectBoxes.forEach((projectBox, index) => {
    // Clone the project box
    const clonedProject = projectBox.cloneNode(true);
    
    // Add to current container
    currentContainer.appendChild(clonedProject);
    
    // Check if content overflows
    if (isOverflowing(currentCard)) {
      // Remove the project that caused overflow
      currentContainer.removeChild(clonedProject);
      
      // Create a new card for projects
      const newCard = createProjectCard(projectCardsCreated + 1);
      carousel.appendChild(newCard);
      projectCardsCreated++;
      
      // Update current container to the new card's project container
      currentContainer = newCard.querySelector(".projects");
      currentCard = newCard;
      
      // Add the project to the new container
      currentContainer.appendChild(clonedProject);
    }
  });
  
  // Update total slides count
  updateSlideCount();
}

// Check if a card is overflowing
function isOverflowing(element) {
  return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}

// Create a new project card
function createProjectCard(cardNumber) {
  const newCard = document.createElement("div");
  newCard.className = "card-projects";
  newCard.id = `projects-card-${cardNumber}`;
  
  newCard.innerHTML = `
    <div class="text-projects">
      <h1>More Projects</h1>
      <div class="projects" id="projects-container-${cardNumber}"></div>
    </div>
  `;
  
  return newCard;
}

// Update total slides count
function updateSlideCount() {
  // Count all slides
  const totalSlides = document.querySelectorAll(".carousel > div").length;
  
  // Add page indicator if needed
  if (totalSlides > 1) {
    createPageIndicator(totalSlides);
  }
}

// Create page indicator
function createPageIndicator(totalSlides) {
  // Remove existing indicator
  const existingIndicator = document.querySelector(".page-indicator");
  if (existingIndicator) {
    existingIndicator.remove();
  }
  
  // Create new indicator
  const indicator = document.createElement("div");
  indicator.className = "page-indicator";
  
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement("span");
    dot.className = i === index ? "dot active" : "dot";
    dot.onclick = () => {
      scrollToSlide(i);
    };
    indicator.appendChild(dot);
  }
  
  // Append to container
  document.querySelector(".carousel-container").appendChild(indicator);
}

// Update page indicator
function updatePageIndicator() {
  const dots = document.querySelectorAll(".page-indicator .dot");
  if (dots.length > 0) {
    dots.forEach((dot, i) => {
      dot.className = i === index ? "dot active" : "dot";
    });
  }
}

// Scroll to specific slide
function scrollToSlide(slideIndex) {
  index = slideIndex;
  carousel.style.transform = `translateX(-${index * 100}%)`;
  updatePageIndicator();
}

// Carousel: Manual scroll
function scrollCarousel(direction) {
  const totalSlides = document.querySelectorAll(".carousel > div").length;
  index = (index + direction + totalSlides) % totalSlides;
  carousel.style.transform = `translateX(-${index * 100}%)`;
  updatePageIndicator();

  if (!messageShown) {
    showHoldMessage();
    messageShown = true;
  }
}

// Carousel: Show one-time message
function showHoldMessage() {
  const msg = document.createElement("div");
  msg.textContent = "Hold to view in slideshow";
  msg.className = "hold-popup";
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 4000);
}

// Carousel: Start/Stop auto-scroll
function startAutoScroll() {
  autoScroll = setInterval(() => {
    scrollCarousel(1);
  }, 4000);
}

function stopAutoScroll() {
  clearInterval(autoScroll);
  autoScroll = null;
}

function toggleSlideshow() {
  if (autoScroll) {
    stopAutoScroll();
  } else {
    startAutoScroll();
  }
}

function setupArrowHoldListeners(arrow) {
  arrow.addEventListener("mousedown", startHold);
  arrow.addEventListener("mouseup", cancelHold);
  arrow.addEventListener("mouseleave", cancelHold);
  arrow.addEventListener("touchstart", startHold);
  arrow.addEventListener("touchend", cancelHold);
}

function startHold() {
  isHolding = true;
  holdTimer = setTimeout(() => {
    if (isHolding) toggleSlideshow();
  }, 2000);
}

function cancelHold() {
  isHolding = false;
  clearTimeout(holdTimer);
}

// Set up arrow listeners
document.addEventListener("DOMContentLoaded", () => {
  setupArrowHoldListeners(document.querySelector(".arrow.left"));
  setupArrowHoldListeners(document.querySelector(".arrow.right"));
});

// --- Typewriter Effect ---
const texts = ["Web Developer.", "Python developer."];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
const speed = 100, delay = 2000, blankDelay = 500;

function typeEffect() {
  const currentText = texts[textIndex];
  const displayText = currentText.substring(0, charIndex);
  const typewriterElem = document.getElementById("typewriter");

  if (typewriterElem) typewriterElem.textContent = displayText;

  if (isDeleting) {
    if (charIndex > 0) {
      charIndex--;
      setTimeout(typeEffect, speed / 2);
    } else {
      if (typewriterElem) typewriterElem.textContent = "";
      setTimeout(() => {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        setTimeout(typeEffect, speed);
      }, blankDelay);
    }
  } else {
    if (charIndex < currentText.length) {
      charIndex++;
      setTimeout(typeEffect, speed);
    } else {
      isDeleting = true;
      setTimeout(typeEffect, delay);
    }
  }
}

// Start typewriter effect
document.addEventListener("DOMContentLoaded", () => {
  typeEffect();
  
  // Handle window resize
  window.addEventListener("resize", () => {
    // Get all project boxes
    const projectTemplates = document.getElementById("project-templates");
    const projectBoxes = Array.from(projectTemplates.querySelectorAll(".project-box"));
    
    // Redistribute projects on resize
    distributeProjects(projectBoxes);
  });
});