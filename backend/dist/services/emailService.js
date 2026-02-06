"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config");
const transporter = nodemailer_1.default.createTransport({
    host: config_1.config.email.host,
    port: config_1.config.email.port,
    secure: false, // true for 465, false for other ports
    auth: {
        user: config_1.config.email.user,
        pass: config_1.config.email.pass,
    },
});
const sendEmail = async (to, subject, html) => {
    const info = await transporter.sendMail({
        from: '"Cold Mail House" <system@coldmail.com>',
        to,
        subject,
        html,
    });
    return info;
};
exports.sendEmail = sendEmail;
