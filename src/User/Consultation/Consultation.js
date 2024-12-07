import React, { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { fetchData, fetchUserData, maskImage, storeData, uploadImage } from '../../Helper/ApiHelper';
import { decryptData } from '../../Helper/Secure';
import { Alert, Button, Card, CardActions, CardContent, CardMedia, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, FormControlLabel, FormGroup, Grid, IconButton, InputLabel, MenuItem, Select, TextField, Typography, useTheme } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFormHandler } from '../../hooks/useFormHandler';
import { ImageUploader } from '../../components/shared/ImageUploader';
import { useSnackbar } from '../../hooks/useSnackbar';


function Consultation ({consultationData, initialTreatmentDetails, initialQuestionDetails, initialUserData})  {
    const { showSnackbar, SnackbarComponent } = useSnackbar();
    const { formData, errors, isSubmitting, setIsSubmitting, validateForm, handleChange, setFormData } = useFormHandler(
        {
            treatmentId: consultationData.treatmentId || '',
            subTreatmentId: consultationData.subTreatmentId || '',
            userId: initialUserData?.userId || '',
            additionalInfo: '',
            questions: [],
            followUpOrderId: null,
            images: [],
            maskImages: false,
            storeImagesConsent: false,
        },
        {
            treatmentId: { required: true },
            subTreatmentId: { required: true },
            userId: { required: true }
        }
    );

    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isDataSaved, setIsDataSaved] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [childUsers, setChildUsers] = useState([]);
    const [userData, setUserData] = useState(initialUserData);
    const [treatmentDetails, setTreatmentDetails] = useState(initialTreatmentDetails);
    const [questionDetails, setQuestionDetails] = useState(initialQuestionDetails);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [visibleQuestions, setVisibleQuestions] = useState([]);
    const [status, setStatus] = useState('');
    const [orderDetails, setOrderDetails] = useState([]);
    const [existingOrder, setExistingOrder] = useState(null);
    const [showFollowUp, setShowFollowUp] = useState(false);
    const [showRecentOrder, setShowRecentOrder] = useState(false);
    const theme = useTheme();
    const [isFollowUp, setIsFollowUp] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [maskedImages, setMaskedImages] = useState([]);
    const [imageProcessingInfo, setImageProcessingInfo] = useState([]);
    const [imageConsent, setImageConsent] = useState(false);
    const [maskFace, setMaskFace] = useState(false);
    const [imageError, setImageError] = useState('');
    const [openConsentDialog, setOpenConsentDialog] = useState(false);
    const [isMasking, setIsMasking] = useState(false);

    useEffect(() => {
        if (!initialUserData && sessionStorage.getItem('user') !== null) {
            setUserData(decryptData(sessionStorage.getItem('user')));
        }
    }, [initialUserData]);

    useEffect(() => {
        if (status !== '') {
            setIsDataSaved(true);
        }
    }, [status]);

    useEffect(() => {
        const getAllUserDetails = async () => {
            try {
                const childUsers = await fetchUserData('get-allusers', userData.userId);
                const orders = await fetchUserData('get-ordersbyId', userData.userId);
                setOrderDetails(orders);
                childUsers.forEach((user, index) => {
                    const userData = decryptData(user.encryptedData);
                    if (!userData.isDeleted) {
                        setChildUsers((prevChildUsers) => [...prevChildUsers, userData]);
                    }
                });
            } catch(error) {
                console.error('Error fetching question detials', error);
            } finally {
                setIsLoading(false);
            }
        }

        if (userData !== null) {
            getAllUserDetails();
            setFormData({
                ...formData,
                'userId': userData.userId,
            });
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
            setIsLoading(false);
        }
    }, [userData]);

    useEffect(() => {
        if (formData.userId && formData.treatmentId && formData.subTreatmentId && treatmentDetails.length > 0) {
            try {
                const selectedTreatment = treatmentDetails[formData.treatmentId];
                const selectedSubTreatment = selectedTreatment.subCategoryList.find(
                    subTreat => subTreat.id === formData.subTreatmentId
                );

                // Check for existing orders with same treatment details
                if (orderDetails && Object.keys(orderDetails).length > 0) {
                    const pendingStatuses = ['PDR', 'PP', 'PD', 'MC'];
                    const completedStatuses = ['FP', 'C'];

                    // Find pending orders
                    const pendingOrder = Object.values(orderDetails).find(order => 
                        order.treatmentId === formData.treatmentId &&
                        order.subTreatmentId === formData.subTreatmentId &&
                        order.userId === formData.userId &&
                        pendingStatuses.includes(order.status)
                    );
                    if (pendingOrder) {
                        setShowRecentOrder(true);
                        setExistingOrder(pendingOrder);
                        setIsVisible(false); // Hide the form
                        return;
                    } else {
                        setShowRecentOrder(false);
                    }

                    // Find completed orders for follow-up
                    const completedOrders = Object.values(orderDetails).filter(order => 
                        order.treatmentId === formData.treatmentId &&
                        order.subTreatmentId === formData.subTreatmentId &&
                        order.userId === formData.userId &&
                        completedStatuses.includes(order.status)
                    );

                    if (completedOrders.length > 0) {
                        const latestOrder = completedOrders.sort((a, b) => 
                            (b.createDate.seconds + b.createDate.nanos/1e9) - 
                            (a.createDate.seconds + a.createDate.nanos/1e9)
                        )[0];

                        setExistingOrder(latestOrder);
                        setShowFollowUp(true);
                    } else {
                        setExistingOrder(null);
                        setShowFollowUp(false);
                    }
                }

                if (selectedSubTreatment) {
                    setFormData(prev => ({...prev, questions: []}));
                    setVisibleQuestions([selectedSubTreatment.questionId]);
                    setIsVisible(!selectedSubTreatment.questionId);
                }
            } catch (error) {
                console.error('Error processing treatment details:', error);
            }
        }
    }, [formData.userId, formData.treatmentId, formData.subTreatmentId, treatmentDetails, orderDetails]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Reset questions and related fields when treatment or subTreatment changes
            ...(name === 'treatmentId' || name === 'subTreatmentId' ? {
                questions: [],
            } : {})
        }));

        // Reset selected options when treatment changes
        if (name === 'treatmentId' || name === 'subTreatmentId') {
            setSelectedOptions({});
            setVisibleQuestions([]);
            setIsVisible(false);
        }
    };

    const handleOptionChange = (questionID, questionName, optionValue, childQuestionID) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [questionID]: optionValue
        }));

        setFormData((prevFormData) => {
            const updatedQuestion = [...prevFormData.questions];
            const existingQuestionIndex = updatedQuestion.findIndex(q => q.questionName === questionName);

            if (existingQuestionIndex>=0) {
                updatedQuestion[existingQuestionIndex].optionSelected = optionValue;
            } else {
                updatedQuestion.push({questionName: questionName, optionSelected: optionValue})
            }

            return {
                ...prevFormData, questions: updatedQuestion
            };
        });
    
        if (childQuestionID) {
            setVisibleQuestions((prev) => [...prev, childQuestionID]);
        } else {
            setIsVisible(true);
        }
    };

    const renderQuestion = (questionID) => {
        if (!questionDetails[questionID]) return null;

        return (
            <Box key={questionID} sx={{ marginBottom: 2, padding: 2, border: '1px solid #ccc', borderRadius: '8px', width: '100%' }}>
                <Typography variant='subtitle1'>{questionDetails[questionID].question}</Typography>
                <FormControl fullWidth variant="outlined" sx={{ marginTop: 1 }}>
                    <InputLabel>Select an option</InputLabel>
                    <Select value={selectedOptions[questionID] || ''}
                            onChange={(e) => handleOptionChange(
                                                questionID,
                                                questionDetails[questionID].question,
                                                e.target.value,
                                                questionDetails[questionID].options.find(opt => opt.option === e.target.value).childQuestionId)
                                    }
                            label="Select an option" >
                        {questionDetails[questionID].options.map((option, index) => (
                            <MenuItem key={index} value={option.option}>
                                {option.option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        );
    };

    const handleFollowUpCheck = (event) => {
        setIsFollowUp(event.target.checked);

        if (event.target.checked) {
            setFormData({ ...formData, followUpOrderId: existingOrder.orderId });
        } else {
            setFormData({ ...formData, followUpOrderId: null });
        }
    }

    const handleSubmit = async () => {
        if (!validateForm()) {
            showSnackbar('Please fill all required fields', 'error');
            return;
        }

        if (selectedImages.length > 0 && !imageConsent) {
            setOpenConsentDialog(true);
            return;
        }

        try {
            setIsSubmitting(true);
            let updatedFormData = { ...formData };

            if (selectedImages.length > 0 && formData.storeImagesConsent) {
                const imageUrls = await uploadImages();
                updatedFormData.images = imageUrls;
            }

            await submitForm(updatedFormData);
            showSnackbar('Form submitted successfully!', 'success');
        } catch (error) {
            showSnackbar(error.message || 'An error occurred', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Add new function to handle image uploads
    const uploadImages = async () => {
        try {
            const uploadPromises = selectedImages.map(async (image) => {
                const formData = new FormData();
                
                // If masking is enabled and eyes were detected, use the masked image
                if (formData.maskImages && imageProcessingInfo.length > 0) {
                    const processedImage = imageProcessingInfo.find(
                        info => info.originalFileName === image.file.name
                    );
                    
                    if (processedImage && processedImage.eyesDetected) {
                        // Convert base64 to file
                        const base64Response = await fetch(processedImage.preview);
                        const blob = await base64Response.blob();
                        const maskedFile = new File([blob], image.file.name, { type: 'image/jpeg' });
                        formData.append('file', maskedFile);
                    } else {
                        formData.append('file', image.file);
                    }
                } else {
                    formData.append('file', image.file);
                }
                
                // Use ApiHelper's uploadImage method to get Firebase URL
                const imageUrl = await uploadImage('upload-image', formData);
                return imageUrl;
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            return uploadedUrls;
        } catch (error) {
            console.error('Error uploading images:', error);
            throw error;
        }
    };

    // Update submitForm to accept formData as parameter
    const submitForm = async (dataToSubmit) => {
        try {
            const response = await storeData('store-order', dataToSubmit);
            setStatus(response);
        } catch (error) {
            console.error('Error submitting form:', error);
            throw error;
        }
    };

    // Update dialog handler to match new pattern
    const handleDialogConfirm = async () => {
        setOpenConsentDialog(false);
        setIsSubmitting(true);
        try {
            await submitForm(formData); // In this case, no images to upload
        } catch (error) {
            console.error('Error during submission:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDialogCancel = () => {
        setOpenConsentDialog(false);
    };

    // Add this helper function to get status text
    const getStatusText = (status) => {
        const statusMap = {
            'PP': 'Payment Pending',
            'PD': 'Payment Done',
            'PDR': 'Pending Doctor Review',
            'MC': 'Medicine Courier',
            'FP': 'Feedback Pending',
            'C': 'Completed',
            'D': 'Delete'
        };
        return statusMap[status] || status;
    };

    const handleImageUpload = (files) => {
        if (selectedImages.length + files.length > 3) {
            showSnackbar('Maximum 3 images allowed', 'error');
            return;
        }

        // Validate file types and sizes
        const invalidFiles = files.filter(file => {
            const isValidType = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
            const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
            
            if (!isValidType) {
                showSnackbar('Only JPG, JPEG and PNG files are allowed', 'error');
                return true;
            }
            if (!isValidSize) {
                showSnackbar('Image size should be less than 10MB', 'error');
                return true;
            }
            return false;
        });

        if (invalidFiles.length > 0) return;

        // Create preview URLs for valid files
        const newImages = files.map(file => ({
            file: file,
            preview: URL.createObjectURL(file)
        }));

        setSelectedImages(prev => [...prev, ...newImages]);
    };

    const removeImage = (index) => {
        setSelectedImages(prev => {
            const newImages = [...prev];
            URL.revokeObjectURL(newImages[index].preview);
            const updatedImages = newImages.filter((_, i) => i!==index);
            return updatedImages;
        });

        setImageProcessingInfo(prev => {
            const newInfo = [...prev];
            const updatedImages = newInfo.filter((_, i) => i!==index);
            return updatedImages;
        });
    };

    const handleConsentChange = (event) => {
        setImageConsent(event.target.checked);
        setFormData(prev => ({
            ...prev,
            storeImagesConsent: event.target.checked,
            maskImages: event.target.checked ? maskFace : false
        }));
    };

    const handleMaskChange = async (event) => {
        setMaskFace(event.target.checked);
        if (imageConsent) {
            setFormData(prev => ({
                ...prev,
                maskImages: event.target.checked,
            }));
        }

        if (event.target.checked) {
            await previewBlurImage();
        }
    };

    const previewBlurImage = async () => {
        setIsMasking(true);
        try {
            // Create FormData for each image
            const promises = selectedImages.map(async (img, index) => {
                const formData = new FormData();
                formData.append("file", img.file);
                
                // Call API to get masked image response
                const response = await maskImage('preview-blurred-eyes', formData);
                
                return {
                    file: img.file, // Keep original file
                    preview: response.processedImage, // Base64 image from API
                    originalPreview: selectedImages[index].preview,
                    eyesDetected: response.eyesDetected === 'true',
                    eyesCount: parseInt(response.eyesCount),
                    originalFileName: response.originalFileName
                };
            });

            // Wait for all images to be processed
            const processedResults = await Promise.all(promises);
            setImageProcessingInfo(processedResults);
        } catch (error) {
            console.error('Error processing images:', error);
            // Handle error appropriately
        } finally {
            setIsMasking(false);
        }
    };

    useEffect(() => {
        return () => {
            // Cleanup preview URLs when component unmounts
            selectedImages.forEach(image => {
                URL.revokeObjectURL(image.preview);
            });
        };
    }, [selectedImages]);

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
    } else if (!isLoggedIn) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'  // Makes the Box take up the full viewport height
              }}
            >
                <Alert severity='warning'>Please Login first using <b>Sign In</b> button</Alert>
            </Box>
        );
    } else if (isDataSaved) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'  // Makes the Box take up the full viewport height
              }}
            >
                <Alert severity='success'>Your request is submitted and is being reviewed by Doctor!!</Alert>
            </Box>
        );
    } else {
        return (
            <>
                <Box sx={{display:'flex', flexDirection: 'column', alignItems:'center', padding:2, width:'100%', gap:3}}>
                    <FormControl variant='standard' fullWidth>
                        <InputLabel>For whom are you taking this consultation?</InputLabel>
                        <Select name='userId'
                                value={formData.userId}
                                onChange={handleInputChange}>
                                    <MenuItem key={0} value={userData.userId}>{userData.name}</MenuItem>
                                    {childUsers.length>0 && 
                                    childUsers.map((user, index) => (
                                        <MenuItem key={index+1} value={user.userId}>{user.name}</MenuItem>
                                    ))}
                        </Select>
                    </FormControl>
                    <Alert severity='info'>You can add more members from Account section!</Alert>
                    <Grid container spacing={2} sx={{ width: '100%' }}>
                        <Grid item xs={6}>
                            <FormControl variant='standard' fullWidth>
                                <InputLabel>Treatment</InputLabel>
                                <Select name='treatmentId'
                                        value={formData.treatmentId}
                                        onChange={handleInputChange}>
                                    {treatmentDetails.map((treatmentDetail, index) => (
                                        <MenuItem key={index} value={treatmentDetail.id}>{treatmentDetail.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        {formData.treatmentId && (
                            <Grid item xs={6}>
                                <FormControl variant='standard' fullWidth>
                                    <InputLabel>SubTreatment</InputLabel>
                                    <Select name='subTreatmentId'
                                            value={formData.subTreatmentId}
                                            onChange={handleInputChange}>
                                        {treatmentDetails[formData.treatmentId].subCategoryList.map((subTreatmentDetails, index) => (
                                            <MenuItem key={index} value={subTreatmentDetails.id}>{subTreatmentDetails.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                    </Grid>

                    <Divider sx={{ width: '100%', marginY: 2 }} />
                    {showRecentOrder && existingOrder && (
                        <Card sx={{ 
                            width: '100%',
                            border: '2px solid',
                            borderColor: theme.palette.custom.blue,
                            borderRadius: '8px',
                            background: theme.palette.custom.background,
                            mb: 2
                        }}>
                            <CardContent>
                                <Typography variant="h6" color="primary" gutterBottom>
                                    Pending Order Found
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="body1">
                                            <strong>Order ID:</strong> {existingOrder.orderId}
                                        </Typography>
                                        <Typography variant="body1">
                                            <strong>Status:</strong> {getStatusText(existingOrder.status)}
                                        </Typography>
                                        <Typography variant="body1">
                                            <strong>Created On:</strong> {new Date(existingOrder.createDate.seconds * 1000).toLocaleDateString()} 
                                            {' at '} 
                                            {new Date(existingOrder.createDate.seconds * 1000).toLocaleTimeString()}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" color="warning.dark">
                                        Please check the status of this order in the 'My Orders' section before creating a new one.
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    )}
                    {showFollowUp && existingOrder && (
                        <Card sx={{ width: 'fit-content', 
                                marginLeft: 0,
                                border: '2px solid',
                                borderColor: theme.palette.custom.blue, 
                                borderRadius: '8px',
                                background: theme.palette.custom.background}}>
                            <CardContent>
                                <FormGroup>
                                    <FormControlLabel control={
                                        <Checkbox checked={isFollowUp} onChange={handleFollowUpCheck} inputProps={{ 'aria-label': 'controlled' }}/>}
                                                    label='You have a recent order for same treatment. Are you following up for below order?' />
                                </FormGroup>
                                <Typography variant='subtitle1'>{existingOrder?.orderId}</Typography>
                                <Typography variant='subtitle1'>
                                    {existingOrder?.createDate &&
                                        new Date(existingOrder.createDate.seconds * 1000).toLocaleDateString()} 
                                    {' at '} 
                                    {existingOrder?.createDate &&
                                        new Date(existingOrder.createDate.seconds * 1000).toLocaleTimeString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    )}

                    {visibleQuestions.map((questionID) => renderQuestion(questionID))}

                    {isVisible && (
                        <>
                        <TextField label="Please provide any additional information"
                        variant="outlined"
                        fullWidth
                        name='additionalInfo'
                        value={formData.additionalInfo}
                        onChange={handleInputChange}
                        sx={{ marginTop: 2 }} />
                        
                        <Box sx={{ mt: 3, width: '100%' }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Upload Images (Optional)
                            </Typography>
                            
                            <ImageUploader 
                                onUpload={handleImageUpload}
                                isUploading={isSubmitting}
                                maxFiles={3}
                            />

                            {imageError && (
                                <Typography color="error" variant="caption" display="block">
                                    {imageError}
                                </Typography>
                            )}

                            {/* Image Previews */}
                            <Grid container spacing={2} sx={{ mt: 2 }}>
                                {maskFace ? (
                                    <>
                                    {imageProcessingInfo.map((image, index) => (
                                        <Grid item xs={4} key={index}>
                                            <Card>
                                                <CardMedia
                                                    component="img"
                                                    height="140"
                                                    image={image.eyesDetected ? image.preview : image.originalPreview}
                                                    alt={`Preview ${index + 1}`}
                                                    sx={{ objectFit: 'cover' }}
                                                />
                                                <CardContent sx={{ py: 1 }}>
                                                    {image.eyesDetected ? (
                                                        <Typography variant="caption" color="success.main">
                                                            Eyes detected and masked
                                                        </Typography>
                                                    ) : (
                                                        <Typography variant="caption" color="info.main">
                                                            No eyes detected
                                                        </Typography>
                                                    )}
                                                </CardContent>
                                                <CardActions sx={{ justifyContent: 'center' }}>
                                                    <IconButton 
                                                        size="small" 
                                                        color="error"
                                                        onClick={() => removeImage(index)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))}
                                    </>
                                ) : (
                                    <>
                                    {selectedImages.map((image, index) => (
                                        <Grid item xs={4} key={index}>
                                            <Card>
                                                <CardMedia
                                                    component="img"
                                                    height="140"
                                                    image={image.preview}
                                                    alt={`Preview ${index + 1}`}
                                                    sx={{ objectFit: 'cover' }}
                                                />
                                                <CardContent sx={{ py: 1 }}>
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => removeImage(index)}
                                                        sx={{ float: 'right' }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                    </>
                                )}
                            </Grid>

                            {/* Consent and Face Masking Options */}
                            {selectedImages.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <FormGroup>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={imageConsent}
                                                    onChange={handleConsentChange}
                                                />
                                            }
                                            label="I consent to share these images with the doctor for review"
                                        />
                                        {/* <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={maskFace}
                                                    onChange={handleMaskChange}
                                                    disabled={!imageConsent}
                                                />
                                            }
                                            label="Mask/blur eyes in images containing face"
                                        /> */}
                                    </FormGroup>
                                </Box>
                            )}
                        </Box>

                        <Button 
                            variant='contained'
                            color='primary'
                            sx={{ marginTop: 2 }}
                            onClick={handleSubmit}
                            disabled={isSubmitting || (selectedImages.length > 0 && !imageConsent)}
                        >
                            {isSubmitting ? (
                                <>
                                    <CircularProgress 
                                        size={24} 
                                        color="inherit" 
                                        sx={{ marginRight: 1 }}
                                    />
                                    Submitting...
                                </>
                            ) : (
                                'Submit'
                            )}
                        </Button>
                        </>
                    )}
                    
                </Box>
                
                {/* Consent Confirmation Dialog */}
                <Dialog
                    open={openConsentDialog}
                    onClose={handleDialogCancel}
                    aria-labelledby="consent-dialog-title"
                    aria-describedby="consent-dialog-description"
                >
                    <DialogTitle id="consent-dialog-title" sx={{ color: theme.palette.primary.main }}>
                        Images Not Included
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="consent-dialog-description">
                            You have uploaded {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''} but haven't provided consent to share them. 
                            These images will not be included in your consultation.
                            <br /><br />
                            Are you sure you want to proceed without including the images?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ padding: 2 }}>
                        <Button 
                            onClick={handleDialogCancel} 
                            variant="outlined"
                            color="primary"
                        >
                            Go Back
                        </Button>
                        <Button 
                            onClick={handleDialogConfirm} 
                            variant="contained"
                            color='primary'
                            autoFocus
                        >
                            Proceed Without Images
                        </Button>
                    </DialogActions>
                </Dialog>

                {isMasking && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 2 }}>
                        <CircularProgress size={24} />
                    </Box>
                )}
                <SnackbarComponent />
            </>
        );
    }
}

export default Consultation;