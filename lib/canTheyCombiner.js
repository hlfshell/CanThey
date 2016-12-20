var merge =  require('controlled-merge'),
	clone = require('clone');

 module.exports =

	 /*
	 	CanThey Combiner

    permissions: an [] of {}s, each representing a role's permission.

    Given an array of various permission objects, construct and return a
    combined permissions object. Useful for role-based permissions

		returns a javascript object
	 */
	 function(permissions){
	     if(!Array.isArray(permissions)) throw new Error('CanThey Combiner can only an array of javascript objects');
		 
		 permissions.forEach(function(permission){
			if(typeof permission != 'object') throw new Error('CanThey Combiner can only accept an array of javascript objects'); 
		 });

		 return merge(
			 function(a, b){
				 if(!a) return clone(b);
				 if(a == '*' || a === true) return clone(a);
				 if(b == '*' || b === true) return clone(b);
				 if(typeof a == 'string' && typeof b == 'object'){
					 var result;
					 if(Array.isArray(b)){
						result = clone(b);
						result.push(a);
					 } else {
						result = clone(b);
					 	result[a] = true;
					 }
					 return result;
				 } else if(typeof b == 'string' && typeof a == 'object'){
					 var result;
					 if(Array.isArray(a)){
						result = clone(a);
						result.push(b);
					 } else {
						result = clone(a);
					 	result[b] = true;
					 }
					 return result;
			 	 } else if(typeof a == 'string' && typeof b == 'string'){
					 var result = {};
					 result[a] = true;
					 result[b] = true;
					 return result;
				 } else {
					 return clone(b);
				 }
			 },
			 permissions
		 );
     
	 };
