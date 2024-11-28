import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { fetchData, fetchUserData } from '../../Helper/ApiHelper';
import { decryptData } from '../../Helper/Secure';
import Consultation from './Consultation';

function ConsultationWrapper({ consultationData }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    treatmentDetails: [],
    questionDetails: [],
    userData: null
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const userDataFromSession = sessionStorage.getItem('user');
        const userData = userDataFromSession ? decryptData(userDataFromSession) : null;

        const [treatments, questions] = await Promise.all([
          fetchData('get-treatments'),
          fetchData('get-questions')
        ]);

        setData({
          treatmentDetails: treatments,
          questionDetails: questions,
          userData: userData
        });
      } catch (error) {
        console.error('Error loading consultation data:', error);
        setError('Failed to load consultation data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <CircularProgress color="primary" size={50} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return <Consultation 
    consultationData={consultationData}
    initialTreatmentDetails={data.treatmentDetails}
    initialQuestionDetails={data.questionDetails}
    initialUserData={data.userData}
  />;
}

export default ConsultationWrapper; 