import axios from 'axios';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from './FirebaseConfig';

const api_url = process.env.REACT_APP_API_URL;
const api_upload_file = process.env.REACT_APP_UPLOADFILE_API_URL;

export const fetchData = async(apiEndpoint) => {
    try {
        const response = await axios.get(api_url+apiEndpoint);

        return response.data;
    } catch(error) {
        console.error('Error fetching documents', error);
        throw error;
    }
};

export const fetchDataWithParam = async(apiEndpoint, param) => {
    try {
        const response = await axios.get(api_url+apiEndpoint, {
            params: {
                contentIn:param
            }
        });

        return response.data;
    } catch(error) {
        console.error('Error fetching documents', error);
        throw error;
    }
};

export const fetchMenuItem = async(apiEndpoint, param) => {
    try {
        const response = await axios.get(api_url+apiEndpoint, {
            params: {
                role: param
            }
        });

        return response.data;
    } catch(error) {
        console.error('Error fetching documents', error);
        throw error;
    }
};

export const updateUIData = async(apiEndpoint, param, contentIn) => {
    try {
        const response = await axios.post(api_url+apiEndpoint, param, {
            headers: {
                'Content-Type': 'application/json',
            },
            params: {
                contentIn: contentIn
            }
        });

        return response.status;
    } catch(error) {
        console.error('Error updating document', error);
        throw error;
    }
};

export const storeData = async(apiEndpoint, param) => {
    try {
        const response = await axios.post(api_url+apiEndpoint, param, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        return response.status;
    } catch(error) {
        console.error('Error updating document', error);
        throw error;
    }
};

export const fetchUserData = async(apiEndpoint, param) => {
    try {
        const response = await axios.get(api_url+apiEndpoint, {
            params: {
                userId: param
            }
        });

        return response.data;
    } catch(error) {
        console.error('Error fetching documents', error);
        throw error;
    }
};

export const uploadImage = async(apiEndpoint, file) => {
    try {
        const response = await axios.post(api_upload_file+apiEndpoint,file, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        const uploadedImageName = response.data;
        const fileRef = ref(storage, uploadedImageName);
        const url = await getDownloadURL(fileRef);
        return url;
    } catch(error) {
        console.error('Error uploading documents', error);
        throw error;
    }
}

export const maskImage = async(endpoint, formData) => {
    try {
        const response = await axios.post(api_upload_file+endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        return response.data;
    } catch(error) {
        console.error('Error masking image:', error);
        throw error;
    }
};
