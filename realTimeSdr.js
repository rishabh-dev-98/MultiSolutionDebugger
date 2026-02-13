console.log("Welcome to Real Time SDR");
var accessToken = "";
var clientId = "";
var orgId = "";
var companyId = "";
var rsArr = [];  // Declare rsArr globally
var dvArr = []; // Declare dvArr globally
var details = []

function submitToken() {
    let token = document.getElementById("message-text").value.trim();
    let clientId = document.getElementById("clientId").value.trim();
    let orgId = document.getElementById("orgId").value.trim();
    let companyId = document.getElementById("companyId").value.trim();

    var rsValue = "https://experience.adobe.com/#/@" + document.getElementById("companyId").value.split('0')[0] + "/so:" + document.getElementById("companyId").value + "/analytics/p/am/1.3/index.html?a=ReportSuite.Selection"
    document.getElementById("rsManager").setAttribute("href", rsValue);

    var dvValue = "https://experience.adobe.com/#/@" + document.getElementById("companyId").value.split('0')[0] + "/platform/analytics/#/apps/data-management/data-views"
    document.getElementById("dvManager").setAttribute("href", dvValue);

    let atFeedback = document.getElementById("atFeedback");
    let clientFeedback = document.getElementById("clientIdFeedback");
    let orgFeedback = document.getElementById("orgIdFeedback");
    let companyFeedback = document.getElementById("companyIdFeedback");

    let tokenPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    let clientIdPattern = /^[a-f0-9]{32}$/i;
    let orgIdPattern = /^[A-F0-9]{24}@AdobeOrg$/i;
    let companyIdPattern = /^[a-z0-9]+$/;

    let valid = true;

    if (!clientIdPattern.test(clientId)) {
        clientFeedback.style.display = "block";
        valid = false;
    }

    if (!orgIdPattern.test(orgId)) {
        orgFeedback.style.display = "block";
        valid = false;
    }

    if (!companyIdPattern.test(companyId)) {
        companyFeedback.style.display = "block";
        valid = false;
    }

    if (!tokenPattern.test(token)) {
        atFeedback.style.display = "block";
        valid = false;
    }

    if (!valid) return;

     // Save credentials
    localStorage.setItem("accessToken", token);
    localStorage.setItem("clientId", clientId);
    localStorage.setItem("orgId", orgId);
    localStorage.setItem("companyId", companyId);

    bootstrap.Modal
        .getInstance(document.getElementById("exampleModal"))
        .hide();

    fetchToken(token, clientId, orgId, companyId);
}

function optionSelected () {
    var optionSelectedValue = document.getElementById("optionSelect").value;
    document.getElementById("rsFeedback").style.display = "none"
    document.getElementById("dvFeedback").style.display = "none"
    document.getElementById("autocomplete-dropdown").innerHTML = ""
    document.getElementById("autocomplete-dropdown2").innerHTML = ""
    console.log("credntials: ", token, clientId, orgId, companyId)
    
    var result = "";
    if (optionSelectedValue == "0") {
        document.getElementById("rsContainer").style.display = "none"
        document.getElementById("dvContainer").style.display = "none"
        document.getElementById("rsManager").style.display = "none"
        document.getElementById("dvManager").style.display = "none"
        document.getElementById("submitButton").style.display = "none"
        document.getElementById("rsID").value = "";
        document.getElementById("dvID").value = "";
        result = 0;
    } else if (optionSelectedValue == "1") {
        document.getElementById("rsContainer").style.display = "flex"
        document.getElementById("dvContainer").style.display = "none"
        document.getElementById("rsManager").style.display = "flex"
        document.getElementById("dvManager").style.display = "none"
        document.getElementById("submitButton").style.display = "flex"
        document.getElementById("dvID").value = "";
        result = 1;
    } else if (optionSelectedValue == "2") {
        document.getElementById("rsContainer").style.display = "none"
        document.getElementById("dvContainer").style.display = "flex"
        document.getElementById("dvManager").style.display = "flex"
        document.getElementById("rsManager").style.display = "none"
        document.getElementById("submitButton").style.display = "flex"
        document.getElementById("rsID").value = "";
        result = 2;
    }
    return result;
}

function fetchToken (token, clientId, orgId, companyId) {
    fetchReportSuites(token,clientId,orgId,companyId); // Fetch report suites using the token
    fetchDataViews(token,clientId,orgId,companyId); // fetch data views using the token
}

function fetchReportSuites(token,clientId,orgId,companyId) {
    let rsData = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://analytics.adobe.io/api/' + companyId + '/reportsuites/collections/suites?limit=500',
        headers: { 
            'Authorization': `Bearer ${token}`,  // Pass token dynamically
            'x-api-key': clientId
        }
    };

    axios.request(rsData)
        .then((response) => {
            rsArr = response.data.content.map(item => item.rsid); // Update rsArr globally
        })
        .catch((error) => {
            document.getElementById("optionSelect").disabled = true;
            document.getElementById("atAlert").style.display = "block"
            setTimeout(() => {
                document.getElementById("atAlert").style.display = "none"; // Hide alert after 2 seconds
            }, 5000);
            let timeLeft = 5; // Start from 5 seconds
            let timerElement = document.getElementById("timer");
            let countdown = setInterval(() => {
                timeLeft--; // Decrease time
                timerElement.textContent = timeLeft; // Update the timer display

                if (timeLeft <= 0) {
                    clearInterval(countdown); // Stop the timer
                    window.location.reload(); // Reload the page
                }
            }, 1000);
            // DELETING THE TOKEN COOKIE
            //document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        });
}

function fetchDataViews (token,clientId,orgId,companyId) {
    let dvData = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://cja.adobe.io/data/dataviews?expansion=name,description,owner,isDeleted,parentDataGroupId,timezoneDesignator,modifiedDate,createdDate,organization,modifiedBy,externalData,containerNames,sandboxId,sandboxName,tags,parentConnectionId,id',
        headers: { 
            'Authorization': `Bearer ${token}`,  // Pass token dynamically
            'x-api-key': clientId, 
            'x-gw-ims-org-id': orgId
        }
    };

    axios.request(dvData)
    .then((response) => {
        dvArr = response.data.content.map(item => ({
            id: item.id,      // Used on the backend
            name: item.name   // Used on the frontend
        })); // Update dvArr globally
    })
    .catch((error) => {
        document.getElementById("optionSelect").disabled = true;
        document.getElementById("atAlert").style.display = "block"
        setTimeout(() => {
            document.getElementById("atAlert").style.display = "none"; // Hide alert after 2 seconds
        }, 5000);
        let timeLeft = 5; // Start from 5 seconds
        let timerElement = document.getElementById("timer");
        let countdown = setInterval(() => {
            timeLeft--; // Decrease time
            timerElement.textContent = timeLeft; // Update the timer display

            if (timeLeft <= 0) {
                clearInterval(countdown); // Stop the timer
                window.location.reload(); // Reload the page
            }
        }, 1000);
        // DELETING THE TOKEN COOKIE
        //document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    });
}

// Autocomplete functionality
document.addEventListener("DOMContentLoaded", function () {
    let myModal = new bootstrap.Modal(document.getElementById("exampleModal"));
    myModal.show();
        
    const input = document.getElementById("rsID");
    const dropdown = document.getElementById("autocomplete-dropdown");
    const dvInput = document.getElementById("dvID");
    const dropdown2 = document.getElementById("autocomplete-dropdown2");

    input.addEventListener("input", function () {
        const value = input.value.toLowerCase();
        dropdown.innerHTML = "";

        if (value) {
            // Ensure rsArr has data before filtering
            if (rsArr.length === 0) {
                console.warn("rsArr is empty. Wait for API response.");
                return;
            }

            // Filter rsArr dynamically
            const filteredSuggestions = rsArr.filter(item => item.toLowerCase().includes(value));

            filteredSuggestions.forEach(suggestion => {
                const item = document.createElement("li");
                item.classList.add("list-group-item", "list-group-item-action");
                item.textContent = suggestion;
                item.addEventListener("click", function () {
                    input.value = suggestion;
                    input.readOnly = true;
                    dropdown.innerHTML = "";
                });
                dropdown.appendChild(item);
            });
        }
    });
    
    dvInput.addEventListener("input", function () {
        const value = dvInput.value.toLowerCase();
        dropdown2.innerHTML = "";
    
        if (value) {
            // Ensure dvArr has data before filtering
            if (dvArr.length === 0) {
                console.warn("dvArr is empty. Wait for API response.");
                return;
            }
    
            // Filter dvArr based on 'name' (for frontend display)
            const filteredSuggestions = dvArr.filter(item => item.name.toLowerCase().includes(value));
    
            filteredSuggestions.forEach(suggestion => {
                const item = document.createElement("li");
                item.classList.add("list-group-item", "list-group-item-action");
                item.textContent = suggestion.name; // Display 'name' in dropdown
    
                item.addEventListener("click", function () {
                    dvInput.value = suggestion.name; // Display 'name' in input
                    dvInput.dataset.id = suggestion.id; // Store 'id' as a dataset attribute for backend use
                    dvInput.readOnly = true;
                    dropdown2.innerHTML = "";
                });
                dropdown2.appendChild(item);
            });
        }
    });
});

function Submit () {
    document.getElementById('myForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent form submission (page reload)
    });
    var optionSelectedValue = optionSelected();
    document.getElementById("optionSelect").disabled = true;
    accessToken = document.getElementById("message-text").value;
    companyId = document.getElementById("companyId").value;
    clientId = document.getElementById("clientId").value;
    orgId = document.getElementById("orgId").value;
    
    function createTable (variable, type) {
        for (let i = 0; i < variable.length; ++i) {
            const newRow = document.createElement('tr');
            // Create the columns for each row dynamically
            const rowIndex = document.createElement('th');
            rowIndex.scope = 'row';
            rowIndex.textContent = document.getElementById('tableBody').rows.length + 1; // Increment the row number
            rowIndex.setAttribute("class", "text-center font-monospace")

            const adobeVariableType = document.createElement('td');
            adobeVariableType.textContent = type;
            adobeVariableType.setAttribute("class", "fst-italic font-monospace");

            const adobeVariableNumber = document.createElement('td');
            adobeVariableNumber.textContent = variable[i].number;
            adobeVariableNumber.setAttribute("class", "font-monospace");

            const adobeVariableName = document.createElement('td');
            adobeVariableName.textContent = variable[i].title;
            adobeVariableName.setAttribute("class", "font-monospace");

            const description = document.createElement('td');
            description.textContent = variable[i].description;
            description.setAttribute("class", "font-monospace text-wrap");

            // Append the columns to the row
            newRow.appendChild(rowIndex);
            newRow.appendChild(adobeVariableType);
            newRow.appendChild(adobeVariableNumber);
            newRow.appendChild(adobeVariableName);
            newRow.appendChild(description);

            // Append the new row to the table body
            document.getElementById('tableBody').appendChild(newRow);
        }
    }
    const sortByNumericId = (a, b) => {
        const numA = parseInt(a.id.match(/\d+/)?.[0] || "0", 10);
        const numB = parseInt(b.id.match(/\d+/)?.[0] || "0", 10);
        return numA - numB;
    };

    function createTable2 (variable, type) {
        for (let i = 0; i < variable.length; ++i) {
            const newRow = document.createElement('tr');
            // Create the columns for each row dynamically
            const rowIndex = document.createElement('th');
            rowIndex.scope = 'row';
            rowIndex.textContent = document.getElementById('tableBody2').rows.length + 1; // Increment the row number
            rowIndex.setAttribute("class", "text-center font-monospace")

            const componentType = document.createElement('td');
            componentType.textContent = type;
            componentType.setAttribute("class", "fst-italic font-monospace");

            const componentName = document.createElement('td');
            componentName.textContent = variable[i].name;
            componentName.setAttribute("class", "font-monospace text-wrap");

            const description = document.createElement('td');
            description.textContent = variable[i].description || "No Description";
            description.setAttribute("class", "font-monospace text-wrap");

            const schemaFieldDataType = document.createElement('td');
            schemaFieldDataType.textContent = variable[i].schemaType || "No Schema Data type";
            schemaFieldDataType.setAttribute("class", "font-monospace text-wrap");

            const schemaFieldPath = document.createElement('td');
            schemaFieldPath.textContent = variable[i].schemaPath || "No Schema Path";
            schemaFieldPath.setAttribute("class", "font-monospace text-wrap");

            const componentId = document.createElement('td');
            componentId.textContent = variable[i].id.split("/")[1] || "No Component ID";
            componentId.setAttribute("class", "font-monospace text-wrap");

            const datasetInfo = document.createElement('td');
            datasetInfo.textContent = (variable[i].dataSetType || "No Dataset Type") + " : " + (variable[i].dataSetIds || "No Dataset")
            datasetInfo.setAttribute("class", "font-monospace text-wrap");

            const hideComponentFromReporting = document.createElement('td');
            hideComponentFromReporting.textContent = variable[i].hideFromReporting === true ? "Yes" : variable[i].hideFromReporting === false ? "No" : variable[i].hideFromReporting == undefined ? "Setting not available" : variable[i].hideFromReporting;
            hideComponentFromReporting.setAttribute("class", "font-monospace text-wrap");

            const adobeLookups = document.createElement('td');
            adobeLookups.textContent = variable[i].fromGlobalLookup === true ? "Yes" : variable[i].fromGlobalLookup === false ? "No" : variable[i].fromGlobalLookup == undefined ? "Setting not available" : variable[i].fromGlobalLookup;
            adobeLookups.setAttribute("class", "font-monospace text-wrap");

            const substringSettings = document.createElement('td');
            substringSettings.textContent = (variable[i].fieldDefinition && variable[i].fieldDefinition.length > 1) ? (variable[i].fieldDefinition[1].func === "split" ? "Delimeter" : variable[i].fieldDefinition[1].func === "url-parse" ? "URL Parse" : variable[i].fieldDefinition[1].func === "trim-trunc-trim" ? "Trim" : variable[i].fieldDefinition[1].func === "regex-replace" ? "Regex" : "Other") : "Setting not available";
            substringSettings.setAttribute("class", "font-monospace text-wrap");

            const behaviorSettings = document.createElement('td');
            if (type == "dimension") {
                behaviorSettings.textContent = (variable[i].behaviorSetting && variable[i].behaviorSetting.lowercase) === true ? "Lowercase" : (variable[i].behaviorSetting && variable[i].behaviorSetting.lowercase) === false ? "No" : (variable[i].behaviorSetting && variable[i].behaviorSetting.lowercase) == undefined ? "Setting not available" : variable[i].behaviorSetting.lowercase;
            } else if (type == "metric") {
                if (variable[i].schemaType == "double" || variable[i].schemaType == "integer") {
                    behaviorSettings.textContent = (variable[i].fieldDefinition && variable[i].fieldDefinition.length > 1) ? "Count Instances" : "Count Values"
                } else {
                    behaviorSettings.textContent = "Setting not available"
                }
            }
            behaviorSettings.setAttribute("class", "font-monospace text-wrap");

            const noValueOptionSettings = document.createElement('td');
            noValueOptionSettings.textContent = (variable[i].noValueOptionsSetting && variable[i].noValueOptionsSetting.noneSettingType) == "dont-show-no-value" ? ("Don't Show " + variable[i].noValueOptionsSetting.customNoneValue + " by default") :
                (variable[i].noValueOptionsSetting && variable[i].noValueOptionsSetting.noneSettingType) == "show-no-value" ? ("Show " + variable[i].noValueOptionsSetting.customNoneValue + " by default") :
                    (variable[i].noValueOptionsSetting && variable[i].noValueOptionsSetting.noneSettingType) == "show-no-value-as-value" ? ("Treat " + variable[i].noValueOptionsSetting.customNoneValue + " as a value") :
                        (variable[i].noValueOptionsSetting && variable[i].noValueOptionsSetting.noneSettingType) == undefined ? "Setting not available" : variable[i].noValueOptionsSetting.noneSettingType;
            noValueOptionSettings.setAttribute("class", "font-monospace text-wrap");


            function rules (arr) {
                var result = ""
                for (let i = 0; i < arr.length; ++i) {
                    result += (arr[i].clause == "contains-all" ? "Contains all terms" : 
                        arr[i].clause == "contains-any" ? "Contains any term" :
                            arr[i].clause == "contains-phrase" ? "Contains the phrase" :
                                arr[i].clause == "not-contains-any" ? "Does not contain any term" :
                                    arr[i].clause == "not-contains-phrase" ? "Does not contain the phrase" :
                                        arr[i].clause == "equals" ? "Equals" :
                                            arr[i].clause == "not-equals" ? "Does not equal" :
                                                arr[i].clause == "starts-with" ? "Starts with" :
                                                    arr[i].clause == "ends-with" ? "Ends with" :
                                                        arr[i].clause == "eq" ? "Equals" :
                                                            arr[i].clause == "not-eq" ? "Does not equal" :
                                                                arr[i].clause == "lt" ? "Is less than" :
                                                                    arr[i].clause == "gt" ? "Is greater than" :
                                                                        arr[i].clause == "ge" ? "Is greater than or equal to" :
                                                                            arr[i].clause == "le" ? "Is less than or equal to" : "No Criteria Set"
                                                                                
                    ) + " | " + (arr[i].value == "" ? "No Value set" : arr[i].value) + " , ";
                }
                return result.slice(0,-2);
            }
            function caseSensitive (x) {
                return x == true ? "Yes" : x == false ? "No" : x == undefined ? "Setting not available" : x;
            }

            const includeExcludeSettings = document.createElement('td');
            includeExcludeSettings.textContent = (variable[i].includeExcludeSetting && variable[i].includeExcludeSetting.enabled) == true ? (caseSensitive(variable[i].includeExcludeSetting.caseSensitive) + " : " + (variable[i].includeExcludeSetting.match == "and" ? "If all criteria are met" : "If any criteria are met") + " | " + rules(variable[i].includeExcludeSetting.rules)  ) :
                (variable[i].includeExcludeSetting && variable[i].includeExcludeSetting.enabled) == false ? "No" :
                    (variable[i].includeExcludeSetting && variable[i].includeExcludeSetting.enabled) == undefined ? "Setting not available" : variable[i].includeExcludeSetting.enabled;
            includeExcludeSettings.setAttribute("class", "font-monospace text-wrap");

            function allocationModel (x) {
                var model = x.func == "allocation-lastTouch_dim" ? "Most Recent" :
                    x.func == "allocation-participation_dim" ? "All" :
                        x.func == "allocation-firstTouch_dim" ? "Original" :
                            x.func == "allocation-firstKnown_dim" ? "First Known" :
                                x.func == "allocation-lastKnown_dim" ? "Last Known" : "";
                
                function metricArr (arr) {
                    var result = ""
                    for (let i = 0; i < arr.length; ++i) {
                        result += arr[i].split("/")[1] + ","
                    }
                    return result.slice(0,-1);
                }
                var expiration = (x.expiration && x.expiration.context) == "sessions" ? "Session" :
                (x.expiration && x.expiration.context) == "visitors" ? "Person" :
                        ((x.expiration && x.expiration.context) == undefined && (x.expiration && x.expiration.func) == "allocation-inactivity") ? (x.expiration.numPeriods + " " + x.expiration.granularity + "s") :
                            ((x.expiration && x.expiration.context) == undefined && (x.expiration && x.expiration.func) == "allocation-afterEvents") ? metricArr(x.expiration.events) : 
                                x.context == "visitors" ? "Person Reporting Window" : 
                                    x.context == "sessions" ? "Session" : "";
                return model + " | " + expiration;
            }

            const persistenceSettings = document.createElement('td');
            persistenceSettings.textContent = (variable[i].persistenceSetting && variable[i].persistenceSetting.enabled) == true ? (allocationModel(variable[i].persistenceSetting.allocationModel) ) :
                (variable[i].persistenceSetting && variable[i].persistenceSetting.enabled) == false ? "No" :
                    (variable[i].persistenceSetting && variable[i].persistenceSetting.enabled) == undefined ? "Setting not available" : variable[i].persistenceSetting.enabled;
            persistenceSettings.setAttribute("class", "font-monospace text-wrap");

            function attributionAllocationModel (x) {
                var model =  x.func == "allocation-lastTouch" ? "Last Touch" :
                    x.func == "allocation-firstTouch" ? "First Touch" :
                        x.func == "allocation-linear" ? "Linear" :
                            x.func == "allocation-participation" ? "Participation" :
                                x.func == "allocation-instance" ? "Same Touch" :
                                    x.func == "allocation-uShaped" ? "U Shaped" :
                                        x.func == "allocation-jShaped" ? "J Curve" :
                                            x.func == "allocation-reverseJShaped" ? "Inverse J" :
                                                x.func == "allocation-timeDecay" ? "Time Decay" :
                                                    x.func == "allocation-positionBased" ? "Custom" :
                                                        x.func == "allocation-algorithmic" ? "Algorithmic" : "";
                
                var lookBack = ""
                
                if (x.lookbackExpiration == undefined) {
                    if ((x.expiration && x.expiration.context) == "sessions") {
                        lookBack = "Session"
                    } else if ((x.expiration && x.expiration.context) == "visitors") {
                        lookBack = "Person"
                    }
                } else if (x.lookbackExpiration != undefined) {
                    lookBack = (x.lookbackExpiration.numPeriods + " " + x.lookbackExpiration.granularity + "s")
                }

                if (x.halfLifeNumPeriods && x.halfLifeGranularity) {
                    model = "Time Decay (" + x.halfLifeNumPeriods + " " + x.halfLifeGranularity + ")"
                }
                if (x.firstWeight && x.middleWeight && x.lastWeight) {
                    model = "Custom (" + x.firstWeight + "/" + x.middleWeight + "/" + x.lastWeight + ")"
                }
                return lookBack == "" ? model : (model + " | " + lookBack);
            }

            const attributionSettings = document.createElement('td');
            attributionSettings.textContent = (variable[i].attributionSetting && variable[i].attributionSetting.enabled) == true ? attributionAllocationModel(variable[i].attributionSetting.attributionModel) :
                (variable[i].attributionSetting && variable[i].attributionSetting.enabled) == false ? "No" :
                    (variable[i].attributionSetting && variable[i].attributionSetting.enabled) == undefined ? "Setting not available" : variable[i].attributionSetting.enabled;
            attributionSettings.setAttribute("class", "font-monospace text-wrap");

            const formatSettings = document.createElement('td');
            formatSettings.textContent = ( variable[i].formatSetting && variable[i].formatSetting.formatType) == undefined ? "Setting not available" : variable[i].formatSetting.formatType;
            formatSettings.setAttribute("class", "font-monospace text-wrap");

            const metricDeduplicationSettings = document.createElement('td');
            if (type == "dimension") {
                metricDeduplicationSettings.textContent = "Setting not available"
            } else if (type == "metric") {
                if (variable[i].sourceFieldType == "standard") {
                    metricDeduplicationSettings.textContent = "Setting not available"
                } else  {
                    var fieldArr = variable[i].fieldDefinition;
                    if (fieldArr) { 
                        for (let j = 0; j < fieldArr.length; ++j) { 
                            if (fieldArr[j].func == "deduplicate") { 
                                if (fieldArr[j].container['group-by']) {
                                    metricDeduplicationSettings.textContent = fieldArr[j].container.context + " | " +  (fieldArr[j].container['group-by']).split("deduplicated_")[1] + " | Keep " + fieldArr[j]['selection-criteria'] + " instance";
                                 }
                                else if (fieldArr[j].container['group-by'] == undefined) {
                                    metricDeduplicationSettings.textContent = fieldArr[j].container.context + " | Keep " + fieldArr[j]['selection-criteria'] + " instance";
                                }
                            } else {
                                metricDeduplicationSettings.textContent = "No"
                            }
                        }
                    }
                }
            }
            metricDeduplicationSettings.setAttribute("class", "font-monospace text-wrap");

            // Append the columns to the row
            newRow.appendChild(rowIndex);
            newRow.appendChild(componentType);
            newRow.appendChild(componentName);
            newRow.appendChild(description);
            newRow.appendChild(schemaFieldDataType);
            newRow.appendChild(schemaFieldPath);
            newRow.appendChild(componentId);
            newRow.appendChild(datasetInfo);
            newRow.appendChild(hideComponentFromReporting);
            newRow.appendChild(adobeLookups);
            newRow.appendChild(substringSettings);
            newRow.appendChild(behaviorSettings);
            newRow.appendChild(noValueOptionSettings);
            newRow.appendChild(includeExcludeSettings);
            newRow.appendChild(persistenceSettings);
            newRow.appendChild(attributionSettings);
            newRow.appendChild(formatSettings);
            newRow.appendChild(metricDeduplicationSettings);

            // Append the new row to the table body
            document.getElementById('tableBody2').appendChild(newRow);
        }
    }

    // ADOBE ANALYTICS OPTION SELECTED
    if (optionSelectedValue == "1") {
        var rsId = document.getElementById("rsID").value;
        if (rsId == "") {
            document.getElementById("rsFeedback").style.display = "block"
        } else if (rsId != "") {
            document.getElementById("spinner").style.display = "block"
            document.getElementById("submitButton").disabled = true;
            if (!accessToken) {
                console.warn("Access token is empty. Wait for token generation.");
                return;
            }        
            // FETCHING EVARS, PROPS, LISTVARS
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: 'https://analytics.adobe.io/api/' + companyId + '/dimensions?rsid=' + rsId,
                headers: { 
                'Authorization': `Bearer ${accessToken}`, 
                'x-api-key': clientId
                }
            };
            
            axios.request(config)
            .then((response) => {
                var rs = response.data;
                let evars = [];
                let props = [];
                let listVars = [];
                for (let i = 0; i < rs.length; ++i) {
                    if (rs[i].id.startsWith("variables/evar") && rs[i].parent === undefined) {
                        evars.push({ id: rs[i].id, title: rs[i].title, description: rs[i].description || "No Description", number: rs[i].extraTitleInfo });
                    }
                    if (rs[i].id.startsWith("variables/prop") && rs[i].parent === undefined) {
                        props.push({ id: rs[i].id, title: rs[i].title, description: rs[i].description || "No Description", number: rs[i].extraTitleInfo });
                    }
                    if (rs[i].id.startsWith("variables/listvariable") && rs[i].parent === undefined) {
                        listVars.push({ id: rs[i].id, title: rs[i].title, description: rs[i].description || "No Description", number: (rs[i].id).split("/")[1] });
                    }
                }

                details.push(evars.length, props.length, listVars.length)
                fetchAllDetails(details)
    
                // Sort each array
                evars.sort(sortByNumericId);
                props.sort(sortByNumericId);
                listVars.sort(sortByNumericId);
                
                createTable(evars, "eVars");
                createTable(props, "props");
                createTable(listVars, "listVars");

                // Now fetch events
                fetchEvents();

                document.getElementById("allDetails").style.display = "block";
                document.getElementById("myTable").style.display = "block"
                document.getElementById("exportReset").style.display = "block"
                document.getElementById("submitButton").style.display = "none"
                document.getElementById("rsID").disabled = true;
                document.getElementById("sdrAlert").style.display = "block";
                document.getElementById("searchInput").style.display = "block"
                
                setTimeout(() => {
                    document.getElementById("sdrAlert").style.display = "none"; // Hide alert after 2 seconds
                }, 2000);
                
                if (document.getElementById("searchInput").style.display == "block") {
                    document.getElementById("spinner").style.display = "none"
                    document.getElementById("clearValue").style.display = "none"
                    document.getElementById("optionSelect").disabled = true;
                }
            })
            .catch((error) => {
                if (rsId != "") {
                    document.getElementById("rsAlert").style.display = "block"
                    document.getElementById("submitButton").disabled = false;
                    setTimeout(() => {
                        document.getElementById("rsAlert").style.display = "none"; // Hide alert after 2 seconds
                    }, 2000);
                    document.getElementById("spinner").style.display = "none"
                }
            });

            // FETCHING EVENTS
            function fetchEvents () {
                let config2 = {
                    method: 'get',
                    maxBodyLength: Infinity,
                    url: 'https://analytics.adobe.io/api/' + companyId + '/metrics?rsid=' + rsId,
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'x-api-key': clientId
                    }
                };
                
                axios.request(config2)
                    .then((response) => {
                        const rs = response.data;
                        let events = [];
                        // Filter and extract IDs that start with "metrics/event"
                        for (let i = 0; i < rs.length; ++i) {
                            if (rs[i].id.startsWith("metrics/event")) {
                                events.push({ id: rs[i].id, title: rs[i].title, description: rs[i].description || "No Description", number: rs[i].extraTitleInfo });
                            }
                        }
                        details.push(events.length)
                        fetchAllDetails(details)

                        // Sort the IDs based on the numeric part of the value
                        events.sort(sortByNumericId);
                        createTable(events, "events")

                        setTimeout(() => {
                            document.getElementById("sdrAlert").style.display = "none"; // Hide alert after 2 seconds
                        }, 2000);
                    })
                    .catch((error) => {
                        if (rsId != "") {
                            document.getElementById("rsAlert").style.display = "block";
                            document.getElementById("submitButton").disabled = false;
                            setTimeout(() => {
                                document.getElementById("rsAlert").style.display = "none"; // Hide alert after 2 seconds
                            }, 2000);
                            document.getElementById("spinner").style.display = "none"
                        }
                    });
            }
        }
    } else if (optionSelectedValue == "2") { // CJA DATA VIEWS OPTION SELECTED
        var dvName = document.getElementById("dvID").value;
        if (dvName == "") {
            document.getElementById("dvFeedback").style.display = "block"
        } else if (dvName != "") {
            var dvId = ""
            for (let i = 0; i < dvArr.length; ++i) {
                if (dvName == dvArr[i].name) {
                    dvId = dvArr[i].id;
                }
            }
            document.getElementById("spinner").style.display = "block"
            document.getElementById("submitButton").disabled = true;
            if (!accessToken) {
                console.warn("Access token is empty. Wait for token generation.");
                return;
            }
            // FETCHING DIMENSIONS
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: 'https://cja.adobe.io/data/dataviews/' + dvId + '/dimensions?expansion=id, name, description, sourceFieldId, sourceFieldName, storageId, dataSetIds, dataSetType, schemaType, sourceFieldType, tableName, type, required, hideFromReporting, schemaPath, hasData, segmentable, favorite, approved, tags, shares, usageSummary, notFound, hidden, fromGlobalLookup, multiValued, includeExcludeSetting, fieldDefinition, bucketingSetting, noValueOptionsSetting, defaultDimensionSort, persistenceSetting, isDeleted',
                headers: { 
                    'Authorization': `Bearer ${accessToken}`, 
                    'x-api-key': clientId, 
                    'x-gw-ims-org-id': orgId
                }
            };

            axios.request(config)
                .then((response) => {
                    var dimensions = response.data.content;
                    createTable2(dimensions, "dimension")
                    details.push(dimensions.length)
                    fetchAllDetails(details)

                    document.getElementById("allDetails").style.display = "block";
                    document.getElementById("myTable2").style.display = "block"
                    document.getElementById("exportReset").style.display = "block"
                    document.getElementById("submitButton").style.display = "none"
                    document.getElementById("dvID").disabled = true;
                    document.getElementById("sdrAlert").style.display = "block";
                    document.getElementById("searchInput").style.display = "block"

                    // Now fetch metrics
                    fetchMetrics()

                    setTimeout(() => {
                        document.getElementById("sdrAlert").style.display = "none"; // Hide alert after 2 seconds
                    }, 2000);
                    
                    if (document.getElementById("searchInput").style.display == "block") {
                        document.getElementById("spinner").style.display = "none"
                        document.getElementById("clearValue2").style.display = "none"
                        document.getElementById("optionSelect").disabled = true;
                        document.getElementById("scrollerLeft").style.display = "block"
                        document.getElementById("scrollerRight").style.display = "block"
                    }
            })
                .catch((error) => {
                    document.getElementById("dvAlert").style.display = "block"
                    document.getElementById("submitButton").disabled = false;
                    setTimeout(() => {
                        document.getElementById("dvAlert").style.display = "none"; // Hide alert after 2 seconds
                    }, 2000);
                    document.getElementById("spinner").style.display = "none"
                });
            
            // FETCHING METRICS
            function fetchMetrics () {
                let config = {
                    method: 'get',
                    maxBodyLength: Infinity,
                    url: 'https://cja.adobe.io/data/dataviews/' + dvId + '/metrics?expansion=id, name, description, sourceFieldId, sourceFieldName, storageId, dataSetIds, dataSetType, schemaType, sourceFieldType, tableName, type, required, hideFromReporting, schemaPath, hasData, segmentable, favorite, approved, tags, shares, usageSummary, notFound, hidden, fromGlobalLookup, multiValued, includeExcludeSetting, fieldDefinition, isDeleted, attributionSetting, formatSetting',
                    headers: { 
                        'Authorization': `Bearer ${accessToken}`,
                        'x-api-key': clientId, 
                        'x-gw-ims-org-id': orgId
                    }
                };

                axios.request(config)
                    .then((response) => {
                        var metrics = response.data.content
                        createTable2(metrics, "metric")
                        details.push(metrics.length)
                        fetchAllDetails(details)
                        setTimeout(() => {
                            document.getElementById("sdrAlert").style.display = "none"; // Hide alert after 2 seconds
                        }, 2000);
                })
                    .catch((error) => {
                        document.getElementById("dvAlert").style.display = "block";
                        document.getElementById("submitButton").disabled = false;
                        setTimeout(() => {
                            document.getElementById("dvAlert").style.display = "none"; // Hide alert after 2 seconds
                        }, 2000);
                        document.getElementById("spinner").style.display = "none"
                });
            }
        }
    }
}

function download () {
  document.getElementById('myForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission (page reload)
  });
    var optionSelectedValue = optionSelected();
    if (optionSelectedValue == "1") {
        var rsId = document.getElementById("rsID").value;
        // Get the table element
        const table = document.getElementById('myTable');
            
        // Use SheetJS to convert the table to a workbook
        const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet 1" });

        // Generate an Excel file and trigger the download
        var fileName = rsId + "_SDR.xlsx"
        XLSX.writeFile(wb, fileName);

    } else if (optionSelectedValue == "2") {
        var dvId = document.getElementById("dvID").value;
        // Get the table element
        const table = document.getElementById('myTable2');
            
        // Use SheetJS to convert the table to a workbook
        const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet 1" });

        // Generate an Excel file and trigger the download
        var fileName = dvId + "_SDR.xlsx"
        XLSX.writeFile(wb, fileName);
    }
}

function resetButton () {
    document.getElementById("optionSelect").value = 0
    document.getElementById("optionSelect").disabled = false
    document.getElementById("rsID").value = ""
    document.getElementById("submitButton").style.display = "none"
    document.getElementById("submitButton").disabled = false;
    document.getElementById("myTable").style.display = "none"
    document.getElementById("exportReset").style.display = "none"
    document.getElementById("rsID").disabled = false;
    document.getElementById('tableBody').innerHTML = ""
    document.getElementById("rsFeedback").style.display = "none"
    document.getElementById("searchInput").style.display = "none"
    document.getElementById("searchInput").value = ""
    document.getElementById("rsID").readOnly = false;
    document.getElementById("clearValue").style.display = "block"
    document.getElementById("rsContainer").style.display = "none"
    document.getElementById("rsManager").style.display = "none"
    document.getElementById("dvManager").style.display = "none"
    document.getElementById("dvID").value = ""
    document.getElementById("myTable2").style.display = "none"
    document.getElementById("dvID").disabled = false;
    document.getElementById('tableBody2').innerHTML = ""
    document.getElementById("dvFeedback").style.display = "none"
    document.getElementById("dvID").readOnly = false;
    document.getElementById("dvContainer").style.display = "none"
    document.getElementById("clearValue2").style.display = "block"
    document.getElementById("scrollerLeft").style.display = "none"
    document.getElementById("scrollerRight").style.display = "none"
    document.getElementById("allDetails").style.display = "none";
    document.getElementById('allDetails').innerHTML = ''
    details = [];
}

function rsInputFocus () {
    document.getElementById("rsFeedback").style.display = "none"
    document.getElementById("dvFeedback").style.display = "none"
    document.getElementById("optionSelect").disabled = false;
    document.getElementById("atFeedback").style.display = "none"
    document.getElementById("clientIdFeedback").style.display = "none"
    document.getElementById("orgIdFeedback").style.display = "none"
    document.getElementById("companyIdFeedback").style.display = "none"

}

function searchTable () {
    var optionSelectedValue = optionSelected();
    if (optionSelectedValue == "1") {
        let input = document.getElementById("searchInput").value.toLowerCase();
        let table = document.getElementById("myTable");
        let rows = table.getElementsByTagName("tr");

        for (let i = 1; i < rows.length; i++) {  // Skip the header row
            let cells = rows[i].getElementsByTagName("td");
            let rowContainsSearchTerm = false;

            for (let j = 0; j < cells.length; j++) {
                if (cells[j].innerText.toLowerCase().includes(input)) {
                    rowContainsSearchTerm = true;
                    break;
                }
            }

            rows[i].style.display = rowContainsSearchTerm ? "" : "none";
        }
    }
    else if (optionSelectedValue == "2") {
        let input = document.getElementById("searchInput").value.toLowerCase();
        let table = document.getElementById("myTable2");
        let rows = table.getElementsByTagName("tr");

        for (let i = 1; i < rows.length; i++) {  // Skip the header row
            let cells = rows[i].getElementsByTagName("td");
            let rowContainsSearchTerm = false;

            for (let j = 0; j < cells.length; j++) {
                if (cells[j].innerText.toLowerCase().includes(input)) {
                    rowContainsSearchTerm = true;
                    break;
                }
            }

            rows[i].style.display = rowContainsSearchTerm ? "" : "none";
        }
    }
    
}

function clearButton () {
    document.getElementById("rsID").value = "";
    document.getElementById("rsID").readOnly = false;
    document.getElementById("autocomplete-dropdown").innerHTML = ""
    document.getElementById("dvID").value = "";
    document.getElementById("dvID").readOnly = false;
    document.getElementById("autocomplete-dropdown2").innerHTML = ""
}

function scrollTable(amount) {
    document.getElementById("tableContainer2").scrollBy({ left: amount, behavior: "smooth" });
}

function fetchAllDetails (arr) {
    if (arr.length == 4) {
        document.getElementById("allDetails").innerHTML =
            `<p><strong>High Level Overview : </strong><em>There are <strong>${arr[0]} eVars</strong>, <strong>${arr[1]} props</strong>, <strong>${arr[2]} listVars</strong> and <strong>${arr[3]} events</strong> present in the selected report suite. (Total = <strong>${arr[0]+arr[1]+arr[2]+arr[3]} variables</strong>)</em>`;
    } else if (arr.length == 2) {
        document.getElementById("allDetails").innerHTML =
            `<p><strong>High Level Overview : </strong><em>There are <strong>${arr[0]} dimensions</strong> and <strong>${arr[1]} metrics</strong> present in the selected data view. (Total = <strong>${arr[0]+arr[1]} variables</strong>)</em>`;
    }
}