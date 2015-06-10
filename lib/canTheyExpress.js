var canThey = require('./canThey');

module.exports = function(){
	
	function CanTheyExpressInitializationError(message){
		this.message(message);
		this.name = "CanTheyExpressInitializationError";
	}
	
	var CanTheyExpress = function(opts, cb){
		if(!opts || ( !opts.onRouteCall && !opts.onInitialization ))
			throw new CanTheyExpressInitializationError('CanThey requires opts to be an object with either onRouteCall or onInitialization defined');
			
		if(opts.onRouteCall && !opts.onInitialization)
			throw new CanTheyExpressInitializationError('CanThey requires EITHER an initialization or on route call function - not both. Unsure which to use');
			
		if(opts.onInitialization){
			var self = this;
			self.onInitialization = opts.onInitialization;
			self.onInitialization(function(err, routeACLs){
				if(err) throw new CanTheyExpressInitializationError('Something went wrong on the intialization function: ' + err);
				self.routeACLs = routeACLs;
				if(cb) cb();
			});
		} else {
			this.onRouteCall = opts.onRouteCall;
		}
		
		this.failureStatusCode = opts.failureStatusCode || 403;
		this.permissionsAttribute = opts.permissionsAttribute || 'userACL';
	};
	
	CanTheyExpress.prototype.do = function(req, res, next){
		var self = this;
		console.log(req);
		
		if(self.onRouteCall){
			self.onRouteCall(function(err, routeACL){
				if(err) return res.status(self.failureStatusCode).send();
				
				if(!canThey(routeACL, req[self.permissionsAttribute])) return res.status(self.failureStatusCode).send();
				
				next();
			});
		} else {
			var routeACL = self.routeACLs[req.route.path];
			if(!routeACL) return res.status(self.failureStatusCode).send();
			if(!canThey(routeACL, req[self.permissionsAttribute])) next();
		}
	};
	
	return CanTheyExpress;
	
};