const crypto = require('crypto');
const fs = require('fs');
const axios = require('axios');

// Generate keypair and store
function generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });

    fs.writeFileSync('publicKey.pem', publicKey);
    fs.writeFileSync('privateKey.pem', privateKey);

    console.log('Key pair generated and saved.');
}

// Submit public key to server
async function submitPublicKey(serverUrl, password) {
    if (!serverUrl || typeof password !== 'string') {
        console.error('Invalid arguments provided.');
        return;
    }
    try {
        const publicKey = fs.readFileSync('publicKey.pem', 'utf-8');
        const response = await axios.post(`${serverUrl}/submit-key`, { publicKey }, {
            auth: {
                username: 'client',
                password: password
            }
        });
        console.log('Public key submitted successfully.', response.data);
    } catch (error) {
        console.error('Error submitting public key:', error.response ? error.response.data : error.message);
    }
}

// Sign message
function signMessage(message) {
    const privateKey = fs.readFileSync('privateKey.pem', 'utf-8');
    const sign = crypto.createSign('SHA256');
    sign.update(message);
    sign.end();
    const signature = sign.sign(privateKey, 'hex');
    console.log(`Message: ${message}`);
    console.log(`Signature: ${signature}`);
    return { message, signature };
}

// Submit signed message for verification
async function submitSignedMessage(serverUrl, message, signature) {
    if (!serverUrl || typeof message !== 'string' || typeof signature !== 'string') {
        console.error('Invalid arguments provided.');
        return;
    }
    try {
        const response = await axios.post(`${serverUrl}/verify`, { message, signature });
        console.log('Verification result:', response.data);
    } catch (error) {
        console.error('Error submitting signed message:', error.response ? error.response.data : error.message);
    }
}

// CLI usage
const [action, ...args] = process.argv.slice(2);

if (action === 'generate-keys') {
    generateKeyPair();
} else if (action === 'submit-key') {
    const [serverUrl, password] = args;
    submitPublicKey(serverUrl, password);
} else if (action === 'sign-message') {
    const message = args.join(' ');
    signMessage(message);
} else if (action === 'submit-signed-message') {
    const [serverUrl, message, signature] = args;
    submitSignedMessage(serverUrl, message, signature);
} else {
    console.log('Usage:');
    console.log('  node client.js generate-keys');
    console.log('  node client.js submit-key <server-url> <password>');
    console.log('  node client.js sign-message <message>');
    console.log('  node client.js submit-signed-message <server-url> <message> <signature>');
}
