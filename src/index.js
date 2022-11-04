import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import details from './details.js';
import puppeteer from 'puppeteer';

export const browser = await puppeteer.launch({
	executablePath: '/usr/bin/google-chrome', // https://dev.to/cloudx/how-to-use-puppeteer-inside-a-docker-container-568c
	headless: true,
	args: ['--no-sandbox'],
	timeout: 0,
});

const { PORT } = process.env;

const app = express();

app.use(cors());
app.use(express.json());
app.get('/details', details);

app.listen(PORT, () => {
	console.log(`Example app listening at http://localhost:${PORT}`);
});
