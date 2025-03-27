// API base URL
const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with base configuration
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token to requests
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// API service object
const api = {
    // Authentication
    login: async (username, password) => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        
        try {
            console.log(`Sending login request to ${API_BASE_URL}/token`);
            const response = await axios.post(`${API_BASE_URL}/token`, formData);
            return response.data;
        } catch (error) {
            console.error('Login error details:', error);
            throw new Error(error.response?.data?.detail || 'Login failed. Check your credentials and try again.');
        }
    },
    
    register: async (userData) => {
        try {
            console.log('Sending registration request with data:', {...userData, password: '***HIDDEN***'});
            const response = await axiosInstance.post('/register', userData);
            return response.data;
        } catch (error) {
            console.error('Registration error details:', error);
            throw new Error(error.response?.data?.detail || 'Registration failed. Please check your information.');
        }
    },
    
    getCurrentUser: async () => {
        try {
            console.log('Fetching current user profile');
            const response = await axiosInstance.get('/users/me');
            return response.data;
        } catch (error) {
            console.error('Failed to get current user:', error);
            return null;
        }
    },
    
    // Land Records
    getLandRecords: async () => {
        try {
            console.log('Fetching land records');
            const response = await axiosInstance.get('/land-records');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch land records:', error);
            throw new Error(error.response?.data?.detail || 'Failed to fetch land records');
        }
    },
    
    getLandRecord: async (recordId) => {
        try {
            console.log(`Fetching land record details for ID: ${recordId}`);
            const response = await axiosInstance.get(`/land-records/${recordId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch land record:', error);
            throw new Error(error.response?.data?.detail || 'Failed to fetch land record');
        }
    },
    
    createLandRecord: async (landRecordData) => {
        try {
            console.log('Creating new land record with data:', landRecordData);
            const response = await axiosInstance.post('/land-records', landRecordData);
            return response.data;
        } catch (error) {
            console.error('Failed to create land record:', error);
            throw new Error(error.response?.data?.detail || 'Failed to create land record');
        }
    },
    
    // Documents
    getDocuments: async (landId) => {
        try {
            console.log(`Fetching documents for land ID: ${landId}`);
            const response = await axiosInstance.get(`/land-records/${landId}/documents`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch documents:', error);
            throw new Error(error.response?.data?.detail || 'Failed to fetch documents');
        }
    },
    
    uploadDocument: async (landId, documentType, file) => {
        try {
            console.log(`Uploading document for land ID: ${landId}, type: ${documentType}`);
            const formData = new FormData();
            formData.append('document_type', documentType);
            formData.append('file', file);
            
            const response = await axios.post(
                `${API_BASE_URL}/land-records/${landId}/documents`, 
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Failed to upload document:', error);
            throw new Error(error.response?.data?.detail || 'Failed to upload document');
        }
    },
    
    // Mutations
    getMutations: async () => {
        try {
            console.log('Fetching mutations');
            const response = await axiosInstance.get('/mutations');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch mutations:', error);
            throw new Error(error.response?.data?.detail || 'Failed to fetch mutations');
        }
    },
    
    createMutation: async (mutationData) => {
        try {
            console.log('Creating new mutation with data:', mutationData);
            const response = await axiosInstance.post('/mutations', mutationData);
            return response.data;
        } catch (error) {
            console.error('Failed to create mutation:', error);
            throw new Error(error.response?.data?.detail || 'Failed to create mutation');
        }
    }
};