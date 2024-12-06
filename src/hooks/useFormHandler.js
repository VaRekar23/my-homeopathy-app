import { useState, useCallback } from 'react';

export const useFormHandler = (initialState, validationSchema) => {
    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = useCallback(() => {
        const newErrors = {};
        Object.keys(validationSchema).forEach(field => {
            const value = formData[field];
            const validation = validationSchema[field];
            
            if (validation.required && !value) {
                newErrors[field] = `${field} is required`;
            }
            if (validation.minLength && value.length < validation.minLength) {
                newErrors[field] = `${field} must be at least ${validation.minLength} characters`;
            }
            // Add more validation rules as needed
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, validationSchema]);

    const handleChange = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when field is modified
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    }, [errors]);

    return {
        formData,
        errors,
        isSubmitting,
        setIsSubmitting,
        validateForm,
        handleChange,
        setFormData
    };
}; 