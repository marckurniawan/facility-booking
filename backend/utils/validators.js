export const isMissing = (value) => {
    return (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '')
    );
};

export const validateEmail = (email) => {
if (typeof email !== 'string') {
        return {valid: false,message: 'Email must be a string'};
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email.trim())){
            return {valid: false, message: 'Invalid email format'};
        }
    return {valid: true};
}


