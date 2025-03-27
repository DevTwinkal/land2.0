// Map related functionality
let map;
let parcelsLayer;
let selectedParcel = null;
let allProperties = []; // Store all properties for reference

function initMap() {
    try {
        console.log('Initializing map...');
        
        // Create map centered on a default location (can be adjusted)
        map = L.map('map').setView([28.5486, 77.3710], 12);
        
        // Add base tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Add map controls
        L.control.zoom({
            position: 'topright'
        }).addTo(map);
        
        // Add satellite layer
        const satelliteLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: '&copy; Google Maps'
        });
        
        // Add layer control for different views
        const baseMaps = {
            "Streets": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }),
            "Satellite": satelliteLayer
        };
        
        L.control.layers(baseMaps, null, {
            position: 'topright'
        }).addTo(map);
        
        // Add scale control
        L.control.scale({
            position: 'bottomleft',
            imperial: false
        }).addTo(map);
        
        console.log('Map initialized successfully');
        
        // Add resize handler to fix map rendering issues
        window.addEventListener('resize', function() {
            map.invalidateSize();
        });
        
        // Force a resize after initialization to ensure proper rendering
        setTimeout(function() {
            map.invalidateSize();
        }, 500);
        
        // Add search functionality for property selection
        initPropertySearch();
        
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

// Initialize property search functionality
function initPropertySearch() {
    const searchInput = document.querySelector('.search-container input');
    const searchButton = document.querySelector('.search-button');
    
    if (searchInput && searchButton) {
        // Add search button click handler
        searchButton.addEventListener('click', function() {
            performPropertySearch(searchInput.value);
        });
        
        // Add enter key handler on input
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performPropertySearch(this.value);
            }
        });
    }
}

// Perform property search
function performPropertySearch(query) {
    if (!query) return;
    
    console.log('Searching for property:', query);
    
    // Normalize query for case-insensitive search
    const normalizedQuery = query.toLowerCase().trim();
    
    // Search in loaded properties
    const results = allProperties.filter(property => 
        property.property_address.toLowerCase().includes(normalizedQuery) ||
        property.survey_number.toLowerCase().includes(normalizedQuery) ||
        property.id.toLowerCase().includes(normalizedQuery)
    );
    
    console.log('Search results:', results);
    
    if (results.length > 0) {
        // Select the first matching property
        selectPropertyById(results[0].id);
    } else {
        alert('No properties found matching your search.');
    }
}

async function loadLandRecords() {
    try {
        console.log('Loading land records...');
        const records = await api.getLandRecords();
        console.log('Records received:', records);
        
        // Store all properties for reference
        allProperties = records;
        
        // Convert records to GeoJSON
        const geojsonFeatures = records.map(record => {
            // Skip records without coordinates
            if (!record.geo_latitude || !record.geo_longitude) {
                console.log('Record missing coordinates:', record.id);
                return null;
            }
            
            return {
                type: "Feature",
                properties: {
                    id: record.id,
                    property_address: record.property_address,
                    area_sqft: record.area_sqft,
                    survey_number: record.survey_number,
                    document_hash: record.document_hash,
                    created_at: record.created_at,
                    updated_at: record.updated_at,
                    owner_id: record.owner_id,
                    status: "verified" // Default status, can be updated based on actual data
                },
                geometry: {
                    type: "Point",
                    coordinates: [record.geo_longitude, record.geo_latitude]
                }
            };
        }).filter(feature => feature !== null);
        
        console.log('GeoJSON features:', geojsonFeatures);
        
        // Create GeoJSON layer
        if (parcelsLayer) {
            map.removeLayer(parcelsLayer);
        }
        
        parcelsLayer = L.geoJSON({
            type: "FeatureCollection",
            features: geojsonFeatures
        }, {
            pointToLayer: function(feature, latlng) {
                return L.circle(latlng, {
                    radius: 50, // Adjust based on your needs
                    color: getStatusColor(feature.properties.status),
                    fillColor: getStatusColor(feature.properties.status),
                    fillOpacity: 0.2,
                    weight: 2
                });
            },
            onEachFeature: function(feature, layer) {
                // Add popup
                const popupContent = `
                    <div class="parcel-popup">
                        <h4>${feature.properties.property_address.split(',')[0] || 'Property'}</h4>
                        <p>${feature.properties.property_address.split(',').slice(1).join(',').trim() || 'No address details'}</p>
                        <p><strong>Survey Number:</strong> ${feature.properties.survey_number}</p>
                        <p><strong>Area:</strong> ${feature.properties.area_sqft} sq.ft</p>
                        <button class="popup-view-btn" onclick="selectPropertyById('${feature.properties.id}')">View Details</button>
                    </div>
                `;
                layer.bindPopup(popupContent);
                
                // Add click handler
                layer.on('click', function() {
                    selectedParcel = feature;
                    updatePropertyDetails(feature);
                    
                    // Update the selected property in the sidebar
                    updateSelectedPropertySidebar(feature);
                });
                
                // Store reference to layer in feature for later use
                feature.layer = layer;
            }
        }).addTo(map);
        
        // Fit map to parcels if there are any
        if (geojsonFeatures.length > 0) {
            map.fitBounds(parcelsLayer.getBounds());
        } else {
            console.log('No features with coordinates found');
        }
        
        return geojsonFeatures;
    } catch (error) {
        console.error('Failed to load land records:', error);
        alert('Failed to load land records. Please try again later.');
        return [];
    }
}

function getStatusColor(status) {
    switch(status) {
        case 'verified':
            return '#10b981';
        case 'pending':
            return '#f59e0b';
        case 'disputed':
            return '#ef4444';
        default:
            return '#475569';
    }
}

function updatePropertyDetails(feature) {
    const propertyDetailsContent = document.getElementById('property-details-content');
    propertyDetailsContent.style.display = 'block';
    
    document.getElementById('property-id').textContent = feature.properties.id;
    document.getElementById('property-title').textContent = feature.properties.property_address.split(',')[0];
    document.getElementById('property-address').textContent = feature.properties.property_address.split(',').slice(1).join(',').trim();
    document.getElementById('property-area').textContent = `${feature.properties.area_sqft} sq.ft`;
    
    const updatedDate = new Date(feature.properties.updated_at);
    document.getElementById('property-updated').textContent = updatedDate.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
    
    document.getElementById('document-hash').textContent = feature.properties.document_hash || 'No hash available';
    
    // Get owner details and documents
    fetchPropertyDetails(feature.properties.id);
}

async function fetchPropertyDetails(recordId) {
    try {
        // Get full record details
        const record = await api.getLandRecord(recordId);
        
        // Get documents for this record
        const documents = await api.getDocuments(recordId);
        
        // Update document list
        const documentList = document.getElementById('document-list');
        documentList.innerHTML = '';
        
        if (documents.length === 0) {
            documentList.innerHTML = '<li>No documents available</li>';
        } else {
            documents.forEach(doc => {
                const uploadedDate = new Date(doc.uploaded_at);
                const formattedDate = uploadedDate.toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                });
                
                const docTypeDisplay = doc.document_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                const li = document.createElement('li');
                li.className = 'document-item';
                li.innerHTML = `
                    <div class="document-info">
                        <div class="document-icon">📄</div>
                        <div class="document-details">
                            <div class="document-name">${docTypeDisplay}</div>
                            <div class="document-date">Added: ${formattedDate}</div>
                        </div>
                    </div>
                    <button class="view-btn">View</button>
                `;
                documentList.appendChild(li);
            });
        }
        
        // Try to fetch owner information
        try {
            // In a real app, you would have an API endpoint to get user details
            // For now, we'll use the owner_id and make a fake display
            const ownerId = record.owner_id;
            const ownerInitials = ownerId.split('-')[0].substring(0, 2).toUpperCase();
            
            document.getElementById('owner-initials').textContent = ownerInitials;
            document.getElementById('owner-name').textContent = `Owner ID: ${ownerId.substring(0, 8)}...`;
            document.getElementById('owner-since').textContent = 'Owner since: ' + new Date(record.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
        } catch (ownerError) {
            console.error('Failed to fetch owner details:', ownerError);
            document.getElementById('owner-initials').textContent = 'OW';
            document.getElementById('owner-name').textContent = 'Owner information unavailable';
            document.getElementById('owner-since').textContent = '';
        }
        
    } catch (error) {
        console.error('Failed to fetch property details:', error);
    }
}

// Select a property by ID
function selectPropertyById(propertyId) {
    console.log('Selecting property by ID:', propertyId);
    
    // First check if we have the property in our local cache
    const property = allProperties.find(p => p.id === propertyId);
    
    if (property) {
        console.log('Property found in local cache:', property);
        
        // Check if we have a GeoJSON feature for this property
        if (parcelsLayer) {
            let foundFeature = null;
            
            parcelsLayer.eachLayer(layer => {
                if (layer.feature && layer.feature.properties.id === propertyId) {
                    foundFeature = layer.feature;
                    
                    // Zoom to the feature
                    map.setView([property.geo_latitude, property.geo_longitude], 15);
                    
                    // Open popup
                    layer.openPopup();
                    
                    // Set as selected
                    selectedParcel = foundFeature;
                    
                    // Update UI
                    updatePropertyDetails(foundFeature);
                    updateSelectedPropertySidebar(foundFeature);
                }
            });
            
            if (!foundFeature) {
                console.log('Property found but no corresponding layer. May be missing coordinates.');
                
                // Create a temporary feature object to display details
                const tempFeature = {
                    properties: {
                        id: property.id,
                        property_address: property.property_address,
                        area_sqft: property.area_sqft,
                        survey_number: property.survey_number,
                        document_hash: property.document_hash,
                        created_at: property.created_at,
                        updated_at: property.updated_at,
                        owner_id: property.owner_id
                    }
                };
                
                selectedParcel = tempFeature;
                updatePropertyDetails(tempFeature);
                updateSelectedPropertySidebar(tempFeature);
            }
        } else {
            console.log('Parcel layer not initialized yet.');
            
            // Switch to land records tab first
            const landRecordsTab = document.querySelector('.nav-item[data-page="land-records"]');
            if (landRecordsTab) {
                landRecordsTab.click();
            }
            
            // Load records and try selection again
            loadLandRecords().then(() => {
                // Try selection again after records are loaded
                setTimeout(() => selectPropertyById(propertyId), 500);
            });
        }
    } else {
        console.log('Property not found in local cache. Fetching from API...');
        
        // If not in local cache, fetch from API
        api.getLandRecord(propertyId)
            .then(recordData => {
                console.log('Property fetched from API:', recordData);
                
                // Add to local cache
                allProperties.push(recordData);
                
                // Try selection again
                selectPropertyById(propertyId);
            })
            .catch(error => {
                console.error('Failed to fetch property:', error);
                alert(`Property with ID ${propertyId} could not be found.`);
            });
    }
}

// Update the selected property in the sidebar
function updateSelectedPropertySidebar(feature) {
    const selectedProperty = document.querySelector('.selected-property');
    if (!selectedProperty) return;
    
    const address = feature.properties.property_address.split(',')[0];
    const surveyNumber = feature.properties.survey_number;
    
    selectedProperty.innerHTML = `
        <h3>Selected Property</h3>
        <p><strong>${address}</strong></p>
        <p>Survey #: ${surveyNumber}</p>
        <button class="view-details-btn" onclick="focusPropertyDetails()">View Details</button>
        <button class="add-property-btn">Add New Property</button>
    `;
}

// Focus on property details panel (for mobile)
function focusPropertyDetails() {
    const propertyDetails = document.querySelector('.property-details');
    if (propertyDetails) {
        propertyDetails.classList.add('active');
    }
}