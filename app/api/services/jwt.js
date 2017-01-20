var jwt = require('jsonwebtoken'),
	tokenSecret = "secretissecret",
	expireTime = 10000000;

module.exports.generate = function(payload) {
	return jwt.sign(
		payload,
		tokenSecret, 
		{
		  expiresIn : expireTime 
		}
	);
};

module.exports.verify = function(token, callback) {
	return jwt.verify(
		token, 
		tokenSecret, 
		{}, 
		callback
	);
};
