import axios from 'axios';

const api_url = process.env.REACT_APP_API_URL;

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
