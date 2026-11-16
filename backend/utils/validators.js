export const isMissing = (value) => {
    return (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '')
    );
};

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email.trim())){
            return {valid: false, message: 'Invalid email format'};
        }
    return {valid: true};
}

export const validateString = (value, fieldName) => {
    if (typeof value !== 'string') {
        return {
            valid: false,
            message: `${fieldName} must be a string`,
        };
    }

    return { valid: true };
};

