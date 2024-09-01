import { Container, Typography, styled } from '@mui/material';
import React from 'react';
import './About.css';

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

            <Container className='hero' style={{padding:'20px'}}>
                <Container className='clinic-address'>
                    <Typography variant='h5'>{uiDetails.clinic_name}</Typography>
                    <Typography variant='body1'>{uiDetails.address_1}</Typography>
                    <Typography variant='body1'>{uiDetails.address_2}</Typography>
                    <Typography variant='body1'>{uiDetails.city}</Typography>
                    <Typography variant='body1'>{uiDetails.phone}</Typography>
                </Container>

                <Container className='clinic-map'>
                    <iframe 
                        src={uiDetails.map_url} 
                        width="600" 
                        height="450" 
                        style={{border:0 }} 
                        allowFullScreen="" 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade">
                        </iframe>
                </Container>
            </Container>
        </StyledContainer>
    );

};

export default About;