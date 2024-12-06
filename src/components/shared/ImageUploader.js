import React from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export const ImageUploader = ({ onUpload, isUploading, maxFiles = 5 }) => {
    const handleImageUpload = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length > maxFiles) {
            alert(`Maximum ${maxFiles} images allowed`);
            return;
        }

        try {
            onUpload(files);
        } catch (error) {
            console.error('Error handling images:', error);
        }
    };

    return (
        <Box>
            <input
                id="image-upload"
                style={{ display: 'none' }}
                type="file"
                multiple={maxFiles > 1}
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
            />
            <label htmlFor="image-upload">
                <Button
                    variant="outlined"
                    component="span"
                    disabled={isUploading}
                    startIcon={<CloudUploadIcon />}
                >
                    Select Images
                </Button>
            </label>
            {isUploading && (
                <Box display="flex" alignItems="center" mt={1}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" ml={1}>
                        Uploading images...
                    </Typography>
                </Box>
            )}
        </Box>
    );
}; 