import { Box, Grid, Paper, Typography, useTheme } from '@mui/material';
import React from 'react';

function Footer({footerDetails}) {
    const theme = useTheme();

    return (
        <Paper component='footer' variant='outlined' sx={{ py: 3, px: 2, mt: 'auto', background: theme.palette.custom.background}} >
            <Grid container justifyContent='space-between'>
                <Grid item xs={6} textAlign='left'>
                    <Typography variant='caption' >
                        © 2024 SereneCure
                    </Typography>
                    <Typography variant='caption' display="block" color='text.secondary'>
                        All rights reserved.
                    </Typography>
                </Grid>
                <Grid item xs={6} textAlign='right'>
                    <Typography variant='body2' >
                        {footerDetails.doctor_name}
                    </Typography>
                    <Typography variant='body2' display="block">
                        {footerDetails.contact_detail}
                    </Typography>
                </Grid>
            </Grid>
        </Paper>
    );
}

export default Footer;