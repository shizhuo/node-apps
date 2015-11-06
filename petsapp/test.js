var http = require('http');
var https = require('https'); 
https.get("https://www.google.com/#q=poodle", function(res) {
	res.setEncoding('utf8');
	res.on('data', function(chunk){
		console.log(chunk); 
	});
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});
