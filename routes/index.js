var express = require('express');
var router = express.Router();
var assert = require('assert');

let Merchant = require('../models/merchant');
let MerchantInfo = require('../models/merchantInfo');
let Campaign = require('../models/campaign');
let Coupon = require('../models/coupon');
let User = require('../models/user');

/* GET login page. */
router.get('/', function(req, res, next) {
	if(req.session.user){
		res.redirect('/main');
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
		MerchantInfo.find({
			merchantName: req.session.user
		}, {
			_id: 0,
			logo: 1
		}, function(err, result){
			if(result.length > 0){
				req.session.logo = result[0].logo
			}
			res.render('main');
		});
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

router.get('/coupon', function(req, res){
	if(req.session.user){
		merchantid = req.session.userObjID;
		// Populate campaign
		Coupon.find({
			merchant: merchantid
		}).populate('campaign').exec(function(err, result){
			if(err){
				console.log(err);
			}else{
				res.render('coupon', {coupons: result});
			}
		});
	}else{
		res.redirect('/');
	}
});

router.get('/searchcoupon', function(req, res){
	if(req.session.user){
		merchantid = req.session.userObjID;
		var key = req.query.search;
		Coupon.find({
			merchant: merchantid
		}).populate('campaign').exec(function(err, result){
			if(err){
				console.log(err);
			}else{
				if(req.query.search){
					var couponArray = [];
					result.forEach(function(filter){
						if(JSON.stringify(filter.description).includes(key) || JSON.stringify(filter.campaign.campaignName).includes(key)){
							couponArray.push(filter);
						}
					});
				}else{
					couponArray = result
				}
				var reshtml = "";
				couponArray.forEach(function(coupon){
					reshtml += "<div class='col-md-3'><div class='card'><img class='card-img-top' src='https://promohunter-merchantstation.herokuapp.com/";
					reshtml += coupon.picture;
					reshtml += "' /><div class='card-body'><h4 class='card-title'>";
					reshtml += coupon.campaign.campaignName;
					reshtml += "</h4><p class='card-text'>";
					reshtml += coupon.description;
					reshtml += "</p></div><div class='card-footer'><small class='text-muted'>Expires on ";
					reshtml += JSON.stringify(coupon.expiryDate).substring(1, 11);
					reshtml += "</small></div></div></div>";
				});
				res.send(reshtml);
			}
		});
	}else{
		res.redirect('/');
	}
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
