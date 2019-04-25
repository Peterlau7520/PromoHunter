var express = require('express');
var router = express.Router();
const multer = require('multer');
const moment = require('moment');
const { Expo } = require('expo-server-sdk');
let expo = new Expo();

const storage = multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, './coupon_pictures/');
	},
	filename: function(req, file, cb){
		cb(null, new Date().toISOString().replace(/:/g, '-')+file.originalname);
	}
});

const fileFilter = (req, file, cb) => {
	if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'|| file.mimetype === 'image/jpg' || file.mimetype === 'image/gif'){
		cb(null, true);
	}else{
		cb(null, false);
	}
};

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 1024 * 1024 * 5
	},
	fileFilter: fileFilter
}).single('picture');

let Campaign = require('../models/campaign');
let Coupon = require('../models/coupon');
let User = require('../models/user');

router.get('/', function(req, res){
	tdy = moment().format();
	console.log(tdy);
	if(req.session.user){
		Campaign.find({
			merchant: req.session.userObjID,
			startingDate: {
				$lte: tdy
			},
			endingDate: {
				$gte: tdy
			}
		}, function(err, current){
			Campaign.find({
				merchant: req.session.userObjID,
				startingDate: {
					$gt: tdy
				}
			}, function(err, upcoming){
				Campaign.find({
					merchant: req.session.userObjID,
					endingDate: {
						$lt: tdy
					}
				}, function(err, past){
					res.render('campaign', {
						past: past,
						current: current,
						upcoming: upcoming
					});
				});
			});
		});
	}else{
		res.redirect('/');
	}
});

router.post('/addcoupon/:campaignid', function(req, res){
	if(req.session.user){
		upload(req, res, (err) => {
			if(err){
				console.log(err);
				return;
			}else{
				if(req.file == undefined){
					console.log('file undefined');
					return;
				}else{
					var newcoupon = new Coupon({
						campaign: req.params.campaignid,
						merchant: req.session.userObjID,
						picture: req.file.path,
						expiryDate: req.body.expirydate,
						description: req.body.description
					});
					newcoupon.save(function(err, newcoupon){
						if(err){
							console.log(err);
							return;
						}else{
							//Handling notifications

							let messages = [];
							var promises = [];
							var coord = req.body.coordinates;
							var latlng = coord.split(',');
							
							User.find({
								$and: [
									{ notificationToken:{
										$exists: true
									} },
									{ notificationToken: {
										$ne: ""
									} }
								]
							}, function(err, result){
								if(err){
									console.log(err);
								}else{
									console.log('pushToken');
									promises.push(
										new Promise((resolve, reject)=>{
											result.forEach(function(tkn){
												messages.push({
													to: tkn.notificationToken,
													sound: 'default',
													body: 'This is a test notification',
													data: { 
														latitude: latlng[1],
														longitude: latlng[0],
														couponid: newcoupon._id
													}
												});
											});
											resolve(messages);
										})
									);
									Promise.all(promises).then(function(msg){
										console.log('msg ', msg);
										let chunks = expo.chunkPushNotifications(msg[0]);
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
										res.redirect('/campaign');
									})
								}
							});
						}
					});
				}
			}
		});
	}else{
		res.redirect('/');
	}
});

router.post('/create', function(req, res){
	if(req.session.user){
		var subLocationStr = req.body.location.substring(1, req.body.location.length-1);
		var coords = subLocationStr.split(", ");
		var newcampaign = new Campaign({
			campaignName: req.body.campaignname,
			startingDate: req.body.startdate,
			endingDate: req.body.enddate,
			merchant: req.session.userObjID,
			location: {
				type: 'Point',
				coordinates: [Number(coords[1]), Number(coords[0])]
			},
			address: req.body.address
		});
		newcampaign.save(function(err){
			if(err){
				console.log(err);
				return;
			}else{
				res.redirect('/campaign');
			}
		});
	}else{
		res.redirect('/');
	}
});

module.exports = router;