var http = require('http');

var UGtoken;
var UGid = 'b3U6LS5wPbe_EeGfCRIxPSxaLg';
var UGsecret = 'b3U61WLxySrMTGFOp0s4w4yQ3iglVfk';

var item_stars = {};

var createUGtoken = function(cb) {

	var options = {
		host: 'api.usergrid.com',
		port: 80,
		path: '/management/token?grant_type=client_credentials&client_id=<USER_GRID_CLIENT_ID>&client_secret=<USER_GRID_CLIENT_SECRET>'
	};

	var body = '';

	console.log("createUGtoken");

	http.get(options, function(res) {
		console.log("Got response: " + res.statusCode);
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			body = JSON.parse(body);
			cb(null,body.access_token);
		});
	}).on('error', function(e) {
		cb(err);
	});
};

createUGtoken(function(err, token) {
	if(err) {
		console.log('createUGtoken error: ' + err);
	} else {
		UGtoken = token;
		console.log('UGtoken: ' + UGtoken);
	}
});


var UGaddFBuser = function(fb_token, cb) {
		var options = {
			host: 'api.usergrid.com',
			port: 80,
			path: '/<UG user id>/GilterView/auth/facebook',
			headers: {
				Authorization: 'Bearer ' + UGtoken
			},
			method: 'GET'
		};

		options.path += '?fb_access_token=' + fb_token;

		var body = '';

		console.log("UGaddFBuser");

		var request = http.request(options, function(result) {
			console.log('STATUS: ' + result.statusCode);
			console.log('HEADERS: ' + JSON.stringify(result.headers));
			//result.setEncoding('utf8');
			result.on('data', function (chunk) {
				body += chunk;
			});
			result.on('end', function() {
				body = JSON.parse(body);
				cb(null, body.access_token);
			});
		});

		request.on('error', function(e) {
			cb(err);
		});
		request.end();	
};

exports.authorize = function(req, res, next) {
	if(req.facebook.token) {
		UGaddFBuser(req.facebook.token, function(err, accToken) {
			if(err) {
				console.log("UGaddFBuser error: " + err);
			} else {
				req.UGtoken = accToken;
				console.log("Authorized Successfully");
				next();
			}
		});
	}
	else {
		console.log("Not logged into facebook");
		next();
	}
};

exports.render_comments = function(req, res) {
  req.facebook.app(function(app) {
    req.facebook.me(function(user) {
      res.render('comments.ejs', {
        layout:    false,
        req:       req,
        app:       app,
        user:      user,
				item_id:   req.params.item
      });
    });
  });
};

exports.render_main = function(req, res) {
  res.render('index.ejs');
};

exports.star_exists = function(req, res, next) {
	var stars = req.query('stars');
	if(stars) {
		req.stars = stars;
		next();
	} else {
		res.send('No Stars', 500);
	}
};

exports.star_update = function(req, res) {
	var stars = req.stars;
	var item_id = req.params.item;
	if(!item_stars.item_id) {
		item_stars.item_id = {
			num: 0,
			avg: 0,
			total: 0
		};
	}

	item_stars.item_id.num++;
	item_stars.item_id.total += stars;
	item_stars.item_id.avg = stars/num;
	res.send(item_stars.item_id.avg, 200);
};

exports.get_stars = function(req, res) {
	var stars = req.stars;
	var item_id = req.params.item;
	res.send(item_stars.item_id.avg, 200);
};
