var currentMission = 0;
var currentNode = {};

function getMission() {
    currentNode = {};
    $.get("partials/mission" + currentMission + "/M" + currentMission + "A.html", function (data) {
        $(".details").html(data);
    });
    $(".icon_holder").css('background-image', "url('images/icons/mission.png')");
}

function getNode(node) {
    currentNode = findNodeData(currentMission + node)
    $.get("partials/mission" + currentMission + "/M" + currentMission + node + ".html", function (data) {
        $(".details").html(data);
    });
    $(".icon_holder").css('background-image', "url('images/icons/" + currentNode.icon + ".png')");
}

function launchLink() {
	console.log("link ",currentNode)
    if (currentNode.link) {
    	pointsMe("M" + currentNode.id )
        window.open(currentNode.link)
    }
}

function findNodeData(nodeID) {
    var node_json
    $.each(nodes_json.missions[0]["mission" + currentMission].nodes, function (key, value) {
        if (value.id == nodeID) {
            node_json = value
        }
    });
    return node_json
}
var user_records;

function getUser() {
    if (location.hostname.indexOf('sap') > 1) {
        loadData();
    } else {
        loadFakeRecords()
    }
}
var theToken;
$(document).ready(function () {
    GSCommunicator.setAppName('2045Future')
    GSCommunicator.fetchToken();
    //loadRecords();
})

function loadRecords() {
    GSCommunicator.getUserInformation(function (response) {
        GSCommunicator.setPlayerId(response.email)

    }, this);
}

function loadData() {
    GSCommunicator.send("getPlayerRecord", [GSCommunicator.getPlayerId()], function (response) {
        if (response.error != null) {
            loadRecords();
            loadData()
        } else {
            processRecords(response.result)
        }
    }, this);
}

function processRecords(records) {
    user_records = records;
    $('.user-name').text(records.name)
    $('.points').text(records.scores[0].amount)
    var badges = records.earnedBadges
    $.each(badges, function (i, item) {
        var badge = $('.' + item.name)
        if (i < 3) {
            badge.css('display', 'inline').css('left', (i * 50) + 'px')
        } else {
            badge.css('display', 'inline').css('left', ((i - 3) * 50) + 'px').css('top', '50px')
        }
    })
    var theMap = AdobeEdge.getComposition("EDGE-26179844").getStage().getSymbol("MapPanel").getSymbol("map")

    var completedMissions = records.completedMissions
    $.each(completedMissions, function (i, mission) {
        var missionID = "M" + mission.name.substr(7).toUpperCase()
        try {
            theMap.getSymbol(missionID).play(800)
        } catch (e) {
            
        }
    });
    var activeMissions = records.activeMissions
    $.each(activeMissions, function (i, mission) {
        var missionID = "M" + mission.name.substr(7).toUpperCase()
        try {
            theMap.getSymbol(missionID).play(800)
        } catch (e) {
           
        }
    });
}

function loadFakeRecords() {
    $.ajax({
        url: 'js/getPlayerRecord.json',
        dataType: 'json',
        success: function (data) {
           
            processRecords(data)
        }
    });
}


  
  function pointsMe(missionID){
  	console.log(missionID)
  	GSCommunicator.send( "handleEvent" ,[{"siteId":"2045Future","type":"GetMission","playerid":GSCommunicator.getPlayerId(), "data":{"missionID":missionID}}],  function( response ) {
			if(response.error !=null){
					alert("there was an issue")
			}else{
				loadData()
			}
		}, this);
  }