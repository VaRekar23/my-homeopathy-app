import { Box, Grid, Typography } from '@mui/material';
import React from 'react';

function UserData({userData}) {
    const addressFormatter = (user) => {
        return user.building + ', ' + user.street + ', ' + user.city + ', ' + user.state + ' - ' + user.pinCode;
    }

    return (
        <Box key={userData.userId} sx={{padding: 3, borderRadius: '8px', flexDirection: 'column', width: '100%'}}>
            <Typography variant='subtitle1'><strong>Phone Number</strong> {userData.phone}</Typography>
            <Typography variant='body2'><strong>Name</strong> {userData.name}</Typography>
            <Typography variant='body2'><strong>Occupation</strong> {userData.occupation}</Typography>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Typography variant='body2'><strong>Date of Birth</strong> {new Date(userData.dob).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant='body2'><strong>Gender</strong> {userData.gender}</Typography>
                </Grid>
            </Grid>
            <Box sx={{display:'flex', flexDirection: 'column', alignItems:'left', padding:2, border: '1px solid #ccc', borderRadius: '8px', width:'full', gap:2}}>
                <Typography variant='body2'><strong>Address</strong> {addressFormatter(userData)}</Typography>
            </Box>

            {userData.lastUpdateDate &&
                <Box sx={{display:'flex', flexDirection: 'column', alignItems:'end', width:'full', padding:1}}>
                    {userData.isDeleted &&
                        <Typography variant='caption' >User Deleted</Typography>    
                    }
                    <Typography variant='caption' >Last Update Date: {new Date(userData.lastUpdateDate).toLocaleDateString()} {new Date(userData.lastUpdateDate).toLocaleTimeString()}</Typography>
                    <Typography variant='caption' >Updated By: {userData.updatedBy}</Typography>
                </Box>
            }
        </Box>
    );
}

export default UserData;