import React, { useCallback, useEffect, useState } from "react";
import { fetchDataWithParam, updateUIData, uploadImage } from "../../Helper/ApiHelper";
import About from "../../User/About/About";
import { Button, IconButton, Paper, TextField } from "@mui/material";
import { AddCircle, Cancel, EditNote } from "@mui/icons-material";
import SaveIcon from '@mui/icons-material/Save';
import './AboutAdmin.css';
import AddressAdmin from "./AddressAdmin";

function AboutAdmin({uiDetails}) {
    const [updatedUiDetails, setUpdatedUiDetails] = useState(uiDetails);
    const [aboutDetails, setAboutDetails] = useState({
        dr_name : updatedUiDetails.dr_name,
        degree : updatedUiDetails.degree,
        intro : updatedUiDetails.intro,
        img_path : updatedUiDetails.img_path,
        addresses: updatedUiDetails.addresses || [{clinic_name: '', address_1: '', address_2: '', city: '', phone: '', map_url: '', workings: [{days:'', timing:''}]}]
    });

    const [isEdit, setIsEdit] = useState(false);
    const [status, setStatus] = useState('');
    const [imageFile, setImageFile] = useState(null);

    const onEditClick = () => {
        setIsEdit(true);
    };

    const onCancelClick = () => {
        setIsEdit(false);
    };

    const handleOnChange = useCallback((e) => {
        const { name, value } = e.target;
        setAboutDetails((previousState) => ({
            ...previousState,
            [name]: value
        }));

    }, []);

    const handleWorkingOnChange = (addressIndex, workingIndex, field, value) => {
        const newAddresses = [...aboutDetails.addresses];
        const newWorkings = [...newAddresses[addressIndex].workings];
        newWorkings[workingIndex][field] = value;
        newAddresses[addressIndex].workings = newWorkings;

        setAboutDetails({...aboutDetails, addresses: newAddresses});
    };
    const handleWorkingOnRemove = (addressIndex, workingIndex) => {
        const updatedAddress = [...aboutDetails.addresses];
        const updatedWorkings = updatedAddress[addressIndex].workings.filter((_,i) => i !== workingIndex);
        updatedAddress[addressIndex].workings = updatedWorkings;

        setAboutDetails({...aboutDetails, addresses: updatedAddress});
    };
    const handleWorkingOnAdd = (addressIndex) => {
        const updatedAddress = [...aboutDetails.addresses];
        const newWorkings = {days:'', timing:''};
        updatedAddress[addressIndex].workings.push(newWorkings);

        setAboutDetails({...aboutDetails, addresses: updatedAddress});
    };

    const handleAddressOnChange = (addressIndex, field, value) => {
        const newAddresses = [...aboutDetails.addresses];
        newAddresses[addressIndex][field]=value;
        setAboutDetails({...aboutDetails, addresses:newAddresses});
    };
    const handleAddressOnRemove = (addressIndex) => {
        const newAddresses = aboutDetails.addresses.filter((_,i) => i !== addressIndex);
        setAboutDetails({...aboutDetails, addresses: newAddresses});
    };
    const handleAddressOnAdd = () => {
        setAboutDetails({
            ...aboutDetails,
            addresses: [...aboutDetails.addresses, {clinic_name: '', address_1: '', address_2: '', city: '', state: '', pin_code: '', phone: '', map_url: '', workings: [{days:'', timing:''}]}]
        });
    };

    const onSaveClick = async (e) => {
        const formData = new FormData();
        formData.append("file", imageFile);

        const fileUploadResponse = uploadImage(formData);
        console.log(fileUploadResponse);
        const fileURL = await fileUploadResponse;

        const payload = {
            ...aboutDetails,
            img_path: fileURL,
        }

        const response = updateUIData('update-aboutdetails', payload, 'english');

        setStatus(response);
    };

    useEffect(() => {
        setIsEdit(false);

        const getUIDetails = async () => {
            try {
              const uiData = await fetchDataWithParam('ui-details', 'english');
              setUpdatedUiDetails(uiData.about);
            } catch(error) {
              console.error('Error fetching documents', error);
            }
          };
      
          getUIDetails();
    }, [status]);

    if (isEdit) {
        return (
            <>
                <TextField label='dr_name' name='dr_name' value={aboutDetails.dr_name} 
                        onChange={handleOnChange} fullWidth margin='normal' multiline />

                <TextField label='degree' name='degree' value={aboutDetails.degree} 
                        onChange={handleOnChange} fullWidth margin='normal' multiline />
                
                <TextField label='intro' name='intro' value={aboutDetails.intro} 
                        onChange={handleOnChange} fullWidth margin='normal' multiline />

                <TextField label='Upload Image' type='file' InputLabelProps={{ shrink: true }}
                        onChange={(e) => setImageFile(e.target.files[0])} />

                <Paper elevation={2} sx={{ padding: 2 }} >
                    {aboutDetails.addresses.map((address, index) => (
                        <AddressAdmin address={address} 
                                    addressIndex={index} 
                                    handleOnChange={handleAddressOnChange} 
                                    handleOnRemove={handleAddressOnRemove}
                                    handleOnWorkingChange={handleWorkingOnChange}
                                    handleOnWorkingRemove={handleWorkingOnRemove}
                                    handleOnWorkingAdd={handleWorkingOnAdd} />
                    ))}

                    <IconButton color="success" onClick={() => handleAddressOnAdd()} >
                        <AddCircle />
                    </IconButton>
                </Paper>

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
                <About uiDetails={updatedUiDetails} />
                <div className='container'>
                    <Button variant="contained" color='primary' className='custom-button' sx={{mt:2}}
                            onClick={onEditClick} startIcon={<EditNote />}>Edit</Button>
                </div>
            </>
        );
    }
}

export default AboutAdmin;