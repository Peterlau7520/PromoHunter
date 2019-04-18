let mongoose = require('mongoose');

let merchantInfoSchema = mongoose.Schema({
	merchantName: String,
	logo: String,
	description: String,
	pictures: [{
		path: String,
		caption: String
	}],
	location: [{
		type: {
			type: String, // Don't do `{ location: { type: String } }`
			enum: ['Point'], // 'location.type' must be 'Point'
			required: true
		},
		coordinates: {
			type: [Number],
			required: true
		},
		typedAddress: String
	}]
});

let MerchantInfo = module.exports = mongoose.model('MerchantInfo', merchantInfoSchema, 'MerchantInfo')