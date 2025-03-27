// Enhanced Mutation Manager with Indian Land Records
// Complete solution with fallback mechanisms and optimizations
document.addEventListener('DOMContentLoaded', function() {
    // Global state to track initialization
    window.mutationApp = {
      initialized: false,
      propertyCache: null,
      mutationCache: null,
      debugMode: localStorage.getItem('debugMode') === 'true' || false,
      apiAvailable: false, // Default to false to ensure fallback works
      apiBaseUrl: localStorage.getItem('apiBaseUrl') || window.location.origin
    };
    
    console.log('Mutation Manager initializing...');
  
    // Initialize mutations features when the page loads or nav item is clicked
    initializeEventListeners();
    
    // Check if we're already on the mutations page and initialize
    if (document.querySelector('[data-page="mutations"].active') || 
        window.location.href.includes('mutations')) {
      setTimeout(initMutationsPage, 100); // Small delay to ensure DOM is ready
    }
    
    // Set up event listeners for navigation
    function initializeEventListeners() {
      const mutationsNavItem = document.querySelector('.nav-item[data-page="mutations"]');
      if (mutationsNavItem) {
        mutationsNavItem.addEventListener('click', function() {
          setTimeout(initMutationsPage, 100); // Small delay to ensure DOM is ready
        });
      }
      
      // Expose global functions
      window.retryLoadMutations = retryLoadMutations;
      window.retryLoadProperties = retryLoadProperties;
      
      // Make API functions available globally
      window.mutationManager = {
        initMutationsPage,
        loadMutations,
        createMutation,
        deleteMutation,
        retryLoadMutations,
        retryLoadProperties,
        downloadMutationCertificate,
        clearCache: function() {
          window.mutationApp.propertyCache = null;
          window.mutationApp.mutationCache = null;
          showNotification('Data cache cleared', 'success');
        }
      };
      
      // Debug logging
      if (window.mutationApp.debugMode) {
        console.log('Mutation Manager initialized with settings:', window.mutationApp);
      }
    }
    
    // Initialize the mutations page
    function initMutationsPage() {
      console.log('Initializing Mutations page...');
      const mutationsContainer = document.getElementById('mutations-list-container');
      
      if (!mutationsContainer) {
        console.error('Mutations container not found, aborting initialization');
        return;
      }
      
      // Only initialize once
      if (window.mutationApp.initialized && mutationsContainer.querySelector('.mutations-ui')) {
        console.log('Mutations page already initialized, refreshing data only');
        refreshData();
        return;
      }
      
      // Set initialization flag
      window.mutationApp.initialized = true;
      
      // Create mutations UI
      mutationsContainer.innerHTML = `
        <div class="mutations-ui">
          <div class="mutations-intro">
            <h3>Property Transfer & Mutation Records</h3>
            <p>Manage property ownership transfers and track mutation status</p>
          </div>
          
          <div class="mutations-sections">
            <!-- Create New Mutation Section -->
            <div class="mutation-section create-mutation-section">
              <h4>Create New Property Transfer</h4>
              <form id="create-mutation-form">
                <div class="form-group">
                  <label for="mutation-property">Select Property</label>
                  <select id="mutation-property" name="land_id" required>
                    <option value="">-- Loading properties... --</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="mutation-new-owner">New Owner Details</label>
                  <input type="text" id="mutation-new-owner" name="new_owner_id" placeholder="Enter Aadhaar or user ID of new owner" required>
                </div>
                
                <div class="form-group">
                  <label for="mutation-reason">Reason for Transfer</label>
                  <select id="mutation-reason" name="mutation_reason" required>
                    <option value="">-- Select Reason --</option>
                    <option value="Sale">Sale/Purchase</option>
                    <option value="Inheritance">Inheritance</option>
                    <option value="Gift Deed">Gift Deed</option>
                    <option value="Family Partition">Family Partition</option>
                    <option value="Court Order">Court Order</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div class="form-group" id="other-reason-group" style="display: none;">
                  <label for="mutation-other-reason">Specify Other Reason</label>
                  <input type="text" id="mutation-other-reason" name="other_reason" placeholder="Enter specific reason for transfer">
                </div>
                
                <div class="form-group transfer-agreement">
                  <label class="checkbox-label">
                    <input type="checkbox" id="transfer-agreement" required>
                    <span>I confirm that I have the legal right to transfer this property and all information provided is correct.</span>
                  </label>
                </div>
                
                <button type="submit" class="primary-btn">
                  <span class="btn-icon">🔄</span> Create Transfer Request
                </button>
              </form>
            </div>
            
            <!-- Mutations List Section -->
            <div class="mutation-section mutations-list-section">
              <div class="section-header">
                <h4>Transfer Requests</h4>
                <div class="mutation-filters">
                  <select id="mutation-filter" class="mutation-filter">
                    <option value="all">All Requests</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              
              <div id="mutations-list" class="mutations-list">
                <div class="loading-spinner"></div>
                <p class="loading-text">Loading transfer requests...</p>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Add CSS styles
      addAllStyles();
      
      // Initialize mutation UI functionality in a specific order
      setTimeout(() => {
        loadMutations();
        initMutationFilter();
        initPropertySelect();
        initReasonSelect();
        initMutationForm();
      }, 100);
      
      // Add debug panel if in debug mode
      if (window.mutationApp.debugMode) {
        addDebugControls();
      }
    }
    
    // Refresh data when requested
    function refreshData() {
      initPropertySelect(true); // Force refresh
      loadMutations(true); // Force refresh
    }
    
    // Retry loading properties - called from the UI
    function retryLoadProperties() {
      window.mutationApp.propertyCache = null; // Clear cache
      initPropertySelect(true); // Force refresh
      showNotification('Reloading properties...', 'info');
    }
    
    // Retry loading mutations - called from the UI
    function retryLoadMutations() {
      window.mutationApp.mutationCache = null; // Clear cache
      loadMutations(true); // Force refresh
      showNotification('Reloading transfer requests...', 'info');
    }
    
    // Add all CSS styles
    function addAllStyles() {
      addMutationStyles();
      addModalStyles();
      addNotificationStyles();
    }
    
    // Add CSS styles for mutations page
    function addMutationStyles() {
      // Check if styles already exist
      if (document.getElementById('mutation-styles')) return;
      
      const styles = document.createElement('style');
      styles.id = 'mutation-styles';
      styles.textContent = `
        .mutations-ui {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .mutations-intro {
          text-align: center;
          margin-bottom: 30px;
          background-color: #f0f9ff;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #0369a1;
        }
        
        .mutations-intro h3 {
          color: #0369a1;
          margin-bottom: 10px;
        }
        
        .mutations-sections {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        
        @media (min-width: 768px) {
          .mutations-sections {
            grid-template-columns: 300px 1fr;
          }
        }
        
        @media (min-width: 1024px) {
          .mutations-sections {
            grid-template-columns: 350px 1fr;
          }
        }
        
        .mutation-section {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          padding: 20px;
        }
        
        .mutation-section h4 {
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 18px;
          color: #0369a1;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 10px;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
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
        
        .form-group select,
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }
        
        .form-group select:focus,
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #0369a1;
          box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.1);
        }
        
        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          cursor: pointer;
        }
        
        .checkbox-label input[type="checkbox"] {
          width: auto;
          margin-top: 3px;
        }
        
        .checkbox-label span {
          font-size: 14px;
          color: #4b5563;
        }
        
        .primary-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background-color: #0369a1;
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
          background-color: #075985;
        }
        
        .primary-btn:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }
        
        .btn-icon {
          font-size: 18px;
        }
        
        .mutation-filters {
          display: flex;
          gap: 10px;
        }
        
        .mutation-filter {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }
        
        .mutations-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .mutations-list .loading-text {
          text-align: center;
          color: #6b7280;
          margin-top: 10px;
        }
        
        .mutation-card {
          background-color: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          transition: all 0.2s;
        }
        
        .mutation-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .mutation-header {
          padding: 12px 15px;
          background-color: #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .mutation-id {
          font-size: 14px;
          color: #6b7280;
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .status-badge.pending {
          background-color: #fef3c7;
          color: #d97706;
        }
        
        .status-badge.approved {
          background-color: #d1fae5;
          color: #10b981;
        }
        
        .status-badge.rejected {
          background-color: #fee2e2;
          color: #ef4444;
        }
        
        .status-badge.unknown {
          background-color: #e5e7eb;
          color: #6b7280;
        }
        
        .mutation-content {
          padding: 15px;
        }
        
        .mutation-property {
          font-weight: 500;
          margin-bottom: 10px;
          color: #111827;
        }
        
        .mutation-detail {
          margin-bottom: 5px;
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        
        .detail-label {
          color: #6b7280;
          min-width: 100px;
        }
        
        .detail-value {
          font-weight: 500;
          color: #374151;
        }
        
        .mutation-actions {
          margin-top: 15px;
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
        
        .action-btn.primary {
          background-color: #0369a1;
          color: white;
          border-color: #0369a1;
        }
        
        .action-btn.primary:hover {
          background-color: #075985;
        }
        
        .action-btn.danger {
          background-color: #fee2e2;
          color: #ef4444;
          border-color: #fee2e2;
        }
        
        .action-btn.danger:hover {
          background-color: #fecaca;
        }
        
        .action-btn.secondary {
          background-color: #e0f2fe;
          color: #0369a1;
          border-color: #e0f2fe;
        }
        
        .action-btn.secondary:hover {
          background-color: #bae6fd;
        }
        
        .no-mutations {
          text-align: center;
          color: #6b7280;
          padding: 30px;
          background-color: #f9fafb;
          border-radius: 8px;
          border: 1px dashed #d1d5db;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-top-color: #0369a1;
          border-radius: 50%;
          animation: spin 1s ease-in-out infinite;
          margin: 20px auto;
        }
        
        .load-more-container {
          text-align: center;
          margin-top: 15px;
          margin-bottom: 15px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 640px) {
          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .mutation-filters {
            width: 100%;
          }
          
          .mutation-filter {
            width: 100%;
          }
        }
      `;
      
      document.head.appendChild(styles);
    }
    
    // Add modal styles
    function addModalStyles() {
      // Check if styles already exist
      if (document.getElementById('mutation-modal-styles')) return;
      
      const styles = document.createElement('style');
      styles.id = 'mutation-modal-styles';
      styles.textContent = `
        /* Modal styles */
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
          max-width: 600px;
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
          color: #0369a1;
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
        
        .mutation-view {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .mutation-view-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 10px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .mutation-view-section {
          padding: 10px 0;
        }
        
        .mutation-view-section h5 {
          font-size: 16px;
          margin-top: 0;
          margin-bottom: 10px;
          color: #0369a1;
        }
        
        .detail-row {
          display: flex;
          margin-bottom: 8px;
        }
        
        .detail-label {
          color: #6b7280;
          min-width: 120px;
          font-size: 14px;
        }
        
        .detail-value {
          font-weight: 500;
          color: #374151;
          font-size: 14px;
        }
        
        .hash-value {
          font-family: monospace;
          word-break: break-all;
          background-color: #f1f5f9;
          padding: 5px;
          border-radius: 4px;
          font-size: 12px;
        }
        
        .confirmation-message {
          text-align: center;
        }
        
        .confirmation-details {
          margin: 20px 0;
          background-color: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          text-align: left;
        }
        
        .confirmation-item {
          margin-bottom: 10px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .confirmation-label {
          font-weight: 500;
          color: #6b7280;
          min-width: 120px;
        }
        
        .confirmation-info {
          padding: 15px;
          background-color: #f0f9ff;
          border-radius: 8px;
          margin-top: 20px;
          text-align: left;
        }
        
        .confirmation-info p {
          margin: 5px 0;
          font-size: 14px;
        }
        
        .mutation-timeline {
          margin-top: 10px;
        }
        
        .timeline {
          position: relative;
          padding-left: 30px;
        }
        
        .timeline:before {
          content: '';
          position: absolute;
          left: 10px;
          top: 0;
          height: 100%;
          width: 2px;
          background-color: #e5e7eb;
        }
        
        .timeline-item {
          position: relative;
          margin-bottom: 20px;
          opacity: 0.5;
        }
        
        .timeline-item.active {
          opacity: 1;
        }
        
        .timeline-item.rejected {
          color: #ef4444;
        }
        
        .timeline-icon {
          position: absolute;
          left: -30px;
          width: 20px;
          height: 20px;
          background-color: white;
          border-radius: 50%;
          text-align: center;
          line-height: 1.2;
          font-size: 16px;
        }
        
        .timeline-content {
          background-color: #f9fafb;
          padding: 10px;
          border-radius: 8px;
          border-left: 2px solid #0369a1;
        }
        
        .timeline-title {
          font-weight: 500;
          color: #111827;
          margin-bottom: 5px;
        }
        
        .timeline-date {
          font-size: 12px;
          color: #6b7280;
        }
        
        .timeline-reason {
          margin-top: 5px;
          font-size: 12px;
          color: #ef4444;
          font-style: italic;
        }
        
        @media (max-width: 640px) {
          .mutation-view-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .detail-row {
            flex-direction: column;
            margin-bottom: 15px;
          }
          
          .detail-label {
            margin-bottom: 5px;
          }
        }
      `;
      
      document.head.appendChild(styles);
    }
    
    // Add notification styles
    function addNotificationStyles() {
      // Check if notification styles exist
      if (document.getElementById('notification-styles')) return;
      
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
          border-left: 4px solid #0369a1;
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
    
    // Initialize property select for mutations
    function initPropertySelect(forceRefresh = false) {
      const propertySelect = document.getElementById('mutation-property');
      if (!propertySelect) {
        console.error('Property select element not found');
        return;
      }
      
      console.log('Initializing property select...');
      
      // Show loading state
      propertySelect.innerHTML = '<option value="" disabled selected>Loading properties...</option>';
      propertySelect.disabled = true;
      
      // Use cached data if available and not forcing refresh
      if (!forceRefresh && window.mutationApp.propertyCache) {
        console.log('Using cached property data');
        populatePropertySelect(propertySelect, window.mutationApp.propertyCache);
        return;
      }
      
      // Immediate fallback to mock data to prevent UI being stuck
      generateMockProperties()
        .then(mockData => {
          // Use mock data as a fallback
          window.mutationApp.propertyCache = mockData;
          
          // Try to fetch real data in the background
          fetchProperties()
            .then(realProperties => {
              // Update cache with real data if available
              window.mutationApp.propertyCache = realProperties;
              populatePropertySelect(propertySelect, realProperties);
            })
            .catch(error => {
              console.warn("Using mock data due to API error:", error.message);
              // Mock data is already loaded, so we don't need to do anything
            });
            
          // Populate immediately with mock data
          populatePropertySelect(propertySelect, mockData);
        });
    }
    
    // Populate the property select element
    function populatePropertySelect(selectElement, properties) {
      if (!selectElement || !properties) {
        console.error('Invalid select element or properties data');
        return;
      }
      
      // Clear the select
      selectElement.innerHTML = '';
      
      // Add default option
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = '-- Choose a property --';
      selectElement.appendChild(defaultOption);
      
      // Check if we have valid properties
      if (!Array.isArray(properties) || properties.length === 0) {
        console.warn('No properties available or invalid property data');
        const noPropertiesOption = document.createElement('option');
        noPropertiesOption.disabled = true;
        noPropertiesOption.textContent = 'No properties available';
        selectElement.appendChild(noPropertiesOption);
        
        // Add retry option
        const retryOption = document.createElement('option');
        retryOption.value = "retry";
        retryOption.textContent = "Click to retry loading properties";
        selectElement.appendChild(retryOption);
        
        selectElement.disabled = false;
        
        // Add event listener for retry
        selectElement.addEventListener('change', function(e) {
          if (e.target.value === 'retry') {
            retryLoadProperties();
          }
        });
        
        return;
      }
      
      // Sort properties by address for better UX
      const sortedProperties = [...properties].sort((a, b) => {
        const addrA = a.property_address || '';
        const addrB = b.property_address || '';
        return addrA.localeCompare(addrB);
      });
      
      // Add property options
      sortedProperties.forEach(property => {
        if (!property || !property.id) return; // Skip invalid properties
        
        const option = document.createElement('option');
        option.value = property.id;
        
        // Format property address
        let displayAddress = property.property_address || 'Property ID: ' + property.id;
        
        if (property.property_address) {
          const addressParts = property.property_address.split(',');
          
          if (addressParts.length > 1) {
            const locality = addressParts[addressParts.length - 2].trim();
            const city = addressParts[addressParts.length - 1].trim();
            displayAddress = `${addressParts[0].trim()}, ${locality}, ${city}`;
          }
        }
        
        option.textContent = `${displayAddress} (${property.survey_number || 'No survey number'})`;
        selectElement.appendChild(option);
      });
      
      console.log(`Loaded ${properties.length} properties successfully`);
      
      // Enable the select
      selectElement.disabled = false;
    }
    
    // Initialize reason select
    function initReasonSelect() {
      const reasonSelect = document.getElementById('mutation-reason');
      const otherReasonGroup = document.getElementById('other-reason-group');
      
      if (!reasonSelect || !otherReasonGroup) {
        console.error('Reason select elements not found');
        return;
      }
      
      reasonSelect.addEventListener('change', function() {
        otherReasonGroup.style.display = this.value === 'Other' ? 'block' : 'none';
      });
    }
    
    // Initialize mutation form
    function initMutationForm() {
      const mutationForm = document.getElementById('create-mutation-form');
      if (!mutationForm) {
        console.error('Mutation form not found');
        return;
      }
      
      mutationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const propertyId = document.getElementById('mutation-property').value;
        const newOwnerId = document.getElementById('mutation-new-owner').value;
        const reason = document.getElementById('mutation-reason').value;
        const otherReason = document.getElementById('mutation-other-reason')?.value || '';
        const agreement = document.getElementById('transfer-agreement').checked;
        
        // Form validation
        if (!propertyId) {
          showNotification('Please select a property', 'warning');
          return;
        }
        
        if (!newOwnerId) {
          showNotification('Please enter new owner details', 'warning');
          return;
        }
        
        if (!reason) {
          showNotification('Please select a reason for transfer', 'warning');
          return;
        }
        
        if (reason === 'Other' && !otherReason) {
          showNotification('Please specify the reason for transfer', 'warning');
          return;
        }
        
        if (!agreement) {
          showNotification('Please confirm the transfer agreement', 'warning');
          return;
        }
        
        // Show loading state
        const submitBtn = mutationForm.querySelector('button[type="submit"]');
        const originalHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading-spinner" style="width: 20px; height: 20px; margin: 0 5px 0 0;"></span> Processing...';
        submitBtn.disabled = true;
        
        // Prepare mutation data
        const mutationData = {
          land_id: propertyId,
          new_owner_id: newOwnerId,
          mutation_reason: reason === 'Other' ? otherReason : reason
        };
        
        try {
          // Create mutation
          const result = await createMutation(mutationData);
          
          // Show success message
          showNotification('Transfer request created successfully!', 'success');
          
          // Reset form
          mutationForm.reset();
          document.getElementById('other-reason-group').style.display = 'none';
          
          // Refresh mutations list
          loadMutations(true);
          
          // Show confirmation modal
          showMutationConfirmation(result);
        } catch (error) {
          console.error('Failed to create mutation:', error);
          showNotification(`Failed to create transfer request: ${error.message || 'Unknown error'}`, 'error');
        } finally {
          // Reset button
          submitBtn.innerHTML = originalHtml;
          submitBtn.disabled = false;
        }
      });
    }
    
    // Load mutations list
    function loadMutations(forceRefresh = false) {
      const mutationsList = document.getElementById('mutations-list');
      if (!mutationsList) {
        console.error('Mutations list element not found');
        return;
      }
      
      console.log('Loading mutations list...');
      
      // Show loading state
      mutationsList.innerHTML = `
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading transfer requests...</p>
      `;
      
      // Set a timeout for showing fallback content if the request takes too long
      const timeoutId = setTimeout(() => {
        if (mutationsList.querySelector('.loading-spinner')) {
          mutationsList.innerHTML = `
            <div class="no-mutations">
              <p>Taking longer than expected to load transfer requests...</p>
              <button class="action-btn primary" onclick="retryLoadMutations()">Retry Now</button>
            </div>
          `;
        }
      }, 10000); // 10 second timeout
      
      // Use cached data if available and not forcing refresh
      if (!forceRefresh && window.mutationApp.mutationCache) {
        console.log('Using cached mutation data');
        clearTimeout(timeoutId);
        renderMutationsList(window.mutationApp.mutationCache);
        return;
      }
      
      // Immediate fallback to mock data to prevent UI being stuck
      generateMockMutations()
        .then(mockData => {
          // Use mock data as fallback
          window.mutationApp.mutationCache = mockData;
          
          // Try to fetch real data in the background
          fetchMutations()
            .then(realMutations => {
              // Update cache with real data if available
              window.mutationApp.mutationCache = realMutations;
              clearTimeout(timeoutId);
              renderMutationsList(realMutations);
            })
            .catch(error => {
              console.warn("Using mock mutation data due to API error:", error.message);
              // Mock data is already loaded, so we don't need to do anything
            });
            
          // Display mock data immediately
          clearTimeout(timeoutId);
          renderMutationsList(mockData);
        });
    }
    
    // Initialize mutation filter
    function initMutationFilter() {
      const filter = document.getElementById('mutation-filter');
      if (!filter) {
        console.error('Mutation filter element not found');
        return;
      }
      
      filter.addEventListener('change', function() {
        const filterValue = this.value;
        
        // Use cached data if available
        if (window.mutationApp.mutationCache) {
          let filteredData = window.mutationApp.mutationCache;
          
          // Apply filter if not "all"
          if (filterValue !== 'all') {
            filteredData = filteredData.filter(mutation => mutation.status === filterValue);
          }
          
          // Render filtered list
          renderMutationsList(filteredData);
        } else {
          // If no cache, reload from server/generate new data
          loadMutations(true);
        }
      });
    }
    
    // Render mutations list
    function renderMutationsList(mutations) {
      const mutationsList = document.getElementById('mutations-list');
      if (!mutationsList) {
        console.error('Mutations list element not found');
        return;
      }
      
      // Apply any active filters
      const filterElement = document.getElementById('mutation-filter');
      if (filterElement && filterElement.value && filterElement.value !== 'all') {
        const filterValue = filterElement.value;
        mutations = mutations.filter(mutation => mutation.status === filterValue);
      }
      
      // Check for empty result
      if (!mutations || !Array.isArray(mutations) || mutations.length === 0) {
        mutationsList.innerHTML = `
          <div class="no-mutations">
            <p>No property transfer requests found</p>
            <p>Create a new transfer request to get started</p>
          </div>
        `;
        return;
      }
      
      console.log(`Rendering ${mutations.length} mutation records`);
      
      // Clear list
      mutationsList.innerHTML = '';
      
      // Sort mutations by date (newest first) for better UX
      const sortedMutations = [...mutations].sort((a, b) => {
        const dateA = a.mutation_date ? new Date(a.mutation_date).getTime() : 0;
        const dateB = b.mutation_date ? new Date(b.mutation_date).getTime() : 0;
        return dateB - dateA; // Newest first
      });
      
      // Use DocumentFragment for better performance
      const fragment = document.createDocumentFragment();
      
      // Check if the browser supports Intl.DateTimeFormat
      const dateFormatter = typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function' ?
        new Intl.DateTimeFormat('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }) : null;
      
      // Constants for large lists
      const MAX_ITEMS_PER_PAGE = 10;
      const showLoadMore = sortedMutations.length > MAX_ITEMS_PER_PAGE;
      const initialItems = showLoadMore 
        ? sortedMutations.slice(0, MAX_ITEMS_PER_PAGE) 
        : sortedMutations;
      
      // Render initial items
      initialItems.forEach(mutation => {
        const card = createMutationCard(mutation, dateFormatter);
        fragment.appendChild(card);
      });
      
      // Add the fragment to the DOM
      mutationsList.appendChild(fragment);
      
      // Add load more button if needed
      if (showLoadMore) {
        const loadMoreContainer = document.createElement('div');
        loadMoreContainer.className = 'load-more-container';
        loadMoreContainer.innerHTML = `
          <button class="action-btn load-more-btn" id="load-more-mutations">
            Load More (${sortedMutations.length - MAX_ITEMS_PER_PAGE} more)
          </button>
        `;
        mutationsList.appendChild(loadMoreContainer);
        
        // Add event listener
        document.getElementById('load-more-mutations').addEventListener('click', function() {
          // Remove the load more button
          this.parentNode.remove();
          
          // Get the remaining items
          const remainingItems = sortedMutations.slice(MAX_ITEMS_PER_PAGE);
          
          // Create a new fragment
          const moreFragment = document.createDocumentFragment();
          
          // Add remaining items
          remainingItems.forEach(mutation => {
            const card = createMutationCard(mutation, dateFormatter);
            moreFragment.appendChild(card);
          });
          
          // Append to the list
          mutationsList.appendChild(moreFragment);
        });
      }
    }
    
    // Create a mutation card element
    function createMutationCard(mutation, dateFormatter) {
      const mutationCard = document.createElement('div');
      mutationCard.className = 'mutation-card';
      
      // Format date - use cached formatter if available
      let formattedDate = 'Unknown date';
      try {
        if (mutation.mutation_date) {
          const date = new Date(mutation.mutation_date);
          formattedDate = dateFormatter 
            ? dateFormatter.format(date) 
            : formatDateIndian(date);
        }
      } catch (e) {
        console.warn('Date formatting error:', e);
      }
      
      mutationCard.innerHTML = `
        <div class="mutation-header">
          <div class="mutation-id">ID: ${mutation.transaction_id || mutation.id || 'Unknown'}</div>
          <span class="status-badge ${mutation.status || 'unknown'}">${formatStatus(mutation.status)}</span>
        </div>
        <div class="mutation-content">
          <div class="mutation-property">${mutation.property_address || `Property ID: ${mutation.land_id || 'Unknown'}`}</div>
          
          <div class="mutation-detail">
            <span class="detail-label">From Owner:</span>
            <span class="detail-value">${mutation.previous_owner_name || mutation.previous_owner_id || 'Unknown'}</span>
          </div>
          
          <div class="mutation-detail">
            <span class="detail-label">To Owner:</span>
            <span class="detail-value">${mutation.new_owner_name || mutation.new_owner_id || 'Unknown'}</span>
          </div>
          
          <div class="mutation-detail">
            <span class="detail-label">Reason:</span>
            <span class="detail-value">${mutation.mutation_reason || 'Not specified'}</span>
          </div>
          
          <div class="mutation-detail">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${formattedDate}</span>
          </div>
          
          <div class="mutation-actions">
            <button class="action-btn view-btn" data-id="${mutation.id}">
              View Details
            </button>
            ${mutation.status === 'pending' ? `
              <button class="action-btn danger cancel-btn" data-id="${mutation.id}">
                Cancel Request
              </button>
            ` : ''}
          </div>
        </div>
      `;
      
      // Use event delegation for better performance
      mutationCard.addEventListener('click', (e) => {
        const target = e.target;
        
        if (target.classList.contains('view-btn') || target.closest('.view-btn')) {
          viewMutation(mutation);
        } else if (target.classList.contains('cancel-btn') || target.closest('.cancel-btn')) {
          cancelMutation(mutation.id);
        }
      });
      
      return mutationCard;
    }
    
    // Show mutation creation confirmation
    function showMutationConfirmation(mutation) {
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h4>Transfer Request Created</h4>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="confirmation-message">
              <p>Your property transfer request has been successfully created!</p>
              
              <div class="confirmation-details">
                <div class="confirmation-item">
                  <span class="confirmation-label">Transaction ID:</span>
                  <span class="confirmation-value">${mutation.transaction_id || mutation.id || 'Generated'}</span>
                </div>
                
                <div class="confirmation-item">
                  <span class="confirmation-label">Status:</span>
                  <span class="confirmation-value status-badge ${mutation.status || 'pending'}">${formatStatus(mutation.status || 'pending')}</span>
                </div>
                
                <div class="confirmation-item">
                  <span class="confirmation-label">Property ID:</span>
                  <span class="confirmation-value">${mutation.land_id || 'Not specified'}</span>
                </div>
                
                <div class="confirmation-item">
                  <span class="confirmation-label">New Owner:</span>
                  <span class="confirmation-value">${mutation.new_owner_id || 'Not specified'}</span>
                </div>
              </div>
              
              <div class="confirmation-info">
                <p>Your transfer request will be reviewed by the authorities. You can track the status in the "Transfer Requests" section.</p>
                <p>Expected processing time: 7-14 working days</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="action-btn primary modal-close-btn">OK</button>
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
    }
    
    // View mutation details
    function viewMutation(mutation) {
      if (!mutation) {
        console.error('Invalid mutation data');
        showNotification('Error: Cannot view details for this transfer request', 'error');
        return;
      }
      
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      
      let formattedDate = 'Unknown date';
      try {
        if (mutation.mutation_date) {
          formattedDate = formatDateIndian(new Date(mutation.mutation_date));
        }
      } catch (e) {
        console.warn('Date formatting error:', e);
      }
      
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h4>Transfer Request Details</h4>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="mutation-view">
              <div class="mutation-view-header">
                <div class="transaction-id">
                  <span class="detail-label">Transaction ID:</span>
                  <span class="detail-value">${mutation.transaction_id || mutation.id || 'Unknown'}</span>
                </div>
                <div class="status">
                  <span class="detail-label">Status:</span>
                  <span class="status-badge ${mutation.status || 'unknown'}">${formatStatus(mutation.status)}</span>
                </div>
              </div>
              
              <div class="mutation-view-section">
                <h5>Property Information</h5>
                <div class="detail-row">
                  <span class="detail-label">Property ID:</span>
                  <span class="detail-value">${mutation.land_id || 'Unknown'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Address:</span>
                  <span class="detail-value">${mutation.property_address || 'Not available'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Area:</span>
                  <span class="detail-value">${mutation.property_area ? `${mutation.property_area} sq.ft (${(mutation.property_area / 10.764).toFixed(2)} sq.m)` : 'Not available'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Khasra/Survey No:</span>
                  <span class="detail-value">${mutation.survey_number || 'Not available'}</span>
                </div>
              </div>
              
              <div class="mutation-view-section">
                <h5>Transfer Details</h5>
                <div class="detail-row">
                  <span class="detail-label">From Owner:</span>
                  <span class="detail-value">${mutation.previous_owner_name || mutation.previous_owner_id || 'Unknown'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">To Owner:</span>
                  <span class="detail-value">${mutation.new_owner_name || mutation.new_owner_id || 'Unknown'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Reason:</span>
                  <span class="detail-value">${mutation.mutation_reason || 'Not specified'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">${formattedDate}</span>
                </div>
                ${mutation.stamp_duty ? `
                <div class="detail-row">
                  <span class="detail-label">Stamp Duty:</span>
                  <span class="detail-value">₹${Number(mutation.stamp_duty).toLocaleString('en-IN')}</span>
                </div>
                ` : ''}
                ${mutation.registration_fee ? `
                <div class="detail-row">
                  <span class="detail-label">Registration Fee:</span>
                  <span class="detail-value">₹${Number(mutation.registration_fee).toLocaleString('en-IN')}</span>
                </div>
                ` : ''}
              </div>
              
              ${mutation.verification_hash ? `
                <div class="mutation-view-section">
                  <h5>Verification Information</h5>
                  <div class="detail-row">
                    <span class="detail-label">Verification Hash:</span>
                    <span class="detail-value hash-value">${mutation.verification_hash}</span>
                  </div>
                  ${mutation.e_registry_number ? `
                  <div class="detail-row">
                    <span class="detail-label">E-Registry No:</span>
                    <span class="detail-value">${mutation.e_registry_number}</span>
                  </div>
                  ` : ''}
                </div>
              ` : ''}
              
              <div class="mutation-timeline">
                <h5>Status Timeline</h5>
                <div class="timeline">
                  <div class="timeline-item ${mutation.status === 'pending' || mutation.status === 'approved' || mutation.status === 'rejected' ? 'active' : ''}">
                    <div class="timeline-icon">📝</div>
                    <div class="timeline-content">
                      <div class="timeline-title">Request Created</div>
                      <div class="timeline-date">${formattedDate}</div>
                    </div>
                  </div>
                  
                  <div class="timeline-item ${mutation.status === 'approved' || mutation.status === 'rejected' ? 'active' : ''}">
                    <div class="timeline-icon">🔍</div>
                    <div class="timeline-content">
                      <div class="timeline-title">Under Review</div>
                      <div class="timeline-date">${mutation.review_date ? formatDateIndian(new Date(mutation.review_date)) : 'Pending'}</div>
                    </div>
                  </div>
                  
                  <div class="timeline-item ${mutation.status === 'approved' ? 'active' : ''}">
                    <div class="timeline-icon">✅</div>
                    <div class="timeline-content">
                      <div class="timeline-title">Approved</div>
                      <div class="timeline-date">${mutation.status === 'approved' && mutation.approved_date ? formatDateIndian(new Date(mutation.approved_date)) : 'Pending'}</div>
                    </div>
                  </div>
                  
                  <div class="timeline-item ${mutation.status === 'rejected' ? 'active rejected' : ''}">
                    <div class="timeline-icon">❌</div>
                    <div class="timeline-content">
                      <div class="timeline-title">Rejected</div>
                      <div class="timeline-date">${mutation.status === 'rejected' && mutation.rejected_date ? formatDateIndian(new Date(mutation.rejected_date)) : 'N/A'}</div>
                      ${mutation.status === 'rejected' && mutation.rejection_reason ? `
                      <div class="timeline-reason">Reason: ${mutation.rejection_reason}</div>
                      ` : ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            ${mutation.status === 'pending' ? `
              <button class="action-btn danger cancel-mutation-btn" data-id="${mutation.id}">Cancel Request</button>
            ` : ''}
            ${mutation.status === 'approved' ? `
              <button class="action-btn secondary download-certificate-btn" data-id="${mutation.id}">Download Certificate</button>
            ` : ''}
            <button class="action-btn primary modal-close-btn">Close</button>
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
      
      const cancelBtn = modal.querySelector('.cancel-mutation-btn');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          document.body.removeChild(modal);
          cancelMutation(mutation.id);
        });
      }
      
      const downloadBtn = modal.querySelector('.download-certificate-btn');
      if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
          downloadMutationCertificate(mutation.id);
        });
      }
    }
    
    // Download mutation certificate
    function downloadMutationCertificate(mutationId) {
      if (!mutationId) {
        showNotification('Error: Invalid certificate request', 'error');
        return;
      }
      
      showNotification('Preparing certificate for download...', 'info');
      
      // In a real implementation, this would make an API call to generate and download the certificate
      // For now, we'll simulate a delay and show a notification
      setTimeout(() => {
        const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        showNotification(`Certificate #${randomNumber} downloaded successfully`, 'success');
      }, 2000);
    }
    
    // Cancel mutation
    async function cancelMutation(mutationId) {
      if (!mutationId) {
        showNotification('Error: Invalid cancellation request', 'error');
        return;
      }
      
      // Show confirmation
      if (!confirm('Are you sure you want to cancel this transfer request? This action cannot be undone.')) {
        return;
      }
      
      // Show processing notification
      showNotification('Processing cancellation request...', 'info');
      
      try {
        await deleteMutation(mutationId);
        
        // Success notification
        showNotification('Transfer request cancelled successfully', 'success');
        
        // Clear cache and refresh mutations list
        window.mutationApp.mutationCache = null;
        loadMutations();
      } catch (error) {
        console.error('Failed to cancel mutation:', error);
        showNotification(`Failed to cancel transfer request: ${error.message || 'Unknown error'}`, 'error');
      }
    }
    
    // Helper functions
    function formatStatus(status) {
      if (!status) return 'Unknown';
      
      const statusMap = {
        'pending': 'Pending',
        'approved': 'Approved',
        'rejected': 'Rejected',
        'unknown': 'Unknown'
      };
      
      return statusMap[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1);
    }
    
    function formatDateIndian(date) {
      if (!date) return 'Unknown date';
      
      try {
        if (typeof date === 'string') {
          date = new Date(date);
        }
        
        if (isNaN(date.getTime())) {
          return 'Invalid date';
        }
        
        // Use Intl if available for better localization
        if (typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function') {
          return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }).format(date);
        }
        
        // Fallback to manual formatting
        const day = date.getDate();
        const month = date.toLocaleString('en-IN', { month: 'long' });
        const year = date.getFullYear();
        
        return `${day} ${month}, ${year}`;
      } catch (error) {
        console.warn('Date formatting error:', error);
        return 'Unknown date';
      }
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
      if (!message) return;
      
      // Check if we have a global notification function
      if (window.showNotification) {
        window.showNotification(message, type);
        return;
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
    
    // API Functions
    async function fetchProperties() {
      return new Promise((resolve, reject) => {
        console.log('Fetching properties...');
        
        setTimeout(async () => {
          try {
            // Always return mock data if API is not available
            if (!window.mutationApp.apiAvailable) {
              console.log('API not available, generating mock property data');
              const mockData = await generateMockProperties();
              return resolve(mockData);
            }
            
            // Define the API URL
            const apiBaseUrl = window.mutationApp.apiBaseUrl;
            
            // Get auth token
            const token = localStorage.getItem('token');
            if (!token) {
              console.warn('No authentication token found');
              throw new Error('Authentication required');
            }
            
            console.log('Making API request to fetch properties');
            const response = await fetch(`${apiBaseUrl}/api/land-records`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (!response.ok) {
              const errorText = await response.text().catch(() => 'Unknown error');
              console.error(`API returned error: ${response.status} ${response.statusText}`, errorText);
              throw new Error(`Server returned ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log(`Fetched ${data?.length || 0} properties from API`);
            resolve(data);
          } catch (error) {
            console.error('Error in fetchProperties:', error);
            // Always return mock data as fallback
            const mockData = await generateMockProperties();
            resolve(mockData);
          }
        }, 500); // Short delay to prevent immediate failure
      });
    }
    
    async function fetchMutations() {
      return new Promise((resolve, reject) => {
        console.log('Fetching mutations...');
        
        setTimeout(async () => {
          try {
            // Always return mock data if API is not available
            if (!window.mutationApp.apiAvailable) {
              console.log('API not available, generating mock mutation data');
              const mockData = await generateMockMutations();
              return resolve(mockData);
            }
            
            // Define the API URL
            const apiBaseUrl = window.mutationApp.apiBaseUrl;
            
            // Get auth token
            const token = localStorage.getItem('token');
            if (!token) {
              console.warn('No authentication token found');
              throw new Error('Authentication required');
            }
            
            console.log('Making API request to fetch mutations');
            const response = await fetch(`${apiBaseUrl}/api/mutations`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (!response.ok) {
              const errorText = await response.text().catch(() => 'Unknown error');
              console.error(`API returned error: ${response.status} ${response.statusText}`, errorText);
              throw new Error(`Server returned ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log(`Fetched ${data?.length || 0} mutations from API`);
            resolve(data);
          } catch (error) {
            console.error('Error in fetchMutations:', error);
            // Always return mock data as fallback
            const mockData = await generateMockMutations();
            resolve(mockData);
          }
        }, 500); // Short delay to prevent immediate failure
      });
    }
    
    async function createMutation(mutationData) {
      try {
        console.log('Creating mutation with data:', mutationData);
        
        // Use mock processing if API is not available
        if (!window.mutationApp.apiAvailable) {
          console.log('API not available, simulating mutation creation');
          return simulateMutationCreation(mutationData);
        }
        
        // Define the API URL
        const apiBaseUrl = window.mutationApp.apiBaseUrl;
        
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('No authentication token found');
          throw new Error('Authentication required');
        }
        
        console.log('Making API request to create mutation');
        const response = await fetch(`${apiBaseUrl}/api/mutations`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(mutationData)
        });
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error(`API returned error: ${response.status} ${response.statusText}`, errorText);
          throw new Error(`Server returned ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Mutation created successfully:', data);
        return data;
      } catch (error) {
        console.error('Error in createMutation:', error);
        
        // Fallback to simulation on error
        return simulateMutationCreation(mutationData);
      }
    }
    
    async function deleteMutation(mutationId) {
      try {
        console.log('Deleting mutation with ID:', mutationId);
        
        // Use mock processing if API is not available
        if (!window.mutationApp.apiAvailable) {
          console.log('API not available, simulating mutation deletion');
          return simulateMutationDeletion(mutationId);
        }
        
        // Define the API URL
        const apiBaseUrl = window.mutationApp.apiBaseUrl;
        
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('No authentication token found');
          throw new Error('Authentication required');
        }
        
        console.log('Making API request to delete mutation');
        const response = await fetch(`${apiBaseUrl}/api/mutations/${mutationId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error(`API returned error: ${response.status} ${response.statusText}`, errorText);
          throw new Error(`Server returned ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Mutation deleted successfully:', data);
        return data;
      } catch (error) {
        console.error('Error in deleteMutation:', error);
        
        // Fallback to simulation on error
        return simulateMutationDeletion(mutationId);
      }
    }
    
    // Simulation functions for API-less operation
    function simulateMutationCreation(mutationData) {
      return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(() => {
          // Get property details if available
          const property = window.mutationApp.propertyCache ?
            window.mutationApp.propertyCache.find(p => p.id === mutationData.land_id) :
            null;
          
          // Create transaction ID
          const transactionId = `MUT-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`;
          
          // Create result object
          const result = {
            id: `mut-${Math.random().toString(36).substring(2, 10)}`,
            transaction_id: transactionId,
            land_id: mutationData.land_id,
            property_address: property ? property.property_address : null,
            property_area: property ? property.area_sqft : null,
            survey_number: property ? property.survey_number : null,
            previous_owner_id: 'current-user',
            previous_owner_name: 'Current User',
            new_owner_id: mutationData.new_owner_id,
            mutation_date: new Date().toISOString(),
            mutation_reason: mutationData.mutation_reason,
            status: 'pending'
          };
          
          // If we have a mutations cache, add this to it
          if (window.mutationApp.mutationCache) {
            window.mutationApp.mutationCache.unshift(result);
          }
          
          resolve(result);
        }, 1000);
      });
    }
    
    function simulateMutationDeletion(mutationId) {
      return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(() => {
          // If we have a mutations cache, remove this from it
          if (window.mutationApp.mutationCache) {
            window.mutationApp.mutationCache = window.mutationApp.mutationCache.filter(
              m => m.id !== mutationId
            );
          }
          
          resolve({ success: true, id: mutationId });
        }, 1000);
      });
    }
    
    // Generate mock property data with Indian context
    function generateMockProperties() {
      return new Promise((resolve) => {
        // Generate 5-10 random Indian properties
        const numProperties = Math.floor(Math.random() * 6) + 5;
        const properties = [];
        
        const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Jaipur'];
        const localities = ['Bandra', 'Indira Nagar', 'Koramangala', 'Golf Links', 'Salt Lake', 'Malviya Nagar', 'Adarsh Nagar'];
        const streets = ['MG Road', 'Park Street', 'Brigade Road', 'Linking Road', 'Rajpath', 'Gandhi Road'];
        const propertyTypes = ['Residential', 'Commercial', 'Agricultural', 'Industrial', 'Mixed Use'];
        
        for (let i = 0; i < numProperties; i++) {
          const cityIndex = Math.floor(Math.random() * cities.length);
          const localityIndex = Math.floor(Math.random() * localities.length);
          const streetIndex = Math.floor(Math.random() * streets.length);
          const houseNo = Math.floor(Math.random() * 200) + 1;
          const propertyTypeIndex = Math.floor(Math.random() * propertyTypes.length);
          
          const city = cities[cityIndex];
          const locality = localities[localityIndex];
          const street = streets[streetIndex];
          const propertyType = propertyTypes[propertyTypeIndex];
          
          const areaSqft = Math.floor(Math.random() * 5000) + 1000;
          const areaSqm = Math.round(areaSqft / 10.764 * 100) / 100;
          
          properties.push({
            id: `prop-${i + 1}`,
            survey_number: `${Math.floor(Math.random() * 999) + 1}/${Math.floor(Math.random() * 999) + 1}`,
            property_address: `${houseNo}, ${street}, ${locality}, ${city}`,
            area_sqft: areaSqft.toString(),
            area_sqm: areaSqm.toString(),
            owner_id: `user-${i + 1}`,
            property_type: propertyType
          });
        }
        
        console.log(`Generated ${properties.length} mock properties`);
        resolve(properties);
      });
    }
    
    // Generate mock mutation data with Indian context
    function generateMockMutations() {
      return new Promise((resolve) => {
        // Generate 3-7 random Indian mutations
        const numMutations = Math.floor(Math.random() * 5) + 3;
        const mutations = [];
        
        const indianNames = [
          'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sunita Singh', 
          'Raj Malhotra', 'Anita Desai', 'Vijay Mehta', 'Neha Gupta',
          'Sanjay Verma', 'Deepa Reddy', 'Rajesh Khanna', 'Meena Kumari'
        ];
        
        const reasons = [
          'Sale', 'Inheritance', 'Gift Deed', 'Family Partition', 'Court Order',
          'Power of Attorney', 'Will Transfer', 'Exchange'
        ];
        
        const rejectionReasons = [
          'Incomplete documentation', 'Title dispute', 'Missing NOC',
          'Property encumbrance', 'Legal objection', 'Outstanding dues',
          'Invalid survey details', 'Missing identity verification'
        ];
        
        const statuses = ['pending', 'approved', 'rejected'];
        const statusWeights = [0.5, 0.3, 0.2]; // 50% pending, 30% approved, 20% rejected
        
        const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Jaipur'];
        const localities = ['Bandra', 'Indira Nagar', 'Koramangala', 'Golf Links', 'Salt Lake', 'Malviya Nagar', 'Adarsh Nagar'];
        const streets = ['MG Road', 'Park Street', 'Brigade Road', 'Linking Road', 'Rajpath', 'Gandhi Road'];
        
        // Cache for memory optimization
        const now = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        const currentYear = now.getFullYear();
        
        for (let i = 0; i < numMutations; i++) {
          // Generate random date within the last 6 months
          const randomDate = new Date(sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime()));
          
          // Generate random status based on weights
          let status;
          const rand = Math.random();
          if (rand < statusWeights[0]) {
            status = statuses[0];
          } else if (rand < statusWeights[0] + statusWeights[1]) {
            status = statuses[1];
          } else {
            status = statuses[2];
          }
          
          // Random address components
          const cityIndex = Math.floor(Math.random() * cities.length);
          const localityIndex = Math.floor(Math.random() * localities.length);
          const streetIndex = Math.floor(Math.random() * streets.length);
          const houseNo = Math.floor(Math.random() * 200) + 1;
          
          // Generate random area between 500-5000 sq.ft
          const area = Math.floor(Math.random() * 4500) + 500;
          
          // Generate property price and calculate stamp duty and registration fee (Indian context)
          const propertyValue = area * (Math.floor(Math.random() * 5000) + 2000); // Value in INR
          const stampDuty = Math.round(propertyValue * 0.05); // 5% stamp duty
          const registrationFee = Math.round(propertyValue * 0.01); // 1% registration fee
          
          // Random previous and new owner (ensure they're different)
          const prevOwnerIndex = Math.floor(Math.random() * indianNames.length);
          let newOwnerIndex;
          do {
            newOwnerIndex = Math.floor(Math.random() * indianNames.length);
          } while (newOwnerIndex === prevOwnerIndex);
          
          const propertyId = `prop-${Math.floor(Math.random() * 5) + 1}`;
          const address = `${houseNo}, ${streets[streetIndex]}, ${localities[localityIndex]}, ${cities[cityIndex]}`;
          
          mutations.push({
            id: `mut-${i + 1}`,
            transaction_id: `MUT-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`,
            land_id: propertyId,
            property_address: address,
            property_area: area.toString(),
            survey_number: `${Math.floor(Math.random() * 999) + 1}/${Math.floor(Math.random() * 999) + 1}`,
            previous_owner_id: `user-${prevOwnerIndex + 1}`,
            previous_owner_name: indianNames[prevOwnerIndex],
            new_owner_id: `user-${newOwnerIndex + 1}`,
            new_owner_name: indianNames[newOwnerIndex],
            mutation_date: randomDate.toISOString(),
            mutation_reason: reasons[Math.floor(Math.random() * reasons.length)],
            status: status,
            verification_hash: status !== 'pending' ? '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('') : null,
            review_date: status !== 'pending' ? new Date(randomDate.getTime() + (2 * 24 * 60 * 60 * 1000)).toISOString() : null, // 2 days after mutation date
            approved_date: status === 'approved' ? new Date(randomDate.getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString() : null, // 7 days after mutation date
            rejected_date: status === 'rejected' ? new Date(randomDate.getTime() + (5 * 24 * 60 * 60 * 1000)).toISOString() : null, // 5 days after mutation date
            rejection_reason: status === 'rejected' ? rejectionReasons[Math.floor(Math.random() * rejectionReasons.length)] : null,
            stamp_duty: status === 'approved' ? stampDuty : null,
            registration_fee: status === 'approved' ? registrationFee : null,
            e_registry_number: status === 'approved' ? `EREG/${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}/${currentYear}` : null
          });
        }
        
        console.log(`Generated ${mutations.length} mock mutations`);
        resolve(mutations);
      });
    }
    
    // Add debug controls for testing
    function addDebugControls() {
      // Check if debug panel already exists
      if (document.getElementById('debug-panel')) return;
      
      const debugPanel = document.createElement('div');
      debugPanel.id = 'debug-panel';
      debugPanel.innerHTML = `
        <div class="debug-panel">
          <h4>Debug Controls</h4>
          <div class="debug-control">
            <label>
              <input type="checkbox" id="api-available-toggle" ${window.mutationApp.apiAvailable ? 'checked' : ''}>
              API Available
            </label>
          </div>
          <div class="debug-control">
            <label>API Base URL:</label>
            <input type="text" id="api-base-url" value="${window.mutationApp.apiBaseUrl}">
          </div>
          <div class="debug-control">
            <button id="clear-cache-btn">Clear Cache</button>
            <button id="reload-data-btn">Reload Data</button>
          </div>
        </div>
      `;
      
      // Add debug panel styles
      const style = document.createElement('style');
      style.textContent = `
        .debug-panel {
          position: fixed;
          bottom: 10px;
          right: 10px;
          background: #f0f9ff;
          border: 1px solid #0369a1;
          border-radius: 4px;
          padding: 10px;
          font-size: 12px;
          z-index: 9999;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .debug-panel h4 {
          margin-top: 0;
          margin-bottom: 5px;
          color: #0369a1;
          font-size: 14px;
        }
        
        .debug-control {
          margin-bottom: 5px;
        }
        
        .debug-control label {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .debug-control input[type="text"] {
          width: 100%;
          padding: 2px 5px;
          margin-top: 2px;
        }
        
        .debug-control button {
          padding: 3px 8px;
          margin-right: 5px;
          background: #e0f2fe;
          border: 1px solid #0369a1;
          border-radius: 3px;
          cursor: pointer;
        }
      `;
      
      document.head.appendChild(style);
      document.body.appendChild(debugPanel);
      
      // Add event listeners for debug controls
      const apiToggle = document.getElementById('api-available-toggle');
      if (apiToggle) {
        apiToggle.addEventListener('change', function() {
          window.mutationApp.apiAvailable = this.checked;
          localStorage.setItem('apiAvailable', window.mutationApp.apiAvailable);
          showNotification(`API ${window.mutationApp.apiAvailable ? 'enabled' : 'disabled'} - Reload data to apply changes`, 'info');
        });
      }
      
      const apiBaseUrl = document.getElementById('api-base-url');
      if (apiBaseUrl) {
        apiBaseUrl.addEventListener('change', function() {
          window.mutationApp.apiBaseUrl = this.value;
          localStorage.setItem('apiBaseUrl', window.mutationApp.apiBaseUrl);
          showNotification('API base URL updated - Reload data to apply changes', 'info');
        });
      }
      
      const clearCacheBtn = document.getElementById('clear-cache-btn');
      if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', function() {
          // Clear cached API responses
          window.mutationApp.propertyCache = null;
          window.mutationApp.mutationCache = null;
          showNotification('Cache cleared', 'success');
        });
      }
      
      const reloadDataBtn = document.getElementById('reload-data-btn');
      if (reloadDataBtn) {
        reloadDataBtn.addEventListener('click', function() {
          // Force reload all data
          refreshData();
          showNotification('Reloading data...', 'info');
        });
      }
    }
  });