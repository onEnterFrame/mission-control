var currentMission = 0;
var currentNode ={};
function getMission(){
	currentNode ={};
	$.get( "partials/mission"+currentMission+"/intro.html", function( data ) {
	  $(".details").html(data);
	});
	$(".icon_holder").css('background-image', "url('images/icons/mission.png')");
}

function getNode(node){
	console.log('node',node)
	currentNode = findNodeData(node)
	console.log('node json icon',currentNode.icon)
	$.get( "partials/mission"+currentMission+"/"+node+".html", function( data ) {
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
	console.log("getting user")
	$.ajax({
    url: 'js/getPlayerRecord.json',
    dataType: 'json',
    fail: function(e){
    	console.log('bad boy')
    },
    complete: function(xhr,status){
    	console.log('status', status)
    },
    success: function(data) {
    	console.log("success",data)
    	user_records = data
		$('.user-name').text(data.name)
		$('.points').text(data.scores[0].amount)
		var badges = data.earnedBadges
		$.each(badges, function(i, item) {
			var badge = $('.'+item.name)
			if(i<3){
			badge.css('display', 'inline').css('left', (i*50)+'px')
			}else{
			badge.css('display', 'inline').css('left', ((i-3)*50)+'px').css('top', '50px')
			}
		})
    }
});
}