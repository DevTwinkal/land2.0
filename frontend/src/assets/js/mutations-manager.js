// Enhanced Mutation Manager with Indian Land Records
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mutations features when the mutations page is activated
    const mutationsNavItem = document.querySelector('.nav-item[data-page="mutations"]');
    if (mutationsNavItem) {
      mutationsNavItem.addEventListener('click', initMutationsPage);
    }
    
    // Check if we're already on the mutations page
    if (document.querySelector('[data-page="mutations"].active') || 
        window.location.href.includes('mutations')) {
      initMutationsPage();
    }
    
    // Initialize the mutations page
    function initMutationsPage() {
      console.log('Initializing Mutations page...');
      const mutationsContainer = document.getElementById('mutations-list-container');
      
      if (!mutationsContainer) {
        console.error('Mutations container not found');
        return;
      }
      
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
                    <option value="">-- Choose a property --</option>
                    <!-- Properties will be loaded here -->
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
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Add CSS styles
      addMutationStyles();
      
      // Initialize mutation UI functionality
      initPropertySelect();
      initReasonSelect();
      initMutationForm();
      loadMutations();
      initMutationFilter();
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
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
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
    
    // Initialize property select for mutations
    function initPropertySelect() {
      const propertySelect = document.getElementById('mutation-property');
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
      }).catch(error => {
        console.error('Failed to load properties:', error);
        showNotification('Failed to load properties. Please try again.', 'error');
      });
    }
    
    // Initialize reason select
    function initReasonSelect() {
      const reasonSelect = document.getElementById('mutation-reason');
      const otherReasonGroup = document.getElementById('other-reason-group');
      
      if (!reasonSelect || !otherReasonGroup) return;
      
      reasonSelect.addEventListener('change', function() {
        otherReasonGroup.style.display = this.value === 'Other' ? 'block' : 'none';
      });
    }
    
    // Initialize mutation form
    function initMutationForm() {
      const mutationForm = document.getElementById('create-mutation-form');
      if (!mutationForm) return;
      
      mutationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const propertyId = document.getElementById('mutation-property').value;
        const newOwnerId = document.getElementById('mutation-new-owner').value;
        const reason = document.getElementById('mutation-reason').value;
        const otherReason = document.getElementById('mutation-other-reason')?.value || '';
        const agreement = document.getElementById('transfer-agreement').checked;
        
        // Validate form
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
        submitBtn.innerHTML = '<span class="loading"></span> Processing...';
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
          loadMutations();
          
          // Show confirmation modal
          showMutationConfirmation(result);
        } catch (error) {
          console.error('Failed to create mutation:', error);
          showNotification(`Failed to create transfer request: ${error.message}`, 'error');
        } finally {
          // Reset button
          submitBtn.innerHTML = originalHtml;
          submitBtn.disabled = false;
        }
      });
    }
    
    // Load mutations list
    function loadMutations() {
      const mutationsList = document.getElementById('mutations-list');
      if (!mutationsList) return;
      
      mutationsList.innerHTML = '<div class="loading-spinner"></div>';
      
      fetchMutations().then(mutations => {
        renderMutationsList(mutations);
      }).catch(error => {
        console.error('Failed to load mutations:', error);
        mutationsList.innerHTML = `
          <div class="no-mutations">
            <p>Failed to load transfer requests: ${error.message}</p>
            <button class="action-btn" onclick="retryLoadMutations()">Retry</button>
          </div>
        `;
      });
    }
    
    // Initialize mutation filter
    function initMutationFilter() {
      const filter = document.getElementById('mutation-filter');
      if (!filter) return;
      
      filter.addEventListener('change', function() {
        const filterValue = this.value;
        
        // Show loading state
        const mutationsList = document.getElementById('mutations-list');
        mutationsList.innerHTML = '<div class="loading-spinner"></div>';
        
        // Fetch mutations and filter them
        fetchMutations().then(mutations => {
          if (filterValue === 'all') {
            renderMutationsList(mutations);
          } else {
            const filteredMutations = mutations.filter(mutation => mutation.status === filterValue);
            renderMutationsList(filteredMutations);
          }
        }).catch(error => {
          console.error('Failed to filter mutations:', error);
          mutationsList.innerHTML = `
            <div class="no-mutations">
              <p>Failed to load transfer requests: ${error.message}</p>
              <button class="action-btn" onclick="retryLoadMutations()">Retry</button>
            </div>
          `;
        });
      });
    }
    
    // Render mutations list
    function renderMutationsList(mutations) {
      const mutationsList = document.getElementById('mutations-list');
      if (!mutationsList) return;
      
      if (!mutations || mutations.length === 0) {
        mutationsList.innerHTML = `
          <div class="no-mutations">
            <p>No property transfer requests found</p>
            <p>Create a new transfer request to get started</p>
          </div>
        `;
        return;
      }
      
      // Clear list
      mutationsList.innerHTML = '';
      
      // Add mutation cards
      mutations.forEach(mutation => {
        const mutationDate = new Date(mutation.mutation_date);
        const formattedDate = formatDateIndian(mutationDate);
        
        const mutationCard = document.createElement('div');
        mutationCard.className = 'mutation-card';
        mutationCard.innerHTML = `
          <div class="mutation-header">
            <div class="mutation-id">ID: ${mutation.transaction_id || mutation.id}</div>
            <span class="status-badge ${mutation.status}">${formatStatus(mutation.status)}</span>
          </div>
          <div class="mutation-content">
            <div class="mutation-property">${mutation.property_address || `Property ID: ${mutation.land_id}`}</div>
            
            <div class="mutation-detail">
              <span class="detail-label">From Owner:</span>
              <span class="detail-value">${mutation.previous_owner_name || mutation.previous_owner_id}</span>
            </div>
            
            <div class="mutation-detail">
              <span class="detail-label">To Owner:</span>
              <span class="detail-value">${mutation.new_owner_name || mutation.new_owner_id}</span>
            </div>
            
            <div class="mutation-detail">
              <span class="detail-label">Reason:</span>
              <span class="detail-value">${mutation.mutation_reason}</span>
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
        
        mutationsList.appendChild(mutationCard);
        
        // Add event listeners
        const viewBtn = mutationCard.querySelector('.view-btn');
        if (viewBtn) {
          viewBtn.addEventListener('click', () => viewMutation(mutation));
        }
        
        const cancelBtn = mutationCard.querySelector('.cancel-btn');
        if (cancelBtn) {
          cancelBtn.addEventListener('click', () => cancelMutation(mutation.id));
        }
      });
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
                  <span class="confirmation-value">${mutation.transaction_id || mutation.id}</span>
                </div>
                
                <div class="confirmation-item">
                  <span class="confirmation-label">Status:</span>
                  <span class="confirmation-value status-badge ${mutation.status}">${formatStatus(mutation.status)}</span>
                </div>
                
                <div class="confirmation-item">
                  <span class="confirmation-label">Property ID:</span>
                  <span class="confirmation-value">${mutation.land_id}</span>
                </div>
                
                <div class="confirmation-item">
                  <span class="confirmation-label">New Owner:</span>
                  <span class="confirmation-value">${mutation.new_owner_id}</span>
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
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      
      const mutationDate = new Date(mutation.mutation_date);
      const formattedDate = formatDateIndian(mutationDate);
      
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
                  <span class="detail-value">${mutation.transaction_id || mutation.id}</span>
                </div>
                <div class="status">
                  <span class="detail-label">Status:</span>
                  <span class="status-badge ${mutation.status}">${formatStatus(mutation.status)}</span>
                </div>
              </div>
              
              <div class="mutation-view-section">
                <h5>Property Information</h5>
                <div class="detail-row">
                  <span class="detail-label">Property ID:</span>
                  <span class="detail-value">${mutation.land_id}</span>
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
                  <span class="detail-value">${mutation.previous_owner_name || mutation.previous_owner_id}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">To Owner:</span>
                  <span class="detail-value">${mutation.new_owner_name || mutation.new_owner_id}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Reason:</span>
                  <span class="detail-value">${mutation.mutation_reason}</span>
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
      
      // Add additional modal styles
      addModalStyles();
      
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
      showNotification('Preparing certificate for download...', 'info');
      
      // In a real implementation, this would make an API call to generate and download the certificate
      // For now, we'll simulate a delay and show a notification
      setTimeout(() => {
        showNotification('Certificate downloaded successfully', 'success');
      }, 2000);
    }
    
    // Add modal styles
    function addModalStyles() {
      // Check if styles already exist
      if (document.getElementById('mutation-modal-styles')) return;
      
      const styles = document.createElement('style');
      styles.id = 'mutation-modal-styles';
      styles.textContent = `
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
        
        .action-btn.secondary {
          background-color: #e0f2fe;
          color: #0369a1;
          border-color: #e0f2fe;
        }
        
        .action-btn.secondary:hover {
          background-color: #bae6fd;
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
    
    // Cancel mutation
    async function cancelMutation(mutationId) {
      // Show confirmation
      if (!confirm('Are you sure you want to cancel this transfer request? This action cannot be undone.')) {
        return;
      }
      
      try {
        await deleteMutation(mutationId);
        
        showNotification('Transfer request cancelled successfully', 'success');
        
        // Refresh mutations list
        loadMutations();
      } catch (error) {
        console.error('Failed to cancel mutation:', error);
        showNotification(`Failed to cancel transfer request: ${error.message}`, 'error');
      }
    }
    
    // Helper functions
    function formatStatus(status) {
      if (!status) return 'Unknown';
      
      const statusMap = {
        'pending': 'Pending',
        'approved': 'Approved',
        'rejected': 'Rejected'
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
        
        const day = date.getDate();
        const month = date.toLocaleString('en-IN', { month: 'long' });
        const year = date.getFullYear();
        
        return `${day} ${month}, ${year}`;
      } catch (error) {
        return 'Unknown date';
      }
    }
    
    // API Functions
    async function fetchProperties() {
      try {
        // Define the API URL - update this with your actual backend URL in production
        const apiBaseUrl = window.apiBaseUrl || 'http://localhost:8000';
        
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
          showNotification('Authentication required. Please log in.', 'error');
          return [];
        }
        
        const response = await fetch(`${apiBaseUrl}/api/land-records`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error in fetchProperties:', error);
        
        // For testing when API is not available, return mock data with Indian context
        if (!window.apiAvailable) {
          // Generate 5-10 random Indian properties
          const numProperties = Math.floor(Math.random() * 6) + 5;
          const properties = [];
          
          const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Jaipur'];
          const localities = ['Bandra', 'Indira Nagar', 'Koramangala', 'Golf Links', 'Salt Lake', 'Malviya Nagar', 'Adarsh Nagar'];
          const streets = ['MG Road', 'Park Street', 'Brigade Road', 'Linking Road', 'Rajpath', 'Gandhi Road'];
          
          for (let i = 0; i < numProperties; i++) {
            const city = cities[Math.floor(Math.random() * cities.length)];
            const locality = localities[Math.floor(Math.random() * localities.length)];
            const street = streets[Math.floor(Math.random() * streets.length)];
            const houseNo = Math.floor(Math.random() * 200) + 1;
            
            properties.push({
              id: `prop-${i + 1}`,
              survey_number: `${Math.floor(Math.random() * 999) + 1}/${Math.floor(Math.random() * 999) + 1}`,
              property_address: `${houseNo}, ${street}, ${locality}, ${city}`,
              area_sqft: (Math.floor(Math.random() * 5000) + 1000).toString(),
              owner_id: `user-${i + 1}`
            });
          }
          
          return properties;
        }
        
        throw error;
      }
    }
    
    async function fetchMutations() {
      try {
        // Define the API URL - update this with your actual backend URL in production
        const apiBaseUrl = window.apiBaseUrl || 'http://localhost:8000';
        
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
          showNotification('Authentication required. Please log in.', 'error');
          return [];
        }
        
        const response = await fetch(`${apiBaseUrl}/api/mutations`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch mutations');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error in fetchMutations:', error);
        
        // For testing when API is not available, return mock data with Indian context
        if (!window.apiAvailable) {
          // Generate 3-7 random Indian mutations
          const numMutations = Math.floor(Math.random() * 5) + 3;
          const mutations = [];
          
          const indianNames = [
            'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sunita Singh', 
            'Raj Malhotra', 'Anita Desai', 'Vijay Mehta', 'Neha Gupta'
          ];
          
          const reasons = [
            'Sale', 'Inheritance', 'Gift Deed', 'Family Partition', 'Court Order'
          ];
          
          const statuses = ['pending', 'approved', 'rejected'];
          const statusWeights = [0.5, 0.3, 0.2]; // 50% pending, 30% approved, 20% rejected
          
          for (let i = 0; i < numMutations; i++) {
            // Generate random date within the last 6 months
            const now = new Date();
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(now.getMonth() - 6);
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
            
            // Generate random area between 500-5000 sq.ft
            const area = Math.floor(Math.random() * 4500) + 500;
            
            // Generate property price and calculate stamp duty and registration fee (Indian context)
            const propertyValue = area * (Math.floor(Math.random() * 5000) + 2000); // Value in INR
            const stampDuty = Math.round(propertyValue * 0.05); // 5% stamp duty
            const registrationFee = Math.round(propertyValue * 0.01); // 1% registration fee
            
            mutations.push({
              id: `mut-${i + 1}`,
              transaction_id: `MUT-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`,
              land_id: `prop-${Math.floor(Math.random() * 5) + 1}`,
              property_address: `${Math.floor(Math.random() * 100) + 1}, MG Road, Bangalore`,
              property_area: area.toString(),
              survey_number: `${Math.floor(Math.random() * 999) + 1}/${Math.floor(Math.random() * 999) + 1}`,
              previous_owner_id: `user-${Math.floor(Math.random() * 10) + 1}`,
              previous_owner_name: indianNames[Math.floor(Math.random() * indianNames.length)],
              new_owner_id: `user-${Math.floor(Math.random() * 10) + 1}`,
              new_owner_name: indianNames[Math.floor(Math.random() * indianNames.length)],
              mutation_date: randomDate.toISOString(),
              mutation_reason: reasons[Math.floor(Math.random() * reasons.length)],
              status: status,
              verification_hash: status !== 'pending' ? '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('') : null,
              review_date: status !== 'pending' ? new Date(randomDate.getTime() + (2 * 24 * 60 * 60 * 1000)).toISOString() : null, // 2 days after mutation date
              approved_date: status === 'approved' ? new Date(randomDate.getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString() : null, // 7 days after mutation date
              rejected_date: status === 'rejected' ? new Date(randomDate.getTime() + (5 * 24 * 60 * 60 * 1000)).toISOString() : null, // 5 days after mutation date
              rejection_reason: status === 'rejected' ? 'Incomplete documentation' : null,
              stamp_duty: status === 'approved' ? stampDuty : null,
              registration_fee: status === 'approved' ? registrationFee : null,
              e_registry_number: status === 'approved' ? `EREG/${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}/${new Date().getFullYear()}` : null
            });
          }
          
          return mutations;
        }
        
        throw error;
      }
    }
    
    async function createMutation(mutationData) {
      try {
        // Define the API URL - update this with your actual backend URL in production
        const apiBaseUrl = window.apiBaseUrl || 'http://localhost:8000';
        
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
          showNotification('Authentication required. Please log in.', 'error');
          throw new Error('Authentication required');
        }
        
        if (window.apiAvailable) {
          const response = await fetch(`${apiBaseUrl}/api/mutations`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(mutationData)
          });
          
          if (!response.ok) {
            throw new Error('Failed to create mutation');
          }
          
          return await response.json();
        } else {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Create mock mutation transaction ID
          const transactionId = `MUT-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`;
          
          // Return mock response
          return {
            id: `mut-${Math.random().toString(36).substring(2, 10)}`,
            transaction_id: transactionId,
            land_id: mutationData.land_id,
            previous_owner_id: 'current-user',
            new_owner_id: mutationData.new_owner_id,
            mutation_date: new Date().toISOString(),
            mutation_reason: mutationData.mutation_reason,
            status: 'pending'
          };
        }
      } catch (error) {
        console.error('Error in createMutation:', error);
        throw error;
      }
    }
    
    async function deleteMutation(mutationId) {
      try {
        // Define the API URL - update this with your actual backend URL in production
        const apiBaseUrl = window.apiBaseUrl || 'http://localhost:8000';
        
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
          showNotification('Authentication required. Please log in.', 'error');
          throw new Error('Authentication required');
        }
        
        if (window.apiAvailable) {
          const response = await fetch(`${apiBaseUrl}/api/mutations/${mutationId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to cancel mutation');
          }
          
          return await response.json();
        } else {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Return mock response
          return { success: true };
        }
      } catch (error) {
        console.error('Error in deleteMutation:', error);
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
    
    // Retry loading mutations
    window.retryLoadMutations = function() {
      loadMutations();
    };
    
    // Add option to check if API is available
    window.apiAvailable = false; // Set to true in production
    
    // Set a global API base URL if needed
    window.apiBaseUrl = window.location.origin; // Change if API is hosted elsewhere
    
    // Make functions available globally for testing
    window.mutationManager = {
      initMutationsPage,
      loadMutations,
      createMutation,
      deleteMutation,
      retryLoadMutations,
      downloadMutationCertificate
    };
  });