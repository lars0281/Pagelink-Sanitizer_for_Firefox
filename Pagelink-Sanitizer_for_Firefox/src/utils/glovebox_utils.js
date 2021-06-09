export { 
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
    };

    
    import {
    	default_policies,
    	index_db_config
    }
    from "../glovebox_projectspecific.js"



    
/* v 1.0.0
 * Standard "toolkit" across all Glovebox's add-ons
 */


    import {
    	backup_all_databases_async,
//    	create_indexeddb_async,
//        deleteFromIndexedDB_async,
//        dump_db,
//        flush_all_keys_async,
    	loadFromIndexedDB_async,
        READ_DB_async,
    	saveToIndexedDB_async
    }
    from "./glovebox_db_ops.js"



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
    from "./glovebox_form_function.js"

    


 // call to background.js ro to fresh the in-memory policy set from the databases. 
 function refresh_policies_async(){
    	return new Promise(
                function (resolve, reject) {
 	
 	
 	// send message to background, to equest a refresh of the in-memory databases ( read in from the databases)
     	browser.runtime.sendMessage({
     		request: {"refresh":"policies"}
     	}, function (response) {
     		console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
     		resolve(true);
     	});
                });
 	
 }
    

    function setup_default_policies_async(){
    	 console.debug("setup_default_policies_async begin");
    	
    	 try {

    	        return new Promise(
    	            function (resolve, reject) {

    	            	 var p = [];
    	            	 
    	            	  for (var i = 0; i < default_policies.length; i++) {

    	                      p.push(saveToIndexedDB_async( default_policies[i].dbname, default_policies[i].dbstore, default_policies[i].keyPath,default_policies[i].policy));

    	                  }
    	            	 
    	                // console.debug(p);
    	                 // Using .catch:
    	                 Promise.all(p)
    	                 .then(values => {
    	                     console.debug(values);

    	                     resolve(values);
    	                 })
    	                 .catch(error => {
    	                     console.error(error.message)
    	                 });
    	             });
    	         } catch (f) {
    	             console.error(f);
    	         }
    	 
    }

    


    function indexeddb_setup_async(indexedDB) {
        console.debug("# indexeddb_setup_async start");
        return new Promise(
            function (resolve, reject) {

           
            try {
                var p = [];

                for (var i = 0; i < index_db_config.length; i++) {

                    p.push(create_indexeddb_async(indexedDB, index_db_config[i]));
                }

                // Using .catch:
                Promise.all(p)
                .then(values => {
                    console.debug(values);
                    
                    resolve(values);
                })
                .catch(error => {
                    console.error(error.message)
                });
            } catch (f) {
                console.error(f);
            }
        });

    }
    
//create table for database objects
//append the created table node object as a child to the node passed in the "node" parameter
function DISABLEDsetup_database_objects_table_async(indexedDbName, objectStoreName, keyId_json_path,table_id, node, table_conf, header_conf,column_conf) {

	/*
	 * indexedDbName
	 * objectStore
	 * 
	 * 
	 */
	try {
	 return new Promise(
		        function (resolve, reject) {

	
//var table_conf = JSON.parse(JSON.stringify(t));
//var header_conf = JSON.parse(JSON.stringify(h));
//var column_conf = JSON.parse(JSON.stringify(c));


console.debug("# setup_database_objects_table" );
 //console.debug("objectStore: " + objectStoreName);
//console.debug("indexedDbName: " + indexedDbName);
 // console.debug("node: " + JSON.stringify(node));
	
  //console.debug("table_conf: " + JSON.stringify(table_conf));
  //console.debug("header_conf: " + JSON.stringify(header_conf));
  //console.debug("column_conf: " + JSON.stringify(column_conf));

 
     // ##########
     // list all objects in db
     // ##########


     // var table_obj = createTable(table_conf, key);

     var div_table_obj = document.createElement("div");
     div_table_obj.setAttribute("class", "tableContainer");
     var table_obj = document.createElement("table");

   table_obj.setAttribute("class", "scrollTable");
     table_obj.setAttribute("width", "100%");
     table_obj.setAttribute("id", table_id);
     table_obj.setAttribute("indexedDbName", indexedDbName);
     table_obj.setAttribute("objectStoreName", objectStoreName);
     

     div_table_obj.appendChild(table_obj);

     var thead = document.createElement("thead");
     thead.setAttribute("class", "fixedHeader");
     thead.appendChild(writeTableHeaderRow(header_conf));

     table_obj.appendChild(thead);

     node.appendChild(table_obj);

     var tbody = document.createElement("tbody");
     tbody.setAttribute("class", "scrollContent");
  
     node.appendChild(tbody);

     var dbRequest = indexedDB.open(indexedDbName);
     dbRequest.onerror = function (event) {
         reject(Error("Error text"));
     };

     dbRequest.onupgradeneeded = function (event) {
         // Objectstore does not exist. Nothing to load
         event.target.transaction.abort();
         reject(Error('Not found'));
     };

 
     dbRequest.onsuccess = function (event) {
         var database = event.target.result;
         var transaction = database.transaction(objectStoreName, 'readonly');
         var objectStore = transaction.objectStore(objectStoreName);

         if ('getAll' in objectStore) {
             // IDBObjectStore.getAll() will return the full set of items
             // in our store.
            objectStore.getAll().onsuccess = function (event) {
                 const res = event.target.result;
                 // console.debug(res);
       for (const url of res) {

                           const tr = writeTableRow(url, column_conf, keyId_json_path);

                     // create add row to table

                     tbody.appendChild(tr);

                 }

             };
             // add a line where information on a new key can be added to
             // the database.
             // document.querySelector("button.onAddDecryptionKey").onclick
             // = this.onAddDecryptionKey;

         } else {
             // Fallback to the traditional cursor approach if getAll
             // isn't supported.
   
             var timestamps = [];
             objectStore.openCursor().onsuccess = function (event) {
                 var cursor = event.target.result;
                 if (cursor) {
                     console.debug(cursor.value);
                     // timestamps.push(cursor.value);
                     cursor.continue();
                 } else {
                     // logTimestamps(timestamps);
                 }
             };

 
         }

     };
     table_obj.appendChild(tbody);
     node.appendChild(table_obj);
     resolve (div_table_obj);

     
});
} catch (e) {
 console.debug(e)
}


}



var DISABLEDTableLastSortedColumn = -1;


// pass in a JSON with a descrition columns
// return

function DISABLEDcreateTable(data, table_conf, row_conf, column_conf) {
  // console.debug("# createTable" );
	// console.debug("data: " + JSON.stringify(data));
 // console.debug("table_conf: " + JSON.stringify(table_conf));
 // console.debug("row_conf: " + JSON.stringify(row_conf));
 // console.debug("column_conf: " + JSON.stringify(column_conf));
	
    var table_obj = null;

    try {
        table_obj = document.createElement("table");
        
        if (table_conf.hasOwnProperty('class')) {
        	 table_obj.setAttribute("class", table_conf.class);
        }
       // table_obj.setAttribute("width", "100%");

        // loop though data to create one row for each
        var i = 0;
        while(i < data.length  && i < 5){

            var tr_i = createTableRow(data[i], row_conf, column_conf);

            table_obj.appendChild(tr_i);
        	i++;
        }

    } catch (e) {
        console.debug(e)
    }

    return table_obj;
}



function stringToArrayBuffer(str) {
    var buf = new ArrayBuffer(str.length * 2);
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function arrayBufferToString(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}


function DISABLEDcreateTableRow(data, row_conf, column_conf) {
 console.debug("# createTableRow start" );
 console.debug("data: " + JSON.stringify(data));
 console.debug("row_conf: " + JSON.stringify(row_conf));
 console.debug("column_conf: " + JSON.stringify(column_conf));
	
     
    var row_obj = null;

    try {
    	row_obj = document.createElement("tr");

        
        if (row_conf.hasOwnProperty('class')) {
        	 row_obj.setAttribute("class", row_conf.class);
        }
        
   
     // table_obj.setAttribute("id", table_id);

        // loop though column conf to create one column for each
        var i = 0;
        var column_count = column_conf.length;
       // console.debug("column_count: " + column_count);
        while(i < column_count  && i < 5){

            var tr_i = writeTableCell(data, column_conf[i]);

            row_obj.appendChild(tr_i);
        	i++;
        }
        
    } catch (e) {
        console.debug(e)
    }

    return row_obj;

}




// ensure fixed header row in scrollable table
// http://www.imaputz.com/cssStuff/bigFourVersion.html

// return table row (header) object
function DISABLEDwriteTableHeaderRow(row_conf) {
   //  console.debug("## writeTableHeaderRow");
 

    var tr = null;

    try {

        // t_head.setAttribute("style", "position: absolute; color: #000");

        tr = document.createElement("tr");
        // tr.setAttribute("style", "display: block; position: relative; color:
        // #000");
        tr.setAttribute("class", "normalRow");

        for (var i = 0; i < row_conf.length; i++) {
            var obj = row_conf[i];
            // create a column for each

            // console.debug(JSON.stringify(obj));
            // console.debug("create column header ");

            var i_col = document.createElement("th");

            i_col.setAttribute("col_num", i);
            // i_col.setAttribute("style", "background: #C96; text-align: left;
            // border-top: 1px; padding: 4px" );

            // create clickable link
            var a_ref = document.createElement("a");
            // set data type here
            // T for text
            // D for dates
            // N for numbers
            // a_ref.setAttribute("href", "javascript:SortTable("+i+",'T'," +
            // table_id +");");
            // i_col.innerHTML = obj.text;
            i_col.appendChild(document.createTextNode(obj.text));


            // create event listener to trigger sorting on the column
            i_col.addEventListener('click', function (event) {
                // SortTable(i, 'T', table_id);
                sortColumn(event);
            })
            i_col.appendChild(a_ref);
            tr.appendChild(i_col);

        }
    } catch (e) {
        console.debug(e)
    }

    return tr;

}


function download_file(name, contents, mime_type) {

    console.debug("download_file BEGIN");

    mime_type = mime_type || "text/plain";

    var blob = new Blob([contents], {
            type: mime_type
        });

    var dlink = document.createElement('a');
    dlink.download = name;
    dlink.href = window.URL.createObjectURL(blob);
    dlink.onclick = function (e) {
        // revokeObjectURL needs a delay to work properly
        var that = this;
        setTimeout(function () {
            window.URL.revokeObjectURL(that.href);
        }, 1500);
    };

    dlink.click();
    dlink.remove();
    console.debug("download_file END");
}



/**
 * Secure Hash Algorithm (SHA1)
 * http://www.webtoolkit.info/
 **/
function SHA1(msg) {
    console.debug("navigate-collection:SHA1");
    function rotate_left(n, s) {
        var t4 = (n << s) | (n >>> (32 - s));
        return t4;
    };
    function lsb_hex(val) {
        var str = '';
        var i;
        var vh;
        var vl;
        for (i = 0; i <= 6; i += 2) {
            vh = (val >>> (i * 4 + 4)) & 0x0f;
            vl = (val >>> (i * 4)) & 0x0f;
            str += vh.toString(16) + vl.toString(16);
        }
        return str;
    };
    function cvt_hex(val) {
        var str = '';
        var i;
        var v;
        for (i = 7; i >= 0; i--) {
            v = (val >>> (i * 4)) & 0x0f;
            str += v.toString(16);
        }
        return str;
    };
    function Utf8Encode(string) {
        string = string.replace(/\r\n/g, '\n');
        var utftext = '';
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    };
    var blockstart;
    var i,
    j;
    var W = new Array(80);
    var H0 = 0x67452301;
    var H1 = 0xEFCDAB89;
    var H2 = 0x98BADCFE;
    var H3 = 0x10325476;
    var H4 = 0xC3D2E1F0;
    var A,
    B,
    C,
    D,
    E;
    var temp;
    msg = Utf8Encode(msg);
    var msg_len = msg.length;
    var word_array = new Array();
    for (i = 0; i < msg_len - 3; i += 4) {
        j = msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 |
            msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3);
        word_array.push(j);
    }
    switch (msg_len % 4) {
    case 0:
        i = 0x080000000;
        break;
    case 1:
        i = msg.charCodeAt(msg_len - 1) << 24 | 0x0800000;
        break;
    case 2:
        i = msg.charCodeAt(msg_len - 2) << 24 | msg.charCodeAt(msg_len - 1) << 16 | 0x08000;
        break;
    case 3:
        i = msg.charCodeAt(msg_len - 3) << 24 | msg.charCodeAt(msg_len - 2) << 16 | msg.charCodeAt(msg_len - 1) << 8 | 0x80;
        break;
    }
    word_array.push(i);
    while ((word_array.length % 16) != 14)
        word_array.push(0);
    word_array.push(msg_len >>> 29);
    word_array.push((msg_len << 3) & 0x0ffffffff);
    for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
        for (i = 0; i < 16; i++)
            W[i] = word_array[blockstart + i];
        for (i = 16; i <= 79; i++)
            W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
        A = H0;
        B = H1;
        C = H2;
        D = H3;
        E = H4;
        for (i = 0; i <= 19; i++) {
            temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }
        for (i = 20; i <= 39; i++) {
            temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }
        for (i = 40; i <= 59; i++) {
            temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }
        for (i = 60; i <= 79; i++) {
            temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }
        H0 = (H0 + A) & 0x0ffffffff;
        H1 = (H1 + B) & 0x0ffffffff;
        H2 = (H2 + C) & 0x0ffffffff;
        H3 = (H3 + D) & 0x0ffffffff;
        H4 = (H4 + E) & 0x0ffffffff;
    }
    var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);

    return temp.toLowerCase();
}





function convertStringToArrayBufferView(str) {
    var bytes = new Uint8Array(str.length);
    for (var iii = 0; iii < str.length; iii++) {
        bytes[iii] = str.charCodeAt(iii);
    }

    return bytes;
}

function convertArrayBufferViewtoString(buffer) {
    var str = "";
    for (var iii = 0; iii < buffer.byteLength; iii++) {
        str += String.fromCharCode(buffer[iii]);
    }

    return str;
}



function base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    const buffer = new ArrayBuffer(8);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}


function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}







