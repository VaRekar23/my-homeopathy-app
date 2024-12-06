import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { decryptData } from '../../Helper/Secure';
import { fetchUserData, storeData, uploadImage } from '../../Helper/ApiHelper';
import { 
    Alert, Box, Button, Card, CardContent, Checkbox, 
    CircularProgress, Container, Dialog, DialogActions, 
    DialogContent, DialogTitle, FormControlLabel, Grid, 
    ImageList, ImageListItem, Rating, TextField, Typography 
} from '@mui/material';
import { ImageUploader } from '../../components/shared/ImageUploader';

function Feedback () {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Separate states for feedback and testimonial
    const [feedbackData, setFeedbackData] = useState({
        rating: 0,
        comments: '',
        selectedOrder: null,
        orders: []
    });

    const [testimonialData, setTestimonialData] = useState({
        content: '',
        shareIdentity: false,
        selectedBeforeImage: null,
        afterImage: null
    });
    
    const [openTestimonialDialog, setOpenTestimonialDialog] = useState(false);

    useEffect(() => {
        const checkUserLogin = async () => {
            const user = sessionStorage.getItem('user');
            if (!user) {
                navigate('/login');
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

        setIsSubmitting(true);
        try {
            const feedback = {
                userId: userData.userId,
                orderId: feedbackData.selectedOrder.orderId,
                rating: feedbackData.rating,
                comments: feedbackData.comments
            };

            await storeData('store-feedback', feedback);
            
            // After successful feedback submission, check rating
            if (feedbackData.rating > 3) {
                setOpenTestimonialDialog(false); //need to update to true in future
            } else {
                navigate('/');
            }
        } catch(error) {
            console.error('Error in submitting feedback:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTestimonialSubmit = async () => {
        setIsSubmitting(true);
        try {
            let afterImageUrl = null;
            
            // Upload after image if exists
            if (testimonialData.afterImage) {
                const formData = new FormData();
                formData.append('file', testimonialData.afterImage);
                afterImageUrl = await uploadImage('upload-image', formData);
            }

            const testimonial = {
                userId: userData.userId,
                orderId: feedbackData.selectedOrder.orderId,
                content: testimonialData.content,
                shareIdentity: testimonialData.shareIdentity,
                beforeImageUrl: testimonialData.selectedBeforeImage,
                afterImageUrl: afterImageUrl
            };

            await storeData('store-testimonial', testimonial);
            navigate('/');
        } catch(error) {
            console.error('Error submitting testimonial:', error);
        } finally {
            setIsSubmitting(false);
            setOpenTestimonialDialog(false);
        }
    };

    const handleAfterImageUpload = (files) => {
        if (files && files.length > 0) {
            setTestimonialData(prev => ({
                ...prev,
                afterImage: files[0]
            }));
        }
    };

    // Testimonial Dialog Component
    const TestimonialDialog = () => (
        <Dialog 
            open={openTestimonialDialog} 
            onClose={() => setOpenTestimonialDialog(false)}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>Share Your Success Story</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="textSecondary" paragraph>
                    Would you like to share your success story to inspire others?
                </Typography>

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Your Success Story"
                    variant="outlined"
                    value={testimonialData.content}
                    onChange={(e) => setTestimonialData(prev => ({
                        ...prev, 
                        content: e.target.value
                    }))}
                    margin="normal"
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={testimonialData.shareIdentity}
                            onChange={(e) => setTestimonialData(prev => ({
                                ...prev, 
                                shareIdentity: e.target.checked
                            }))}
                        />
                    }
                    label="I agree to share my identity with this testimonial"
                />

                {feedbackData.selectedOrder.images && 
                 feedbackData.selectedOrder.images.length > 0 && (
                    <>
                        <Typography variant="subtitle1" sx={{ mt: 2 }}>
                            Select a Before Picture (Optional)
                        </Typography>
                        <ImageList sx={{ width: '100%', height: 200 }} cols={3} rowHeight={164}>
                            {feedbackData.selectedOrder.images.map((image, index) => (
                                <ImageListItem 
                                    key={index}
                                    sx={{ 
                                        cursor: 'pointer',
                                        border: testimonialData.selectedBeforeImage === image 
                                            ? '2px solid primary.main' 
                                            : 'none'
                                    }}
                                    onClick={() => setTestimonialData(prev => ({
                                        ...prev, 
                                        selectedBeforeImage: image
                                    }))}
                                >
                                    <img
                                        src={image}
                                        alt={`Before ${index + 1}`}
                                        loading="lazy"
                                    />
                                </ImageListItem>
                            ))}
                        </ImageList>
                    </>
                )}

                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">
                        Upload Current Picture (Optional)
                    </Typography>
                    <ImageUploader 
                        onUpload={handleAfterImageUpload}
                        maxFiles={1}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => navigate('/')}>Skip</Button>
                <Button 
                    onClick={handleTestimonialSubmit} 
                    variant="contained" 
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Submit'}
                </Button>
            </DialogActions>
        </Dialog>
    );

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
                    <Typography variant='h6'>
                        Provide Feedback for Order: {feedbackData.selectedOrder.orderId}
                    </Typography>

                    <Rating 
                        value={feedbackData.rating} 
                        onChange={(event, newValue) => setFeedbackData(prev => ({...prev, rating: newValue}))}
                        size="large"
                        sx={{ my: 2 }}
                    />
                    
                    <TextField 
                        fullWidth 
                        multiline 
                        rows={4} 
                        label='Comments' 
                        variant='outlined' 
                        value={feedbackData.comments}
                        onChange={(e) => setFeedbackData(prev => ({...prev, comments: e.target.value}))}
                        sx={{ mt: 2 }}
                    />
                    
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                        <Button 
                            variant='contained' 
                            color='primary' 
                            onClick={handleSubmitFeedback}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <CircularProgress size={24} /> : 'Submit Feedback'}
                        </Button>
                        <Button 
                            variant='outlined' 
                            onClick={() => navigate('/')}
                        >
                            Back to Main Page
                        </Button>
                    </Box>
                </Box>
            )}

            <TestimonialDialog />
        </Container>
    );
}

export default Feedback;