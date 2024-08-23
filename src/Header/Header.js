import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, useMediaQuery, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import logo from './SereneCare.png';

function Header({headerDetails, menuDetails}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    }

    const handleClose = (path) => {
        setAnchorEl(null);
        navigate(path);
    }

    return (
        <AppBar position='fixed' className='custom-toolbar'>
            <Toolbar>
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
                    <img src={logo} alt='Logo' style={{ height: '64px', marginRight: '10px' }} onClick={() => window.location.href = '/'} />
                </Box>

                {/* Menu items */}
                {isMobile ? (
                    <>
                        <IconButton size='large' edge='end' color='inherit' aria-label='menu' onClick={handleMenu}>
                            <MenuIcon />
                        </IconButton>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                            {Object.keys(menuDetails).map((key) => (
                                <MenuItem key={key} onClick={() => handleClose(menuDetails[key].path)}>{menuDetails[key].item}</MenuItem>
                            ))}
                        </Menu>
                    </>
                ) : (
                    <>
                        {Object.keys(menuDetails).map((key) => (
                            <MenuItem key={key} onClick={() => window.location.href = menuDetails[key].path}>{menuDetails[key].item}</MenuItem>
                        ))}
                    </>
                )}
            </Toolbar>
        </AppBar>
    )
}

export default Header;