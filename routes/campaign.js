var express = require('express');
var router = express.Router();

let Campaign = require('../models/campaign');

router.get('/', function(req, res){
	if(req.session.user){
		Campaign.find({merchant: req.session.userObjID}, function(err, result){
			res.render('campaign', {
				campaigns: result
			});
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
				coordinates: [Number(coords[0]), Number(coords[1])]
			}
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

router.get('/view', function(req, res){
	if(req.session.user){
		res.render('view_campaign');
	}else{
		res.redirect('/');
	}
});

module.exports = router;