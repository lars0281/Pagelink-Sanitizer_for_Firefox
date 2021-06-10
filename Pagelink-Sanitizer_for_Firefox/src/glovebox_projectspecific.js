export { 
	default_policies,
	index_db_config,
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
from "./utils/glovebox_db_ops.js"



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




var default_policies = [{dbname:'sourceHostnameRuleDB',dbstore:'sourceHostnameRuleStore', keyPath: 'keyId', policy:{
          keyId: 'https://www.google.com/',
          url_match: 'https://www.google.com/',
          scope: 'Hostname',
          direction: 'source',
          steps: [{
                  procedure: "qs_param",
                  parameters: [{
                          value: "url",
                          notes: "read url from querystring"
                      }
                  ],
                  notes: "grab the url parameter from the querystring"
              }, {
                  procedure: "uri_decode",
                  parameters: [],
                  notes: "uri decode"
              }
          ],
          notes: '',
          createtime: '202001010001'
      }}
	
,{dbname:'sourceHostnamePolicyDB', dbstore:'sourceHostnamePolicyStore', keyPath:'keyId', policy:{
    keyId: 'https://outlook.office.com/',
    url_match: 'https://outlook.office.com/',
    scope: 'Hostname',
    "steps": [{
        "procedure": "regexp",
        "parameters": [{
                "value": "sD^(https)Ddisabled$1Dg",
                "notes": "prefix the protocol for all fully qualified URLs"
				}
        ],
        "notes": "Disable all external links"
    }, {
        "procedure": "regexp",
        "parameters": [{
                "value": "sD^disabled(https://[^/]*.office.com)D$1Dg",
                "notes": "remove the disabled prefix from the protocol for URLs in the .office.com domain"
            }
        ],
        "notes": "Allow .office.com domains as local"
    }, {
        "procedure": "regexp",
        "parameters": [{
                "value": "sD^disabled(https://[^/]*.microsoft.com)D$1Dg",
                "notes": "remove the disabled prefix from the protocol for URLs in the .microsoft.com domain"
            }
        ],
        "notes": "Allow .microsoft.com hostnames too."
    }
    ],
    notes: 'Disable external links in Oulook emails',
    createtime: '202001010001'
}},{  dbname:'sourceHostnamePolicyDB', dbstore:'sourceHostnamePolicyStore', keyPath:'keyId', policy:{
            keyId: 'https://mail.yahoo.com/',
            url_match: 'https://mail.yahoo.com/',
            scope: 'Hostname',
            "steps": [{
                "procedure": "regexp",
                "parameters": [{
                        "value": "sD^(https)Ddisabled$1Dg",
                        "notes": "prefix the protocol for all fully qualified URLs"
    					}
                ],
                "notes": "Disable all external links"
            }, {
                "procedure": "regexp",
                "parameters": [{
                        "value": "sD^disabled(https://[^/]*.yahoo.com)D$1Dg",
                        "notes": "remove the disabled prefix from the protocol for URL in the .yahoo.com domain"
                    }
                ],
                "notes": "Allow .yahoo.com domains as local"
            }, {
                "procedure": "regexp",
                "parameters": [{
                        "value": "sD^disabled(https://[^/]*.yimg.com)D$1Dg",
                        "notes": "remove the disabled prefix from the protocol for URL in the .yimg.com domain"
                    }
                ],
                "notes": "Allow yimg.com domain too."
            }
            ],
            notes: 'Disable external links in Yahoo mail',
            createtime: '202001010001'
        }},{
        dbname:'sourceHostnamePolicyDB',dbstore: 'sourceHostnamePolicyStore', keyPath:'keyId',policy: {
            keyId: 'https://mail.exchange.microsoft.com/',
            url_match: 'https://mail.exchange.microsoft.com/',
            scope: 'Hostname',
            "steps": [{
                "procedure": "regexp",
                "parameters": [{
                        "value": "sD^(https)Ddisabled$1Dg",
                        "notes": "prefix the protocol for all fully qualified URLs"
    					}
                ],
                "notes": "Disable all external links"
            }, {
                "procedure": "regexp",
                "parameters": [{
                        "value": "sD^disabled(https://[^/]*.microsoft.com)D$1Dg",
                        "notes": "remove the disabled prefix from the protocol for URLs in the .microsoft.com domain"
                    }
                ],
                "notes": "Allow .microsoft.com hostnames"
            }
            ],
            notes: 'Disable external links in MS Exchange mail',
            createtime: '202001010001'
        }},{ dbname:'sourceHostnamePolicyDB', dbstore:'sourceHostnamePolicyStore', keyPath:'keyId', policy: {
                keyId: 'https://mail.google.com/',
                url_match: 'https://mail.google.com/',
                "steps": [{
                    "procedure": "regexp",
                    "parameters": [{
                            "value": "sD^(https)Ddisabled$1Dg",
                            "notes": "prefix the protocol for all fully qualified URLs"
        					}
                    ],
                    "notes": "Disable all external links"
                }, {
                    "procedure": "regexp",
                    "parameters": [{
                            "value": "sD^disabled(https://[^/]*.google.com)D$1Dg",
                            "notes": "remove the disabled prefix from the protocol for URLs in the .google.com domain"
                        }
                    ],
                    "notes": "Allow .google.com hostnames"
                }
                ],
                notes: 'Disable external links in GMail messages',
                createtime: '202001010001'
            }},{ dbname:'sourceHostnamePolicyDB', dbstore:'sourceHostnamePolicyStore',keyPath: 'keyId', policy: {
             keyId: 'https://mail.aol.com/',
             url_match: 'https://mail.aol.com/',
             scope: 'Hostname',
             "steps": [{
                 "procedure": "regexp",
                 "parameters": [{
                         "value": "sD^(https)Ddisabled$1Dg",
                         "notes": "prefix the protocol for all fully qualified URLs"
     					}
                 ],
                 "notes": "Disable all external links"
             }, {
                 "procedure": "regexp",
                 "parameters": [{
                         "value": "sD^disabled(https://[^/]*.aol.com)D$1Dg",
                         "notes": "remove the disabled prefix from the protocol for URLs in the .aol.com domain"
                     }
                 ],
                 "notes": "Allow .aol.com hostnames"
             }
             ],
             notes: 'Disable external links in AOL messages',
             createtime: '202001010001'
         }}
,{dbname:'sourceHostnamePolicyDB', dbstore:'sourceHostnamePolicyStore', keyPath: 'keyId',policy: {
             keyId: 'https://mail.yandex.com/',
             url_match: 'https://mail.yandex.com/',
             scope: 'Hostname',
             "steps": [{
                 "procedure": "regexp",
                 "parameters": [{
                         "value": "sD^(https)Ddisabled$1Dg",
                         "notes": "prefix the protocol for all fully qualified URLs"
     					}
                 ],
                 "notes": "Disable all external links"
             }, {
                 "procedure": "regexp",
                 "parameters": [{
                         "value": "sD^disabled(https://[^/]*.yandex.com)D$1Dg",
                         "notes": "remove the disabled prefix from the protocol for URLs in the .yandex.com domain"
                     }
                 ],
                 "notes": "Allow .yandex.com hostnames"
             }
             ],
             notes: 'Disable external links in Yandex messages',
             createtime: '202001010001'
         }}, {
             dbname: 'sourceHostnamePolicyDB',
             dbstore: 'sourceHostnamePolicyStore',
             keyPath: 'keyId',
             policy: {
                 keyId: 'https://www.nytimes.com/',
                 url_match: 'https://www.nytimes.com/',
                 scope: 'Hostname',
                 "steps": [{
                         "procedure": "regexp",
                         "parameters": [{
                                 "value": "sD^(https)Ddisabled$1Dg",
                                 "notes": "prefix the protocol for all fully qualified URLs"
                             }
                         ],
                         "notes": "Disable all external links"
                     }, {
                         "procedure": "regexp",
                         "parameters": [{
                                 "value": "sD^disabled(https://[^/]*.nytimes.com)D$1Dg",
                                 "notes": "remove the disabled prefix from the protocol for URLs in the .nytimes.com domain"
                             }
                         ],
                         "notes": "Allow .nytimes.com hostnames"
                     }
                 ],
                 notes: 'Disable external links in new york times',
                 createtime: '202001010001'
             }
         },{  dbname:'sourceHostnamePolicyDB',dbstore: 'sourceHostnamePolicyStore',keyPath: 'keyId',policy: {
             keyId: 'https://mail.protonmail.com/',
             url_match: 'https://mail.protonmail.com/',
             scope: 'Hostname',
             "steps": [{
                 "procedure": "regexp",
                 "parameters": [{
                         "value": "sD^(https)Ddisabled$1Dg",
                         "notes": "prefix the protocol for all fully qualified URLs"
     					}
                 ],
                 "notes": "Disable all external links"
             }, {
                 "procedure": "regexp",
                 "parameters": [{
                         "value": "sD^disabled(https://[^/]*.protonmail.com)D$1Dg",
                         "notes": "remove the disabled prefix from the protocol for URLs in the .protonmail.com domain"
                     }
                 ],
                 "notes": "Allow .protonmail.com hostnames"
             }
             ],
             notes: 'Disable external links in Protonmail messages',
             createtime: '202001010001'
         }},{  dbname: 'sourceHostnamePolicyDB', dbstore: 'sourceHostnamePolicyStore',keyPath: 'keyId',policy: {
             keyId: 'https://mail.tutanota.com/',
             url_match: 'https://mail.tutanota.com/',
             scope: 'Hostname',
             "steps": [{
                 "procedure": "regexp",
                 "parameters": [{
                         "value": "sD^(https)Ddisabled$1Dg",
                         "notes": "prefix the protocol for all fully qualified URLs"
     					}
                 ],
                 "notes": "Disable all external links"
             }, {
                 "procedure": "regexp",
                 "parameters": [{
                         "value": "sD^disabled(https://[^/]*.tutanota.com)D$1Dg",
                         "notes": "remove the disabled prefix from the protocol for URLs in the .tutanota.com domain"
                     }
                 ],
                 "notes": "Allow .tutanota.com hostnames"
             }
             ],
             notes: 'Disable external links in Tutanota messages',
             createtime: '202001010001'
         }},{  dbname:'sourceDomainPolicyDB',dbstore: 'sourceDomainPolicyStore', keyPath: 'keyId', policy: {
            keyId: 'bbc.co.uk',
            url_match: 'bbc.co.uk',
            scope: 'Domain',
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
                        "value": "sD^disabled(https://[^/]*.bbc.co.uk)D$1Dg",
                        "notes": "default"
                    }
                ],
                "notes": "Allow all .bbc.co.uk domains as local"
            }, {
                "procedure": "regexp",
                "parameters": [{
                        "value": "sD^disabled(https://[^/]*.bbci.co.uk)D$1Dg",
                        "notes": "default"
                    }
                ],
                "notes": "Allow .bbci.co.uk domains too."
            }
            ],
            notes: 'test pagelink sanitation policy',
            createtime: '202001010001'
        }},{  dbname: 'sourceDomainPolicyDB', dbstore: 'sourceDomainPolicyStore', keyPath: 'keyId', policy: {
            keyId: 'bbc.com',
            url_match: 'bbc.com',
            scope: 'Domain',
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
                        "value": "sD^disabled(https://[^/]*.bbc.com)D$1Dg",
                        "notes": "default"
                    }
                ],
                "notes": "Allow all .bbc.com domains as local"
            }, {
                "procedure": "regexp",
                "parameters": [{
                        "value": "sD^disabled(https://[^/]*.bbci.co.uk)D$1Dg",
                        "notes": "default"
                    }
                ],
                "notes": "Allow .bbci.co.uk domains too."
            }
            ],
            notes: 'test pagelink sanitation policy',
            createtime: '202001010001'
        }},{dbname:'sourceURLPolicyDB',dbstore: 'sourceURLPolicyStore',keyPath: 'keyId',policy: {
             keyId: 'https://www.zoho.com/mail',
             url_match: 'https://www.zoho.com/mail',
             scope: 'Hostname',
             "steps": [{
                 "procedure": "regexp",
                 "parameters": [{
                         "value": "sD^(https)Ddisabled$1Dg",
                         "notes": "prefix the protocol for all fully qualified URLs"
     					}
                 ],
                 "notes": "Disable all external links"
             }, {
                 "procedure": "regexp",
                 "parameters": [{
                         "value": "sD^disabled(https://[^/]*.zoho.com)D$1Dg",
                         "notes": "remove the disabled prefix from the protocol for URLs in the .zoho.com domain"
                     }
                 ],
                 "notes": "Allow .zoho.com hostnames"
             }
             ],
             notes: 'Disable external links in Zoho messages',
             createtime: '202001010001'
         }}

	];


