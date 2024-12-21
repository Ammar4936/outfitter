// Smooth scrolling for parallax effect
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Carousel functionality
const carousel = document.querySelector('#backgroundCarousel');
const slides = carousel.querySelectorAll('.carousel-item');
let currentSlide = 0;

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
}

document.querySelector('.next-btn').addEventListener('click', nextSlide);
document.querySelector('.prev-btn').addEventListener('click', prevSlide);

// Auto-advance carousel every 5 seconds
setInterval(nextSlide, 5000);

// Menu toggle for mobile devices
const menuToggle = document.querySelector('#menu');
const menuContainer = document.querySelector('.menu-container');

menuToggle.addEventListener('click', () => {
    menuContainer.style.display = menuContainer.style.display === 'block' ? 'none' : 'block';
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !menuContainer.contains(e.target)) {
        menuContainer.style.display = 'none';
    }
});

// Search functionality
const searchIcon = document.querySelector('.searchicon');
const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.placeholder = 'Search...';
searchInput.style.display = 'none';

searchIcon.parentNode.insertBefore(searchInput, searchIcon.nextSibling);

searchIcon.addEventListener('click', () => {
    searchInput.style.display = searchInput.style.display === 'none' ? 'inline-block' : 'none';
    if (searchInput.style.display === 'inline-block') {
        searchInput.focus();
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        // Perform search (you can replace this with your actual search logic)
        console.log('Searching for:', searchInput.value);
        searchInput.value = '';
        searchInput.style.display = 'none';
    }
});

// Parallax effect
window.addEventListener('scroll', () => {
    const parallaxItems = document.querySelectorAll('.parallax-item');
    parallaxItems.forEach((item, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = -(window.pageYOffset * speed);
        item.style.backgroundPosition = `center ${yPos}px`;
    });
});