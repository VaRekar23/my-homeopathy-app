import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';
import React, {useEffect, useState} from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../Helper/FirebaseConfig';
import { fetchUserData } from '../Helper/ApiHelper';
import AddNewUser from './AddNewUser';
import { decryptData } from '../Helper/Secure'

function Login({setIsAdmin, handleClose, width}) {
    const [phone, setPhone] = useState('');
    const [otp, setOTP] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [user, setUser] = useState(null);
    const [verificationId, setVerificationId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAddNewUser, setShowAddNewUser] = useState(false);

    const setupRecaptcha = () => {
        window.recaptchaVerifier = new RecaptchaVerifier(
            auth,
            'recaptcha-container',
            {
                size: 'invisible',
                callback: (response) => {
                    setIsOtpSent(true);
                },
            }
        );
    };

    const requestOtp = (e) => {
        e.preventDefault();
        setLoading(true);
        setupRecaptcha();

        const phoneNumber = '+91'+phone;
        const appVerifier = window.recaptchaVerifier;
    
        signInWithPhoneNumber(auth, phoneNumber, appVerifier)
            .then((confirmationResult) => {
                window.confirmationResult = confirmationResult;
                setVerificationId(confirmationResult.verificationId);
                setLoading(false);
            }).catch((error) => {
                setLoading(false);
                console.log('Error sending OTP:', error);
            });
    };

    const verifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        const confirmationResult = window.confirmationResult;

        confirmationResult.confirm(otp).then((result) => {
            const user = result.user;
            setLoading(false);
            setUser(user.uid);
            verifyUser(user.uid);
        }).catch((error) => {
            console.log('Error verifing OTP', error);
            setLoading(false);
        });
    };

    const verifyUser = async (userId) => {
        try {
            const users = await fetchUserData('get-users', userId);
            if (users.length!==0) {
                sessionStorage.setItem('user', users.encryptedData);
                setIsAdmin(users.isAdmin);
                handleClose();
            } else {
                setShowAddNewUser(true);
            }
        } catch(error) {
            console.error('Error fetching documents', error);
        }
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" mt={4}
            sx={{position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                width: {width},
                bgcolor: 'background.paper', 
                borderRadius: 2,
                border: '2px solid #000', 
                boxShadow: 24,
                p: 4}} >
            {!showAddNewUser ? (
                <>
                    <Typography variant='h6' gutterBottom>
                        Authentication
                    </Typography>

                    <form onSubmit={requestOtp} style={{ width: '100%', maxWidth: '400px' }}>
                        <TextField label='Phone Number' variant='outlined' fullWidth margin='normal' value={phone} type='number' onChange={(e) => setPhone(e.target.value)} />
                        <Button type='submit' variant='contained' color='primary' fullWidth disabled={loading || phone.length!==10}>
                            {loading ? <CircularProgress size={24} /> : 'Send OTP'}
                        </Button>
                    </form>

                    <div style={{alignContent:'center'}} id='recaptcha-container'></div>
            
                    {verificationId && (
                        <form onSubmit={verifyOtp} style={{ width: '100%', maxWidth: '400px', marginTop: '16px' }} >
                            <TextField label='OTP' variant='outlined' fullWidth margin='normal' value={otp} type='number' onChange={(e) => setOTP(e.target.value)} />
                            <Button type='submit' variant='contained' color='primary' fullWidth disabled={loading || otp.length!==6}>
                                {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
                            </Button>
                        </form>
                    )}
                </>
            ):(
                <AddNewUser phoneNumber={phone} user={user} setIsAdmin={setIsAdmin} handleClose={handleClose} />
            )}
        </Box>
    );
}

export default Login;