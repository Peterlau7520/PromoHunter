const mongoose = require("mongoose")

const Schema = mongoose.Schema

const userSchema = new Schema({
	username: String,
	password: String,
	birthday: Date,
	gender: String,
	name: String, 
	coupons: [{type: Schema.Types.ObjectId.ref: 'Coupon'}]
})


const merchantSchema = new Schema({
	username: String,
	password: String,
	merchantName: String,
	campaign: [{type: Schema.Types.ObjectId.ref: 'Campaign'}] 
})


const merchantInfo = new Schema({
	merchantName: String,
	logo: String,
	pictures: Array,
	description: String,
	location: type: {
			type: String, // Don't do `{ location: { type: String } }`
			enum: ['Point'], // 'location.type' must be 'Point'
			required: true
		},
		coordinates: {
			type: [Number],
			required: true
		}
})

const coupons = new Schema({
	campaign: {type: Schema.Types.ObjectId.ref: 'Campaign'},
	merchant: {type: Schema.Types.ObjectId.ref: 'Merchant'},
	couponStatus: String, // used, saved, 
	//expiryDate: Date, duplicate with ending date?
	picture: String,
	description: String
})

const campaign = new Schema({
	campaignName: String,
	//duration: Number, 
	startingDate: Date,
	endingDate: Date,
	merchant: {type: Schema.Types.ObjectId.ref: 'Merchant'},
	couponLimit: Number, default:20
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
	},
})