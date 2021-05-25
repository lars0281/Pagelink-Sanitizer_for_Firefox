

console.debug("edit-rule.js running");

// attach event listeners


// read the rule to be edited from storage
console.debug("read back: " + browser.storage.sync.get(['editThisObject', 'indexedDbName', 'objectStoreName'], function (data) {
        console.debug(data);
    }));

browser.storage.sync.get(['editThisObject', 'indexedDbName', 'objectStoreName']).then(function (data) {
    // console.debug(data);
    console.debug(JSON.stringify(data));
    // step through the rule object and populate the tables
    var editThisObject = data.editThisObject;

   
    var indexedDbName = data.indexedDbName;
    var objectStoreName = data.objectStoreName;
    
    console.debug(JSON.stringify(editThisObject));
console.debug(indexedDbName); 
console.debug(objectStoreName); 
    
    
    // make update to the html to reflect the information in the rule and what
    // kind of rule it is.
    // The html should be disturbed as little as possible since the html should
    // properly be created by a separate editor ( as far as possible).


    document.querySelectorAll("table.single_rule_table tr td[j_name=scope]")[0].textContent = editThisObject.scope;
  
    document.querySelectorAll("table.single_rule_table tr td[j_name=url_match]")[0].textContent = editThisObject.url_match;
    document.querySelectorAll("table.single_rule_table tr td[j_name=notes]")[0].textContent = editThisObject.notes;

    document.querySelectorAll("table.single_rule_table tr td[j_name=createtime]")[0].textContent = editThisObject.createtime;

    // if no modified time, just use createtime
    if (editThisObject.lastmodifiedtime != null) {
        document.querySelectorAll("table.single_rule_table tr td[j_name=lastmodifiedtime]")[0].textContent = editThisObject.lastmodifiedtime;
    } else {
        console.debug("no modified");

        document.querySelectorAll("table.single_rule_table tr td[j_name=lastmodifiedtime]")[0].textContent = editThisObject.createtime;

    }

    // scope
    if (editThisObject.scope == "Hostname") {

        document.querySelectorAll("table.single_rule_table tr td[j_name=scope]")[0].textContent = "Fully qualified Domainname";

    } else if (editThisObject.scope == "Domain") {

        document.querySelectorAll("table.single_rule_table tr td[j_name=scope]")[0].textContent = "Domain";

    } else if (editThisObject.scope == "Url") {
        document.querySelectorAll("table.single_rule_table tr td[j_name=scope]")[0].textContent = "Url";
    }


    // add listener to the "SAVE" button

    try {
        // addStep(event)
        document.getElementById('save_changes_button').addEventListener('click',
            function (event) {
            saveChanges(event);
        });
    } catch (e) {
        //console.debug(e);

    }

    // add listener to the "edit rule" button

    try {
        // addStep(event)
    	 console.debug("edit_policy_button");
        document.getElementById('edit_policy_button').addEventListener('click',
            function (event) {
            editPolicy(event);
        });
    } catch (e) {
        //console.debug(e);

    }

    
    
    
});


// Receive message from background-script
browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    // if (sender.url === THIS_PAGE_URL)
    // return
    console.debug("<br>PopuP received a new msg: " + message.msg);

    sendResponse({
        msg: "This is an auto-response message sent from the popup"
    })
    return true
});

// const THIS_PAGE_URL = chrome.runtime.getURL('popup.html')

// Send message from browser-action-popup to background-script
setTimeout(function () {

    browser.runtime.sendMessage({
        msg: "This is a message sent from the browser-action-popup to the admin page"
    })
    .then(response => { // Receive response from the background-script
        if (!response) {
            console.debug("Popup sent a msg and received no response.");
            return;
        }
        // document.body.innerHTML += "<br>Popup sent a msg and received a
        // response: " + response.msg
    })

}, 3000);

function attachButtonEventlisteners(node) {

    console.debug("#start attachButtonEventlisteners");

    // for step edit button(s)
    var htmlElements = node.getElementsByClassName("editstep_button");
    // console.debug(htmlElements);

    // loop through all edit steps and their buttons to attach event
    // listener to each one
    // console.debug(htmlElements.length);

    for (var i = 0; i < htmlElements.length; i++) {

        // console.debug("## attach");
        // console.debug(htmlElements[i]);

        htmlElements[i].addEventListener('click',
            function (event) {
            editStep(event);
        });

    }


}



function editPolicy(event) {

    console.debug("### edit policy");
    console.debug(event);
    

    
    // make parameter values editable - user typed values

    var edit_cells3 = document.querySelectorAll("td[class=editable_user_typed_value]");
    var m = 0;
    while (m < edit_cells3.length && m < 12) {
        console.debug(edit_cells3[m]);
        edit_cells3[m].setAttribute("contenteditable", "true");
        // also , change class to signify value is now under editing (change background color and font)
        edit_cells3[m].setAttribute("class", "editable_user_typed_value_editing");
        m++;
    }
    

    // make parameter values editable - user selected values

    var edit_cells3 = document.querySelectorAll("td[class=editable_user_selected_value]");
    var n = 0;
    while (n < edit_cells3.length && n < 12) {
        console.debug(edit_cells3[n]);
        edit_cells3[n].setAttribute("contenteditable", "true");
        // also , change class to signify value is now under editing (change background color and font)
        edit_cells3[n].setAttribute("class", "editable_user_selected_value_editing");
        n++;
    }

    
    
    // replace edit button with save button

    try {
    	// create save button
    	var newbutton_3 = document.createElement('button');
    	newbutton_3.setAttribute("class", "rulelevel_button");
    	newbutton_3.setAttribute("id", "save_policy_button");
    	newbutton_3.appendChild(document.createTextNode("Save Changes"));

    	document.querySelector("#edit_policy_button").insertAdjacentElement('afterend', newbutton_3);
    
    	document.querySelector("#edit_policy_button").remove();
    } catch (e) {
    	console.debug(e);

    }
    
    
    
    // add listener to the "edit rule" button

    try {
        // addStep(event)
        document.getElementById('save_policy_button').addEventListener('click',
            function (event) {
        	savePolicyChanges(event);
        });
    } catch (e) {
        console.debug(e);

    }
    
    

}


function savePolicyChanges(event) {

    console.debug("### save begin");
    console.debug(event);
    
    
    // save changes to database
    
    // keyid
    var keyId = document.querySelector("table.single_rule_table tr td[j_name=url_match]").textContent;

    
 
    var scope = document.querySelector("table.single_rule_table tr td[j_name=scope]").textContent;

    
    var db="";
    var store="";
    // database(and store) for the rule is given by the scope. Each scope has a different database.
    if (scope == "Hostname") {

    	db = 'sourceHostnamePolicyDB'; 
    	store = 'sourceHostnamePolicyStore';

    } else if (scope == "Domain") {

    	
    	db = 'sourceDomainPolicyDB'; 
    	store = 'sourceDomainPolicyStore';

    } else if (scope == "Url") {
    	db = 'sourceUrlPolicyDB'; 
    	store = 'sourceUrlPolicyStore';
    }

    
    
    
    
    // get value of notes field and save it to the object in the database
    
    var scope = document.querySelector("table.single_rule_table tr td[j_name=scope]").textContent;
    
    // wash-out objectionable characters
    
    
    // mark fields non-editable
    
    // make parameter values editable

    var edit_cells3 = document.querySelectorAll("td[class=editable_user_typed_value_editing]");
    var m = 0;
    while (m < edit_cells3.length && m < 12) {
        console.debug(edit_cells3[m]);
        edit_cells3[m].setAttribute("contenteditable", "true");
        // also , change class to signify value is now under editing (change background color and font)
        edit_cells3[m].setAttribute("class", "editable_user_typed_value");
        m++;
    }
    
  
    
    // replace save button with newly created edit button
    
    // create edit button
    var newbutton_3 = document.createElement('button');
    newbutton_3.setAttribute("class", "rulelevel_button");
     newbutton_3.setAttribute("id", "edit_policy_button");
    newbutton_3.appendChild(document.createTextNode("Edit Rule"));

	document.querySelector("#save_policy_button").insertAdjacentElement('afterend', newbutton_3);
    
  document.querySelector("#save_policy_button").remove();
    
    
    // add listener to the "edit rule" button

    try {
        // addStep(event)
        document.getElementById('edit_policy_button').addEventListener('click',
            function (event) {
            editRule(event);
        });
    } catch (e) {
        console.debug(e);

    }
    

    
    var new_obj = read_object_from_form();
    



    saveUpdateToIndexedDB_async(db, store, 'keyId', new_obj);
    
}






/* read the rule object from the form as it exists at the moment */
function read_object_from_form(){
	
	
	  // compose object

    var new_obj = JSON.parse('{"keyid":"keyid" }');

    try {

    // keyid
    var keyId = document.querySelector("table.single_rule_table tr td[j_name=url_match]").textContent;

    // validate data content
    console.debug(keyId);

    new_obj.keyId = keyId;

    // url_match
    var url_match = document.querySelector("table.single_rule_table tr td[j_name=url_match]").textContent;

    // validate data content

    new_obj.url_match = url_match;
   

    // scope
    var scope = document.querySelector("table.single_rule_table tr td[j_name=scope]").textContent;

    // validate data content

    new_obj.scope = scope;

    

   

    // notes
    var notes = document.querySelector("table.single_rule_table tr td[j_name=notes]").textContent;

    // validate data content
    new_obj.notes = notes;
    // createtime

    var createtime = document.querySelector("td[j_name=createtime]").textContent;
    // validate data format

    new_obj.createtime = createtime;
    // modifytime

    
        // compute current timestamp
        var today = new Date();

        var YYYY = today.getFullYear();
        var MM = (today.getMonth() + 1);
        var DD = (today.getDate() + 1);

        if (MM < 10) {
            MM = "0" + MM;
        }

        if (DD < 10) {
            DD = "0" + DD;
        }

        var HH = (today.getHours() + 1);

        if (HH < 10) {
            HH = "0" + HH;
        }

        var mm = (today.getMinutes() + 1);

        if (mm < 10) {
            mm = "0" + mm;
        }

        var ss = (today.getSeconds() + 1);

        if (ss < 10) {
            ss = "0" + ss;
        }

        var dateTime = YYYY + MM + DD + HH + mm + ss;

        console.debug(dateTime);

        // validate data format
        new_obj.lastmodifiedtime = dateTime;
    } catch (e) {}

    console.debug(JSON.stringify(new_obj));

    return new_obj;
	
}




function saveUpdateToIndexedDB_async(dbName, storeName, keyId, object) {

    console.debug("saveUpdateToIndexedDB_async:dbname " + dbName);
    console.debug("saveUpdateToIndexedDB_async:objectstorename " + storeName);
    console.debug("saveUpdateToIndexedDB_async:keyId " + keyId);
    console.debug("saveUpdateToIndexedDB_async:object " + JSON.stringify(object));

    // indexedDB = window.indexedDB || window.webkitIndexedDB ||
    // window.mozIndexedDB || window.msIndexedDB;

    return new Promise(
        function (resolve, reject) {

        // console.debug("saveToIndexedDB: 0 resolve=" + resolve )
        // console.debug("saveToIndexedDB: 0 reject=" + reject )

        // if (object.taskTitle === undefined)
        // reject(Error('object has no taskTitle.'));

        var dbRequest;

        try {

            dbRequest = indexedDB.open(dbName);
        } catch (error) {
            console.debug(error);

        }
        console.debug("saveUpdateToIndexedDB_async: 1 dbRequest=" + dbRequest);

        dbRequest.onerror = function (event) {
            console.debug("saveUpdateToIndexedDB_async:error.open:db " + dbName);
            reject(Error("IndexedDB database error"));
        };

        console.debug("saveUpdateToIndexedDB_async: 2" + JSON.stringify(dbRequest));

        console.debug("saveUpdateToIndexedDB_async: 3" + JSON.stringify(dbRequest));
        try {

            dbRequest.onsuccess = function (event) {
                console.debug("saveUpdateToIndexedDB_async: 31");
                var database = event.target.result;
                console.debug("saveUpdateToIndexedDB_async: 32");
                var transaction = database.transaction([storeName], 'readwrite');
                console.debug("saveUpdateToIndexedDB_async: 33");
                var objectStore = transaction.objectStore(storeName);
                console.debug("saveUpdateToIndexedDB_async:objectStore put: " + JSON.stringify(object));

                var objectRequest = objectStore.put(object); // Overwrite if
                // already
                // exists

                console.debug("saveUpdateToIndexedDB_async:objectRequest: " + JSON.stringify(objectRequest));

                objectRequest.onerror = function (event) {
                    console.debug("saveUpdateToIndexedDB_async:error: " + storeName);

                    reject(Error('Error text'));
                };

                objectRequest.onsuccess = function (event) {
                    console.debug("saveUpdateToIndexedDB_async:success: " + storeName);
                    resolve('Data saved OK');
                };
            };

        } catch (error) {
            console.debug(error);

        }

    });
}



