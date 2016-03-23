var currentMission = 0;
var missionProcessing = 0
var currentNode = {};

var inProd = (location.hostname.indexOf('sap') > 1)

function getMission() {
   // currentNode = {};
     currentNode = findNodeData(currentMission, currentMission + "A")
    $.get("partials/mission" + currentMission + "/M" + currentMission + "A.html", function(data) {
        $(".details").html(data);
    });
    $(".icon_holder").css('background-image', "url('images/icons/mission.png')");
}

function getNode(node) {
    currentNode = findNodeData(currentMission, currentMission + node)
    $.get("partials/mission" + currentMission + "/M" + currentMission + node + ".html", function(data) {
        $(".details").html(data);
    });
     $(".icon_holder").css('background-image', "url('images/icons/" + currentNode.icon.type + ".png')");
     /*
    if (currentNode.icon.type != 'mission') {
        $(".icon_holder").css('background-image', "url('images/icons/" + currentNode.icon.type + ".png')");
    }else{
    	 $(".icon_holder").css('background-image', "none");
    }
	*/
}

function launchLink() {
	if(currentNode.icon.type === "mission"){
		return
	} 
    if (currentNode.link) {
        window.open(currentNode.link)
        pointsMe('M' + currentNode.id)
    }else{
        window.open('http://www.sap.com')
        pointsMe('M' + currentNode.id)
    }

}


function findNodeData(mission, nodeID) {
    var node_json
    $.each(nodes_json.missions[mission]["mission" + mission].nodes, function(key, value) {
        if (value.id == nodeID) {
            node_json = value
        }
    });
    return node_json
}
var user_records;

function getUser() {
    if (inProd) {
        loadData();
        loadLeaderBoard()
    } else {
        loadFakeRecords()
    }

    $("#unlock_code").on('change keyup paste', function() {
        if ($(this).val().length > 1) {
            $(".unlock-btn").fadeTo(250, 1);
        } else {
            $(".unlock-btn").fadeTo(250, 0.5);
        }
    });

}


var theToken;

$(document).ready(function() {
    if (inProd) {
        GSCommunicator.setAppName('2045Future')
        GSCommunicator.fetchToken();
    }


})

function loadRecords() {
    GSCommunicator.getUserInformation(function(response) {
        GSCommunicator.setPlayerId(response.email)
    }, this);

}
var loadAttempts = 0;

function loadData() {
    loadAttempts++
    if (loadAttempts > 18) {
        $(".flow-wrapper").hide()
        alert("Sorry we could not find you in the database.");
        return;
    }
    GSCommunicator.send("getPlayerRecord", [GSCommunicator.getPlayerId()], function(response) {
        if (response.error != null) {
            setTimeout(function() {
                loadRecords();
                loadData();
            }, 500)

        } else {
            processRecords(response.result)
        }

    }, this);

}

function loadLeaderBoard() {
    GSCommunicator.send("getLeaderboard", ["Experience Points", 1, 5, null, null, null], function(response) {
        if (response.error != null) {

        } else {

            createLeaderBoard(response.result)
        }
    }, this);

}

var theMap //= AdobeEdge.getComposition("EDGE-26179844").getStage().getSymbol("MapPanel").getSymbol("map")
function processRecords(records) {
    user_records = records;
    $('.user-name').text(records.name)
    $('.points').text(records.scores[0].amount)
    var badges = records.earnedBadges
    $.each(badges, function(i, item) {
        var badge = $('.' + item.name)
        if (i < 3) {
            badge.css('display', 'inline').css('left', (i * 50) + 'px')
        } else {
            badge.css('display', 'inline').css('left', ((i - 3) * 50) + 'px').css('top', '50px')
        }
    })
    theMap = AdobeEdge.getComposition("EDGE-26179844").getStage().getSymbol("MapPanel").getSymbol("map")
    //processCompletedMissions()
    getCompletedMissionsForPlayer();
   // processActiveMissions()
   getActiveMissionsForPlayer();
    $('.zoomable').show()
    missionProcessing = 0;
}

function processActiveMissions(activeMissions) {
   // var completedMissions = user_records.activeMissions
    $.each(activeMissions, function(i, mission) {

        missionProcessing = mission.name.match(/\d+/)[0]
        $('.mission' + missionProcessing).show()
        $('#Stage_MapPanel_map_mission'+missionProcessing).addClass("zoomable");
        var missionID = "M" + mission.name.substr(7).toUpperCase()
        try {
            theMap.getSymbol(missionID).play(800)
            var nodeData = findNodeData(missionProcessing, mission.name.substr(7).toUpperCase())
            theMap.$(missionID).show()
            theMap.getSymbol(missionID).$('glow').show()
            theMap.getSymbol(missionID).$('icon').css('background-image', "url('images/icons/" + nodeData.icon.type + "_wht.png')");
            if (!nodeData.required) {
                theMap.getSymbol(missionID).$('icon').css('opacity', "0.4");
            }
        } catch (e) {
            //console.log("no mission:",missionID, e)
        }

    });
}
//
function getActiveMissionsForPlayer(){
	  GSCommunicator.send("getActiveMissionsForPlayer", [GSCommunicator.getPlayerId()], function(response) {
        if (response.error != null) {
            setTimeout(function() {
               getActiveMissionsForPlayer();
            }, 500)

        } else {
            processActiveMissions(response.result)
        }

    }, this);
}

function getCompletedMissionsForPlayer(){
	  GSCommunicator.send("getCompletedMissionsForPlayer", [GSCommunicator.getPlayerId()], function(response) {
        if (response.error != null) {
            setTimeout(function() {
               getCompletedMissionsForPlayer();
            }, 500)

        } else {
            processCompletedMissions(response.result)
        }

    }, this);
}
function processCompletedMissions(completedMissions) {
    //var completedMissions = user_records.completedMissions
    $.each(completedMissions, function(i, mission) {
        missionProcessing = mission.name.match(/\d+/)[0]
        $('#Stage_MapPanel_map_mission'+missionProcessing).addClass("zoomable");
        var missionID = "M" + mission.name.substr(7).toUpperCase()
        try {
            theMap.getSymbol(missionID).play(800)
            var nodeData = findNodeData(missionProcessing, mission.name.substr(7).toUpperCase())
            theMap.$(missionID).show()
            theMap.getSymbol(missionID).$('icon').css('background-image', "url('images/icons/" + nodeData.icon.type + "_" + nodeData.icon.color + ".png')");
        } catch (e) {
            //console.log("no mission:",missionID, e)
        }
        //
        //console.log(missionID)
    });
}

function loadFakeRecords() {
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


function playVideo() {
    pointsMe('M' + currentNode.id)
    setTimeout(function() {
        $('.post-video').show();
    }, 1000)
    //window.open('videos/video.html?M' + currentNode.id)
    window.open('videos/embed.html?M' + currentNode.id)
}


function createLeaderBoard(data) {
    var leaderboard_html = "<table>"
    $.each(data, function(i, user) {
        leaderboard_html += "<tr><td width='45'>" + user.amount + "</td><td> " + user.displayName + "</td></tr>"
    });
    leaderboard_html += "</table>"
    $('.leaderboard').html(leaderboard_html)
}



function pointsMe(node) {
    if (inProd) {
        GSCommunicator.send("handleEvent", [{
            "siteId": "2045Future",
            "type": "GetMission",
            "playerid": GSCommunicator.getPlayerId(),
            "data": {
                "missionID": node
            }
        }], function(response) {
            if (response.error != null) {

            } else {
                loadData();
            }
        }, this);
    }
}


function tryCode() {

    if ($("#unlock_code").val().length > 0) {
        //
         pointsMe($("#unlock_code").val())
       // alert("Code: " + $('#unlock_code').val() + " is not valid.\n\nStudy the past, if you would divine the future.\n ~ Confucius");
        $("#unlock_code").val("");
        $(".unlock-btn").fadeTo(250, 0.5);
    }
}