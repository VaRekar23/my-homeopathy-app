import React, { useEffect, useState } from 'react';
import { decryptData } from '../../Helper/Secure';
import { fetchData, fetchUserData, storeData } from '../../Helper/ApiHelper';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Card, CardContent, CircularProgress, Container, Divider, Grid, List, ListItem, Paper, Rating, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom'

function Orders () {
    const [userData, setUserData] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const getOrderDetails = async (userId) => {
            try {
                const orders = await fetchUserData('get-orders', userId);
                setOrderDetails(orders);
            } catch(error) {
                console.error('Error fetching documents', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        const user = decryptData(sessionStorage.getItem('user'));
        getOrderDetails(user.userId);

        setUserData(user);
    }, []);

    const handlePayment = (orderId) => {
        const orderToUpdate = orderDetails[orderId];
        orderToUpdate.status = 'PD';
        orderToUpdate.paymentId = '1234';
        orderToUpdate.paymentDate = dayjs();
        const response = storeData('update-order', orderToUpdate);
        console.log('Payment Request for:', orderToUpdate);
    };

    const handleFeedback = (orderId) => {
        const orderToUpdate = orderDetails[orderId];
        navigate('/feedback', { state: {orderId}});
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending Doctor Review':
                return 'orange';
            case 'Payment Pending':
                return 'red';
            case 'Payment Done':
                return 'green';
            case 'Medicine Courier':
                return 'blue';
            case 'Feedback Pending':
                return 'orange';
            case 'Complete':
                return 'green';
            case 'Delete':
                return 'red';
            default:
                return 'grey';
        }
    };

    const renderStatusSpecificUI = (status, order, index) => {
        switch(status) {
            case 'Pending Doctor Review':
                return (
                    <></>
                );
            case 'Payment Pending':
                return (
                    <>
                        {order.doctorComments && (
                        <>
                            <Divider style={{ margin: '10px 0' }} />
                            <Typography variant="subtitle1">Doctor Comments</Typography>
                            <Paper elevation={2} style={{ padding: '10px' }}>
                                <Typography variant="body2">{order.doctorComments}</Typography>
                            </Paper>
                        </>
                        )}
                        <Divider style={{ margin: '10px 0' }} />
                        <Typography variant="subtitle1">Payment Details</Typography>
                        <Paper elevation={2} style={{ padding: '10px' }}>
                            <List>
                                {order.items.map((item, itemIndex) => (
                                    <ListItem key={itemIndex}>
                                        <Typography variant="body2">
                                            <strong>{item.item}:</strong> ₹{item.amount}
                                        </Typography>
                                    </ListItem>
                                ))}
                            </List>
                            <Divider style={{ margin: '10px 0' }} />
                            <Typography variant="body2">
                                <strong>Total Amount:</strong> ₹{order.totalAmount}
                            </Typography>

                            <Button variant='outlined' color='primary' onClick={() => handlePayment(index)}>Pay ₹{order.totalAmount}</Button>
                        </Paper>
                    </>
                );
            case 'Payment Done':
                return (
                    <>
                        {renderPaymentDone(order, index)}
                    </>
                );
            case 'Medicine Courier':
                return (
                    <>
                        {renderMedicineCourier(order, index)}
                    </>
                );
            case 'Feedback Pending':
                return (
                    <>
                        {renderMedicineCourier(order, index)}
                        <Button variant='outlined' color='primary' onClick={() => handleFeedback(index)} sx={{ margin: '10px 0' }}>Provide Feedback</Button>
                    </>
                );
            case 'Complete':
                return (
                    <>
                        {renderMedicineCourier(order, index)}

                        <Divider style={{ margin: '10px 0' }} />
                        <Typography variant="subtitle1">Feedback</Typography>
                        <Paper elevation={2} style={{ padding: '10px' }}>
                            <Typography variant="body2">
                                <b>Comments:</b> {order.feedbackComments}
                            </Typography>
                            <Rating name='customer-rating' value={order.feedbackRating} readOnly sx={{ color: 'gold'}} />
                        </Paper>
                    </>
                );
            case 'Delete':
                return (
                    <>
                        {order.doctorComments && (
                        <>
                            <Divider style={{ margin: '10px 0' }} />
                            <Typography variant="subtitle1">Doctor Comments</Typography>
                            <Paper elevation={2} style={{ padding: '10px' }}>
                                <Typography variant="body2">{order.doctorComments}</Typography>
                            </Paper>
                        </>
                        )}
                    </>
                );
            default:
                return (
                    <></>
                );
        }
    }

    const renderPaymentDone = (order, index) => {
        return (
            <>
                {order.doctorComments && (
                <>
                    <Divider style={{ margin: '10px 0' }} />
                    <Typography variant="subtitle1">Doctor Comments</Typography>
                    <Paper elevation={2} style={{ padding: '10px' }}>
                        <Typography variant="body2">{order.doctorComments}</Typography>
                    </Paper>
                </>
                )}
                <Divider style={{ margin: '10px 0' }} />
                <Typography variant="subtitle1">Payment Details</Typography>
                <Paper elevation={2} style={{ padding: '10px' }}>
                    <List>
                        {order.items.map((item, itemIndex) => (
                            <ListItem key={itemIndex}>
                                <Typography variant="body2">
                                    <strong>{item.item}:</strong> ₹{item.amount}
                                </Typography>
                            </ListItem>
                        ))}
                    </List>
                    <Typography variant="body2">
                        <strong>Total Amount:</strong> ₹{order.totalAmount}
                    </Typography>
                        
                    <Divider style={{ margin: '10px 0' }} />
                    <Typography variant="body2"><b>Payment ID:</b> {order.paymentId}</Typography>
                    <Typography variant="body2"><b>Payment Date:</b> {order.paymentDate}</Typography>
                </Paper>
            </>
        )
    }

    const renderMedicineCourier = (order, index) => {
        return (
            <>
                {renderPaymentDone(order, index)}
                <Divider style={{ margin: '10px 0' }} />
                <Typography variant="subtitle1">Tracking Details</Typography>
                <Paper elevation={2} style={{ padding: '10px' }}>
                    <Typography variant="body2"><b>Tracking Id:</b> {order.trackingId}</Typography>
                    <Typography variant="body2"><b>Date:</b> {order.courierDate}</Typography>
                </Paper>
            </>
        )
    }

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
    } else if(orderDetails.length===0) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'  // Makes the Box take up the full viewport height
              }}
            >
              <Alert severity='info'>You have not placed any order till now!!</Alert>
            </Box>
        );
    } else {
        return (
            <Grid container spacing={2}>
                {orderDetails.map((order, index) => (
                    <Grid item xs={12} md={6} key={order.orderId}>
                        <Card variant='outlined'>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {order.treatmentName}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Order ID: {order.orderId}
                                </Typography>
                                <Typography variant="body2" color={getStatusColor(order.status)}>
                                    Status: {order.status}
                                </Typography>

                                <Divider style={{ margin: '10px 0' }} />

                                <Typography variant="body1">
                                    For: {decryptData(order.userData).name}
                                </Typography>

                                <Typography variant="body2" gutterBottom>
                                    Placed on: {new Date(order.createDate).toLocaleDateString()}
                                </Typography>
                            
                                <Divider style={{ margin: '10px 0' }} />

                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="subtitle1">Questions & Answers</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <List>
                                        {order.questions.map((qa, qaIndex) => (
                                            <ListItem key={qaIndex}>
                                                <Typography variant="body2">
                                                    <strong>{qa.questionName}:</strong> {qa.optionSelected}
                                                </Typography>
                                            </ListItem>
                                        ))}
                                        </List>
                                    </AccordionDetails>
                                </Accordion>

                                {order.additionalInfo && (
                                <>
                                    <Divider style={{ margin: '10px 0' }} />
                                    <Typography variant="subtitle1">Additional Info</Typography>
                                    <Paper elevation={2} style={{ padding: '10px' }}>
                                        <Typography variant="body2">{order.additionalInfo}</Typography>
                                    </Paper>
                                </>
                                )}

                                {renderStatusSpecificUI(order.status, order, index)}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
    }
}

export default Orders;