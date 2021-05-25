

console.debug("add-policy.js running");

// attach event listeners


    
    
    // make update to the html to reflect the information in the rule and what
    // kind of rule it is.
    // The html should be disturbed as little as possible since the html should
    // properly be created by a separate editor ( as far as possible).


  


    // add listener to the "SAVE" button

    try {
        // addStep(event)
        document.getElementById('add_policy_button').addEventListener('click',
            function (event) {
        	savePolicy(event);
        	window.close();
        });
    } catch (e) {
        //console.debug(e);

    }

   

    
    




function savePolicy(event) {

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

    
    

    // wash-out objectionable characters
    
    
  
    
    var new_obj = read_object_from_form();
    



    saveUpdateToIndexedDB_async(db, store, 'keyId', new_obj);
    
    // send message to admin page (by way of background.js) to include the new policy on top of the list in the correct table.
    
    
    
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



