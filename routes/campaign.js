var express = require('express');
var router = express.Router();
const multer = require('multer');
const moment = require('moment');

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

router.get('/', function(req, res){
	tdy = moment().format();
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
					newcoupon.save(function(err){
						if(err){
							console.log(err);
							return;
						}else{
							res.redirect('/campaign');
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