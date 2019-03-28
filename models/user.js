let mongoose = require('mongoose');

let userSchema = mongoose.Schema({
	username: String,
	password: String,
	birthday: Date,
	gender: String,
	name: String,
	savedCoupons: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Coupon"
	}],
	redeemedCoupons: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Coupon"
	}]
});

let User = module.exports = mongoose.model('User', userSchema, 'User')