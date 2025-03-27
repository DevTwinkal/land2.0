// Enhanced Reports Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize reports features when the reports page is activated
    initSidebarEvents();
    
    function initSidebarEvents() {
      // Add event listeners to sidebar items
      const reportsNavItem = document.querySelector('.nav-item[data-page="reports"]');
      if (reportsNavItem) {
        reportsNavItem.addEventListener('click', initReportsPage);
      }
    }
    
    // Initialize the reports page
    function initReportsPage() {
      console.log('Initializing Reports page...');
      const reportsContainer = document.getElementById('reports-container');
      
      if (!reportsContainer) {
        console.error('Reports container not found');
        return;
      }
      
      // Create reports UI
      reportsContainer.innerHTML = `
        <div class="reports-ui">
          <div class="reports-header">
            <h3>Land Records Reports</h3>
            <p>Generate and view reports about land records and transactions.</p>
          </div>
          
          <div class="reports-options">
            <div class="report-option-card" data-report="property">
              <div class="report-icon">📊</div>
              <h4>Property Inventory</h4>
              <p>All registered properties with ownership information</p>
              <button class="generate-report-btn">Generate Report</button>
            </div>
            
            <div class="report-option-card" data-report="transactions">
              <div class="report-icon">📝</div>
              <h4>Transaction History</h4>
              <p>History of property transfers and ownership changes</p>
              <button class="generate-report-btn">Generate Report</button>
            </div>
            
            <div class="report-option-card" data-report="verification">
              <div class="report-icon">✓</div>
              <h4>Verification Report</h4>
              <p>Document verification status and property validation</p>
              <button class="generate-report-btn">Generate Report</button>
            </div>
            
            <div class="report-option-card" data-report="analytics">
              <div class="report-icon">📈</div>
              <h4>Analytics Dashboard</h4>
              <p>Statistical overview of land records and transactions</p>
              <button class="generate-report-btn">Generate Report</button>
            </div>
          </div>
          
          <div class="report-filters">
            <h4>Report Filters</h4>
            <form id="report-filters-form">
              <div class="filters-grid">
                <div class="form-group">
                  <label for="date-range">Date Range</label>
                  <select id="date-range" name="date_range">
                    <option value="all_time">All Time</option>
                    <option value="last_7_days">Last 7 Days</option>
                    <option value="last_30_days">Last 30 Days</option>
                    <option value="last_90_days">Last 90 Days</option>
                    <option value="last_year">Last Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                
                <div class="form-group date-range-inputs" style="display: none;">
                  <label for="start-date">Start Date</label>
                  <input type="date" id="start-date" name="start_date">
                </div>
                
                <div class="form-group date-range-inputs" style="display: none;">
                  <label for="end-date">End Date</label>
                  <input type="date" id="end-date" name="end_date">
                </div>
                
                <div class="form-group">
                  <label for="property-filter">Property</label>
                  <select id="property-filter" name="property_id">
                    <option value="all">All Properties</option>
                    <!-- Properties will be populated here -->
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="type-filter">Type</label>
                  <select id="type-filter" name="type">
                    <option value="all">All Types</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="agricultural">Agricultural</option>
                    <option value="industrial">Industrial</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="status-filter">Status</label>
                  <select id="status-filter" name="status">
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="disputed">Disputed</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
          
          <div class="report-viewer" id="report-viewer">
            <!-- Generated report will be displayed here -->
            <div class="report-placeholder">
              <div class="placeholder-icon">📄</div>
              <p>Select a report type and click "Generate Report" to view.</p>
            </div>
          </div>
        </div>
      `;
      
      // Initialize report options
      initReportOptions();
      
      // Initialize date range filter
      initDateRangeFilter();
      
      // Populate property filter
      populatePropertyFilter();
    }
    
    // Initialize report option cards
    function initReportOptions() {
      const reportCards = document.querySelectorAll('.report-option-card');
      
      let activeReportType = null;
      
      reportCards.forEach(card => {
        const generateBtn = card.querySelector('.generate-report-btn');
        
        card.addEventListener('click', function() {
          // Toggle active state
          reportCards.forEach(c => c.classList.remove('active'));
          this.classList.add('active');
          
          // Store the selected report type
          activeReportType = this.getAttribute('data-report');
        });
        
        if (generateBtn) {
          generateBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card click
            
            const reportType = card.getAttribute('data-report');
            generateReport(reportType);
          });
        }
      });
    }
    
    // Initialize date range filter
    function initDateRangeFilter() {
      const dateRangeSelect = document.getElementById('date-range');
      const dateRangeInputs = document.querySelectorAll('.date-range-inputs');
      const startDateInput = document.getElementById('start-date');
      const endDateInput = document.getElementById('end-date');
      
      if (dateRangeSelect) {
        dateRangeSelect.addEventListener('change', function() {
          const showCustomRange = this.value === 'custom';
          
          dateRangeInputs.forEach(input => {
            input.style.display = showCustomRange ? 'block' : 'none';
          });
          
          if (showCustomRange) {
            // Set default date range (last 30 days)
            const today = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);
            
            startDateInput.valueAsDate = thirtyDaysAgo;
            endDateInput.valueAsDate = today;
          }
        });
      }
    }
    
    // Populate property filter dropdown
    async function populatePropertyFilter() {
      const propertySelect = document.getElementById('property-filter');
      if (!propertySelect) return;
      
      try {
        const properties = await fetchProperties();
        
        // Add property options
        properties.forEach(property => {
          const option = document.createElement('option');
          option.value = property.id;
          option.textContent = `${property.property_address} (${property.survey_number})`;
          propertySelect.appendChild(option);
        });
      } catch (error) {
        console.error('Failed to load properties for filter:', error);
        propertySelect.innerHTML += '<option disabled>Failed to load properties</option>';
      }
    }
    
    // Generate the selected report
    async function generateReport(reportType) {
      const reportViewer = document.getElementById('report-viewer');
      if (!reportViewer) return;
      
      // Show loading state
      reportViewer.innerHTML = '<div class="loading-spinner"></div><p class="text-center">Generating report...</p>';
      
      // Get filter values
      const filters = getReportFilters();
      
      try {
        let reportData;
        
        switch (reportType) {
          case 'property':
            reportData = await fetchPropertyReport(filters);
            displayPropertyReport(reportData);
            break;
          case 'transactions':
            reportData = await fetchTransactionReport(filters);
            displayTransactionReport(reportData);
            break;
          case 'verification':
            reportData = await fetchVerificationReport(filters);
            displayVerificationReport(reportData);
            break;
          case 'analytics':
            reportData = await fetchAnalyticsData(filters);
            displayAnalyticsDashboard(reportData);
            break;
          default:
            throw new Error('Invalid report type');
        }
      } catch (error) {
        console.error(`Failed to generate ${reportType} report:`, error);
        reportViewer.innerHTML = `
          <div class="report-error">
            <div class="error-icon">❌</div>
            <h4>Report Generation Failed</h4>
            <p>${error.message || 'An error occurred while generating the report. Please try again.'}</p>
            <button class="retry-btn" onclick="generateReport('${reportType}')">Retry</button>
          </div>
        `;
      }
    }
    
    // Get report filters from form
    function getReportFilters() {
      const dateRange = document.getElementById('date-range').value;
      const startDate = document.getElementById('start-date').value;
      const endDate = document.getElementById('end-date').value;
      const propertyId = document.getElementById('property-filter').value;
      const propertyType = document.getElementById('type-filter').value;
      const status = document.getElementById('status-filter').value;
      
      return {
        date_range: dateRange,
        start_date: startDate,
        end_date: endDate,
        property_id: propertyId,
        property_type: propertyType,
        status: status
      };
    }
    
    // Display property inventory report
    function displayPropertyReport(data) {
      const reportViewer = document.getElementById('report-viewer');
      if (!reportViewer) return;
      
      if (!data || !data.properties || data.properties.length === 0) {
        reportViewer.innerHTML = `
          <div class="report-no-data">
            <div class="no-data-icon">📊</div>
            <h4>No Properties Found</h4>
            <p>No properties match the selected filters. Try changing your filters or adding new properties.</p>
          </div>
        `;
        return;
      }
      
      // Create the report content
      const reportContent = document.createElement('div');
      reportContent.className = 'report-content';
      
      // Add report header
      reportContent.innerHTML = `
        <div class="report-content-header">
          <h4>Property Inventory Report</h4>
          <div class="report-actions">
            <button class="report-action" id="export-csv">Export CSV</button>
            <button class="report-action" id="print-report">Print</button>
          </div>
        </div>
        <div class="report-summary">
          <div class="summary-item">
            <span class="summary-value">${data.properties.length}</span>
            <span class="summary-label">Total Properties</span>
          </div>
          <div class="summary-item">
            <span class="summary-value">${data.totalArea || 0}</span>
            <span class="summary-label">Total Area</span>
          </div>
          <div class="summary-item">
            <span class="summary-value">${data.totalOwners || 0}</span>
            <span class="summary-label">Unique Owners</span>
          </div>
          <div class="summary-item">
            <span class="summary-value">${data.averagePropertyValue || 'N/A'}</span>
            <span class="summary-label">Avg. Property Value</span>
          </div>
        </div>
      `;
      
      // Create the properties table
      const table = document.createElement('table');
      table.className = 'report-table properties-table';
      
      // Table header
      table.innerHTML = `
        <thead>
          <tr>
            <th>Survey Number</th>
            <th>Address</th>
            <th>Area</th>
            <th>Type</th>
            <th>Owner</th>
            <th>Registration Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${data.properties.map(property => `
            <tr>
              <td>${property.survey_number}</td>
              <td>${property.property_address}</td>
              <td>${property.property_area} ${property.property_area_unit}</td>
              <td>${property.property_type || 'N/A'}</td>
              <td>${property.owner_name || property.owner_id}</td>
              <td>${formatDate(property.registration_date)}</td>
              <td>
                <span class="status-badge status-${property.status || 'active'}">${property.status || 'Active'}</span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      `;
      
      reportContent.appendChild(table);
      
      // Add the report content to the viewer
      reportViewer.innerHTML = '';
      reportViewer.appendChild(reportContent);
      
      // Add event handlers for export and print buttons
      document.getElementById('export-csv').addEventListener('click', () => exportReportCSV(data.properties, 'property_inventory'));
      document.getElementById('print-report').addEventListener('click', printReport);
    }
    
    // Display transaction history report
    function displayTransactionReport(data) {
      const reportViewer = document.getElementById('report-viewer');
      if (!reportViewer) return;
      
      if (!data || !data.transactions || data.transactions.length === 0) {
        reportViewer.innerHTML = `
          <div class="report-no-data">
            <div class="no-data-icon">📝</div>
            <h4>No Transactions Found</h4>
            <p>No property transactions match the selected filters. Try changing your filters or initiating new transactions.</p>
          </div>
        `;
        return;
      }
      
      // Create the report content
      const reportContent = document.createElement('div');
      reportContent.className = 'report-content';
      
      // Add report header
      reportContent.innerHTML = `
        <div class="report-content-header">
          <h4>Transaction History Report</h4>
          <div class="report-actions">
            <button class="report-action" id="export-csv">Export CSV</button>
            <button class="report-action" id="print-report">Print</button>
          </div>
        </div>
        <div class="report-summary">
          <div class="summary-item">
            <span class="summary-value">${data.transactions.length}</span>
            <span class="summary-label">Total Transactions</span>
          </div>
          <div class="summary-item">
            <span class="summary-value">${data.completedTransactions || 0}</span>
            <span class="summary-label">Completed</span>
          </div>
          <div class="summary-item">
            <span class="summary-value">${data.pendingTransactions || 0}</span>
            <span class="summary-label">Pending</span>
          </div>
          <div class="summary-item">
            <span class="summary-value">${formatDate(data.lastTransactionDate) || 'N/A'}</span>
            <span class="summary-label">Latest Transaction</span>
          </div>
        </div>
      `;
      
      // Create the transactions table
      const table = document.createElement('table');
      table.className = 'report-table transactions-table';
      
      // Table header
      table.innerHTML = `
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Property</th>
            <th>Type</th>
            <th>From</th>
            <th>To</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${data.transactions.map(transaction => `
            <tr>
              <td>${transaction.transaction_id}</td>
              <td>${transaction.property_address || transaction.property_id}</td>
              <td>${transaction.transaction_type}</td>
              <td>${transaction.from_owner || transaction.previous_owner_id}</td>
              <td>${transaction.to_owner || transaction.new_owner_id}</td>
              <td>${formatDate(transaction.transaction_date)}</td>
              <td>
                <span class="status-badge status-${transaction.status}">${transaction.status}</span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      `;
      
      reportContent.appendChild(table);
      
      // Add the report content to the viewer
      reportViewer.innerHTML = '';
      reportViewer.appendChild(reportContent);
      
      // Add event handlers for export and print buttons
      document.getElementById('export-csv').addEventListener('click', () => exportReportCSV(data.transactions, 'transaction_history'));
      document.getElementById('print-report').addEventListener('click', printReport);
    }
    
    // Display verification report
    function displayVerificationReport(data) {
      const reportViewer = document.getElementById('report-viewer');
      if (!reportViewer) return;
      
      if (!data || !data.verifications || data.verifications.length === 0) {
        reportViewer.innerHTML = `
          <div class="report-no-data">
            <div class="no-data-icon">✓</div>
            <h4>No Verification Data Found</h4>
            <p>No verification records match the selected filters. Try changing your filters or verifying properties.</p>
          </div>
        `;
        return;
      }
      
      // Create the report content
      const reportContent = document.createElement('div');
      reportContent.className = 'report-content';
      
      // Add report header
      reportContent.innerHTML = `
        <div class="report-content-header">
          <h4>Verification Report</h4>
          <div class="report-actions">
            <button class="report-action" id="export-csv">Export CSV</button>
            <button class="report-action" id="print-report">Print</button>
          </div>
        </div>
        <div class="report-summary">
          <div class="summary-item">
            <span class="summary-value">${data.verifications.length}</span>
            <span class="summary-label">Total Verifications</span>
          </div>
          <div class="summary-item">
            <span class="summary-value">${data.successfulVerifications || 0}</span>
            <span class="summary-label">Successful</span>
          </div>
          <div class="summary-item">
            <span class="summary-value">${data.failedVerifications || 0}</span>
            <span class="summary-label">Failed</span>
          </div>
          <div class="summary-item">
            <span class="summary-value">${formatDate(data.lastVerificationDate) || 'N/A'}</span>
            <span class="summary-label">Latest Verification</span>
          </div>
        </div>
      `;
      
      // Create the verifications table
      const table = document.createElement('table');
      table.className = 'report-table verifications-table';
      
      // Table header
      table.innerHTML = `
        <thead>
          <tr>
            <th>Verification ID</th>
            <th>Type</th>
            <th>Target</th>
            <th>Date</th>
            <th>Result</th>
            <th>Verified By</th>
          </tr>
        </thead>
        <tbody>
          ${data.verifications.map(verification => `
            <tr>
              <td>${verification.verification_id}</td>
              <td>${verification.verification_type}</td>
              <td>${verification.target_id || verification.property_id || verification.document_id}</td>
              <td>${formatDate(verification.verification_date)}</td>
              <td>
                <span class="status-badge status-${verification.result}">${verification.result}</span>
              </td>
              <td>${verification.verified_by || 'System'}</td>
            </tr>
          `).join('')}
        </tbody>
      `;
      
      reportContent.appendChild(table);
      
      // Add the report content to the viewer
      reportViewer.innerHTML = '';
      reportViewer.appendChild(reportContent);
      
      // Add event handlers for export and print buttons
      document.getElementById('export-csv').addEventListener('click', () => exportReportCSV(data.verifications, 'verification_report'));
      document.getElementById('print-report').addEventListener('click', printReport);
    }
    
    // Display analytics dashboard
    function displayAnalyticsDashboard(data) {
      const reportViewer = document.getElementById('report-viewer');
      if (!reportViewer) return;
      
      if (!data) {
        reportViewer.innerHTML = `
          <div class="report-no-data">
            <div class="no-data-icon">📈</div>
            <h4>No Analytics Data Available</h4>
            <p>Unable to generate analytics. Try changing your filters or adding more properties.</p>
          </div>
        `;
        return;
      }
      
      // Create the dashboard content
      const dashboardContent = document.createElement('div');
      dashboardContent.className = 'analytics-dashboard';
      
      // Add dashboard header
      dashboardContent.innerHTML = `
        <div class="report-content-header">
          <h4>Land Records Analytics Dashboard</h4>
          <div class="report-actions">
            <button class="report-action" id="export-analytics">Export Data</button>
            <button class="report-action" id="print-report">Print</button>
          </div>
        </div>
        
        <div class="analytics-cards">
          <div class="analytics-card">
            <h5>Property Overview</h5>
            <div class="analytics-card-content">
              <div class="analytics-stat">
                <span class="stat-value">${data.totalProperties || 0}</span>
                <span class="stat-label">Total Properties</span>
              </div>
              <div class="analytics-stat">
                <span class="stat-value">${data.totalArea || 0}</span>
                <span class="stat-label">Total Area (sq.ft)</span>
              </div>
              <div class="analytics-stat">
                <span class="stat-value">${data.propertiesVerified || 0}</span>
                <span class="stat-label">Verified Properties</span>
              </div>
            </div>
          </div>
          
          <div class="analytics-card">
            <h5>Transaction Activity</h5>
            <div class="analytics-card-content">
              <div class="analytics-stat">
                <span class="stat-value">${data.totalTransactions || 0}</span>
                <span class="stat-label">Total Transactions</span>
              </div>
              <div class="analytics-stat">
                <span class="stat-value">${data.pendingTransactions || 0}</span>
                <span class="stat-label">Pending</span>
              </div>
              <div class="analytics-stat">
                <span class="stat-value">${data.transactionsThisMonth || 0}</span>
                <span class="stat-label">This Month</span>
              </div>
            </div>
          </div>
          
          <div class="analytics-card">
            <h5>Document Statistics</h5>
            <div class="analytics-card-content">
              <div class="analytics-stat">
                <span class="stat-value">${data.totalDocuments || 0}</span>
                <span class="stat-label">Total Documents</span>
              </div>
              <div class="analytics-stat">
                <span class="stat-value">${data.documentsVerified || 0}</span>
                <span class="stat-label">Verified</span>
              </div>
              <div class="analytics-stat">
                <span class="stat-value">${data.documentsPending || 0}</span>
                <span class="stat-label">Pending</span>
              </div>
            </div>
          </div>
          
          <div class="analytics-card">
            <h5>Verification Activity</h5>
            <div class="analytics-card-content">
              <div class="analytics-stat">
                <span class="stat-value">${data.totalVerifications || 0}</span>
                <span class="stat-label">Total Verifications</span>
              </div>
              <div class="analytics-stat">
                <span class="stat-value">${data.successVerificationRate || '0%'}</span>
                <span class="stat-label">Success Rate</span>
              </div>
              <div class="analytics-stat">
                <span class="stat-value">${data.averageVerificationTime || 'N/A'}</span>
                <span class="stat-label">Avg. Time</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="analytics-charts">
          <div class="analytics-chart-container">
            <h5>Property Distribution by Type</h5>
            <div class="chart-container" id="property-type-chart">
              <canvas id="propertyTypeChart"></canvas>
            </div>
          </div>
          
          <div class="analytics-chart-container">
            <h5>Transaction Trend</h5>
            <div class="chart-container" id="transaction-trend-chart">
              <canvas id="transactionTrendChart"></canvas>
            </div>
          </div>
        </div>
      `;
      
      // Add the dashboard content to the viewer
      reportViewer.innerHTML = '';
      reportViewer.appendChild(dashboardContent);
      
      // Add event handlers for export and print buttons
      document.getElementById('export-analytics').addEventListener('click', () => exportAnalyticsData(data));
      document.getElementById('print-report').addEventListener('click', printReport);
      
      // Create charts after DOM is updated
      setTimeout(() => {
        createPropertyTypeChart(data.propertyTypeDistribution);
        createTransactionTrendChart(data.transactionTrend);
      }, 100);
    }
    
    // Create property type distribution chart
    function createPropertyTypeChart(propertyTypeData) {
      const ctx = document.getElementById('propertyTypeChart');
      if (!ctx) return;
      
      // Default data if no real data available
      const chartData = propertyTypeData || {
        labels: ['Residential', 'Commercial', 'Agricultural', 'Industrial'],
        data: [65, 15, 12, 8]
      };
      
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: chartData.labels,
          datasets: [{
            data: chartData.data,
            backgroundColor: [
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 99, 132, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(255, 159, 64, 0.7)'
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
    
    // Create transaction trend chart
    function createTransactionTrendChart(trendData) {
      const ctx = document.getElementById('transactionTrendChart');
      if (!ctx) return;
      
      // Default data if no real data available
      const defaultMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const chartData = trendData || {
        labels: defaultMonths,
        datasets: [
          {
            label: 'Transactions',
            data: [12, 19, 15, 28, 22, 30],
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.4
          }
        ]
      };
      
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: chartData.datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
    
    // Export report data as CSV
    function exportReportCSV(data, filename) {
      if (!data || !data.length) {
        showNotification('No data to export', 'warning');
        return;
      }
      
      // Get headers from first object
      const headers = Object.keys(data[0]);
      
      // Create CSV content
      let csvContent = headers.join(',') + '\n';
      
      // Add rows
      data.forEach(item => {
        const row = headers.map(header => {
          // Format the value and handle commas, quotes, etc.
          let value = item[header];
          
          // Handle dates
          if (value && typeof value === 'string' && value.includes('T')) {
            try {
              value = formatDate(value);
            } catch (e) {
              // Keep original value if not a valid date
            }
          }
          
          // Handle values with commas or quotes
          value = String(value).replace(/"/g, '""');
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            value = `"${value}"`;
          }
          
          return value;
        }).join(',');
        
        csvContent += row + '\n';
      });
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${formatDateForFilename(new Date())}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification('Report exported successfully', 'success');
    }
    
    // Export analytics data
    function exportAnalyticsData(data) {
      // Create flattened data object
      const flatData = {
        report_date: formatDate(new Date()),
        total_properties: data.totalProperties || 0,
        total_area: data.totalArea || 0,
        properties_verified: data.propertiesVerified || 0,
        total_transactions: data.totalTransactions || 0,
        pending_transactions: data.pendingTransactions || 0,
        transactions_this_month: data.transactionsThisMonth || 0,
        total_documents: data.totalDocuments || 0,
        documents_verified: data.documentsVerified || 0,
        documents_pending: data.documentsPending || 0,
        total_verifications: data.totalVerifications || 0,
        success_verification_rate: data.successVerificationRate || '0%',
        average_verification_time: data.averageVerificationTime || 'N/A'
      };
      
      // Export as CSV
      exportReportCSV([flatData], 'analytics_dashboard');
    }
    
    // Print report
    function printReport() {
      window.print();
    }
    
    // Helper function to format dates
    function formatDate(dateString) {
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    
    // Format date for filenames
    function formatDateForFilename(date) {
      return date.toISOString().split('T')[0];
    }
    
    // API Functions
    async function fetchProperties() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required');
        }
        
        const response = await fetch('/api/land-records', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error in fetchProperties:', error);
        // For testing: return mock data if API is not available
        return [
          { id: 'prop1', property_address: '123 Main St, City', survey_number: 'SUR123' },
          { id: 'prop2', property_address: '456 Oak Ave, Town', survey_number: 'SUR456' }
        ];
      }
    }
    
    async function fetchPropertyReport(filters) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required');
        }
        
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`/api/reports/properties?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch property report');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error in fetchPropertyReport:', error);
        // For testing: return mock data if API is not available
        return {
          properties: [
            {
              id: 'prop1',
              survey_number: 'SUR123',
              property_address: '123 Main St, Cityville',
              property_area: '1,000',
              property_area_unit: 'sq ft',
              property_type: 'Residential',
              owner_name: 'John Doe',
              owner_id: 'user123',
              registration_date: new Date().toISOString(),
              status: 'active'
            },
            {
              id: 'prop2',
              survey_number: 'SUR456',
              property_address: '456 Oak Ave, Townsville',
              property_area: '2,500',
              property_area_unit: 'sq ft',
              property_type: 'Commercial',
              owner_name: 'Jane Smith',
              owner_id: 'user456',
              registration_date: new Date().toISOString(),
              status: 'active'
            },
            {
              id: 'prop3',
              survey_number: 'SUR789',
              property_address: '789 Pine Rd, Villagetown',
              property_area: '5,000',
              property_area_unit: 'sq ft',
              property_type: 'Agricultural',
              owner_name: 'Bob Johnson',
              owner_id: 'user789',
              registration_date: new Date().toISOString(),
              status: 'pending'
            }
          ],
          totalArea: '8,500 sq ft',
          totalOwners: 3,
          averagePropertyValue: '$250,000'
        };
      }
    }
    
    async function fetchTransactionReport(filters) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required');
        }
        
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`/api/reports/transactions?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch transaction report');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error in fetchTransactionReport:', error);
        // For testing: return mock data if API is not available
        const mockDate = new Date();
        const lastMonth = new Date(mockDate);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        
        return {
          transactions: [
            {
              transaction_id: 'TRANS-001',
              property_id: 'prop1',
              property_address: '123 Main St, Cityville',
              transaction_type: 'Sale',
              previous_owner_id: 'user123',
              from_owner: 'John Doe',
              new_owner_id: 'user456',
              to_owner: 'Jane Smith',
              transaction_date: mockDate.toISOString(),
              status: 'completed'
            },
            {
              transaction_id: 'TRANS-002',
              property_id: 'prop2',
              property_address: '456 Oak Ave, Townsville',
              transaction_type: 'Transfer',
              previous_owner_id: 'user456',
              from_owner: 'Jane Smith',
              new_owner_id: 'user789',
              to_owner: 'Bob Johnson',
              transaction_date: lastMonth.toISOString(),
              status: 'completed'
            },
            {
              transaction_id: 'TRANS-003',
              property_id: 'prop3',
              property_address: '789 Pine Rd, Villagetown',
              transaction_type: 'Sale',
              previous_owner_id: 'user789',
              from_owner: 'Bob Johnson',
              new_owner_id: 'user123',
              to_owner: 'John Doe',
              transaction_date: mockDate.toISOString(),
              status: 'pending'
            }
          ],
          completedTransactions: 2,
          pendingTransactions: 1,
          lastTransactionDate: mockDate.toISOString()
        };
      }
    }
    
    async function fetchVerificationReport(filters) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required');
        }
        
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`/api/reports/verifications?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch verification report');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error in fetchVerificationReport:', error);
        // For testing: return mock data if API is not available
        const mockDate = new Date();
        
        return {
          verifications: [
            {
              verification_id: 'VER-001',
              verification_type: 'Property',
              target_id: 'prop1',
              verification_date: mockDate.toISOString(),
              result: 'success',
              verified_by: 'Admin'
            },
            {
              verification_id: 'VER-002',
              verification_type: 'Document',
              target_id: 'doc1',
              document_id: 'doc1',
              verification_date: mockDate.toISOString(),
              result: 'success',
              verified_by: 'System'
            },
            {
              verification_id: 'VER-003',
              verification_type: 'Transaction',
              target_id: 'TRANS-001',
              verification_date: mockDate.toISOString(),
              result: 'failed',
              verified_by: 'User'
            }
          ],
          successfulVerifications: 2,
          failedVerifications: 1,
          lastVerificationDate: mockDate.toISOString()
        };
      }
    }
    
    async function fetchAnalyticsData(filters) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required');
        }
        
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`/api/reports/analytics?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error in fetchAnalyticsData:', error);
        // For testing: return mock data if API is not available
        return {
          totalProperties: 25,
          totalArea: 45000,
          propertiesVerified: 20,
          totalTransactions: 18,
          pendingTransactions: 3,
          transactionsThisMonth: 5,
          totalDocuments: 42,
          documentsVerified: 38,
          documentsPending: 4,
          totalVerifications: 65,
          successVerificationRate: '92%',
          averageVerificationTime: '2.3 mins',
          propertyTypeDistribution: {
            labels: ['Residential', 'Commercial', 'Agricultural', 'Industrial'],
            data: [60, 25, 10, 5]
          },
          transactionTrend: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                label: 'Transactions',
                data: [3, 5, 2, 7, 4, 8],
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                tension: 0.4
              }
            ]
          }
        };
      }
    }
    
    // Notification function
    function showNotification(message, type = 'info') {
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
  });