import { Box, Button, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import React, {useEffect, useState} from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../Helper/FirebaseConfig';
import { fetchUserData } from '../Helper/ApiHelper';
import AddNewUser from './AddNewUser';
import { useNavigate } from 'react-router-dom';

function Login({setIsAdmin}) {
    const [phone, setPhone] = useState('');
    const [otp, setOTP] = useState('');
    const [user, setUser] = useState(null);
    const [verificationId, setVerificationId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAddNewUser, setShowAddNewUser] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (sessionStorage.getItem('user')!==null)
            navigate('/');

        return () => {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        };

    }, [navigate]);

    const setupRecaptcha = () => {
        window.recaptchaVerifier = new RecaptchaVerifier(
            auth,
            'recaptcha-container',
            {
                size: 'invisible',
                callback: (response) => {
                    //setIsOtpSent(true);
                },
            }
        );
    };

    const requestOtp = async (e) => {
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
                if (window.recaptchaVerifier) {
                    window.recaptchaVerifier.clear();
                }
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
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
            if (users.length!==0) {
                sessionStorage.setItem('user', users.encryptedData);
                setIsAdmin(users.isAdmin);
                navigate('/', {state: {users}});
            } else {
                setIsAdmin(false);
                navigate('/adduser', {state: {userId, phone}})
                setShowAddNewUser(true);
            }
        } catch(error) {
            console.error('Error fetching documents', error);
        }
    };

    return (
        <Box flexDirection="column" 
            sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'  // Makes the Box take up the full viewport height
            }}
        >
            <Typography variant='h6' gutterBottom>Login</Typography>
            {!verificationId ? (
                <>
                    <Typography variant='subtitle1'>Enter Mobile Number</Typography>
                    <Alert severity='info'>This number will be used to contact you!!</Alert>
                    <form onSubmit={requestOtp} >
                        <TextField label='Phone Number' variant='outlined' fullWidth margin='normal' value={phone} type='number' onChange={(e) => setPhone(e.target.value)} />
                        <Button type='submit' variant='contained' color='primary' fullWidth disabled={loading || phone.length!==10}>
                            {loading ? <CircularProgress size={24} /> : 'Send OTP'}
                        </Button>
                    </form>

                    <div style={{alignContent:'center'}} id='recaptcha-container'></div>
                </>
            ) : (
                <>
                    <Typography variant='subtitle1'>Enter Confirmation Code</Typography>
                    <Typography variant='body1'>Enter the code received on {phone}</Typography>

                    <form onSubmit={verifyOtp} >
                        <TextField label='OTP' variant='outlined' fullWidth margin='normal' value={otp} type='number' onChange={(e) => setOTP(e.target.value)} />
                        <Button type='submit' variant='contained' color='primary' fullWidth disabled={loading || otp.length!==6}>
                            {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
                        </Button>
                    </form>
                </>
            )}
        </Box>
    );
    
}

export default Login;