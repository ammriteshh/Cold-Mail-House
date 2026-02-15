import bcrypt from 'bcrypt';

const BCRYPT_SALT_ROUNDS = 10;

/**
 * Hashes a plain text password using bcrypt.
 * 
 * @param {string} password - The plain text password
 * @returns {Promise<string>} - The hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
};

/**
 * Compares a plain text password with a hash.
 * 
 * @param {string} password - The plain text password
 * @param {string} hash - The hashed password
 * @returns {Promise<boolean>} - True if match, false otherwise
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};
