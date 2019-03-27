var express = require('express');
var router = express.Router();
var assert = require('assert');

let Merchant = require('../models/merchant');
let Campaign = require('../models/campaign');

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

router.get('/:userid/:couponid', function(req, res){
	res.render('index');
});

module.exports = router;
