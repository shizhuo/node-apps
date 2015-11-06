var ajaxurl = 'ajax';
var app = angular.module('app', []); 

app.service('dataService', ['$http', '$timeout', function($http, $timeout){

}]); 

app.controller('appCtrl', ['$scope', '$http', 'dataService', function($scope, $http, dataService){

	$scope.pages = ['Me', 'Friends', 'Home', 'Shopping', 'Find'];

	$scope.pets = new Array(); 
	$scope.pets.push({'name': 'bangbang', 'image': 'images/cat.png'});  
	$scope.pets.push({'name': 'bingbing', 'image': 'images/dog.jpg'}); 
	$scope.pets.push({'name': 'bengbeng', 'image': 'images/rabit.jpg'}); 

	$scope.uid = uid;  
	$scope.msg = {};  

	$scope.postmsg = function(){
		var who = $scope.uid; 
		var when = moment().format('HH:mm:ss'); 
		var what = $scope.msg.what;
		var mid = Math.floor(Math.random()*1000000); 	
		$scope.msg.mid = mid; 
	
		var type;  
		$(".board").append(who + '(' + when + '): ' + what + '<br>');  
		var at = what.match(/@[^@\s]*/g); //get all friends who are ated. 
		var friends = [];
		if (at != undefined){ 
			for (var i = 0; i < at.length; i++){
				friends.push(at[i].substr(1)); 
			}  
			type = 'at'; 
		} 
		$http({
			url: 'ajax', 
			method: 'GET',
			params: {
				action: 'post', 
				msg: JSON.stringify($scope.msg), 
				uid: $scope.uid,
				at: JSON.stringify(friends)
			}
		}).success(function(response){
			//$(".board").append(response + '<br>'); 
		}); 
	};

	//$scope.uid = get_query()['uid']; 
	
	if (!!window.EventSource){		
		$scope.source = new EventSource('events?uid=' + $scope.uid);
		//on message
		$scope.source.addEventListener('message', function(e) {
			var data = JSON.parse(e.data); 
			for (var i = 0; i < data.length; i++){ 
				//console.log(data); 
				
				var who = data[i].uid; 
				var when = data[i].time; 
				var what = data[i].msg;
				var mid = data[i].mid; 
				var msg =  who + '(' + when + '): ' + what + "<br>";
				console.log(msg); 
				if (mid == $scope.msg.mid) continue;  
				$(".board").append(msg); 
			}
		}, false);
		 

	}else {

	}	

	$(window).on('beforeunload', function(){
		//$scope.source.close(); 
		//return 'close';  
	}); 
}]);


$(document).ready(function(){
})

