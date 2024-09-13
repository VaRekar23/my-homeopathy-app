import { Box, Button, TextField, Typography } from '@mui/material';
import React, {useState} from 'react';

function Login({setIsAdmin, handleClose}) {
    const [phone, setPhone] = useState('');
    const [otp, setOTP] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [error, setError] = useState(null);

    const handleSendOtp = () => {
        if (!phone) {
            setError('Please enter your phone number');
            return;
        } else if (phone.length !== 10) {
            setError('Please enter a valid phone number');
            return;
        }

        setIsOtpSent(true);
    }

    const handleLogin = () => {
        if (!otp) {
            setError('Please enter the OTP');
            return;
        }

        //Add logic to fetch user from DB
        if (phone === '9527406312') {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }

        handleClose();
    }

    return (
        <Box sx={{position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                width: 400,
                bgcolor: 'background.paper', 
                borderRadius: 2,
                border: '2px solid #000', 
                boxShadow: 24, 
                p: 4}} >
            <Typography variant='h6' gutterBottom>
                {isOtpSent ? 'Enter OTP' : 'Enter Phone Number'}
            </Typography>

            {!isOtpSent ? (
                <>
                    <TextField fullWidth
                                label= 'Phone Number'
                                variant= 'outlined'
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                error={!!error}
                                helperText={error}
                                margin='normal'
                    />
                    <Button variant='contained' fullWidth onClick={handleSendOtp}>Send OTP</Button>
                </>
            ) : (
                <>
                    <TextField fullWidth
                                label= 'OTP'
                                variant= 'outlined'
                                value={otp}
                                onChange={(e) => setOTP(e.target.value)}
                                error={!!error}
                                helperText={error}
                                margin='normal'
                    />
                    <Button variant='contained' fullWidth onClick={handleLogin}>Login</Button>
                </>
            )}
        </Box>
    );
}

export default Login