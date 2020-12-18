/* Database config */

require('dotenv').config();
mongoose = require('mongoose')
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true }).
  catch(err => console.log(err))

mongoose.connection.on('error', err => {
  logError(err)
})

/* Model config */

const { Schema } = mongoose;

const urlSchema = new Schema({
  longUrl: {type: String, required: true},
  shortUrl: {type: Number, required: true},
})

const Url = mongoose.model('Url', urlSchema)

/* Model functions */

const createAndSaveUrl = (longUrl, shortUrl) => {
  let urlPair = new Url({longUrl: longUrl, shortUrl: shortUrl})

  return urlPair.save()
}

const findUrlByLong = (longUrl) => Url.findOne({longUrl: longUrl}).exec()

const findUrlByShort = (shortUrl) => Url.findOne({shortUrl: shortUrl}).select('longUrl').exec()

const findLastShort = () => Url.find().sort({ _id: -1 }).limit(1).select('shortUrl').exec()

const returnJSON = full_object => finalResponse = { original_url: full_object.longUrl, short_url: full_object.shortUrl }

/* Exports */

exports.UrlModel = Url;
exports.createAndSaveUrl = createAndSaveUrl;
exports.findUrlByLong = findUrlByLong;
exports.findUrlByShort = findUrlByShort;
exports.findLastShort = findLastShort;
exports.returnJSON = returnJSON;