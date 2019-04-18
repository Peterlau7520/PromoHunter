var express = require('express');
var router = express.Router();
var multer = require('multer');

let MerchantInfo = require('../models/merchantInfo');
let Merchant = require('../models/merchant');

const nullObj = Object.create(null);

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
	console.log(nullObj);
	if(req.session.user){
		MerchantInfo.find({
			merchantName: req.session.user
		}, function(err, result){
			if(result.length > 0){
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
				console.log(err)
			}else{
				if(JSON.stringify(req.files) === JSON.stringify(nullObj)){
					// undefined file
					console.log('undefined file');
				}else{
					console.log(req.files.picture[0]);
					console.log('OK!');
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