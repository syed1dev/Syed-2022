# Asymmetric Key Authentication Client-Server

This project demonstrates a simple client-server application using asymmetric key authentication. The client can generate a key pair, store the public key on the server, sign messages, and submit signed messages to the server for verification.

## Prerequisites

- [Node.js](https://nodejs.org/) installed on your system

## Installation

1. Clone the repository:

   ```bash
   git clone [urlforthisrepo.git]
   cd [cwd]
   ```

2. Install the required dependencies:
   ```
   npm install
   ```

## Running the Server

Start the server by providing a password for authentication:
```
node server.js yourpassword
```

## Running the Client
Generate an RSA key pair (public and private keys) and store them locally:
```
node client.js generate-keys
```

## Submit Public Key to Server
Submit the generated key to the server for storage:
```
node client.js submit-key https://localhost:3000 yourpassword
```

## Sign a Message
Sign a message using the stored private key:
```
node client.js sign-message "your message here"
```

## Submit Signed Message for Verification
Submit the signed message to the server for verification:
```
node client.js submit-signed-message http://localhost:3000 "your message here" "signature"
```

Replace `"your message here"` and `"signature"` with the actual message and signature returned by the previous step.