var http = require('http');

http.get("http://www.vetratingz.com/ShowThingCats.jsp", function(res) {
	res.setEncoding('utf8');
	res.on('data', function(chunk){
		console.log(chunk); 
	});
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});
