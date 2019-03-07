let mongoose = require('mongoose');

let merchantSchema = mongoose.Schema({
	username: String,
	password: String,
	merchantName: String,
	campaign: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Campaign"
	}]
});

let Merchant = module.exports = mongoose.model('Merchant', merchantSchema, 'Merchant')