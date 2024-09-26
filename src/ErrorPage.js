import { Error } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import React from 'react';

function ErrorPage() {
    return (
        <>
            <Box display='flex' alignItems='center'>
                <Error sx={{ mr: 1 }} />
                <Typography variant='body1'>We are working on resolving error... Apologies for inconvenience</Typography>
            </Box>
        </>
    );
}

export default ErrorPage;