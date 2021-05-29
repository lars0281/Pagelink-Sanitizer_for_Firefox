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
     
        
        
        p.push(saveToIndexedDB_async('sourceHostnamePolicyDB', 'sourceHostnamePolicyStore', 'keyId', {
            keyId: 'https://outlook.office.com/',
            url_match: 'https://outlook.office.com/',
            scope: 'Hostname',
            steps: [{
                procedure: "regexp",
                parameters: [{
                        value: "sD^(http)Ddisabled$1Dg",
                        notes: "prefix the protocol with the word disabled"
                    }
                ],
                notes: "disable fully qualified URLs pointing to non-local domains"
            }
        ],
            notes: 'Disable external links in Oulook emails',
            createtime: '202001010001'
        }));

        p.push(saveToIndexedDB_async('sourceHostnamePolicyDB', 'sourceHostnamePolicyStore', 'keyId', {
            keyId: 'https://mail.yahoo.com/',
            url_match: 'https://mail.yahoo.com/',
            scope: 'Hostname',
            "steps": [{
                "procedure": "regexp",
                "parameters": [{
                        "value": "sD^(https)Ddisabled$1Dg",
                        "notes": "Disable all fully qualified URLs"
    					}
                ],
                "notes": "Disable all external links"
            }, {
                "procedure": "regexp",
                "parameters": [{
                        "value": "sD^disabled(https://[^/]*.yahoo.com)D$1Dg",
                        "notes": "default"
                    }
                ],
                "notes": "Allow yahoo.com domain as local"
            }, {
                "procedure": "regexp",
                "parameters": [{
                        "value": "sD^disabled(https://[^/]*.yimg.com)D$1Dg",
                        "notes": "default"
                    }
                ],
                "notes": "Allow yimg.com domain too."
            }
            ],
            notes: 'Disable external links in Yahoo mail',
            createtime: '202001010001'
        }));

        p.push(saveToIndexedDB_async('sourceHostnamePolicyDB', 'sourceHostnamePolicyStore', 'keyId', {
            keyId: 'https://mail.exchange.microsoft.com/',
            url_match: 'https://mail.exchange.microsoft.com/',
            scope: 'Hostname',
            steps: [{
                procedure: "regexp",
                parameters: [{
                        value: "sD^(http)Ddisabled$1Dg",
                        notes: "prefix the protocol with the word disabled"
                    }
                ],
                notes: "disable fully qualified URLs pointing to non-local domains"
            }
        ],
        notes: 'Disable external links in MS Exchange mail',
            createtime: '202001010001'
        }));
         p.push(saveToIndexedDB_async('sourceHostnamePolicyDB', 'sourceHostnamePolicyStore', 'keyId', {
                keyId: 'https://mail.google.com/',
                url_match: 'https://mail.google.com/',
                scope: 'Hostname',
                steps: [{
                    procedure: "regexp",
                    parameters: [{
                            value: "sD^(http)Ddisabled$1Dg",
                            notes: "prefix the protocol with the word disabled"
                        }
                    ],
                    notes: "disable fully qualified URLs pointing to non-local domains"
                }
            ],
         
            notes: 'Disable external links in Gmail messages',
                createtime: '202001010001'
            }));

         p.push(saveToIndexedDB_async('sourceHostnamePolicyDB', 'sourceHostnamePolicyStore', 'keyId', {
             keyId: 'https://mail.aol.com/',
             url_match: 'https://mail.aol.com/',
             scope: 'Hostname',
             steps: [{
                 procedure: "regexp",
                 parameters: [{
                         value: "sD^(http)Ddisabled$1Dg",
                         notes: "prefix the protocol with the word disabled"
                     }
                 ],
                 notes: "disable fully qualified URLs pointing to non-local domains"
             }
         ],
      
         notes: 'Disable external links in AOL messages',
             createtime: '202001010001'
         }));
         p.push(saveToIndexedDB_async('sourceHostnamePolicyDB', 'sourceHostnamePolicyStore', 'keyId', {
             keyId: 'https://mail.yandex.com/',
             url_match: 'https://mail.yandex.com/',
             scope: 'Hostname',
             steps: [{
                 procedure: "regexp",
                 parameters: [{
                         value: "sD^(http)Ddisabled$1Dg",
                         notes: "prefix the protocol with the word disabled"
                     }
                 ],
                 notes: "disable fully qualified URLs pointing to non-local domains"
             }
         ],
      
         notes: 'Disable external links in Yandex messages',
             createtime: '202001010001'
         }));

         p.push(saveToIndexedDB_async('sourceHostnamePolicyDB', 'sourceHostnamePolicyStore', 'keyId', {
             keyId: 'https://mail.protonmail.com/',
             url_match: 'https://mail.protonmail.com/',
             scope: 'Hostname',
             steps: [{
                 procedure: "regexp",
                 parameters: [{
                         value: "sD^(http)Ddisabled$1Dg",
                         notes: "prefix the protocol with the word disabled"
                     }
                 ],
                 notes: "disable fully qualified URLs pointing to non-local domains"
             }
         ],
      
         notes: 'Disable external links in Protonmail messages',
             createtime: '202001010001'
         }));
      
         p.push(saveToIndexedDB_async('sourceHostnamePolicyDB', 'sourceHostnamePolicyStore', 'keyId', {
             keyId: 'https://mail.tutanota.com/',
             url_match: 'https://mail.tutanota.com/',
             scope: 'Hostname',
             steps: [{
                 procedure: "regexp",
                 parameters: [{
                         value: "sD^(http)Ddisabled$1Dg",
                         notes: "prefix the protocol with the word disabled"
                     }
                 ],
                 notes: "disable fully qualified URLs pointing to non-local domains"
             }
         ],
           notes: 'Disable external links in Tutanota messages',
             createtime: '202001010001'
         }));
         
         
         p.push(saveToIndexedDB_async('sourceDomainPolicyDB', 'sourceDomainPolicyStore', 'keyId', {
            keyId: 'mozilla.org',
            url_match: 'mozilla.org',
            scope: 'Domain',
            steps: [{
                procedure: "regexp",
                parameters: [{
                        value: "sD^(http)Ddisabled$1Dg",
                        notes: "prefix the protocol with the word disabled"
                    }
                ],
                notes: "disable fully qualified URLs pointing to non-local domains"
            }
        ],
            notes: 'test pagelink sanitation policy',
            createtime: '202001010001'
        }));
         
         p.push(saveToIndexedDB_async('sourceURLPolicyDB', 'sourceURLPolicyStore', 'keyId', {
             keyId: 'https://www.zoho.com/mail',
             url_match: 'https://www.zoho.com/mail',
             scope: 'Hostname',
             steps: [{
                 procedure: "regexp",
                 parameters: [{
                         value: "sD^(http)Ddisabled$1Dg",
                         notes: "prefix the protocol with the word disabled"
                     }
                 ],
                 notes: "disable fully qualified URLs pointing to non-local domains"
             }
         ],
         notes: 'Disable external links in Zoho messages',
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
                dbname: "sourceURLPolicyDB",
                objectstore: [{
                        name: "sourceURLPolicyStore",
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

