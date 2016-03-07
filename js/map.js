var currentMission = 0;
var currentNode ={};
function getMission(){
	currentNode ={};
	$.get( "partials/mission"+currentMission+"/M"+currentMission+"A.html", function( data ) {
	  $(".details").html(data);
	});
	$(".icon_holder").css('background-image', "url('images/icons/mission.png')");
}

function getNode(node){
	console.log(node)
	currentNode = findNodeData(currentMission+node)
	$.get( "partials/mission"+currentMission+"/M"+currentMission+node+".html", function( data ) {
	  $(".details").html(data);
	});
	$(".icon_holder").css('background-image', "url('images/icons/"+currentNode.icon.type+".png')");

}

function launchLink(){
	if(currentNode.link){
		window.open(currentNode.link)
		pointsMe('M'+currentNode.id)
	}
	
}


function findNodeData(nodeID){
	var node_json
	$.each(nodes_json.missions[currentMission]["mission"+currentMission].nodes, function(key, value){
    if(value.id == nodeID){
    	node_json =  value
    }
	});
	return node_json
}
var user_records;
function getUser(){
	if(location.hostname.indexOf('sap') > 1){
		loadData();
	}else{
		loadFakeRecords()
	}
	 
}


 var theToken;
  
  $(document).ready(function(){
  		GSCommunicator.setAppName('2045Future')
  		GSCommunicator.fetchToken();
  		//loadRecords();
  		
})

	function loadRecords(){
  	GSCommunicator.getUserInformation(function (response) {
		GSCommunicator.setPlayerId(response.email)
	}, this);
		 
    	}
    	
  function loadData(){
		GSCommunicator.send( "getPlayerRecord" ,[GSCommunicator.getPlayerId()],  function( response ) {
			if(response.error !=null){
				loadRecords();
				loadData()
			}else{
				processRecords(response.result)
			}
			
		}, this);

  	}
  		var	theMap //= AdobeEdge.getComposition("EDGE-26179844").getStage().getSymbol("MapPanel").getSymbol("map")
  	function processRecords(records){
    	user_records = records;
		$('.user-name').text(records.name)
		$('.points').text(records.scores[0].amount)
		var badges = records.earnedBadges
		$.each(badges, function(i, item) {
			var badge = $('.'+item.name)
			if(i<3){
			badge.css('display', 'inline').css('left', (i*50)+'px')
			}else{
			badge.css('display', 'inline').css('left', ((i-3)*50)+'px').css('top', '50px')
			}
		})
		theMap = AdobeEdge.getComposition("EDGE-26179844").getStage().getSymbol("MapPanel").getSymbol("map")
		processCompletedMissions()
		processActiveMissions()
		currentMission = 0;
  	}

  	function processActiveMissions(){
  			var completedMissions = user_records.activeMissions
		$.each(completedMissions, function(i, mission) {

			currentMission = mission.name.match(/\d+/)[0]
			$('.mission'+currentMission).show()
			var missionID = "M"+mission.name.substr(7).toUpperCase()
			try{
				theMap.getSymbol(missionID).play(800)
				var nodeData = findNodeData(mission.name.substr(7).toUpperCase())
				theMap.$(missionID).show()
				theMap.getSymbol(missionID).$('glow').show()
            	theMap.getSymbol(missionID).$('icon').css('background-image', "url('images/icons/"+nodeData.icon.type+"_wht.png')");
            	if(!nodeData.required){
            		theMap.getSymbol(missionID).$('icon').css('opacity', "0.4");
            	}
			}catch(e){
				//console.log("no mission:",missionID, e)
			}

		});
  	}

  	function processCompletedMissions(){
  			var completedMissions = user_records.completedMissions
		$.each(completedMissions, function(i, mission) {
			currentMission = mission.name.match(/\d+/)[0]
			var missionID = "M"+mission.name.substr(7).toUpperCase()
			try{
				theMap.getSymbol(missionID).play(800)
				var nodeData = findNodeData(mission.name.substr(7).toUpperCase())
				theMap.$(missionID).show()
            	theMap.getSymbol(missionID).$('icon').css('background-image', "url('images/icons/"+nodeData.icon.type+"_"+nodeData.icon.color+".png')");
			}catch(e){
				//console.log("no mission:",missionID, e)
			}
			//
			//console.log(missionID)
		});
  	}

  	function loadFakeRecords(){
  		$.ajax({
		    url: 'js/getPlayerRecord.json',
		    dataType: 'json',
		    success: function(data) {
		    processRecords(data)
		    }
		});

		  $.ajax({
		    url: 'js/leaderboard.json',
		    dataType: 'json',
		    success: function(data) {
		    createLeaderBoard(data)
		    }
		});

  	}


  	function playVideo(){
  		setTimeout(function(){$('.post-video').show();},1000)
  		window.open('videos/video.html?M'+currentNode.id)
  	}


function createLeaderBoard(data){
	var leaderboard_html = "<table>"
	$.each(data, function(i, user) {
		console.log(user)
		leaderboard_html +="<tr><td width='45'>" +user.amount +"</td><td> "+user.displayName+"</td></tr>"
	});
	leaderboard_html +="</table>"
	$('.leaderboard').html(leaderboard_html)
}



  function pointsMe(node){
  			GSCommunicator.send( "handleEvent" ,[{"siteId":"2045Future","type":"GetMission","playerid":GSCommunicator.getPlayerId(), "data":{"missionID":node}}],  function( response ) {
			if(response.error !=null){

			}else{
				loadData();
			}
		}, this);
  }