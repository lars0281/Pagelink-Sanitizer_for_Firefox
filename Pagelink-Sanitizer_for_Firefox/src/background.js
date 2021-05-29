
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

// context menu related


/*
 * to add context menu item for analysing links Added in v 1.0
 */

browser.contextMenus.create({
    id: "glovebox-link-reveal",
    title: "reveal the true endpoint of this link",
    contexts: ["link"]
});

indexedDB = window.indexedDB || window.webkitIndexedDB ||
    window.mozIndexedDB || window.msIndexedDB;

if (!window.indexedDB) {
    console.debug("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
} else {
    //    console.debug("1.1.0");
}

// set a default processing steps to be use in cases where a policy exists but contains no valid processing steps
var default_steps = [{
        "procedure": "regexp",
        "parameters": [{
                "value": "sD^(http)Ddisabled$1Dg",
                "notes": "prefix the protocol with the word disbaled"
            }
        ],
        "notes": "disable fully qualified URLs pointing to non-local domains"
    },{
        "procedure": "regexp",
        "parameters": [{
                "value": "sD^(http)Ddisabled$1Dg",
                "notes": "prefix the protocol with the word disbaled"
            }
        ],
        "notes": "disable fully qualified URLs pointing to non-local domains"
    }]

//maintain current policies in hash tables

var in_memory_policies = {};

in_memory_policies["sourceURLPolicyDB"] = {};
in_memory_policies["sourceDomainPolicyDB"] = {};
in_memory_policies["sourceHostnamePolicyDB"] = {};

//Set required indexeddb database and default items in those databases.
indexeddb_setup_async(indexedDB).then(function (res) {
    console.debug(res);
    console.debug("1.0.1");
    return generate_default_link_rules_async();

}).then(function (res) {
    console.debug(res);
    console.debug("1.0.2");
    return generate_default_link_rules_async();
}).catch(function (f) {
    console.debug(f);
    console.debug("1.0.3");
    return generate_default_link_rules_async();
}).then(function () {
    console.debug("complete");

    console.debug("1.0.4");

    return refresh_inmemory_policy_datastore_async("sourceDomainPolicyDB", "sourceDomainPolicyStore");
}).then(function () {

    return refresh_inmemory_policy_datastore_async("sourceHostnamePolicyDB", "sourceHostnamePolicyStore");
}).then(function () {
    return refresh_inmemory_policy_datastore_async("sourceURLPolicyDB", "sourceURLPolicyStore");
}).then(function () {}).then(function () {
    console.debug("inmemory databases refreshed");
    console.debug(JSON.stringify(in_memory_policies));

    console.debug("1.0.5");

    // kill external web requests matching certain rules
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest
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
                	 }else{
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

            //console.debug("from_url: " + from_url);
            //console.debug("applicable_policy: " + JSON.stringify(applicable_policy));

            if (typeof applicable_policy !== 'undefined') {
                // ok, there is a policy for links on this page
                // apply it
             //   console.debug("click event: " + JSON.stringify(event));
                
                var new_url = apply_policy(event.url, applicable_policy);

             //   console.debug("url: " + new_url);
            //    console.debug("url length: " + new_url.length);

                // if policy outputs no data, allow the traffic
                
                if (new_url.length > 0){
                    // type different outcomes are relevant here: rewrite the URL or block it. (The policy may also leave the URL unchanged)
                    // blocking the URL means prefixing it with the word "disabled".
                    // use regexp to identify links that should be blocked
                    var is_blocked = new RegExp("^disable[d]*http[s]*:/[\/]*", 'i');

              //      console.debug(is_blocked.test(new_url));
                    if (is_blocked.test(new_url)) {
                    	// block the request
                        var blockingResponse = {};
                        blockingResponse.cancel = true;
               //         console.debug(JSON.stringify(blockingResponse));
                        return blockingResponse;
                    } else {
                        var blockingResponse = {};
                        blockingResponse.cancel = false;
                 //       console.debug(JSON.stringify(blockingResponse));
                        return blockingResponse;
                    }
                }else{
                	// nothing returned, so lets go with default behaviour.
                    // For this application (Pagelink-Sanitizer add-on), default behaviour is that if there is any policy for a URL at all, 
                	// linked from the URL should be blocked unless 
                	// they point to local sibling domains. example: meil.google.com is a sibling domain of www.google.com. Links from one to the other should be allowed by default. 

                    // compute the local domain. This means the name one-level above the fully qualified name. F.ex. if the FQDN is news.bbc.co.uk the local domainname is bbc.co.uk
                	 console.debug("from_url: " + from_url);
                    
                	var parent_domain = from_url.replace(/^http[s]*:\/\/[^\.]*\.([^\/]*)\/.*/i, '$1');
                    console.debug("parent domain: " + parent_domain );

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
            console.debug("received from page:  message: " + JSON.stringify(message) );

            console.debug("request:" + JSON.stringify(message.request));


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

    let pendingCollectedURLs = [];

    browser.contextMenus.onClicked.addListener((info, tab) => {
        console.debug("background.js: browser.contextMenus.onClicked.addListener");
        console.debug("background.js: browser.contextMenus.onClicked.addListener:info:" + JSON.stringify(info));
        console.debug("background.js: browser.contextMenus.onClicked.addListener:tab:" + JSON.stringify(tab));

        /*
         * When the user has selected from the context meny to revel the true end
         * point of a url
         *
         */
        if (info.menuItemId == "glovebox-link-reveal") {
            console.debug("glovebox-link-reveal");
            // console.debug(info);
            // console.debug(tab);
            reveal_true_url_endpoint(info, tab);

        } else if (info.menuItemId == "selected-text-lookup") {
            console.debug("selected-text-lookup");
            // console.debug(info);
            // console.debug(tab);
            selected_text_lookup(info, tab);

        }

        console.debug("#### request completed");
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

});

function refresh_inmemory_policy_datastore_async(dbname, dbstorename) {

    // read out all policies from the policy database and compare the current in-memory has arrays with the just-read data.
    // Add what is missing and remove the surplus.
    return new Promise(
        function (resolve, reject) {
        console.debug("#####################################");
        console.debug("#####################################");
        console.debug("#####################################");

        dump_db_2_hash_async(dbname, dbstorename).then(function (res) {
            one = res;
            console.debug(JSON.stringify(one));

            // loop through all returned objects and insert them in the hash array
            console.debug(one.length);
            console.debug(one[0]);
            console.debug(one[0].keyId);
            for (var i = 0; i < one.length; i++) {
                // copy over the whole object, change this later
                //ourceHostnamePolicyDB_inmemory[one[i].keyId] = one[i];
                in_memory_policies[dbname][one[i].keyId] = one[i];

            }

            // add functionality for removign any entires no longer present in the database

            resolve(true);
        });

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

function create_indexeddb_async(indexedDB, dbconfig) {

    console.debug("database config: " + JSON.stringify(dbconfig));

    // To do: add logic so as not to try to create tables already present


    return new Promise(
        function (resolve, reject) {

        console.debug("database config: " + JSON.stringify(dbconfig));
        console.debug("database name: " + dbconfig.dbname);
        console.debug("objectstore name: " + dbconfig.objectstore[0].name);
        console.debug("key: " + dbconfig.objectstore[0].keyPath);
        console.debug("index: " + JSON.stringify(dbconfig.objectstore[0].index[0].unique));

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

function rules_enforcement(sourcePageURL, url) {

    // console.debug("# rules_enforcement begin");
    // console.debug("sourcePageURL: " + sourcePageURL);
    // console.debug("url: " + url);

    // apply rules to generate new URL. The rules are a collection of
    // rewrite statements applied to the submitted URL.
    // The rules are scoped in two ways: by source/destination and complete URL
    // (protocol fully-qualified domain port path), full domain (protocol
    // fully-qualified domain port ) and domain ( domain port )
    // The rewrite rules are applied in sequentially.

    // The source rules (if any) are applied first.

    // Then the destination rules are applied. And on top of any changes made
    // previosuly.

    // Two URLs are submitted: the URL of the page where the link is found, and
    // the link itself.


    var new_url = url;

    return new Promise(
        function (resolve, reject) {

        console.debug("# rules_enforcement begin promise");

        // start with source-based rules.
        // these are rules based on the the url of the "page" where the links are
        // located.
        console.debug("source based rewriting");
        // new_url = circumstantial_rules_enforcement(window.location.href,
        // new_url,source_url_rules,source_hostname_rules,source_domain_rules);
        // new_url = source_rules_enforcement(sourcePageURL, new_url,
        // source_url_rules,
        // source_hostname_rules, source_domain_rules);

        source_rules_enforcement(sourcePageURL, new_url).then(function (two) {
            new_url = two;
            console.debug(new_url);
            // then do destination-based rules
            // note that this is in addition to any changes made above.
            return destination_rules_enforcement(new_url, new_url);
        }).then(function (n) {
            new_url = n;

            console.debug(new_url);

            console.debug("# rules_enforcement promise resolved");

            resolve(new_url);
        });
    });

}

//look into policy database for policy regarding this url
function policy_discovery_for_location(location) {
    // a mere hit on the URL is sufficient
    //  console.debug("# source_rules_enforcement begin promise");

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
            //console.debug(ret)
            return ret;

        } else {
            return null;
        }
    } catch (e) {
        console.debug(e);

    }

}

// look into policy database for policy regarding this url
function policy_discovery_for_location_async(location) {
    // a mere hit on the URL is sufficient

    return new Promise(
        function (resolve, reject) {
        console.debug("# source_rules_enforcement begin promise");

        // use this to lookup any rules that may apply to links found on the
        // page of
        // this url
        var protocolhostnameportpath = "";
        protocolhostnameportpath = location.replace(/^(http[s]*:\/\/)([^\/]*\/)([^\?]*).*/i, '$1$2$3');

        var protocolhostnameport = "";
        protocolhostnameport = location.replace(/^(http[s]*:\/\/)([^\/]*\/)([^\?]*).*/i, '$1$2');

        // lookup rules for this location domain ("top"-level example domain.com
        // )
        // ignoring the first word in the fully qualified domain name

        var domainport = "";
        domainport = location.replace(/^http[s]*:\/\/[^\.]*\.([^\/]*)\/([^\?]*).*/i, '$1');

        // sourceDomainRuleStore in sourceDomainRuleDB
        // sourceHostnameRuleStore in sourceHostnameRuleDB
        // create objectstore sourceURLRuleStore in sourceURLRuleDB");
        console.debug("lookup: " + domainport);

        // lookup domain fully qualifies URL (no path) and full URL (no querystring)
        // return true for first "hit"

        try {

            var domain_pol = in_memory_policies.sourceDomainPolicyDB[domainport];

            var hostname_pol = in_memory_policies.sourceHostnamePolicyDB[protocolhostnameport];

            var url_pol = in_memory_policies.sourceURLPolicyDB[protocolhostnameportpath];

            console.debug(domain_pol);
            console.debug(hostname_pol);
            console.debug(url_pol);

            loadFromIndexedDB_async("sourceDomainPolicyDB", "sourceDomainPolicyStore", domainport).then(function (three) {
                console.debug("########## 0");
                // console.debug(three);

                if (three) {
                    console.debug(three);
                    // new_url = execute_rule(three, new_url);
                    // there was a policy for this domain, terminate policy discovery here
                    resolve(true);
                    return false;
                } else {
                    console.debug("no hit on domain");
                    // proceed with looking for more rules scopde for
                    // protocolhostnameport

                    return loadFromIndexedDB_async("sourceHostnamePolicyDB", "sourceHostnamePolicyStore", protocolhostnameport);

                }

                // if anything returned, apply it

            }).then(function (one) {

                console.debug("########## 1");
                console.debug(one);
                if (one) {
                    console.debug("carry out rule on: ");
                    // there was a policy for this hostname, terminate policy discovery here
                    resolve(true);
                    // new_url = execute_rule(one, new_url);
                } else {
                    console.debug("no hit on hostname");
                    return loadFromIndexedDB_async("sourceURLPolicyDB", "sourceURLPolicyStore", protocolhostnameportpath);

                }

            }).then(function (two) {
                console.debug("########## 2");
                // console.debug(two);
                if (two) {
                    console.debug("carry out rule on: ");
                    // there was a policy for this url, terminate policy discovery here
                    resolve(true);

                    //  new_url = execute_rule(two, new_url);
                } else {
                    console.debug("no hit in url");

                }

                // no policy found
                resolve(false);

            });

        } catch (e) {
            console.debug(e);
            // return true as defaul (err on the side of assuming policy - revisit this later
            resolve(false);

        }

    });

}

// enfore policy on url
function apply_policy(url, applicable_policy) {
    console.debug(url);

    var new_url = url;
    var domain_pol = applicable_policy.sourceDomainPolicyDB;

    var hostname_pol = applicable_policy.sourceHostnamePolicyDB;

    var url_pol = applicable_policy.sourceURLPolicyDB;

    //console.debug(domain_pol);
    //console.debug(hostname_pol);
    //console.debug(url_pol);

   // console.debug("carry out policy on: " + new_url);
    if (typeof domain_pol !== 'undefined') {
      //  console.debug("carry out rule on: " + new_url);
      //  console.debug(domain_pol);
        new_url = execute_rule(domain_pol, new_url);
    }

    if (typeof hostname_pol !== 'undefined') {
      //  console.debug("carry out rule on: " + new_url);
      //  console.debug(hostname_pol);
        new_url = execute_rule(hostname_pol, new_url);
    }
    if (typeof url_pol !== 'undefined') {
     //   console.debug("carry out rule on: " + new_url);
      //  console.debug(url_pol);
        new_url = execute_rule(url_pol, new_url);
    }

    return new_url;

}

// enforce rules that pertain to links found on the specified address.
function source_rules_enforcement(location, linkurl) {

    //console.debug("# source_rules_enforcement begin");

    var new_url = linkurl;

    return new Promise(
        function (resolve, reject) {
      //  console.debug("# source_rules_enforcement begin promise");

        // use this to lookup any rules that may apply to links found on the
        // page of
        // this url
        var protocolhostnameportpath = "";
        protocolhostnameportpath = location.replace(/^(http[s]*:\/\/)([^\/]*\/)([^\?]*).*/i, '$1$2$3');

        var protocolhostnameport = "";
        protocolhostnameport = location.replace(/^(http[s]*:\/\/)([^\/]*\/)([^\?]*).*/i, '$1$2');

        // lookup rules for this location domain ("top"-level example domain.com
        // )
        // ignoring the first word in the fully qualified domain name

        var domainport = "";
        domainport = location.replace(/^http[s]*:\/\/[^\.]*\.([^\/]*)\/([^\?]*).*/i, '$1');

        // sourceDomainRuleStore in sourceDomainRuleDB
        // sourceHostnameRuleStore in sourceHostnameRuleDB
        // create objectstore sourceURLRuleStore in sourceURLRuleDB");
        console.debug("lookup: " + domainport);

        try {

            var domain_pol = in_memory_policies.sourceDomainPolicyDB[domainport];

            var hostname_pol = in_memory_policies.sourceHostnamePolicyDB[protocolhostnameport];

            var url_pol = in_memory_policies.sourceURLPolicyDB[protocolhostnameportpath];

            console.debug(domain_pol);
            console.debug(hostname_pol);
            console.debug(url_pol);

            loadFromIndexedDB_async("sourceDomainPolicyDB", "sourceDomainPolicyStore", domainport).then(function (three) {
        //        console.debug("########## 0");
                // console.debug(three);

                if (three) {
                    console.debug("carry out rule on: " + new_url);
                    new_url = execute_rule(three, new_url);
                }

                // if anything returned, apply it

                // proceed with looking for more rules scopde for
                // protocolhostnameport

                return loadFromIndexedDB_async("sourceHostnamePolicyDB", "sourceHostnamePolicyStore", protocolhostnameport);
            }).then(function (one) {

                console.debug("########## 1");
                // console.debug(one);
                if (one) {
                    console.debug("carry out rule on: " + new_url);
                    new_url = execute_rule(one, new_url);

                }

                return loadFromIndexedDB_async("sourceURLPolicyDB", "sourceURLPolicyStore", protocolhostnameportpath);
            }).then(function (two) {
                console.debug("########## 2");
                // console.debug(two);
                if (two) {
                    console.debug("carry out rule on: " + new_url);
                    new_url = execute_rule(two, new_url);
                }

                console.debug("# # # #  resolve new_url: " + new_url);
                console.debug("# source_rules_enforcement promise resolved");

                resolve(new_url);

            });

        } catch (e) {
            console.debug(e);

            console.debug("# # # # new_url: " + new_url);
            console.debug("# source_rules_enforcement promise resolved");
            resolve(new_url);

        }

    });

}

function generate_default_link_rules_async() {

    console.debug("## generate_default_link_rules begin");

    // Add rule objects to database
    // - add logic to verify if equivalent rules are already preent but slightly different so as not to overwrite any changes made

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
                                    notes: "prefix the protocol with the word disbaled"
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
                                    notes: "prefix the protocol with the word disbaled"
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
                                    notes: "prefix the protocol with the word disbaled"
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
                                    notes: "prefix the protocol with the word disbaled"
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
                                    notes: "prefix the protocol with the word disbaled"
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
                                    notes: "prefix the protocol with the word disbaled"
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
                                    notes: "prefix the protocol with the word disbaled"
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
                                    notes: "prefix the protocol with the word disbaled"
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
                                    notes: "prefix the protocol with the word disbaled"
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
                console.debug("create_indexeddb_async (" + JSON.stringify(index_db_config[i]) + ")");
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
            // This means that the second character is the delimiter
            var delimiter = "";
            delimiter = parameter_value.replace(/^s(.).*/i, '$1');
            var flags_ext = new RegExp("[s]*" + delimiter + "[^" + delimiter + "]*" + delimiter + "[^" + delimiter + "]*" + delimiter + "(.*)$");
            // console.debug("flags_ext: " + flags_ext);
            var flags = "";
            flags = parameter_value.replace(flags_ext, '$1').replace(/ /g, '');
            // console.debug("flags: " + flags);
            var pattern_ext = new RegExp("[s]*" + delimiter + "([^" + delimiter + "]*)" + delimiter + ".*$");
            // console.debug("pattern_ext: " + pattern_ext);
            var pattern = "";
            pattern = parameter_value.replace(pattern_ext, '$1');
            // console.debug("pattern: " + pattern);
            var val_ext = new RegExp(".*" + delimiter + "([^" + delimiter + "]*)" + delimiter + "[ gi]*$");
            var val = "";
            val = parameter_value.replace(val_ext, '$1');
            // console.debug("val_ext: " + val_ext)
            // console.debug("return val: " + val)
            // console.debug(new RegExp(pattern, flags));
            new_url = new_url.replace(new RegExp(pattern, flags), val);
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
