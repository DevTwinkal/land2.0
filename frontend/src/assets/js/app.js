// Main application functionality
document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const pageName = this.getAttribute('data-page');
            
            // Update active nav item
            navItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected page
            pages.forEach(page => {
                if (page.id === `${pageName}-page`) {
                    page.classList.add('active');
                } else {
                    page.classList.remove('active');
                }
            });
        });
    });
    
    // Add property modal
    const addPropertyBtn = document.querySelector('.add-property-btn');
    const addPropertyModal = document.getElementById('add-property-modal');
    const addPropertyForm = document.getElementById('add-property-form');
    const closeAddPropertyBtn = addPropertyModal.querySelector('.close-btn');
    
    addPropertyBtn.addEventListener('click', function() {
        addPropertyModal.style.display = 'flex';
    });
    
    closeAddPropertyBtn.addEventListener('click', function() {
        addPropertyModal.style.display = 'none';
    });
    
    addPropertyForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const landRecordData = {
            property_address: document.getElementById('property-address-input').value,
            area_sqft: parseFloat(document.getElementById('area-sqft').value),
            survey_number: document.getElementById('survey-number').value,
            geo_latitude: document.getElementById('geo-latitude').value ? parseFloat(document.getElementById('geo-latitude').value) : null,
            geo_longitude: document.getElementById('geo-longitude').value ? parseFloat(document.getElementById('geo-longitude').value) : null
        };
        
        try {
            await api.createLandRecord(landRecordData);
            alert('Property added successfully!');
            addPropertyModal.style.display = 'none';
            addPropertyForm.reset();
            
            // Reload land records
            loadLandRecords();
        } catch (error) {
            alert(error.message || 'Failed to add property');
        }
    });
    
    // Upload document modal
    const uploadDocumentBtn = document.getElementById('upload-document-btn');
    const uploadDocumentModal = document.getElementById('upload-document-modal');
    const uploadDocumentForm = document.getElementById('upload-document-form');
    const closeUploadDocumentBtn = uploadDocumentModal.querySelector('.close-btn');
    
    uploadDocumentBtn.addEventListener('click', function() {
        if (!selectedParcel) {
            alert('Please select a property first');
            return;
        }
        
        document.getElementById('document-land-id').value = selectedParcel.properties.id;
        uploadDocumentModal.style.display = 'flex';
    });
    
    closeUploadDocumentBtn.addEventListener('click', function() {
        uploadDocumentModal.style.display = 'none';
    });
    
    uploadDocumentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const landId = document.getElementById('document-land-id').value;
        const documentType = document.getElementById('document-type').value;
        const file = document.getElementById('document-file').files[0];
        
        if (!file) {
            alert('Please select a file');
            return;
        }
        
        try {
            await api.uploadDocument(landId, documentType, file);
            alert('Document uploaded successfully!');
            uploadDocumentModal.style.display = 'none';
            uploadDocumentForm.reset();
            
            // Refresh property details
            fetchPropertyDetails(landId);
        } catch (error) {
            alert(error.message || 'Failed to upload document');
        }
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === addPropertyModal) {
            addPropertyModal.style.display = 'none';
        }
        if (e.target === uploadDocumentModal) {
            uploadDocumentModal.style.display = 'none';
        }
    });
});

// Global variable for selected parcel
let selectedParcel = null;