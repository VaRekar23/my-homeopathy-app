import React, { useEffect, useState } from 'react';
import { decryptData } from '../../Helper/Secure';
import { fetchUserData, storeData } from '../../Helper/ApiHelper';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Card, CardContent, CircularProgress, Divider, Grid, List, ListItem, Paper, Rating, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import dayjs from 'dayjs';

function OrdersAdmin () {
    const [orderDetails, setOrderDetails] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [filterText, setFilterText] = useState('');
    const consultationCharge = 100;
    const deliveryCharge = 100;

    const getAge = (dob) => {
        const today = dayjs();
        return today.diff(dob, 'year')!==0 ? 
                today.diff(dob, 'year')+' years' : 
                    (today.diff(dob, 'month')!==0 ? 
                        today.diff(dob, 'month')+' months' : 
                        today.diff(dob, 'day')+' days');
    }

    const getOrderDetails = async (userId) => {
        try {
            const orders = await fetchUserData('get-orders', userId);
            setOrderDetails(orders);
            setFilteredOrders(orders);
        } catch(error) {
            console.error('Error fetching documents', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getOrderDetails('');
    }, []);

    const handleFilterChange = (event) => {
        const value = event.target.value.toLowerCase();
        setFilterText(value);
        const filtered = orderDetails.filter(order => 
            order.orderId.toString().includes(value) || 
            order.status.toLowerCase().includes(value)
        );
        setFilteredOrders(filtered);
    };

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
        updatedOrders[index].items.push({ item: '', amount: 0, qty: 1, price: 0 });
        setOrderDetails(updatedOrders);
    };

    function priceRow(qty, unit) {
        return qty*unit;
    }

    const handleItemChange = (orderIndex, itemIndex, field, value) => {
        const updatedOrders = [...orderDetails];
        updatedOrders[orderIndex].items[itemIndex][field] = value;

        const amount = updatedOrders[orderIndex].items[itemIndex]['amount'];
        const qty = updatedOrders[orderIndex].items[itemIndex]['qty'];
        updatedOrders[orderIndex].items[itemIndex]['price'] = priceRow(amount, qty);

        // Recalculate total amount
        const totalAmount = updatedOrders[orderIndex].items.reduce((sum, item) => {
            const itemAmount = parseFloat(item.price) || 0; // Handle invalid amounts as 0
            return sum + itemAmount;
        }, 0);

        updatedOrders[orderIndex].totalAmount = totalAmount+consultationCharge+deliveryCharge;
        setOrderDetails(updatedOrders);
    };

    const invoiceSubtotal = (order) => {
        return order.items.reduce((sum, item) => {
            const itemAmount = parseFloat(item.price) || 0; // Handle invalid amounts as 0
            return sum + itemAmount;
        }, 0);
    }

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
                                
                        <Typography variant="subtitle1">Add Items</Typography>
                        {order.items.map((item, itemIndex) => (
                            <Grid container spacing={3} key={itemIndex} sx={{ marginTop: '10px' }}>
                                <Grid item xs={12}>
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
                                <Grid item xs={6}>
                                    <TextField label="Quantity"
                                                value={item.qty}
                                                onChange={(e) => handleItemChange(index, itemIndex, 'qty', e.target.value)}
                                                type="number"
                                                fullWidth />
                                </Grid>

                                <Grid item xs={6}>
                                    <TextField label="Price"
                                                value={item.price}
                                                disabled
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

                        <Typography variant="body2" sx={{ mt: 2 }}>
                            Consultation Charge: ₹{consultationCharge}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 2 }}>
                            Delivery Charge: ₹{deliveryCharge}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ mt: 2 }}>
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
                        {renderPayment(order, index, false)}
                    </>
                );
            case 'Payment Done':
                return (
                    <>
                        {renderPayment(order, index, true)}
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

                        <Typography variant="subtitle1" sx={{marginTop:'10px'}}><b>Feedback</b></Typography>
                        <Card variant='outlined'>
                            <CardContent>
                                <Typography variant="body2">
                                    <b>Comments:</b> {order.feedbackComments}
                                </Typography>
                                <Rating name='customer-rating' value={order.feedbackRating} readOnly sx={{ color: 'gold'}} />
                            </CardContent>
                        </Card>
                    </>
                );
            case 'Delete':
                return (
                    <>
                        {order.doctorComments && (
                        <>
                            <Typography variant="subtitle1" sx={{marginTop:'10px'}}><b>Doctor Comments</b></Typography>
                            <Card variant='outlined'>
                                <CardContent>
                                    <Typography variant="body2">{order.doctorComments}</Typography>
                                </CardContent>
                            </Card>
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

    const renderPayment = (order, index, isPaymentDone) => {
        return (
            <>
                {order.doctorComments && (
                <>
                    <Typography variant="subtitle1" sx={{marginTop:'10px'}}><b>Doctor Comments</b></Typography>
                    <Card variant='outlined'>
                        <CardContent>
                            <Typography variant="body2">{order.doctorComments}</Typography>
                        </CardContent>
                    </Card>
                </>
                )}
                <Accordion sx={{marginTop:'10px'}}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box display='flex' width="100%" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1">Payment Details</Typography>
                            <Typography variant="subtitle1">₹{order.totalAmount}</Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container direction='column'>
                        <TableContainer component={Paper}>
                            <Table aria-label='spanning table'>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Desc</TableCell>
                                        <TableCell align='right'>Amount</TableCell>
                                        <TableCell align='right'>Qty</TableCell>
                                        <TableCell align='right'>Sum</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {order.items.map((item, itemIndex) => (
                                        <TableRow key={itemIndex}>
                                            <TableCell>{item.item}</TableCell>
                                            <TableCell align='right'>{item.amount}</TableCell>
                                            <TableCell align='right'>{item.qty}</TableCell>
                                            <TableCell align='right'>{item.price}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell rowSpan={4} />
                                        <TableCell colSpan={2}>Subtotal</TableCell>
                                        <TableCell align='right'>{invoiceSubtotal(order)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={2}>Consultation Charges</TableCell>
                                        <TableCell align='right'>{consultationCharge}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={2}>Delivery Charges</TableCell>
                                        <TableCell align='right'>{deliveryCharge}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={2}>Total</TableCell>
                                        <TableCell align='right'>₹{order.totalAmount}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {isPaymentDone &&
                            <Card variant='outlined'>
                                <CardContent>
                                    <Typography variant="body2"><b>Payment ID:</b> {order.paymentId}</Typography>
                                    <Typography variant="body2"><b>Payment Date:</b> {order.paymentDate}</Typography>
                                </CardContent>
                            </Card>
                        }
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            </>
        );
    }

    const renderMedicineCourier = (order, index) => {
        return (
            <>
                {renderPayment(order, index, true)}
                <Typography variant="subtitle1" sx={{marginTop:'10px'}}><b>Tracking Details</b></Typography>
                <Card variant='outlined'>
                    <CardContent>
                        <Typography variant="body2"><b>Tracking Id:</b> {order.trackingId}</Typography>
                        <Typography variant="body2"><b>Date:</b> {order.courierDate}</Typography>
                    </CardContent>
                </Card>
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
            <Box>
                <TextField label='Filter Orders'
                            variant='outlined'
                            fullWidth
                            value={filterText}
                            onChange={handleFilterChange}
                            margin='normal' />
                
                <List>
                    {filteredOrders.map((order, index) => (
                        <Paper key={index} elevation={3} sx={{ marginBottom: '10px', padding: '15px' }}>
                            <ListItem>
                                <Box sx={{ width: '100%' }}>
                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Grid container direction='column'>
                                        <Typography variant="h6" color={getStatusColor(order.status)}>
                                            Status: {order.status}
                                        </Typography>
                                        <Typography variant="h6" gutterBottom>
                                            {order.treatmentName}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Order ID: {order.orderId}
                                        </Typography>
                                        <Typography variant="body2" gutterBottom>
                                            Placed on: {new Date(order.createDate).toLocaleDateString()}
                                        </Typography>
                                    </Grid>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container direction='column'>
                                            <Typography variant='subtitle1'><b>Patient Details</b></Typography>
                                            <Card variant='outlined'>
                                                <CardContent>
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
                                                </CardContent>
                                            </Card>

                                            <Accordion sx={{marginTop:'10px'}}>
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

                                            <Typography variant="subtitle1" sx={{marginTop:'10px'}}><b>Additional Info</b></Typography>
                                            <Card variant='outlined'>
                                                <CardContent>
                                                    <Typography variant="body2">{order.additionalInfo}</Typography>
                                                </CardContent>
                                            </Card>

                                            {renderStatusSpecificUI(order.status, order, index)}
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                                </Box>
                            </ListItem>
                        </Paper>
                    ))}
                </List>
            </Box>
        );
    }
}

export default OrdersAdmin;