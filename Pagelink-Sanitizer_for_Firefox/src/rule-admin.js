export {
render_tables
}

import {
	    arrayBufferToBase64,
		arrayBufferToString,
		base64ToArrayBuffer,
		convertArrayBufferViewtoString,
		convertStringToArrayBufferView,
	    download_file,
	    indexeddb_setup_async,
	    refresh_policies_async,
	    setup_default_policies_async,
	    SHA1,
	    stringToArrayBuffer
	    
}
from "./utils/glovebox_utils.js"


import {
	addObject,
	CompareRowOfNumbers,
    CompareRowOfText,
	createTable,
    createTableRow,
    deleteObject,
    GetDateSortingKey,
    reflow,
    setup_database_objects_table_async,
    sortColumn,
    SortTable,
    TableLastSortedColumn,
    updateObject,
    writeTableCell,
    writeTableHeaderRow,
    writeTableNode,
    writeTableRow
    
}
from "./utils/glovebox_form_function.js"



import {
	backup_all_databases_async,
	    
//	create_indexeddb_async,
    deleteFromIndexedDB_async,
//    dump_db,
//    flush_all_keys_async,
    import_into_db_async,
	loadFromIndexedDB_async,
    READ_DB_async,
	saveToIndexedDB_async
}
from "./utils/glovebox_db_ops.js"


import { 
	default_policies,
	index_db_config,

	}
from "./glovebox_projectspecific.js"



console.debug("### rule-admin.js ");


class NavigateCollectionUI {
    constructor(containerEl) {

       // console.debug("### rule-admin.js ");

        this.containerEl = containerEl;


        
        render_tables()
        
   

  

        // list of main tables
        console.debug(JSON.stringify(index_db_config));
        console.debug(JSON.stringify(index_db_config.length));
        //console.debug(JSON.stringify(index_db_config.dbs[0]));
        
        
        
        
      //  var tables = ['sourceURLPolicy', 'sourceHostnamePolicy', 'sourceDomainPolicy'];

        // loop through all tables and set up what buttons are needed for each
        for (var t = 0; t < index_db_config.length; t++) {
            // console.debug("do: " + tables[t]);


            try {
                // console.debug("hide button status: "+
                // document.getElementById("hide_"+tables[t]+"_button").style.display);

                // show/hide button
                document.getElementById("hide_" + index_db_config[t].dbname + "_button").addEventListener('click',
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
                document.getElementById("add_" + index_db_config[t].dbname + "_button").addEventListener('click',
                    function (event) {
  
                             console.debug("### button add begin");
                             addNewPolicy(event);
                         });
                
            } catch (e) {
            	// error to be expected here it not all databases should have their own table. Which are to be show is determined by the content rule-admin.html
            	// The iteration above goes through the master list in db config, the html acts as a filter.
                console.debug(e);
            }

        }

        attach_main_button_eventlisteners();

    }
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

    
    // l
   

    // sourceDomainPolicy
    header_conf[0].text = "Domain name";
    column_conf[0].json_path = "url_match";

    
    
    // loop through all tables and create the actual tables object
    for (var t = 0; t < index_db_config.length; t++) {
        // console.debug("do: " + tables[t]);


        try {

// check if the tables has a spot on the html page
//        	   console.debug(document.getElementById("hide_" + index_db_config[t].dbname + "_button"));
        	  console.debug( document.querySelector('div[indexeddbname="'+index_db_config[t].dbname+'"]'));
        	
        	  if(document.querySelector('div[indexeddbname="'+index_db_config[t].dbname+'"]')){
        		  
        		  
        	  }
        	  
        	
        } catch (e) {
        	// error to be expected here it not all databases should have their own table. Which are to be show is determined by the content rule-admin.html
        	// The iteration above goes through the master list in db config, the html acts as a filter.
            console.debug(e);
        }

    }
    
    
    
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
 
    // identify which database and datastore the new object goes to
    var indexedDbName = null;

    var container = event.target.parentNode;

    try {
        indexedDbName = container.querySelector("table.scrollTable").getAttribute('indexedDbName');
    } catch (e) {
        console.debug(e);
    }

    var objectStoreName = null;

    try {
        objectStoreName = container.querySelector("table.scrollTable").getAttribute('objectStoreName');
    } catch (e) {
        console.debug(e);
    }

    console.debug("objectStoreName: " + objectStoreName);
    console.debug("indexedDbName: " + indexedDbName);

    
    browser.storage.sync.set({
        'indexedDbName': indexedDbName,
        'objectStoreName': objectStoreName
    });
    //.then(function (res) {

      
   

   

    
        if(/URL/i.test(indexedDbName) ){
    	var w = window.open('popup/add-url-policy.html', 'test01', 'width=1000,height=600,resizeable,scrollbars');

    }else if(/Domain/.test(indexedDbName) ){

    	var w = window.open('popup/add-domain-policy.html', 'test01', 'width=1000,height=600,resizeable,scrollbars');

    }else{

    	var w = window.open('popup/add-hostname-policy.html', 'test01', 'width=1000,height=600,resizeable,scrollbars');

    }
    
    
    
   
	

   
    //});
}




function DISABLEdeleteObject(event) {
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


function attach_main_button_eventlisteners() {

    console.debug("# attach_main_button_eventlisteners");

    // attach event listeners to page buttons

    try {
        document.getElementById("button_generate_default").addEventListener('click',
            function () {
            console.debug("### button.generate-source-hostname-rule begin");
            setup_default_policies_async().then();
            console.debug("### button.generate-source-hostname-rule end");
            // update the page tables
            render_tables();

        });

    } catch (e) {
        console.debug(e);
    }

    // add refresh button
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

            backup_all_databases_async().then(function (e) {
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

                    var data = JSON.parse(content);

                    var imp = [];

                    // fine contains an array of database dumps
                    for (var j = 0; j < data.length; j++) {
                        console.debug(data[j].database);

                        imp.push(import_into_db_async(data[j].database, data[j].datastore, 'keyId', data[j].data));

                    }

                    Promise.all(imp)
                    .then(function (values) {
                        console.debug(JSON.stringify(values));

                    });

                }

            }

            input.click();

        });

    } catch (e) {
        console.debug(e);
    }

}




// kick off
const navigateCollectionUI = new NavigateCollectionUI(document.getElementById('app'));
