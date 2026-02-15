"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const BCRYPT_SALT_ROUNDS = 10;
/**
 * Hashes a plain text password using bcrypt.
 *
 * @param {string} password - The plain text password
 * @returns {Promise<string>} - The hashed password
 */
const hashPassword = async (password) => {
    return await bcrypt_1.default.hash(password, BCRYPT_SALT_ROUNDS);
};
exports.hashPassword = hashPassword;
/**
 * Compares a plain text password with a hash.
 *
 * @param {string} password - The plain text password
 * @param {string} hash - The hashed password
 * @returns {Promise<boolean>} - True if match, false otherwise
 */
const comparePassword = async (password, hash) => {
    return await bcrypt_1.default.compare(password, hash);
};
exports.comparePassword = comparePassword;
