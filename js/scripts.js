// Show Courses
function courses() {
  var x = document.getElementById("tum-courses");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}

// Image Slideshow
document.addEventListener('DOMContentLoaded', function() { 
  //addEventListener ensures that the DOM is loaded first
  let slideIndex = 1;
  showSlides(slideIndex);

  function plusSlides(n) {
      showSlides(slideIndex += n);
  }

  function currentSlide(n) {
      showSlides(slideIndex = n);
  }

  function showSlides(n) {
      let i;
      let slides = document.getElementsByClassName("mySlides");
      let dots = document.getElementsByClassName("dot");
      if (n > slides.length) {slideIndex = 1}    
      if (n < 1) {slideIndex = slides.length}
      for (i = 0; i < slides.length; i++) {
          slides[i].style.display = "none";  
      }
      for (i = 0; i < dots.length; i++) {
          dots[i].className = dots[i].className.replace(" active", "");
      }
      slides[slideIndex-1].style.display = "block";  
      dots[slideIndex-1].className += " active";
  }

  // Event listeners for next and previous buttons, so that it can be accessed after the first execution
  document.querySelector('.prev').addEventListener('click', function() {
      plusSlides(-1);
  });

  document.querySelector('.next').addEventListener('click', function() {
      plusSlides(1);
  });

  // Dots navigation
  let dotElements = document.getElementsByClassName("dot");
  for (let i = 0; i < dotElements.length; i++) {
      dotElements[i].addEventListener('click', function() {
          currentSlide(i + 1);
      });
  }
});
