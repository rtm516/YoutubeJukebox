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

function updateQueue() {
	$.ajax({
		url: "/ajax/getQueue",
		type: "GET",
		dataType: 'json',
		success: function(result){
			var songs = result
			var content = "";
			videoQueue = result;
			
			if (typeof songs == "undefined" || !songs || typeof songs.length == "undefined" || songs.length === 0) {
				content = content + "<b>No songs in queue</b>";
			} else {
				for(var key in songs) {
					var song = songs[key];
					content = content + "<div class='well well-sm'>" + song.snippet.title + "</div>"
				}
			}
			$("#errorText").html("");
			$("#queueList").html(content);
		},
		error: function(xhr, status, error){
			$("#errorText").html("<b>Unable to contact backend server (" + xhr.status + ")</b>");
		}
	});
}

function removeQueue(videoID) {
	$.ajax({
		url: "/ajax/removeQueue",
		type: "POST",
		data: {videoID: videoID},
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