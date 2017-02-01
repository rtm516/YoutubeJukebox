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