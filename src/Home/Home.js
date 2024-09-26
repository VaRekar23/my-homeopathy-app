import React, { useEffect, useState } from 'react';
import {styled} from '@mui/system';
import { Box, CircularProgress, Container, Paper, Rating, Typography } from '@mui/material';
import CommonDisease from './CommonDisease';
import TreatmentProvided from './TreatmentProvided';
import CustomerReview from './CustomerReview';
import { fetchData } from '../Helper/ApiHelper';
import './Home.css';
import ErrorPage from '../ErrorPage';

function Home({uiDetails}) {
    const [homeDetails, setHomeDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getUIDetails = async () => {
          try {
            const homeData = await fetchData('home-details');
            setHomeDetails(homeData);
          } catch(error) {
            console.log('Error fetching documents', error);
            return (<ErrorPage />);
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
        <StyledContainer>
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
                <TreatmentProvided treatmentCategory={homeDetails.treatments} />
            </Paper>

            { /* Partition Reviews*/}
            <Paper className='custom-paper' elevation={0}>
                <Typography variant='h6' className='custom-center'>{uiDetails.reviews}</Typography>
                <Box className='custom-center'>
                    <Rating name='customer-rating' value={homeDetails.overall_feedback.rating} readOnly sx={{ color: 'gold'}} />
                    <Typography variant='body1'>
                        {homeDetails.overall_feedback.rating} ratings of {homeDetails.overall_feedback.totalCount} reviews!
                    </Typography>
                </Box>
                <Typography variant='body1' className='custom-center'>{uiDetails.cure_count}</Typography>

                <CenteredContainer>
                    <ScrollContainer>
                        <CustomerReview customerRating={homeDetails.feedbacks} overallRating={homeDetails.overall_feedback} />
                    </ScrollContainer>
                </CenteredContainer>
            </Paper>

        </StyledContainer>
    );
}
}

export default Home;