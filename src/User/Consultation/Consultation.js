import React, { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { fetchData, fetchUserData, storeData } from '../../Helper/ApiHelper';
import { decryptData } from '../../Helper/Secure';
import { Alert, Button, Card, CardContent, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, FormControlLabel, FormGroup, Grid, InputLabel, MenuItem, Select, TextField, Typography, useTheme } from '@mui/material';

function Consultation ({consultationData, initialTreatmentDetails, initialQuestionDetails, initialUserData})  {
    const [formData, setFormData] = useState({
        treatmentId: consultationData.treatmentId || '',
        subTreatmentId: consultationData.subTreatmentId || '',
        userId: initialUserData?.userId || '',
        additionalInfo: '',
        questions: [],
        followUpOrderId: null
    });

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

    const handleFollowUpConfirm = () => {
        setFormData({ ...formData, followUpOrderId: existingOrder.orderId });
        setShowFollowUp(false);
    };
    
    const handleFollowUpCancel = () => {
        setFormData({ ...formData, followUpOrderId: null });
        setShowFollowUp(false);
    };

    const handleSubmit = () => {
        const response = storeData('store-order', formData);
        setStatus(response);
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
                        
                        <Button variant='contained'
                                color='primary'
                                sx={{ marginTop: 2 }}
                                onClick={handleSubmit} >
                            Submit
                        </Button>
                        </>
                    )}
                    
                </Box>
                
            </>
        );
    }
}

export default Consultation;