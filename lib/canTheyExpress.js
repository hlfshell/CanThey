var canThey = require('./canthey');

module.exports = function(){

	function CanTheyExpressMiddlewareUsageError(message){
		this.message = message;
		this.name = "CanTheyExpressMiddlewareUsageError";
	}
	CanTheyExpressMiddlewareUsageError.prototype = Error.prototype;

	var CanTheyExpress = function(opts){
		if(!opts) opts = {};
		this.onRouteCall = opts.onRouteCall;
		this.failureStatusCode = opts.failureStatusCode || 403;
		this.permissionsAttribute = opts.permissionsAttribute || 'userACL';

		this.canTheyOpts = {
			splitBy: opts.splitBy || ":",
			removeSpaces: opts.removeSpaces || true
		};
	};

	CanTheyExpress.prototype.do = function(aclRequired, res, next){
		var self = this;
		
		if(arguments.length != 1 && !self.onRouteCall){
			throw new Error('CanThey.do can only be treated like middleware (req, res, next) passed if onRouteCall is set.');
		}
		
		if(self.onRouteCall){
			self.onRouteCall(aclRequired, res, function(err, routeACL, permissions){
				if(err) return res.status(self.failureStatusCode).send();
				if(!canThey(routeACL, permissions || aclRequired[self.permissionsAttribute], self.canTheyOpts))
					return res
							.status(self.failureStatusCode)
							.end();

				next();
			});
		} else {
			return function(req, res, next){
				if(!aclRequired) return res.status(self.failureStatusCode).send();
				if(!canThey(aclRequired, req[self.permissionsAttribute], self.canTheyOpts))
					return res.status(self.failureStatusCode).send();
				next();
			};
		}
	};

	return CanTheyExpress;

};
