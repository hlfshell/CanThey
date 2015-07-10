var combiner = require('./canTheyCombiner'),
	clone = require('clone');

 module.exports = 
	 
	 /*
	 	CanThey
		
		permissionRequired - String of what permission is required "example:permission",
		acl: javascript object of permissions
		
		returns true or false
	 */
	 function(permissionRequired, inputACL, opts){
		 if(!permissionRequired || !inputACL) return false;
		 
		 if(!opts) opts = {}

		 if(!opts.splitBy) opts.splitBy = ":";
		 if(!opts.removeSpaces) opts.removeSpaces = true;
		 
		 var acl;
		 if(Array.isArray(inputACL)){
			 acl = combiner(inputACL);
		 } else {
			 acl = clone(inputACL);
		 }
		 
		 var permissions = permissionRequired.split(opts.splitBy),
		 	currentACLLevel = clone(acl),
		 	can = false;
			 
		if(opts.removeSpaces){
			permissions.forEach(function(toTrim, index){
				permissions[index] = toTrim.replace(' ', '');
			});
		 }
			 
		 permissions.every(function(permission, index){
			 //If the ACL says '*' at this level, they have permission - no need to go further
			 if(currentACLLevel == '*' || currentACLLevel === true){
				 can = true;
				 return false; //break every
			 }
			 //Otherwise, if we have a direct STRING (final) match, then they have permission to all sub levels.
			 else if(currentACLLevel == permission){
				 can = true;
				 return false; //break every;
			 }
			  //If the currentACL does not have that property, but DOES have a '*' as an attribute, continue with that.
			  else if(!currentACLLevel[permission] && currentACLLevel['*']){
				  currentACLLevel = clone(currentACLLevel['*']);
				  return false; //break every
			  }
			 //If the currentACL does not have a property of the permissions needed at this point, reject
			 else if(!currentACLLevel[permission] && permission != '*'){
				 can = false;
				 return false; // break every
			 }
			 			 
			 //The last use case is assumed and examined on next iteration - the currentACLLevel is an object that
			 //HAS the attribute, continue to next iteration;
			 if(index + 1 == permissions.length){
				 can = true;
				return false; 
			 } else {
				currentACLLevel = clone(currentACLLevel[permission]);
			 	return true; //continue every	 
			 }
		 });
		 
		 return can;
	 };