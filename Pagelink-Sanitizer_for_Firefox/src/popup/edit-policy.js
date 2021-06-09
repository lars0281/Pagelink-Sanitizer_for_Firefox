

console.debug("edit-rule.js running");

// attach event listeners


// read the rule to be edited from storage
//console.debug("read back: " + browser.storage.sync.get(['editThisObject', 'indexedDbName', 'objectStoreName'], function (data) {
//       console.debug(data);
//    }));

browser.storage.sync.get(['object_id', 'indexedDbName', 'objectStoreName'], function (data) {
    //browser.storage.sync.get(['editThisObject', 'indexedDbName', 'objectStoreName']).then(function (data) {

    // console.debug(data);
    console.debug(JSON.stringify(data));
    // step through the rule object and populate the tables

    var object_id = data.object_id;

    var indexedDbName = data.indexedDbName;
    var objectStoreName = data.objectStoreName;

    console.debug(object_id);
    console.debug(indexedDbName);
    console.debug(objectStoreName);

    loadFromIndexedDB_async(indexedDbName, objectStoreName, object_id).then(function (obj) {
        editThisObject = obj;

        // make updates to the html to reflect the information in the policy and what
        // kind of policy it is.
        // The html should be disturbed as little as possible since the "html-niceness"should
        // properly be created by a separate editor - as far as possible.

        document.querySelectorAll('table.single_rule_table[indexedDbName="indexedDbName"]')[0].setAttribute("indexedDbName",indexedDbName);
        document.querySelectorAll('table.single_rule_table[objectStoreName="objectStoreName"]')[0].setAttribute("objectStoreName", objectStoreName);
        

//        document.querySelectorAll("table.single_rule_table tr td[j_name=scope]")[0].textContent = editThisObject.scope;

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

    

        // set up the table with steps
        // pic the first line in the table of steps
        var step_template = document.querySelectorAll("tr.step_row")[0];

        console.debug(step_template);

        // loop through the steps in the rule and clone the step node as required.

        console.debug(editThisObject.steps);
        console.debug(editThisObject.steps.length);
        console.debug(JSON.stringify(editThisObject.steps));

        // The template page has one table row for description of the step, use this
        // row first

        var last_row = document.querySelectorAll("tr.step_row")[0];
        // last_row refers to the first row at this point
        attachButtonEventlisteners(last_row);

        // all rules must have at least one step
        var s = 0;
        last_row.querySelector("td.rank").textContent = (s + 1);
        
        var first_step = editThisObject.steps[0];
        last_row.querySelector("td[j_name=procedure]").textContent = first_step.procedure;
        // loop through parameters 
        if (first_step.parameters.length > 0) {
            var p = 0;
            
            console.debug("parameter: " + JSON.stringify(first_step.parameters));
            console.debug(new_row);

            var last_param_row = last_row.querySelectorAll("tr.parameter")[0];
            console.debug(last_param_row);
            last_param_row.querySelector("td[j_name=value]").textContent = first_step.parameters[p].value;
            last_param_row.querySelector("td[j_name=notes]").textContent = first_step.parameters[p].notes;

            // are there more parameters?
            p = 1;
            while (p < first_step.parameters.length && p < 12) {
                // add another parameter
                // ok, need another row so clone the last row (and edit it)
                var new_param_row = last_param_row.cloneNode(true);
                new_param_row.querySelector("td[j_name=value]").textContent = first_step.parameters[p].value;
                // parameter notes
                new_param_row.querySelector("td[j_name=notes]").textContent = first_step.parameters[p].notes;

                last_param_row.insertAdjacentElement('afterend', new_param_row);

                // make the new parameter row the last row
                last_param_row = new_param_row;
                p++;
            }
        }
        // step notes
        last_row.querySelector("tr.step_row > td[j_name=notes]").textContent = first_step.notes;

        // are there additional steps ?
        s = 1;
        // also impose a maximum limit (50)
        while (s < editThisObject.steps.length && s < 50) {
            console.debug("step number: " + (s + 1));

            console.debug(editThisObject.steps[s]);
            console.debug(JSON.stringify(editThisObject.steps[s]));

            // ok, need another row
            var new_row = create_step_row();

            console.debug(new_row);

            new_row.querySelector("td.rank").textContent = (s + 1);
            new_row.querySelector("td[j_name=procedure]").textContent = editThisObject.steps[s].procedure;

            // Loop through parameters - assume just one parameter for now
            // setup a table for the parameter and notes
            // A parameter is not required, but rather than leaving the table empty,
            // set "N/A".
            console.debug(editThisObject.steps[s].parameters);
            console.debug(JSON.stringify(editThisObject.steps[s].parameters));
            console.debug("parameter count: " + editThisObject.steps[s].parameters.length);
            try {
                if (editThisObject.steps[s].parameters.length > 0) {
                    var p = 0;
                    console.debug("parameter: " + JSON.stringify(editThisObject.steps[s].parameters));
                    console.debug(new_row);
                    console.debug(new_row);
                    var last_param_row = new_row.querySelectorAll("tr.parameter")[0];
                    console.debug(last_param_row);
                    last_param_row.querySelector("td[j_name=value]").textContent = editThisObject.steps[s].parameters[p].value;
                    last_param_row.querySelector("td[j_name=notes]").textContent = editThisObject.steps[s].parameters[p].notes;

                    // are there more parameters?
                    p = 1;
                    while (p < editThisObject.steps[s].parameters.length && p < 12) {
                        // add another parameter
                        // ok, need another row so clone the last row (and edit it)
                        var new_param_row = last_param_row.cloneNode(true);
                        new_param_row.querySelector("td[j_name=value]").textContent = editThisObject.steps[s].parameters[p].value;
                        new_param_row.querySelector("td[j_name=notes]").textContent = editThisObject.steps[s].parameters[p].notes;

                        last_param_row.insertAdjacentElement('afterend', new_param_row);

                        // make the new parameter row the last row
                        last_param_row = new_param_row;
                        p++;
                    }
                } else {
                    console.debug("no parameters..");
                }
            } catch (f) {
                console.error(f);
            }
            // set the notes field for the whole step row
            new_row.querySelector("tr.step_row>td[j_name=notes]").textContent = editThisObject.steps[s].notes;

            console.debug(new_row);
            // append this new row and make the inserted row the new last row
            // last_row = last_row.parentNode.insertBefore( p3, last_row);
            last_row.insertAdjacentElement('afterend', new_row);

            // make the new row the last row
            last_row = new_row;
            s++;
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

function attachButtonEventlisteners(node) {

    console.debug("#start attachButtonEventlisteners");

    // for step edit button(s)
    var htmlElements = node.getElementsByClassName("editstep_button");
    // loop through all edit steps and their buttons to attach event
    // listener to each one
    for (var i = 0; i < htmlElements.length; i++) {

        htmlElements[i].addEventListener('click',
            function (event) {
            editStep(event);
        });
    }

    // for step delete button(s)
    var htmlElements2 = node.getElementsByClassName("deletestep_button");
    // loop through all edit steps and their buttons to attach event
    // listener to each one
    for (var i = 0; i < htmlElements2.length; i++) {
        htmlElements2[i].addEventListener('click',
            function (event) {
            deleteStep(event);
        });
    }

    // for step up button(s)
    var htmlElements3 = node.getElementsByClassName("upstep_button");
    // loop through all edit steps and their buttons to attach event
    // listener to each one
    for (var i = 0; i < htmlElements3.length; i++) {
        htmlElements3[i].addEventListener('click',
            function (event) {
            upStep(event);
        });
    }

    // for step down button(s)
    var htmlElements4 = node.getElementsByClassName("downstep_button");
    // loop through all edit steps and their buttons to attach event
    // listener to each one
    for (var i = 0; i < htmlElements4.length; i++) {
        htmlElements4[i].addEventListener('click',
            function (event) {
            downStep(event);
        });
    }


    // for add parameter button(s)
    var htmlElements5 = node.getElementsByClassName("addparameter_button");
    // loop through all edit steps and their buttons to attach event
    // listener to each one
    for (var i = 0; i < htmlElements5.length; i++) {
        htmlElements5[i].addEventListener('click',
            function (event) {
            addParameter(event);
        });
    }
}

function create_processing_type_dropdown_list() {

    var step_function_list = document.createElement('select');
    var opt_1 = document.createElement('option');
    opt_1.setAttribute("value", "regexp");
    opt_1.appendChild(document.createTextNode("RegExp"));
    step_function_list.appendChild(opt_1);


    return step_function_list;

}



function editStep(event) {

    console.debug("### edit step begin");
    console.debug(event);

    var this_row = event.target.parentNode.parentNode;
    console.debug(this_row);

    // special procedure for the procedure field


    // check if there is a selection list there already

    var current_function = "";
    var list = this_row.querySelector("td[j_name=procedure] select");
    console.debug(list);

    // is selection list, or just a single text value
    if (typeof list == 'undefined' || list == null) {
        //ok, no selection list in place so create one now.
        console.debug("no dropdown");

        var edit_cell = this_row.querySelectorAll("td[j_name=procedure]")[0];

        // get the current procedure in the cell

        current_function = edit_cell.textContent;

        // clear the cell
        edit_cell.textContent = "";

        //        var cell_text = edit_cell.textContent;

        //console.debug("edit: " + current_procedure);

        // create drop-down list of permitted functions
        // which function is currently specified
        // remove everything after the first "(", including the "("
        //var current_function = "";

        //current_function = cell_text.replace(/\(.*/i, '');

        console.debug("current_function: " + current_function);

        // create drop-down list

        var step_function_list = create_processing_type_dropdown_list();

        // make the current function pre-selected

        var curr_opt = step_function_list.querySelector("option[value='" + current_function + "']");

        console.debug(curr_opt);
        if (curr_opt) {

            curr_opt.setAttribute('selected', 'true');
        }
        edit_cell.appendChild(step_function_list);

    } else {
        console.debug("dropdown is in place")
        //console.debug(list.options);
        //console.debug(list.options);


        // var selectedValue = list.options[list.selectedIndex];
        // console.debug(selectedValue);
        // procedure = selectedValue.getAttribute('value');


    }

    // make step (and parameter) notes box editable
    make_step_rw(this_row);

    // add buttons to each parameters: delete, up, down
    // add button to add parameter

    // change the text box containing the step text to be editable.


    // add a "save" button to the right side of the text box


    // swap the edit button with the save button
    swap_edit_2_save_button();

    // generate_default_link_rules();
    console.debug("### edit end");

}

/*
 *
 * */
function make_object_rw(object_table) {
    // make all editable fields editable

    console.debug("#make_object_rw");
    console.debug(object_table);
    // make parameter values shown to be editable - user typed values
    swap_class(object_table, "updatable_user_typed_value", "updatable_user_typed_value_editable");
    swap_class(object_table, "updatable_user_selected_value", "updatable_user_selected_value_editable");

    // make parameter values editable in the html - user typed values

    var edit_cells3 = object_table.querySelectorAll("[class=updatable_user_typed_value_editable]");
    var n = 0;
    while (n < edit_cells3.length && n < 50) {
        console.debug(edit_cells3[n]);
        edit_cells3[n].setAttribute("contenteditable", "true");
        n++;
    }
}

function make_step_rw(step_row) {
    // make all editable fields editable for the step row submitted

    console.debug("#make_step_rw");
    console.debug(step_row);

    // make parameter values shown to be editable - user typed values
    swap_class(step_row, "updatable_user_typed_value", "updatable_user_typed_value_editable");
    swap_class(step_row, "updatable_user_selected_value", "updatable_user_selected_value_editable");

    // make parameter values editable in the html - user typed values

    var edit_cells3 = step_row.querySelectorAll("[class=updatable_user_typed_value_editable]");
    var n = 0;
    while (n < edit_cells3.length && n < 50) {
        console.debug(edit_cells3[n]);
        edit_cells3[n].setAttribute("contenteditable", "true");
        n++;
    }
}

// change between two classes
function swap_class(root_obj, from_class, to_class) {
    console.debug("#swap_class (" + from_class + " " + to_class + ")");
    var edit_cells3 = root_obj.querySelectorAll("[class=" + from_class + "]");
    var m = 0;
    while (m < edit_cells3.length && m < 50) {
        console.debug(edit_cells3[m]);
        edit_cells3[m].setAttribute("class", to_class);
        m++;
    }

}

/*
 *
 * */
function make_all_ro(object_table) {
    console.debug("make_all_ro");
    // mark previously editable fields, non-editable

    // make parameter values shown to be editable - user typed values

    try {
        swap_class(document, "updatable_user_typed_value_editable", "updatable_user_typed_value");
        swap_class(document, "updatable_user_selected_value_editable", "updatable_user_selected_value");
    } catch (e) {
        console.debug(e);
    }

    // make parameter values editable in the html - user typed values

    var edit_cells3 = document.querySelectorAll("td[class=updatable_user_typed_value]");
    var n = 0;
    while (n < edit_cells3.length && n < 50) {
        console.debug(edit_cells3[n]);
        edit_cells3[n].setAttribute("contenteditable", "false");
        n++;
    }

    var edit_rows = document.querySelectorAll("td[class=updatable_user_typed_value]");
    var n = 0;
    while (n < edit_rows.length && n < 50) {
        console.debug(edit_rows[n]);
        edit_rows[n].setAttribute("contenteditable", "false");
        n++;
    }

}

function make_step_ro(step_row) {

    // mark previously editable fields, non-editable
    console.debug("make_step_ro");
    // make parameter values shown to be editable - user typed values

    swap_class(step_row, "updatable_user_typed_value_editable", "updatable_user_typed_value");
    swap_class(step_row, "updatable_user_selected_value_editable", "updatable_user_selected_value");

    // make parameter values editable in the html - user typed values

    var edit_cells3 = step_row.querySelectorAll("td[class=updatable_user_typed_value]");
    var n = 0;
    while (n < edit_cells3.length && n < 50) {
        console.debug(edit_cells3[n]);
        edit_cells3[n].setAttribute("contenteditable", "false");
        n++;
    }
}

function editPolicy(event) {

    console.debug("### edit policy");
    console.debug(event);

    make_object_rw(document.querySelector("table.single_rule_table"));

    // place the "add rule" button

    // create "add" button
    // <button class="objectlevel_button" id="button_addstep">add step</button>

    var newbutton_5 = document.createElement('button');
    newbutton_5.setAttribute("class", "objectlevel_button");
    newbutton_5.setAttribute("id", "button_addstep");
    newbutton_5.appendChild(document.createTextNode("add step"));

    document.querySelector("#edit_policy_button").insertAdjacentElement('afterend', newbutton_5);

    // add listener to the "add step" button

    try {
        // addStep(event)
        document.getElementById('button_addstep').addEventListener('click',
            function (event) {
            addStep(event);
        });
    } catch (e) {
        console.debug(e);

    }

    swap_edit_2_save_button();

}



/*
 * make form fields non-ediatble, change the visible aspect to reflect this (change class attributes). Save the object back to the dataasbe.
 * */
function savePolicyChanges(event) {

    console.debug("### save begin");
    console.debug(event);

    make_all_ro();

    // save changes to database

    // keyid
    var keyId = document.querySelector("table.single_rule_table tr td[j_name=url_match]").textContent;

   
//    table_obj.setAttribute("indexedDbName", indexedDbName);
 //   table_obj.setAttribute("objectStoreName", objectStoreName);
    var indexedDbName = "";
    
    indexedDbName = document.querySelectorAll("table.single_rule_table[indexedDbName]")[0].getAttribute("indexedDbName");
    console.debug(indexedDbName);
    objectStoreName = document.querySelectorAll("table.single_rule_table[objectStoreName]")[0].getAttribute("objectStoreName");

    console.debug(objectStoreName);
   
    
  

    // remove objectionable characters - TO DO


    var new_obj = read_object_from_form();

    saveUpdateToIndexedDB_async(indexedDbName, objectStoreName, 'keyId', new_obj).then(function(){
    	
    	

    

	
	// send message to background, to request a refresh of the in-memory databases for this policy object
    	browser.runtime.sendMessage({
    		request: {"policy":"single_update","update_details":{"database":saveUpdateToIndexedDB_async,"datastore":objectStoreName,"object":new_obj} }
    	}, function (response) {
    		console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
    	});

    });

    swap_save_2_edit_button();

}

function swap_edit_2_save_button() {
    // replace "edit" button with "save" button

    // create the save button but only if there isn't one already

    console.debug(document.getElementById('save_policy_button'));
    if (document.getElementById('save_policy_button')) {
        console.debug("there is a save button");
    } else {
        console.debug("there is no save button, create it");
        try {
            var newbutton_3 = document.createElement('button');
            newbutton_3.setAttribute("class", "objectlevel_button");
            newbutton_3.setAttribute("id", "save_policy_button");
            newbutton_3.appendChild(document.createTextNode("Save Changes"));
            if (document.querySelector("#edit_policy_button")) {
                document.querySelector("#edit_policy_button").insertAdjacentElement('afterend', newbutton_3);
            }
            try {
                // addStep(event)
                document.getElementById('save_policy_button').addEventListener('click',
                    function (event) {
                    savePolicyChanges(event);
                });
            } catch (e) {
                console.debug(e);

            }

        } catch (e) {
            console.debug(e);

        }

    }

    // remove edit button - if there is one

    if (document.querySelector("#edit_policy_button")) {
        document.querySelector("#edit_policy_button").remove();

    } else {}

    // add listener to the "edit rule" button


}

function swap_save_2_edit_button() {
    // replace save button with a newly created edit button

    // create edit button, but only if there isn't one already.


    console.debug(document.getElementById('edit_policy_button'));
    console.debug(document.getElementById('save_policy_button'));
    if (document.getElementById('edit_policy_button')) {
        console.debug("there is a edit button ");
    } else {
        console.debug("there is no edit button, create it");

        var newbutton_3 = document.createElement('button');
        newbutton_3.setAttribute("class", "objectlevel_button");
        newbutton_3.setAttribute("id", "edit_policy_button");
        newbutton_3.appendChild(document.createTextNode("Edit Rule"));

        if (document.querySelector("#save_policy_button")) {
            document.querySelector("#save_policy_button").insertAdjacentElement('afterend', newbutton_3);
        } else {}
        // add listener to the "edit policy" button

        try {
            // addStep(event)
            document.getElementById('edit_policy_button').addEventListener('click',
                function (event) {
                editPolicy(event);
            });
        } catch (e) {
            console.debug(e);
        }

    }

    // remove save button
    if (document.querySelector("#save_policy_button")) {
        document.querySelector("#save_policy_button").remove();
    }
    // remove add step button -if there is one
    if (document.querySelector("#button_addstep")) {
        document.querySelector("#button_addstep").remove();
    }

}

/* read the rule object from the form as it exists at the moment */
function read_object_from_form() {

    // compose object

    var new_obj = {};

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

        // steps
      
        new_obj.steps = [];
        
        //var steps = [];
        var steps = document.querySelectorAll("table.steps_table tr.step_row");
        console.debug("step count: " + steps.length);
        var s = 0;
        while (s < steps.length && s < 12) {
            console.debug(steps[s]);
            // st[m].setAttribute("contenteditable", "false");
            try {
            	var step = {};
                var procedure = "";
                var list = steps[s].querySelector("td[j_name=procedure] select");
                console.debug(list);

                // is selection list, or just a single text value
                if (typeof list == 'undefined' || list == null) {
                    // ok, no selection list
                    console.debug("no dropdown");
                    procedure = steps[s].querySelector("td[j_name=procedure]").textContent;

                } else {

                    console.debug(list.options);
                    console.debug(list.options);

                    var selectedValue = list.options[list.selectedIndex];
                    console.debug(selectedValue);
                    procedure = selectedValue.getAttribute('value');

                }

              //  console.debug(procedure);

                step.procedure = procedure ;
              //  console.debug(step);

               // console.debug(JSON.stringify(step));

                // parameters for the step
                var parameters = [];
            
                    var pt = steps[s].querySelectorAll("table.parameters_table tr.parameter");
                   // console.debug(pt);

                    var p = 0;
                    // maximum of 50 parameters
                    while (p < pt.length && p < 50) {
                  //      console.debug(pt[p]);
                        var value = "";
                        value = pt[p].querySelector("td[j_name=value]").textContent;
                        // notes for this paramter
                        var notes = ""; 
                        	notes = pt[p].querySelector("td[j_name=notes]").textContent;

                //        console.debug("parameter notes: " + notes);
                        var parameter = JSON.parse('{"value":"' + value + '","notes":"' + notes + '"}');

                        parameters.push(parameter);
                        p++;
                    }

              
                step.parameters = parameters;

                // notes for this step
               // console.debug(steps[s]);
                var step_notes = steps[s].querySelector("tr.step_row > td[j_name=notes]").textContent;
               // console.debug(step_notes);

               // console.debug("step notes: " + step_notes);

                step.notes = step_notes;
               // console.debug(JSON.stringify(step));
                new_obj.steps.push(step);
            } catch (g) {
                console.error(g);
            }
            //new_obj.steps = steps;
            s++;
        }

        // notes for this policy
        var notes = document.querySelector("table.single_rule_table tr > td[j_name=notes]").textContent;

        console.debug("policy notes: " + notes);

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

function deleteStep(event) {

    console.debug("### delete step");
    console.debug(event);
    console.debug(event.target);
    console.debug(event.target.parentNode);
    console.debug(event.target.parentNode.parentNode);
    console.debug(event.target.parentNode.parentNode.childNodes);
    // generate_default_link_rules();
    console.debug("### delete end");
    // delete the table row containing the step

    // change the numbers (subtract 1) for the steps
    // following this one

    var this_row = event.target.parentNode.parentNode;
    var current_rank = getRank(this_row);

    var stepCount = getStepCount();
    // check if the removed row is the lastone

    var nextRow = this_row.nextSibling;
    // delete the row
    this_row.remove();

    console.debug(nextRow);
    console.debug(isStepRow(nextRow));
    var max_itt = 20;
    var i = 0;
    while (isStepRow(nextRow) && i < max_itt) {
        // re-number the row step
        console.debug("renumber");
        console.debug(nextRow);
        nextRow.childNodes[0].textContent = getRank(nextRow);
        nextRow = nextRow.nextSibling;

        i++;
    }
    // swap the edit button with the save button
    swap_edit_2_save_button();

}



function addParameter(event) {
    console.debug("# addParameter");
    var this_row = event.target.parentNode.parentNode;

    // locate parameter table in this row, 
    var parameter_table = this_row.querySelector("table.parameters_table");
    
    var last_table_row   = parameter_table.querySelector("tr:last-child");

    console.debug("last parameter row");
    console.debug(last_table_row);
    
    // and add a row to it
    
    console.debug("parameter row");
    var newRow = document.createElement('tr');
    newRow.setAttribute("class", "parameter");

//    tr class="parameter"><td class="updatable_user_typed_value" j_name="value">N/A</td><td class="updatable_user_typed_value" j_name="notes">N/A</td></tr>
    
    // first cell if which rank this step has in the overall policy object

    var newcell_l = document.createElement('td');
    newcell_l.setAttribute("class", "updatable_user_typed_value");
    newcell_l.setAttribute("j_name", "value");
    newcell_l.textContent = "new value";

    newRow.appendChild(newcell_l);

    // table cell for the procedure
    var newcell_2 = document.createElement('td');
    newcell_2.setAttribute("class", "updatable_user_typed_value");
    newcell_2.setAttribute("j_name", "notes");
    newRow.appendChild(newcell_2);

    parameter_table.querySelector("tr:last-child").insertAdjacentElement('afterend', newRow);

    
    //parameter_table.appendChild(newRow);
    
    
}

function downStep(event) {
    console.debug("# move down step");
    var this_row = event.target.parentNode.parentNode;
    var current_rank = getRank(this_row);

    var stepCount = getStepCount();

    // check if there is a lower step (with a higher number)
    if (current_rank < stepCount) {
        // if so, proceed
        // console.debug( "room below");


        // move this row one down by inserting the next row above this one


        var next_row = this_row.nextSibling;

        var it = this_row.parentNode.insertBefore(next_row, this_row);

        // rewrite the rank numbers displayed in the table

        this_row.querySelector("td.rank").textContent = getRank(this_row);

        next_row.querySelector("td.rank").textContent = getRank(next_row);

    } else {
        // , else stop
        // console.debug( "no more room below");

    }
    // swap the edit button with the save button
    swap_edit_2_save_button();

}

function upStep(event) {

    console.debug("### move step up");
    // generate_default_link_rules();

    // calculate rank of this step
    // count step rows backward from current row
    // is this row a step row

    var this_row = event.target.parentNode.parentNode;

    var current_rank = getRank(this_row);
    // console.debug("# selected step is of rank: " +
    // current_rank);

    // check if there is a higher step (with a lower number)
    if (current_rank > 1) {
        // if so, proceed
        console.debug("move row up 1 step");

        // move this row one up by inserting it above the row
        // above, thereby moving that row one down.
        var previous_row = this_row.previousSibling;
        console.debug("previous row");
        console.debug(previous_row);

        var it = this_row.parentNode.insertBefore(this_row, previous_row);

        console.debug("this row");
        console.debug(it);

        // rewrite the rank numbers displayed in the table
        this_row.querySelector("td.rank").textContent = getRank(this_row);
        previous_row.querySelector("td.rank").textContent = getRank(previous_row);
    } else {
        // ,else stop
        // console.debug( "already on top");
    }

    // swap the edit button with the save button
    swap_edit_2_save_button();

}

function addStep(event) {

    console.debug("### add step");
    // console.debug(event);

    // add this step


    var newRow = create_step_row();
    // is there a step row already, if so add this after it.


    console.debug(newRow);
    console.debug(newRow.querySelector("td.procedure"));

    // add drop-down list

    newRow.querySelector("td.procedure").appendChild(create_processing_type_dropdown_list());
    // do not any pre-selection in the dropdown

    // set the rank number for this step


    console.debug(document.querySelector("table.steps_table tr.step_row"));
    if (document.querySelector("table.steps_table tr.step_row")) {
        // is there a step row already, if so add this after it.
        console.debug("add new");
        document.querySelector("table.steps_table tr.step_row:last-child").insertAdjacentElement('afterend', newRow);
    } else {
        // no step nodes at all
        console.debug("add first");
        document.querySelector("table.steps_table").appendChild(newRow);
    }

}

// create a step row
function create_step_row() {
    console.debug("create_step_row");
    var newRow = document.createElement('tr');
    newRow.setAttribute("class", "step_row");

    // first cell if which rank this step has in the overall policy object

    var newcell_l = document.createElement('td');
    newcell_l.setAttribute("class", "rank");
    // compute rank
    newcell_l.appendChild(document.createTextNode((getStepCount() + 1)));
    newRow.appendChild(newcell_l);

    // table cell for the procedure
    var newcell_2 = document.createElement('td');
    newcell_2.setAttribute("class", "procedure");
    newcell_2.setAttribute("j_name", "procedure");

    // create drop-down list in this cell

    //newcell_2.appendChild(create_processing_type_dropdown_list);

    //newcell_2.appendChild(document.createTextNode("dropdown"));
    //newcell_2.setAttribute("contenteditable", "true");

    newRow.appendChild(newcell_2);

    // table cell for parameters

    var newcell_3 = document.createElement('td');
    newcell_3.setAttribute("class", "parameters");

    // within the parameters cell, setup a table for the parameters
    // where each row has two cells
    var newtable_2 = document.createElement('table');
    newtable_2.setAttribute("class", "parameters_table");
    newtable_2.setAttribute("j_name", "parameters");

    // parameter table row
    var newrow_2 = document.createElement('tr');
    newrow_2.setAttribute("class", "parameter");

    // parameter table cell for the parameter value

    var newcell_31 = document.createElement('td');
    newcell_31.setAttribute("class", "updatable_user_typed_value");
    newcell_31.setAttribute("j_name", "value");
    newcell_31.setAttribute("contenteditable", "true");

    newcell_31.appendChild(document.createTextNode("default"));

    newrow_2.appendChild(newcell_31);

    // parameter table cell for the parameter notes/remarks

    var newcell_32 = document.createElement('td');
    newcell_32.setAttribute("class", "updatable_user_typed_value");
    newcell_32.setAttribute("j_name", "notes");
    newcell_32.setAttribute("contenteditable", "true");

    newcell_32.appendChild(document.createTextNode("default"));

    // edit_cell2.setAttribute("contenteditable", "true");
    // edit_cell2.setAttribute("class", "value_editable");

    newrow_2.appendChild(newcell_32);

    newtable_2.appendChild(newrow_2);
    newcell_3.appendChild(newtable_2);
    newRow.appendChild(newcell_3);

    // notes
    var newcell_4 = document.createElement('td');
    newcell_4.setAttribute("class", "updatable_user_typed_value");
    newcell_4.setAttribute("j_name", "notes");
    newcell_4.setAttribute("contenteditable", "true");
    // create drop-down list in this cell
    newcell_4.appendChild(document.createTextNode("text"));
    newRow.appendChild(newcell_4);

    // cell for buttons
    var newcell_5 = document.createElement('td');
    newcell_5.setAttribute("class", "buttons");
    // create new edit button
    var newbutton_1 = document.createElement('button');
    newbutton_1.setAttribute("class", "editstep_button");
    // newbutton_1.setAttribute("id", "button_generate_default");
    newbutton_1.appendChild(document.createTextNode("edit"));
    newcell_5.appendChild(newbutton_1);

    // create new up button
    var newbutton_2 = document.createElement('button');
    newbutton_2.setAttribute("class", "deletestep_button");
    // newbutton_2.setAttribute("id", "button_generate_default");
    newbutton_2.appendChild(document.createTextNode("up"));

    newcell_5.appendChild(newbutton_2);

    // create new delete button
    var newbutton_3 = document.createElement('button');
    newbutton_3.setAttribute("class", "deletestep_button");
    // newbutton_3.setAttribute("id", "button_generate_default");
    newbutton_3.appendChild(document.createTextNode("delete"));

    newcell_5.appendChild(newbutton_3);

    // create new delete button
    var newbutton_4 = document.createElement('button');
    newbutton_4.setAttribute("class", "downstep_button");
    // newbutton_4.setAttribute("id", "button_generate_default");
    newbutton_4.appendChild(document.createTextNode("down"));

    newcell_5.appendChild(newbutton_4);
    newRow.appendChild(newcell_5);

    // attach event listeners to buttons in this row
    attachButtonEventlisteners(newRow);
    return newRow;
}

function getStepCount() {
    console.debug("# getStepCount");

    var res = document.querySelectorAll("tr.step_row").length;
    console.debug("step count = " + res);
    return res;

}

function getRank(tablerownode) {
    console.debug("# getRank");
    console.debug(tablerownode);

    var max_itterations = 5;
    var m = 0;

    var rank = 1;

    var previous_row = tablerownode.previousSibling;
    while (m < max_itterations && isStepRow(previous_row)) {
        previous_row = previous_row.previousSibling;
        rank++;
        m++;

    }
    console.debug("rank = " + rank);
    return rank;
}

function isStepRow(node) {

    console.debug("# isStepRow");
    console.debug(node);
    try {
        if (node.getAttribute('class') == 'step_row') {
            console.debug("is step row = true");
            return true;
        } else {
            console.debug("is step row = false");
            return false;
        }
    } catch (e) {
        console.debug("is step row = false");
        return false;
    }
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
       // console.debug("saveUpdateToIndexedDB_async: 1 dbRequest=" + dbRequest);

        dbRequest.onerror = function (event) {
            console.debug("saveUpdateToIndexedDB_async:error.open:db " + dbName);
            reject(Error("IndexedDB database error"));
        };

    try {

            dbRequest.onsuccess = function (event) {
               // console.debug("saveUpdateToIndexedDB_async: 31");
                var database = event.target.result;
                //console.debug("saveUpdateToIndexedDB_async: 32");
                var transaction = database.transaction([storeName], 'readwrite');
               // console.debug("saveUpdateToIndexedDB_async: 33");
                var objectStore = transaction.objectStore(storeName);
               // console.debug("saveUpdateToIndexedDB_async:objectStore put: " + JSON.stringify(object));

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

function loadFromIndexedDB_async(dbName, storeName, id) {
    console.log("loadFromIndexedDB:0");
    console.log("loadFromIndexedDB:1 " + dbName);
    console.log("loadFromIndexedDB:2 " + storeName);
    console.log("loadFromIndexedDB:3 " + id);

    return new Promise(
        function (resolve, reject) {
        var dbRequest = indexedDB.open(dbName);

        dbRequest.onerror = function (event) {
            reject(Error("Error text"));
        };

        dbRequest.onupgradeneeded = function (event) {
            // Objectstore does not exist. Nothing to load
            event.target.transaction.abort();
            reject(Error('Not found'));
        };

        dbRequest.onsuccess = function (event) {
            //  console.log("loadFromIndexedDB:onsuccess ");

            var database = event.target.result;
            var transaction = database.transaction([storeName]);
            //  console.log("loadFromIndexedDB:transaction: " + JSON.stringify(transaction));
            var objectStore = transaction.objectStore(storeName);
            //  console.log("loadFromIndexedDB:objectStore: " + JSON.stringify(objectStore));
            var objectRequest = objectStore.get(id);

            // console.log("loadFromIndexedDB:objectRequest: " + JSON.stringify(objectRequest));


            try {

                objectRequest.onerror = function (event) {
                    // reject(Error('Error text'));
                    console.log("45");
                    reject('Error text');
                };

                objectRequest.onsuccess = function (event) {
                    if (objectRequest.result) {
                        console.log("loadFromIndexedDB:result " + JSON.stringify(objectRequest.result));

                        resolve(objectRequest.result);
                    } else {
                        //reject(Error('object not found'));
                        //console.log("43");
                        resolve('object not found');
                        //reject('object not found');


                    }
                };

            } catch (error) {
                console.log(error);
                reject(error);

            }

        };
    });
}
