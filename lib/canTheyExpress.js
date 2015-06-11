var canThey = require('./canThey');

module.exports = function(){
	
	function CanTheyExpressInitializationError(message){
		this.message(message);
		this.name = "CanTheyExpressInitializationError";
	}
	
	function CanTheyExpressMiddlewareUsageError(message){
		this.message(message);
		this.name = "CanTheyExpressMiddlewareUsageError";
	}
	
	var CanTheyExpress = function(opts, cb){
		if(!opts)
			throw new CanTheyExpressInitializationError('CanThey requires opts to be an object - potentially with onRouteCall defined');

		this.onRouteCall = opts.onRouteCall;
		
		this.failureStatusCode = opts.failureStatusCode || 403;
		this.permissionsAttribute = opts.permissionsAttribute || 'userACL';
	};
	
	CanTheyExpress.prototype.do = function(aclRequired, req, res, next){
		var self = this;
		//If onRouteCall is set, it's straight middleware. If it's not,
		//we need to have the aclRequired attribute
		if(arguments.length == 3 && self.onRouteCall){
			next = res;
			res = req;
			req = aclRequired,
			aclRequired = null;
		} else if(arguments.length != 4){
			throw new CanTheyExpressMiddlewareUsageError('CanTheyExpress requires 3 attributes if onRouteCall is set, 4 othewise: [aclRequired], req, res, next');
		}
		
		if(self.onRouteCall){
			self.onRouteCall(function(err, routeACL){
				if(err) return res.status(self.failureStatusCode).send();
				
				if(!canThey(routeACL, req[self.permissionsAttribute])) return res.status(self.failureStatusCode).send();
				
				next();
			});
		} else {
			if(!canThey(aclRequired, req[self.permissionsAttribute]))
				return res.status(self.failStatusCode).send();
			next(req, res, next);
		}
	};
	
	return CanTheyExpress;
	
};