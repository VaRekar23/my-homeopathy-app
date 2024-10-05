import { Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { decryptData, encryptData } from '../../Helper/Secure';
import { storeData } from '../../Helper/ApiHelper';

function Dashboard({userDetails}) {
    const [userData, setUserData] = useState(decryptData(userDetails));
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (status!=='') {
            setLoading(false);
        }
    }, [status]);

    const handleOnChange = useCallback((e) => {
        const { name, value } = e.target;
        setUserData((previousState) => ({
            ...previousState,
            [name]: value
        }));

    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        const cipherData = encryptData(userData);

        const request = {
            userId: userData.userId,
            isAdmin: userData.isAdmin,
            isParent: true,
            encryptedData: cipherData,
            parentId: ''
        }

        const response = storeData('store-user', request);
        sessionStorage.setItem('user', cipherData);
        setStatus(response);
    };

    return (
        <>
            <Box sx={{display:'flex', flexDirection: 'row', alignItems:'left', padding:2, border: '1px solid #ccc', borderRadius: '8px', gap:2}}>
                <FormControl variant='standard' sx={{ minWidth: 200 }}>
                            <InputLabel>Are you Admin?</InputLabel>
                            <Select name='isAdmin'
                                    value={userData.isAdmin}
                                    onChange={handleOnChange}>
                                <MenuItem value='true'>Yes</MenuItem>
                                <MenuItem value='false'>No</MenuItem>
                            </Select>
                        </FormControl>
                
                <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ marginLeft: 'auto' }}>
                    {loading ? <CircularProgress size={24} /> : 'Save'}
                </Button>
            </Box>
        </>
    );
}

export default Dashboard;