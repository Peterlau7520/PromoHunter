var express = require('express');
var router = express.Router();
var multer = require('multer');
var request = require('request');

let MerchantInfo = require('../models/merchantInfo');
let Merchant = require('../models/merchant');

const nullObj = Object.create(null);
const apikey = 'AIzaSyBjLzcJetGHFSzSzcI6ivDy9zJSz734Ong';
const baseurl = 'https://maps.googleapis.com/maps/api/geocode/json?address=';

const storage = multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, './merchant_images/');
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
}).fields([
	{ name: 'logo', maxCount: 1 },
	{ name: 'picture', maxCount: 5 }
]);

router.get('/', function(req, res){
	if(req.session.user){
		MerchantInfo.find({
			merchantName: req.session.user
		}, function(err, result){
			if(result.length > 0){
				req.session.logo = result[0].logo;
				res.render('account', { merchantInfo: result });
			}else{
				res.render('account');
			}
		});
	}else{
		res.redirect('/');
	}
});

router.post('/', function(req, res){
	if(req.session.user){
		upload(req, res, (err) => {
			if(err){
				// error handling
				res.render('account', { msg: 'Failed to upload image(s). Please try again.' });
			}else{
				if(JSON.stringify(req.files) === JSON.stringify(nullObj)){
					// undefined file
					res.render('account', { msg: 'No image(s) selected.' });
				}else{
					var picNo = req.body.picNo;
					var locNo = req.body.locNo;
					var picArray = [];
					var locArray = [];
					if(picNo == 1){
						picArray.push({
							path: req.files.picture[0].path,
							caption: req.body.caption
						});
					}else{
						for(let i=0; i<picNo; i++){
							picArray.push({
								path: req.files.picture[i].path,
								caption: req.body.caption[i]
							});
						}
					}
					if(locNo == 1){
						var address = req.body.location;
						var url = baseurl + address + "&key=" + apikey;
						var lng, lat;
						request(url, function(err, gres, body){
							if(!err && gres.statusCode == 200){
								lng = JSON.parse(body).results[0].geometry.location.lng;
								lat = JSON.parse(body).results[0].geometry.location.lat;
								locArray.push({
									type: 'Point',
									coordinates: [Number(lng), Number(lat)],
									typedAddress: address
								});
								var newMerchantInfo = new MerchantInfo({
									merchantName: req.session.user,
									logo: req.files.logo[0].path,
									description: req.body.description,
									pictures: picArray,
									location: locArray
								});
								newMerchantInfo.save(function(err){
									if(err){
										console.log(err);
										res.render('account', { msg: 'Failed to save profile. Please try again.' });
									}else{
										res.redirect('/account');
									}
								});
							}else{
								console.log(err);
							}
						});
					}else{
						for(let i=0; i<locNo; i++){
							let address = req.body.location[i];
							var url = baseurl + address + "&key=" + apikey;
							var lng, lat;
							var geoPromise = new Promise(function(resolve, reject){
								request(url, function(err, gres, body){
									if(!err && gres.statusCode == 200){
										resolve(JSON.parse(body));
									}else{
										reject(err);
									}
								});
							});
							console.log('outside: ', address);
							geoPromise.then(function(result){
								lng = result.results[0].geometry.location.lng;
								lat = result.results[0].geometry.location.lat;
								console.log('inside: ', address);
								locArray.push({
									type: 'Point',
									coordinates: [Number(lng), Number(lat)],
									typedAddress: address
								});
								console.log(locArray);
								if(i == locNo-1){
									var newMerchantInfo = new MerchantInfo({
										merchantName: req.session.user,
										logo: req.files.logo[0].path,
										description: req.body.description,
										pictures: picArray,
										location: locArray
									});
									newMerchantInfo.save(function(err){
										if(err){
											console.log(err);
											res.render('account', { msg: 'Failed to save profile. Please try again.' });
										}else{
											res.redirect('/account');
										}
									});
								}

							}, function(err){
								console.log(err);
							});
						}
					}
				}
			}
		});
	}else{
		res.redirect('/');
	}
});

router.get('/changepassword', function(req, res){
	if(req.session.user){
		res.render('changepassword');
	}else{
		res.redirect('/');
	}
});

router.post('/changepassword', function(req, res){
	if(req.session.user){
		Merchant.find({
			_id: req.session.userObjID,
			password: req.body.oldpw
		}, function(err, result){
			if(err){
				console.log('1: ', err);
				res.render('changepassword', { msg: 'Failed to change password.' });
			}else{
				if(result.length > 0){
					Merchant.update({
						_id: req.session.userObjID
					}, {
						$set:{
							password: req.body.newpw
						}
					}, function(err2, result2){
						if(err2){
							console.log('2: ', err2);
							res.render('changepassword', { msg: 'Failed to change password.' });
						}else{
							res.render('changepassword', { msg: 'Changed password successfully.' });
						}
					});
				}else{
					console.log('3: ', err);
					res.render('changepassword', { msg: 'Failed to change password.' });
				}
			}
		});
	}else{
		res.redirect('/');
	}
});

module.exports = router;