/**
 * CouponsController
 *
 * @description :: Server-side logic for managing Coupons
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var stripe = require("stripe")("sk_test_3WJqrtRKXgtC3m3jd6jtB0PV"),
	async = require("async");

function checkExistingCoupon(user, req, callback) {
	if (user.coupons && user.coupons.indexOf(req.body.id) < -1) {
			return callback({err: 'Coupon Already Exists'}, null);
	}
	else {
		callback(null, user, req);
	}
}

function addCouponToStripe(user, req, callback) {
	var stripe = require("stripe")(user.stripe_secret);
	stripe.coupons.create(req.body.coupon
		, function(err, coupon) {
			if (err) return callback(err, null);
			else if(coupon) {
				callback(null, req, coupon);
			}
		}
	);
}

function addCouponToDb(req, coupon, callback) {
	if (coupon) {
		Coupons.create({couponId: coupon.id}, function (err, result) {
			if (err) return callback(err, null);
			else if (result) {
				callback(null, req, coupon);
			}
		});
	}
	else {
		return callback({err: 'An error occurred'});
	}
}

function updateUser(req, coupon, callback) {
	if (coupon) {
		User.findOne({username : req.token.username}, function(err, user) {
			if (err) return callback(err, null);
			else if (user) {
				var coupons = user.coupons;
				if (typeof coupons === 'undefined') coupons = [];
				coupons.push(coupon.id);
				user.coupons = coupons;
				user.save();
				callback(null, true);
			}
		});
	}
}

module.exports = {
  addCoupon: function(req, res) {
	if (!req.token.username) res.json(403, {err: 'Not Authorized'});
	else {
		User.findOne({username: req.token.username}, function (err, user) {
			if (err) res.json(400, {err: err});
			else if(user) {
				async.waterfall([
					function (callback) {
						callback(null, user, req);
					},
					checkExistingCoupon,
					addCouponToStripe,
					addCouponToDb,
					updateUser
				], function(err, result) {
						if (err) res.json(400, {err: err, success: 'false'});
						else if (result) {
							res.json(200, {success: true});
						}
						else {
							res.json(400, {err: 'An Error Occurred'});
						}
				});
			}
			else {
				res.json(400, {err: 'No user found'});
			}
		});		
	}
  },
  
  removeCoupon: function(req, res) {
	if(!req.body.id) res.json(400, {err: 'Invalid Coupon Id'});
	User.findOne({username: req.token.username}, function (err, user) {
		if (err) res.json(400, {err: err});
		else if (user) {
			if(user.coupons.indexOf(req.body.id) > -1) {
				user.coupons.splice(user.coupons.indexOf(req.body.id), 1);
				user.save();
				var stripe = require("stripe")(user.stripe_secret);
				stripe.coupons.del(req.body.id);
				res.json(200, {success: true});
			}
		}
	});
  },

  getCoupons: function (req, res) {
	if (req.token) {
		User.findOne({username : req.token.username}, function (err, user) {
			if (err) res.json(err.status, {err: err});
			else if (user) {
				var stripe = require("stripe")(user.stripe_secret);
					stripe.coupons.list(
						{},
						function(err, coupons) {
							res.json(200, {coupons: coupons});
						}
					);
			}
			else {
				res.json(403, {err: 'User not found'});
			}
		});
	}	
	else {
		res.json(401, {err: 'Invalid token'});
	}
  }	
};

