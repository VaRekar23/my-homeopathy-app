import { Delete } from "@mui/icons-material";
import { Grid, IconButton, TextField } from "@mui/material";
import React from "react";

function WorkingAdmin({working, addressIndex, workingIndex, handleOnChange, handleOnRemove}) {
    return (
        <Grid container spacing={3} key={workingIndex} alignItems="center" sx={{ mb: 2 }} >
            <Grid item xs={12} sm={4}>
                <TextField label="days" name="days" fullWidth value={working.days} onChange={(e) => handleOnChange(addressIndex, workingIndex, 'days', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField label="timing" name="timing" fullWidth value={working.timing} onChange={(e) => handleOnChange(addressIndex, workingIndex, 'timing', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={2}>
                <IconButton color="error" onClick={() => handleOnRemove(addressIndex, workingIndex)}>
                    <Delete />
                </IconButton>
            </Grid>
        </Grid>
    );
}

export default WorkingAdmin;