import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import {styled} from '@mui/system';

function CommonDisease({ disease, imgPath }) {
    const DiseaseCard = styled(Card) ({
        minWidth: '250px',
        marginRight: '15px',
    });

    return (
        <DiseaseCard>
            <CardContent>
                <Typography variant='h6'>{disease}</Typography>
                <img src={imgPath} alt={disease} style={{ width: '100%', height: 'auto' }} />
            </CardContent>
        </DiseaseCard>
    );
}

export default CommonDisease;