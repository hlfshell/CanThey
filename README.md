# CanThey
A customizeable, flexible authorization checker, usable with or without express.

## Install
```
npm install canthey
```

## Authorization vs Authentication
Authentication is determining if a user is who they say they are. Authorization is determining if an authenticated user is allowed to access/alter a specific resource. This module assumes you've already handled authentication.

## Function vs Express plugin
CanThey can be used as a standalone function. This is useful if you want to bake your own middleware or use it outside of Express.

At its core, the function takes an ACL style string and a JSON permissions object, and compares them for a match.

### Example ACL strings
```
admins:manage:edit
users :: create
products - music - albums - delete
products::toys::action_figures::edit
```

### Example JSON permissions object
```js
{
	"admins": 
		{
			"edit": true,
			"create": false,
			"delete": false
		}
	"products":
		{
			"music": "*",
			"toys": "videogames"
		}
	"users": "*"
}
```

In the above example, the first three ACL strings would pass, the fourth would not.

The function looks through the permission object for a boolean true, or a string match or "*" at the same or higher level of the ACL string.

Be carefull with your permissions to ensure that you check them at the level you really want. For example, using the ACL string of "products:toys" with the above permissions object, attempting to protect a route that should require "action_figures" will pass, even though that isn't your intent. To get the granularity of check you want here, you need to use an ACL like "products:toys:action_figures".

# The CanThey Function

## Initialize and use example
```js
var canThey = require('canthey').canThey;

canThey(requiredACL, givenUserPermissions, opts); //returns true or false
```

## Parameters

* requiredACL - Required. The access level required, as a string with or without splitBy characters.
* givenUserPermissions - Required. A JSON permissions object or array of permissions objects.
	* If array, canTheyCombiner merges objects into a single permissions object prior to ACL comparision. A use case for this is for role based permisisons where a user has many roles.
* opts - Optional. Each attribute in opts is optional, with a default value.
  * splitBy - default: ":" - The string delimiter to split the ACL by.
  * removeSpaces - default: true - Whether or not to remove all spaces from the ACL.

# Express Middleware
There are two forms of Express Middleware available, as shown in the examples below. 
```js
var Cte = require('canthey').Express
var canThey = new Cte(
		{
			onRoutecall: function, // To be explaiend later - this determines which middleware you're using
			failureStatusCode: 403, // Defaults to 403 - what error code to send if they are not allowed access.
			permissionsAttribute: 'userACL',
				/*
					Defaults to userACL - Required when not using onRouteCall.
					Determines what to request the user's permissions from in the request object.
					Resulting code is req[this.permissionsAttribute] - we expect you to assign the
					value in a prior middleware, probably when authenticating the user.
				*/,
			splitBy: ":", // Same as the canThey option - passed through.
			removeSpaces: true // Same as the canThey option - passed through.
		}
	);
```

## Without onRouteCall

```js
var Cte = require('canthey').Express;
var canThey = new Cte();

app.get('/admins/edit', canThey.do('admins:edit'), function(req, res){
	res.send('Hello World');
});
```

## With onRouteCall

onRouteCall is a function fired when the middleware is called to allow dynamic determination of:
* the ACL string for the route (Required)
* the user's JSON permissions (Not required if you're using the request object as the other middleware).

```js
var Cte = require('canthey').Express;
var canThey = new Cte(
		{
			onRouteCall: function(req, res, cb){
				//Grab your ACL string
				var dynamicACL = 'admins:create';
				//And, optionally, grab the user's permissions.
				var dynamciUserPermissions = 
					{
						admins: "*"
					};
				cb(null, dynamicACL, dynamicUserPermissions);
			}
		}
	);
	
app.get('/admins/create', canThey.do, function(req, res){
	console.log("I've created an admin!");
});
```

Function with the following parameters:
* req - Request object, passed for your convenience.
* res - Response object, passed for your convenience.
* cb - The callback is a function with the following expected responses:
	* err - If populated, it will respond with the failureStatusCode, but nothing else (silent fail).
	* routeACL - Required - the route's ACL string.
	* permissions - Optional - if you are attaching permissions to the request object, you can ignore this. Otherwise, it is the resulting permissions for the user.

# Tests
Tests are written with mocha and chai.

To run the tests, install the dev dependencies as well, and then run
```
npm test
```
