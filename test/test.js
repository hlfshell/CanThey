
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
			},
		categories:
			{
				"*": {
					"test": true,
					"users": {
						"*": "GET"
					}
				}
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

	it('should allow splitting by other symbols, like -', function(){
		expect(canThey('users-edit-passwords', givenACL, { splitBy: '-' })).to.be.true;
	});

	it('should remove spaces in a required ACL like "users - edit - pass words"', function(){
		expect(canThey('users - edit - pass words', givenACL, { splitBy: '-' })).to.be.true;
	});
	
	
	it('should, if passed an array of permissions, call the combiner function', function(){
		expect(canThey('admins:fake_ability:action', [givenACL, { 'admins': true }])).to.be.true;
	});

	it('should, return true if the given permission is underneath a *, so "categories:subcatgeory:test" w/ given ACL', function(){
		expect(canThey('categories:subcategory:test', givenACL)).to.be.true;
	});

	it('should, return false if the given permission is underneath a *, so "categories:subcategory:people" w/ given ACL', function(){
		expect(canThey('categories:subcategory:people', givenACL)).to.be.false;
	});

	it('should return true if the given permission is underneat a *, so "categories:subcategory:users:anything:GET" w/ given ACL', function(){
		expect(canThey('categories:subcategory:users:anything:GET', givenACL)).to.be.true;
	});

	it('should return false if the given permission is underneat a *, so "categories:subcategory:users:anything:GET" w/ given ACL', function(){
		expect(canThey('categories:subcategory:users:anything:POST', givenACL)).to.be.false;
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

	it('should return an express style middleware function, with three arguments', function(){
		var result = canThey.do('test:acl');
		
		expect(typeof result).to.equal('function');
		expect(result.length).to.equal(3);
	});

	it('should return 401 if req.userACL is undefined', function(){
		canThey.do(null)(req, res, next);

		expect(res.statusCode).to.be.equal(403);
	});

	it('should call next if req.userACL is "*" w/ given ACL', function(){
		canThey.do('*')(req, res, function(){
			expect.ok;
		});
	});

	it('should call next if req.userACL is "admins" w/ given ACL', function(){
		canThey.do('admins')(req, res, function(){
			expect.ok;
		});
	});

	it('should return 403 if req.userACL is "admins:delete" w/ given ACL', function(){
		canThey.do('admins:delete')(req, res, next);

		expect(res.statusCode).to.be.equal(403);
	});

	it('should call next if req.userACL is "products:books" w/ given ACL', function(){
		canThey.do('products:books')(req, res, function(){
			expect.ok;
		});
	});

	it('should call next if req.userACL is "products:books:read" w/ given ACL', function(){
		canThey.do('products:books:read')(req, res, function(){
			expect.ok;
		});
	});

	it('should return 403 if req.userACL is "products:books:write" w/ given ACL', function(){
		canThey.do('products:books:write')(req, res, next);

		expect(res.statusCode).to.be.equal(403);
	});

	it('should return 403 if req.userACL is "products:music:albums:sell" w/ given ACL', function(){
		canThey.do('products:music:albums:sell')(req, res, next);

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
	
	it('should throw an error if do is treated directly as middleware without onRouteCall is set', function(){
		var tmp = new cte({
			onRouteCall: null
		});
		
		expect(function(){
			tmp(req, res, next);
		}).to.throw();
	});

	it('should return 403 if userACL is undefined', function(){
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
		canThey.do(req, res, function(){
			expect.ok;
		});
	});

	it('should return 403 if userACL is "admins:delete" w/ given ACL', function(){
		req.routeACL = 'admins:delete';
		canThey.do(req, res, next);
		
		expect(res.statusCode).to.be.equal(403);
	});

	it('should call next if userACL is "products:books" w/ given ACL', function(){
		req.routeACL = 'products:books';
		canThey.do(req, res, function(){
			expect.ok;
		});
	});

	it('should call next if userACL is "products:books:read" w/ given ACL', function(){
		req.routeACL = 'products:books:read';
		canThey.do(req, res, function(){
			expect.ok;
		});
	});

	it('should return 403 if userACL is "products:books:write" w/ given ACL', function(){
		req.routeACL = 'products:books:write';
		canThey.do(req, res, next);

		expect(res.statusCode).to.be.equal(403);
	});

	it('should return 403 if userACL is "products:music:albums:sell" w/ given ACL', function(){
		req.routeACL = 'products:music:albums:sell';
		canThey.do(req, res, next);
		expect(res.statusCode).to.be.equal(403);
	});

});

describe('CanThey - combination tests', function(){
	var combiner = require('../index.js').combiner;
	
	it('should combine multiple JSON permissions into a single reaching one', function(){
		var givenACLs =
			[
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
				},
				{	
					admins:
						{
							create:
								{
									users: true,
									admins: false
								},
							read: false,
							delete:
								{
									users: true,
									admins: false
								}
						},
					products:
						{
							books: '*',
							music:
								{
									read: true	
								},
							actionFigures:
								{
									read: true,
									play: false
								}
						},
					settings:
						{
							modify: true
						}
				},
			];
		var expectedACL =
			{
				admins:
					{
						create: true,
						read: true,
						delete:
							{
								users: true,
								admins: false
							}
					},
				users: '*',
				products:
					{
						books: '*',
						music:
							{
								read: true
							},
						actionFigures:
							{
								read: true,
								play: false
							}
					},
				settings:
					{
						modify: true
					}
			};
			
		expect(JSON.stringify(expectedACL)).to.equal(JSON.stringify(combiner(givenACLs)));
	});
	
	it('should throw an error if an array is not passed', function(){
		expect(function(){
			combiner('test');
		}).to.throw();
	});
	
	it('should throw an error if one of the objects in the array is not an object', function(){
		expect(function(){
			combiner([
				{
					'test': true
				},
				'test',
				{
					'test': false
				}
			])
		}).to.throw();
	});
	
	it('should, when passed an array of javascript objects, not throw an error', function(){
		expect(function(){
			combiner([ { 'test': 'true' }, { 'test': 'still true' } ]);
		}).to.not.throw();
	});
	
});
