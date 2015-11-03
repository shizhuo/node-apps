var moment = require('moment');  
var logger = require('tracer').colorConsole(); 

exports.sendSSE = sendSSE; 
exports.handle_ajax = handle_ajax; 
var petsapp = {}; 


friends = new Object(); 
friends.szhu = ['lu']; 
friends.lu = ['szhu']; 

/* users = {
	'szhu': user1, 
	'lu': user2
}

	user = { 
		connections: {'ip:port'->connection}, 
		
	}	

	connection = {
		'res': response, 
		'updates': []
	}

	update {
		'time': ..., 
		'uid': ...,
		'post': ...
	}
*/

var users = {}; 

function handle_ajax(query){
	var action = query['action'];
	var uid = query['uid'];  
	var time = moment().format('HH:mm:ss'); 
	switch (action){
		case 'post': 
			update_post(uid, time, query); 
			break; 
		default: 
			break; 
	}
}


function update_post(uid, time, query){
	for (var i = 0; i < friends[uid].length; i++){
		var u = friends[uid][i]; 
		if (updates[u] == undefined){
			updates[u] = [];
		}
		var update = {}; 
		update.uid = uid; 
		update.time = time; 
		update.msg = query['msg']; 
		updates[u].push(update);
	}
	logger.log(updates); 
}

function sendSSE(req, res, query) {
	var uid = query['uid']; 
	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive'
	});

	constructSSE(req, res, uid);

	// Sends a SSE every given seconds on a single connection.
	var interval = setInterval(function() {
		constructSSE(req, res, uid);
	}, 300);

	return interval; 

}

function constructSSE(req, res, uid) {
	if (updates[uid] != undefined && updates[uid].length != 0){
		res.write('id: ' + uid + '\n');
		res.write("data: " + JSON.stringify(updates[uid]) + '\n\n');
		updates[uid] = []; 
	}
	logger.log(req.connection.remoteAddress);
		
}


