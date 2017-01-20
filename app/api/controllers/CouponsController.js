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
  }	
};

