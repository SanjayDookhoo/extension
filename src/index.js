import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import details from './details.js';
import puppeteer from 'puppeteer';

export let browser;

puppeteer
	.launch({
		headless: true,
		timeout: 0,
	})
	.then(async (_browser) => {
		browser = _browser;
	});

const { PORT } = process.env;

const app = express();

app.use(cors());
app.use(express.json());
app.get('/details', details);

app.listen(PORT, () => {
	console.log(`Example app listening at http://localhost:${PORT}`);
});
