import React, { useEffect, useState } from 'react';
import { decryptData } from '../../Helper/Secure';
import { fetchData, fetchUserData } from '../../Helper/ApiHelper';
import { Accordion, AccordionDetails, AccordionSummary, Box, Card, CardContent, CircularProgress, Container, Divider, Grid, List, ListItem, Paper, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function Orders () {
    const [userData, setUserData] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getOrderDetails = async (userId) => {
            try {
                const orders = await fetchUserData('get-orders', userId);
                setOrderDetails(orders);
            } catch(error) {
                console.error('Error fetching documents', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        const user = decryptData(sessionStorage.getItem('user'));
        getOrderDetails(user.userId);

        setUserData(user);
    }, [])

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
            <Grid container spacing={2}>
                {orderDetails.map((order) => (
                    <Grid item xs={12} md={6} key={order.orderId}>
                        <Card variant='outlined'>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {order.treatmentName}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Order ID: {order.orderId}
                                </Typography>
                                <Typography variant="body2" color={order.status === 'Completed' ? 'green' : 'orange'}>
                                    Status: {order.status}
                                </Typography>

                                <Divider style={{ margin: '10px 0' }} />

                                <Typography variant="body1">
                                    For: {decryptData(order.userData).name}
                                </Typography>

                                <Typography variant="body2" gutterBottom>
                                    Placed on: {new Date(order.createDate).toLocaleDateString()}
                                </Typography>
                            
                                <Divider style={{ margin: '10px 0' }} />

                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="subtitle1">Questions & Answers</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <List>
                                        {order.questions.map((qa, qaIndex) => (
                                            <ListItem key={qaIndex}>
                                                <Typography variant="body2">
                                                    <strong>{qa.questionName}:</strong> {qa.optionSelected}
                                                </Typography>
                                            </ListItem>
                                        ))}
                                        </List>
                                    </AccordionDetails>
                                </Accordion>

                                {order.additionalInfo && (
                                <>
                                    <Divider style={{ margin: '10px 0' }} />
                                    <Typography variant="subtitle1">Additional Info</Typography>
                                    <Paper elevation={2} style={{ padding: '10px' }}>
                                        <Typography variant="body2">{order.additionalInfo}</Typography>
                                    </Paper>
                                </>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
    }
}

export default Orders;