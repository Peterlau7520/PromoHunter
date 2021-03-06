let mongoose = require('mongoose');

let couponSchema = mongoose.Schema({
	campaign: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Campaign'
	},
	merchant: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Merchant'
	},
	expiryDate: Date,
	picture: String,
	description: String,
	comments: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Comment'
	}]
});

let Coupon = module.exports = mongoose.model('Coupon', couponSchema, 'Coupon')