document.addEventListener('DOMContentLoaded', function() {
    // Select all sidebar navigation items
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    
    // Add click event listeners to each nav item
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Get the page to show
            const pageToShow = this.getAttribute('data-page');
            
            // Remove active class from all nav items and add to clicked one
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Hide all pages
            pages.forEach(page => page.classList.remove('active'));
            
            // Show the selected page
            const activePage = document.getElementById(`${pageToShow}-page`);
            if (activePage) {
                activePage.classList.add('active');
                
                // If map is visible, resize it to fix rendering issues
                if (pageToShow === 'land-records' && typeof map !== 'undefined') {
                    setTimeout(() => {
                        map.invalidateSize();
                    }, 100);
                }
            }
        });
    });
});