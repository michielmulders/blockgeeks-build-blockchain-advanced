import express from 'express'
import bodyParser from 'body-parser'
import binance from 'node-binance-api'
// import btcRouter from './routes/btc'


/* Initialize app and configure bodyParser */
const port = process.env.PORT || 4000
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

/* API Routes */
/* app.use('/btc', btcRouter) */

/* API Test Route */
app.get('/', (req, res) => {
  res.send('App is running correctly!')
})


var stop = false
var counter = 0

app.get('/stop', (req, res) => {
  stop = true
  res.send('Stopped websocket!')
})

/* CORS */
app.use((req, res, next) => {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*')

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,content-type')

  // Pass to next layer of middleware
  next()
});


/* Serve API */
var server = app.listen(port, () => {
  console.log('Trading Bot listening on port 4000!')
})

function stopServer() {
  server.close(function() {
    console.log("Closing!")
    process.exit()
  })
}

binance.options({
  'APIKEY': 'RNbQ3bYDo6LfV8bTpXVGy44d6P9YuqVPLqPQfG7z6jS82DNEMh2M5wLFW3RrAz3p',
  'APISECRET': '88jvZtam8cSeE2nwGqh2v0xVgRb5feoAMjvPQ8CDEUtDOxAxhF9GCb7pacE7sxeU8t',
  'test': true
})

binance.prices((ticker) => {
	console.log("Price of BNB: ", ticker.BNBBTC)
})

// 20% in 5/10 min for altcoin

// Value in BTC ! 
// Experiment with BTC-BNB

var data = []

binance.websockets.candlesticks(['BTCUSDT'], "1m", async function(candlesticks) {
  counter++
  let { e:eventType, E:eventTime, s:symbol, k:ticks } = candlesticks;
  let { o:open, h:high, l:low, c:close, v:volume, n:trades, i:interval, x:isFinal, q:quoteVolume, V:buyVolume, Q:quoteBuyVolume } = ticks;
  if (counter % 5 == 0) {
    if()
    data.push({
      time: new Date().toISOString().slice(-13, -5),
      low,
      high
    })
  }


  if(stop) { stopServer() }
});
