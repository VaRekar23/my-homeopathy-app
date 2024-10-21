import React, { useEffect, useState } from 'react';
import { decryptData } from '../../Helper/Secure';
import { fetchUserData, storeData } from '../../Helper/ApiHelper';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Card, CardContent, CircularProgress, Divider, Grid, List, ListItem, Paper, Rating, TextField, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import dayjs from 'dayjs';

function OrdersAdmin () {
    const [orderDetails, setOrderDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState('');

    const getAge = (dob) => {
        const today = dayjs();
        return today.diff(dob, 'year')!==0 ? today.diff(dob, 'year')+' years' : (today.diff(dob, 'month')!==0 ? today.diff(dob, 'month')+' months' : today.diff(dob, 'day')+' days');
    }

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

    useEffect(() => {
        getOrderDetails('');
    }, []);

    const handleUpdate = async (orderId) => {
        const orderToUpdate = orderDetails[orderId];
        if (orderToUpdate.status === 'Pending Doctor Review') {
            orderToUpdate.status = 'PP';
        } else if (orderToUpdate.status === 'Payment Done') {
            orderToUpdate.status = 'MC';
            orderToUpdate.courierDate = dayjs();
        } else if (orderToUpdate.status === 'Medicine Courier') {
            orderToUpdate.status = 'FP';
        }
        console.log('Update', orderToUpdate);
        apiCall(orderToUpdate);
    };

    const handleDelete = async (orderId) => {
        const orderToDelete = orderDetails[orderId];
        orderToDelete.status = 'D';
        apiCall(orderToDelete);
    };

    const apiCall = async (request) => {
        setIsLoading(true);
        const response = storeData('update-order', request);
        setStatus(response);
    };

    useEffect(() => {
        if (status !== '') {
            getOrderDetails('');
        }
    }, [status]);

    const handleAddItem = (index) => {
        const updatedOrders = [...orderDetails];
        updatedOrders[index].items.push({ item: '', amount: '' });
        setOrderDetails(updatedOrders);
    };

    const handleItemChange = (orderIndex, itemIndex, field, value) => {
        const updatedOrders = [...orderDetails];
        updatedOrders[orderIndex].items[itemIndex][field] = value;

        // Recalculate total amount
        const totalAmount = updatedOrders[orderIndex].items.reduce((sum, item) => {
            const itemAmount = parseFloat(item.amount) || 0; // Handle invalid amounts as 0
            return sum + itemAmount;
        }, 0);

        updatedOrders[orderIndex].totalAmount = totalAmount;
        setOrderDetails(updatedOrders);
    };

    const handleOrderChange = (orderIndex, field, value) => {
        const updatedOrders = [...orderDetails];
        updatedOrders[orderIndex][field] = value;
        setOrderDetails(updatedOrders);
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
                    <>
                        <Divider style={{ margin: '10px 0' }} />
                        <TextField label="Doctor's Comments"
                                    value={order.doctorComments || ''}
                                    onChange={(event) => handleOrderChange(index, 'doctorComments', event.target.value)}
                                    fullWidth
                                    multiline
                                    margin="normal" />
                                
                        <Typography variant="h6">Add Items</Typography>
                        {order.items.map((item, itemIndex) => (
                            <Grid container spacing={2} key={itemIndex}>
                                <Grid item xs={6}>
                                    <TextField label="Item Name"
                                                value={item.item}
                                                onChange={(e) => handleItemChange(index, itemIndex, 'item', e.target.value)}
                                                fullWidth />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="Amount"
                                                value={item.amount}
                                                onChange={(e) => handleItemChange(index, itemIndex, 'amount', e.target.value)}
                                                type="number"
                                                fullWidth />
                                </Grid>
                            </Grid>
                        ))}
                        <Box textAlign="right" mt={2}>
                            <Button variant="outlined" color="primary" onClick={() => handleAddItem(index)}>
                                Add Item
                            </Button>
                        </Box>

                        <Typography variant="h6" sx={{ mt: 2 }}>
                            Total Amount: ₹{order.totalAmount}
                        </Typography>

                        <Box textAlign='center' mt={2}>
                            <Button variant='outlined' color='primary' onClick={() => handleUpdate(index)} sx={{ marginRight: '10px' }}>Update</Button>
                            <Button variant='outlined' color='error' onClick={() => handleDelete(index)}>Delete</Button>
                        </Box>
                    </>
                );
            case 'Payment Pending':
                return (
                    <>
                        {renderPaymentPending(order, index)}
                    </>
                );
            case 'Payment Done':
                return (
                    <>
                        {renderPaymentDone(order, index)}
                        <Divider style={{ margin: '10px 0' }} />
                        <TextField label="Tracking Id"
                                    value={order.trackingId}
                                    onChange={(e) => handleOrderChange(index, 'trackingId', e.target.value)}
                                    fullWidth />
                        <Button variant='outlined' color='primary' onClick={() => handleUpdate(index)} sx={{ marginRight: '10px' }}>Update</Button>
                    </>
                );
            case 'Medicine Courier':
                return (
                    <>
                        {renderMedicineCourier(order, index)}
                        <Button variant='outlined' color='primary' onClick={() => handleUpdate(index)} sx={{ marginRight: '10px' }}>Request Feedback</Button>
                    </>
                );
            case 'Feedback Pending':
                return (
                    <>
                        {renderMedicineCourier(order, index)}
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

    const renderPaymentPending = (order, index) => {
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
                </Paper>
            </>
        );
    }

    const renderPaymentDone = (order, index) => {
        return (
            <>
                {renderPaymentPending(order, index)}
                <Typography variant="body2"><b>Payment ID:</b> {order.paymentId}</Typography>
                <Typography variant="body2"><b>Payment Date:</b> {order.paymentDate}</Typography>
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
                                <Typography variant="body2" gutterBottom>
                                    Placed on: {new Date(order.createDate).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Order ID: {order.orderId}
                                </Typography>
                                <Typography variant="body2" color={getStatusColor(order.status)}>
                                    Status: {order.status}
                                </Typography>

                                <Divider style={{ margin: '10px 0' }} />

                                <Typography variant="body1">
                                    Patient Details
                                </Typography>
                                <Typography variant="body2">
                                    <b>Name:</b> {decryptData(order.userData).name}
                                </Typography>
                                <Typography variant="body2">
                                    <b>Phone Number:</b> {decryptData(order.userData).phone}
                                </Typography>
                                <Typography variant="body2">
                                    <b>Occupation:</b> {decryptData(order.userData).occupation}
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2">
                                            <b>Age:</b> {getAge(decryptData(order.userData).dob)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2">
                                            <b>Gender:</b> {decryptData(order.userData).gender}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Typography variant="body2">
                                    <b>Address:</b> {decryptData(order.userData).building}, {decryptData(order.userData).street}, {decryptData(order.userData).city}, {decryptData(order.userData).state}, {decryptData(order.userData).pinCode}
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

export default OrdersAdmin;