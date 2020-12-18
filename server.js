require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const Url = require('./shortener.js').UrlModel
const bodyParser = require('body-parser')

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

const createAndSaveUrl = require('./shortener.js').createAndSaveUrl
const findLong = require('./shortener.js').findUrlByLong
const findShort = require('./shortener.js').findUrlByShort
const findLast = require('./shortener.js').findLastShort
const returnJSON = require('./shortener.js').returnJSON

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/api/shorturl/:url_code', async (req, res) => {
  const urlCode = req.params.url_code

  try {
    const short = await findShort(urlCode)
    const redirectUrl = short.longUrl
    res.redirect(redirectUrl)
  } catch (e) {
    console.log('error:', e)
    res.json({error: 'No short URL found for the given input'})
  }

})

app.post('/api/shorturl/new', (req, res) => {
  const input = req.body.url
  const url = new URL(input)
  const hostname = url.hostname
  const validProtocol = url.protocol == 'http:' || url.protocol == 'https:'

  dns.lookup(hostname, async err => {
    if (err || !validProtocol) return res.json({ error: 'invalid URL' })
    try {
      const long = await findLong(url)
      if (long) return res.json(returnJSON(long))

      const last = await findLast()
      const newShortUrl = parseInt(last[0].shortUrl) + 1
      const createdUrl = await createAndSaveUrl(url, newShortUrl)

      return res.json(returnJSON(createdUrl))
    } catch (e) {
      console.log(e)
    }
  })
})

// Your first API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});