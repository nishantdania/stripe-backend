/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var stripe = require("stripe")("sk_test_3WJqrtRKXgtC3m3jd6jtB0PV");
var async = require("async");

function addUserToStripe(user, callback) {
	var stripe = require("stripe")("sk_test_3WJqrtRKXgtC3m3jd6jtB0PV");
	stripe.accounts.create({
		country: "US",
		managed: true
		}, function (err, account) {
				if (err) return callback(err, null);
				else if (account) {
					callback(null, user, account);
					var secret = account.keys.secret;
					user.stripe_id = account.id;
					user.stripe_secret = secret;
					user.save(function(err, user) {
						if(err) return callback(err, null);
						if(user) callback(null, user, account);
					});
			}
		}
	);
}

function updateUserSecret(user, account, callback) {
	User.update({username : user.username}, {stripe_secret : account.keys.secret}, function (err, userResult) {
		if (err) return callback (err, null);
		else if (userResult) {
			callback(null, userResult);
		}
	});
}

function addUserToDb(data, callback) {
	User.create(data).exec(function (err, user) {
		if (err) {
			return callback(err, null);
		}
		if (user) {
			callback(null, user);
		}
	});
}

module.exports = {
	/** Overriding create**/
	create: function (req, res) {
		if (req.body.password !== req.body.confirmPassword) {
			return res.json(401, {err: 'Passwords don\'t match'});
		}
		async.waterfall([
			function (callback) {
				callback(null, req.body);
			},
			addUserToDb,
			addUserToStripe,
			updateUserSecret
			], function(err, result) {
				if(err) res.json(400, {err: err});	
				else if(result) res.json(200, { success: "true", user: result, token: jwt.generate({username: result[0].username}) });
				else {
					res.json(400, {err: 'An Error Occurred'});
				}
			}
		);
	}	
}	

