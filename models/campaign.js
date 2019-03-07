let mongoose = require('mongoose');

let campaignSchema = mongoose.Schema({
	campaignName: String,
	startingDate: Date,
	endingDate: Date,
	merchant: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Merchant'
	},
	couponLimit: {
		type: Number,
		default:20
	},
	location: {
		type: {
			type: String, // Don't do `{ location: { type: String } }`
			enum: ['Point'], // 'location.type' must be 'Point'
			required: true
		},
		coordinates: {
			type: [Number],
			required: true
		}
	}
});

let Campaign = module.exports = mongoose.model('Campaign', campaignSchema, 'Campaign')