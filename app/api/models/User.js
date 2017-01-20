/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var bcrypt = require('bcrypt');  

module.exports = {

  attributes: {
	username : {
		type : 'string',
		required : true,
		unique : true
	},
	stripe_secret: {
		type : 'string'
	},
	email : {
		type : 'string',
		required : true
	},
	password : {
		type : 'string',
		required : true
	},
	coupons : 'array',

	toJSON: function () {
		var obj = this.toObject();
		delete obj.password;
		return obj;
	}
  },

  /** Hash password before saving to db**/ 
  beforeCreate : function (values, next) {
	bcrypt.genSalt(10, function (err, salt) {
		if(err) return next(err);
		bcrypt.hash(values.password, salt, function (err, hash) {
			if(err) return next(err);
			values.password = hash;
			delete values.confirmPassword;
			next();
		})
	})
  },
  /** Compare password to encrypted password**/
  comparePassword : function (password, user, cb) {
	bcrypt.compare(password, user.password, function (err, match) {
		if(err) cb(err);
		if(match) {
			cb(null, true);
		} else {
			cb(err);
		}
	})
  }
};

