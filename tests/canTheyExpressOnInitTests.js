var express = require('express'),	
	app = express(),
	request = require('request'),
	canThey = new (require('../index.js').Express)({
		onInitialization: function(cb){
			cb(null, {
				'/': 'admins:edit',
				'/:params/hello': 'test:secondary:tertiary'
			});
		}
	});
	console.log(canThey);
	
app.use(function(req, res, next){
	if(req.header('Which ACL') == '1'){
		req.userACL = { admins: { edit: true } };
	} else if(req.header('Which ACL') == '2'){
		req.userACL = { test: { secondary: "tertiary" } };
	} else if(req.header('Which ACL') == '3'){
		req.userACL = { admins: '*', test: { secondary: "tertiary" } };
	} else {
		req.userACL = { admins: { create: true }, test: { secondary: { fake: '*' } } };
	}
	
	next();
});
	
app.use('/', canThey.do, function(req, res){
	console.log("/ route hit");
	res.send("Hello world");
});

app.use('/:params/hello', canThey.do, function(req, res){
	console.log("Hello " + req.params.params);
	res.send("Hello " + req.params.params);
})

app.listen(3000, function(){
	
	request.get({
		url: 'http://localhost:3000/',
		headers: { 'Which ACL': '1' }
	}, function(e, r, body){
		console.log(e, body);
	})
	
});