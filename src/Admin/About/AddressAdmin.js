import { Grid, IconButton, Paper, TextField } from "@mui/material";
import React from "react";
import WorkingAdmin from "./WorkingAdmin";
import { AddCircle, Delete } from "@mui/icons-material";

function AddressAdmin({address, addressIndex, handleOnChange, handleOnRemove, handleOnWorkingChange, handleOnWorkingRemove, handleOnWorkingAdd}) {

    return (
        <Grid container spacing={3} key={addressIndex} sx={{ mb: 2 }} alignItems="center" >
            <Grid item xs={12} sm={10}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <TextField label='clinic_name' name="clinic_name" fullWidth value={address.clinic_name} onChange={(e) => handleOnChange(addressIndex, 'clinic_name', e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label='address_1' name="address_1" fullWidth value={address.address_1} onChange={(e) => handleOnChange(addressIndex, 'address_1', e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label='address_2' name="address_2" fullWidth value={address.address_2} onChange={(e) => handleOnChange(addressIndex, 'address_2', e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label='city' name="city" fullWidth value={address.city} onChange={(e) => handleOnChange(addressIndex, 'city', e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label='state' name="state" fullWidth value={address.state} onChange={(e) => handleOnChange(addressIndex, 'state', e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label='pin_code' name="pin_code" fullWidth value={address.pin_code} onChange={(e) => handleOnChange(addressIndex, 'pin_code', e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label='phone' name="phone" fullWidth value={address.phone} onChange={(e) => handleOnChange(addressIndex, 'phone', e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label='map_url' name="map_url" fullWidth value={address.map_url} onChange={(e) => handleOnChange(addressIndex, 'map_url', e.target.value)} />
                    </Grid>
                    <Grid item xs={12}>
                        <Paper elevation={2} sx={{ padding: 2 }} >
                            {address.workings.map((working, index) => (
                                <WorkingAdmin working={working} addressIndex={addressIndex} workingIndex={index}  handleOnChange={handleOnWorkingChange} handleOnRemove={handleOnWorkingRemove} />
                            ))}

                            <IconButton color="success" onClick={() => handleOnWorkingAdd(addressIndex)} >
                                <AddCircle />
                            </IconButton>
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>

            <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton color="error" onClick={() => handleOnRemove(addressIndex)}>
                    <Delete />
                </IconButton>
            </Grid>
        </Grid>
    );
}

export default AddressAdmin;