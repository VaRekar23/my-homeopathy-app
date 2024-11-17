import React, {useState, useEffect} from 'react';
import { fetchData, storeData } from '../../Helper/ApiHelper';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, CircularProgress, Grid, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TreatmentDetails from './TreatmentDetails';
import SaveIcon from '@mui/icons-material/Save';
import QuestionDetails from './QuestionDetails';
import ReviewQuestions from './ReviewQuestions';

function ConsultationAdmin() {
    const [treatmentDetails, setTreatmentDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('');

    useEffect(() => {
        const getTreatmentDetails = async () => {
            try {
                const treatments = await fetchData('get-treatments');
                setTreatmentDetails(treatments);
            } catch(error) {
                console.error('Error fetching documents', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        getTreatmentDetails();
    }, []);

    const handleAddParent = () => {
        const lastIndex = treatmentDetails.length>0 ? treatmentDetails[treatmentDetails.length-1].id : -1;
        setTreatmentDetails([...treatmentDetails, {id: String(parseInt(lastIndex,10)+1), image: '', name: '', subCategoryList : [{id: String(parseInt(lastIndex,10)+1)+'-0', categoryId: String(parseInt(lastIndex,10)+1), name: '', question_id: ''}]}]);
    };

    const handleAddChild = (parentIndex) => {
        const newTreatmentDetails = [...treatmentDetails];
        const lastIndex = newTreatmentDetails[parentIndex].subCategoryList[newTreatmentDetails[parentIndex].subCategoryList.length-1].id;
        const parts = lastIndex.split('-');
        const newIndex = parseInt(parts[1])+1;
        const newSubCategoryList = {id: parentIndex+'-'+newIndex, categoryId: parentIndex, name: '', question_id: ''};
        newTreatmentDetails[parentIndex].subCategoryList.push(newSubCategoryList);
        setTreatmentDetails(newTreatmentDetails);
    };

    const handleParentOnChange = (index, field, value) => {
        const newTreatmentDetails = [...treatmentDetails];
        newTreatmentDetails[index][field] = value;
        setTreatmentDetails(newTreatmentDetails);
    };

    const handleChildOnChange = (parentIndex, childIndex, field, value) => {
        const newTreatmentDetails = [...treatmentDetails];
        const newSubTreatmentDetails = [...newTreatmentDetails[parentIndex].subCategoryList];
        newSubTreatmentDetails[childIndex][field] = value;
        newTreatmentDetails[parentIndex].subCategoryList = newSubTreatmentDetails;
        setTreatmentDetails(newTreatmentDetails);
    };

    const handleRemoveParent = (parentIndex) => {
        const newTreatments = treatmentDetails.filter((_, i) => i !== parentIndex);
        setTreatmentDetails(newTreatments);
    };

    const handleRemoveChild = (parentIndex, childIndex) => {
        const newTreatmentDetails = [...treatmentDetails];
        const newSubCategoryList = newTreatmentDetails[parentIndex].subCategoryList.filter((_,i) => i !== childIndex);
        newTreatmentDetails[parentIndex].subCategoryList = newSubCategoryList;

        setTreatmentDetails(newTreatmentDetails);
    };

    const onSaveClick = async(e) => {
        setIsLoading(true);
        const response = storeData('store-treatments', treatmentDetails);
        setStatus(response);
    };

    useEffect(() => {
        setIsLoading(false);
    }, [status]);

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
            <Grid container spacing={2} direction="column">
                <Grid item xs={12} key={0}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box display='flex' width="100%" justifyContent="space-between" alignItems="center">
                                <Typography variant='h5'>Treatment Details</Typography>
                                
                                <Button variant="contained" color='primary' onClick={onSaveClick} startIcon={<SaveIcon />}>Save</Button>
                            </Box>                            
                        </AccordionSummary>
                        <AccordionDetails>
                            <TreatmentDetails treatmentDetails={treatmentDetails} 
                                            handleParentOnChange={handleParentOnChange}
                                            handleRemoveParent={handleRemoveParent}
                                            handleAddParent={handleAddParent}
                                            handleChildOnChange={handleChildOnChange}
                                            handleRemoveChild={handleRemoveChild}
                                            handleAddChild={handleAddChild} />
                        </AccordionDetails>
                    </Accordion>
                </Grid>
                <Grid item xs={12} key={1}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant='h5'>Add Questions</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <QuestionDetails treatmentDetails={treatmentDetails} />
                        </AccordionDetails>
                    </Accordion>
                </Grid>
                <Grid item xs={12} key={2}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant='h5'>Review Questions</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <ReviewQuestions treatmentDetails={treatmentDetails} />
                        </AccordionDetails>
                    </Accordion>
                </Grid>
            </Grid>
        )
      }
}

export default ConsultationAdmin;