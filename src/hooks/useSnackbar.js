import { useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

export const useSnackbar = () => {
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success', // 'success' | 'error' | 'warning' | 'info'
        duration: 6000
    });

    const showSnackbar = useCallback((message, severity = 'success', duration = 6000) => {
        setSnackbar({
            open: true,
            message,
            severity,
            duration
        });
    }, []);

    const hideSnackbar = useCallback(() => {
        setSnackbar(prev => ({
            ...prev,
            open: false
        }));
    }, []);

    const SnackbarComponent = () => (
        <Snackbar
            open={snackbar.open}
            autoHideDuration={snackbar.duration}
            onClose={hideSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
            <Alert 
                onClose={hideSnackbar} 
                severity={snackbar.severity}
                variant="filled"
                sx={{ width: '100%' }}
            >
                {snackbar.message}
            </Alert>
        </Snackbar>
    );

    return {
        showSnackbar,
        hideSnackbar,
        SnackbarComponent
    };
}; 