await rp.get({
  uri: 'https://horizon-testnet.stellar.org/friendbot',
  qs: { addr: pairA.publicKey() },
  json: true
})