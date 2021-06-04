/*
 * This script runs in pages
 *
 * Fist thing it does is to check if the page URL is governed by a policy. This will mostly not be the case and it is essential that this script runs as little as possible.
 *
 *
 * It presents a dialog window to the user with an explanation of the URL.
 * - where the URL ends up (endpoint of all redirects, if any)
 * - information about what, it anything, happens during the course of those redirects. (etablishment of login, cookies etc.)
 * - give the user the option of passing directly to the endpoint without going through the redirects.
 * - let the user configure default behaviour for next time a link of this type is encountered.
 * 
 * 
 * Issues. 
 * The use of targetElementId which is as yet supported only on Firefox
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/menus/getTargetElement
 */




function xstooltip_findPosX(obj) {
	var curleft = 0;
	if (obj.offsetParent) {
		while (obj.offsetParent) {
			curleft += obj.offsetLeft
			obj = obj.offsetParent;
		}
	} else if (obj.x)
		curleft += obj.x;
	// console.log("xstooltip_findPosx returning: " + curleft);
	return curleft;
}

function xstooltip_findPosY(obj) {
	var curtop = 0;
	if (obj.offsetParent) {
		while (obj.offsetParent) {
			curtop += obj.offsetTop
			obj = obj.offsetParent;
		}
	} else if (obj.y)
		curtop += obj.y;
	// console.log("xstooltip_findPosY returning: " + curtop);
	return curtop;
}

function glovebox_archived_original_href(node) {

	// check if the URL has been inspected already by looking for the attribute
	// glovebox_archived_original_href indicating that the URL has already been
	// been rewritten by glovebox
	// console.log(node.getAttribute('glovebox_archived_original_href'));
	try {
		var archived_url = "";
		archived_url = node.getAttribute('glovebox_archived_original_href');
		// console.log(archived_url);
		// console.log(archived_url.length);
		if (archived_url && archived_url.length > 9) {
			// console.log("archived");
			return archived_url;
		} else {
			// console.log("NOT archived");
			return "";
		}
	} catch (e) {
		// clearly, nothing sensible was found, so return a blank.
		return "";
	}

}

function setup_dialog_window(node, new_url, linkURL) {

	console.log("setup_dialog_window");
	// console.log(node);
	// console.log(new_url);
	// console.log(linkURL);

	// based on length of url to display, set size of window

	var chars_per_row = 60;
	var v_pix_per_row = 14;

	var h_pix_per_char = 6;

	var v_pix_margin = 50;
	var h_pix_margin = 10;

	console.log("url length" + new_url.length);

	console.log("url length" + (new_url.length / chars_per_row));
	var row_count = 0;
	row_count = Math.floor(new_url.length / chars_per_row) + 1;

	console.log("print rows: " + row_count);

	var box_height = 0;
	var box_widtht = 0;

	// calculate box width by multplying number of charcters per row by pix per
	// character, and add something for margin
	box_widtht = (chars_per_row * h_pix_per_char) + h_pix_margin;
	// calculate box height by multplying number of charcters per row by pix per
	// character, and add something for margin
	box_height = (row_count * v_pix_per_row) + v_pix_margin;

	console.log("box_height: " + box_height);
	console.log("box_width: " + box_widtht);
	console.log("row_count: " + row_count);

	var uuid;
	uuid = "gloveboxtooltip";

	// look for exising message box, and remove it if found
	var del_it = document.getElementById(uuid);
	console.log("look for existing tooltip");
	console.log(del_it);
	try {
		if (del_it) {
			del_it.style.visibility = 'hidden';
			del_it.remove();
		}
	} catch (e) {
	}

	try {
		// setup node in the DOM tree to contain content of message box
		var newGloveboxNode = document.createElement("Glovebox");
		newGloveboxNode.setAttribute("id", uuid); // attach a unique ID to the
		// element to make it more
		// easily addressable.

		// var newGloveboxNode2 = document.createElement("a");
		// newGloveboxNode2.setAttribute("href", "http://www.dn.no");
		// newGloveboxNode2.textContent("http://www.dn.no/NO");
		// newGloveboxNode.appendChild(newGloveboxNode2);

		var newTokenNode = document.createElement("glb:token");

		newGloveboxNode.appendChild(newTokenNode);
		// text marker
		// newTokenNode.textContent = "some MESSAGE text";

		var root = document.querySelector(':root');

		// let insertedNode = node.parentNode.insertBefore(newGloveboxNode,
		// node);

		let insertedNode = root.insertBefore(newGloveboxNode, root.firstChild);

		// start lookup
		// call the URL and look at what is returned.

		// var true_destination_url = new_url;
		var redirectURL = "";

		// create html of tooltip
		var it2 = document.createElement("div");
		// it2.setAttribute("id",tooltipId+ '_temp');
		it2.setAttribute("id", uuid);
		it2.setAttribute("class", 'xstooltip');
		// set style for the tooltip box. (Replaces an external CSS-stylesheet )
		// visibility: hidden;
		// position: absolute;
		// top: 0;
		// left: 0;
		// z-index: 2;
		// font: normal 8pt sans-serif;
		// padding: 3px;
		// border: solid 8px;
		// background-repeat: repeat;
		// background-image: url(icons/azure.png);

		// it2.setAttribute("style", 'position: absolute;z-index:-1;top: 0;left:
		// 0;font: normal 9pt sans-serif;padding: 3px;border: solid
		// 0px;background: rgba(225, 225, 225, 0.9);');
		it2.setAttribute("style", 'position: relative;z-index:-1;top: 0;left: 0;font: normal 9pt sans-serif;text-align: left;wordWrap=break-word;padding: 8px;border: solid 1px;background: rgba(225, 225, 225, 0.9);');

		var posX = 150;
		var posY = 20;

		// var it;
		// it2.innerHTML = inner_html;

		var display_text_for_url = ""
		// insert a space character at appropriate places (every chars_per_row
		// number of
		// chars) to ensure required
		// wordwrapping inside message box
		var i = 0;
		while (i < new_url.length) {

			display_text_for_url = display_text_for_url + new_url.substring(i, i + chars_per_row) + " ";
			i = i + chars_per_row;
		}

		var cont1 = document.createElement('container');
		var tab1 = document.createElement('table');

		var tr1 = document.createElement('tr');

		var td1 = document.createElement('td');
		td1.appendChild(document.createTextNode('This link ends up at '));
		td1.setAttribute("style", 'width: 200px;text-align: left');
		var td2 = document.createElement('td');
		td2.appendChild(document.createTextNode('close [X]'));
		td2.setAttribute("style", 'width: 100px;text-align: right');
		td2.setAttribute("id", 'gloveboxtooltipclose');
		tr1.appendChild(td1);
		tr1.appendChild(td2);
		tab1.appendChild(tr1);

		cont1.appendChild(tab1);

		var a1 = document.createElement('a');
		a1.appendChild(document.createTextNode(display_text_for_url));
		a1.setAttribute("href", new_url);

		cont1.appendChild(a1);

		var br1 = document.createElement('br');
		cont1.appendChild(br1);
		var br2 = document.createElement('br');
		cont1.appendChild(br2);

		cont1.appendChild(document.createTextNode('2 go there directly by just clicking on this link 2'));

		// it2.innerHTML = '<table><tr><td style="width: 200px;text-align:
		// left">This link ends up at </td><td style="width: 100px;text-align:
		// right" id="gloveboxtooltipclose">close [X]</td></tr></table><a
		// href="' + new_url + '" >' + display_text_for_url + '</a>'
		// + '<br/><br/>go there directly by just clicking on this link';
		// it2.appendChild(tab1);
		it2.appendChild(cont1);
		// there directly by just clicking on this link

		// '<p class="gloveboxtooltip" id="gloveboxtooltipclose"
		// style="text-align:left;">CLOSE</p>';

		// console.log("1.2.8");
		// console.log(it2);
		// setup event listener whereby the user can configure this link
		// rewriting to be automatic

		// where to anchor the tooltip
		// add the created tooltip html into the document
		// var inserted = node.parentNode.appendChild(it2);
		// var inserted = node.parentNode.insertBefore( it2, node);
		var inserted = insertedNode.appendChild(it2);

		// console.log(inserted);

		// close button
		var close_button = document.getElementById("gloveboxtooltipclose");
		// console.log(close_button);

		// attach eventlistener
		close_button.addEventListener("click", function(event) {
			// console.log("on click action ...");
			close_tooltip(event);
		});
		// make rule to bypass redirects button

		// var make_bypass_redirect_rule_button =
		// document.getElementById("gloveboxtooltipmakerule");
		// attach eventlistener
		// make_bypass_redirect_rule_button.addEventListener("click", function
		// (event) {
		// console.log("on click action ...");
		// make_bypass_redirect_rule(event);
		// });

		// it = it2;

		if ((it2.style.top == '' || it2.style.top == 0 || it2.style.top == "0px") && (it2.style.left == '' || it2.style.left == 0 || it2.style.left == "0px")) {
			// need to fixate default size (MSIE problem)
			it2.style.width = it2.offsetWidth + 'px';
			it2.style.height = it2.offsetHeight + 'px';

			// if tooltip is too wide, shift left to be within parent
			if (posX + it2.offsetWidth > node.offsetWidth)
				posX = node.offsetWidth - it2.offsetWidth;
			if (posX < 0)
				posX = 0;

			x = xstooltip_findPosX(node) + posX;
			y = xstooltip_findPosY(node) + posY;

			it2.style.top = y + 'px';
			it2.style.left = x + 'px';

			it2.style.visibility = 'visible';
			it2.style.zIndex = "1000";

			// examin options to make the width context sensitive
			it2.style.width = box_widtht + 'px';
			it2.style.height = box_height + 'px';

		}

		// depending on the rule settings...rewrite the link automatically.

		// if (new_url.length > 9 && linkURL != new_url) {
		// console.log("replacing: " + linkURL + " with " + new_url);
		// node.setAttribute('href', new_url);
		// // archive the original URL as an inserted attrbute
		// node.setAttribute('glovebox_archived_original_href', linkURL);
		// } else {
		// console.log("invalid returns");
		// }

		// set a timeout to remove the message box after 60 seconds

		setTimeout(function() {
			del_it = document.getElementById(uuid);
			// console.log("look for existing tooltip");
			// console.log(del_it);
			try {
				if (del_it) {
					del_it.style.visibility = 'hidden';
					del_it.remove();
				}
			} catch (e) {
				console.log(e);
			}
		}, 30000);

	} catch (e) {
		console.log(e);
	}

}


function close_tooltip(event) {

	console.log(event);
	// call to kill the tooltip window

	// lookup the endpoint of the link
	var uuid;
	uuid = "gloveboxtooltip";

	// look for exising message box, and remove it if found
	var del_it = document.getElementById(uuid);
	console.log("look for existing tooltip");
	console.log(del_it);
	try {
		if (del_it) {
			del_it.style.visibility = 'hidden';
			del_it.remove();
		}
	} catch (e) {
	}
	del_it = document.getElementById(uuid);
	console.log("look for existing tooltip");
	console.log(del_it);
	try {
		if (del_it) {
			del_it.style.visibility = 'hidden';
			del_it.remove();
		}
	} catch (e) {
	}
}


// this global variable indicated whether or not any rule pertain to the URL
var ruleHit = false;
// this global variable indicated whether or not any
var ruleWrite = false;

function RevealURL(request, sender, sendResponse) {

	var replacementStr = request.Paste_GloveboxAcceptedSecureKeyOfferToken_text;
	console.log("JSON(request): " + JSON.stringify(request));

	try {
		// if (replacementStr){
		var targetElementId = "";
		targetElementId = request.targetElementId;

		ruleHit = false;
		var linkURL = "";
		linkURL = request.linkURL;
		var linkText = "";
		linkText = request.linkText;

		var true_destination_url = "";
		true_destination_url = request.true_destination_url;

		// if the link has the same domain as the current domain, also search
		// using a server relative path

		// locate the DOM node actually right-clicked by the user
		var node = null;

		// in the absence of broad support for targetElementId() on non-Firefox
		// browsers, use xpath as a work-around.
		// this must be rewritten for non-firefox browsers

		node = browser.menus.getTargetElement(targetElementId);

		// attempt to uniquely identify the link selected with a right click by
		// searching for one that has the same link and text.
		// search for both server-relative and fully qualified links

		console.log(linkURL);
		console.log("#### " + true_destination_url);

		// create window for user to see, and click in
		setup_dialog_window(node, true_destination_url, linkURL);

		// handleError(url);

	} catch (e) {
		console.log(e);
	}

	return Promise.resolve({
		response : {
			"selection_html" : "ok"
		}
	});
}
// }




// browser.runtime.onMessage.addListener(RevealURL);

// setup onClick listener to remove tooltip window for any click.


/**
 * rewrite the URL links to make them inoperative.
 * The rewrite the content of the attributes such that a repeated search will miss the URL as it would be strongly undersaible to revisit the same links again and again
 * Specifically: insert a space character at the begining
 * 
 *
 * @param  {Node} node    - The target DOM Node.
 * @return {void}         - Note: the emoji substitution is done inline.
 */
function replaceLink (node) {

	// html standard		
	
	// https://www.w3schools.com/tags/att_href.asp
	
	// href attribute on
	// area a link base

	// https://www.w3schools.com/tags/att_src.asp

	// src attribute on
	// script, img, iframe, embed, audio, imput source track video
	
	
	// use queryselector to look for node with href or src attributes 
	
	// with 
	
	// css selector syntax https://www.w3schools.com/cssref/css_selectors.asp
	
	// Find all nodes with the href attribute
	// Only consider urls that starts with the protocol - relative links should be ignored. 
	// The filter should match only onses - after rewriting, the link should no longer be a match. 
	// Make this so by adding a space at the beginning. In this way the selector will miss the URL, and the link is also disabled.
	
	
	try{
		console.debug(node);
		// First: the href attribute and the elements that can contains one, excepting the typically clickacble links using the "a" element
var x = node.querySelectorAll('link[href^="http"],area[href^="http"],base[href^="http"]');

console.debug(node);
console.debug("result count: " + x.length );
	 var i;
	 for (i = 0; i < x.length; i++) {

			
			var l = x[i].getAttribute("href");

			// Attach javascript to the link that would allow the user to access the links manually. 
			x[i].setAttribute("test", l);
			// Rewrite the search hit so that it will not be a search hit again - and disable the URLs at the same time
			// Disable the link by inserting a space
			x[i].setAttribute("href"," _hhh" +l);
			
	 } 
	 
	 // treat clickable links separately. For these link also attach an event listener

	 var y = node.querySelectorAll('a[href^="http"]');

	 	 var j;
	 	 for (j = 0; j < y.length; j++) {

	 			
	 			var url = y[j].getAttribute("href");
console.debug(url);
	 			// Attach javascript to the link that would allow the user to access the links manually. 
	 			 y[j].setAttribute("test", "url");
	 			// Rewrite the search hit so that it will not be a search hit again - and disable the URLs at the same time
	 			 
	 			 // apply policy
	 			// Disable the link by prefixing the protocol with "disabled"
	 			 y[j].setAttribute("href","disabled" +url);
	 			
	 	 } 

	 
	 
		// Secondly: the src attribute and the elements that can contains one
	 var z = node.querySelectorAll('script[src^="http"],img[src^="http"],iframe[src^="http"],embed[src^="http"],audio[src^="http"],input[src^="http"],source[src^="http"],track[src^="http"],video[src^="http"]');
	 var k=0;
	 for (k = 0; k < z.length; k++) {

			
			var src = z[k].getAttribute("src");

			// Attach javascript to the link that would allow the user to access the links manually. 
			z[k].setAttribute("test", src);
			// Rewrite the search hit so that it will not be a search hit again - and disable the URLs at the same time
			// Disable the link by inserting a space
		//	z[k].setAttribute("src","DISABLED" +src);
			
	 } 
	 
	 
	 
	}catch(e){
		console.debug(e);
	}
	 
	 
	 
	//try{

	//	var elmnts = node.getElementsByTagName("a");
		
		//var j=0;
		//for(j=0;j<elmnts.length ;j++){
		//var attr = elmnts[j].getAttributeNode("href"); 
		//console.debug(attr );
		
		//elmnts[j].setAttribute('archived_href' , attr);
		
//	}
		
	//console.debug("node: " );
	//console.debug(node);
	//console.debug(node.attributes);
	//console.debug(node.getAttribute);
	//console.debug("#node.nodeType: " + node.nodeType);
	
	
// use	querySelectorAll to look for nodes with links
	
	
	
	
	
	
	/*
	 * Node.ELEMENT_NODE 	1 	An Element node like <p> or <div>.
Node.ATTRIBUTE_NODE 	2 	An Attribute of an Element.
Node.TEXT_NODE 	3 	The actual Text inside an Element or Attr.
Node.CDATA_SECTION_NODE 	4 	A CDATASection, such as <!CDATA[[ … ]]>.
Node.PROCESSING_INSTRUCTION_NODE 	7 	A ProcessingInstruction of an XML document, such as <?xml-stylesheet … ?>.
Node.COMMENT_NODE 	8 	A Comment node, such as <!-- … -->.
Node.DOCUMENT_NODE 	9 	A Document node.
Node.DOCUMENT_TYPE_NODE 	10 	A DocumentType node, such as <!DOCTYPE html>.
Node.DOCUMENT_FRAGMENT_NODE 	11 	A DocumentFragment node.
	 * 
	 */

	  if (node.nodeType === Node.ELEMENT_NODE) {
		  console.debug("## examine this element ( a or img ? )");
		  
		  console.debug("node.parentNode.name: " + node.parentNode.name);
		  console.debug("node.name: " + node.name);
		  console.debug("node: " + node);
		  console.debug(node);
		  //console.debug("nodeName: " + nodeName);
			  
	//	  console.debug("look for child elements (count=" + node.childNodes.length + ")");
		  
//		  for (let i = 0; i < node.childNodes.length; i++) {
//console.debug(node.childNodes[i].nodeType);
//console.debug(node.childNodes[i]);

			  //replaceLink(node.childNodes[i]);
//		    }
		  
	  }

	// Only interested in attributes
	//  if (node.nodeType === Node.ATTRIBUTE_NODE) {
	//	  console.debug("## examine this attribue ( href or src ? )");
//		  console.debug("node: " + node);
	//	  console.debug(node);
	//  }
	
	
  if (node.nodeType === Node.TEXT_NODE) {
    // This node only contains text.
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType.

    // Skip textarea nodes due to the potential for accidental submission
    // of substituted emoji where none was intended.
    if (node.parentNode &&
        node.parentNode.name === 'TEXTAREA') {
      return;
    }

    // Because DOM manipulation is slow, we don't want to keep setting
    // textContent after every replacement. Instead, manipulate a copy of
    // this string outside of the DOM and then perform the manipulation
    // once, at the end.
    //let content = node.textContent;

    // Replace every occurrence of 'word' in 'content' with its emoji.
    // Use the emojiMap for replacements.
    //for (let [word, emoji] of emojiMap) {
      // Grab the search regex for this word.
      //const regex = regexs.get(word);

      // Actually do the replacement / substitution.
      // Note: if 'word' does not appear in 'content', nothing happens.
     // content = content.replace(regex, emoji);
    //}

    // Now that all the replacements are done, perform the DOM manipulation.
   // node.textContent = content;
  }
  else {
    // This node contains more than just text, call replaceText() on each
    // of its children.
   // for (let i = 0; i < node.childNodes.length; i++) {
    //  replaceLink(node.childNodes[i]);
  //  }    
  }
//	}catch(e){
//		console.debug(e);
//	}
}

// Start the recursion from the body tag.
replaceLink(document.body);
console.debug("###################");
replaceLink(document.body);


//try{
	
//var x = document.querySelectorAll("a");

 //var i;
 //for (i = 0; i < x.length; i++) {

//		console.debug("## node: " + x[i] );
 //} 

//}catch(e){
//	console.debug(e);
//}

//Now monitor the DOM for additions 
//@see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver.
const observer = new MutationObserver((mutations) => {
mutations.forEach((mutation) => {
 if (mutation.addedNodes && mutation.addedNodes.length > 0) {
	 console.debug("mutation observer");
   // This DOM change was new nodes being added. Run our substitution
   // algorithm on each newly added node.
   for (let i = 0; i < mutation.addedNodes.length; i++) {
     const newNode = mutation.addedNodes[i];
     replaceLink(newNode);
   }
 }
});
});
observer.observe(document.body, {
childList: true,
subtree: true
});



