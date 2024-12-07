import React, { useEffect, useState } from 'react';
import { decryptData, encryptData } from '../../Helper/Secure';
import { fetchUserData, storeData } from '../../Helper/ApiHelper';
import { 
    Box, Button, Card, CardContent, CardHeader, Container, 
    Divider, Fab, Grid, IconButton, Typography, useTheme,
    Dialog, DialogTitle, DialogContent, DialogActions,
    CircularProgress
} from '@mui/material';
import { AddCircle, Delete, Edit, Person, PersonAdd } from '@mui/icons-material';
import AddNewUser from '../../Login/AddNewUser';
import dayjs from 'dayjs';
import { useSnackbar } from '../../hooks/useSnackbar';

function Account() {
    const theme = useTheme();
    const { showSnackbar, SnackbarComponent } = useSnackbar();
    const [childUsers, setChildUsers] = useState([]);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEdit, setIsEdit] = useState(false);
    const [isAddNewUser, setIsAddNewUser] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, index: null });

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

    const handleDelete = async (index) => {
        try {
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
            };

            await storeData('store-user', request);
            showSnackbar('User deleted successfully', 'success');
            setDeleteConfirm({ open: false, index: null });
            
            // Refresh user list
            const updatedUsers = [...childUsers];
            updatedUsers[index].userData.isDeleted = true;
            setChildUsers(updatedUsers);
        } catch (error) {
            showSnackbar('Failed to delete user', 'error');
        }
    };

    const handleUpdateDone = async (index) => {
        const updateChildUsers = [...childUsers];
        updateChildUsers[index].isEdit = false;
        setChildUsers(updateChildUsers);
        await refreshChildUsers(userData.userId);
    };

    const handleNewUserAdded = async () => {
        await refreshChildUsers(userData.userId);
        setIsAddNewUser(false);
        showSnackbar('Family member added successfully', 'success');
    };

    function HandleUniqueId() {
        const uniqueId = `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        return uniqueId;
    }

    const UserCard = ({ user, index, isParent }) => (
        <Card 
            elevation={3}
            sx={{
                mb: 2,
                opacity: user.isDeleted ? 0.6 : 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 6
                }
            }}
        >
            <CardHeader
                avatar={
                    <Person 
                        color={isParent ? "primary" : "action"}
                        sx={{ width: 32, height: 32 }}
                    />
                }
                action={
                    !user.isDeleted && (
                        <Box>
                            <IconButton 
                                onClick={() => isParent ? setIsEdit(true) : handleEdit(index)}
                                color="primary"
                            >
                                <Edit />
                            </IconButton>
                            {!isParent && (
                                <IconButton 
                                    onClick={() => setDeleteConfirm({ open: true, index })}
                                    color="error"
                                >
                                    <Delete />
                                </IconButton>
                            )}
                        </Box>
                    )
                }
                title={
                    <Typography variant="h6" color={isParent ? "primary" : "textPrimary"}>
                        {user.name} {isParent && "(Primary)"}
                    </Typography>
                }
                subheader={user.phone}
            />
            <Divider />
            <CardContent>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                            Age: {user.age}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                            Gender: {user.gender}
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

    const refreshChildUsers = async (userId) => {
        try {
            setIsLoading(true);
            const childUsersData = await fetchUserData('get-allusers', userId);
            const updatedUsers = childUsersData.map(user => ({
                userData: decryptData(user.encryptedData),
                isEdit: false
            }));
            setChildUsers(updatedUsers);
        } catch (error) {
            console.error('Error refreshing users:', error);
            showSnackbar('Failed to refresh user list', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress color="primary" size={50} />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom color="primary">
                    Account Management
                </Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                    Manage your account and family members
                </Typography>
            </Box>

            {/* Primary User */}
            {isEdit ? (
                <AddNewUser 
                    user_Id={userData.userId} 
                    phoneNumber={userData.phone} 
                    isParent={true} 
                    editData={userData} 
                    setContentVisible={setIsEdit} 
                    isEdit={true} 
                />
            ) : (
                <UserCard user={userData} isParent={true} />
            )}

            {/* Family Members */}
            <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" color="primary">
                        Family Members
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PersonAdd />}
                        onClick={() => setIsAddNewUser(true)}
                        disabled={isAddNewUser}
                    >
                        Add Family Member
                    </Button>
                </Box>

                {/* Existing Family Members */}
                {childUsers.map((childUser, index) => (
                    childUser.isEdit ? (
                        <AddNewUser 
                            key={index}
                            user_Id={childUser.userData.userId} 
                            phoneNumber={userData.phone} 
                            isParent={false} 
                            editData={childUser.userData} 
                            parentId={userData.userId} 
                            setContentVisible={() => handleUpdateDone(index)} 
                            isEdit={true} 
                        />
                    ) : (
                        <UserCard 
                            key={index}
                            user={childUser.userData} 
                            index={index} 
                            isParent={false}
                        />
                    )
                ))}

                {/* Add New User Form */}
                {isAddNewUser && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                        <AddNewUser 
                            user_Id={HandleUniqueId()} 
                            phoneNumber={userData.phone} 
                            isParent={false} 
                            parentId={userData.userId} 
                            setContentVisible={setIsAddNewUser}
                            onSuccess={handleNewUserAdded}
                            isEdit={false} 
                        />
                    </Box>
                )}
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, index: null })}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this family member?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirm({ open: false, index: null })}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={() => handleDelete(deleteConfirm.index)} 
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <SnackbarComponent />
        </Container>
    );
}

export default Account;
