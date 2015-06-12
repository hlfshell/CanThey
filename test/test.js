
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
		res = httpMocks.createResponse();
		next = function(){};
	});
	
	it('should return 401 if req.userACL is undefined', function(){
		
	});
	
	it('should call next if req.userACL is "*" w/ given ACL');
	
	it('should call next if req.userACL is admins');
	
	it('should return 403 if req.userACL is admins:delete');
	
	it('should call next if req.userACL is products:books');
	
	it('should call next if req.userACL is products:books:read');
	
	it('should return 403 if req.userACL is products:books:write');
	
	it('should return 403 if req.userACL is products:music:albums:sell');
	
		
	
});