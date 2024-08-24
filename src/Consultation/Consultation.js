import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

function Consultation ()  {
    return(
        <>
            <Box 
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '90%'  // Makes the Box take up the full viewport height
            }}
        >
            <CircularProgress color="primary" size={50} />
        </Box>
        </>
    );
}

export default Consultation;