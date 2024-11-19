import React from 'react';
import { Avatar, Card, CardContent, Typography, useTheme } from '@mui/material';
import {styled} from '@mui/system';

function CommonDisease({ disease, imgPath }) {
    const theme = useTheme();

    const DiseaseCard = styled(Card) ({
        minWidth: '250px',
        marginRight: '15px',
        background: theme.palette.secondary.main,
    });

    return (
        <DiseaseCard>
            <CardContent sx={{ display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center', }}>
                <Typography variant='h6' sx={{color: theme.palette.secondary.contrastText}}>{disease}</Typography>
                <Avatar src={`/Images/${imgPath}`} alt={disease} variant='rounded' sx={{ width: 80, height: 80, mb:2 }}/>
            </CardContent>
        </DiseaseCard>
    );
}

export default CommonDisease;