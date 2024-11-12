import { Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, Switch, Typography, Card, CardContent, FormGroup, FormControlLabel, Grid, TextField, Divider, Paper } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { decryptData, encryptData } from '../../Helper/Secure';
import { fetchData, storeData } from '../../Helper/ApiHelper';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import dayjs from 'dayjs';

function Dashboard({userDetails}) {
    //const [userData, setUserData] = useState(decryptData(userDetails));
    const [userData, setUserData] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [commonCharge, setCommonCharge] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState('');

    useEffect(() => {
        const getDashboardDetails = async () => {
            try {
                const dashboardDetails = await fetchData('get-admindashboard');
                setDashboardData(dashboardDetails);
                setCommonCharge({
                    consultationCharge: dashboardDetails.consultationCharge,
                    isDiscount: dashboardDetails.isDiscount,
                    discountTillDate: dashboardDetails.isDiscount ? dayjs(dashboardDetails.discountTillDate) : dayjs(),
                    discountPercentage: dashboardDetails.discountPercentage,
                    deliveryCharge: dashboardDetails.deliveryCharge
                });
            } catch(error) {
                console.error('Error fetching documents', error);
            } finally {
                setIsLoading(false);
            }
        };

        getDashboardDetails();
        if (sessionStorage.getItem('user')!==null) {
            setUserData(decryptData(sessionStorage.getItem('user')));
            console.log('Dashboard User in Session');
        }
    }, []);

    useEffect(() => {
        if (status!=='') {
            setLoading(false);
            setIsLoading(false);
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

    const handleCommonChargeSubmit = (e) => {
        setIsLoading(true);
        const response = storeData('store-commoncharge', commonCharge);
        setStatus(response);
    };

    const handleIsDiscountChange = useCallback((e) => {
        setCommonCharge((previousState) => ({
            ...previousState,
            isDiscount: e.target.checked
        }));
    }, []);

    const handleCommonChargeChange = useCallback((e) => {
        const { name, value } = e.target;
        setCommonCharge((previousState) => ({
            ...previousState,
            [name]: value
        }));

    }, []);

    const handleDiscountDateChange = (discountDate) => {
        setCommonCharge((previousState) => ({
            ...previousState,
            discountTillDate: discountDate
        }));
    };

    if (isLoading) {
        return (
          <>
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'  // Makes the Box take up the full viewport height
              }}
            >
              <CircularProgress color="primary" size={50} />
            </Box>
          </>);
    } else {
        return (
            <>
            <Box sx={{display:'flex', flexDirection: 'column', alignItems:'left', padding:2, border: '1px solid #ccc', borderRadius: '8px', gap:2}}>
                <FormGroup>
                    <FormControlLabel control={
                        <Switch checked={commonCharge.isDiscount} inputProps={{ 'aria-label': 'controlled' }} onChange={handleIsDiscountChange}/>
                        }
                        label='Discount' />
                </FormGroup>
                {commonCharge.isDiscount && (
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={['DatePicker']}>
                                    <DatePicker label='Discount till Date' value={commonCharge.discountTillDate} onChange={handleDiscountDateChange} />
                                </DemoContainer>
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label='Discount %' name='discountPercentage' value={commonCharge.discountPercentage} 
                                        onChange={handleCommonChargeChange} fullWidth margin='dense' />
                        </Grid>
                    </Grid>
                )}
                <Divider style={{ margin: '10px 0' }} />

                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField label='Consultation Charge' name='consultationCharge' value={commonCharge.consultationCharge} 
                                    type='number' onChange={handleCommonChargeChange} fullWidth margin='normal' />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField label='Delivery Charge' name='deliveryCharge' value={commonCharge.deliveryCharge} 
                                    type='number' onChange={handleCommonChargeChange} fullWidth margin='normal' />
                    </Grid>
                </Grid>

                <Button variant="contained" color="primary" onClick={handleCommonChargeSubmit} sx={{ marginLeft: 'auto' }}>Update</Button>
            </Box>

            <Box sx={{display:'flex', flexDirection: 'row', alignItems:'center', padding:2, border: '1px solid #ccc', borderRadius: '8px', gap:2, marginTop: '10px'}}>
                <Grid container direction='row' spacing={2} sx={{padding:2}}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Paper elevation={2} sx={{textAlign: 'center', padding:2}}>
                                <Typography variant='subtitle1'>Total Users</Typography>
                                <Typography variant='h6'>{dashboardData.totalUserCount}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={6}>
                            <Paper elevation={2} sx={{textAlign: 'center', padding:2}}>
                                <Typography variant='subtitle1'>Total Orders</Typography>
                                <Typography variant='h6'>{dashboardData.totalOrderCount}</Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} sx={{marginTop:'2px'}}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper elevation={2} sx={{textAlign: 'center', padding:2}}>
                                <Typography variant='body2' color={'orange'}>Pending Doctor Review</Typography>
                                <Typography variant='subtitle1'>{dashboardData.countOrderPRD}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper elevation={2} sx={{textAlign: 'center', padding:2}}>
                                <Typography variant='body2' color={'red'}>Payment Pending</Typography>
                                <Typography variant='subtitle1'>{dashboardData.countOrderPP}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper elevation={2} sx={{textAlign: 'center', padding:2}}>
                                <Typography variant='body2' color={'green'}>Payment Done</Typography>
                                <Typography variant='subtitle1'>{dashboardData.countOrderPD}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper elevation={2} sx={{textAlign: 'center', padding:2}}>
                                <Typography variant='body2' color={'blue'}>Medicine Courier</Typography>
                                <Typography variant='subtitle1'>{dashboardData.countOrderMC}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper elevation={2} sx={{textAlign: 'center', padding:2}}>
                                <Typography variant='body2' color={'orange'}>Feedback Pending</Typography>
                                <Typography variant='subtitle1'>{dashboardData.countOrderFP}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper elevation={2} sx={{textAlign: 'center', padding:2}}>
                                <Typography variant='body2' color={'green'}>Complete</Typography>
                                <Typography variant='subtitle1'>{dashboardData.countOrderC}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper elevation={2} sx={{textAlign: 'center', padding:2}}>
                                <Typography variant='body2' color={'red'}>Delete</Typography>
                                <Typography variant='subtitle1'>{dashboardData.countOrderD}</Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>

            {userData && (
            <Box sx={{display:'flex', flexDirection: 'row', alignItems:'left', padding:2, border: '1px solid #ccc', borderRadius: '8px', gap:2, marginTop: '10px'}}>
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
            )}
            </>
        );
    }
}

export default Dashboard;
