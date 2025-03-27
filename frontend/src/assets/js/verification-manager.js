// Enhanced Verification Functionality with Indian Land Measures
document.addEventListener('DOMContentLoaded', function() {
    // Initialize verification features when the verification page is activated
    const verificationNavItem = document.querySelector('.nav-item[data-page="verification"]');
    if (verificationNavItem) {
      verificationNavItem.addEventListener('click', initVerificationPage);
    }
    
    // Check if we're already on the verification page
    if (document.querySelector('[data-page="verification"].active') || 
        window.location.href.includes('verification')) {
      initVerificationPage();
    }
    
    // Initialize the verification page
    function initVerificationPage() {
      console.log('Initializing Verification page...');
      const verificationContainer = document.getElementById('verification-container');
      
      if (!verificationContainer) {
        console.error('Verification container not found');
        return;
      }
      
      // Create verification UI
      verificationContainer.innerHTML = `
        <div class="verification-ui">
          <div class="verification-intro">
            <h3>Land Record Verification Portal</h3>
            <p>Verify the authenticity of land records, documents, or transactions using official government records.</p>
          </div>
          
          <div class="verification-methods">
            <div class="verification-tabs">
              <button class="verification-tab active" data-tab="survey">
                <span class="tab-icon">🗺️</span>
                <span class="tab-text">Survey Number</span>
              </button>
              <button class="verification-tab" data-tab="document">
                <span class="tab-icon">📄</span>
                <span class="tab-text">Document Hash</span>
              </button>
              <button class="verification-tab" data-tab="transaction">
                <span class="tab-icon">🔄</span>
                <span class="tab-text">Transaction ID</span>
              </button>
            </div>
            
            <div class="verification-tab-content active" id="survey-verification">
              <form id="survey-verification-form">
                <div class="form-group">
                  <label for="survey-number-input">Survey/Khasra Number</label>
                  <input type="text" id="survey-number-input" placeholder="Enter survey/khasra number (e.g., 123/456)" required>
                </div>
                <button type="submit" class="primary-btn">Verify Property</button>
              </form>
            </div>
            
            <div class="verification-tab-content" id="document-verification">
              <form id="document-verification-form">
                <div class="form-group">
                  <label for="document-hash-input">Document Hash Code</label>
                  <input type="text" id="document-hash-input" placeholder="Enter document hash from e-stamp or registry" required>
                </div>
                <button type="submit" class="primary-btn">Verify Document</button>
              </form>
            </div>
            
            <div class="verification-tab-content" id="transaction-verification">
              <form id="transaction-verification-form">
                <div class="form-group">
                  <label for="transaction-id-input">Transaction/Mutation ID</label>
                  <input type="text" id="transaction-id-input" placeholder="Enter transaction ID (e.g., MUT-12345678)" required>
                </div>
                <button type="submit" class="primary-btn">Verify Transaction</button>
              </form>
            </div>
          </div>
          
          <div class="verification-results" id="verification-results">
            <!-- Results will be displayed here -->
          </div>
        </div>
      `;
      
      // Add CSS styles for verification UI
      addVerificationStyles();
      
      // Initialize tab switching
      initVerificationTabs();
      
      // Initialize form submission handlers
      initVerificationForms();
    }
    
    // Add CSS styles for verification page
    function addVerificationStyles() {
      // Check if styles already exist
      if (document.getElementById('verification-styles')) return;
      
      const styles = document.createElement('style');
      styles.id = 'verification-styles';
      styles.textContent = `
        .verification-ui {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .verification-intro {
          text-align: center;
          margin-bottom: 30px;
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #2563eb;
        }
        
        .verification-intro h3 {
          color: #1e40af;
          margin-bottom: 10px;
        }
        
        .verification-tabs {
          display: flex;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 20px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        .verification-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px 20px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          color: #64748b;
          font-weight: 500;
          transition: all 0.2s ease;
          min-width: 100px;
          white-space: nowrap;
        }
        
        .verification-tab.active {
          color: #2563eb;
          border-bottom: 2px solid #2563eb;
        }
        
        .verification-tab .tab-icon {
          font-size: 24px;
          margin-bottom: 5px;
        }
        
        .verification-tab-content {
          display: none;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }
        
        .verification-tab-content.active {
          display: block;
        }
        
        .verification-tab-content form {
          max-width: 500px;
          margin: 0 auto;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #1e293b;
        }
        
        .form-group input {
          width: 100%;
          padding: 10px 15px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 16px;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        
        .primary-btn {
          background-color: #2563eb;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 10px 20px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          width: 100%;
          font-size: 16px;
        }
        
        .primary-btn:hover {
          background-color: #1d4ed8;
        }
        
        .verification-results {
          margin-top: 30px;
        }
        
        .verification-success {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          padding: 20px;
          animation: fadeIn 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .verification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .verification-badge {
          background-color: #ecfdf5;
          color: #10b981;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .property-details, .document-details, .transaction-details {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        
        @media (min-width: 640px) {
          .property-details, .document-details, .transaction-details {
            grid-template-columns: 1fr 1fr;
          }
        }
        
        .info-item {
          margin-bottom: 15px;
        }
        
        .info-label {
          display: block;
          color: #64748b;
          font-size: 14px;
          margin-bottom: 5px;
        }
        
        .info-value {
          font-weight: 500;
          word-break: break-word;
        }
        
        .hash-value {
          font-family: monospace;
          word-break: break-all;
          background-color: #f1f5f9;
          padding: 8px;
          border-radius: 4px;
          font-size: 12px;
          color: #334155;
        }
        
        .verification-error {
          background-color: #fee2e2;
          color: #ef4444;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          animation: fadeIn 0.5s ease-in-out;
        }
        
        .verification-error h4 {
          margin-bottom: 10px;
        }
        
        .status-success, .status-approved, .status-active {
          color: #10b981;
          font-weight: 500;
        }
        
        .status-pending {
          color: #f59e0b;
          font-weight: 500;
        }
        
        .status-failed, .status-rejected, .status-disputed {
          color: #ef4444;
          font-weight: 500;
        }
        
        .blockchain-verification, .hash-verification {
          background-color: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          border-left: 3px solid #2563eb;
        }
        
        .blockchain-verification h5, .hash-verification h5 {
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 16px;
          color: #1e40af;
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
        
        @media (max-width: 600px) {
          .verification-tab .tab-text {
            font-size: 13px;
          }
          
          .verification-tab {
            padding: 10px;
            min-width: 80px;
          }
          
          .verification-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .verification-badge {
            margin-top: 10px;
          }
        }
      `;
      
      document.head.appendChild(styles);
    }
    
    // Initialize verification tabs
    function initVerificationTabs() {
      const tabs = document.querySelectorAll('.verification-tab');
      
      tabs.forEach(tab => {
        tab.addEventListener('click', function() {
          // Remove active class from all tabs
          tabs.forEach(t => t.classList.remove('active'));
          
          // Add active class to clicked tab
          this.classList.add('active');
          
          // Get tab ID
          const tabId = this.getAttribute('data-tab');
          
          // Hide all tab content
          const tabContents = document.querySelectorAll('.verification-tab-content');
          tabContents.forEach(content => content.classList.remove('active'));
          
          // Show the selected tab content
          const activeContent = document.getElementById(`${tabId}-verification`);
          if (activeContent) {
            activeContent.classList.add('active');
          }
          
          // Clear results
          const resultsContainer = document.getElementById('verification-results');
          if (resultsContainer) {
            resultsContainer.innerHTML = '';
          }
        });
      });
    }
    
    // Initialize verification form handlers
    function initVerificationForms() {
      // Survey verification form
      const surveyForm = document.getElementById('survey-verification-form');
      if (surveyForm) {
        surveyForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const surveyNumber = document.getElementById('survey-number-input').value;
          if (!surveyNumber) {
            showNotification('Please enter a survey number', 'warning');
            return;
          }
          
          // Show loading state
          const resultsContainer = document.getElementById('verification-results');
          resultsContainer.innerHTML = '<div class="loading-spinner"></div><p class="text-center">Verifying property details...</p>';
          
          try {
            const result = await verifyProperty(surveyNumber);
            displayPropertyVerificationResult(result);
          } catch (error) {
            console.error('Property verification failed:', error);
            resultsContainer.innerHTML = `
              <div class="verification-error">
                <h4>Verification Failed</h4>
                <p>${error.message || 'Could not verify the property. Please try again with correct survey number.'}</p>
              </div>
            `;
          }
        });
      }
      
      // Document verification form
      const documentForm = document.getElementById('document-verification-form');
      if (documentForm) {
        documentForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const documentHash = document.getElementById('document-hash-input').value;
          if (!documentHash) {
            showNotification('Please enter a document hash', 'warning');
            return;
          }
          
          // Show loading state
          const resultsContainer = document.getElementById('verification-results');
          resultsContainer.innerHTML = '<div class="loading-spinner"></div><p class="text-center">Verifying document authenticity...</p>';
          
          try {
            const result = await verifyDocument(documentHash);
            displayDocumentVerificationResult(result);
          } catch (error) {
            console.error('Document verification failed:', error);
            resultsContainer.innerHTML = `
              <div class="verification-error">
                <h4>Verification Failed</h4>
                <p>${error.message || 'Could not verify the document. Please check the hash and try again.'}</p>
              </div>
            `;
          }
        });
      }
      
      // Transaction verification form
      const transactionForm = document.getElementById('transaction-verification-form');
      if (transactionForm) {
        transactionForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const transactionId = document.getElementById('transaction-id-input').value;
          if (!transactionId) {
            showNotification('Please enter a transaction ID', 'warning');
            return;
          }
          
          // Show loading state
          const resultsContainer = document.getElementById('verification-results');
          resultsContainer.innerHTML = '<div class="loading-spinner"></div><p class="text-center">Verifying transaction records...</p>';
          
          try {
            const result = await verifyTransaction(transactionId);
            displayTransactionVerificationResult(result);
          } catch (error) {
            console.error('Transaction verification failed:', error);
            resultsContainer.innerHTML = `
              <div class="verification-error">
                <h4>Verification Failed</h4>
                <p>${error.message || 'Could not verify the transaction. Please check the ID and try again.'}</p>
              </div>
            `;
          }
        });
      }
    }
    
    // Display property verification result
    function displayPropertyVerificationResult(property) {
      const resultsContainer = document.getElementById('verification-results');
      
      if (!property) {
        resultsContainer.innerHTML = `
          <div class="verification-error">
            <h4>Verification Failed</h4>
            <p>No property found with the provided survey number.</p>
          </div>
        `;
        return;
      }
      
      // Format area in Indian measurements
      const areaValue = property.area_sqft || property.property_area || '0';
      // Convert area to different Indian units
      const areaInSqMtr = (parseFloat(areaValue) * 0.092903).toFixed(2);
      const areaInBigha = (parseFloat(areaValue) / 27000).toFixed(3);
      
      resultsContainer.innerHTML = `
        <div class="verification-success">
          <div class="verification-header">
            <h4>Property Record Verified ✓</h4>
            <span class="verification-badge">Verified</span>
          </div>
          
          <div class="property-details">
            <div class="property-info">
              <div class="info-item">
                <span class="info-label">Khasra/Survey Number:</span>
                <span class="info-value">${property.survey_number}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Property Address:</span>
                <span class="info-value">${property.property_address}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Area:</span>
                <span class="info-value">${areaValue} sq.ft (${areaInSqMtr} sq.m / ${areaInBigha} bigha)</span>
              </div>
              <div class="info-item">
                <span class="info-label">Owner:</span>
                <span class="info-value">${property.owner_name || property.owner_id || 'Information Not Available'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Registration Date:</span>
                <span class="info-value">${formatDateIndian(property.created_at || property.registration_date)}</span>
              </div>
            </div>
            
            <div class="blockchain-verification">
              <h5>Digital Verification</h5>
              <div class="info-item">
                <span class="info-label">Document Hash:</span>
                <span class="info-value hash-value">${property.document_hash || 'Not available'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Last Updated:</span>
                <span class="info-value">${formatDateIndian(property.updated_at || property.last_updated)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status:</span>
                <span class="info-value status-${property.status || 'active'}">${formatStatus(property.status || 'active')}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    
    // Display document verification result
    function displayDocumentVerificationResult(document) {
      const resultsContainer = document.getElementById('verification-results');
      
      if (!document) {
        resultsContainer.innerHTML = `
          <div class="verification-error">
            <h4>Verification Failed</h4>
            <p>No document found with the provided hash.</p>
          </div>
        `;
        return;
      }
      
      const uploadDate = formatDateIndian(document.uploaded_at);
      
      resultsContainer.innerHTML = `
        <div class="verification-success">
          <div class="verification-header">
            <h4>Document Verified ✓</h4>
            <span class="verification-badge">Verified</span>
          </div>
          
          <div class="document-details">
            <div class="document-info">
              <div class="info-item">
                <span class="info-label">Document Type:</span>
                <span class="info-value">${formatDocumentType(document.document_type)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">File Name:</span>
                <span class="info-value">${document.file_name}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Uploaded On:</span>
                <span class="info-value">${uploadDate}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Property ID:</span>
                <span class="info-value">${document.land_id}</span>
              </div>
            </div>
            
            <div class="hash-verification">
              <h5>Digital Signature Verification</h5>
              <div class="info-item">
                <span class="info-label">Document Hash:</span>
                <span class="info-value hash-value">${document.file_hash}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Verification Status:</span>
                <span class="info-value status-success">Verified and Unaltered</span>
              </div>
              <div class="info-item">
                <span class="info-label">Issued By:</span>
                <span class="info-value">Digital Land Records Authority</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    
    // Display transaction verification result
    function displayTransactionVerificationResult(transaction) {
      const resultsContainer = document.getElementById('verification-results');
      
      if (!transaction) {
        resultsContainer.innerHTML = `
          <div class="verification-error">
            <h4>Verification Failed</h4>
            <p>No transaction found with the provided ID.</p>
          </div>
        `;
        return;
      }
      
      const transactionDate = formatDateIndian(transaction.mutation_date || transaction.transaction_date);
      const transactionStatus = transaction.status || 'completed';
      
      resultsContainer.innerHTML = `
        <div class="verification-success">
          <div class="verification-header">
            <h4>Transaction Verified ✓</h4>
            <span class="verification-badge">Verified</span>
          </div>
          
          <div class="transaction-details">
            <div class="transaction-info">
              <div class="info-item">
                <span class="info-label">Transaction ID:</span>
                <span class="info-value">${transaction.transaction_id || transaction.id}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Type:</span>
                <span class="info-value">${transaction.transaction_type || 'Property Transfer'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Date:</span>
                <span class="info-value">${transactionDate}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status:</span>
                <span class="info-value status-${transactionStatus}">${formatStatus(transactionStatus)}</span>
              </div>
            </div>
            
            <div class="blockchain-verification">
              <h5>Transfer Details</h5>
              <div class="info-item">
                <span class="info-label">From Owner:</span>
                <span class="info-value">${transaction.previous_owner_id || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">To Owner:</span>
                <span class="info-value">${transaction.new_owner_id || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Property ID:</span>
                <span class="info-value">${transaction.land_id || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Verification Hash:</span>
                <span class="info-value hash-value">${transaction.verification_hash || transaction.block_hash || 'Not available'}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    
    // Format status text
    function formatStatus(status) {
      switch(status.toLowerCase()) {
        case 'active':
          return 'Active';
        case 'pending':
          return 'Pending';
        case 'approved':
          return 'Approved';
        case 'rejected':
          return 'Rejected';
        case 'disputed':
          return 'Disputed';
        case 'completed':
          return 'Completed';
        default:
          return status.charAt(0).toUpperCase() + status.slice(1);
      }
    }
    
    // Helper function to format dates in Indian format
    function formatDateIndian(dateString) {
      if (!dateString) return 'Not available';
      
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        
        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.getFullYear();
        
        return `${day} ${month}, ${year}`;
      } catch (e) {
        return dateString;
      }
    }
    
    // Helper function to format document type
    function formatDocumentType(documentType) {
      if (!documentType) return 'Unknown';
      
      const documentTypes = {
        'sale_deed': 'Sale Deed',
        'property_tax': 'Property Tax Receipt',
        'survey_map': 'Survey Map',
        'mutation_certificate': 'Mutation Certificate',
        'e_stamp': 'e-Stamp Certificate',
        'registry': 'Registry Document',
        'khatauni': 'Khatauni',
        'jamabandi': 'Jamabandi',
        'noc': 'No Objection Certificate',
        'encumbrance_certificate': 'Encumbrance Certificate'
      };
      
      return documentTypes[documentType.toLowerCase()] || 
        documentType
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    }
    
    // API Functions
    async function verifyProperty(surveyNumber) {
      try {
        // Define the API URL - update this with your actual backend URL in production
        const apiBaseUrl = window.apiBaseUrl || 'http://localhost:8000';
        
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
          showNotification('Authentication required. Please log in.', 'error');
          return null;
        }
        
        const response = await fetch(`${apiBaseUrl}/api/verification/property?survey_number=${encodeURIComponent(surveyNumber)}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Property not found with the provided survey number');
          }
          throw new Error('Failed to verify property');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error in verifyProperty:', error);
        
        // For testing when API is not available, return mock data with Indian context
        if (!window.apiAvailable) {
          // Generate random coordinates within India
          const latBase = 20 + (Math.random() * 10); // Between 20-30°N
          const longBase = 75 + (Math.random() * 10); // Between 75-85°E
          
          // Generate random property data
          return {
            id: 'prop-' + Math.random().toString(36).substring(2, 10),
            survey_number: surveyNumber,
            property_address: `${Math.floor(Math.random() * 100) + 1}, ${['Laxmi Nagar', 'Gandhi Road', 'MG Colony', 'Nehru Market', 'Patel Street'][Math.floor(Math.random() * 5)]}, ${['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad'][Math.floor(Math.random() * 5)]}`,
            area_sqft: (Math.floor(Math.random() * 5000) + 1000).toString(),
            geo_latitude: latBase,
            geo_longitude: longBase,
            owner_id: 'user-' + Math.random().toString(36).substring(2, 10),
            owner_name: ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sunita Singh', 'Raj Malhotra'][Math.floor(Math.random() * 5)],
            document_hash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
            created_at: new Date(Date.now() - Math.floor(Math.random() * 3 * 365 * 24 * 60 * 60 * 1000)).toISOString(), // 0-3 years ago
            updated_at: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(), // 0-30 days ago
            status: ['active', 'pending', 'disputed'][Math.floor(Math.random() * 3)]
          };
        }
        
        throw error;
      }
    }
    
    async function verifyDocument(documentHash) {
      try {
        // Define the API URL - update this with your actual backend URL in production
        const apiBaseUrl = window.apiBaseUrl || 'http://localhost:8000';
        
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
          showNotification('Authentication required. Please log in.', 'error');
          return null;
        }
        
        const response = await fetch(`${apiBaseUrl}/api/verification/document?hash=${encodeURIComponent(documentHash)}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Document not found with the provided hash');
          }
          throw new Error('Failed to verify document');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error in verifyDocument:', error);
        
        // For testing when API is not available, return mock data with Indian context
        if (!window.apiAvailable) {
          const indianDocTypes = [
            'sale_deed', 'property_tax', 'survey_map', 'mutation_certificate', 
            'e_stamp', 'registry', 'khatauni', 'jamabandi', 'noc', 'encumbrance_certificate'
          ];
          
          const docType = indianDocTypes[Math.floor(Math.random() * indianDocTypes.length)];
          const indianFileNames = [
            'Registry_Docs.pdf', 'Sale_Deed_2023.pdf', 'Revenue_Records.pdf', 
            'Property_Papers.pdf', 'Mutation_Certificate.pdf'
          ];
          
          return {
            id: 'doc-' + Math.random().toString(36).substring(2, 10),
            document_type: docType,
            file_name: indianFileNames[Math.floor(Math.random() * indianFileNames.length)],
            file_hash: documentHash,
            land_id: 'prop-' + Math.random().toString(36).substring(2, 10),
            uploaded_at: new Date(Date.now() - Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000)).toISOString() // 0-180 days ago
          };
        }
        
        throw error;
      }
    }
    
    async function verifyTransaction(transactionId) {
      try {
        // Define the API URL - update this with your actual backend URL in production
        const apiBaseUrl = window.apiBaseUrl || 'http://localhost:8000';
        
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
          showNotification('Authentication required. Please log in.', 'error');
          return null;
        }
        
        const response = await fetch(`${apiBaseUrl}/api/verification/transaction?id=${encodeURIComponent(transactionId)}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Transaction not found with the provided ID');
          }
          throw new Error('Failed to verify transaction');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error in verifyTransaction:', error);
        
        // For testing when API is not available, return mock data with Indian context
        if (!window.apiAvailable) {
          const statuses = ['pending', 'approved', 'rejected'];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          
          // Create a random date within the last year
          const date = new Date();
          date.setMonth(date.getMonth() - Math.floor(Math.random() * 12));
          
          const indianNames = [
            'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sunita Singh', 
            'Raj Malhotra', 'Anita Desai', 'Vijay Mehta', 'Neha Gupta'
          ];
          
          return {
            id: transactionId,
            transaction_id: transactionId,
            land_id: 'prop-' + Math.random().toString(36).substring(2, 10),
            previous_owner_id: 'user-' + Math.random().toString(36).substring(2, 10),
            previous_owner_name: indianNames[Math.floor(Math.random() * indianNames.length)],
            new_owner_id: 'user-' + Math.random().toString(36).substring(2, 10),
            new_owner_name: indianNames[Math.floor(Math.random() * indianNames.length)],
            mutation_date: date.toISOString(),
            mutation_reason: ['Sale', 'Inheritance', 'Gift Deed', 'Court Order', 'Family Partition'][Math.floor(Math.random() * 5)],
            status: status,
            verification_hash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
          };
        }
        
        throw error;
      }
    }
    
    // Notification function
    function showNotification(message, type = 'info') {
      // Check if we have a global notification function
      if (window.showNotification) {
        window.showNotification(message, type);
        return;
      }
      
      // Check if notification styles exist
      if (!document.getElementById('notification-styles')) {
        const notificationStyles = document.createElement('style');
        notificationStyles.id = 'notification-styles';
        notificationStyles.textContent = `
          .notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          
          .notification {
            display: flex;
            align-items: center;
            background-color: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            padding: 12px 15px;
            min-width: 300px;
            max-width: 450px;
            transform: translateX(120%);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
          }
          
          .notification.show {
            transform: translateX(0);
            opacity: 1;
          }
          
          .notification-icon {
            margin-right: 10px;
            font-size: 20px;
          }
          
          .notification-message {
            flex: 1;
            font-size: 14px;
          }
          
          .notification-close {
            background: none;
            border: none;
            color: #64748b;
            font-size: 18px;
            cursor: pointer;
            margin-left: 5px;
          }
          
          .notification-info {
            border-left: 4px solid #3b82f6;
          }
          
          .notification-success {
            border-left: 4px solid #10b981;
          }
          
          .notification-warning {
            border-left: 4px solid #f59e0b;
          }
          
          .notification-error {
            border-left: 4px solid #ef4444;
          }
          
          @media (max-width: 480px) {
            .notification-container {
              left: 20px;
              right: 20px;
            }
            
            .notification {
              min-width: auto;
              width: 100%;
            }
          }
        `;
        document.head.appendChild(notificationStyles);
      }
      
      // Fallback notification implementation
      const container = document.getElementById('notification-container') || createNotificationContainer();
      
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      
      // Add icon based on type
      let icon = '📌';
      if (type === 'success') icon = '✅';
      if (type === 'error') icon = '❌';
      if (type === 'warning') icon = '⚠️';
      
      notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-message">${message}</div>
        <button class="notification-close">×</button>
      `;
      
      container.appendChild(notification);
      
      // Add close handler
      const closeBtn = notification.querySelector('.notification-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          container.removeChild(notification);
        });
      }
      
      // Auto close after 5 seconds
      setTimeout(() => {
        if (notification.parentElement === container) {
          container.removeChild(notification);
        }
      }, 5000);
      
      // Animation for showing notification
      setTimeout(() => {
        notification.classList.add('show');
      }, 10);
    }
    
    function createNotificationContainer() {
      const container = document.createElement('div');
      container.id = 'notification-container';
      container.className = 'notification-container';
      document.body.appendChild(container);
      return container;
    }
    
    // Add option to check if API is available
    window.apiAvailable = true; // Set to true in production
    
    // Set a global API base URL if needed
    window.apiBaseUrl = window.location.origin; // Change if API is hosted elsewhere
    
    // Make functions available globally for testing
    window.verificationManager = {
      initVerificationPage,
      verifyProperty,
      verifyDocument,
      verifyTransaction
    };
  });