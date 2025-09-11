
  const filterButtons = document.querySelectorAll(".filter-buttons button");
  const galleryItems = document.querySelectorAll(".gallery-item");

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      // remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      const filter = button.getAttribute("data-filter");

      galleryItems.forEach(item => {
        if (filter === "all" || item.classList.contains(filter)) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });
    });
  });


  // Select elements

const galleryImages = document.querySelectorAll(".gallery-item img");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxTitle = document.getElementById("lightbox-title");
const lightboxDesc = document.getElementById("lightbox-desc");
const closeBtn = document.querySelector(".lightbox .close");

// Open image with caption
galleryImages.forEach(img => {
  img.addEventListener("click", () => {
    // ✅ Disable lightbox on mobile & iPad
    if (window.innerWidth <= 1024) {
      return; // do nothing
    }

    // ✅ Desktop behavior (show lightbox)
    lightbox.style.display = "flex";
    lightboxImg.src = img.getAttribute("data-full");
    lightboxTitle.textContent = img.getAttribute("data-title") || "";
    lightboxDesc.textContent = img.getAttribute("data-desc") || "";
  });
});


// Close
closeBtn.addEventListener("click", () => {
  lightbox.style.display = "none";
});

// Close when clicking outside image
lightboxImg.addEventListener("dblclick", (e) => {
  if (lightboxImg.classList.contains("zoomed")) {
    // zoom out
    lightboxImg.classList.remove("zoomed");
    lightboxImg.style.transformOrigin = "center center";
  } else {
    // calculate click position relative to image
    const rect = lightboxImg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    lightboxImg.style.transformOrigin = `${x}% ${y}%`;
    lightboxImg.classList.add("zoomed");
  }
});

// ✅ Close when clicking outside the image
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) {   // only background, not image
    lightbox.style.display = "none";
    lightboxImg.classList.remove("zoomed");
    lightboxImg.style.transformOrigin = "center center";
  }
});



// script.js
document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('.feedback-form');
  const successMessage = document.getElementById('success-message');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      const response = await fetch('https://formspree.io/f/mgvlrppb', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        successMessage.style.display = 'block';
        form.reset();
        setTimeout(() => {
          successMessage.style.display = 'none';
        }, 5000);
      } else {
        alert('Submission failed. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error. Please check your connection.');
    }
  });
});

// ✅ Show navbar only on home (hero) for mobile
// Show/hide fixed navbar on scroll for mobile
document.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  const heroSection = document.getElementById("hero");
  const rect = heroSection.getBoundingClientRect();

  // If the user has scrolled past the hero section, hide the navbar
  if (window.innerWidth <= 1024 && rect.bottom < 0) {
    navbar.style.transform = "translateY(-100%)";
  } else {
    // Otherwise, show the navbar
    navbar.style.transform = "translateY(0)";
  }
});

// Make sure the mobile navbar is always visible on load at the top
window.addEventListener("load", () => {
  const navbar = document.querySelector(".navbar");
  if (window.innerWidth <= 1024) {
    navbar.style.transform = "translateY(0)";
  }
});


// ✅ Pinch-to-zoom + drag/pan support for mobile
/* let initialDistance = 0;
let currentScale = 1;
let originX = 0, originY = 0;
let lastX = 0, lastY = 0;
let isDragging = false;

// Helper to get midpoint of two fingers
function getMidpoint(touches) {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2
  };
}

// Touch start
lightboxImg.addEventListener("touchstart", (e) => {
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    initialDistance = Math.sqrt(dx * dx + dy * dy);

    // Save midpoint as zoom origin
    const midpoint = getMidpoint(e.touches);
    const rect = lightboxImg.getBoundingClientRect();
    originX = ((midpoint.x - rect.left) / rect.width) * 100;
    originY = ((midpoint.y - rect.top) / rect.height) * 100;

    lightboxImg.style.transformOrigin = `${originX}% ${originY}%`;
  } else if (e.touches.length === 1 && currentScale > 1) {
    // Start dragging
    isDragging = true;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  }
}, { passive: false });

// Touch move
lightboxImg.addEventListener("touchmove", (e) => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const newDistance = Math.sqrt(dx * dx + dy * dy);

    let scale = newDistance / initialDistance;
    scale = Math.max(1, Math.min(scale * currentScale, 4)); // allow up to 4x zoom

    lightboxImg.style.transform = `scale(${scale}) translate(${lastX}px, ${lastY}px)`;
    lightboxImg.dataset.scale = scale;
  } else if (isDragging && e.touches.length === 1) {
    e.preventDefault();
    const deltaX = e.touches[0].clientX - lastX;
    const deltaY = e.touches[0].clientY - lastY;

    lastX += deltaX;
    lastY += deltaY;

    const scale = parseFloat(lightboxImg.dataset.scale || currentScale);
    lightboxImg.style.transform = `scale(${scale}) translate(${lastX}px, ${lastY}px)`;
  }
}, { passive: false });

// Touch end
lightboxImg.addEventListener("touchend", (e) => {
  if (e.touches.length === 0) {
    isDragging = false;
    currentScale = parseFloat(lightboxImg.dataset.scale || currentScale);

    if (currentScale <= 1.05) {
      // ✅ Reset everything
      currentScale = 1;
      lastX = 0;
      lastY = 0;
      lightboxImg.style.transform = "scale(1) translate(0, 0)";
      lightboxImg.dataset.scale = 1;
      lightboxImg.style.transformOrigin = "center center";
    } else {
      // keep current scale & translation
      lightboxImg.style.transform = `scale(${currentScale}) translate(${lastX}px, ${lastY}px)`;
    }
  }
});

 */

/* document.addEventListener("DOMContentLoaded", () => {
  const hero = document.getElementById("hero");

  function toggleNavbar() {
    if (window.innerWidth <= 768) {
      const rect = hero.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // Check if hero is in viewport
      const heroTop = rect.top;
      const heroBottom = rect.bottom;

      // If hero is partially visible (top <= 0 and bottom > 0)
      if (heroTop <= 0 && heroBottom > 0) {
        document.body.classList.add("home-page");
      } else {
        document.body.classList.remove("home-page");
      }
    } else {
      // Desktop: always show navbar
      document.body.classList.add("home-page");
    }
  }

  // Run on load
  toggleNavbar();

  // Run on scroll and resize
  window.addEventListener("scroll", toggleNavbar);
  window.addEventListener("resize", toggleNavbar);
}); */

// New JS for hamburger menu
const hamburger = document.querySelector(".hamburger-menu");
const navLinks = document.querySelector(".nav-links");
const navAnchors = document.querySelectorAll(".nav-links a"); // Get all links inside nav

// Toggle menu on hamburger click
hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  hamburger.classList.toggle("active"); // Toggle active class on hamburger for animation
});

// Close menu when a navigation link is clicked (for smoother navigation)
navAnchors.forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("active");
    hamburger.classList.remove("active"); // Remove active class from hamburger
  });
});

// Close menu when clicking outside (important for dropdowns)
document.addEventListener("click", (e) => {
  if (!navLinks.contains(e.target) && !hamburger.contains(e.target) && navLinks.classList.contains("active")) {
    navLinks.classList.remove("active");
    hamburger.classList.remove("active"); // Remove active class from hamburger
  }
});

// Keep your existing JS for gallery, lightbox, form submission, and scroll-dependent navbar visibility for mobile hero.
// Ensure your toggleNavbar function (for mobile hero section visibility) is still present.
// If you've used the last suggestion for toggleNavbar:
/*
function toggleNavbar() {
  if (window.innerWidth <= 768) {
    if (window.scrollY < 100) {
      document.body.classList.add("home-page");
    } else {
      document.body.classList.remove("home-page");
    }
  } else {
    document.body.classList.add("home-page");
  }
}

*/

// Go To Top Button functionality
const goToTopBtn = document.querySelector(".go-to-top");

// Show/hide the button on scroll
window.addEventListener("scroll", () => {
  if (window.scrollY > 300) { // Shows button after scrolling 300px
    goToTopBtn.classList.add("show");
  } else {
    goToTopBtn.classList.remove("show");
  }
});

// Scroll to top on click
goToTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});
