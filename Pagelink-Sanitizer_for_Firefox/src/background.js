
console.debug("start Pagelink Sanitizer background");

let db;

let indexedDB;

// databases:

// May 22 2021


/*

 * maintain a rules set over webpages on which policy is applied.
 * The policy is to deisable all inks contained on those pages that go to addesses outside the domain they are located at.
 *
 * Run a "trigger" content scrpt in all windows which makes one call to background script with current URL of the pages it shows.
 *
 * The background script , if the url is a mach on policy, sends back a policy script to the page in question to enforce policy.
 *
 *
 *
 * Dispatch a content script to such pages and the content script performs the disabling
 *
 *
 *
 *
 * Apply rules to determine where link end up. Some links result in redirect,
 * but in the querystring there are values to indicate what the redirect URL
 * will be. Use rules to compute this URL without having to call the URL.
 *
 * Lookup link to check if ends in a redirect (use HTTP HEAD method)
 *
 * Apply controls to HTTP cookie
 *
 *
 * Control cookies
 *
 * Rules to which cookies to never send and allways send Rules scoped for
 * domain, hostname and URL
 *
 * Purpose to achieve with this functionality.
 *
 * 1) Always send the cookie to a server to avoid being confronted by
 * GPDR-mandated cookie acceptance form. Where these forms are prompted by a
 * missing cookie, clearing cookies will mean that the user is repeatedly asked
 * to accept cookies. Permanently setting the cookie will avoid this nuisance.
 *
 * Example www.youtube.com After the user click to concent to cookies, this is
 * returned to the browser set-cookie:
 * CONSENT=YES+cb.20210425-18-p0.en-GB+FX+944; Domain=.youtube.com; Expires=Sun,
 * 10-Jan-2038 07:59:59 GMT; Path=/; Secure; SameSite=none
 *
 * Send this cookie from then on: CONSENT=YES+cb.20210425-18-p0.en-GB+FX+944;
 * Note the seemingly random data after "YES". it contains a timestamp and some
 * other sender specific data. The rules must have a language to compute this
 * value as needed.
 *
 *
 * 2) Some services have a "first one is free" setup where the user is entitled
 * to see a limited number of something, but once the limit has been exceeded is
 * required to login
 *
 *
 * Example www.nytimes.co m
 *
 *
 */

// context menu related - not in version 1.0


indexedDB = window.indexedDB || window.webkitIndexedDB ||
    window.mozIndexedDB || window.msIndexedDB;

if (!window.indexedDB) {
    console.debug("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
} else {
    //    console.debug("1.1.0");
}

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

// set a default processing steps to be use in cases where a policy exists but contains no valid processing steps

var default_policies = [{
        dbname: 'sourceHostnamePolicyDB',
        dbstore: 'sourceHostnamePolicyStore',
        keyPath: 'keyId',
        policy: {
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
        }
    }, {
        dbname: 'sourceHostnamePolicyDB',
        dbstore: 'sourceHostnamePolicyStore',
        keyPath: 'keyId',
        policy: {
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
        }
    }, {
        dbname: 'sourceHostnamePolicyDB',
        dbstore: 'sourceHostnamePolicyStore',
        keyPath: 'keyId',
        policy: {
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
        }
    }, {
        dbname: 'sourceHostnamePolicyDB',
        dbstore: 'sourceHostnamePolicyStore',
        keyPath: 'keyId',
        policy: {
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
        }
    }, {
        dbname: 'sourceHostnamePolicyDB',
        dbstore: 'sourceHostnamePolicyStore',
        keyPath: 'keyId',
        policy: {
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
        }
    }, {
        dbname: 'sourceHostnamePolicyDB',
        dbstore: 'sourceHostnamePolicyStore',
        keyPath: 'keyId',
        policy: {
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
        }
    }, {
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
    }, {
        dbname: 'sourceHostnamePolicyDB',
        dbstore: 'sourceHostnamePolicyStore',
        keyPath: 'keyId',
        policy: {
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
        }
    }, {
        dbname: 'sourceHostnamePolicyDB',
        dbstore: 'sourceHostnamePolicyStore',
        keyPath: 'keyId',
        policy: {
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
        }
    }, {
        dbname: 'sourceDomainPolicyDB',
        dbstore: 'sourceDomainPolicyStore',
        keyPath: 'keyId',
        policy: {
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
        }
    }, {
        dbname: 'sourceDomainPolicyDB',
        dbstore: 'sourceDomainPolicyStore',
        keyPath: 'keyId',
        policy: {
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
        }
    }, {
        dbname: 'sourceURLPolicyDB',
        dbstore: 'sourceURLPolicyStore',
        keyPath: 'keyId',
        policy: {
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
        }
    }

];

//maintain current policies in hash tables

var in_memory_policies = {};

in_memory_policies["sourceURLPolicyDB"] = {};
in_memory_policies["sourceDomainPolicyDB"] = {};
in_memory_policies["sourceHostnamePolicyDB"] = {};

//Set required indexeddb database and default items in those databases.
indexeddb_setup_async(indexedDB).then(function (res) {
    // console.debug(res);
    return setup_default_policies_async();

}).then(function () {
    console.debug("complete");

    return refresh_inmemory_policy_datastore_async("sourceDomainPolicyDB", "sourceDomainPolicyStore","keyId");
}).then(function () {

    return refresh_inmemory_policy_datastore_async("sourceHostnamePolicyDB", "sourceHostnamePolicyStore","keyId");
}).then(function () {
    return refresh_inmemory_policy_datastore_async("sourceURLPolicyDB", "sourceURLPolicyStore","keyId");
}).then(function () {}).then(function () {
    console.debug("inmemory databases refreshed");
    console.debug(JSON.stringify(in_memory_policies));

    console.debug("1.0.5");

});


// kill external web requests matching certain rules
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest
// attach listener
try {
    browser.webRequest.onBeforeRequest.addListener(
        function (event) {

        // check documentURL if there is a policy for this page

        // then check url to see if it goes outside the allowed range

        var from_url = "";
        try {
            if (typeof event.frameAncestors[0] !== 'undefined') {
                from_url = event.frameAncestors[0].url;
            } else {
                if (typeof event.documentUrl !== 'undefined') {
                    from_url = event.documentUrl;
                } else {
                    // in some cases (links held in local html files) the documentUrl is not set, so use url
                    console.debug("local file source");
                    from_url = event.url;
                }
            }
        } catch (e) {
            from_url = event.documentUrl;
        }
        // check if there is policy for this "from" page

        var applicable_policy = policy_discovery_for_location(from_url);

        //console.debug("from url: " + from_url);
        //console.debug("to url: " + event.url);
        //console.debug("applicable_policy: " + JSON.stringify(applicable_policy));

        if (typeof applicable_policy !== 'undefined') {
            // ok, there is a policy for links on this page
            // apply it
              // console.debug("click event: " + JSON.stringify(event));

            var new_url = apply_policy(event.url, applicable_policy);

            //   console.debug("url: " + new_url);
            //    console.debug("url length: " + new_url.length);

            // if policy outputs no data, allow the traffic

            if (new_url.length > 0) {
                // type different outcomes are relevant here: rewrite the URL or block it. (The policy may also leave the URL unchanged)
                // blocking the URL means prefixing it with the word "disabled".
                // use regexp to identify links that should be blocked

            	// set the new (modified) url
            	var wasChanged = false;
            	if (event.url != new_url){
            		wasChanged = true;
            	}
            	//console.debug("click event: " + JSON.stringify(event));
            	
            	// regexp check if request should be blocked
                var is_blocked = new RegExp("^disable[d]*http[s]*:/[\/]*", 'i');

                //      console.debug(is_blocked.test(new_url));
                if (is_blocked.test(new_url)) {
                    // block the request
                    var blockingResponse = {};
                    blockingResponse.cancel = true;
                    //console.debug("decision: block");
                    //         console.debug(JSON.stringify(blockingResponse));
                    return blockingResponse;
                } else {
                	// no blocking, but shuold there be a redirect ?
                	if(wasChanged){
                		console.debug("Yes, should redirect to " + new_url);
                        var blockingResponse = {"redirectUrl":new_url};
                        blockingResponse.cancel = false;
                        return blockingResponse;
                	}else{
                        var blockingResponse = {};
                        blockingResponse.cancel = false;
                        return blockingResponse;
                	}
                }
            } else {
                // nothing returned, so lets go with default behaviour.
                // For this application (Pagelink-Sanitizer add-on), default behaviour is that if there is any policy for a URL at all,
                // linked from the URL should be blocked unless
                // they point to local sibling domains. example: meil.google.com is a sibling domain of www.google.com. Links from one to the other should be allowed by default.

                // compute the local domain. This means the name one-level above the fully qualified name. F.ex. if the FQDN is news.bbc.co.uk the local domainname is bbc.co.uk
                console.debug("from_url: " + from_url);

                var parent_domain = from_url.replace(/^http[s]*:\/\/[^\.]*\.([^\/]*)\/.*/i, '$1');
                console.debug("parent domain: " + parent_domain);

                // use regexp to identify links that are local
                var test_for_localness = new RegExp("^http[s]*://[^\/]*\." + parent_domain + "[:]*[0-9]*", 'i');
                console.debug(test_for_localness);

                var is_sibling_domain = test_for_localness.test(event.url);
                console.debug("is_sibling_domain: " + is_sibling_domain);
                // if local, then allow this request
                if (is_sibling_domain) {
                    var blockingResponse = {};
                    blockingResponse.cancel = false;
                    console.debug(JSON.stringify(blockingResponse));
                    return blockingResponse;
                } else {
                    // else block it
                    var blockingResponse = {};
                    blockingResponse.cancel = true;
                    console.debug(JSON.stringify(blockingResponse));
                    return blockingResponse;
                }

            }

        } else {
            // no policy, so just carry on
            // console.debug ("steady as you go, there was is policy in place for this one." );
            var blockingResponse = {};
            blockingResponse.cancel = false;
            //console.debug(JSON.stringify(blockingResponse));
            return blockingResponse;

        }

    }, {
        urls: ["<all_urls>"]
    },
        ["blocking"]);
} catch (g) {
    console.error(g);
}

// listener for message sent from the admin page of the plugin
browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.debug("message:" + JSON.stringify(message));
    console.debug("sender:" + JSON.stringify(sender));
    console.debug("sendResponse:" + sendResponse);

    var source_tab_id = sender.tab.id;
    var source_tab_url = sender.url;

    try {
        console.debug("received from page:  message: " + JSON.stringify(message));

        console.debug("request:" + JSON.stringify(message.request));

        // message to request a refresh of policies
        if (message.request.refresh == 'policies') {
            console.debug("refresh policies");
            // re-read in memory policy set from the databases
            refresh_inmemory_policy_datastore_async("sourceDomainPolicyDB", "sourceDomainPolicyStore").then(function () {

                return refresh_inmemory_policy_datastore_async("sourceHostnamePolicyDB", "sourceHostnamePolicyStore");
            }).then(function () {
                return refresh_inmemory_policy_datastore_async("sourceURLPolicyDB", "sourceURLPolicyStore");
            }).then(function (result) {
                sendResponse(result);

            });

        } else if (message.request.policy == 'single_delete') {
            // message to request a deletion from the in-memory policy database

            var delete_details = message.request.delete_details;
            //console.debug(JSON.stringify(delete_details));

            // this change has already been written into the database. Only the in-memory database needs updating
            // console.debug("database:" + update_details.database);
            // console.debug("datastore:" + update_details.datastore);
            console.debug("deleting from in-memory db " + delete_details.database + " keyId:" + delete_details.object_id);
            // console.debug("datastore:" + in_memory_policies[delete_details.database][delete_details.object_id]);

            delete in_memory_policies[delete_details.database][delete_details.object_id];
            //  console.debug("datastore:" + in_memory_policies[delete_details.database][delete_details.object_id]);

        } else if (message.request.policy == 'single_update') {
            // message to request an update to the in-memory policy database

            var update_details = message.request.update_details;
            console.debug(JSON.stringify(update_details));

            // this change has already been written into the database. Only the in-memory database needs updating
            console.debug("saving to in-memory " + update_details.database + " on keyId:" + update_details.object.keyId + " obj:" + JSON.stringify(update_details.object));

            in_memory_policies[update_details.database][update_details.object.keyId] = update_details.object;

        } else if (message.request.sendRule == 'toEditPopup') {
            console.debug("contact edit popup:");

            var page_message = message.message;
            console.debug("page_message:" + page_message);
            // Simple example: Get data from extension's local storage
            // var result = localStorage.getItem('whatever');


            var result = JSON.parse('{"test":"one"}');
            // Reply result to content script
            sendResponse(result);

        } else if (message.request.possible_pagelink_sanitation_job) {

            var page_url = message.request.possible_pagelink_sanitation_job;
            console.debug("possible job for page link sanitation: " + page_url);
            // examine this URL for any applicable policies

            //            policy_discovery_for_location_async(page_url).then(function (res) {
            //              console.debug(res);

            res = policy_discovery_for_location(page_url);

            // if policy found, proceed with sending script back to tab
            if (res) {

                console.debug(JSON.stringify(res));

                //send
                console.debug("### calling ./content_scripts/RewritePageLinks.js on tab_id=" + source_tab_id);

                browser.tabs.executeScript(source_tab_id, {
                    file: "./content_scripts/RewritePageLinks.js",
                    allFrames: true
                }).then(function (result) {
                    console.debug("background.js:onExecuted4: We made it ....");
                    // console.debug("background.js:onExecuted4: result: " + result);
                    // console.debug("backgroupd.js:onExecuted4:selected_text: " +
                    // selected_text);
                    // console.debug("backgroupd.js:onExecuted4:replacement_text: " +
                    // replacement_text);
                    // query for the one active tab
                    return browser.tabs.query({
                        active: true,
                        currentWindow: true
                    });
                }).then(function (tabs) {
                    // send message to the active tab
                    return browser.tabs.sendMessage(source_tab_id, {
                        AcceptedGloveboxSecureKeyOfferToken_replacement: "Glovebox token read.",
                        CiphertextToPlaintext: "Glbx_marker3",
                        remove: "true"
                    });
                }).then(function (res) {
                    // read in the token text
                    console.debug("###### getHTML response " + JSON.stringify(res));
                });

            } else {
                console.debug("no applicable policy");
            }

            // policies are scoped by domain, full qualified domain ( including protocol) and complete URL (except query string)
            //


        }

    } catch (e) {
        console.debug(e);
    }

    try {

        // make call to rule editing popup containing the rule to display in it.


        if (message && message.type == 'page') {
            console.debug("page_message:");
            var page_message = message.message;
            console.debug("page_message:" + page_message);
            // Simple example: Get data from extension's local storage
            // var result = localStorage.getItem('whatever');
            var result = JSON.parse('{"test":"one"}');
            // Reply result to content script
            sendResponse(result);
        }

        if (message && message.request == 'skinny_lookup' && message.linkurl != '') {
            console.debug("look up :" + message.linkurl);
            var true_destination_url = "";
            true_destination_url = skinny_lookup(message.linkurl);
            sendResponse({
                true_destination_url: true_destination_url,
                linkURL: message.linkurl,
                success: "true"
            });
        }
    } catch (e) {
        console.debug(e);
    }
});

    
    // add listener to open the admin page when user clicks on the icon in the
    // toolbar
    browser.browserAction.onClicked.addListener(() => {
        // use this functionality to get a full tabpage
        browser.tabs.create({
            url: "/rule-admin.html"
        });
        // Can replace the above with a direct referal to the html, in the manifest.
        // - but this would not provide a full tab-page
        // "brower_action": {
        // "default_popup": "navigate-collection.html"
    });

function refresh_inmemory_policy_datastore_async(dbname, dbstorename,keyPath) {
    // read out all policies from the policy database and compare the current in-memory has arrays with the just-read data.
    // Add what is missing and remove the surplus.
    return new Promise(
        function (resolve, reject) {
     //   console.debug("#####################################" + dbname);
     //   console.debug("#####################################" + dbstorename);
      //  console.debug("#####################################" + keyPath);

        try{
        dump_db_2_hash_async(dbname, dbstorename).then(function (res) {
            one = res;
            console.debug(JSON.stringify(one));

            // loop through all returned objects and insert them in the hash array
            console.debug(one.length);
            if (one.length > 0){
            console.debug(one[0]);
            console.debug(one[0][keyPath]);
            for (var i = 0; i < one.length; i++) {
                // copy over the whole object, change this later
                //ourceHostnamePolicyDB_inmemory[one[i].keyId] = one[i];
                in_memory_policies[dbname][one[i][keyPath]] = one[i];
            }
            }
            // add functionality for removing any entries no longer present in the database
            resolve(true);
        });
        } catch (e) {
            console.debug(e);
        }
        
    });
}


function dump_db_2_hash_async(dbName, storeName3) {

    return new Promise(
        function (resolve, reject) {
        // access database
        console.debug("-------------------------------------");

        console.debug("dump_db access database: " + dbName);
        var dbRequest = indexedDB.open(dbName);

        //     try {
        dbRequest.onsuccess = function (event3) {
            var database3 = event3.target.result;

            //console.debug("access datastore: " + storeName3);

            var transaction3 = database3.transaction([storeName3]);
            var objectStore3 = transaction3.objectStore(storeName3);

            var allRecords3 = objectStore3.getAll();
            allRecords3.onsuccess = function () {
                console.debug("-------------------------------------");
                console.debug("-------------------------------------");

                const res3 = allRecords3.result;
                console.debug(res3);
                console.debug("## results" + JSON.stringify(res3));
                //listOfKeys = listOfKeys + ',"privateKeys":' + JSON.stringify(res3) + '';
                console.debug("-------------------------------------");
                console.debug("-------------------------------------");

                // get private(and their public component) signing keys
                database3.close();
                resolve(res3);

            };
            database3.close();

        }
        //            dbRequest.close();
        //      } catch (e) {
        //         console.debug(e);
        //         resolve("error");
        //    }
    });
}

/*
 * Crate an instance IndexedDB
 * Takes a JSON structure specifying the configuration
 *
 * {
dbname: "sourceUrlRuleDB",
objectstore: [{
name: "sourceUrlRuleStore",
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
 *
 * */
function create_indexeddb_async(indexedDB, dbconfig) {

    console.debug("# create_indexeddb_async: " + JSON.stringify(dbconfig));

    // To do: add logic so as not to try to create tables already present


    return new Promise(
        function (resolve, reject) {

        console.debug("database config: " + JSON.stringify(dbconfig));
        // console.debug("database name: " + dbconfig.dbname);
        // console.debug("objectstore name: " + dbconfig.objectstore[0].name);
        // console.debug("key: " + dbconfig.objectstore[0].keyPath);
        // console.debug("index: " + JSON.stringify(dbconfig.objectstore[0].index[0].unique));

        let db;

        // ########
        var request7 = indexedDB.open(dbconfig.dbname, 1);
        request7.onupgradeneeded = function (event5) {
            db = event5.target.result;
            db.onerror = function (event4) {};
            // Create an objectStore in this database to keep offers to passout decryption keys in a secure way.
            console.debug("create objectstore " + dbconfig.objectstore[0].name + " in " + dbconfig.dbname + " for secure key offers");
            var objectStore = db.createObjectStore(dbconfig.objectstore[0].name, {
                    keyPath: dbconfig.objectstore[0].keyPath
                });

            console.debug("db create objectstore index " + dbconfig.objectstore[0].index[0].n);

            objectStore.createIndex(dbconfig.objectstore[0].index[0].n, dbconfig.objectstore[0].index[0].o, {
                unique: dbconfig.objectstore[0].index[0].unique
            });
            console.debug("completed");
            resolve(true);
        };
        request7.onerror = function (event1) {
            console.debug("dp open request error 201");
        };
        request7.onsuccess = function (event) {
            console.debug("db open success");
            var db_1 = event.target.result;
            console.debug(db_1);
            db_1.onerror = function (event2) {
                console.debug("db open request error 2");

                console.debug("db create objectstore");

                var objectStore = db_1.createObjectStore(dbconfig.objectstore[0].name, {
                        keyPath: dbconfig.objectstore[0].keyPath
                    });

                console.debug("db create objectstore index " + dbconfig.objectstore[0].index[0].n);

                objectStore.createIndex(dbconfig.objectstore[0].index[0].n, dbconfig.objectstore[0].index[0].o, {
                    unique: dbconfig.objectstore[0].index[0].unique
                });
                console.debug("completed");
                resolve(true);
            };
            db_1.onsuccess = function (event3) {
                console.debug("db open request success 2");
                var objectStore = db_1.createObjectStore(dbconfig.objectstore[0].name, {
                        keyPath: dbconfig.objectstore[0].keyPath
                    });

                console.debug("db create objectstore index " + dbconfig.objectstore[0].index[0].n);

                objectStore.createIndex(dbconfig.objectstore[0].index[0].n, dbconfig.objectstore[0].index[0].o, {
                    unique: dbconfig.objectstore[0].index[0].unique
                });
                console.debug("completed");
                resolve(true);
            };
            console.debug("completed");
            resolve(true);
        };

    });

}




//look into policy database for policy regarding this url
function policy_discovery_for_location(location) {
    // a mere hit on the URL is sufficient
    // console.debug("# policy_discovery_for_location (" + location + ")");

    // use this to lookup any rules that may apply to links found on the
    // page of
    // this url
    var protocolhostnameportpath = "";
    protocolhostnameportpath = location.replace(/^(http[s]*:\/\/)([^\/]*\/)([^\?]*).*/i, '$1$2$3');

    var protocolhostnameport = "";
    protocolhostnameport = location.replace(/^(http[s]*:\/\/)([^\/]*\/)([^\?]*).*/i, '$1$2');

    var domainport = "";
    domainport = location.replace(/^http[s]*:\/\/[^\.]*\.([^\/]*)\/([^\?]*).*/i, '$1');

    //  console.debug("lookup: " + domainport);

    // lookup domain fully qualifies URL (no path) and full URL (no querystring)
    // return true for first "hit"


    try {

        var domain_pol = in_memory_policies.sourceDomainPolicyDB[domainport];

        var hostname_pol = in_memory_policies.sourceHostnamePolicyDB[protocolhostnameport];

        var url_pol = in_memory_policies.sourceURLPolicyDB[protocolhostnameportpath];
        // where any policies returned at all, if so return it(them), otherwise return null
        if (typeof domain_pol !== 'undefined' || typeof hostname_pol !== 'undefined' || typeof url_pol !== 'undefined') {
            //console.debug("return policy");

            var ret = {
                "sourceDomainPolicyDB": domain_pol,
                "sourceHostnamePolicyDB": hostname_pol,
                "sourceURLPolicyDB": url_pol
            };
              // console.debug(ret)
            return ret;

        } else {
            return null;
        }
    } catch (e) {
        console.debug(e);

    }

}



// enfore policy on url
function apply_policy(url, applicable_policy) {
    // console.debug("# apply_policy  to url: " + url);
    // console.debug("# apply_policy  applicable_policy: " + JSON.stringify(applicable_policy));

    var precceding_result = url;
    var new_url = url;
    try {
        var domain_pol = applicable_policy.sourceDomainPolicyDB;
        if (typeof domain_pol !== 'undefined') {
            //  console.debug("carry out rule on: " + new_url);
            //  console.debug(domain_pol);
            new_url = execute_rule(domain_pol, new_url);
        }
        precceding_result = new_url;
    } catch (e) {
        new_url = precceding_result;
    }
    try {

        var hostname_pol = applicable_policy.sourceHostnamePolicyDB;
        if (typeof hostname_pol !== 'undefined') {
            //  console.debug("carry out rule on: " + new_url);
            //  console.debug(hostname_pol);
            new_url = execute_rule(hostname_pol, new_url);
        }
        precceding_result = new_url;

    } catch (e) {
        new_url = precceding_result;

    }

    try {
        var url_pol = applicable_policy.sourceURLPolicyDB;
        if (typeof url_pol !== 'undefined') {
            //   console.debug("carry out rule on: " + new_url);
            //  console.debug(url_pol);
            new_url = execute_rule(url_pol, new_url);
        }

    } catch (e) {
        new_url = precceding_result;

    }
    //console.debug(domain_pol);
    //console.debug(hostname_pol);
    //console.debug(url_pol);

    // console.debug("carry out policy on: " + new_url);


    return new_url;

}




function setup_default_policies_async() {
    console.debug("setup_default_policies_async begin");

    try {

        return new Promise(
            function (resolve, reject) {

            var p = [];

            for (var i = 0; i < default_policies.length; i++) {
                p.push(saveToIndexedIfMissingInDB_async(default_policies[i].dbname, default_policies[i].dbstore, default_policies[i].keyPath, default_policies[i].policy));

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

function destination_rules_enforcement(location, linkurl) {

    /*
     * This is subject to rewriting, for now, accept the parameter for the
     * location of the link to be rewritten, but do not use the value for
     * anything
     */

    console.debug("# destination_rules_enforcement begin");

    var new_url = linkurl;

    return new Promise(
        function (resolve, reject) {
        console.debug("# destination_rules_enforcement begin promise");

        // use this to lookup any rules that may apply to links found on the
        // page of
        // this url
        var protocolhostnameportpath = "";
        protocolhostnameportpath = linkurl.replace(/^(http[s]*:\/\/)([^\/]*\/)([^\?]*).*/i, '$1$2$3');

        var protocolhostnameport = "";
        protocolhostnameport = linkurl.replace(/^(http[s]*:\/\/)([^\/]*\/)([^\?]*).*/i, '$1$2');

        // lookup rules for this location domain ("top"-level example domain.com
        // )
        // ignoring the first word in the fully qualified domain name

        var domainport = "";
        domainport = linkurl.replace(/^http[s]*:\/\/[^\.]*\.([^\/]*)\/([^\?]*).*/i, '$1');

        console.debug("lookup: " + domainport);

        try {

            loadFromIndexedDB_async("destinationDomainPolicyDB", "destinationDomainPolicyStore", domainport).then(function (three) {
                console.debug("########## 0");
                // console.debug(three);

                if (three) {
                    console.debug("carry out rule on: " + new_url);
                    new_url = execute_rule(three, new_url);
                }

                // if anything returned, apply it

                // proceed with looking for more rules scopde for
                // protocolhostnameport

                return loadFromIndexedDB_async("destinationHostnamePolicyDB", "destinationHostnamePolicyStore", protocolhostnameport);
            }).then(function (one) {

                console.debug("########## 1");
                // console.debug(one);
                if (one) {
                    console.debug("carry out rule on: " + new_url);
                    new_url = execute_rule(one, new_url);

                }

                return loadFromIndexedDB_async("destinationURLPolicyDB", "destinationURLPolicyStore", protocolhostnameportpath);
            }).then(function (two) {
                console.debug("########## 2");
                // console.debug(two);
                if (two) {
                    console.debug("carry out rule on: " + new_url);
                    new_url = execute_rule(two, new_url);
                }

                console.debug("# # # #  resolve new_url: " + new_url);
                console.debug("# destination_rules_enforcement promise resolved");

                resolve(new_url);

            });

        } catch (e) {
            console.error(e);

            console.error("# # # # new_url: " + new_url);
            console.error("# destination_rules_enforcement promise resolved");
            resolve(new_url);

        }

    });

}

function execute_rule_set(rule_set, url) {
    // console.debug("execute_rule_set");
    // console.debug(rule_set);
    var new_url = "";
    new_url = url;
    for (let m = 0; m < rule_set.length; m++) {
        new_url = execute_rule_step(rule_set[m], new_url);
    }
    return new_url;
}

function execute_rule_step(rule_step, url) {
    // console.debug("execute_rule_step");
    var new_url = "";
    new_url = url;
    // console.debug("### apply step: " + JSON.stringify(rule_step) + " to " +
    // new_url);

    // syntax is STEP NAME ( PARAMETER VALUE)
    var step_name = "";

    step_name = rule_step.procedure;
    // console.debug("step_name: " + step_name);
    var parameter_value = "";
    try {
        // consider only cases with at most a single parameter
        parameter_value = rule_step.parameters[0].value;

    } catch (e) {
        console.error(e);
    }

    //  console.debug("parameter_value: " + parameter_value);
    switch (step_name) {
    case 'regexp':
        try {
            // make allowances for g and i settings
            // Parse parameter which follows the sed-syntax
            // This means that the second character (first after "s") is the delimiter
            var delimiter = "";
            delimiter = parameter_value.replace(/^s(.).*/i, '$1');
            //console.debug("delimiter " + delimiter);
            var flags_ext = new RegExp("[s]*" + delimiter + "[^" + delimiter + "]*" + delimiter + "[^" + delimiter + "]*" + delimiter + "(.*)$");
            //console.debug("flags_ext: " + flags_ext);
            var flags = "";
            flags = parameter_value.replace(flags_ext, '$1').replace(/ /g, '');
             //console.debug("flags: " + flags);
            var pattern_ext = new RegExp("[s]*" + delimiter + "([^" + delimiter + "]*)" + delimiter + ".*$");
             //console.debug("pattern_ext: " + pattern_ext);
            var pattern = "";
            pattern = parameter_value.replace(pattern_ext, '$1');
             //console.debug("pattern: " + pattern);
            var val_ext = new RegExp(".*" + delimiter + "([^" + delimiter + "]*)" + delimiter + "[ gi]*$");
            var val = "";
            val = parameter_value.replace(val_ext, '$1');
             //console.debug("val_ext: " + val_ext)
             //console.debug("return val: " + val)
             //console.debug(new RegExp(pattern, flags));
             //console.debug("new_url: " + new_url);
            new_url = new_url.replace(new RegExp(pattern, flags), val);
            //console.debug("new_url: " + new_url);
            
        } catch (e) {
            console.debug(e);
        }
        break;
    case 'qs_param':
        // console.debug(new_url);
        // console.debug("get query string parameter named: " + parameter_value);
        var u = "";
        // remove everything infront of and behind the parameter
        var reg_exp2 = new RegExp(".*[?&]" + parameter_value + "=([^&]*).*");
        // console.debug(reg_exp2);
        u = new_url.replace(reg_exp2, '$1');
        // console.debug(u);
        // remove everything infront of the parameter
        var reg_exp1 = new RegExp(".*[\?&]" + parameter_value + "=([^&]*)$");
        // console.debug(reg_exp1);
        // console.debug(u);
        // u = url.replace(reg_exp1, '$1' );
        // new_url = url_rewrite_step_qs_param(new_url, parameter_value);
        new_url = u;
        break;
    case 'uri_decode':
        try {
            // for some reason decodeURI does not work
            new_url = new_url.replace(/%40/g, '@').replace(/%3A/g, ':').replace(/%3B/g, ';').replace(/%3C/g, '<').replace(/%3D/g, '=').replace(/%3E/g, '>').replace(/%3F/g, '?').replace(/%20/g, ' ').replace(/%21/g, '!').replace(/%22/g, '"').replace(/%23/g, '#').replace(/%25/g, '%').replace(/%26/g, '&').replace(/%28/g, '(').replace(/%29/g, ')').replace(/%2A/g, '*').replace(/%2B/g, '+').replace(/%2C/g, ',').replace(/%2D/g, '-').replace(/%2E/g, '.').replace(/%2F/g, '/').replace(/%5B/g, '[').replace(/%5C/g, '\\').replace(/%5D/g, ']').replace(/%5E/g, '^').replace(/%5F/g, '_').replace(/%60/g, "'").replace(/%25/g, '%');
        } catch (e) { // catches a malformed URI
            console.error(e);
        }
        break;
    case 'base64_decode':
        console.debug(new_url);
        new_url = atob(new_url);
        break;
    case 'JSON_path':
        console.debug(new_url);
        console.debug(JSON.parse(new_url)[parameter_value]);

        new_url = JSON.parse(new_url)[parameter_value];
        break;
    case 'replace_with':
        console.debug(new_url);
        new_url = parameter_value;
        break;
    case 'skinny_lookup':
        // lookup the URL and if it returns a HTTP 403 redirect and a Location
        // header, insert that.
        // Itterate up to three times incase on redirect leads to another.
        console.debug("lookup the URL without revealing anything");
        // new_url = parameter_value;
        break;
    default:
    }

    return new_url;

}

function loadFromIndexedDB_async(dbName, storeName, id) {
    //  console.debug("loadFromIndexedDB_async:dbname: " + dbName);
    //  console.debug("loadFromIndexedDB_async:storeName: " + storeName);
    //  console.debug("loadFromIndexedDB_async:id: " + id);

    return new Promise(
        function (resolve, reject) {
        var dbRequest = indexedDB.open(dbName);

        dbRequest.onerror = function (event) {
            reject(Error("Error text"));
        };

        dbRequest.onupgradeneeded = function (event) {
            // Objectstore does not exist. Nothing to load
            event.target.transaction.abort();
            //reject(Error('Not found'));
        };

        dbRequest.onsuccess = function (event) {
            // console.debug("loadFromIndexedDB:onsuccess ");

            var database = event.target.result;
            var transaction = database.transaction([storeName]);
            // console.debug("loadFromIndexedDB:transaction: " +
            // JSON.stringify(transaction));
            var objectStore = transaction.objectStore(storeName);
            // console.debug("loadFromIndexedDB:objectStore: " +
            // JSON.stringify(objectStore));
            var objectRequest = objectStore.get(id);

            // console.debug("loadFromIndexedDB:objectRequest: " +
            // JSON.stringify(objectRequest));


            try {

                objectRequest.onerror = function (event) {
                    // reject(Error('Error text'));
                    reject('Error text');
                };

                objectRequest.onsuccess = function (event) {
                    if (objectRequest.result) {
                        // console.debug("loadFromIndexedDB:result " +
                        // JSON.stringify(objectRequest.result));

                        resolve(objectRequest.result);
                    } else {
                        // reject(Error('object not found'));
                        resolve(null);

                    }
                };

            } catch (error) {
                console.error(error);

            }

        };
    });
}

function execute_rule(rule, url) {
    var new_url = "";
    new_url = url;
    try {
        // console.debug("execute_rule url: " + url);
        // console.debug("execute_rule rule: " + JSON.stringify(rule));
        // console.debug("execute_rule: " + JSON.stringify(rule.steps));
        // console.debug("execute_rule: " + rule.steps.length);
        // loop through the steps contained in this rule
        // step-order is essential
        // the output of one is the input of the next

        // console.debug(rule.steps.length);
        if (rule.steps.length > 0) {

            for (var i = 0; i < rule.steps.length; i++) {
                // console.debug("### apply step: " + JSON.stringify(rule.steps[i]) + " to " +
                // new_url);
                new_url = execute_rule_step(rule.steps[i], new_url);
            }
        } else {
            console.debug("no step defined - all rules should have at least one step so output a blank - this error scenario is handle above");
            new_url = "";

        }
        // console.debug("### apply step: " + rule + " to " + new_url);
    } catch (e) {
        console.error("no step defined - all rules should have at least one step so output a blank - this error scenario is handle above");
        new_url = "";
    }
    return new_url;
}



function saveToIndexedIfMissingInDB_async(dbName, storeName, keyId, object) {
/*save the object to the indexeddb instance but do not overwrite if it (the key) is there already.
 * */
	
	   console.debug("saveToIndexedIfMissingInDB_async:dbname " + dbName);
	    console.debug("saveToIndexedIfMissingInDB_async:objectstorename " + storeName);
	    console.debug("saveToIndexedIfMissingInDB_async:keyId " + keyId);
	    console.debug("saveToIndexedIfMissingInDB_async:object " + JSON.stringify(object));

	
	// first, check if it is there already
	
	    return new Promise(
	            function (resolve, reject) {

	            	
	            	loadFromIndexedDB_async(dbName, storeName, object[keyId]).then(function(res){
	            		console.debug("###########3#");
	            		console.debug("###########3#");
	            		console.debug(res);
	            		// check results, if any
	            		if (res){
	            			console.debug("found, exit here");
		            		resolve(true);
	            		}else{
	            			console.debug("not found, so save");
	            			
	            			saveToIndexedDB_async(dbName, storeName, keyId, object).then(function(res){
	            				resolve(true);
	            				});
	            			
	            		}
	            		
	            	});
	    
	            });
	    
}


function saveToIndexedDB_async(dbName, storeName, keyId, object) {

    console.debug("saveToIndexedDB_async:dbname " + dbName);
    console.debug("saveToIndexedDB_async:objectstorename " + storeName);
    console.debug("saveToIndexedDB_async:keyId " + keyId);
    console.debug("saveToIndexedDB_async:object " + JSON.stringify(object));

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
            console.error(error);

        }

        dbRequest.onerror = function (event) {
            console.debug("saveToIndexedDB:error.open:db " + dbName);
            reject(Error("IndexedDB database error"));
        };

        dbRequest.onupgradeneeded = function (event) {
            console.debug("saveToIndexedDB: 21");
            var database = event.target.result;
            console.debug("saveToIndexedDB:db create obj store " + storeName);
            var objectStore = database.createObjectStore(storeName, {
                    keyId: keyId
                });
        };

        try {

            dbRequest.onsuccess = function (event) {
                var database = event.target.result;
                var transaction = database.transaction([storeName], 'readwrite');
                var objectStore = transaction.objectStore(storeName);
                console.debug("saveToIndexedDB:objectStore put: " + JSON.stringify(object));

                var objectRequest = objectStore.put(object); // Overwrite if
                // already
                // exists

                //  console.debug("saveToIndexedDB:objectRequest: " + JSON.stringify(objectRequest));

                objectRequest.onerror = function (event) {
                    console.debug("saveToIndexedDB:error: " + storeName);

                    reject(Error('Error text'));
                };

                objectRequest.onsuccess = function (event) {
                    console.debug("saveToIndexedDB:success: " + storeName);
                    resolve('Data saved OK');
                };
            };

        } catch (error) {
            console.error(error);

        }

    });
}
