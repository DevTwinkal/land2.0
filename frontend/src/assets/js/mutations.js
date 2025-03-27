// Mutations page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mutations page when it's selected
    const mutationsNavItem = document.querySelector('.nav-item[data-page="mutations"]');
    if (mutationsNavItem) {
        mutationsNavItem.addEventListener('click', initMutationsPage);
    }

    // Add to window for direct access in HTML
    window.initMutationsPage = initMutationsPage;
    window.retryLoadMutations = initMutationsPage;
});

// Initialize the mutations page
async function initMutationsPage() {
    console.log('Initializing mutations page');
    const mutationsContainer = document.getElementById('mutations-list-container');
    
    if (!mutationsContainer) {
        console.error('Mutations container not found');
        return;
    }
    
    // Show loading state
    mutationsContainer.innerHTML = '<div class="loading-spinner"></div><p class="text-center">Loading mutations...</p>';
    
    try {
        // Fetch mutations from the API
        const mutations = await fetchMutationsWithFallback();
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
                <button class="retry-btn" onclick="retryLoadMutations()">Retry</button>
            </div>
        `;
    }
}

// Fetch mutations with fallback to mock data
async function fetchMutationsWithFallback() {
    try {
        // Try to fetch from API
        if (typeof api !== 'undefined' && api.getMutations) {
            return await api.getMutations();
        } else {
            console.warn('API not available, using mock data');
            return generateMockMutations();
        }
    } catch (error) {
        console.warn('Error fetching mutations from API, using mock data', error);
        return generateMockMutations();
    }
}

// Generate mock mutation data
function generateMockMutations() {
    const mockMutations = [];
    // Create 5 random mutations
    for (let i = 0; i < 5; i++) {
        mockMutations.push({
            id: `mock-${i+1}`,
            transaction_id: `TX-${Math.floor(Math.random() * 10000)}`,
            land_id: `land-${i+1}`,
            previous_owner_id: `user-${i}`,
            new_owner_id: `user-${i+10}`,
            mutation_reason: "Sample Mutation",
            mutation_date: new Date().toISOString(),
            status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)]
        });
    }
    return mockMutations;
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
                    <option value="">Loading properties...</option>
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
                let result;
                if (typeof api !== 'undefined' && api.createMutation) {
                    result = await api.createMutation(formData);
                } else {
                    // Mock creation
                    result = {
                        id: `mock-${Date.now()}`,
                        ...formData,
                        transaction_id: `TX-${Math.floor(Math.random() * 10000)}`,
                        mutation_date: new Date().toISOString(),
                        status: 'pending'
                    };
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
                }
                
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
                const mutations = await fetchMutationsWithFallback();
                const filteredMutations = filterMutations(mutations, mutationsFilter.value);
                
                const mutationsList = document.getElementById('mutations-list');
                if (mutationsList) {
                    mutationsList.innerHTML = createMutationsList(filteredMutations);
                }
            } catch (error) {
                console.error('Failed to filter mutations:', error);
            }
        });
    }
}

// Populate the property select dropdown
async function populatePropertySelect() {
    const propertySelect = document.getElementById('mutation-land-id');
    if (!propertySelect) {
        console.error('Property select element not found');
        return;
    }
    
    // Show loading state
    propertySelect.innerHTML = '<option value="" disabled selected>Loading properties...</option>';
    
    try {
        let properties;
        
        // Try to fetch from API
        if (typeof api !== 'undefined' && api.getLandRecords) {
            properties = await api.getLandRecords();
        } else {
            // Generate mock data if API not available
            console.warn('API not available, using mock property data');
            properties = generateMockProperties();
        }
        
        // Clear loading option
        propertySelect.innerHTML = '<option value="">-- Select a Property --</option>';
        
        if (properties && properties.length > 0) {
            properties.forEach(property => {
                const option = document.createElement('option');
                option.value = property.id;
                
                // Format the display text based on available property data
                let displayText = property.property_address || 'Property';
                if (property.survey_number) {
                    displayText += ` (${property.survey_number})`;
                }
                
                option.textContent = displayText;
                propertySelect.appendChild(option);
            });
            
            console.log(`Successfully loaded ${properties.length} properties`);
        } else {
            // No properties found
            const noPropertiesOption = document.createElement('option');
            noPropertiesOption.value = "";
            noPropertiesOption.textContent = "No properties available";
            noPropertiesOption.disabled = true;
            propertySelect.appendChild(noPropertiesOption);
        }
    } catch (error) {
        console.error('Failed to load properties for select:', error);
        propertySelect.innerHTML = '<option value="">Failed to load properties</option>';
        
        // Add retry option
        const retryOption = document.createElement('option');
        retryOption.value = "retry";
        retryOption.textContent = "Click to retry loading properties";
        propertySelect.appendChild(retryOption);
        
        // Add event listener for retry
        propertySelect.addEventListener('change', function(e) {
            if (e.target.value === 'retry') {
                populatePropertySelect();
            }
        });
    }
}

// Generate mock property data
function generateMockProperties() {
    const mockProperties = [];
    // Create 10 random properties
    for (let i = 0; i < 10; i++) {
        mockProperties.push({
            id: `property-${i+1}`,
            property_address: `${Math.floor(Math.random() * 1000) + 1} Example Street, City`,
            survey_number: `SUR-${Math.floor(Math.random() * 10000)}`
        });
    }
    return mockProperties;
}

// Create HTML for the mutations list
function createMutationsList(mutations) {
    if (!mutations || mutations.length === 0) {
        return '<p class="no-data">No transfer requests found.</p>';
    }
    
    return mutations.map(mutation => {
        const statusClass = getStatusClass(mutation.status);
        const statusBadge = `<span class="status-badge ${statusClass}">${mutation.status}</span>`;
        
        let formattedDate = 'Unknown date';
        try {
            if (mutation.mutation_date) {
                const mutationDate = new Date(mutation.mutation_date);
                formattedDate = mutationDate.toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                });
            }
        } catch (e) {
            console.warn('Date formatting error:', e);
        }
        
        return `
            <div class="mutation-item" data-id="${mutation.id}">
                <div class="mutation-header">
                    <div class="mutation-id">ID: ${mutation.transaction_id || mutation.id}</div>
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
    if (!status) return 'pending';
    
    switch (status.toLowerCase()) {
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