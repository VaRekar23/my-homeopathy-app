import React, { useEffect, useState } from 'react';
import { decryptData } from '../../Helper/Secure';
import { fetchUserData } from '../../Helper/ApiHelper';
import { Box, CircularProgress, IconButton, List, ListItem, Paper } from '@mui/material';
import UserData from './UserData';
import { Edit } from '@mui/icons-material';
import AddNewUser from '../../Login/AddNewUser';

function Account () {
    const [childUsers, setChildUsers] = useState([]);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        const getAllUserDetails = async (userId) => {
            try {
                const childUsers = await fetchUserData('get-allusers', userId);
                childUsers.forEach((user, index) => {
                    const userData = decryptData(user.encryptedData);
                    setChildUsers((prevChildUsers) => [...prevChildUsers, {userData: userData, isEdit: false}]);
                });
            } catch(error) {
                console.error('Error fetching question detials', error);
            } finally {
                setIsLoading(false);
            }
        }

        if (sessionStorage.getItem('user')!==null) {
            const user = decryptData(sessionStorage.getItem('user'));
            setUserData(user);
            getAllUserDetails(user.userId);
        }
    }, []);

    const handleEdit = (index) => {
        const updateChildUsers = [...childUsers];
        updateChildUsers[index].isEdit = true;

        setChildUsers(updateChildUsers);
    }

    if (isLoading) {
        return (
          <>
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'  // Makes the Box take up the full viewport height
              }}
            >
              <CircularProgress color="primary" size={50} />
            </Box>
          </>);
    } else {
        return (
            <List>
                <Paper key={userData.userId} elevation={3} sx={{ marginBottom: '10px', padding: '15px' }}>
                    <ListItem>
                        {isEdit ? (
                                <AddNewUser userId={userData.userId} phoneNumber={userData.phone} isParent={true} editData={userData} setContentVisible={setIsEdit} />
                            ) : (
                                <>
                                <UserData userData={userData} isEdit={isEdit} isParent={true} setContentVisible={setIsEdit} />
                                <IconButton onClick={() => setIsEdit(true)}><Edit /></IconButton>
                                </>
                            )
                        }
                        
                    </ListItem>
                </Paper>
                {childUsers.map((childUser, index) => (
                    <Paper key={index} elevation={3} sx={{ marginBottom: '10px', padding: '15px' }}>
                        <ListItem>
                            <UserData userData={childUser.userData} isEdit={childUser.isEdit} isParent={false} setContentVisible={setIsEdit} />
                        </ListItem>
                        {!childUser.isEdit &&
                            <IconButton onClick={() => handleEdit(index)}><Edit /></IconButton>
                        }
                    </Paper>
                ))}
            </List>
        );
    }
}

export default Account;
