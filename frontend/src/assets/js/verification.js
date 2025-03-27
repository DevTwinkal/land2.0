// Verification page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize verification page when it's selected
    const verificationNavItem = document.querySelector('.nav-item[data-page="verification"]');
    if (verificationNavItem) {
        verificationNavItem.addEventListener('click', initVerificationPage);
    }
});

// Initialize the verification page
function initVerificationPage() {
    console.log('Initializing verification page');
    const verificationContainer = document.getElementById('verification-container');
    
    // Create verification UI
    verificationContainer.innerHTML = `
        <div class="verification-ui">
            <div class="verification-intro">
                <h3>Land Record Verification</h3>
                <p>Verify the authenticity of any land record or document by entering its details below.</p>
            </div>
            
            <div class="verification-methods">
                <div class="verification-tabs">
                    <button class="verification-tab active" data-tab="survey">Verify by Survey Number</button>
                    <button class="verification-tab" data-tab="document">Verify Document Hash</button>
                    <button class="verification-tab" data-tab="transaction">Verify Transaction</button>
                </div>
                
                <div class="verification-tab-content active" id="survey-verification">
                    <form id="survey-verification-form">
                        <div class="form-group">
                            <label for="survey-number-input">Survey Number</label>
                            <input type="text" id="survey-number-input" placeholder="Enter property survey number" required>
                        </div>
                        <button type="submit" class="primary-btn">Verify Property</button>
                    </form>
                </div>
                
                <div class="verification-tab-content" id="document-verification">
                    <form id="document-verification-form">
                        <div class="form-group">
                            <label for="document-hash-input">Document Hash (SHA-256)</label>
                            <input type="text" id="document-hash-input" placeholder="Enter document hash to verify" required>
                        </div>
                        <button type="submit" class="primary-btn">Verify Document</button>
                    </form>
                </div>
                
                <div class="verification-tab-content" id="transaction-verification">
                    <form id="transaction-verification-form">
                        <div class="form-group">
                            <label for="transaction-id-input">Transaction ID</label>
                            <input type="text" id="transaction-id-input" placeholder="Enter mutation transaction ID" required>
                        </div>
                        <button type="submit" class="primary-btn">Verify Transaction</button>
                    </form>
                </div>
            </div>
            
            <div class="verification-result" id="verification-result">
                <!-- Verification results will be displayed here -->
            </div>
        </div>
    `;
    
    // Initialize verification tabs
    initVerificationTabs();
    
    // Initialize verification form handlers
    initVerificationForms();
}

// Initialize verification tabs
function initVerificationTabs() {
    const tabs = document.querySelectorAll('.verification-tab');
    const tabContents = document.querySelectorAll('.verification-tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show selected tab content
            const tabName = tab.getAttribute('data-tab');
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabName}-verification`) {
                    content.classList.add('active');
                }
            });
            
            // Clear previous verification results
            const resultContainer = document.getElementById('verification-result');
            if (resultContainer) {
                resultContainer.innerHTML = '';
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
                showVerificationError('Please enter a survey number');
                return;
            }
            
            // Show loading state
            const resultContainer = document.getElementById('verification-result');
            resultContainer.innerHTML = '<div class="loading-spinner"></div><p>Verifying property...</p>';
            
            try {
                // In a real implementation, you would call a dedicated verification API
                // For now, we'll search through land records to find matching survey number
                const properties = await api.getLandRecords();
                const property = properties.find(p => p.survey_number === surveyNumber);
                
                if (property) {
                    // Found a matching property
                    displayPropertyVerificationResult(property, resultContainer);
                    
                    // Log the successful verification
                    logVerificationAttempt('property', true, { 
                        survey_number: surveyNumber, 
                        property_id: property.id 
                    });
                    
                    // Show success notification
                    if (typeof showNotification === 'function') {
                        showNotification('Property verification successful!', 'success');
                    }
                } else {
                    // No matching property found
                    handleVerificationError(resultContainer, 'Property Not Found', 
                        `No property with survey number "${surveyNumber}" was found in the system.`);
                    
                    // Log the failed verification
                    logVerificationAttempt('property', false, { survey_number: surveyNumber });
                }
            } catch (error) {
                console.error('Property verification failed:', error);
                handleVerificationError(resultContainer, 'Verification Failed', 
                    `An error occurred during verification: ${error.message}`);
                
                // Log the error
                logVerificationAttempt('property', false, { 
                    survey_number: surveyNumber, 
                    error: error.message 
                });
            }
        });
    }
    
    // Document hash verification form
    const documentForm = document.getElementById('document-verification-form');
    if (documentForm) {
        documentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const documentHash = document.getElementById('document-hash-input').value;
            if (!documentHash) {
                showVerificationError('Please enter a document hash');
                return;
            }
            
            // Format the hash input (remove spaces, ensure lowercase)
            const formattedHash = formatHash(documentHash);
            
            // Show loading state
            const resultContainer = document.getElementById('verification-result');
            resultContainer.innerHTML = '<div class="loading-spinner"></div><p>Verifying document...</p>';
            
            try {
                // This would be a dedicated API endpoint in a real implementation
                // For now, we'll fetch all properties and their documents to find a match
                const properties = await api.getLandRecords();
                let foundDocument = null;
                let foundProperty = null;
                
                // Search through all properties and their documents
                for (const property of properties) {
                    try {
                        const documents = await api.getDocuments(property.id);
                        const matchingDocument = documents.find(doc => {
                            const docHash = doc.file_hash.toLowerCase();
                            return docHash === formattedHash || docHash.includes(formattedHash);
                        });
                        
                        if (matchingDocument) {
                            foundDocument = matchingDocument;
                            foundProperty = property;
                            break;
                        }
                    } catch (err) {
                        console.error(`Error fetching documents for property ${property.id}:`, err);
                    }
                }
                
                if (foundDocument && foundProperty) {
                    // Found a matching document
                    displayDocumentVerificationResult(foundDocument, foundProperty, resultContainer);
                    
                    // Log the successful verification
                    logVerificationAttempt('document', true, { 
                        document_hash: formattedHash, 
                        document_id: foundDocument.id,
                        property_id: foundProperty.id
                    });
                    
                    // Show success notification
                    if (typeof showNotification === 'function') {
                        showNotification('Document verification successful!', 'success');
                    }
                } else {
                    // No matching document found
                    handleVerificationError(resultContainer, 'Document Not Found', 
                        `No document with hash "${documentHash}" was found in the system.`);
                    
                    // Log the failed verification
                    logVerificationAttempt('document', false, { document_hash: formattedHash });
                }
            } catch (error) {
                console.error('Document verification failed:', error);
                handleVerificationError(resultContainer, 'Verification Failed', 
                    `An error occurred during verification: ${error.message}`);
                
                // Log the error
                logVerificationAttempt('document', false, { 
                    document_hash: formattedHash, 
                    error: error.message 
                });
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
                showVerificationError('Please enter a transaction ID');
                return;
            }
            
            // Format the transaction ID (remove spaces, ensure uppercase for consistency)
            const formattedTransactionId = formatTransactionId(transactionId);
            
            // Show loading state
            const resultContainer = document.getElementById('verification-result');
            resultContainer.innerHTML = '<div class="loading-spinner"></div><p>Verifying transaction...</p>';
            
            try {
                // This would be a dedicated API endpoint in a real implementation
                // For now, we'll search through all mutations to find a match
                const mutations = await api.getMutations();
                const mutation = mutations.find(m => m.transaction_id.toUpperCase() === formattedTransactionId);
                
                if (mutation) {
                    // Found a matching transaction
                    displayTransactionVerificationResult(mutation, resultContainer);
                    
                    // Log the successful verification
                    logVerificationAttempt('transaction', true, { 
                        transaction_id: formattedTransactionId, 
                        mutation_id: mutation.id,
                        property_id: mutation.land_id
                    });
                    
                    // Show success notification
                    if (typeof showNotification === 'function') {
                        showNotification('Transaction verification successful!', 'success');
                    }
                } else {
                    // No matching transaction found
                    handleVerificationError(resultContainer, 'Transaction Not Found', 
                        `No transaction with ID "${transactionId}" was found in the system.`);
                    
                    // Log the failed verification
                    logVerificationAttempt('transaction', false, { transaction_id: formattedTransactionId });
                }
            } catch (error) {
                console.error('Transaction verification failed:', error);
                handleVerificationError(resultContainer, 'Verification Failed', 
                    `An error occurred during verification: ${error.message}`);
                
                // Log the error
                logVerificationAttempt('transaction', false, { 
                    transaction_id: formattedTransactionId, 
                    error: error.message 
                });
            }
        });
    }
}

// Display property verification result
function displayPropertyVerificationResult(property, container) {
    const verificationData = formatVerificationData(property);
    
    container.innerHTML = `
        <div class="verification-success">
            <div class="verification-icon success">✓</div>
            <h3>Property Verified</h3>
            <div class="verification-details">
                <div class="detail-item">
                    <span class="detail-label">Survey Number:</span>
                    <span class="detail-value">${property.survey_number}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Property Address:</span>
                    <span class="detail-value">${property.property_address}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Area:</span>
                    <span class="detail-value">${property.area_sqft} sq.ft</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Registered On:</span>
                    <span class="detail-value">${verificationData.createdDate}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Last Updated:</span>
                    <span class="detail-value">${verificationData.updatedDate}</span>
                </div>
                ${property.document_hash ? `
                <div class="detail-item">
                    <span class="detail-label">Document Hash:</span>
                    <span class="detail-value hash">${property.document_hash}</span>
                </div>
                ` : ''}
            </div>
            <div class="verification-actions">
                <button class="secondary-btn" onclick="viewPropertyDetails('${property.id}')">View Property</button>
                <button class="primary-btn" onclick="downloadVerificationCertificate('property', '${property.id}')">Download Certificate</button>
            </div>
        </div>
    `;
}

// Display document verification result
function displayDocumentVerificationResult(document, property, container) {
    const uploadedDate = new Date(document.uploaded_at);
    const formattedUploadedDate = uploadedDate.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
    
    const docTypeDisplay = formatDocumentType(document.document_type);
    
    container.innerHTML = `
        <div class="verification-success">
            <div class="verification-icon success">✓</div>
            <h3>Document Verified</h3>
            <div class="verification-details">
                <div class="detail-item">
                    <span class="detail-label">Document Type:</span>
                    <span class="detail-value">${docTypeDisplay}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">File Name:</span>
                    <span class="detail-value">${document.file_name}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Associated Property:</span>
                    <span class="detail-value">${property.property_address}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Survey Number:</span>
                    <span class="detail-value">${property.survey_number}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Uploaded On:</span>
                    <span class="detail-value">${formattedUploadedDate}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Document Hash:</span>
                    <span class="detail-value hash">${document.file_hash}</span>
                </div>
            </div>
            <div class="verification-actions">
                <button class="secondary-btn" onclick="viewPropertyDetails('${property.id}')">View Property</button>
                <button class="primary-btn" onclick="downloadVerificationCertificate('document', '${document.id}')">Download Certificate</button>
            </div>
        </div>
    `;
}

// Display transaction verification result
function displayTransactionVerificationResult(mutation, container) {
    const mutationDate = new Date(mutation.mutation_date);
    const formattedMutationDate = mutationDate.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
    
    // Define status colors
    const statusColors = {
        'pending': '#f59e0b',
        'approved': '#10b981',
        'rejected': '#ef4444'
    };
    
    const statusColor = statusColors[mutation.status] || '#64748b';
    
    container.innerHTML = `
        <div class="verification-success">
            <div class="verification-icon success">✓</div>
            <h3>Transaction Verified</h3>
            <div class="verification-details">
                <div class="detail-item">
                    <span class="detail-label">Transaction ID:</span>
                    <span class="detail-value">${mutation.transaction_id}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Property ID:</span>
                    <span class="detail-value">${mutation.land_id}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">From Owner:</span>
                    <span class="detail-value">${mutation.previous_owner_id}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">To Owner:</span>
                    <span class="detail-value">${mutation.new_owner_id}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Date Requested:</span>
                    <span class="detail-value">${formattedMutationDate}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value" style="color: ${statusColor}; font-weight: bold;">${mutation.status.toUpperCase()}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Reason:</span>
                    <span class="detail-value">${mutation.mutation_reason}</span>
                </div>
                ${mutation.verification_hash ? `
                <div class="detail-item">
                    <span class="detail-label">Verification Hash:</span>
                    <span class="detail-value hash">${mutation.verification_hash}</span>
                </div>
                ` : ''}
            </div>
            <div class="verification-actions">
                <button class="secondary-btn" onclick="viewLandRecord('${mutation.land_id}')">View Property</button>
                <button class="primary-btn" onclick="downloadVerificationCertificate('transaction', '${mutation.id}')">Download Certificate</button>
            </div>
        </div>
    `;
}

// Function to navigate to property details
function viewPropertyDetails(propertyId) {
    // Switch to land records tab
    const landRecordsTab = document.querySelector('.nav-item[data-page="land-records"]');
    if (landRecordsTab) {
        landRecordsTab.click();
    }
    
    // Load property details
    setTimeout(() => {
        if (typeof selectPropertyById === 'function') {
            selectPropertyById(propertyId);
        } else {
            // Fallback if the function doesn't exist
            console.log('Property selection function not available. Property ID:', propertyId);
            
            // Try to reload land records which might show the property
            if (typeof loadLandRecords === 'function') {
                loadLandRecords().then(() => {
                    console.log('Land records reloaded. Please select the property manually.');
                    showNotification('Please select the property manually on the map.', 'info');
                });
            }
        }
    }, 300);
}

// Function to navigate to land record from mutation
function viewLandRecord(landId) {
    viewPropertyDetails(landId);
}

// Helper function to handle verification errors
function handleVerificationError(container, title, message) {
    container.innerHTML = `
        <div class="verification-error">
            <div class="verification-icon error">❌</div>
            <h3>${title}</h3>
            <p>${message}</p>
        </div>
    `;
    
    // Show error notification if the global function is available
    if (typeof showNotification === 'function') {
        showNotification(message, 'error');
    }
}

// Show verification error as alert or notification
function showVerificationError(message) {
    // Use global notification system if available
    if (typeof showNotification === 'function') {
        showNotification(message, 'error');
    } else {
        alert(message);
    }
}

// Format verification data for display
function formatVerificationData(property) {
    const createdDate = new Date(property.created_at);
    const updatedDate = new Date(property.updated_at);
    
    return {
        createdDate: createdDate.toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        }),
        updatedDate: updatedDate.toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        })
    };
}

// Format document type for display
function formatDocumentType(documentType) {
    return documentType.replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Format hash input
function formatHash(hash) {
    // Remove spaces, make lowercase for consistent comparison
    return hash.replace(/\s+/g, '').toLowerCase();
}

// Format transaction ID
function formatTransactionId(transactionId) {
    // Remove spaces, make uppercase for consistent comparison
    return transactionId.replace(/\s+/g, '').toUpperCase();
}

// Log verification attempt
function logVerificationAttempt(type, success, data) {
    // This would typically send data to backend for logging/auditing
    // For now, just log to console
    console.log(`Verification attempt: ${type}`, {
        success,
        timestamp: new Date().toISOString(),
        data
    });
}

// Generate and download verification certificate
function downloadVerificationCertificate(type, id) {
    // This would typically call a backend API to generate a signed PDF certificate
    // For demonstration purposes, we'll create a simple HTML certificate
    
    // Get current date/time
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    const formattedTime = now.toLocaleTimeString('en-US');
    
    // Generate verification code (would be cryptographically secure in production)
    const verificationCode = 'VC-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Create certificate HTML
    const certificateHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Verification Certificate</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
            .certificate { max-width: 800px; margin: 20px auto; border: 2px solid #2563eb; padding: 30px; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #2563eb; }
            .subtitle { font-size: 18px; color: #64748b; }
            .content { margin-bottom: 30px; }
            .footer { text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            .verification-code { font-family: monospace; font-weight: bold; background: #f1f5f9; padding: 5px; }
            .stamp { border: 2px dashed #10b981; color: #10b981; padding: 10px; display: inline-block; transform: rotate(-5deg); font-weight: bold; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="certificate">
            <div class="header">
                <div class="title">Digital Land Records System</div>
                <div class="subtitle">Official Verification Certificate</div>
            </div>
            <div class="content">
                <p>This is to certify that the ${type} with ID: <strong>${id}</strong> was verified on ${formattedDate} at ${formattedTime}.</p>
                <p>This certificate serves as proof of verification in the Digital Land Records System.</p>
                <p>Verification Code: <span class="verification-code">${verificationCode}</span></p>
                <p>To verify this certificate, please visit our verification portal and enter the verification code provided above.</p>
            </div>
            <div class="stamp">VERIFIED</div>
            <div class="footer">
                <p>This is an electronically generated certificate and does not require a physical signature.</p>
                <p>Digital Land Records System &copy; ${now.getFullYear()}</p>
            </div>
        </div>
    </body>
    </html>
    `;
    
    // Create a Blob containing the HTML
    const blob = new Blob([certificateHtml], { type: 'text/html' });
    
    // Create a download link and trigger download
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `verification-certificate-${type}-${id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Show success notification
    if (typeof showNotification === 'function') {
        showNotification('Verification certificate downloaded successfully!', 'success');
    }
}