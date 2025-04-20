(function ($) {
    "use strict";
    
    // Dropdown on mouse hover
    $(document).ready(function () {
        function toggleNavbarMethod() {
            if ($(window).width() > 992) {
                $('.navbar .dropdown').on('mouseover', function () {
                    $('.dropdown-toggle', this).trigger('click');
                }).on('mouseout', function () {
                    $('.dropdown-toggle', this).trigger('click').blur();
                });
            } else {
                $('.navbar .dropdown').off('mouseover').off('mouseout');
            }
        }
        toggleNavbarMethod();
        $(window).resize(toggleNavbarMethod);
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });
})(jQuery);
const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});
// script.js
const addClientBtn = document.getElementById('add-client-button');

addClientBtn.addEventListener('click', () => {
    container.classList.add("active", "add-client");
});


document.addEventListener("DOMContentLoaded", function () {
    const testimonialBlocks = document.querySelectorAll(".testimonial-block");
    const indicators = document.querySelectorAll(".carousel-indicators li");
  
    let currentSlide = 0;
  
    // Afficher le premier commentaire par défaut
    testimonialBlocks[currentSlide].classList.add("active");
  
    // Gérer les indicateurs de navigation
    indicators.forEach((indicator, index) => {
      indicator.addEventListener("click", () => {
        goToSlide(index);
      });
    });
  
    // Fonction pour passer au slide spécifié
    function goToSlide(slideIndex) {
      // Enlever l'actif de tous les blocs et indicateurs
      testimonialBlocks.forEach((block) => block.classList.remove("active"));
      indicators.forEach((indicator) => indicator.classList.remove("active"));
  
      // Mettre à jour le slide actif
      testimonialBlocks[slideIndex].classList.add("active");
      indicators[slideIndex].classList.add("active");
  
      currentSlide = slideIndex;
    }
  });