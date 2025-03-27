// Map related functionality
let map;
let parcelsLayer;
let selectedParcel = null;

function initMap() {
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
    
    // Add layer control for different views (satellite, streets, etc)
    const baseMaps = {
        "Streets": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }),
        "Satellite": L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: '&copy; Google Maps'
        })
    };
    
    L.control.layers(baseMaps, null, {
        position: 'topright'
    }).addTo(map);
}

async function loadLandRecords() {
    try {
        const records = await api.getLandRecords();
        
        // Convert records to GeoJSON
        const geojsonFeatures = records.map(record => {
            // Skip records without coordinates
            if (!record.geo_latitude || !record.geo_longitude) return null;
            
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
                    status: "verified" // Default status, can be updated based on actual data
                },
                geometry: {
                    type: "Point",
                    coordinates: [record.geo_longitude, record.geo_latitude]
                }
            };
        }).filter(feature => feature !== null);
        
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
                        <h4>${feature.properties.property_address.split(',')[0]}</h4>
                        <p>${feature.properties.property_address.split(',').slice(1).join(',').trim()}</p>
                        <p><strong>Survey Number:</strong> ${feature.properties.survey_number}</p>
                        <p><strong>Area:</strong> ${feature.properties.area_sqft} sq.ft</p>
                    </div>
                `;
                layer.bindPopup(popupContent);
                
                // Add click handler
                layer.on('click', function() {
                    selectedParcel = feature;
                    updatePropertyDetails(feature);
                });
            }
        }).addTo(map);
        
        // Fit map to parcels if there are any
        if (geojsonFeatures.length > 0) {
            map.fitBounds(parcelsLayer.getBounds());
        }
    } catch (error) {
        console.error('Failed to load land records:', error);
        alert('Failed to load land records. Please try again later.');
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
                
                const docTypeDisplay = doc.document_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                
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
        
        // Update owner information
        // In a real app, you would fetch owner details from your API
        document.getElementById('owner-initials').textContent = 'OW'; // Placeholder
        document.getElementById('owner-name').textContent = 'Property Owner'; // Placeholder
        document.getElementById('owner-since').textContent = 'Owner since: ' + new Date(record.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
        
    } catch (error) {
        console.error('Failed to fetch property details:', error);
    }
}