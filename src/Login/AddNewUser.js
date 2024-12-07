import { Grid, TextField, Box, Typography, MenuItem, Button, FormControl, InputLabel, Select, FormGroup, FormControlLabel, Checkbox, CircularProgress } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import React, {useCallback, useEffect, useState} from 'react';
import dayjs from 'dayjs';
import { decryptData, encryptData } from '../Helper/Secure'
import { storeData } from '../Helper/ApiHelper';
import { useLocation, useNavigate } from 'react-router-dom';
import './Login.css';

function AddNewUser({ 
    user_Id, 
    phoneNumber, 
    isParent, 
    parentId, 
    editData, 
    setContentVisible, 
    onSuccess,
    isEdit
}) {
    const location = useLocation();
    const { userId, phone } = location.state || {};

    const [userData, setUserData] = useState(editData ? editData : {
        userId: userId?userId:user_Id,
        isAdmin: false,
        isDeleted: false,
        lastUpdateDate: null,
        updatedBy: '',
        phone: phone?phone:phoneNumber,
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
    const [checked, setChecked] = useState(false);
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!location.state) {
            if (!sessionStorage.getItem('user')) {
                navigate('/login');
            }
        }
        
    }, [navigate]);

    // useEffect(() => {
    //     if (status!=='') {
    //         if (location.state !== null) {
    //             navigate('/');
    //         } else {
    //             setContentVisible(false);
    //         }

    //     }
    // }, [status]);

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

    const handleChecked = (event) => {
        setChecked(event.target.checked);
        if (event.target.checked) {
            const parentData = decryptData(sessionStorage.getItem('user'));
            setUserData((previousState) => ({
                ...previousState,
                building: parentData.building,
                street: parentData.street,
                city: parentData.city,
                state: parentData.state,
                pinCode: parentData.pinCode
            }));
        } else {
            setUserData((previousState) => ({
                ...previousState,
                building: '',
                street: '',
                city: '',
                state: '',
                pinCode: ''
            }));
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            var cipherData = null;
            if (isEdit) {
                const parentUser = decryptData(sessionStorage.getItem('user'));
                const updatedUserData = {
                    ...userData,
                    lastUpdateDate: dayjs(),
                    updatedBy: parentUser.name
                };
                cipherData = encryptData(updatedUserData);
            } else {
                cipherData = encryptData(userData);
            }

            const request = {
                userId: userId ? userId : user_Id,
                isAdmin: false,
                isParent: isParent,
                encryptedData: cipherData,
                parentId: isParent ? '' : parentId
            };

            const response = await storeData('store-user', request);
            
            if (isParent) {
                sessionStorage.setItem('user', cipherData);
            }

            if (location.state) {
                navigate('/');
            } else {
                if (onSuccess) {
                    await onSuccess();
                } else {
                    setContentVisible(false);
                }
            }
        } catch (error) {
            console.error('Error storing user:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', margin: '0 auto', maxHeight: '90vh', overflowY: 'auto', padding: 3, borderRadius: '8px' }}>
            <Typography variant='h6' gutterBottom align='center'>
                {(!isParent) || isEdit ? (isParent ? 'Your details' : 'Family member') : 'Add your details'}
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
                {(!isParent) &&
                    <FormGroup>
                        <FormControlLabel control={<Checkbox checked={checked} onChange={handleChecked} inputProps={{ 'aria-label': 'controlled' }} />} label="Same as Parent" />
                    </FormGroup>
                }
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

            {(!isParent) || isEdit ? (
                <div className='container'>
                    <Button 
                        variant="contained" 
                        color='primary' 
                        className='custom-button' 
                        sx={{mt:2}}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                                Updating...
                            </Box>
                        ) : 'Update'}
                    </Button>
                    <Button 
                        variant="contained" 
                        color='inherit' 
                        className='custom-button' 
                        sx={{mt:2}}
                        onClick={() => setContentVisible(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                </div>
            ) : (
                <div className='container'>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        className='custom-button' 
                        onClick={handleSubmit} 
                        fullWidth
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                                Submitting...
                            </Box>
                        ) : 'Submit'}
                    </Button>
                </div>
            )}
            
        </Box>
    );
}

export default AddNewUser;