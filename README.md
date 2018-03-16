# Blockgeeks - Build your own Bitcoin-alike Blockchain

## Running the Code
1. To install all dependencies, just run `yarn install` or `npm install`.
2. As we want to run several instances (~nodes) of the code, we need to give a new `PORT` environment variable to each instance (~node). So, start the node with: `PORT=5000 npm start`.
3. Other nodes can be added in the same way with a different port: `PORT=5001 npm start`.
4. As gossiping (the addition of a new node) is not yet implemented, we have to register each node manually using Postman.

