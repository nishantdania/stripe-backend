module.exports = {
  login: function (req, res) {
		var username = req.param('username');
		var password = req.param('password');

		if (!username || !password) {
		  return res.json(401, {err: 'username and password required'});
		}

		User.findOne({username: username}, function (err, user) {
			if (!user) {
				return res.json(401, {err: 'invalid username or password'});
			}
			User.comparePassword(password, user, function (err, valid) {
				if (err) {
					return res.json(403, {err: 'forbidden'});
				}
				if (!valid) {
					return res.json(401, {err: 'invalid username or password'});
				} else {
					res.json({
						user: user,
						token: jwt.generate({username : user.username })
					});
				}
			});
		})
   }
};

