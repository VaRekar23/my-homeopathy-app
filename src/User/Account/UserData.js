import { Box, Grid, Typography } from '@mui/material';
import React from 'react';

function UserData({userData}) {
    return (
        <Box key={userData.userId} sx={{padding: 3, borderRadius: '8px', flexDirection: 'column'}}>
            <Typography variant='subtitle1'><strong>Phone Number</strong> {userData.phone}</Typography>
            <Typography variant='body2'><strong>Name</strong> {userData.name}</Typography>
            <Typography variant='body2'><strong>Occupation</strong> {userData.occupation}</Typography>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Typography variant='body2'><strong>Date of Birth</strong> {userData.dob}</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant='body2'><strong>Gender</strong> {userData.gender}</Typography>
                </Grid>
            </Grid>
            <Box sx={{display:'flex', flexDirection: 'column', alignItems:'left', padding:2, border: '1px solid #ccc', borderRadius: '8px', width:'full', gap:2}}>
                <Typography variant='body2'><strong>Building</strong> {userData.building}</Typography>
                <Typography variant='body2'><strong>Street</strong> {userData.street}</Typography>
                <Typography variant='body2'><strong>City</strong> {userData.city}</Typography>
                <Typography variant='body2'><strong>State</strong> {userData.state}</Typography>
                <Typography variant='body2'><strong>Pin Code</strong> {userData.pinCode}</Typography>
            </Box>
        </Box>
    );
}

export default UserData;