let mongoose = require('mongoose');

let commentSchema = mongoose.Schema({
	coupon: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Coupon"
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	comment: String,
	rating: Number,
	date: Date
});

let Comment = module.exports = mongoose.model('Comment', commentSchema, 'Comment');

// GET comments by a particular user
router.get('/comment/:userid', function(req, res){
	Comment.find({
		user: req.params.userid
	}, function(err, result){
		if(err){
			res.send(JSON.parse("Error: "+err));
		}else{
			res.send(JSON(result));
		}
	});
});

// POST comments to a particular coupon by a particular user
router.post('/comment', function(req, res){
	var newComment = new Comment({
		coupon: req.body.couponid,
		user: req.body.userid,
		comment: req.body.comment,
		rating: req.body.rating,
		date: req.body.date
	});
	newComment.save(function(err){
		if(err){
			res.send(JSON.parse('Fail'));
		}else{
			res.send(JSON.parse('Success'));
		}
	})
});