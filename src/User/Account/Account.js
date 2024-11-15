import React, { useEffect, useState, useId } from 'react';
import { decryptData, encryptData } from '../../Helper/Secure';
import { fetchUserData, storeData } from '../../Helper/ApiHelper';
import { Box, CircularProgress, IconButton, List, ListItem, Paper, Typography } from '@mui/material';
import UserData from './UserData';
import { AddCircle, Delete, Edit } from '@mui/icons-material';
import AddNewUser from '../../Login/AddNewUser';
import dayjs from 'dayjs';

function Account () {
    const [childUsers, setChildUsers] = useState([]);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEdit, setIsEdit] = useState(false);
    const [isAddNewUser, setIsAddNewUser] = useState(false);

    useEffect(() => {
        const getAllUserDetails = async (userId) => {
            try {
                setChildUsers([]);
                const childUsersData = await fetchUserData('get-allusers', userId);
                childUsersData.forEach((user, index) => {
                    const userData = decryptData(user.encryptedData);
                    setChildUsers((prevChildUsers) => {
                        const isExisting = prevChildUsers.some((data) => data.userData.userId === userData.userId);
                        if (!isExisting) {
                            return [...prevChildUsers, {userData: userData, isEdit: false}];
                        }
                        return prevChildUsers;
                    })  
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

    const handleDelete = (index) => {
        const updateChildUsers = [...childUsers];
        const updateUserData = updateChildUsers[index].userData;
        const deleteUser = {
            ...updateUserData,
            isDeleted: true,
            lastUpdateDate: dayjs(),
            updatedBy: userData.name
        };
        const cipherData = encryptData(deleteUser);

        const request = {
            userId: updateUserData.userId,
            isAdmin: false,
            isParent: false,
            encryptedData: cipherData,
            parentId: userData.userId
        }

        const response = storeData('store-user', request);
    }

    const handleUpdateDone = (index) => {
        const updateChildUsers = [...childUsers];
        updateChildUsers[index].isEdit = false;

        setChildUsers(updateChildUsers);
    }

    function HandleUniqueId() {
        const uniqueId = `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        return uniqueId;
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
                <Paper key={userData.userId} elevation={3} sx={{ marginBottom: '10px', padding: '5px' }}>
                    <ListItem>
                        {isEdit ? (
                                <AddNewUser user_Id={userData.userId} phoneNumber={userData.phone} isParent={true} editData={userData} setContentVisible={setIsEdit} isEdit={true} />
                            ) : (
                                <>
                                <UserData userData={userData} isEdit={isEdit} isParent={true} setContentVisible={setIsEdit} />
                                <IconButton onClick={() => setIsEdit(true)} sx={{ alignContent: 'end' }}><Edit /></IconButton>
                                </>
                            )
                        }
                        
                    </ListItem>
                </Paper>
                {childUsers.map((childUser, index) => (
                    <Paper key={index} elevation={3} 
                        sx={{ marginBottom: '10px', padding: '5px', opacity: childUser.userData.isDeleted ? 0.5 : 1, backgroundColor: childUser.userData.isDeleted ? 'lightgrey' : 'white' }}>
                        <ListItem>
                            {!childUser.isEdit ? (
                                <>
                                <UserData userData={childUser.userData} isEdit={childUser.isEdit} isParent={false} setContentVisible={setIsEdit} />
                                {!childUser.userData.isDeleted && 
                                    <>
                                    <IconButton onClick={() => handleEdit(index)}><Edit /></IconButton>
                                    <IconButton onClick={() => handleDelete(index)}><Delete /></IconButton>
                                    </>
                                }
                                </>
                            ) : (
                                <AddNewUser user_Id={childUser.userData.userId} phoneNumber={userData.phone} isParent={false} editData={childUser.userData} parentId={userData.userId} setContentVisible={() => handleUpdateDone(index)} isEdit={true} />
                            )
                            }
                        </ListItem>
                    </Paper>
                ))}

                {isAddNewUser ? (
                    <AddNewUser user_Id={HandleUniqueId()} phoneNumber={userData.phone} isParent={false} parentId={userData.userId} setContentVisible={setIsAddNewUser} isEdit={false} />
                ) : (
                    <IconButton color="success" onClick={() => setIsAddNewUser(true)} >
                        <AddCircle />
                    </IconButton>
                )}
            </List>

        );
    }
}

export default Account;
