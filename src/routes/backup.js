const getPriceStream = async (req, res) => {
  /* setInterval(() => {
    var price = await gPrice()
    console.log(price.BTCUSDT)
  }, 1000) */
  try {
    /* var price = await binance.prices()
    res.json(price) */

    let prices = []

    // Stop interval by returning (timer can be useful): https://stackoverflow.com/questions/9136261/how-to-make-a-setinterval-stop-after-some-time-or-after-a-number-of-actions
    await setInterval(async () => {
      let price = await binance.prices().BTCUSDT
      console.log(price)
      prices.push(price)
    }, 1000)
    

    /* while(true) {
      console.log("hier")
      await sleep(1000)
      let price = await binance.prices().BTCUSDT
      console.log(price)
      pirces.push(price)
    } */
  } catch (e) {
    res.json(e)
  }
}