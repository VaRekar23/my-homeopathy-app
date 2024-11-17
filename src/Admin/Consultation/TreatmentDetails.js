import { Add, ArrowForwardIos, Delete } from '@mui/icons-material';
import { Avatar, Box, Button, Grid, IconButton, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';

function TreatmentDetails({treatmentDetails, handleParentOnChange, handleRemoveParent, handleAddParent, handleChildOnChange, handleRemoveChild, handleAddChild}) {
    const [selectedParentIndex, setSelectedParentIndex] = useState(null);
    const handleRemove = (index) => {
        setSelectedParentIndex(null);
        handleRemoveParent(index);
    };

    return (
        <Box p={2}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                <Typography variant='h6'>Treatments</Typography>
                {treatmentDetails.map((treatment, index) => (
                    <Box key={index} display='flex' alignItems='center' justifyContent='space-between' mb={1} flexWrap="wrap">
                        <Box display='flex' alignItems='center' flex="1" minWidth="0">
                            <Typography variant='body' sx={{ padding: 2 }}>{treatment.id}</Typography>
                            <TextField label='name' name="name" fullWidth value={treatment.name} onChange={(e) => handleParentOnChange(index, 'name', e.target.value)} sx={{ flex: 1, mr: 1 }}/>
                            <TextField label='image' name='name' fullWidth value={treatment.image} onChange={(e) => handleParentOnChange(index, 'image', e.target.value)} sx={{ flex: 1, mr: 1}} />
                            <IconButton color="error" onClick={() => handleRemove(index)}>
                                <Delete />
                            </IconButton>
                        </Box>

                        <IconButton onClick={() => setSelectedParentIndex(index)}>
                            <ArrowForwardIos />
                        </IconButton>
                    </Box>
                ))}

                <Button startIcon={<Add />} onClick={handleAddParent}>Add Treatment</Button>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                {selectedParentIndex !== null && (
                    <>
                        <Box display={'flex'} alignItems={'center'} mb={2} >
                        <Avatar src={`/Images/${treatmentDetails[selectedParentIndex].image}`} alt={treatmentDetails[selectedParentIndex].image} sx={{ width: 40, height: 40, marginRight: 2 }} />
                        <Typography variant='h6'>{treatmentDetails[selectedParentIndex].name}</Typography>
                        </Box>
                        {treatmentDetails[selectedParentIndex].subCategoryList.map((subTreatment, childIndex) => (
                            <Box key={childIndex} display="flex" alignItems="center" mb={1} flexWrap="wrap">
                                <Typography variant='body' sx={{ padding: 2 }}>{subTreatment.id}</Typography>
                                <TextField label='subcategory' name="subcategory" fullWidth value={subTreatment.name} onChange={(e) => handleChildOnChange(selectedParentIndex, childIndex, 'name', e.target.value)} sx={{ flex: 1, mr: 1 }}/>
                                <IconButton color="error" onClick={() => handleRemoveChild(selectedParentIndex, childIndex)}>
                                    <Delete />
                                </IconButton>
                            </Box>
                        ))}
                        <Button startIcon={<Add />} onClick={() => handleAddChild(selectedParentIndex)}>
                            Add Child
                        </Button>
                    </>
                )}
                </Grid>
            </Grid>
        </Box>
    );
}

export default TreatmentDetails;