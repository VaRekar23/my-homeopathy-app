import React from 'react';
import { Avatar, Card, CardContent, Typography } from '@mui/material';
import {styled} from '@mui/system';

function CommonDisease({ disease, imgPath }) {
    const DiseaseCard = styled(Card) ({
        minWidth: '250px',
        marginRight: '15px',
    });

    return (
        <DiseaseCard>
            <CardContent sx={{ display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center', }}>
                <Typography variant='h6'>{disease}</Typography>
                <Avatar src={`/Images/${imgPath}`} alt={disease} variant='rounded' sx={{ width: 80, height: 80, mb:2 }}/>
            </CardContent>
        </DiseaseCard>
    );
}

export default CommonDisease;