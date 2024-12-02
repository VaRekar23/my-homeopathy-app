import React, { useEffect, useState } from 'react';
import { decryptData } from '../../Helper/Secure';
import { fetchUserData, storeData, fetchData } from '../../Helper/ApiHelper';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Card, CardContent, CircularProgress, Divider, Grid, List, ListItem, Paper, Rating, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import dayjs from 'dayjs';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

function OrdersAdmin () {
    const [orderDetails, setOrderDetails] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [commonCharge, setCommonCharge] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [filterText, setFilterText] = useState('');
    const theme = useTheme();
    const [selectedImage, setSelectedImage] = useState(null);
    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [loadingImages, setLoadingImages] = useState({});

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
            const commonCharge = await fetchData('get-commoncharge');
            setCommonCharge(commonCharge);
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

    const apiCall = async (request) => {
        setIsLoading(true);
        try {
            const response = await storeData('update-order', request);
            setStatus(response);
            await getOrderDetails('');
        } catch (error) {
            console.error('Error updating order:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (orderId) => {
        const orderToUpdate = {...orderDetails[orderId]};
        if (orderToUpdate.status === 'Pending Doctor Review') {
            orderToUpdate.status = 'PP';
        } else if (orderToUpdate.status === 'Payment Done') {
            orderToUpdate.status = 'MC';
            orderToUpdate.courierDate = dayjs();
        } else if (orderToUpdate.status === 'Medicine Courier') {
            orderToUpdate.status = 'FP';
        }
        await apiCall(orderToUpdate);
    };

    const handleDelete = async (orderId) => {
        const orderToDelete = {...orderDetails[orderId]};
        orderToDelete.status = 'D';
        await apiCall(orderToDelete);
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
        const deliveryChr = deliveryCharge(updatedOrders[orderIndex]);
        const consultationChr = updatedOrders[orderIndex].followUpOrderId ? commonCharge.reconsultationCharge : commonCharge.consultationCharge;

        const amount = updatedOrders[orderIndex].items[itemIndex]['amount'];
        const qty = updatedOrders[orderIndex].items[itemIndex]['qty'];
        updatedOrders[orderIndex].items[itemIndex]['price'] = priceRow(amount, qty);

        // Recalculate total amount
        const totalAmount = updatedOrders[orderIndex].items.reduce((sum, item) => {
            const itemAmount = parseFloat(item.price) || 0; // Handle invalid amounts as 0
            return sum + itemAmount;
        }, 0);

        var discountAmount = 0;
        if (commonCharge.isDiscount) {
            discountAmount = (totalAmount*commonCharge.discountPercentage)/100;
        }

        updatedOrders[orderIndex].isDiscount = commonCharge.isDiscount;
        updatedOrders[orderIndex].discountPercentage = commonCharge.discountPercentage;
        updatedOrders[orderIndex].consultationCharge = consultationChr;
        updatedOrders[orderIndex].deliveryCharge = deliveryChr;

        updatedOrders[orderIndex].totalAmount = parseFloat(totalAmount-discountAmount + consultationChr + deliveryChr).toFixed(2);
        setOrderDetails(updatedOrders);
    };

    const invoiceSubtotal = (order) => {
        return order.items.reduce((sum, item) => {
            const itemAmount = parseFloat(item.price) || 0; // Handle invalid amounts as 0
            return sum + itemAmount;
        }, 0);
    }

    const invoiceDiscount = (order) => {
        const subTotalAmount = invoiceSubtotal(order);
        const discountAmount = (subTotalAmount*order.discountPercentage)/100;
        return '-' + parseFloat(discountAmount).toFixed(2);
    }

    const handleOrderChange = (orderIndex, field, value) => {
        const updatedOrders = [...orderDetails];
        updatedOrders[orderIndex][field] = value;
        setOrderDetails(updatedOrders);
    };

    const deliveryCharge = (order) => {
        let defaultCharge = 0;
        const pinCode = decryptData(order.userData).pinCode;
        for (let deliveryObj of commonCharge.deliveryCharge) {
            if (deliveryObj.postalCodePrefix === "XXX") {
                defaultCharge = deliveryObj.deliveryCharge;
            }
            const prefixPattern = deliveryObj.postalCodePrefix.replace(/X/g, "\\d");
            const regex = new RegExp(`^${prefixPattern}`);
            if (regex.test(pinCode)) {
                return deliveryObj.charges;
            }
        }
        return defaultCharge;
    }

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

                        {commonCharge.isDiscount && (
                            <Typography variant="body2" sx={{ mt: 2 }}>
                                Discount of {commonCharge.discountPercentage}%
                            </Typography>
                        )}

                        <Typography variant="body2" sx={{ mt: 2 }}>
                            Consultation Charge: ₹{order.followUpOrderId ? commonCharge.reconsultationCharge : commonCharge.consultationCharge}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 2 }}>
                            Delivery Charge: ₹{deliveryCharge(order)}
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
                                            <TableCell align='right'>{parseFloat(item.price).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell rowSpan={order.isDiscount?5:4} />
                                        <TableCell colSpan={2}>Subtotal</TableCell>
                                        <TableCell align='right'>{parseFloat(invoiceSubtotal(order)).toFixed(2)}</TableCell>
                                    </TableRow>
                                    {order.isDiscount && (
                                        <TableRow>
                                            <TableCell colSpan={2}>Discount of {order.discountPercentage}%</TableCell>
                                            <TableCell align='right'>{invoiceDiscount(order)}</TableCell>
                                        </TableRow>
                                    )}
                                    <TableRow>
                                        <TableCell colSpan={2}>Consultation Charges</TableCell>
                                        <TableCell align='right'>{parseFloat(order.consultationCharge).toFixed(2)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={2}>Delivery Charges</TableCell>
                                        <TableCell align='right'>{parseFloat(order.deliveryCharge).toFixed(2)}</TableCell>
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

    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
        setOpenImageDialog(true);
    };

    const handleCloseImage = () => {
        setSelectedImage(null);
        setOpenImageDialog(false);
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
            <Box>
                <TextField label='Filter Orders'
                            variant='outlined'
                            fullWidth
                            value={filterText}
                            onChange={handleFilterChange}
                            margin='normal' />
                
                <List>
                    {filteredOrders.map((order, index) => (
                        <Paper key={index} elevation={3} sx={{ marginBottom: '10px', padding: '15px', background: theme.palette.custom.background }}>
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
                                        {order.followUpOrderId &&
                                            <Typography variant="caption" color="textSecondary">
                                                Follow up of: {order.followUpOrderId}
                                            </Typography>
                                        }
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
                                                        <b>Name:</b> {decryptData(order.userData).isDeleted ? decryptData(order.userData).name+' (User is Deleted)' : decryptData(order.userData).name}
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

                                            {order.images && order.images.length > 0 && (
                                                <Accordion sx={{marginTop:'10px'}}>
                                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                        <Typography variant="subtitle1">Medical Images ({order.images.length})</Typography>
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        <ImageList 
                                                            sx={{ 
                                                                width: '100%', 
                                                                maxHeight: 300,
                                                                '&::-webkit-scrollbar': {
                                                                    width: '8px',
                                                                },
                                                                '&::-webkit-scrollbar-track': {
                                                                    background: '#f1f1f1',
                                                                },
                                                                '&::-webkit-scrollbar-thumb': {
                                                                    background: '#888',
                                                                    borderRadius: '4px',
                                                                },
                                                            }} 
                                                            cols={3} 
                                                            rowHeight={164}
                                                        >
                                                            {order.images.map((image, imgIndex) => (
                                                                <ImageListItem key={imgIndex}>
                                                                    <img src={image} alt={`Image ${imgIndex + 1}`} onClick={() => handleImageClick(image)} />
                                                                </ImageListItem>
                                                            ))}
                                                        </ImageList>
                                                    </AccordionDetails>
                                                </Accordion>
                                            )}

                                            {renderStatusSpecificUI(order.status, order, index)}
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                                </Box>
                            </ListItem>
                        </Paper>
                    ))}
                </List>
                <Dialog open={openImageDialog} onClose={handleCloseImage}>
                    <DialogContent>
                        <IconButton onClick={handleCloseImage} sx={{ position: 'absolute', top: 8, right: 8 }}>
                            <CloseIcon />
                        </IconButton>
                        <img src={selectedImage} alt="Selected" style={{ width: '100%', maxHeight: '80vh' }} />
                        <IconButton onClick={() => window.open(selectedImage, '_blank')} sx={{ position: 'absolute', bottom: 8, right: 8 }}>
                            <ZoomInIcon />
                        </IconButton>
                    </DialogContent>
                </Dialog>
            </Box>
        );
    }
}

export default OrdersAdmin;