import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, List, ListItem, ListItemText, Grid, Divider, Box, Rating } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function CustomerReview({customerRating}) {
    return (
        <Grid container spacing={2} direction="column">
            {customerRating.map((item, index) => (
                <Grid item xs={12} key={index}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                            <Box>
                                <Typography variant='h6'>{item.customerName}</Typography>
                                <Typography variant='body1'>Treatment: {item.treatment}</Typography>
                            </Box>
                            <Rating name='customer-rating' value={item.customerRating} readOnly sx={{ color: 'gold'}} />
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography variant='body1'>{item.disease}</Typography>
                            {item.beforePhoto &&
                                <>
                                    <Typography variant='body1'>Photos:</Typography>
                                    <img src={item.beforePhoto} alt='Before photo' style={{ width:'50%', height:'auto'}} />
                                    <img src={item.afterPhoto} alt='Before photo' style={{ width:'50%', height:'auto'}} />
                                </>
                            }
                        </AccordionDetails>
                    </Accordion>
                </Grid>
            ))}
        </Grid>
    );
}

export default CustomerReview;