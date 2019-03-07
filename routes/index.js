var express = require('express');
var router = express.Router();

let Merchant = require('../models/merchant');

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

module.exports = router;
