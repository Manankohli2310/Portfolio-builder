let index = 0;
const carousel = document.getElementById("carousel");
const totalSlides = document.querySelectorAll(".card, .card1, .card2, .card3").length;
let autoScroll = null;
let messageShown = false;
let holdTimer = null;
let isHolding = false;

// Carousel: Manual scroll
function scrollCarousel(direction) {
  index = (index + direction + totalSlides) % totalSlides;
  carousel.style.transform = `translateX(-${index * 100}%)`;

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

// Carousel: Start auto-scroll
function startAutoScroll() {
  autoScroll = setInterval(() => scrollCarousel(1), 4000);
}

// Carousel: Stop auto-scroll
function stopAutoScroll() {
  clearInterval(autoScroll);
  autoScroll = null;
}

// Carousel: Toggle on hold
function toggleSlideshow() {
  if (autoScroll) {
    stopAutoScroll();
  } else {
    startAutoScroll();
  }
}

// Carousel: Handle hold
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
    if (isHolding) {
      toggleSlideshow();
    }
  }, 2000);
}

function cancelHold() {
  isHolding = false;
  clearTimeout(holdTimer);
}

// Carousel: Setup for both arrows
setupArrowHoldListeners(document.querySelector(".arrow.left"));
setupArrowHoldListeners(document.querySelector(".arrow.right"));

// --- Typewriter Effect ---
const texts = ["Web Developer.", "Python developer."];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
const speed = 100;
const delay = 2000;
const blankDelay = 500;

function typeEffect() {
  let currentText = texts[textIndex];
  let displayText = currentText.substring(0, charIndex);
  const typewriterElem = document.getElementById("typewriter");
  if (typewriterElem) {
    typewriterElem.textContent = displayText;
  }

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
    if (charIndex <= currentText.length) {
      charIndex++;
      setTimeout(typeEffect, speed);
    } else {
      isDeleting = true;
      setTimeout(typeEffect, delay);
    }
  }
}
// Start typewriter effect
typeEffect();
