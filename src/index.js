import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import getIconURL from './getIconURL.js';

const { PORT } = process.env;

const app = express();

app.use(cors());
app.use(express.json());
app.get('/', getIconURL);

app.listen(PORT, () => {
	console.log(`Example app listening at http://localhost:${PORT}`);
});
