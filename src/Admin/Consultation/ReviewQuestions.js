import React, { useEffect, useState } from 'react';
import { fetchData } from '../../Helper/ApiHelper';
import { Box, Button, Chip, CircularProgress, Container, Divider, FormControl, Grid, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { Filter, FilterAlt, RestorePage } from '@mui/icons-material';
import './ConsultationAdmin.css';

function ReviewQuestions({treatmentDetails}) {
    const [formData, setFormData] = useState({
        treatmentId: '',
        subTreatmentId: '',
        parentQuestion: '',
    });
    const [question, setQuestion] = useState({
        questionName: '',
        options: [{optionName:'', childQuestionName:'', childQuestionId:''}]
    });
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [questionDetails, setQuestionDetails] = useState([]);
    const [dataMissing, setDataMissing] = useState(false);
    const [showFilter, setShowFilter] = useState(true);

    useEffect(() => {
        const getQuestionDetails = async () => {
            try {
                const questions = await fetchData('get-questions');
                setQuestionDetails(questions);
            } catch(error) {
                console.error('Error fetching question detials', error);
            } finally {
                setIsLoading(false);
            }
        }

        getQuestionDetails();
    }, []);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const onFilterClick = () => {
        setShowFilter(false);
        if (formData.parentQuestion!=='') {
            setDataMissing(false);
            formatQuestions(formData.parentQuestion);
        } else {
            const questionId = treatmentDetails[formData.treatmentId].subCategoryList[formData.subTreatmentId].questionId;
            if (questionId!=='') {
                setDataMissing(false);
                formatQuestions(questionId);
            } else {
                setDataMissing(true);
            }
        }
    };

    const formatQuestions = (questionId) => {
        console.log('Question Id', questionId);
        const filterQuestion = questionDetails[questionId];
        console.log('Filter Question', filterQuestion);
        if(filterQuestion) {
            const optionsWithChildQuestion = filterQuestion.options.map(option => {
                const childQuestion = questionDetails[option.childQuestionId];
                return {
                    optionName: option.option,
                    childQuestionName: childQuestion ? childQuestion.question: '',
                    childQuestionId: option.childQuestionId || ''
                };
            });
            setQuestion({
                questionName: filterQuestion.question,
                options: optionsWithChildQuestion
            })
        }
    };

    const onResetClick = () => {
        setFormData({
            treatmentId: '',
            subTreatmentId: '',
            parentQuestion: '',
        });
    }

    const toggleFilterVisibility = () => {
        setShowFilter(!showFilter);
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
            <>
            <Box sx={{display:'flex', flexDirection: 'column', alignItems:'center', padding:2, width:'full', gap:2}}>
                <Chip icon={<FilterAlt />} label={showFilter ? 'Hide Filter' : 'Show Filter'} onClick={toggleFilterVisibility}/>

                {showFilter && (
                <Box sx={{border: '1px solid #ccc', borderRadius: '8px', padding:2, width:'100%', gap:2}}>
                    <Grid container spacing={2}>
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
                                            <MenuItem key={index} value={index}>{subTreatmentDetails.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                    </Grid>
                    <Divider orientation="horizontal" flexItem sx={{ marginX: 2 }} >
                        OR
                    </Divider>
                    <FormControl variant='standard' fullWidth sx={{ padding:2 }}>
                        <InputLabel sx={{ padding:2 }}>Question</InputLabel>
                        <Select name='parentQuestion'
                            value={formData.parentQuestion}
                            onChange={handleInputChange}>
                            {Object.keys(questionDetails).length>0 &&
                                Object.entries(questionDetails).map(([key, questionData]) => (
                                    <MenuItem key={key} value={questionData.questionId}>{questionData.question}</MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>

                    <div className='container'>
                        <Button variant="contained" color='info' className='custom-button' sx={{mt:2}}
                                onClick={onFilterClick} startIcon={<FilterAlt />}>Filter</Button>
                        <Button variant="contained" color='secondary' className='custom-button' sx={{mt:2}}
                                onClick={onResetClick} startIcon={<RestorePage />}>Reset</Button>
                    </div>
                </Box>
                )}
            </Box>
                <Box sx={{display:'flex', flexDirection: 'column', alignItems:'left', padding:2, border: '1px solid #ccc', borderRadius: '8px', width:'full', gap:2}}>
                    {dataMissing ? (
                        <Typography variant='body'>Question is not added for this, please add by expanding 'Add Question'</Typography>
                    ): (
                        <>
                            {question.questionName && (
                                <>
                                    <Typography variant='h6' gutterBottom>{question.questionName}</Typography>
                                    {question.options.map((option, index) => (
                                        <Box sx={{display:'flex', 
                                                flexDirection:'row', 
                                                padding: '8px',
                                                marginY: '8px',
                                                border: '1px solid #ddd',
                                                borderRadius: '8px',
                                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                width: '100%'}}>
                                            <Typography variant='subtitle1' sx={{ flex: 1, fontWeight: 'bold' }}>{option.optionName}</Typography>
                                            <Typography variant='body1' 
                                                        sx={{ marginLeft: '16px', color: option.childQuestionId ? 'primary.main' : 'text.secondary', cursor: option.childQuestionId ? 'pointer' : 'default' }}
                                                        onClick={() => option.childQuestionId ? formatQuestions(option.childQuestionId):null}>
                                                        {option.childQuestionName || 'No next question present'}
                                            </Typography>
                                        </Box>
                                    ))}
                                </>
                            )}
                        </>
                    )}
                </Box>
            </>
        );
    }
}

export default ReviewQuestions;