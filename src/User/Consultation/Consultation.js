import React, { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { fetchData, fetchUserData, storeData } from '../../Helper/ApiHelper';
import { decryptData } from '../../Helper/Secure';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';


function Consultation ({consultationData})  {
    const [formData, setFormData] = useState({
        treatmentId: consultationData.treatmentId,
        subTreatmentId: consultationData.subTreatmentId,
        userId: '',
        additionalInfo: '',
        questions: [],
        followUpOrderId: null
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isDataSaved, setIsDataSaved] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [childUsers, setChildUsers] = useState([]);
    const [userData, setUserData] = useState(null);
    const [treatmentDetails, setTreatmentDetails] = useState([]);
    const [questionDetails, setQuestionDetails] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [visibleQuestions, setVisibleQuestions] = useState([]);
    const [status, setStatus] = useState('');
    const [orderDetails, setOrderDetails] = useState([]);
    const [existingOrder, setExistingOrder] = useState(null);
    const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);

    useEffect(() => {
        const getTreatmentDetails = async () => {
            try {
                const treatments = await fetchData('get-treatments');
                setTreatmentDetails(treatments);
                const questions = await fetchData('get-questions');
                setQuestionDetails(questions);

                if (formData.subTreatmentId !== '') {
                    setFormData({...formData, 'questions': []});
                    setVisibleQuestions([treatments[formData.treatmentId].subCategoryList.find(subTreat => subTreat.id===formData.subTreatmentId).questionId]);
                    if (treatments[formData.treatmentId].subCategoryList.find(subTreat => subTreat.id===formData.subTreatmentId).questionId !== '') {
                        setIsVisible(false);
                    } else {
                        setIsVisible(true);
                    }
                }
            } catch(error) {
                console.error('Error fetching documents', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        getTreatmentDetails();
        if (sessionStorage.getItem('user')!==null) {
            setUserData(decryptData(sessionStorage.getItem('user')));
        }
    }, []);

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

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        if (name === 'subTreatmentId') {
            setFormData({...formData, 'questions': []});
            setVisibleQuestions([treatmentDetails[formData.treatmentId].subCategoryList.find(subTreat => subTreat.id===value).questionId]);
            if (treatmentDetails[formData.treatmentId].subCategoryList.find(subTreat => subTreat.id===value).questionId !== '') {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            const filteredOrder = Object.entries(orderDetails)
                                .filter(([key, val]) => {
                                    const match = val.userId === formData.userId &&
                                                val.treatmentId === formData.treatmentId &&
                                                val.subTreatmentId === value;
                                    return match;
                                })
                                .sort(([keyA, valA], [keyB, valB]) => {
                                    // Sort by createDate.seconds in descending order
                                    return valB.createDate.seconds - valA.createDate.seconds;
                                })
                                .reduce((acc, [key, value]) => {
                                    acc[key] = value;
                                    return acc;
                                }, {});

            const latestOrder = Object.entries(filteredOrder)[0]?.[1] || null;
            if (latestOrder) {
                setExistingOrder(latestOrder);
                setShowFollowUpDialog(true);
            } else {
                setExistingOrder(null);
                setShowFollowUpDialog(false);
            }
        }
        setFormData({
            ...formData,
            [name]: value,
        });
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

    const handleFollowUpConfirm = () => {
        setFormData({ ...formData, followUpOrderId: existingOrder.orderId });
        setShowFollowUpDialog(false);
    };
    
    const handleFollowUpCancel = () => {
        setFormData({ ...formData, followUpOrderId: null });
        setShowFollowUpDialog(false);
    };

    const handleSubmit = () => {
        const response = storeData('store-order', formData);
        setStatus(response);
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
                <Dialog open={showFollowUpDialog} onClose={handleFollowUpCancel}>
                    <DialogTitle>Follow Up Confirmation</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                        You have a recent order for same treatment.
                        Are you following up for same order with ID{' '}
                        {existingOrder?.orderId} created on{' '}
                        {existingOrder?.createDate &&
                            new Date(existingOrder.createDate.seconds * 1000).toLocaleDateString()}{' '}
                        at{' '}
                        {existingOrder?.createDate &&
                            new Date(existingOrder.createDate.seconds * 1000).toLocaleTimeString()}
                        ?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleFollowUpCancel}>No</Button>
                        <Button onClick={handleFollowUpConfirm} color="primary">Yes</Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }
}

export default Consultation;