var express = require('express');
var router = express.Router();
var assert = require('assert');

let Merchant = require('../models/merchant');
let Campaign = require('../models/campaign');
let User = require('../models/user');

/* GET login page. */
router.get('/', function(req, res, next) {
	if(req.session.user){
		res.render('main');
  	}else{
  		res.render('index');
  	}
});

router.post('/', function(req, res){
	if(req.session.user){
		res.render('main');
	}else{
		Merchant.find({username: req.body.username, password: req.body.password}, (err, result) => {
			if(result.length > 0){
				req.session.user = result[0].merchantName;
				req.session.userObjID = result[0]._id;
				res.redirect('/main');
			}else{
				res.render('index', { invalidLogin: 'Incorrect username/password' });
			}
		});
	}
});

router.get('/main', function(req, res){
	if(req.session.user){
		res.render('main');
	}else{
		res.redirect('/');
	}
});

router.get('/logout', function(req, res){
	req.session.destroy((err) => {
		if(err){
			console.log("Cannot access session");
		}
	});
	res.redirect('/');
});

router.get('/insight', function(req, res){
	if(req.session.user){
		res.render('insight');
	}else{
		res.redirect('/');
	}
});

router.get('/geospatial', function(req, res){
	res.render('geospatial_search');
});

router.post('/geospatial', function(req, res){
	// request send a pair of coordinates
	var subLocationStr = req.body.location.substring(1, req.body.location.length-1);
	var coords = subLocationStr.split(", ");
	Campaign.find({
		location:{
			$near:{
				$geometry:{
					type: 'Point',
					coordinates: [Number(coords[1]), Number(coords[0])]
				},
				$maxDistance: 1000
			}
		}
	}, function(err, result){
		if(err){
			console.log(err);
			return;
		}else{
			console.log(result);
			return result;
		}
	});
	// response return a json of coordinates nearby
});

router.get('/savecoupon/:userid/:couponid', function(req, res){
	userid = req.params.userid;
	couponid = req.params.couponid;
	User.findOneAndUpdate({
		_id: userid
	}, {
		$push: {
			savedCoupons: couponid
		}
	}, function(err, result){
		if(err){
			res.render('couponqr', {msg: "Failed to save"});
		}else{
			res.render('couponqr', {msg: "Save successfully"});
		}
	});
});

router.get('/couponQR/:userid/:couponid', function(req, res){
	userid = req.params.userid;
	couponid = req.params.couponid;
	User.find({
		_id: userid,
		savedCoupons: couponid
	}, function(err, result, next){
		if(err){
			res.render('couponqr', {msg: "Failed to redeem"});
		}else{
			if(result == ""){
				res.render('couponqr', {msg: "Failed to redeem"});
			}else{
				User.findOneAndUpdate({
					_id: userid,
					savedCoupons: couponid
				}, {
					$push: {
						redeemedCoupons: couponid
					},
					$pull: {
						savedCoupons: couponid
					}
				}, function(err, result){
					if(err){
						res.render('couponqr', {msg: "Failed to redeem"});
					}else{
						res.render('couponqr', {msg: "Redeemed successfully"});
					}
				});
			}
		}
	});
});

module.exports = router;
