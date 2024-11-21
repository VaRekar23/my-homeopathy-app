import React from 'react';
import { Typography, Box, Rating, Card, CardContent, useTheme } from '@mui/material';
import { decryptData } from '../../Helper/Secure';


function CustomerReview({customerRating, overallRating}) {
    const theme = useTheme();
    return (
        <>
            {customerRating.map((item, index) => (
                <Card sx={{ minWidth: 275, 
                            marginRight: '15px', 
                            border: '2px solid',
                            borderColor: theme.palette.custom.blue, 
                            borderRadius: '8px',
                            background: theme.palette.custom.background}}
                    key={index}>
                    <CardContent>
                        <Box sx={{ display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center'}}>
                            <Typography variant='h6'>{decryptData(item.customerData).name}</Typography>
                            <Rating name='customer-rating' value={item.ratings} readOnly sx={{ color: 'gold'}} />
                        </Box>
                        <Box>
                            <Typography variant='body1'>{item.comments}</Typography>
                            <Typography variant='body2'>Treatment: {item.treatmentSubcategory}</Typography>
                            {(item.beforePhoto || item.afterPhoto) &&
                                <>
                                    <Typography variant='body2'>Photos:</Typography>
                                    <img src={item.beforePhoto} alt='Before' style={{ width:'50%', height:'auto'}} />
                                    <img src={item.afterPhoto} alt='After' style={{ width:'50%', height:'auto'}} />
                                </>
                            }
                        </Box>
                    </CardContent>
                </Card>
            ))}
        </>
    );
}

export default CustomerReview;