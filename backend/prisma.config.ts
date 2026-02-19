import { defineConfig } from "@prisma/config";
import dotenv from 'dotenv';

dotenv.config();
import "dotenv/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    datasource: {
        url: process.env.DATABASE_URL,
    },
});
