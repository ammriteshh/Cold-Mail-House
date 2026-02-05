import nodemailer from 'nodemailer';
import { config } from '../config';

const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: false, // true for 465, false for other ports
    auth: {
        user: config.email.user,
        pass: config.email.pass,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    const info = await transporter.sendMail({
        from: '"Cold Mail House" <system@coldmail.com>',
        to,
        subject,
        html,
    });

    return info;
};
