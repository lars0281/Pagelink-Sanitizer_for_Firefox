

// send back to background.js the current URL

//console.debug("#####################");
//console.debug("Pagelink-Sanitizer reporting");

browser.runtime.sendMessage({request:{
	possible_pagelink_sanitation_job: window.location.href}
}).then(function(res){
	console.debug("response");
	console.debug(res);
}
);
