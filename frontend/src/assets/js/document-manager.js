// Enhanced Document Management with Indian Land Records
document.addEventListener('DOMContentLoaded', function() {
    // Initialize document features when the documents page is activated
    const documentsNavItem = document.querySelector('.nav-item[data-page="documents"]');
    if (documentsNavItem) {
      documentsNavItem.addEventListener('click', initDocumentsPage);
    }
    
    // Check if we're already on the documents page
    if (document.querySelector('[data-page="documents"].active') || 
        window.location.href.includes('documents')) {
      initDocumentsPage();
    }
    
    // Initialize the documents page
    function initDocumentsPage() {
      console.log('Initializing Documents page...');
      const documentsContainer = document.getElementById('documents-list-container');
      
      if (!documentsContainer) {
        console.error('Documents container not found');
        return;
      }
      
      // Create documents UI
      documentsContainer.innerHTML = `
        <div class="documents-ui">
          <div class="document-intro">
            <h3>Land Documents Management</h3>
            <p>View, upload and manage all your property documents in one place</p>
          </div>
          
          <div class="document-sections">
            <!-- Property Selector Section -->
            <div class="document-section property-selector-section">
              <h4>Select Property</h4>
              <div class="form-group">
                <select id="document-property-select" class="property-select">
                  <option value="">-- Choose a property --</option>
                  <!-- Properties will be loaded here -->
                </select>
              </div>
            </div>
            
            <!-- Document Upload Section -->
            <div class="document-section upload-section" style="display: none;">
              <h4>Upload New Document</h4>
              <form id="document-upload-form" enctype="multipart/form-data">
                <input type="hidden" id="upload-property-id" name="land_id">
                
                <div class="form-group">
                  <label for="document-type">Document Type</label>
                  <select id="document-type" name="document_type" required>
                    <option value="">-- Select Document Type --</option>
                    <option value="sale_deed">Sale Deed</option>
                    <option value="property_tax">Property Tax Receipt</option>
                    <option value="survey_map">Survey Map</option>
                    <option value="mutation_certificate">Mutation Certificate</option>
                    <option value="e_stamp">e-Stamp Certificate</option>
                    <option value="registry">Registry Document</option>
                    <option value="khatauni">Khatauni</option>
                    <option value="jamabandi">Jamabandi</option>
                    <option value="noc">No Objection Certificate</option>
                    <option value="encumbrance_certificate">Encumbrance Certificate</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="document-file">Select File</label>
                  <div class="file-upload-wrapper">
                    <label for="document-file" class="file-upload-label">
                      <span class="upload-icon">📄</span>
                      <span class="upload-text">Choose a file...</span>
                    </label>
                    <input type="file" id="document-file" name="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" required style="display: none;">
                  </div>
                  <div id="file-info" class="file-info"></div>
                  <small class="form-hint">Accepted formats: PDF, JPEG, PNG, DOC (Max 10MB)</small>
                </div>
                
                <div class="form-group">
                  <label for="document-description">Description (Optional)</label>
                  <textarea id="document-description" name="description" rows="2" maxlength="200" placeholder="Add a short description of this document"></textarea>
                </div>
                
                <button type="submit" class="primary-btn">
                  <span class="btn-icon">📤</span> Upload Document
                </button>
              </form>
            </div>
            
            <!-- Documents List Section -->
            <div class="document-section documents-list-section">
              <div class="section-header">
                <h4>Documents Library</h4>
                <div class="document-filters">
                  <select id="document-filter" class="document-filter">
                    <option value="all">All Types</option>
                    <option value="sale_deed">Sale Deeds</option>
                    <option value="property_tax">Tax Documents</option>
                    <option value="survey_map">Maps & Surveys</option>
                    <option value="other">Other Documents</option>
                  </select>
                </div>
              </div>
              
              <div id="documents-list" class="documents-list">
                <p class="select-property-message">Please select a property to view its documents</p>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Add CSS styles
      addDocumentStyles();
      
      // Initialize document UI functionality
      initPropertySelect();
      initFileUpload();
      initDocumentUploadForm();
      initDocumentFilter();
    }
    
    // Add CSS styles for document management
    function addDocumentStyles() {
      // Check if styles already exist
      if (document.getElementById('document-styles')) return;
      
      const styles = document.createElement('style');
      styles.id = 'document-styles';
      styles.textContent = `
        .documents-ui {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .document-intro {
          text-align: center;
          margin-bottom: 30px;
          background-color: #f0f7ff;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #2563eb;
        }
        
        .document-intro h3 {
          color: #1e40af;
          margin-bottom: 10px;
        }
        
        .document-sections {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        
        @media (min-width: 768px) {
          .document-sections {
            grid-template-columns: 300px 1fr;
          }
          
          .documents-list-section {
            grid-column: 1 / 3;
          }
        }
        
        @media (min-width: 1024px) {
          .document-sections {
            grid-template-columns: 300px 1fr;
          }
        }
        
        .document-section {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          padding: 20px;
        }
        
        .document-section h4 {
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 18px;
          color: #1e40af;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 10px;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .property-select, .document-filter {
          width: 100%;
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }
        
        .form-group {
          margin-bottom: 18px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #1f2937;
        }
        
        .form-hint {
          display: block;
          color: #6b7280;
          margin-top: 5px;
          font-size: 12px;
        }
        
        .file-upload-wrapper {
          margin-bottom: 10px;
        }
        
        .file-upload-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 20px;
          border: 2px dashed #d1d5db;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          background-color: #f9fafb;
          text-align: center;
        }
        
        .file-upload-label:hover {
          border-color: #2563eb;
          background-color: #f0f7ff;
        }
        
        .upload-icon {
          font-size: 24px;
        }
        
        .file-info {
          margin-top: 10px;
          font-size: 14px;
          display: none;
          padding: 10px;
          background-color: #f0f7ff;
          border-radius: 6px;
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .primary-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background-color: #2563eb;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 12px 20px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          width: 100%;
          font-size: 15px;
        }
        
        .primary-btn:hover {
          background-color: #1d4ed8;
        }
        
        .btn-icon {
          font-size: 18px;
        }
        
        .select-property-message {
          text-align: center;
          color: #6b7280;
          padding: 30px;
          background-color: #f9fafb;
          border-radius: 8px;
          border: 1px dashed #d1d5db;
        }
        
        .documents-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .document-card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          transition: all 0.2s;
          border: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
        }
        
        .document-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
        }
        
        .document-header {
          padding: 15px;
          background-color: #f1f5f9;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .document-icon {
          font-size: 20px;
          min-width: 40px;
          height: 40px;
          background-color: #dbeafe;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2563eb;
        }
        
        .document-icon.sale_deed { background-color: #dbeafe; color: #2563eb; }
        .document-icon.property_tax { background-color: #dcfce7; color: #16a34a; }
        .document-icon.survey_map { background-color: #fef3c7; color: #d97706; }
        .document-icon.mutation_certificate { background-color: #f3e8ff; color: #9333ea; }
        .document-icon.e_stamp { background-color: #fae8ff; color: #d946ef; }
        .document-icon.registry { background-color: #fee2e2; color: #ef4444; }
        
        .document-title {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: #1f2937;
        }
        
        .document-content {
          padding: 15px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        
        .document-details {
          margin-bottom: 10px;
          flex-grow: 1;
        }
        
        .document-filename {
          color: #6b7280;
          font-size: 13px;
          margin-bottom: 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .document-date {
          color: #6b7280;
          font-size: 13px;
          margin-bottom: 10px;
        }
        
        .document-actions {
          display: flex;
          gap: 10px;
        }
        
        .action-btn {
          flex: 1;
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background-color: #f9fafb;
          color: #4b5563;
          font-size: 13px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
        }
        
        .action-btn:hover {
          background-color: #f3f4f6;
          border-color: #9ca3af;
        }
        
        .verification-tag {
          display: inline-block;
          font-size: 12px;
          padding: 2px 6px;
          background-color: #ecfdf5;
          color: #10b981;
          border-radius: 4px;
          margin-left: 10px;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: spin 1s ease-in-out infinite;
          margin: 20px auto;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .no-documents {
          text-align: center;
          color: #6b7280;
          padding: 20px;
          grid-column: 1 / -1;
        }
        
        /* Modal styles for document preview */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        
        .modal-content {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          max-width: 800px;
          width: 90%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .modal-header {
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .modal-header h4 {
          margin: 0;
          font-size: 18px;
        }
        
        .modal-close {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 24px;
          color: #6b7280;
        }
        
        .modal-body {
          padding: 20px;
          overflow-y: auto;
        }
        
        .modal-footer {
          padding: 15px 20px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          border-top: 1px solid #e5e7eb;
        }
        
        @media (max-width: 640px) {
          .documents-list {
            grid-template-columns: 1fr;
          }
          
          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .document-filters {
            width: 100%;
          }
          
          .document-filter {
            width: 100%;
          }
        }
      `;
      
      document.head.appendChild(styles);
    }
    
    // Initialize property select dropdown
    function initPropertySelect() {
      const propertySelect = document.getElementById('document-property-select');
      if (!propertySelect) return;
      
      // Load properties
      fetchProperties().then(properties => {
        // Clear existing options (except the first one)
        const firstOption = propertySelect.options[0];
        propertySelect.innerHTML = '';
        propertySelect.appendChild(firstOption);
        
        // Add property options
        properties.forEach(property => {
          const option = document.createElement('option');
          option.value = property.id;
          
          // Format property address to include location and survey number
          const addressParts = property.property_address.split(',');
          let displayAddress = property.property_address;
          
          if (addressParts.length > 1) {
            const locality = addressParts[addressParts.length - 2].trim();
            const city = addressParts[addressParts.length - 1].trim();
            displayAddress = `${addressParts[0].trim()}, ${locality}, ${city}`;
          }
          
          option.textContent = `${displayAddress} (${property.survey_number})`;
          propertySelect.appendChild(option);
        });
        
        // Add change handler
        propertySelect.addEventListener('change', handlePropertySelect);
      }).catch(error => {
        console.error('Failed to load properties:', error);
        showNotification('Failed to load properties. Please try again.', 'error');
      });
    }
    
    // Handle property selection
    function handlePropertySelect() {
      const propertyId = this.value;
      const uploadSection = document.querySelector('.upload-section');
      const propertyIdInput = document.getElementById('upload-property-id');
      const documentsList = document.getElementById('documents-list');
      
      // Show/hide upload section
      if (uploadSection) {
        uploadSection.style.display = propertyId ? 'block' : 'none';
      }
      
      // Update hidden property ID field
      if (propertyIdInput) {
        propertyIdInput.value = propertyId;
      }
      
      // Load documents for selected property
      if (propertyId) {
        documentsList.innerHTML = '<div class="loading-spinner"></div>';
        
        fetchDocuments(propertyId).then(documents => {
          renderDocumentsList(documents);
        }).catch(error => {
          console.error('Failed to load documents:', error);
          documentsList.innerHTML = `
            <div class="no-documents">
              <p>Failed to load documents: ${error.message}</p>
              <button class="action-btn" onclick="retryLoadDocuments('${propertyId}')">Retry</button>
            </div>
          `;
        });
      } else {
        documentsList.innerHTML = '<p class="select-property-message">Please select a property to view its documents</p>';
      }
    }
    
    // Initialize file upload functionality
    function initFileUpload() {
      const fileInput = document.getElementById('document-file');
      const fileInfo = document.getElementById('file-info');
      const uploadText = document.querySelector('.upload-text');
      
      if (!fileInput || !fileInfo) return;
      
      fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) {
          fileInfo.style.display = 'none';
          uploadText.textContent = 'Choose a file...';
          return;
        }
        
        // Format file size
        const fileSize = formatFileSize(file.size);
        
        // Update file info display
        fileInfo.style.display = 'block';
        fileInfo.innerHTML = `
          <strong>${file.name}</strong><br>
          ${fileSize} - ${file.type || 'Unknown type'}
        `;
        
        // Update upload button text
        uploadText.textContent = 'File selected';
      });
    }
    
    // Initialize document upload form
    function initDocumentUploadForm() {
      const uploadForm = document.getElementById('document-upload-form');
      if (!uploadForm) return;
      
      uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const propertyId = document.getElementById('upload-property-id').value;
        const documentType = document.getElementById('document-type').value;
        const fileInput = document.getElementById('document-file');
        const description = document.getElementById('document-description').value;
        
        // Validate form
        if (!propertyId) {
          showNotification('Please select a property first', 'warning');
          return;
        }
        
        if (!documentType) {
          showNotification('Please select a document type', 'warning');
          return;
        }
        
        if (!fileInput.files || fileInput.files.length === 0) {
          showNotification('Please select a file to upload', 'warning');
          return;
        }
        
        const file = fileInput.files[0];
        
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          showNotification('File size exceeds 10MB limit', 'error');
          return;
        }
        
        // Show loading state
        const submitBtn = uploadForm.querySelector('button[type="submit"]');
        const originalHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> Uploading...';
        submitBtn.disabled = true;
        
        try {
          // Upload document
          const result = await uploadDocument(propertyId, documentType, file, description);
          
          // Show success message
          showNotification('Document uploaded successfully!', 'success');
          
          // Reset form
          uploadForm.reset();
          document.getElementById('file-info').style.display = 'none';
          document.querySelector('.upload-text').textContent = 'Choose a file...';
          
          // Refresh documents list
          const documentsList = document.getElementById('documents-list');
          documentsList.innerHTML = '<div class="loading-spinner"></div>';
          
          const documents = await fetchDocuments(propertyId);
          renderDocumentsList(documents);
        } catch (error) {
          console.error('Failed to upload document:', error);
          showNotification(`Upload failed: ${error.message}`, 'error');
        } finally {
          // Reset button
          submitBtn.innerHTML = originalHtml;
          submitBtn.disabled = false;
        }
      });
    }
    
    // Initialize document filter
    function initDocumentFilter() {
      const filter = document.getElementById('document-filter');
      if (!filter) return;
      
      filter.addEventListener('change', function() {
        const filterValue = this.value;
        const propertyId = document.getElementById('document-property-select').value;
        
        if (!propertyId) return;
        
        // Show loading state
        const documentsList = document.getElementById('documents-list');
        documentsList.innerHTML = '<div class="loading-spinner"></div>';
        
        // Fetch documents and filter them
        fetchDocuments(propertyId).then(documents => {
          if (filterValue === 'all') {
            renderDocumentsList(documents);
          } else {
            // Group similar document types
            let filteredDocs;
            if (filterValue === 'other') {
              // All documents that are not in the main categories
              const mainTypes = ['sale_deed', 'property_tax', 'survey_map'];
              filteredDocs = documents.filter(doc => !mainTypes.includes(doc.document_type));
            } else {
              filteredDocs = documents.filter(doc => doc.document_type === filterValue);
            }
            
            renderDocumentsList(filteredDocs);
          }
        }).catch(error => {
          console.error('Failed to filter documents:', error);
          documentsList.innerHTML = `
            <div class="no-documents">
              <p>Failed to load documents: ${error.message}</p>
              <button class="action-btn" onclick="retryLoadDocuments('${propertyId}')">Retry</button>
            </div>
          `;
        });
      });
    }
    
    // Render documents list
    function renderDocumentsList(documents) {
      const documentsList = document.getElementById('documents-list');
      if (!documentsList) return;
      
      if (!documents || documents.length === 0) {
        documentsList.innerHTML = `
          <div class="no-documents">
            <p>No documents found for this property</p>
            <p>Upload a document to get started</p>
          </div>
        `;
        return;
      }
      
      // Clear list
      documentsList.innerHTML = '';
      
      // Add document cards
      documents.forEach(doc => {
        const uploadedDate = new Date(doc.uploaded_at);
        const formattedDate = formatDateIndian(uploadedDate);
        
        const docTypeDisplay = formatDocumentType(doc.document_type);
        const docIcon = getDocumentIcon(doc.document_type);
        
        const docCard = document.createElement('div');
        docCard.className = 'document-card';
        docCard.innerHTML = `
          <div class="document-header">
            <div class="document-icon ${doc.document_type}">${docIcon}</div>
            <h5 class="document-title">${docTypeDisplay}</h5>
            <span class="verification-tag">Verified</span>
          </div>
          <div class="document-content">
            <div class="document-details">
              <div class="document-filename">${doc.file_name}</div>
              <div class="document-date">Uploaded: ${formattedDate}</div>
            </div>
            <div class="document-actions">
              <button class="action-btn view-btn" data-id="${doc.id}">View</button>
              <button class="action-btn download-btn" data-id="${doc.id}">Download</button>
            </div>
          </div>
        `;
        
        documentsList.appendChild(docCard);
        
        // Add event listeners
        const viewBtn = docCard.querySelector('.view-btn');
        if (viewBtn) {
          viewBtn.addEventListener('click', () => viewDocument(doc));
        }
        
        const downloadBtn = docCard.querySelector('.download-btn');
        if (downloadBtn) {
          downloadBtn.addEventListener('click', () => downloadDocument(doc));
        }
      });
    }
    
    // View document
    function viewDocument(document) {
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h4>${formatDocumentType(document.document_type)} - ${document.file_name}</h4>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="document-preview">
              <p>Document preview not available in this demo.</p>
              <p>In a production environment, this would show a preview of ${document.file_name}</p>
              
              <h5>Document Details</h5>
              <div class="document-metadata">
                <p><strong>File Name:</strong> ${document.file_name}</p>
                <p><strong>Document Type:</strong> ${formatDocumentType(document.document_type)}</p>
                <p><strong>Uploaded On:</strong> ${formatDateIndian(document.uploaded_at)}</p>
                <p><strong>Verification Hash:</strong> <code>${document.file_hash.substring(0, 32)}...</code></p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="action-btn download-btn" data-id="${document.id}">Download</button>
            <button class="action-btn verify-btn" data-hash="${document.file_hash}">Verify</button>
            <button class="action-btn modal-close-btn">Close</button>
          </div>
        </div>
      `;
      
      // Add to body
      document.body.appendChild(modal);
      
      // Add event listeners
      const closeButtons = modal.querySelectorAll('.modal-close, .modal-close-btn');
      closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          document.body.removeChild(modal);
        });
      });
      
      // Download button
      const downloadBtn = modal.querySelector('.download-btn');
      if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
          downloadDocument(document);
        });
      }
      
      // Verify button
      const verifyBtn = modal.querySelector('.verify-btn');
      if (verifyBtn) {
        verifyBtn.addEventListener('click', () => {
          document.body.removeChild(modal);
          
          // Switch to verification tab and pre-fill hash
          const verificationTab = document.querySelector('.nav-item[data-page="verification"]');
          if (verificationTab) {
            verificationTab.click();
            
            // Add a small delay to ensure verification page is loaded
            setTimeout(() => {
              const docHashInput = document.getElementById('document-hash-input');
              if (docHashInput) {
                docHashInput.value = document.file_hash;
                
                // Find document tab and click it
                const docTab = document.querySelector('.verification-tab[data-tab="document"]');
                if (docTab) {
                  docTab.click();
                }
              }
            }, 300);
          }
        });
      }
    }
    
    // Download document
    function downloadDocument(document) {
      // In a real implementation, this would download the actual file
      // For this demo, we'll just show a notification
      showNotification(`Downloading ${document.file_name}...`, 'info');
      
      // Simulate a download delay
      setTimeout(() => {
        showNotification(`${document.file_name} downloaded successfully!`, 'success');
      }, 1500);
    }
    
})