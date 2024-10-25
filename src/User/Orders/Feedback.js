import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { decryptData } from '../../Helper/Secure';
import { fetchUserData, storeData } from '../../Helper/ApiHelper';
import { Alert, Box, Button, Card, CardContent, CircularProgress, Container, Grid, Rating, TextField, Typography } from '@mui/material';

function Feedback () {
    const navigate = useNavigate();
    const location = useLocation();
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [feedbackData, setFeedbackData] = useState({
        rating: 0,
        comments: '',
        selectedOrder: null,
        orders: []
    });

    useEffect(() => {
        const checkUserLogin = async () => {
            const user = sessionStorage.getItem('user');
            if (!user) {
                console.log('Need login');
            } else {
                setUserData(decryptData(user));
                const orders = await fetchUserData('get-orders', decryptData(user).userId);
                const filterOrders = orders.filter(order => order.status === 'Feedback Pending');
                setFeedbackData(prev => ({ ...prev, orders: filterOrders}));
            }
            setIsLoading(false);
        }

        checkUserLogin();
    }, [navigate]);

    const handleSubmitFeedback = async () => {
        if (!feedbackData.selectedOrder) return;

        const feedback = {
            userId: userData.userId,
            orderId: feedbackData.selectedOrder.orderId,
            rating: feedbackData.rating,
            comments: feedbackData.comments
        };

        try {
            await storeData('store-feedback', feedback);
            navigate('/');
        } catch(error) {
            console.log('Error in submitting feedback', error);
            navigate('/error');
        }
    }

    if (isLoading) {
        return (
            <>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'  // Makes the Box take up the full viewport height
                }} >
                    <CircularProgress color="primary" size={50} />
                </Box>
            </>
        );
    }
    return (
        <Container>
            <Typography variant='h4' gutterBottom>Feedback</Typography>

            {feedbackData.orders.length === 0 ? (
                <Alert severity='info'>No orders available for Feedback</Alert>
            ) : (
                <Grid container spacing={2}>
                    {feedbackData.orders.map((order, index) => (
                        <Grid item xs={12} md={6} key={order.orderId} >
                            <Card variant='outlined' onClick={() => setFeedbackData(prev => ({...prev, selectedOrder: order}))}>
                                <CardContent>
                                    <Typography variant='h6'>{order.treatmentName}</Typography>
                                    <Typography variant='body2'>Order Id: {order.orderId}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {feedbackData.selectedOrder && (
                <Box mt={4}>
                    <Typography variant='h6'>Provide Feedback for Order: {feedbackData.selectedOrder.orderId}</Typography>

                    <Rating value={feedbackData.rating} onChange={(event, newValue) => setFeedbackData(prev => ({...prev, rating: newValue}))} />
                    <TextField fullWidth multiline rows={4} label='Comments' variant='outlined' value={feedbackData.comments}
                                onChange={(e) => setFeedbackData(prev => ({...prev, comments: e.target.value}))}
                                sx={{ marginTop:2}} />
                    
                    <Button variant='contained' color='primary' onClick={handleSubmitFeedback} sx={{ marginTop:2}}>Submit Feedback</Button>
                    <Button variant='contained' color='secondary' onClick={() => navigate('/')} sx={{ marginTop:2, marginLeft:2 }}>Back to MainPage</Button>
                </Box>
            )}
        </Container>
    );
}

export default Feedback;