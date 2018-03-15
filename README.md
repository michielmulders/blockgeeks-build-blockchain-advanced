## ES7 async await boilerplate
A barebones boilerplate to get started using Javascript ES7 async await with help from Babel and Github Fetch.

#### Getting started
1. Run `npm install`
2. Run `npm run start`
3. Open browser at [http://localhost:8080/](http://localhost:8080/)
4. Click the `Call async await function` button

#### Notes
- [Here is good article on Async Await](https://www.sitepoint.com/simplifying-asynchronous-coding-es7-async-functions/)
- Tested on all modern browsers though should work on older browsers


PORT=5000 npm start

instead of init one immediately
look first for other blockchains (define a range 5k - 5001) and ping for /isValidBlockchain 
Create an endpoint to ping the length of blockchain /lengthBlockchain
Get the length of the longest blockchain. Set the blockchain of that one to this new instance this.chain = otherNodeBlock

send message to the found blockchain with your port number -> /nodes (registerNode) so everyone is aware of your presence

Add broadcast function to the mine function to call a /syncUpdate on each chain to retrieve the longest chain (has to check again lenght of each one because when someone else is mining this can not be the longest anymore).