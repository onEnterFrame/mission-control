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
	console.log("partials/mission"+currentMission+"/M"+currentMission+node+".html" )
	currentNode = findNodeData(currentMission+node)
	console.log('node json icon',currentNode.icon)
	$.get( "partials/mission"+currentMission+"/M"+currentMission+node+".html", function( data ) {
	  $(".details").html(data);
	});
	$(".icon_holder").css('background-image', "url('images/icons/"+currentNode.icon+".png')");

}

function launchLink(){
	if(currentNode.link){
		window.open(currentNode.link)
	}
	
}


function findNodeData(nodeID){
	var node_json
	$.each(nodes_json.missions[0]["mission"+currentMission].nodes, function(key, value){
    //console.log(key, value.id);
    if(value.id == nodeID){
    	console.log("nailed it", value);
    	node_json =  value
    }
	});
	return node_json
}
var user_records;
function getUser(){
	console.log("getting user here")
	if(location.hostname.indexOf('sap') > 1){
		loadData();
	}else{
		loadFakeRecords()
	}
	 
	 /*
	
*/
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
	console.log("Welcome "+response.firstname+" "+response.lastname+"");
	}, this);
		 
    	}
    	
  function loadData(){
		GSCommunicator.send( "getPlayerRecord" ,[GSCommunicator.getPlayerId()],  function( response ) {
			console.log( response ); 
			if(response.error !=null){
				loadRecords();
				loadData()
			}else{
				processRecords(response.result)
			//var results_string = JSON.stringify(response.result).replace(',', ', ').replace('[', '').replace(']', '');
			//console.log("Your Records "+results_string);	
			}
			
		}, this);

  	}
  	
  	function processRecords(records){
  		 console.log("records",records)
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
  	}

  	function loadFakeRecords(){
  		$.ajax({
    url: 'js/getPlayerRecord.json',
    dataType: 'json',
    success: function(data) {
    	console.log("success")
    processRecords(data)
    }
});

  	}