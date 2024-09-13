import { Button, TextField } from '@mui/material';
import React, { useCallback, useState } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import { Cancel, EditNote } from '@mui/icons-material';
import Home from '../../Home/Home';
import './HomeAdmin.css';

function HomeAdmin({uiDetails}) {
    const [homeDetails, setHomeDetails] = useState({
        welcome: uiDetails.welcome,
        specialize: uiDetails.specialize,
        header_para2: uiDetails.header_para2,
        body_para2: uiDetails.body_para2,
        common_disease: uiDetails.common_disease,
        treatment_provided: uiDetails.treatment_provided,
        reviews: uiDetails.reviews,
        cure_count: uiDetails.cure_count
    });

    const [isEdit, setIsEdit] = useState(false);

    const onEditClick = () => {
        setIsEdit(true);
    };

    const onCancelClick = () => {
        setIsEdit(false);
    };

    const onSaveClick = (e) => {
        console.log('Save click', homeDetails);
    };

    const handleOnChange = useCallback((e) => {
        const { name, value } = e.target;
        setHomeDetails((previousState) => ({
            ...previousState,
            [name]: value
        }));

    }, []);

    if (isEdit) {
        return (
            <>
                <TextField label='welcome' name='welcome' value={homeDetails.welcome} 
                        onChange={handleOnChange} fullWidth margin='normal' multiline />

                <TextField label='specialize' name='specialize' value={homeDetails.specialize} 
                        onChange={handleOnChange} fullWidth margin='normal' multiline />
                
                <TextField label='header_para2' name='header_para2' value={homeDetails.header_para2} 
                        onChange={handleOnChange} fullWidth margin='normal' multiline />

                <TextField label='body_para2' name='body_para2' value={homeDetails.body_para2} 
                        onChange={handleOnChange} fullWidth margin='normal' multiline />

                <TextField label='common_disease' name='common_disease' value={homeDetails.common_disease} 
                        onChange={handleOnChange} fullWidth margin='normal' multiline />

                <TextField label='treatment_provided' name='treatment_provided' value={homeDetails.treatment_provided} 
                        onChange={handleOnChange} fullWidth margin='normal' multiline />

                <TextField label='reviews' name='reviews' value={homeDetails.reviews} 
                        onChange={handleOnChange} fullWidth margin='normal' multiline />

                <TextField label='cure_count' name='cure_count' value={homeDetails.cure_count} 
                        onChange={handleOnChange} fullWidth margin='normal' multiline />

                <div className='container'>
                    <Button variant="contained" color='primary' className='custom-button' sx={{mt:2}}
                            onClick={onSaveClick} startIcon={<SaveIcon />}>Save</Button>
                    <Button variant="contained" color='inherit' className='custom-button' sx={{mt:2}}
                            onClick={onCancelClick} startIcon={<Cancel />} >Cancel</Button>
                </div>
                
            </>
        );
    } else {
        return (
            <>
                <Home uiDetails={uiDetails} />
                <div className='container'>
                    <Button variant="contained" color='primary' className='custom-button' sx={{mt:2}}
                            onClick={onEditClick} startIcon={<EditNote />}>Edit</Button>
                </div>
            </>
        );
    }
}

export default HomeAdmin;