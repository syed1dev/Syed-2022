const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

let storedPublicKey = null;
let storedPasswordHash = null;

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

const password = process.argv[2];
if (!password) {
    console.error('Please provide a password as an argument.');
    process.exit(1);
}
storedPasswordHash = hashPassword(password);


// Endpoint to submit public key
app.post('/submit-key', (req, res) => {
    const authHeader = req.headers.authorization || '';
    const [type, credentials] = authHeader.split(' ');

    if (type !== 'Basic' || !credentials) {
        return res.status(401).send('Authentication required.');
    }

    const [username, password] = Buffer.from(credentials, 'base64').toString().split(':');

    if (hashPassword(password) !== storedPasswordHash) {
        return res.status(403).send('Invalid password.');
    }

    const { publicKey } = req.body;
    if (!publicKey) {
        return res.status(400).send('Public key is required.');
    }

    storedPublicKey = publicKey;
    console.log('Public key stored.');
    res.send('Public key stored successfully.');
});

// Endpoint to verify signed message
app.post('/verify', (req, res) => {
    const { message, signature } = req.body;

    if (!storedPublicKey) {
        return res.status(400).send('No public key stored.');
    }

    const verify = crypto.createVerify('SHA256');
    verify.update(message);
    verify.end();

    const isValid = verify.verify(storedPublicKey, signature, 'hex');
    res.send({ valid: isValid });
});


app.use((err, req, res, next) => {
    console.error(new Date().toISOString(), err.stack);
    res.status(500).send({ error: 'Internal Server Error' });
});


// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
