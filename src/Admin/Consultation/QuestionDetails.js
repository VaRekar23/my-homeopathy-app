import React, { useEffect, useState } from 'react';
import {FormLabel, Container, FormControl, Grid, InputLabel, MenuItem, Select, FormGroup, FormControlLabel, TextField, Checkbox, Box, Button, IconButton, CircularProgress} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { fetchData, storeData } from '../../Helper/ApiHelper';


function QuestionDetails({treatmentDetails}) {
    const [formData, setFormData] = useState({
        treatmentId: '',
        subTreatmentId: '',
        isParentQuestion: true,
        question: '',
        options: [''],
        parentQuestion: '',
        parentOption: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [questionDetails, setQuestionDetails] = useState([]);

    useEffect(() => {
        handleReset();
        setIsLoading(false);
    }, [status]);

    useEffect(() => {
        const getQuestionDetails = async () => {
            try {
                const questions = await fetchData('get-questions');
                setQuestionDetails(questions);
            } catch(error) {
                console.error('Error fetching question detials', error);
            }
        }

        getQuestionDetails();
    }, []);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name==='isParentQuestion') {
            setFormData({
                ...formData,
                [name]: event.target.checked,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleFieldChange = (index, event) => {
        const newFields = formData.options.map((field, i) => (i === index ? event.target.value : field));
        setFormData({
          ...formData,
          options: newFields,
        });
    };

    const handleAddField = () => {
        setFormData({
          ...formData,
          options: [...formData.options, ''],
        });
    };

    const handleRemove = (index) => {
        const newOptionFields = formData.options.filter((_, i) => i !== index);

        setFormData({...formData, options: newOptionFields});
    }

    const handleSave = () => {
        setIsLoading(true);
        const response = storeData('store-questions', formData);
        setStatus(response);
      };
    
    const handleReset = () => {
        setFormData({
            treatmentId: '',
            subTreatmentId: '',
            isParentQuestion: true,
            question: '',
            options: [''],
            parentQuestion: '',
            parentOption: '',
        });
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
          </>)
    } else {
        return (
            <Container>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <FormControl variant='standard' fullWidth>
                            <InputLabel>Treatment</InputLabel>
                            <Select name='treatmentId'
                                    value={formData.treatmentId}
                                    onChange={handleInputChange}>
                                {treatmentDetails.map((treatmentDetail, index) => (
                                    <MenuItem value={treatmentDetail.id}>{treatmentDetail.name}</MenuItem>
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
                                        <MenuItem value={subTreatmentDetails.id}>{subTreatmentDetails.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    )}
                </Grid>
                <FormGroup sx={{ padding:2 }}>
                    <FormControlLabel control={
                                        <Checkbox checked={formData.isParentQuestion} onChange={handleInputChange} name='isParentQuestion'/>
                                    }
                                    label="Is this first question of this Treatment?" />
                </FormGroup>
                {!formData.isParentQuestion &&
                <>
                    <FormControl variant='standard' fullWidth sx={{ padding:2 }}>
                        <InputLabel sx={{ padding:2 }}>Parent Question</InputLabel>
                        <Select name='parentQuestion'
                            value={formData.parentQuestion}
                            onChange={handleInputChange}>
                            {Object.keys(questionDetails).length>0 &&
                                Object.entries(questionDetails).map(([key, questionData]) => (
                                    <MenuItem value={questionData.questionId}>{questionData.question}</MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                    <FormControl variant='standard' fullWidth sx={{ padding:2 }}>
                        <InputLabel sx={{ padding:2 }}>Parent Option</InputLabel>
                        <Select name='parentOption' 
                            value={formData.parentOption}
                            onChange={handleInputChange}>
                            {formData.parentQuestion && (
                                questionDetails[formData.parentQuestion].options.map((optionData, _) => (
                                    <MenuItem value={optionData.optionId}>{optionData.option}</MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                </>
                }
                <TextField name='question'
                            value={formData.question}
                            onChange={handleInputChange}
                            fullWidth
                            label='Question'
                            style={{ padding:2 }} />

                {formData.options.map((option, index) => (
                    <Box display='flex' alignItems='center'>
                        <TextField key={index} label={`${index+1} - Option`}
                                value={option}
                                onChange={(event) => handleFieldChange(index, event)}
                                fullWidth
                                margin='normal' />
                        <IconButton color="error" onClick={() => handleRemove(index)}>
                            <Delete />
                        </IconButton>
                    </Box>
                ))}
                <Box textAlign='center' >
                    <Button variant='outlined' onClick={handleAddField}>Add Option</Button>
                </Box>

                <Box textAlign='center' mt={2}>
                    <Button variant='outlined' color='primary' onClick={handleSave} sx={{ marginRight: '10px' }}>Save</Button>
                    <Button variant='outlined' color='secondary' onClick={handleReset}>Reset</Button>
                </Box>
            </Container>
        );
    }
}

export default QuestionDetails;