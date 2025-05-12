let index = 0;
const carousel = document.getElementById("carousel");
let autoScroll = null;
let messageShown = false;
let holdTimer = null;
let isHolding = false;

// --- On DOM Load ---
document.addEventListener("DOMContentLoaded", () => {
  const projectTemplates = document.getElementById("project-templates");
  const projectBoxes = Array.from(projectTemplates.querySelectorAll(".project-box"));

  renderAllProjects(projectBoxes);
  setupArrowHoldListeners(document.querySelector(".arrow.left"));
  setupArrowHoldListeners(document.querySelector(".arrow.right"));
  typeEffect();
});

// --- Simplified Project Rendering ---
function renderAllProjects(projectBoxes) {
  const projectsContainer = document.getElementById("projects-container");

  // Clear any existing content
  projectsContainer.innerHTML = "";

  // Append all project boxes into the single container
  projectBoxes.forEach(box => {
    const clone = box.cloneNode(true);
    projectsContainer.appendChild(clone);
  });
}

// --- Carousel Navigation ---
function scrollToSlide(slideIndex) {
  index = slideIndex;
  carousel.style.transform = `translateX(-${index * 100}%)`;
}

function scrollCarousel(direction) {
  const total = document.querySelectorAll(".carousel > div").length;
  index = (index + direction + total) % total;
  scrollToSlide(index);

  if (!messageShown) {
    showHoldMessage();
    messageShown = true;
  }
}

function showHoldMessage() {
  const msg = document.createElement("div");
  msg.textContent = "Hold to view in slideshow";
  msg.className = "hold-popup";
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 4000);
}

function startAutoScroll() {
  autoScroll = setInterval(() => scrollCarousel(1), 4000);
}

function stopAutoScroll() {
  clearInterval(autoScroll);
  autoScroll = null;
}

function toggleSlideshow() {
  autoScroll ? stopAutoScroll() : startAutoScroll();
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
  holdTimer = setTimeout(() => isHolding && toggleSlideshow(), 2000);
}

function cancelHold() {
  isHolding = false;
  clearTimeout(holdTimer);
}

// --- Typewriter Effect ---
const texts = ["Web Developer.", "Python Developer."];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
const speed = 100, delay = 2000, blankDelay = 500;

function typeEffect() {
  const currentText = texts[textIndex];
  const output = currentText.substring(0, charIndex);
  const elem = document.getElementById("typewriter");
  if (elem) elem.textContent = output;

  if (isDeleting) {
    if (charIndex > 0) {
      charIndex--;
      setTimeout(typeEffect, speed / 2);
    } else {
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
