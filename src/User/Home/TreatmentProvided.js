import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Grid, Paper, Avatar } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function TreatmentProvided({treatmentCategory, setActiveComponent, setConsultationData}) {

    const handleOnClick = (treatmentId, subTreatmentId) => {
        setConsultationData({ treatmentId, subTreatmentId });
        setActiveComponent('Consultation');
    };

    return (
        <Grid container spacing={2} direction="column">
            {treatmentCategory.map((item, index) => (
                <Grid item xs={12} key={index}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Avatar src={`/Images/${item.image}`} alt={item.image} sx={{ width: 40, height: 40, marginRight: 2 }} />
                            <Typography variant='h6'>{item.name}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                            {item.subCategoryList.map((subCat, subIndex) => (
                                <Grid item xs={2} sm={4} md={4} key={subIndex}>
                                    <Paper sx={{ padding: 2, textAlign: 'center', cursor: 'pointer',
                                                '&:hover': { backgroundColor: '#f5f5f5', }}} 
                                            onClick={() => handleOnClick(item.id, subCat.id)} >
                                        <Typography variant='body1'>{subCat.name}</Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                            
                            
                        </AccordionDetails>
                    </Accordion>
                </Grid>
            ))}
        </Grid>
    );
}

export default TreatmentProvided;