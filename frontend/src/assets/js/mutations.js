// Mutations page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mutations page when it's selected
    const mutationsNavItem = document.querySelector('.nav-item[data-page="mutations"]');
    if (mutationsNavItem) {
        mutationsNavItem.addEventListener('click', initMutationsPage);
    }
});

// Initialize the mutations page
async function initMutationsPage() {
    console.log('Initializing mutations page');
    const mutationsContainer = document.getElementById('mutations-list-container');
    
    // Show loading state
    mutationsContainer.innerHTML = '<div class="loading-spinner"></div><p class="text-center">Loading mutations...</p>';
    
    try {
        // Fetch mutations from the API
        const mutations = await api.getMutations();
        console.log('Mutations data:', mutations);
        
        // Clear the loading state
        mutationsContainer.innerHTML = '';
        
        // Create UI for mutations management
        createMutationsUI(mutationsContainer, mutations);
    } catch (error) {
        console.error('Failed to load mutations:', error);
        mutationsContainer.innerHTML = `
            <div class="error-container">
                <p>Failed to load mutations: ${error.message}</p>
                <button class="retry-btn" onclick="initMutationsPage()">Retry</button>
            </div>
        `;
    }
}

// Create the mutations management UI
function createMutationsUI(container, mutations) {
    // Create mutations UI components
    const mutationsUI = document.createElement('div');
    mutationsUI.className = 'mutations-ui';
    
    // Create new mutation section
    const newMutationSection = document.createElement('div');
    newMutationSection.className = 'new-mutation-section';
    newMutationSection.innerHTML = `
        <h3>Create New Property Transfer</h3>
        <form id="create-mutation-form">
            <div class="form-group">
                <label for="mutation-land-id">Property</label>
                <select id="mutation-land-id" name="land_id" required>
                    <option value="">Select Property</option>
                </select>
            </div>
            <div class="form-group">
                <label for="mutation-new-owner">New Owner</label>
                <input type="text" id="mutation-new-owner" name="new_owner_id" placeholder="User ID of the new owner" required>
            </div>
            <div class="form-group">
                <label for="mutation-reason">Reason for Transfer</label>
                <textarea id="mutation-reason" name="mutation_reason" placeholder="Enter the reason for property transfer" required></textarea>
            </div>
            <button type="submit" class="primary-btn">Create Transfer Request</button>
        </form>
    `;
    
    // Create mutations list section
    const mutationsListSection = document.createElement('div');
    mutationsListSection.className = 'mutations-list-section';
    mutationsListSection.innerHTML = `
        <h3>Property Transfer Requests</h3>
        <div class="mutations-filter">
            <select id="mutations-filter">
                <option value="all">All Transfers</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
            </select>
        </div>
        <div class="mutations-list" id="mutations-list">
            ${createMutationsList(mutations)}
        </div>
    `;
    
    // Append sections to the UI
    mutationsUI.appendChild(newMutationSection);
    mutationsUI.appendChild(mutationsListSection);
    
    // Append UI to the container
    container.appendChild(mutationsUI);
    
    // Initialize form handlers
    initMutationFormHandlers();
    
    // Populate the property select dropdown
    populatePropertySelect();
}

// Initialize form handlers for mutations page
function initMutationFormHandlers() {
    const mutationForm = document.getElementById('create-mutation-form');
    if (mutationForm) {
        mutationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                land_id: document.getElementById('mutation-land-id').value,
                new_owner_id: document.getElementById('mutation-new-owner').value,
                mutation_reason: document.getElementById('mutation-reason').value
            };
            
            // Show loading state
            const submitBtn = mutationForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Creating...';
            submitBtn.disabled = true;
            
            try {
                const result = await api.createMutation(formData);
                console.log('Mutation created:', result);
                alert('Transfer request created successfully!');
                
                // Reset form
                mutationForm.reset();
                
                // Refresh mutations list
                initMutationsPage();
            } catch (error) {
                console.error('Failed to create mutation:', error);
                alert(`Failed to create transfer request: ${error.message}`);
            } finally {
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Add filter handler
    const mutationsFilter = document.getElementById('mutations-filter');
    if (mutationsFilter) {
        mutationsFilter.addEventListener('change', async () => {
            try {
                const mutations = await api.getMutations();
                const filteredMutations = filterMutations(mutations, mutationsFilter.value);
                
                const mutationsList = document.getElementById('mutations-list');
                mutationsList.innerHTML = createMutationsList(filteredMutations);
            } catch (error) {
                console.error('Failed to filter mutations:', error);
            }
        });
    }
}

// Populate the property select dropdown
async function populatePropertySelect() {
    const propertySelect = document.getElementById('mutation-land-id');
    if (!propertySelect) return;
    
    try {
        const properties = await api.getLandRecords();
        
        properties.forEach(property => {
            const option = document.createElement('option');
            option.value = property.id;
            option.textContent = `${property.property_address} (${property.survey_number})`;
            propertySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load properties for select:', error);
        propertySelect.innerHTML = '<option value="">Failed to load properties</option>';
    }
}

// Create HTML for the mutations list
function createMutationsList(mutations) {
    if (!mutations || mutations.length === 0) {
        return '<p class="no-data">No transfer requests found.</p>';
    }
    
    return mutations.map(mutation => {
        const statusClass = getStatusClass(mutation.status);
        const statusBadge = `<span class="status-badge ${statusClass}">${mutation.status}</span>`;
        
        const mutationDate = new Date(mutation.mutation_date);
        const formattedDate = mutationDate.toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
        
        return `
            <div class="mutation-item" data-id="${mutation.id}">
                <div class="mutation-header">
                    <div class="mutation-id">ID: ${mutation.transaction_id}</div>
                    ${statusBadge}
                </div>
                <div class="mutation-details">
                    <div class="mutation-property">
                        <span class="label">Property ID:</span>
                        <span class="value">${mutation.land_id}</span>
                    </div>
                    <div class="mutation-owners">
                        <span class="label">From:</span>
                        <span class="value">${mutation.previous_owner_id}</span>
                        <span class="label">To:</span>
                        <span class="value">${mutation.new_owner_id}</span>
                    </div>
                    <div class="mutation-date">
                        <span class="label">Requested on:</span>
                        <span class="value">${formattedDate}</span>
                    </div>
                    <div class="mutation-reason">
                        <span class="label">Reason:</span>
                        <span class="value">${mutation.mutation_reason}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Filter mutations based on status
function filterMutations(mutations, filter) {
    if (filter === 'all') {
        return mutations;
    }
    
    return mutations.filter(mutation => mutation.status === filter);
}

// Get CSS class for mutation status
function getStatusClass(status) {
    switch (status) {
        case 'pending':
            return 'pending';
        case 'approved':
            return 'verified';
        case 'rejected':
            return 'disputed';
        default:
            return 'pending';
    }
}