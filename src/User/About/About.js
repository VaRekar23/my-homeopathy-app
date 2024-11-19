import { Box, Container, Typography, styled } from '@mui/material';
import React from 'react';
import './About.css';
import { CalendarMonth, Call, LocationOn, Schedule } from '@mui/icons-material';

function About({uiDetails}) {
    const StyledContainer = styled(Container) ({
        marginTop: '20px',
    });

    return (
        <StyledContainer>
            <Container className='hero'>
                <Container className='hero-left'>
                    <img src={uiDetails.img_path} alt='error' />
                </Container>
                <Container className='hero-right'>
                    <Typography variant='h5'>
                        {uiDetails.dr_name}
                    </Typography>
                    <Typography variant='subtitle1'>
                        {uiDetails.degree}
                    </Typography>
                    <Typography variant='subtitle2'>
                        {uiDetails.intro}
                    </Typography>
                </Container>
            </Container>

            { uiDetails.addresses ? (
            uiDetails.addresses.map((address, index) => (
                <Container className='hero' style={{padding:'20px'}} key={index}>
                    <Container className='clinic-address'>
                        <Typography variant='h5'>{address.clinic_name}</Typography>
                        <Box display='flex' alignItems='center'>
                            <LocationOn sx={{ mr: 1 }} />
                            <Typography variant='body1'>{address.address_1}</Typography>
                        </Box>
                        <Box display='flex' alignItems='center' sx={{ pl: '30px' }}>
                            <Typography variant='body1'>{address.address_2}</Typography>
                        </Box>
                        <Box display='flex' alignItems='center' sx={{ pl: '30px' }}>
                            <Typography variant='body1'>{address.city}</Typography>
                        </Box>
                        <Box display='flex' alignItems='center' sx={{ pl: '30px' }}>
                            <Typography variant='body1'>{address.state}</Typography>
                        </Box>
                        <Box display='flex' alignItems='center' sx={{ pl: '30px' }}>
                            <Typography variant='body1'>{address.pin_code}</Typography>
                        </Box>
                        <Box display='flex' alignItems='center'>
                            <Call sx={{ mr:1 }} />
                            <Typography variant='body1'>{address.phone}</Typography>
                        </Box>
                        {address.workings.map((working, i) => (
                            <div key={i} style={{ padding: '2' }}>
                                <Box display='flex' alignItems='center'>
                                    <CalendarMonth sx={{ mr:1 }} />
                                    <Typography variant='body1'>{working.days}</Typography>
                                </Box>
                                <Box display='flex' alignItems='center'>
                                    <Schedule sx={{ mr:1 }} />
                                    <Typography variant='body1'>{working.timing}</Typography>
                                </Box>
                            </div>
                        ))}
                    </Container>

                    <Container className='clinic-map'>
                        <iframe 
                            title="Map"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3753.0276803532174!2d72.71282687499793!3d19.83878168152923!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be71f00085f4515%3A0xf9b3bc0b6bfe74fb!2sDhanmeher's%20Health%20Care%20Clinic!5e0!3m2!1sen!2sin!4v1731990215529!5m2!1sen!2sin"
                            width="600" 
                            height="450" 
                            style={{border:0 }} 
                            allowFullScreen="" 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade">
                        </iframe>
                    </Container>
                </Container>
            ))): (<></>)}
        </StyledContainer>
    );

};

export default About;