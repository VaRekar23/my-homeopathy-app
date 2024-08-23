import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, List, ListItem, ListItemText, Grid, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function TreatmentProvided({treatmentCategory}) {
    return (
        <Grid container spacing={2} direction="column">
            {treatmentCategory.map((item, index) => (
                <Grid item xs={12} key={index}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant='h6'>{item.category}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                {item.subCategory.map((subCat, subIndex) => (
                                    <React.Fragment key={subIndex}>
                                        <ListItem>
                                            <ListItemText primary={subCat} />
                                            { subIndex < item.subCategory.lenght-1 && <Divider />}
                                        </ListItem>
                                    </React.Fragment>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                </Grid>
            ))}
        </Grid>
    );
}

export default TreatmentProvided;