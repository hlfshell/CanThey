# CanThey
A customizeable, flexible authorization checker - usable with or without express.

## Install
```
npm install canthey
```

## Authorization vs Authentication
Authentication is determining if a user is who they say they are. Authorization is determining whether or not said user is allowed to access / interact with the resource. This module assumes you've already handled authentication.

## Function vs Express plugin
This can be used as a standalone function, seperate of Express. This is useful if you want to bake your own middleware or use it for non Express purposes.

At its core, the function takes an ACL style string and a JSON object of permissions, and parses them against one another to see if they match.

### Example ACL strings
```
admins:manage:edit
users :: create
products - music - albums - delete
products::toys::action_figures::edit
```

### Example permissions JSON:
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

In these examples, the first three ACL strings would pass, the fourth would not.

The function is looking against the JSON for either a name match to the same or higher depth of the ACL string, a boolean true, or a "*" at the same or higher level. For example, with the above given permission JSON, the ACL string of "products:toys" blocking a route that should have "action_figures" in the ACL string will allow the user through.

# The CanThey Function

##Initialize and use example
```js
var canThey = require('canthey').canThey;

canThey(requiredACL, givenUserPermissions, opts); //returns true or false
```

## Parameters

* requiredACL - Required. The access level required, in a string of similar format to above..
* givenUserPermissions - Required. The JSON representation of the user's permissions OR an array of JSON permissions.
	* if this is an array, an internal function called canTheyCombiner is used to create a singular permissions object from many permissions objects. A great example of this is if you used role based permisisons and a user had many roles.
* opts - Optional. Each attribute in opts is optional, with a default value.
  * splitBy - default: ":" - the string delimiter to split the ACL by.
  * removeSpaces - default: true - whether or not to remove all spaces from the ACL.

# Express Middleware
There are two forms of Express Middleware available, as shown in the examples below. 
```js
var Cte = require('canthey').Express
var canThey = new Cte(
		{
			onRoutecall: function, // to be explaiend later - this determines which middleware you're using
			failureStatusCode: 403, //Defaults to 403 - what error code to send if they are not allowed access.
			permissionsAttribute: 'userACL',
				/*
					Defaults to userACL - Required when not using onRouteCall.
					Determines what to request the user's permissions from in the request object.
					Resulting code is req[this.permissionsAttribute] - we expect you to assign the
					value in a prior middleware, probably when authenticating the user.
				*/,
			splitBy: ":", //Same as the canThey option - passed through.
			removeSpaces: true //Same as the canThey option - passed through.
		}
	);
```

## Without onRoutecall

```js
var Cte = require('canthey').Express;
var canThey = new Cte();

app.get('/admins/edit', canThey.do('admins:edit'), function(req, res){
	res.send('Hello World');
});
```

## With onRouteCall

onRouteCall is a function fired off whenever the middleware is called to determine:
* the ACL string requirements for the route _ (Required) _
* the user's JSON permissions (Not required if you're using the request object as the other middleware).

```js
var Cte = require('canthey').Express;
var canThey = new Cte(
		{
			onRouteCall: function(req, res, cb){
				//Grab your ACL string
				var fakeACL = 'admins:create';
				//And, optionally, grab the user's permissions.
				var fakeUserPermissions = 
					{
						admins: "*"
					};
				cb(null, fakeACL, fakeUserPermissions);
			}
		}
	);
	
app.get('/admins/create', canThey.do, function(req, res){
	console.log("I've created an admin!");
});
```

Function with the following parameters:
* req - Request object, passed for your convenience.
* res - Response object, also passed for your convenience.
* cb - The callback is a function with the following expected responses:
	* err - If populated, it will send the the failureStatusCode back to the user, but nothing else (silent fail).
	* routeACL - Required - the route's ACL string.
	* permissions - Optional - if you are attaching permissions to the request object, you can ignore this. Otherwise, it is the resulting permissions for the user.

# Tests
Tests are written with mocha and chai.

To run the tests, install the dev dependencies as well, and then run
```
npm test
```
