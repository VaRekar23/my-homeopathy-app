import React, { useEffect, useState } from 'react';
import { decryptData } from '../../Helper/Secure';
import { fetchUserData, storeData } from '../../Helper/ApiHelper';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Card, CardContent, CircularProgress, Grid, List, ListItem, Paper, Rating, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

function Orders () {
    const [orderDetails, setOrderDetails] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const theme = useTheme();
    const [filterText, setFilterText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [loadingImages, setLoadingImages] = useState({});

    useEffect(() => {
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
        
        const user = decryptData(sessionStorage.getItem('user'));
        getOrderDetails(user.userId);
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

    const handlePayment = (orderId) => {
        const orderToUpdate = orderDetails[orderId];
        orderToUpdate.status = 'PD';
        orderToUpdate.paymentId = '1234';
        orderToUpdate.paymentDate = dayjs();
        const response = storeData('update-order', orderToUpdate);
    };

    const handleFeedback = (orderId) => {
        navigate('/feedback', { state: {orderId}});
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
                        {renderPayment(order, index, false)}
                    </>
                );
            case 'Payment Done':
                return (
                    <>
                        {renderPayment(order, index, true)}
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

                            {isPaymentDone ? 
                                <Typography variant="subtitle1">₹{order.totalAmount}</Typography> :
                                <Button 
                                    variant='outlined' 
                                    color='primary' 
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent accordion toggle
                                        handlePayment(index);
                                    }}
                                >
                                    Pay ₹{order.totalAmount}
                                </Button>
                            }
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
                                                <Typography variant="body2">
                                                    For: {decryptData(order.userData).isDeleted ? decryptData(order.userData).name+' (User is Deleted)' : decryptData(order.userData).name}
                                                </Typography>
                                                <Typography variant="body2" gutterBottom>
                                                    Placed on: {new Date(order.createDate).toLocaleDateString()}
                                                </Typography>
                                            </Grid>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Grid container direction='column'>
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

                                                {order.images && order.images.length > 0 && (
                                                    <Accordion sx={{ marginTop: '10px' }}>
                                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                            <Typography variant="subtitle1">
                                                                Medical Images ({order.images.length})
                                                            </Typography>
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
                                                                    <ImageListItem 
                                                                        key={imgIndex}
                                                                        sx={{ 
                                                                            cursor: 'pointer',
                                                                            position: 'relative',
                                                                            '&:hover .zoom-overlay': {
                                                                                opacity: 1,
                                                                            },
                                                                        }}
                                                                        onClick={() => handleImageClick(image)}
                                                                    >
                                                                        {loadingImages[imgIndex] && (
                                                                            <Box
                                                                                sx={{
                                                                                    position: 'absolute',
                                                                                    top: 0,
                                                                                    left: 0,
                                                                                    right: 0,
                                                                                    bottom: 0,
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    background: 'rgba(255, 255, 255, 0.8)',
                                                                                }}
                                                                            >
                                                                                <CircularProgress size={24} />
                                                                            </Box>
                                                                        )}
                                                                        <img
                                                                            src={image}
                                                                            alt={`Medical image ${imgIndex + 1}`}
                                                                            loading="lazy"
                                                                            onLoadStart={() => setLoadingImages(prev => ({ ...prev, [imgIndex]: true }))}
                                                                            onLoad={() => setLoadingImages(prev => ({ ...prev, [imgIndex]: false }))}
                                                                            style={{ 
                                                                                borderRadius: '4px',
                                                                                objectFit: 'cover',
                                                                            }}
                                                                        />
                                                                        <Box
                                                                            className="zoom-overlay"
                                                                            sx={{
                                                                                position: 'absolute',
                                                                                top: 0,
                                                                                left: 0,
                                                                                right: 0,
                                                                                bottom: 0,
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                background: 'rgba(0, 0, 0, 0.5)',
                                                                                opacity: 0,
                                                                                transition: 'opacity 0.3s',
                                                                            }}
                                                                        >
                                                                            <ZoomInIcon sx={{ color: 'white', fontSize: 30 }} />
                                                                        </Box>
                                                                    </ImageListItem>
                                                                ))}
                                                            </ImageList>
                                                        </AccordionDetails>
                                                    </Accordion>
                                                )}

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

                <Dialog
                    open={openImageDialog}
                    onClose={handleCloseImage}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogContent sx={{ p: 0, position: 'relative' }}>
                        <IconButton
                            onClick={handleCloseImage}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                color: 'white',
                                background: 'rgba(0, 0, 0, 0.5)',
                                '&:hover': {
                                    background: 'rgba(0, 0, 0, 0.7)',
                                },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                        {selectedImage && (
                            <img
                                src={selectedImage}
                                alt="Medical image full view"
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    maxHeight: '80vh',
                                    objectFit: 'contain',
                                }}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </Box>
        );
    }
}

export default Orders;