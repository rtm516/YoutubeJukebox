function resizeContentDo() {
	$("body").append("<style>.container {height: 100%;}</style>");
	$("body").height($(window).height()-$("nav").outerHeight(true)-$("footer").outerHeight(true)-20);
}
function resizeContent() {
	resizeContentDo();
	$(window).resize(function() {resizeContentDo();});
}

function resizeElementDo(target, minus, manual) {
	$(target).height($(target).parent().innerHeight()-$(minus).outerHeight(true)-manual);
}
function resizeElement(target, minus, manual) {
	resizeElementDo(target, minus, manual);
	$(window).resize(function() {resizeElementDo(target, minus, manual);});
}

function showSearchLoader() {
	$("#searchResults").html("<center><img src='/img/loading.gif' alt='Loading...' /></center>");
}

function submitSearch() {	
	var formData = {
		'q': $('input[name=q]').val(),
		'sort': $('select[name=sort]').val()
	};

	showSearchLoader();
	
    $.ajax({
		url: "/ajax/search",
		type: "POST",
		data: formData,
		dataType: 'json',
        encode: true,
		success: function(result){
			if (result["error"] != "") {
				$("#searchResults").html('<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>&nbsp;<span class="sr-only">Error:</span>' + result["error"] + '</div>');
			}else{
				var resultsHTML = "";
				for (var i = result["results"].length - 1; i >= 0; i--) {
					var res = result["results"][i]
					resultsHTML += '<div class="well well-sm" id="searchResult"><img src="' + res["snippet"]["thumbnails"]["default"]["url"] + '" /><a href="https://youtu.be/' + res["id"]["videoId"] + '" target="_blank"><h4>' + res["snippet"]["title"] + '</h4></a><h5>' + res["snippet"]["channelTitle"] + '</h5></div>';
				};

				$("#searchResults").html(resultsHTML);
			}
		},
		error: function(xhr, status, error){
			alert("Unable to contact backend server (" + xhr.status + ")");

			$("#searchResults").html("");
		}
	});
}

$(function() {
	$("#searchForm").submit(function(e){
		e.preventDefault(e);
		submitSearch();
	});
});