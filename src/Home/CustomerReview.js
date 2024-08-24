import React from 'react';
import { Typography, Grid, Box, Rating, Card, CardContent } from '@mui/material';


function CustomerReview({customerRating, overallRating}) {
    return (
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
            {customerRating.map((item, index) => (
                <Grid item xs={2} sm={4} md={4} key={index}>
                    <Card sx={{ minWidth: 275 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center'}}>
                                <Typography variant='h6'>{item.customerName}</Typography>
                                <Rating name='customer-rating' value={item.ratings} readOnly sx={{ color: 'gold'}} />
                            </Box>
                            <Box>
                                <Typography variant='body1'>{item.comments}</Typography>
                                <Typography variant='body2'>Treatment: {item.treatmentCategory}</Typography>
                                <Typography variant='body2'>{item.treatmentSubcategory}</Typography>

                                {item.beforePhoto &&
                                <>
                                    <Typography variant='body2'>Photos:</Typography>
                                    <img src={item.beforePhoto} alt='Before' style={{ width:'50%', height:'auto'}} />
                                    <img src={item.afterPhoto} alt='After' style={{ width:'50%', height:'auto'}} />
                                </>
                                }
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}

export default CustomerReview;