var videoQueue = {};

function getQueue() {
	return videoQueue;
}

function getStrQueue() {
	var strQueue = "";

	for (var video in videoQueue) {
		strQueue = strQueue + video + ","
	}
	strQueue = strQueue.replace(/,\s*$/, "");

	return strQueue;
}

function checkPlaylistUpdate() {
	if (!player) {
		return
	}
	
	if ((player.getPlayerState() == YT.PlayerState.ENDED) || (player.getPlayerState() == YT.PlayerState.UNSTARTED)) {
		player.loadPlaylist(getStrQueue());
	}
}

function isEmpty(obj) {
	for(var key in obj) {
		if(obj.hasOwnProperty(key))
			return false;
	}
	return true;
}

function updateQueue() {
	$.ajax({
		url: "/ajax/getQueue",
		type: "GET",
		dataType: 'json',
		success: function(result){
			var songs = result
			var content = "";
			videoQueue = result;
			
			if (typeof songs == "undefined" || !songs || isEmpty(songs)) {
				content = content + "<b>No songs in queue</b>";
			} else {
				for(var key in songs) {
					var song = songs[key];
					content = content + "<div class='well well-sm'>" + song.snippet.title + "</div>"
				}
			}
			$("#errorText").html("");
			$("#queueList").html(content);
			checkPlaylistUpdate();
		},
		error: function(xhr, status, error){
			$("#errorText").html("<b>Unable to contact backend server (" + xhr.status + ")</b>");
		}
	});
}

function removeQueue(videoID, type) {
	$.ajax({
		url: "/ajax/removeQueue",
		type: "POST",
		data: {videoID: videoID, type: type},
		dataType: 'json',
		encode: true,
		success: function(result){
			updateQueue();
			$("#errorText").html("");
		},
		error: function(xhr, status, error){
			$("#errorText").html("<b>Unable to contact backend server (" + xhr.status + ")</b>");
			setTimeout(function() {removeQueue(videoID)}, 1000);
		}
	});
}