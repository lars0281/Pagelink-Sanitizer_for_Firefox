export {deleteObject,updateObject}
import {
    arrayBufferToBase64,
	arrayBufferToString,
    base64ToArrayBuffer,
	CompareRowOfNumbers,
    CompareRowOfText,
	convertArrayBufferViewtoString,
	convertStringToArrayBufferView,
	createTable,
    createTableRow,
    download_file,
    GetDateSortingKey,
    reflow,
    setup_database_objects_table_async,
    SHA1,
    sortColumn,
    SortTable,
    stringToArrayBuffer,
    TableLastSortedColumn,
    writeTableCell,
    writeTableHeaderRow,
    writeTableNode,
    writeTableRow
    
}
from "./utils/glovebox_utils.js"


//import {
//	generate_encryption_key_async,
//	generate_new_RSA_sign_and_encr_keypairs, 
//	generate_privatepublickey_for_signing_async,
//	get_default_signing_key_async,
//	makeDefaultEncryptionKey, 
//	makeDefaultPrivateKey, 
//	updateDecryptionKey, 
//	updateEncryptionKey
//}
//from "./utils/glovebox_keyops.js"


import {
//	create_indexeddb_async,
    deleteFromIndexedDB_async,
//    dump_db,
//    flush_all_keys_async,
	loadFromIndexedDB_async,
//    READ_DB_async,
	saveToIndexedDB_async
}
from "./utils/glovebox_db_ops.js"


import { 
	indexeddb_setup_async, 
	generate_default_link_rules_async 
	}
from "./utils/glovebox_setup_P-S.js"



console.debug("### rule-admin.js ");

// array of all rule databases
var parentArray = [
    ["sourceURLPolicyDB", "sourceDomainPolicyDB", "sourceHostnamePolicyDB"]
];

class NavigateCollectionUI {
    constructor(containerEl) {

       // console.debug("### rule-admin.js ");

        this.containerEl = containerEl;


        
        render_tables()
        
   

        // attach event listeners to page buttons

        try {
            document.getElementById("button_generate_default").addEventListener('click',
                function () {
                console.debug("### button.generate-source-hostname-rule begin");
                generate_default_link_rules_async().then();
                console.debug("### button.generate-source-hostname-rule end");
                // update the page tables
                render_tables();
                
            });

        } catch (e) {
            console.debug(e);
        }

        // list of main tables
        var tables = ['sourceURLPolicy', 'sourceHostnamePolicy', 'sourceDomainPolicy'];

        // loop through all tables and set up what buttons are needed for each
        for (var t = 0; t < tables.length; t++) {
            // console.debug("do: " + tables[t]);


            try {
                // console.debug("hide button status: "+
                // document.getElementById("hide_"+tables[t]+"_button").style.display);

                // show/hide button
                document.getElementById("hide_" + tables[t] + "_button").addEventListener('click',
                    function (event) {
                    if (event.target.getAttribute('bool') == '1') {
                        var target_id = event.target.getAttribute('target_id');
                        document.getElementById(target_id).style.display = 'none';
                        // show the table
                        event.target.setAttribute('bool', '0');
                        var newtext = document.createTextNode("show table");
                        event.target.replaceChild(newtext, event.target.childNodes[0]);
                    } else {
                        // disappear the table
                        event.target.setAttribute('bool', '1');
                        var target_id = event.target.getAttribute('target_id');
                        document.getElementById(target_id).style.display = 'block';
                        var newtext = document.createTextNode("hide table");
                        event.target.replaceChild(newtext, event.target.childNodes[0]);
                    }
                });

                // add button
                document.getElementById("add_" + tables[t] + "_button").addEventListener('click',
                    function (event) {
  
                             console.debug("### button add begin");
                             addNewPolicy(event);
                         });
                
            } catch (e) {
                console.debug(e);
            }

        }

        
        // add backup button
        try {
            document.getElementById("refresh_policies_button").addEventListener('click', () => {
                // document.querySelector("button.backup-all-keys").addEventListener('click',
                // ()
                // => {
                console.debug("refresh policies");

                refresh_policies_async().then(function (e) {
                    console.debug("refresh complete");
                    console.debug(e);
                });
            }, false);
        } catch (e) {
            console.debug(e)
        }
        
        // add backup button
        try {
            document.getElementById("backup-all-rules_button").addEventListener('click', () => {
                // document.querySelector("button.backup-all-keys").addEventListener('click',
                // ()
                // => {
                console.debug("backup rules ");

                backout_all_rules().then(function (e) {
                    console.debug("backup complete");
                    console.debug(e);
                });
            }, false);
        } catch (e) {
            console.debug(e)
        }

        // add event listener for import button

        console.debug("setup import form");
        try {
            document.getElementById('import-rules_button').addEventListener('click', function (evt) {
                console.debug("### reading import file");

                var input = document.createElement('input');
                input.type = 'file';

                input.onchange = e => {

                    // getting a hold of the file reference
                    var file = e.target.files[0];

                    // setting up the reader
                    var reader = new FileReader();
                    reader.readAsText(file, 'UTF-8');

                    // here we tell the reader what to do when it's done
                    // reading...
                    reader.onload = readerEvent => {
                        var content = readerEvent.target.result; // this is
                        // the
                        // content!
                        console.debug(content);

                        // add content to database
                        // loop parentArray
                        var p = [];
                        try {
                            for (var i = 0; i < parentArray.length; i++) {
                                console.debug(parentArray[i][0]);

                                console.debug("import into " + parentArray[i][0]);
                                var imported = JSON.parse(content);
                                console.debug("import  " + imported[parentArray[i][0]].length);

                                for (var j = 0; j < imported[parentArray[i][0]].length; j++) {
                                    console.debug("import  " + JSON.stringify(imported[parentArray[i][0]][j]));
                                    // add rule to data

                                    p.push(saveToIndexedDB_async(parentArray[i][0], parentArray[i][1], 'keyId', imported[parentArray[i][0]][j]));

                                }

                            }
                        } catch (e) {
                            console.debug(e);
                        }
                        console.debug(p);

                    }

                }

                input.click();

            });

        } catch (e) {
            console.debug(e);
        }

    }
}


// call to background.js ro to fresh the in-memory policy set from the databases. 
function refresh_policies_async(){
	
	
	
	// send message to background, 
    	browser.runtime.sendMessage({
    		request: {"refresh":"policies"}
    	}, function (response) {
    		console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
    	});
	
	
}

// this function creates all tables for database entries
function render_tables(){
    // create tables to present all available rules
    var table_conf = {};
    table_conf["conf"] = [ {
            "id": "1",
            "width": "200px"
        }, {
            "id": "1",
            "width": "290px"
        }, {
            "id": "1",
            "width": "100px"
        }, {
            "id": "1",
            "width": "100px"
        }
    ];

    // presentation_format: text, JSON, table, dropdown

    // setup column headers for table
    var header_conf = [];
    header_conf = [ {
            "id": "1",
            "text": "domain"
        }, {
            "id": "5",
            "text": "notes"
        }, {
            "id": "3",
            "text": "edit"
        }, {
            "id": "4",
            "text": "delete"
        }
    ];

    // setup column configuration for table

    var column_conf = [];
    column_conf = [ {
            "id": "1",
            "json_path": "url_match",
            "other_attributes":[{"j_name":"url_match"}],
            "presentation_format": "text"
        },  {
            "id": "3",
            "json_path": "notes",
            "presentation_format": "text"
        },{
            "id": "4",
            "node": {
                        "name": "button",
                        "text": "edit",
                        "class": "edit-rule",
                        "EventListener": {
                            "type": "click",
                            "func": "updateObject",
                            "parameter": "click"
                        }
                
            }
        }, {
            "id": "5",
            "node": {
                "name": "button",
                "text": "delete",
                "class": "delete-rule",
                "EventListener": {
                    "type": "click",
                    "func": "deleteObject",
                    "parameter": "click"
                }
            }
        },

    ];

   

    // sourceDomainPolicy
    header_conf[0].text = "Domain name";
    column_conf[0].json_path = "url_match";

    try {
    	setup_database_objects_table_async('sourceDomainPolicyDB', 'sourceDomainPolicyStore', 'keyId', 'sourceDomainPolicy_table', document.getElementById("sourceDomainPolicy"), table_conf, header_conf, column_conf);

    } catch (e) {
        console.debug(e)
    }

    // sourceHostnamePolicy
    header_conf[0].text = "Full hostname address";
    column_conf[0].json_path = "url_match";
    try {
      	setup_database_objects_table_async('sourceHostnamePolicyDB', 'sourceHostnamePolicyStore', 'keyId', 'sourceHostnamePolicy_table', document.getElementById("sourceHostnamePolicy"), table_conf, header_conf, column_conf);
          } catch (e) {
        console.debug(e)
    }

    // sourceURLPolicy
    header_conf[0].text = "URL/Page address";
    column_conf[0].json_path = "url_match";

    try {
    	setup_database_objects_table_async('sourceURLPolicyDB', 'sourceURLPolicyStore', 'keyId','sourceURLPolicy_table', document.getElementById("sourceURLPolicy"), table_conf, header_conf, column_conf);
    	        } catch (e) {
        console.debug(e);
    }
	
}


function addNewPolicy(event) {
    console.debug("## addNewPolicy");
    console.debug(event);
 

    var indexedDbName = event.target.parentNode.getAttribute('indexedDbName');

    var objectStoreName = event.target.parentNode.getAttribute('objectStoreName');
    console.debug("objectStoreName: " + objectStoreName);
    console.debug("indexedDbName: " + indexedDbName);
    if (indexedDbName == "sourceURLPolicyDB"){
    	var w = window.open('popup/add-url-policy.html', 'test01', 'width=1000,height=600,resizeable,scrollbars');

    }else if (indexedDbName == "sourceDomainPolicyDB"){

    	var w = window.open('popup/add-domain-policy.html', 'test01', 'width=1000,height=600,resizeable,scrollbars');

    }else{

    	var w = window.open('popup/add-hostname-policy.html', 'test01', 'width=1000,height=600,resizeable,scrollbars');

    }
    
    
    
 	
	
	
	console.debug(w);

    
    
}


//this updateObject is written generically
//but what it will display will be particular to the implementation

function updateObject(event) {
 console.debug("# updateObject");
 console.debug(event);


 var object_id = event.target.parentNode.parentNode.getAttribute('object_id');
 
 var indexedDbName = event.target.parentNode.parentNode.parentNode.parentNode.getAttribute('indexedDbName');

 var objectStoreName = event.target.parentNode.parentNode.parentNode.parentNode.getAttribute('objectStoreName');


 // get the id of the object which is to be modified from the table row object
 
 
 
 console.debug("objectStoreName: " + objectStoreName);
 console.debug("object_id: " + object_id);

 // var popup = window.open("<html><title>sub</title></html>");


 // create popup window where fields can be edited


 // two different popups depending on wheather not this is a rule based on
 // source URL (where the link is found)
 // or destination (where the link goes to)

 // Add the url to the pending urls and open a popup.
 // pendingCollectedURLs.push(info.srcURL);
 var popup = null;
 try {

	 

	 // open up the popup
 	var obj;
 	// read object out of database

 	loadFromIndexedDB_async(indexedDbName,objectStoreName,object_id).then(function (res){
 		obj = res;
 		console.debug(obj);

     
  // place the identity of the object to be edited in storage
     
 		return  browser.storage.sync.set({ 'object_id': object_id , 'indexedDbName': indexedDbName, 'objectStoreName': objectStoreName });
 	}).then(function(g){
 		
     	console.debug(g);
     	//});
     
     // the popup is now open

    // console.debug("read back: " + browser.storage.sync.get(['editThisRule', 'type', 'key']));
     //browser.storage.sync.get(['editThisRule', 'type', 'key']).then(function(e){
    // 	console.debug(e);
    // 	});

     //console.debug("read back: " + browser.storage.sync.get(['editThisRule', 'type', 'key'], function (data){
    // 	console.debug(data);
     //} ));
     
     // send message to background, and have background send it to the popup
     //	browser.runtime.sendMessage({
     //		request: {"sendRule":"toEditPopup","editThisObject": obj}
     //	}, function (response) {
     //		console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
     //	});
     
	});

  	var w = window.open('popup/edit-policy.html', 'test01', 'width=1000,height=600,resizeable,scrollbars');
 	console.debug(w);


 } catch (err) {
     console.error(err);
 }

}



function deleteObject(event) {
    console.debug("##deleteObject");
    console.debug(event);


    var uuid = event.target.parentNode.parentNode.getAttribute('object_id');
    
    var indexedDbName = event.target.parentNode.parentNode.parentNode.parentNode.getAttribute('indexedDbName');

    var objectStoreName = event.target.parentNode.parentNode.parentNode.parentNode.getAttribute('objectStoreName');


    // get the id of the object which is to be modified from the table row object
    
    var p = deleteFromIndexedDB_async(indexedDbName, objectStoreName, uuid);

    p.then(function (res) {
        console.debug(res)
        
        // remove the object from the table 
        
        var tble = document.querySelector('table[indexeddbname="'+indexedDbName+'"]');
        console.debug(tble);
        var remove_this_row = tble.querySelector('tr[object_id="'+uuid+'"]');
        console.debug(remove_this_row);
        remove_this_row.remove();
        
      });

}



function backout_all_rules() {
    console.debug("### backup_all_keys() begin");

    // return new Promise((resolve, reject) => {

    var listOfKeys = "{";

    // create list of databases and datastores to be backed up in the form of an
    // array of arrays with each field naming the database, datastore in the
    // database

    //

    // ["acceptedKeyOffers", "acceptedKeyOffers", "acceptedKeyOffers"]
    // ["gloveboxKeys", "decryptionKeys", "decryptionKeys"],
    // ["gloveboxKeys", "encryptionKeys", "encryptionKeys"]
    // ["privateKeys", "keyPairs", "keyPairs"]


    try {
        for (var i = 0; i < parentArray.length; i++) {

            try {
                // await wait_promise(20); //wait for 2 seconds
                // var one = await
                // wait_promisedump_db(parentArray[i][0],parentArray[i][1],parentArray[i][2]);
                // var one =
                // dump_db(parentArray[i][0],parentArray[i][1],parentArray[i][2]);
                // var one;

                var db = parentArray[i][0];
                var dbName3 = parentArray[i][1];
                var storeName3 = parentArray[i][2];
                console.debug("### accessing db:" + db + " dbname:" + dbName3 + " storeName:" + storeName3);

                const one = READ_DB(db, dbName3, storeName3);
                console.debug("READ " + one);

                // console.debug("# appending: " +parentArray[i][0] + " " + one);
                // console.debug("#-#-#-#-# " + i + " " + listOfKeys);

                listOfKeys = listOfKeys + '"' + parentArray[i][0] + '":' + one + ',';
                console.debug("#-#-#-#-# (accumulating) " + i + " " + listOfKeys);

            } catch (e) {
                console.debug("ERROR");

                console.debug(e);
            }

        }
    } catch (e) {
        console.debug(e)
    }

    listOfKeys = listOfKeys.substring(0, listOfKeys.length - 1) + '}';

    // proceed with encryption
    // using passphrase specified in the form


    console.debug("#-#-#-#-# listOfKeys (complete) " + listOfKeys);
    // encrypt the data using the passphrase contained in the variable
    // backupFilePwd

    download_file("linklooker_rules_backup.json", listOfKeys);

    // download_file("glovebox_keys_backup.txt", listOfKeys, "text/plain");
    console.debug("### backup_all_keys() end");
    // resolve( "true");
    console.debug("backup completed, proceed to flush all keys.");
    // await flush_all_dbs();

    // });

}



// kick off
const navigateCollectionUI = new NavigateCollectionUI(document.getElementById('app'));
