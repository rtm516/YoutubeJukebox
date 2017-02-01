var errorList = {
	100: {name: 'Continue'},
	101: {name: 'Switching Protocols'},
	102: {name: 'Processing'},
	200: {name: 'OK'},
	201: {name: 'Created'},
	202: {name: 'Accepted'},
	203: {name: 'Non-Authoritative Information'},
	204: {name: 'No Content'},
	205: {name: 'Reset Content'},
	206: {name: 'Partial Content'},
	207: {name: 'Multi-Status'},
	300: {name: 'Multiple Choices'},
	301: {name: 'Moved Permanently'},
	302: {name: 'Found'},
	303: {name: 'See Other'},
	304: {name: 'Not Modified'},
	305: {name: 'Use Proxy'},
	306: {name: 'Switch Proxy'},
	307: {name: 'Temporary Redirect'},
	400: {name: 'Bad Request'},
	401: {name: 'Unauthorized'},
	402: {name: 'Payment Required'},
	403: {name: 'Forbidden'},
	404: {name: 'Not Found'},
	405: {name: 'Method Not Allowed'},
	406: {name: 'Not Acceptable'},
	407: {name: 'Proxy Authentication Required'},
	408: {name: 'Request Timeout'},
	409: {name: 'Conflict'},
	410: {name: 'Gone'},
	411: {name: 'Length Required'},
	412: {name: 'Precondition Failed'},
	413: {name: 'Request Entity Too Large'},
	414: {name: 'Request-URI Too Long'},
	415: {name: 'Unsupported Media Type'},
	416: {name: 'Requested Range Not Satisfiable'},
	417: {name: 'Expectation Failed'},
	418: {name: 'I\'m a teapot'},
	422: {name: 'Unprocessable Entity'},
	423: {name: 'Locked'},
	424: {name: 'Failed Dependency'},
	425: {name: 'Unordered Collection'},
	426: {name: 'Upgrade Required'},
	449: {name: 'Retry With'},
	450: {name: 'Blocked by Windows Parental Controls'},
	500: {name: 'Internal Server Error'},
	501: {name: 'Not Implemented'},
	502: {name: 'Bad Gateway'},
	503: {name: 'Service Unavailable'},
	504: {name: 'Gateway Timeout'},
	505: {name: 'HTTP Version Not Supported'},
	506: {name: 'Variant Also Negotiates'},
	507: {name: 'Insufficient Storage'},
	509: {name: 'Bandwidth Limit Exceeded'},
	510: {name: 'Not Extended'}
}

exports.throw = function(num, req, res, errMessage, log, customDesc) {
	var errorNo = (num || 500);

	if (errorNo == 500) {
		log("Error 500 on page " + req.url + ": " + errMessage);
	}

	var errorInfo = errorList[errorNo];

	res.status(errorNo).render('error', { page: "error", title: "Error " + errorNo + ": " + errorInfo.name, desc: errorInfo.desc || "" });
}