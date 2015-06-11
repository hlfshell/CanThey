var canThey = require('../index').canThey;

console.log("********************");
//Test a simple success
console.log("Simple test");
if( canThey('admins', { admins: "*" }) ){
	console.log("SUCCESS");
} else {
	console.log("FAILURE");
}
console.log("********************");

console.log("********************");
//Tiered success
console.log("Tiered test");
if( canThey('test:tier1:tier2:final',
	{
		test: {
			"tier1": {
				"tier2": "final"
			}
		},
		fake: {
			"something": "*"
		}
	}) ){
	console.log("SUCCESS");
} else {
	console.log("FAILURE");
}
console.log("********************");

console.log("********************");
//Simple failure by permissions
console.log("Simple failure via permissions");
if( canThey('notAdmins', { admins: '*' }) ){
	console.log("FAILURE");
} else {
	console.log("SUCCESS");
}
console.log("********************");

console.log("********************");
//Tiered failure by permissions
console.log("Tiered failure by permissions");
if( canThey('admins', { notAdmins: '*' }) ){
	console.log("FAILURE");
} else {
	console.log("SUCCESS");
}
console.log("********************");

console.log("********************");
//Simple *
console.log("Tiered failure by permissions");
if( canThey('*', { admins: '*' }) ){
	console.log("SUCCESS");
} else {
	console.log("FAILURE");
}
console.log("********************");

console.log("********************");
//Tiered *
console.log("Tiered failure by permissions");
if( canThey('admins:edit:*', { admins: {
		"test": "*",
		"edit": {
			"something": "*"
		}
	}
}) ){
	console.log("SUCCESS");
} else {
	console.log("FAILURE");
}
console.log("********************");