import React, { useEffect, useState } from 'react';
import {styled} from '@mui/system';
import { Box, CircularProgress, Container, Paper, Typography } from '@mui/material';
import CommonDisease from './CommonDisease';
import TreatmentProvided from './TreatmentProvided';
import CustomerReview from './CustomerReview';
import { fetchData } from '../Helper/ApiHelper';
import './Home.css';

function Home({uiDetails}) {
    const [homeDetails, setHomeDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const treatmentCategory = [
        { category: 'Hair Treatment', subCategory : ['Hair Fall', 'White Hair', 'Dandruff', 'Hair thickness']},
        { category: 'Skin Treatment', subCategory: ['Rash', 'Sun burn', 'Pimple']},
        { category: 'Respiratory', subCategory: ['Lung health','Asthma']}
    ];
    const customerReview = [
        { customerName: 'Vaibhav', treatment: 'Hair Treatment', disease: 'Hair Fall', beforePhoto: 'path/to/beforePhoto', 
            afterPhoto: 'path/to/afterPhoto', customerRating: 5},
        { customerName: 'Anju', treatment: 'Skin Treatment', disease: 'Rash', beforePhoto: 'path/to/beforePhoto', 
            afterPhoto: 'path/to/afterPhoto', customerRating: 3},
        { customerName: 'Prasad', treatment: 'Respiratory', disease: 'Asthma', beforePhoto: null, 
            afterPhoto: null, customerRating: 4}
    ];

    useEffect(() => {
        const getUIDetails = async () => {
          try {
            const homeData = await fetchData('home-details');
            console.log('HomeData', homeData);
            setHomeDetails(homeData);
          } catch(error) {
            console.error('Error fetching documents', error);
          } finally {
            setIsLoading(false);
          }
        };
        
        getUIDetails();
      }, []);

    const StyledContainer = styled(Container) ({
        marginTop: '20px',
    });

    const ScrollContainer = styled('div') ({
        display: 'flex',
        overflowX: 'auto',
        padding: '10px 0',
        maxWidth: '100%',
    });

    const CenteredContainer = styled('div') ({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px 0',
    });

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
        <StyledContainer style={{color: '#36454F'}}>
            {/* Doctor's Intro */}
            <Typography variant='h4' gutterBottom>
                {uiDetails.welcome}
            </Typography>
            <Typography variant='subtitle1'>
                {uiDetails.specialize}
            </Typography>

            <Typography variant='h5' gutterBottom style={{marginTop: '20px'}}>
                {uiDetails.header_para2}
            </Typography>
            <Typography variant='subtitle2'>
                {uiDetails.body_para2}
            </Typography>

            {/* Partition Common Remedies*/}
            <Paper className='custom-paper' elevation={0}>
                <Typography variant='h6' className='custom-center'>
                    {uiDetails.common_disease}
                </Typography>

                <CenteredContainer>
                    <ScrollContainer>
                        {homeDetails.recent_treatment.map((recentTreatment, index) => (
                            <CommonDisease key={index} disease={recentTreatment.treatmentName} imgPath={recentTreatment.imgPath} />
                        ))}
                    </ScrollContainer>
                </CenteredContainer>
            </Paper>

            { /* Partition Treatments Provided*/}
            <Paper className='custom-paper' elevation={0}>
                <Typography variant='h6' className='custom-center'>{uiDetails.treatment_provided}</Typography>
            </Paper>
            <TreatmentProvided treatmentCategory={treatmentCategory} />

            { /* Partition Reviews*/}
            <Paper className='custom-paper' elevation={0}>
                <Typography variant='h6' className='custom-center'>{uiDetails.reviews}</Typography>
                <Typography variant='body1' className='custom-center'>{uiDetails.cure_count}</Typography>
            </Paper>
            <CustomerReview customerRating={customerReview} />

            <Paper style={{ margin: '20px 0', padding: '10px', backgroundColor: '#F2F2F2'}} elevation={3}>
                <Typography variant='h6'>{uiDetails.contact_tab}</Typography>
                <Typography variant='body2'>{uiDetails.contact_name}</Typography>
                <Typography variant='body2'>{uiDetails.contact_phone}</Typography>
            </Paper>

        </StyledContainer>
    );
}
}

export default Home;