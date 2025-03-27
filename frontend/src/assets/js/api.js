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
            const response = await axios.post(`${API_BASE_URL}/token`, formData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Login failed');
        }
    },
    
    register: async (userData) => {
        try {
            const response = await axiosInstance.post('/register', userData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Registration failed');
        }
    },
    
    getCurrentUser: async () => {
        try {
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
            const response = await axiosInstance.get('/land-records');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to fetch land records');
        }
    },
    
    getLandRecord: async (recordId) => {
        try {
            const response = await axiosInstance.get(`/land-records/${recordId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to fetch land record');
        }
    },
    
    createLandRecord: async (landRecordData) => {
        try {
            const response = await axiosInstance.post('/land-records', landRecordData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to create land record');
        }
    },
    
    // Documents
    getDocuments: async (landId) => {
        try {
            const response = await axiosInstance.get(`/land-records/${landId}/documents`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to fetch documents');
        }
    },
    
    uploadDocument: async (landId, documentType, file) => {
        try {
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
            throw new Error(error.response?.data?.detail || 'Failed to upload document');
        }
    },
    
    // Mutations
    getMutations: async () => {
        try {
            const response = await axiosInstance.get('/mutations');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to fetch mutations');
        }
    },
    
    createMutation: async (mutationData) => {
        try {
            const response = await axiosInstance.post('/mutations', mutationData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to create mutation');
        }
    }
};