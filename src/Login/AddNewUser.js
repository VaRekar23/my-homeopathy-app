import { Grid, TextField, Box, Typography, MenuItem, Button, FormControl, InputLabel, Select } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import React, {useCallback, useEffect, useState} from 'react';
import dayjs from 'dayjs';
import { encryptData } from '../Helper/Secure'
import { storeData } from '../Helper/ApiHelper';
import { useLocation, useNavigate } from 'react-router-dom';

function AddNewUser({ userId, phoneNumber, isParent, parentId, editData, setContentVisible}) {
    const location = useLocation();
    const { user, phone } = location.state || {};

    const [userData, setUserData] = useState(editData ? editData : {
        userId: isParent?user:userId,
        isAdmin: false,
        phone: isParent?phone:phoneNumber,
        name: '',
        occupation: '',
        dob: null,
        gender: '',
        building: '',
        street: '',
        city: '',
        state: '',
        pinCode: ''
    });
    const [status, setStatus] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (status!=='') {
            console.log('Status', status);
            if (isParent) {
                navigate('/');
            } else {
                setContentVisible(false);
            }

        }
    }, [status]);

    const handleOnChange = useCallback((e) => {
        const { name, value } = e.target;
        setUserData((previousState) => ({
            ...previousState,
            [name]: value
        }));

    }, []);

    const handleDOBChange = (newDob) => {
        const today = dayjs();
        if (newDob && newDob.isAfter(today)) {
            setUserData({ ...userData, dob: null });
        } else {
            setUserData({ ...userData, dob: newDob });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const cipherData = encryptData(userData);

        const request = {
            userId: isParent ? (user ? user : userId) : userId,
            isAdmin: false,
            isParent: isParent,
            encryptedData: cipherData,
            parentId: isParent ? '' : parentId
        }

        console.log('Store User', request);
        const response = storeData('store-user', request);
        sessionStorage.setItem('user', cipherData);
        setStatus(response);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', margin: '0 auto', maxHeight: '90vh', overflowY: 'auto', padding: 3, borderRadius: '8px' }}>
            <Typography variant='h6' gutterBottom align='center'>
                {isParent ? 'Add your details' : 'Add family member'}
            </Typography>
            <TextField label='Phone Number' value={userData.phone} fullWidth margin='normal' disabled variant="outlined" />
            <TextField label='Full Name' name='name' value={userData.name} 
                        onChange={handleOnChange} fullWidth margin='normal' />
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer components={['DatePicker']}>
                            <DatePicker label='Date of Birth' value={dayjs(userData.dob)} onChange={handleDOBChange} />
                        </DemoContainer>
                    </LocalizationProvider>
                </Grid>
                <Grid item xs={6}>
                    <FormControl variant='standard' fullWidth>
                            <InputLabel>Gender</InputLabel>
                            <Select name='gender'
                                    value={userData.gender}
                                    onChange={handleOnChange}>
                                <MenuItem value='male'>Male</MenuItem>
                                <MenuItem value='female'>Female</MenuItem>
                                <MenuItem value='other'>other</MenuItem>
                            </Select>
                        </FormControl>
                </Grid>
            </Grid>
            <TextField label='Occupation' name='occupation' value={userData.occupation} 
                        onChange={handleOnChange} fullWidth margin='normal' />

            <Box sx={{display:'flex', flexDirection: 'column', alignItems:'left', padding:2, border: '1px solid #ccc', borderRadius: '8px', width:'full', gap:2}}>
                <TextField label='Building' name='building' value={userData.building} 
                        onChange={handleOnChange} fullWidth margin='normal' />
                <TextField label='Street' name='street' value={userData.street} 
                        onChange={handleOnChange} fullWidth margin='normal' />
                <TextField label='City' name='city' value={userData.city} 
                        onChange={handleOnChange} fullWidth margin='normal' />
                <TextField label='Pin Code' name='pinCode' value={userData.pinCode} 
                        onChange={handleOnChange} fullWidth margin='normal' />
                <TextField label='State' name='state' value={userData.state} 
                        onChange={handleOnChange} fullWidth margin='normal' />
            </Box>

            <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>
                Submit
            </Button>
        </Box>
    );
}

export default AddNewUser;