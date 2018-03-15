import { Router } from 'express'
import { binance } from '../helpers/binance'

const router = Router()
export default router

/**
 * Get BTC price
 */
const getPrice = (req, res) => {
  binance.prices()
    .then(prices => res.status(200).json(prices.BTCUSDT))
}

function requestPrice() {
  binance.prices()
    .then(prices => prices.BTCUSDT)
}

function gPrice() { return binance.prices() }

/**
 * Get BTC price stream
 * v2 of above function with timer implementation
 */
const getPriceStream = async (req, res) => {
  let BTCprices = []
  let counter = 0
  try {
    setInterval(() => {

      binance.prices()
        .then(prices => {
          console.log(prices.BTCUSDT)
          BTCprices.push(prices.BTCUSDT)
        })
    }, 1000)
  } catch (e) {
    res.json(e)
  }
}

/**
 * Get highscore 
 * @param {String} req.body.text : Slack sends everything after slash command as a text string
 */

router.route('/price')
  .get(getPrice)

/* router.route('/pricestream')
  .get(getPriceStream) */

router.get('/pricestream', getPriceStream)