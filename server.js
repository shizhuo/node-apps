var http = require('http');
var sys = require('sys');
var fs = require('fs');
var url = require('url');  
var mime = require('mime'); 
var logger = require('tracer').colorConsole(); 

var petsapp = require(__dirname + '/petsapp/server/server.js'); 

var apps = {}; 
apps.petsapp = petsapp;  

http.createServer(function(req, res) {
	var url_parts = url.parse(req.url, true);
	var pathname = url_parts.pathname; 
	var query = url_parts.query; 
	//var uid = query['uid'];
	var app_name = 'petsapp'; 
	var app = apps[app_name]; 
	var mimetype = mime.lookup(pathname); 
	logger.log(pathname); 
	//get event stream
	if (req.headers.accept && req.headers.accept == 'text/event-stream') {
		if (pathname == '/events') {
			var interval = app.sendSSE(req, res, query);
			req.on('close', function(){
				clearInterval(interval); 
				logger.log('request closed from ' + req.connection.remoteAddress); 
			}, false);
			res.on('error', function(){
				clearInterval(interval); 
				logger.log('response error from ' + req.connection.remoteAddress); 
			}, false);
		} else {
			res.writeHead(404);
			res.end();
		}
	} else { 
		//get file
		if (fs.existsSync(__dirname + '/' + pathname)){
			res.writeHead(200, {'Content-Type': mimetype});
			res.write(fs.readFileSync(__dirname + '/' + pathname));
			res.end();
		}else if (pathname == '/' + app_name + '/ajax') { 
			//handle ajax
			app.handle_ajax(query); 
			res.end();
		}else {
			res.writeHead(404); 
			res.end();
		}
	}
}).listen(8001);



