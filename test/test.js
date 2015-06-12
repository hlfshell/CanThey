
var assert = require('chai').assert,
	expect = require('chai').expect,
	canThey = require('../index').canThey,
	cte = require('../index').Express,
	httpMocks = require('node-mocks-http');
	
var givenACL = 
	{
		admins:
			{
				create: true,
				read: true,
				delete: false
			},
		users: "*",
		products:
			{
				books:
					{
						read: true
					},
				music: false
			}
	};

describe('CanThey - function', function(){
	it('should always succeed if permissions require is "*" w/ givenACL', function(){
		assert.equal(canThey('*', givenACL), true);
	});
	
	it('should always succeed if the given ACL is simply "*"', function(){
		assert.equal(canThey('admins:create', '*'), true);
	});
	
	it('should return true if the given permissions required is "admins" w/ givenACL', function(){
		assert.equal(canThey('admins', givenACL), true);
	});
	
	it('should return false if the given permissions required is "notHere" w/ givenACL', function(){
		assert.equal(canThey('notHere', givenACL), false);
	});
	
	it('should return true if the given permissions is "products:books:read" w/ givenACL', function(){
		expect(canThey('products:books:read', givenACL)).to.be.true;
	});
	
	it('should return true if the given permissions is "products:books" w/ givenACL', function(){
		expect(canThey('products:books', givenACL)).to.be.true;
	});
	
	it('should return false if the given permissions is "products:books:write" w/ givenACL', function(){
		expect(canThey('products:books:write', givenACL)).to.be.false;
	});
	
	it('should return false if the given permissions is "products:toys:balls"  w/ givenACL', function(){
		expect(canThey('products:toys:balls', givenACL)).to.be.false;
	});
	
	it('should return true if the given permissions is "users:edit:passwords"  w/ givenACL', function(){
		expect(canThey('users:edit:passwords', givenACL)).to.be.true;
	});
});

describe('CanThey - express, no onRouteCall setup', function(){
	var canThey, req, res, next;
	
	before(function(){
		canThey = new cte();
	});
	
	beforeEach(function(){
		req = httpMocks.createRequest();
		req.userACL = givenACL;
		res = httpMocks.createResponse();
		next = function(){};
	});
	
	it('should throw an error if we do not pass it 4 arguments', function(){
		expect(function(){ canThey.do("fake", "arguments") }).to.throw('CanTheyExpress requires 3 attributes if onRouteCall is set, 4 othewise: [aclRequired], req, res, next');
	});
	
	it('should return 401 if req.userACL is undefined', function(){
		canThey.do(null, req, res, next);
		
		expect(res.statusCode).to.be.equal(403);
	});
	
	it('should call next if req.userACL is "*" w/ given ACL', function(){
		canThey.do('*', req, res, function(){
			expect.ok;
		});
	});
	
	it('should call next if req.userACL is "admins" w/ given ACL', function(){
		canThey.do('admins', req, res, function(){
			expect.ok;
		});
	});
	
	it('should return 403 if req.userACL is "admins:delete" w/ given ACL', function(){
		canThey.do('admins:delete', req, res, next);
		
		expect(res.statusCode).to.be.equal(403);
	});
	
	it('should call next if req.userACL is "products:books" w/ given ACL', function(){
		canThey.do('products:books', req, res, function(){
			expect.ok;
		});
	});
	
	it('should call next if req.userACL is "products:books:read" w/ given ACL', function(){
		canThey.do('products:books:read', req, res, function(){
			expect.ok;
		});
	});
	
	it('should return 403 if req.userACL is "products:books:write" w/ given ACL', function(){
		canThey.do('products:books:write', req, res, next);
		
		expect(res.statusCode).to.be.equal(403);
	});
	
	it('should return 403 if req.userACL is "products:music:albums:sell" w/ given ACL', function(){
		canThey.do('products:msuic:albums:sell', req, res, next);
		
		expect(res.statusCode).to.be.equal(403);
	});
	
});

describe('CanThey - express, onRouteCall is used', function(){
	var canThey, req, res, next;
	
	beforeEach(function(){
		req = httpMocks.createRequest();
		res = httpMocks.createResponse();
		canThey = new cte({
			onRouteCall: function(req, res, cb){
				cb(null, req.routeACL, givenACL);
			}
		});
		next = function(){};
	});
	
	it('should throw an error if onRouteCall is not set', function(){
		canThey = new cte({
			onRouteCall: null
		});
		expect(function(){ canThey.do(req, res, next) }).to.throw("CanTheyExpress requires 3 attributes if onRouteCall is set, 4 othewise: [aclRequired], req, res, next");
	});
	
	it('should return 401 if userACL is undefined', function(){
		req.routeACL = null;
		canThey.do(req, res, next);
		
		expect(res.statusCode).to.be.equal(403);
	});
	
	it('should call next if userACL is "*" w/ given ACL', function(){
		req.routeACL = '*';
		canThey.do(req, res, function(){
			expect.ok;
		});
	});
	
	it('should call next if userACL is "admins" w/ given ACL', function(){
		req.routeACL = 'admins';
		canThey.do('admins', req, res, function(){
			expect.ok;
		});
	});
	
	it('should return 403 if userACL is "admins:delete" w/ given ACL', function(){
		req.routeACL = 'admins:delete';
		canThey.do('admins:delete', req, res, next);
		
		expect(res.statusCode).to.be.equal(403);
	});
	
	it('should call next if userACL is "products:books" w/ given ACL', function(){
		req.routeACL = 'products:books';
		canThey.do('products:books', req, res, function(){
			expect.ok;
		});
	});
	
	it('should call next if userACL is "products:books:read" w/ given ACL', function(){
		req.routeACL = 'products:books:read';
		canThey.do('products:books:read', req, res, function(){
			expect.ok;
		});
	});
	
	it('should return 403 if userACL is "products:books:write" w/ given ACL', function(){
		req.routeACL = 'products:books:write';
		canThey.do('products:books:write', req, res, next);
		
		expect(res.statusCode).to.be.equal(403);
	});
	
	it('should return 403 if userACL is "products:music:albums:sell" w/ given ACL', function(){
		req.routeACL = 'products:music:albums:sell';
		canThey.do('products:msuic:albums:sell', req, res, next);
		
		expect(res.statusCode).to.be.equal(403);
	});
	
});