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

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_BYTES = 72;

export const validatePassword = (password) => {
    if ([...password].length < MIN_PASSWORD_LENGTH) {
        return {
            valid: false,
            message: 'Password must be at least 8 characters',
        };
    }

    if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES) {
        return {
            valid: false,
            message: 'Password must not exceed 72 bytes',
        };
    }

    return { valid: true };
};