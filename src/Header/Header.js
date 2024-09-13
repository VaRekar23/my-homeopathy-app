import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, useMediaQuery, Box, Modal } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import Login from '../Login/Login';

function Header({headerDetails, menuDetails, setActiveComponent, setIsAdmin}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    }

    const handleClose = (component) => {
        setAnchorEl(null);
        //navigate(path);
        setActiveComponent(component)
    }

    const handleLoginOpen = () => setOpen(true);
    const handleLoginClose = () => setOpen(false);

    const handleLogin = () => {
        <Modal open={true} onClose={handleLoginClose} >
            <Login setIsAdmin={setIsAdmin} handleClose={handleLoginClose} />
        </Modal>
    }

    return (
        <AppBar position='fixed' className='custom-appbar'>
            <Toolbar className='custom-toolbar'>
                {/* Site Name as Home Link */}
                <Box sx={{ display:'flex', alignItems: 'center', flexGrow: 1 }}>
                    {/*<DoctorIcon sx={{ fontSize:40, mr:1 }} />*/}
                    {/* <HeaderLogo style={{ fontSize:50 }} /> */}
                    {/*<MedicalServices fontSize="large" />*/}
                    {/*<Box> */}
                    {/*    <Typography className='heading' variant='h6' component="div" sx={{ cursor: 'pointer' }} onClick={() => window.location.href = '/'}> */}
                    {/*        {headerDetails.clinic_name} */}
                    {/*    </Typography> */}
                    {/*    <Typography variant='caption' component="div" className='slogan'> */}
                    {/*        {headerDetails.slogan} */}
                    {/*    </Typography> */}
                    {/*</Box> */}
                    <img src='/SereneCare.png' alt='Logo' style={{ height: '70px', marginRight: '10px' }} onClick={() => window.location.href = '/'} />
                </Box>

                {/* Menu items */}
                {isMobile ? (
                    <>
                        <IconButton size='large' edge='end' color='inherit' aria-label='menu' onClick={handleMenu}>
                            <MenuIcon />
                        </IconButton>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                            {Object.keys(menuDetails).map((key) => (
                                <MenuItem key={key} onClick={() => handleClose(menuDetails[key].item)}>{menuDetails[key].item}</MenuItem>
                            ))}
                            <MenuItem onClick={handleLogin}>Sign In</MenuItem>
                        </Menu>
                    </>
                ) : (
                    <>
                        {Object.keys(menuDetails).map((key) => (
                            <MenuItem key={key} onClick={() => setActiveComponent(menuDetails[key].item) }>{menuDetails[key].item}</MenuItem>
                        ))}
                        <MenuItem className='custom-primary-menu' onClick={handleLogin}>Sign In</MenuItem>
                    </>
                )}
            </Toolbar>
        </AppBar>
    )
}

export default Header;