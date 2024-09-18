import { Add, ArrowForwardIos, Delete } from '@mui/icons-material';
import { Box, Button, IconButton, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';

function TreatmentDetails({treatmentDetails, handleParentOnChange, handleRemoveParent, handleAddParent, handleChildOnChange, handleRemoveChild, handleAddChild}) {
    const [selectedParentIndex, setSelectedParentIndex] = useState(null);
    const handleRemove = (index) => {
        setSelectedParentIndex(null);
        handleRemoveParent(index);
    };

    return (
        <Box display='flex' p={2}>
            <Box flex={1} mr={2}>
                <Typography variant='h6'>Treatments</Typography>
                {treatmentDetails.map((treatment, index) => (
                    <Box key={index} display='flex' alignItems='center' justifyContent='space-between' mb={1}>
                        <Box display='flex' alignItems='center'>
                            <Typography variant='body' sx={{ padding: 2 }}>{treatment.id}</Typography>
                            <TextField label='name' name="name" fullWidth value={treatment.name} onChange={(e) => handleParentOnChange(index, 'name', e.target.value)} />
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
            </Box>

            <Box flex={1} mr={2}>
                {selectedParentIndex !== null && (
                    <>
                        <Typography variant='h6'>{treatmentDetails[selectedParentIndex].name}</Typography>
                        {treatmentDetails[selectedParentIndex].subCategoryList.map((subTreatment, childIndex) => (
                            <Box key={childIndex} display="flex" alignItems="center" mb={1}>
                                <Typography variant='body' sx={{ padding: 2 }}>{subTreatment.id}</Typography>
                                <TextField label='subcategory' name="subcategory" fullWidth value={subTreatment.name} onChange={(e) => handleChildOnChange(selectedParentIndex, childIndex, 'name', e.target.value)} />
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
            </Box>
        </Box>
    );
}

export default TreatmentDetails;