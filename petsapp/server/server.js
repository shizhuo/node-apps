var moment = require('moment');  
var logger = require('tracer').colorConsole(); 
var uuid = require('node-uuid'); 

exports.sendSSE = sendSSE; 
exports.handle_ajax = handle_ajax; 

var friends = require("../db/friends.json"); 

/* users = {
	'szhu': user1, 
	'lu': user2
}

	user = { 
		connections: {'ip:port'->connection}, 
		friends: [], 	
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
			handle_post(uid, time, query); 
			break;
		case 'ask': 
			handle_ask(uid, time, query); 
			break; 
		case 'answer': 
			handle_answer(uid, time, query); 
			break;  
		default: 
			break; 
	}
}

function db_query_friends(uid){
	return friends[uid]; 
}

function handle_post(uid, time, query){
	if (users[uid] == undefined){
		users[uid] = {}; 
	}
	if (users[uid].friends == undefined){
		users[uid].friends = db_query_friends(uid); 
	} 

	update_post([uid], uid, time, query['msg']); 

	//process @friend
	var friends = JSON.parse(query['at']);  
	if (friends.length == 0) { 
		//if no "@"; 
		has_at = false; 
		friends = users[uid].friends; 

		var list = handle_question(uid, time, query); 
		var google = false; 
		if (list == 0){
			google = handle_google(uid, time, query); 
		}
		if (!google){
			var new_list = friends.concat(list); 
			update_post(new_list, uid, time, query['msg']); 
		}
		
 
	}	else { 
		//if "@"
		update_post(friends, uid, time, query['msg']); 
		
		handle_question(uid, time, query);
		handle_google(uid, time, query); 
		
	}

}

function update_post(list, uid, time, msg){
	msg = JSON.parse(msg); 
	for (var i = 0; i < list.length; i++){
		var u = list[i];
		var user = users[u]; 
		if (user == undefined) return;  
		var connections = user.connections;
		for (var j in connections){
			var updates = connections[j].updates; 
		
			if (updates == undefined){
				updates = [];
			}
			var update = {}; 
			update.uid = uid; 
			update.time = time; 
			update.msg = msg.what; 
			update.mid = msg.mid;
			updates.push(update);
			//write_to_db(update); 
		}
	}

}

function get_question_relevant_users(uid, q){
	var names = Object.keys(users);  
	var n = names.length; 
	var r = Math.floor(Math.random()*n); 
	var list = [];
	for (var i = 0; i < r; i++){
		var rx = Math.floor(Math.random() * n); 
		list.push(names[rx]); 
	}
	return list; 
}

function handle_question(uid, time, query){
	var msg = JSON.parse(query.msg).what;  
	var q = msg.match(/^#Q:/g); //identify a question; 
	var list = []; 
	if (q != undefined){
		list = get_question_relevant_users(uid, q);  
	}
	return list; 
}

function handle_google(uid, time, query){
	var msg = JSON.parse(query.msg).what; 
	var g = msg.match(/^#G:/g); //identify a google search; 
	if (g != undefined){
		//do google search; 
		logger.log('doing google search...');  
		return true; 			
	}else {
		return false; 
	}

}

function sendSSE(req, res, query) {
	var uid = query['uid'];
	if (users[uid] == undefined){
		users[uid] = {};
	} 
	if (users[uid].connections == undefined){
		users[uid].connections = {}; 
	}
	//var ip_port = req.headers['x-forwarded-for'] + req; 

	var id = uuid.v1(); 
	res.uuid = id; 

	var connection = {}; 
	connection.res = res; 
	connection.updates = [];
	users[uid].connections[id] = connection; 

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
	var updates = users[uid].connections[res.uuid].updates; 
	if (updates != undefined && updates.length != 0){
		res.write('id: ' + uid + '\n');
		res.write("data: " + JSON.stringify(updates) + '\n\n');
		users[uid].connections[res.uuid].updates = []; 
	}
		
}


