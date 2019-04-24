var express = require('express');
var router = express.Router();
var assert = require('assert');
var mongoose = require('mongoose');
var plotly = require('plotly')('lauwaiyuk', 'cnqVKsutPIWYS3tnz0xV');
var fs = require('fs');
const sharp = require('sharp');
const { Expo } = require('expo-server-sdk');
let expo = new Expo();

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
				req.session.logo = result[0].logo;
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
				if(req.query.searchkey){
					res.render('coupon', {coupons: result, searchkey: req.query.searchkey});
				}else{
					res.render('coupon', {coupons: result});
				}
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

router.get('/performance', function(req, res){
	if(req.session.user){
		var promises = [];
		/*User.aggregate([{
			$group:{
				_id: null,
				savedCoupons:{
					$sum: { $size: { "$ifNull": [ "$savedCoupons", [] ] } }
				},
				redeemedCoupons:{
					$sum: { $size: { "$ifNull": [ "$redeemedCoupons", [] ] } }
				}
			}
		}], function(err, couponNo){
			if(err){
				console.log(err);
			}else{
				console.log(couponNo);
			}
		});*/
		User.find({
			redeemedCoupons:{
				$ne: []
			}
		}, {
			_id: 0,
			redeemedCoupons: 1
		}).populate({
			path: 'redeemedCoupons',
			match: {
				merchant: req.session.userObjID
			},
			select: '_id campaign',
			populate: {
				path: 'campaign',
				select: 'campaignName -_id'
			}
		}).exec(function(err, redeem){
			if(err){
				console.log(err);
			}else{
				User.find({
					savedCoupons:{
						$ne: []
					}
				}, {
					_id: 0,
					savedCoupons: 1
				}).populate({
					path: 'savedCoupons',
					match: {
						merchant: req.session.userObjID
					},
					select: '_id campaign',
					populate: {
						path: 'campaign',
						select: 'campaignName -_id'
					}
				}).exec(function(err, save){
					if(err){
						console.log(err);
					}else{
						promises.push(
							new Promise((resolve, reject)=>{
								var couponNo = [0, 0];
								var savedMap = new Map();
								var redeemedMap = new Map();
								redeem.forEach(function(r){
									couponNo[0] += r.redeemedCoupons.length;
									r.redeemedCoupons.forEach(function(rc){
										if(redeemedMap.get(rc.campaign.campaignName) == undefined){
											redeemedMap.set(rc.campaign.campaignName, 1);
										}else{
											redeemedMap.set(rc.campaign.campaignName, redeemedMap.get(rc.campaign.campaignName)+1);
										}
									});
								});
								save.forEach(function(s){
									couponNo[1] += s.savedCoupons.length;
									s.savedCoupons.forEach(function(sc){
										if(savedMap.get(sc.campaign.campaignName) == undefined){
											savedMap.set(sc.campaign.campaignName, 1);
										}else{
											savedMap.set(sc.campaign.campaignName, savedMap.get(sc.campaign.campaignName)+1);
										}
									});
								});
								couponNo.push(redeemedMap);
								couponNo.push(savedMap);
								resolve(couponNo);
							})
						);
						Promise.all(promises).then(function(couponNo){
							var redeemed = couponNo[0][0];
							var saved = couponNo[0][1];
							var redeemedMap = couponNo[0][2];
							var savedMap = couponNo[0][3];
							console.log(couponNo);
							Campaign.aggregate([{
								$match:{
									merchant: new mongoose.Types.ObjectId(req.session.userObjID)
								}
							}, {
								$group:{
									_id: null,
									remain:{
										$sum: "$couponLimit"
									}
								}
							}], function(err, remaining){
								if(err){
									console.log(err);
								}else{
									var trace1 = {
										x: [],
										y: [],
										type: "bar"
									};
									var trace2 = {
										x: [],
										y: [],
										type: "bar"
									};
									if(redeemedMap.size > 5){
										const mapSort = new Map([...redeemedMap.entries()].sort((a, b) => b[1] - a[1]));
										var count = 0;
										for(var [k, v] of mapSort){
											if(count < 5){
												trace1.x.push(k);
												trace1.y.push(v);
												count = count + 1;
											}else{
												break;
											}
										}
									}else{
										for(var [k, v] of redeemedMap){
											trace1.x.push(k);
											trace1.y.push(v);
										}
									}
									if(savedMap.size > 5){
										const mapSort = new Map([...savedMap.entries()].sort((a, b) => b[1] - a[1]));
										var count = 0;
										for(var [k, v] of mapSort){
											if(count < 5){
												trace2.x.push(k);
												trace2.y.push(v);
												count = count + 1;
											}else{
												break;
											}
										}
									}else{
										for(var [k, v] of savedMap){
											trace2.x.push(k);
											trace2.y.push(v);
										}
									}
									var figure1 = { 'data': [trace1] };
									var figure2 = { 'data': [trace2] };
									var imgOpts = {
										format: 'png',
										width: 400,
										height: 500
									};
									plotly.getImage(figure1, imgOpts, function (error, imageStream) {
										if (error) return console.log (error);
										var fileStream = fs.createWriteStream('./charts/topsaved.png');
										imageStream.pipe(fileStream);
									});
									plotly.getImage(figure2, imgOpts, function (error, imageStream) {
										if (error) return console.log (error);
										var fileStream = fs.createWriteStream('./charts/topredeemed.png');
										imageStream.pipe(fileStream);
									});

									sharp('./charts/topsaved.png').extract({ width: 340, height: 420, left: 40, top: 60 }).toFile('./charts/topsavedcrop.png')
									.then(function(new_file_info) {
										console.log("Image cropped and saved");
									})
									.catch(function(err) {
										console.log("An error occured");
									});

									sharp('./charts/topredeemed.png').extract({ width: 340, height: 420, left: 40, top: 60 }).toFile('./charts/topredeemedcrop.png')
									.then(function(new_file_info) {
										console.log("Image cropped and saved");
									})
									.catch(function(err) {
										console.log("An error occured");
									});

									res.render('performance', {
										noOfRedeemed: redeemed,
										noOfSaved: redeemed+saved,
										noOfRemaining: remaining[0].remain
									});
								}
							});
						});
					}
				});
			}
		});
	}else{
		res.redirect('/');
	}
});

router.get('/trend', function(req, res){
	if(req.session.user){
		res.render('trend');
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
			res.json("Fail");
		}else{
			Coupon.find({
				_id: couponid
			}, function(err2, result2){
				if(err2){
					res.json("Fail");
				}else{
					Campaign.findOneAndUpdate({
						_id: result2[0].campaign
					}, {
						$inc: {
							couponLimit: -1
						}
					}, function(err3, result3){
						if(err3){
							res.json("Fail");
						}else{
							res.json("Success");
						}
					});
				}
			});
		}
	});
});

router.get('/couponQR/:userid/:couponid', function(req, res){
	userid = req.params.userid;
	couponid = req.params.couponid;
	res.render('couponqr', {
		userid: userid,
		couponid: couponid
	});
});

router.post('/validatedQR', function(req, res){
	userid = req.body.userid;
	couponid = req.body.couponid;

	Merchant.find({
		password: req.body.merchantpw
	}, function(err, merchantid){
		if(err){
			res.render('validatedqr', {msg: "Failed to redeem"});
		}else{
			Coupon.find({
				_id: couponid,
				merchant: merchantid[0]._id
			}, function(err2, checkedcoupon){
				if(checkedcoupon.length > 0){
					User.find({
						_id: userid,
						savedCoupons: couponid
					}, function(err, user, next){
						if(err){
							res.render('validatedqr', {msg: "Failed to redeem"});
						}else{
							if(result == ""){
								res.render('validatedqr', {msg: "Failed to redeem"});
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
										res.render('validatedqr', {msg: "Failed to redeem"});
									}else{
										let messages = [];
										messages.push({
											to: user[0].notificationToken,
											sound: 'default',
											body: 'Redeemed successfully',
											data: { status: "Redeemed successfully" }
										});
										let chunks = expo.chunkPushNotifications(messages);
										let tickets = [];
										(async () => {
											// Send the chunks to the Expo push notification service. There are
											// different strategies you could use. A simple one is to send one chunk at a
											// time, which nicely spreads the load out over time:
											for (let chunk of chunks) {
												try {
													let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
													console.log(ticketChunk);
													tickets.push(...ticketChunk);
													// NOTE: If a ticket contains an error code in ticket.details.error, you
													// must handle it appropriately. The error codes are listed in the Expo
													// documentation:
													// https://docs.expo.io/versions/latest/guides/push-notifications#response-format
												} catch (error) {
													console.error(error);
												}
											}
										})();
										res.render('validatedqr', {msg: "Redeemed successfully"});
									}
								});
							}
						}
					});
				}else{
					res.render('validatedqr', {msg: "Failed to redeem"});
				}
			});
		}
	});
});

module.exports = router;
