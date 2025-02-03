import express from 'express';

const unix = express();
const app = express();

const {
	env: {
		UNIX_DOMAIN_SOCKET_PATH: socketPath = '/tmp/test.sock',
		PORT = '3000'
	}
} = process;

const handler = (_, res) => {
	console.log(`getting request at ${new Date()}`)
	return res.json({ status: 'hi' });
};

unix.use(express.json());

unix.get('/unix', handler);

unix.listen(socketPath, () => console.log(`node server listening on ${socketPath}`));

app.use(express.json());

app.get('/', handler);

app.listen(PORT, () => console.log(`node server listening on ${PORT}`));
