// Show Courses
function courses() {
    var x = document.getElementById("tum-courses");
    if (x.style.display === "block") {
      x.style.display = "none";
    } else {
      x.style.display = "block";
    }
}

// Navigation page switching
function showPage(pageId) {
    // Hide all page sections
    document.querySelectorAll('.page-section').forEach(section => {
        section.style.display = 'none';
        section.classList.remove('fade-in');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected page and add active class
    if (pageId === 'home') {
        const homeContent = document.getElementById('home-content');
        if (homeContent) {
            homeContent.style.display = 'block';
            // Trigger animation
            void homeContent.offsetWidth;
            homeContent.classList.add('fade-in');
        }
        event.target.classList.add('active');
    } else {
        const container = document.getElementById(pageId + '-container');
        if (container) {
            container.style.display = 'block';
            // Trigger animation
            void container.offsetWidth;
            container.classList.add('fade-in');
        }
        event.target.classList.add('active');
    }
}