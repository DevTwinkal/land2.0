// Documents page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize documents page when it's selected
    const documentsNavItem = document.querySelector('.nav-item[data-page="documents"]');
    if (documentsNavItem) {
        documentsNavItem.addEventListener('click', initDocumentsPage);
    }
});

// Initialize the documents page
async function initDocumentsPage() {
    console.log('Initializing documents page');
    const documentsContainer = document.getElementById('documents-list-container');
    
    // Show loading state
    documentsContainer.innerHTML = '<div class="loading-spinner"></div><p class="text-center">Loading properties and documents...</p>';
    
    try {
        // Fetch properties from the API
        const properties = await api.getLandRecords();
        console.log('Properties data for documents page:', properties);
        
        // Clear the loading state
        documentsContainer.innerHTML = '';
        
        // Create UI for documents management
        createDocumentsUI(documentsContainer, properties);
    } catch (error) {
        console.error('Failed to load properties for documents page:', error);
        documentsContainer.innerHTML = `
            <div class="error-container">
                <p>Failed to load properties: ${error.message}</p>
                <button class="retry-btn" onclick="initDocumentsPage()">Retry</button>
            </div>
        `;
    }
}

// Create the documents management UI
function createDocumentsUI(container, properties) {
    // Create documents UI components
    const documentsUI = document.createElement('div');
    documentsUI.className = 'documents-ui';
    
    // Create property selector section
    const propertySelectorSection = document.createElement('div');
    propertySelectorSection.className = 'property-selector-section';
    propertySelectorSection.innerHTML = `
        <div class="form-group">
            <label for="document-property-select">Select Property</label>
            <select id="document-property-select">
                <option value="">Choose a property</option>
                ${properties.map(property => `
                    <option value="${property.id}">${property.property_address} (${property.survey_number})</option>
                `).join('')}
            </select>
        </div>
    `;
    
    // Create documents upload section
    const documentUploadSection = document.createElement('div');
    documentUploadSection.className = 'document-upload-section';
    documentUploadSection.innerHTML = `
        <h3>Upload New Document</h3>
        <form id="document-upload-form">
            <input type="hidden" id="document-upload-land-id" name="land_id">
            <div class="form-group">
                <label for="document-upload-type">Document Type</label>
                <select id="document-upload-type" name="document_type" required>
                    <option value="">Select Document Type</option>
                    <option value="sale_deed">Sale Deed</option>
                    <option value="property_tax">Property Tax Receipt</option>
                    <option value="survey_map">Survey Map</option>
                    <option value="land_title">Land Title</option>
                    <option value="mutation_certificate">Mutation Certificate</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label for="document-upload-file">Document File</label>
                <input type="file" id="document-upload-file" name="file" required>
            </div>
            <button type="submit" class="primary-btn">Upload Document</button>
        </form>
    `;
    
    // Create documents list section
    const documentsListSection = document.createElement('div');
    documentsListSection.className = 'documents-list-section';
    documentsListSection.innerHTML = `
        <h3>Property Documents</h3>
        <div id="documents-list">
            <p class="select-property-message">Please select a property to view its documents</p>
        </div>
    `;
    
    // Append sections to the UI
    documentsUI.appendChild(propertySelectorSection);
    documentsUI.appendChild(documentUploadSection);
    documentsUI.appendChild(documentsListSection);
    
    // Append UI to the container
    container.appendChild(documentsUI);
    
    // Initialize event handlers
    initDocumentsEventHandlers();
}

// Initialize event handlers for documents page
function initDocumentsEventHandlers() {
    // Property selection handler
    const propertySelect = document.getElementById('document-property-select');
    if (propertySelect) {
        propertySelect.addEventListener('change', async () => {
            const selectedPropertyId = propertySelect.value;
            const uploadFormLandId = document.getElementById('document-upload-land-id');
            const documentsList = document.getElementById('documents-list');
            
            // Update the hidden input in the upload form
            if (uploadFormLandId) {
                uploadFormLandId.value = selectedPropertyId;
            }
            
            // Show/hide upload form based on selection
            const uploadForm = document.getElementById('document-upload-form');
            if (uploadForm) {
                uploadForm.style.display = selectedPropertyId ? 'block' : 'none';
            }
            
            // If no property is selected, show message
            if (!selectedPropertyId) {
                documentsList.innerHTML = '<p class="select-property-message">Please select a property to view its documents</p>';
                return;
            }
            
            // Show loading state
            documentsList.innerHTML = '<div class="loading-spinner"></div><p>Loading documents...</p>';
            
            try {
                // Fetch documents for selected property
                const documents = await api.getDocuments(selectedPropertyId);
                console.log('Documents for selected property:', documents);
                
                // Update documents list
                if (documents.length === 0) {
                    documentsList.innerHTML = '<p class="no-data">No documents found for this property.</p>';
                } else {
                    documentsList.innerHTML = createDocumentsList(documents);
                }
            } catch (error) {
                console.error('Failed to load documents:', error);
                documentsList.innerHTML = `
                    <div class="error-container">
                        <p>Failed to load documents: ${error.message}</p>
                        <button class="retry-btn" onclick="refreshDocumentsList('${selectedPropertyId}')">Retry</button>
                    </div>
                `;
            }
        });
    }
    
    // Document upload form handler
    const uploadForm = document.getElementById('document-upload-form');
    if (uploadForm) {
        // Initially hide the form until a property is selected
        uploadForm.style.display = 'none';
        
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const landId = document.getElementById('document-upload-land-id').value;
            const documentType = document.getElementById('document-upload-type').value;
            const fileInput = document.getElementById('document-upload-file');
            const file = fileInput.files[0];
            
            if (!landId) {
                alert('Please select a property first');
                return;
            }
            
            if (!file) {
                alert('Please select a file to upload');
                return;
            }
            
            // Show loading state
            const submitBtn = uploadForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Uploading...';
            submitBtn.disabled = true;
            
            try {
                const result = await api.uploadDocument(landId, documentType, file);
                console.log('Document uploaded:', result);
                alert('Document uploaded successfully!');
                
                // Reset form
                uploadForm.reset();
                
                // Refresh documents list
                refreshDocumentsList(landId);
            } catch (error) {
                console.error('Failed to upload document:', error);
                alert(`Failed to upload document: ${error.message}`);
            } finally {
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// Create HTML for the documents list
function createDocumentsList(documents) {
    return `
        <div class="documents-grid">
            ${documents.map(doc => {
                const uploadedDate = new Date(doc.uploaded_at);
                const formattedDate = uploadedDate.toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                });
                
                const docTypeDisplay = doc.document_type.replace('_', ' ')
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                
                // Determine document icon based on type
                let iconClass = 'document-icon';
                switch (doc.document_type) {
                    case 'sale_deed':
                        iconClass += ' deed-icon';
                        break;
                    case 'property_tax':
                        iconClass += ' tax-icon';
                        break;
                    case 'survey_map':
                        iconClass += ' map-icon';
                        break;
                    default:
                        iconClass += ' doc-icon';
                }
                
                return `
                    <div class="document-card" data-id="${doc.id}">
                        <div class="${iconClass}">📄</div>
                        <div class="document-card-content">
                            <h4 class="document-title">${docTypeDisplay}</h4>
                            <p class="document-filename">${doc.file_name}</p>
                            <p class="document-date">Uploaded: ${formattedDate}</p>
                            <div class="document-verification">
                                <span class="verification-label">Verification Hash:</span>
                                <span class="verification-value">${doc.file_hash.substring(0, 16)}...</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Refresh the documents list for a specific property
async function refreshDocumentsList(propertyId) {
    const documentsList = document.getElementById('documents-list');
    
    if (!documentsList || !propertyId) return;
    
    // Show loading state
    documentsList.innerHTML = '<div class="loading-spinner"></div><p>Loading documents...</p>';
    
    try {
        // Fetch documents for selected property
        const documents = await api.getDocuments(propertyId);
        
        // Update documents list
        if (documents.length === 0) {
            documentsList.innerHTML = '<p class="no-data">No documents found for this property.</p>';
        } else {
            documentsList.innerHTML = createDocumentsList(documents);
        }
    } catch (error) {
        console.error('Failed to refresh documents:', error);
        documentsList.innerHTML = `
            <div class="error-container">
                <p>Failed to load documents: ${error.message}</p>
                <button class="retry-btn" onclick="refreshDocumentsList('${propertyId}')">Retry</button>
            </div>
        `;
    }
}