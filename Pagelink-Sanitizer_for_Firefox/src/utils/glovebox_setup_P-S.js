export { 
	generate_default_link_rules_async, 
	indexeddb_setup_async
	};



import {
	create_indexeddb_async,
    deleteFromIndexedDB_async,
    dump_db,
    flush_all_keys_async,
	loadFromIndexedDB_async,
    READ_DB_async,
    saveToIndexedDB_async
}
from "./glovebox_db_ops.js"



function generate_default_link_rules_async() {

    console.debug("generate_default_link_rules_async begin");

    // add rule objects to database
    try {
    	   return new Promise(
    	            function (resolve, reject) {
        var p = [];
        p.push(saveToIndexedDB_async('sourceDomainPolicyDB', 'sourceDomainPolicyStore', 'keyId', {
            keyId: 'HHHyahoo.com',
            url_match: 'HHHyahoo.com',
            scope: 'Domain',
            notes: 'yahoo.com pagelink sanitation policy',
            createtime: '202001010001'
        }));
        
        
        p.push(saveToIndexedDB_async('sourceHostnamePolicyDB', 'sourceHostnamePolicyStore', 'keyId', {
            keyId: 'https://mail.yahoo.com/',
            url_match: 'https://mail.yahoo.com/',
            scope: 'Hostname',
            notes: 'test pagelink sanitation policy',
            createtime: '202001010001'
        }));

         p.push(saveToIndexedDB_async('sourceHostnamePolicyDB', 'sourceHostnamePolicyStore', 'keyId', {
                keyId: 'https://mail.google.com/',
                url_match: 'https://mail.google.com/',
                scope: 'Hostname',
                notes: 'test pagelink sanitation policy',
                createtime: '202001010001'
            }));

         p.push(saveToIndexedDB_async('sourceDomainPolicyDB', 'sourceDomainPolicyStore', 'keyId', {
            keyId: 'mozilla.org',
            url_match: 'mozilla.org',
            scope: 'Domain',
            notes: 'test pagelink sanitation policy',
            createtime: '202001010001'
        }));
        console.debug(p);
        // Using .catch:
        Promise.all(p)
        .then(values => {
            console.debug(values);
            resolve(values);
        })
        .catch(error => {
            console.error(error.message)
        });    	            });
    } catch (f) {
        console.debug(f);
    }
}


function indexeddb_setup_async(indexedDB) {
    console.debug("# indexeddb_setup_async start");
    return new Promise(
        function (resolve, reject) {

        var index_db_config = [{
                dbname: "sourceDomainPolicyDB",
                objectstore: [{
                        name: "sourceDomainPolicyStore",
                        keyPath: "keyId",
                        autoIncrement: false,
                        index: [{
                                n: "keyId",
                                o: "keyId",
                                unique: "true"
                            }
                        ]
                    }
                ]
            }, {
                dbname: "sourceHostnamePolicyDB",
                objectstore: [{
                        name: "sourceHostnamePolicyStore",
                        keyPath: "keyId",
                        autoIncrement: false,
                        index: [{
                                n: "keyId",
                                o: "keyId",
                                unique: "true"
                            }
                        ]
                    }
                ]
            }, {
                dbname: "sourceUrlPolicyDB",
                objectstore: [{
                        name: "sourceUrlPolicyStore",
                        keyPath: "keyId",
                        autoIncrement: false,
                        index: [{
                                n: "keyId",
                                o: "keyId",
                                unique: "true"
                            }
                        ]
                    }
                ]
            }
        ];

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

