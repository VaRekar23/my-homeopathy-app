import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, IconButton, Menu, MenuItem, useMediaQuery, Box, Typography, Avatar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import './Header.css';
import { fetchMenuItem } from '../Helper/ApiHelper';
import { AccountCircle } from '@mui/icons-material';
import { signOut } from 'firebase/auth';
import { auth } from '../Helper/FirebaseConfig';
import { decryptData } from '../Helper/Secure';
import { useNavigate } from 'react-router-dom';

function Header({userDetails, menuDetails, setActiveComponent, setIsAdmin}) {
    const [menuItem, setMenuItem] = useState(menuDetails);
    const [anchorEl, setAnchorEl] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const openUserMenu = Boolean(anchorElUser);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    useEffect(() => {
        if (sessionStorage.getItem('user')!==null) {
            const user = decryptData(sessionStorage.getItem('user'));
            updateMenuForUsers(user.isAdmin);
        }
    }, []);

    const handleLoginOpen = () => navigate('/login');

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    }

    const handleClose = (component) => {
        setAnchorEl(null);
        setActiveComponent(component);
        navigate('/');
    }

    const handleUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    }

    const handleUserMenuClose = (component) => {
        setAnchorEl(null);
        setAnchorElUser(null);
        if (component==='Logout') {
            signOut(auth).then(() => {
                setMenuItem(menuDetails);
                setUserMenuSite(<MenuItem className='custom-primary-menu' onClick={handleLoginOpen}>Sign In</MenuItem>);
                setUserMenuMobile(<MenuItem onClick={handleLoginOpen}>Sign In</MenuItem>);
                setIsAdmin(false);
                sessionStorage.removeItem('user');
                setActiveComponent('Home');
            }).catch((error) => {
                console.log('Signout error', error);
            });
        } else {
            setActiveComponent(component);
        }
    }

    const handleMenuClick = (item) => {
        setActiveComponent(item);
        navigate('/');
    }

    const updateMenuForUsers = async (isAdmin) => {
        setIsAdmin(isAdmin);

        const menu = await fetchMenuItem('header-details', isAdmin ? 'admin' : 'user');
        setMenuItem(menu);

        setUserMenuSite(
            <>
                <IconButton size='large' edge='end' color='inherit' 
                            aria-controls= {openUserMenu ? 'user-menu':undefined}
                            aria-haspopup='true'
                            aria-expanded={openUserMenu ? 'true':undefined} 
                            onClick={handleUserMenu}>
                    <AccountCircle />
                </IconButton>
                
            </>
        );

        setUserMenuMobile(
            <>
                <MenuItem onClick={() => handleUserMenuClose('Account')}>Account</MenuItem>
                <MenuItem onClick={() => handleUserMenuClose('Logout')}>LogOut</MenuItem>
            </>
        );
    };

    const [userMenuMobile, setUserMenuMobile] = useState(<MenuItem onClick={handleLoginOpen}>Sign In</MenuItem>);
    const [userMenuSite, setUserMenuSite] = useState(<MenuItem className='custom-primary-menu' onClick={handleLoginOpen}>Sign In</MenuItem>);

    return (
        <>
        <AppBar position='fixed' className='custom-appbar'>
            <Toolbar className='custom-toolbar'>
                {/* Site Name as Home Link */}
                <Avatar src='/Homeopathy.png' />
                <Box sx={{ display:'flex', flexDirection:'column', alignItems: 'left', flexGrow: 1 }} onClick={() => window.location.href = '/'}>
                    {/* <img src='/SereneCare.png' alt='Logo' style={{ height: '70px', marginRight: '10px' }} onClick={() => window.location.href = '/'} /> */}
                    <Typography variant='h6' sx={{ color: theme.palette.primary.contrastText}}>SERENE CURE</Typography>
                    <Typography variant='caption' sx={{ color: theme.palette.primary.contrastText}}>Calm, Natural Healing for Life</Typography>
                </Box>

                {/* Menu items */}
                {isMobile ? (
                    <>
                        <IconButton size='large' edge='end' color='inherit' aria-label='menu' onClick={handleMenu}>
                            <MenuIcon />
                        </IconButton>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                            {Object.keys(menuItem).map((key) => (
                                <MenuItem key={key} onClick={() => handleClose(menuItem[key].item)}>{menuItem[key].item}</MenuItem>
                            ))}
                            {userMenuMobile}
                        </Menu>
                    </>
                ) : (
                    <>
                        {Object.keys(menuItem).map((key) => (
                            <MenuItem key={key} onClick={() => handleMenuClick(menuItem[key].item) }>{menuItem[key].item}</MenuItem>
                        ))}
                        {userMenuSite}
                        
                        <Menu id='user-menu' 
                            anchorEl={anchorElUser} 
                            open={openUserMenu} 
                            onClose={handleUserMenuClose} 
                            MenuListProps={{
                                'aria-labelledby': 'user-button', 
                            }}>
                            <MenuItem onClick={() => handleUserMenuClose('Account')}>Account</MenuItem>
                            <MenuItem onClick={() => handleUserMenuClose('Logout')}>LogOut</MenuItem>
                        </Menu>
                    </>
                )}
            </Toolbar>
        </AppBar>
        </>
    )
}

export default Header;