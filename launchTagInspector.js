console.log("Welcome to Real Time Launch Inspector tool");
var accessToken = "";
var clientId = "";
var orgId = "";
var companyId = "";
var cId = "";
var ptArr = []; // Declare ptArr globally

function submitToken() {
    accessToken = document.getElementById("message-text").value.trim();
    clientId = document.getElementById("clientId").value.trim();
    orgId = document.getElementById("orgId").value.trim();
    companyId = document.getElementById("companyId").value.trim();
    cId = document.getElementById("tagCompanyId").value.trim();

    var ptValue = "https://experience.adobe.com/#/@" + document.getElementById("companyId").value.split('0')[0] + "/sname:prod/platform/data-collection/tags/companies/" + document.getElementById("tagCompanyId").value + "/properties"
    document.getElementById("ptManager").setAttribute("href", ptValue);

    let atFeedback = document.getElementById("atFeedback");
    let clientFeedback = document.getElementById("clientIdFeedback");
    let orgFeedback = document.getElementById("orgIdFeedback");
    let companyFeedback = document.getElementById("companyIdFeedback");
    let tagCompanyFeedback = document.getElementById("tagCompanyIdFeedback");

    let tokenPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    let clientIdPattern = /^[a-f0-9]{32}$/i;
    let orgIdPattern = /^[A-F0-9]{24}@AdobeOrg$/i;
    let companyIdPattern = /^[a-z0-9]+$/;
    let tagCompanyIdPattern = /^(CO)?[a-f0-9]{32}$/i;

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

    if (!tagCompanyIdPattern.test(cId)) {
        tagCompanyFeedback.style.display = "block";
        valid = false;
    }

    if (!tokenPattern.test(accessToken)) {
        atFeedback.style.display = "block";
        valid = false;
    }

    if (!valid) return;

     // Save credentials
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("clientId", clientId);
    localStorage.setItem("orgId", orgId);
    localStorage.setItem("globalCompanyId", companyId);
    localStorage.setItem("tagCompanyId", cId)

    bootstrap.Modal
        .getInstance(document.getElementById("exampleModal"))
        .hide();

    //fetchToken(accessToken, clientId, orgId, companyId, cId);
}

function optionSelected () {
    var optionSelectedValue = document.getElementById("optionSelect").value;
    document.getElementById("ptFeedback").style.display = "none"
    document.getElementById("autocomplete-dropdown3").innerHTML = ""
    document.getElementById("ptID").readOnly = false;
    
    var result = "";
    if (optionSelectedValue == "0") {
        document.getElementById("ptContainer").style.display = "none"
        document.getElementById("ptManager").style.display = "none"
        document.getElementById("submitButton").style.display = "none"
        document.getElementById("ptID").value = "";
        result = 0;
    } else if (optionSelectedValue == "1") {
        fetchProperties(accessToken, clientId, orgId, companyId, cId); // fetch properties using the token
        document.getElementById("ptContainer").style.display = "flex"
        document.getElementById("ptManager").style.display = "flex"
        document.getElementById("submitButton").style.display = "flex"
        result = 1;
    }
    return result;
}

function fetchProperties (token, clientId, orgId, companyId, cId) {
    let ptData = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://reactor.adobe.io/companies/' + cId + '/properties/?page[size]=500',
        headers: { 
            'Accept': 'application/vnd.api+json;revision=1',
            'Content-Type': 'application/vnd.api+json', 
            'Authorization': `Bearer ${token}`,  // Pass token dynamically
            'x-api-key': clientId, 
            'x-gw-ims-org-id': orgId
        }
    };

    axios.request(ptData)
    .then((response) => {
        ptArr = response.data.data.map(item => ({
            id: item.id,      // Used on the backend
            name: item.attributes.name   // Used on the frontend
        })); // Update ptArr globally
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
    });
}

// Autocomplete functionality
document.addEventListener("DOMContentLoaded", function () {
    let myModal = new bootstrap.Modal(document.getElementById("exampleModal"));
    myModal.show();
    const ptInput = document.getElementById("ptID");
    const dropdown3 = document.getElementById("autocomplete-dropdown3");
    
    ptInput.addEventListener("input", function () {
        const value = ptInput.value.toLowerCase();
        dropdown3.innerHTML = "";

        if (value) {
            // Ensure ptArr has data before filtering
            if (ptArr.length === 0) {
                console.warn("ptArr is empty. Wait for API response.");
                return;
            }
            // Filter ptArr dynamically
            const filteredSuggestions = ptArr.filter(item => item.name.toLowerCase().includes(value));

            filteredSuggestions.forEach(suggestion => {
                const item = document.createElement("li");
                item.classList.add("list-group-item", "list-group-item-action");
                item.textContent = suggestion.name;
                item.addEventListener("click", function () {
                    ptInput.value = suggestion.name; // Display 'name' in input
                    ptInput.dataset.id = suggestion.id; // Store 'id' as a dataset attribute for backend use
                    ptInput.readOnly = true;
                    dropdown3.innerHTML = "";
                });
                dropdown3.appendChild(item);
            });
        }
    });
});

function Submit () {
    document.getElementById('myForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent form submission (page reload)
    });
    var optionSelectedValue = optionSelected();
    document.getElementById("optionSelect").disabled = true
    document.getElementById("ptID").readOnly = true

    function createTable3 (variable, type) {
        for (let i = 0; i < variable.length; ++i) {
            const newRow = document.createElement('tr');
            // Create the columns for each row dynamically
            const rowIndex = document.createElement('th');
            rowIndex.scope = 'row';
            rowIndex.textContent = document.getElementById('tableBody3').rows.length + 1; // Increment the row number
            rowIndex.setAttribute("class", "text-center font-monospace")

            const adobeVariableType = document.createElement('td');
            adobeVariableType.textContent = type;
            adobeVariableType.setAttribute("class", "fst-italic font-monospace");

            const componentName = document.createElement('td');
            componentName.textContent = type == "Extension"? variable[i].attributes.display_name : variable[i].attributes.name;
            componentName.setAttribute("class", "font-monospace");

            const enabledOrDisabled = document.createElement('td');
            enabledOrDisabled.textContent = variable[i].attributes.enabled == true ? "Enabled" : "Disabled";
            enabledOrDisabled.setAttribute("class", "font-monospace");

            const liveInProduction = document.createElement('td');
            liveInProduction.textContent = variable[i].attributes.published == true ? "Yes" : "No";
            liveInProduction.setAttribute("class", "font-monospace");

            const latestRevisionNumber = document.createElement('td');
            latestRevisionNumber.textContent = variable[i].meta.latest_revision_number;
            latestRevisionNumber.setAttribute("class", "font-monospace text-wrap");

            // Function to create Consultant Details modal cell
            const createConsultantModalCell = (createdBy, createdAt, updatedBy, updatedAt) => {
            const td = document.createElement("td");
            td.className = "font-monospace text-wrap";

            const createdDate = new Date(createdAt).toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            });

            const updatedDate = new Date(updatedAt).toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            });

            const modalId = `modal_consultant_${Math.random().toString(36).substring(2, 8)}`;
            td.innerHTML = `
                <button type="button" class="btn btn-link btn-sm" data-bs-toggle="modal" data-bs-target="#${modalId}">
                 View Details
                </button>

                <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-scrollable">
                    <div class="modal-content bg-light">
                    <div class="modal-header">
                        <h5 class="modal-title text-primary" id="${modalId}Label">Consultant Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" style="background-color: #f8f9fa;">
                        <strong>Created By:</strong> ${createdBy} <br>
                        <strong>Created At:</strong> ${createdDate} <hr>
                        <strong>Last Modified By:</strong> ${updatedBy} <br>
                        <strong>Last Modified At:</strong> ${updatedDate}
                    </div>
                    <div class="modal-footer bg-light">
                        <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                    </div>
                    </div>
                </div>
                </div>
            `;
                return td;
            };
              // Append the columns to the row
            newRow.appendChild(rowIndex);
            newRow.appendChild(adobeVariableType);
            newRow.appendChild(componentName);
            newRow.appendChild(enabledOrDisabled);
            newRow.appendChild(liveInProduction);
            newRow.appendChild(latestRevisionNumber);
            // Append the Consultant Details column to the row
            newRow.appendChild(createConsultantModalCell(
                variable[i].attributes.created_by_email,
                variable[i].attributes.created_at,
                variable[i].attributes.updated_by_email,
                variable[i].attributes.updated_at
            ));
            
            if (type == "Rule") {
                // FETCH RULE COMPONENTS
             let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: 'https://reactor.adobe.io/rules/' + variable[i].id + '/rule_components',
                 headers: { 
                    'Accept': 'application/vnd.api+json;revision=1',
                    'Content-Type': 'application/vnd.api+json',
                    'Authorization': `Bearer ${accessToken}`, 
                    'x-api-key': clientId, 
                    'x-gw-ims-org-id': orgId
                }
            };

            axios.request(config)
            .then((response) => {
                const ruleComponentsArr = response.data.data;

                let eventsHtml = "";
                let conditionsHtml = "";
                let actionsHtml = "";

                // --- Parse all rule components ---
                for (let j = 0; j < ruleComponentsArr.length; j++) {
                    const component = ruleComponentsArr[j];
                    const attrs = component.attributes;
                    const delegateId = attrs.delegate_descriptor_id.split("::");
                    const componentType = delegateId[1];

                    let readableSettings = "";

                    try {
                        const parsed = JSON.parse(attrs.settings);

                        if (componentType === "actions" && delegateId[2] === "custom-code" && parsed.source) {
                            readableSettings = parsed.source
                                .replace(/\\n/g, '\n')
                                .replace(/\\"/g, '"');
                        } else {
                            readableSettings = JSON.stringify(parsed, null, 2)
                                .replace(/\\n/g, '\n')
                                .replace(/\\"/g, '"');
                        }
                    } catch (e) {
                        readableSettings = attrs.settings?.replace(/\\n/g, '\n').replace(/\\"/g, '"') || "";
                    }

                    const preId = `pre_${component.id}_${Math.random().toString(36).substring(2, 8)}`;

                    const preHtml = `
                        <div class="position-relative mb-3" style="display: inline-block; width: 100%;">
                            <pre id="${preId}" class="p-3 rounded border code-block"
                                style="background-color: #f1f3f5; color: #212529; white-space: pre-wrap; word-break: break-word; margin-bottom: 0;">${readableSettings}</pre>
                            <button type="button" class="btn btn-sm btn-outline-primary copy-btn" data-target="${preId}"
                                style="position: absolute; top: 8px; right: 8px; z-index: 10; display: none;">
                                Copy
                            </button>
                        </div>
                    `;

                    if (componentType === "events") eventsHtml += `<strong>${attrs.name}</strong>: ${preHtml}<hr>`;
                    if (componentType === "conditions") conditionsHtml += `<strong>${attrs.name}</strong>: ${preHtml}<hr>`;
                    if (componentType === "actions") actionsHtml += `<strong>${attrs.name}</strong>: ${preHtml}<hr>`;
                }

                // --- Create single combined modal with Tabs ---
                const createTabbedModalCell = (events, conditions, actions) => {
                    const td = document.createElement("td");
                    td.className = "font-monospace text-wrap";

                    if (!events.trim() && !conditions.trim() && !actions.trim()) {
                        td.innerHTML = `<span class="text-wrap">Settings not available</span>`;
                        return td;
                    }

                    const modalId = `modal_all_${Math.random().toString(36).substring(2, 8)}`;
                    td.innerHTML = `
                        <button type="button" class="btn btn-link btn-sm" data-bs-toggle="modal" data-bs-target="#${modalId}">
                            View Details
                        </button>

                        <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
                            <div class="modal-dialog modal-xl modal-dialog-scrollable">
                                <div class="modal-content bg-light">
                                    <div class="modal-header bg-white border-bottom">
                                        <h5 class="modal-title text-primary" id="${modalId}Label">Rule Details</h5>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>

                                    <ul class="nav nav-tabs px-3 pt-2" id="${modalId}Tabs" role="tablist" style="background-color:#f8f9fa;">
                                        <li class="nav-item" role="presentation">
                                            <button class="nav-link active text-dark" id="${modalId}-events-tab" data-bs-toggle="tab"
                                                data-bs-target="#${modalId}-events" type="button" role="tab">Events</button>
                                        </li>
                                        <li class="nav-item" role="presentation">
                                            <button class="nav-link text-dark" id="${modalId}-conditions-tab" data-bs-toggle="tab"
                                                data-bs-target="#${modalId}-conditions" type="button" role="tab">Conditions</button>
                                        </li>
                                        <li class="nav-item" role="presentation">
                                            <button class="nav-link text-dark" id="${modalId}-actions-tab" data-bs-toggle="tab"
                                                data-bs-target="#${modalId}-actions" type="button" role="tab">Actions</button>
                                        </li>
                                    </ul>

                                    <div class="modal-body tab-content" style="background-color: #f8f9fa;">
                                        <div class="tab-pane fade show active" id="${modalId}-events" role="tabpanel">
                                            ${events.trim() ? events : "<em>No Events Found</em>"}
                                        </div>
                                        <div class="tab-pane fade" id="${modalId}-conditions" role="tabpanel">
                                            ${conditions.trim() ? conditions : "<em>No Conditions Found</em>"}
                                        </div>
                                        <div class="tab-pane fade" id="${modalId}-actions" role="tabpanel">
                                            ${actions.trim() ? actions : "<em>No Actions Found</em>"}
                                        </div>
                                    </div>

                                    <div class="modal-footer bg-white border-top">
                                        <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    return td;
                };

                // Append the single modal column
                newRow.appendChild(createTabbedModalCell(eventsHtml, conditionsHtml, actionsHtml));

                // Copy functionality and hover effects
                setTimeout(() => {
                    document.querySelectorAll('.position-relative').forEach(container => {
                        const btn = container.querySelector('.copy-btn');
                        container.addEventListener('mouseenter', () => btn.style.display = 'inline-block');
                        container.addEventListener('mouseleave', () => btn.style.display = 'none');
                    });

                    document.querySelectorAll('.copy-btn').forEach(btn => {
                        btn.addEventListener('click', function () {
                            const targetId = this.getAttribute('data-target');
                            const text = document.getElementById(targetId).innerText;
                            navigator.clipboard.writeText(text)
                                .then(() => {
                                    this.textContent = 'Copied!';
                                    setTimeout(() => this.textContent = 'Copy', 1500);
                                })
                                .catch(() => alert('Failed to copy.'));
                        });
                    });
                }, 500);
                var link = 'https://experience.adobe.com/#/@' + companyId.split("0")[0] + '/sname:prod/platform/data-collection/tags/companies/' + cId + '/properties/' + ptId + '/rules/' + variable[i].id;
                const linkDetails = document.createElement('td');
                linkDetails.innerHTML = `
                <a href="${link}" target="_blank">
                    ${link}
                </a>
                `;

                linkDetails.className = "font-monospace";
                newRow.appendChild(linkDetails);

            }).catch((error) => {
                    console.log(error);
                });
            } else if (type == "Data Element") {
                const dataElement = variable[i];
                const attrs = dataElement.attributes;
                let readableSettings = "";

                try {
                    const parsed = JSON.parse(attrs.settings);
                    if (attrs.delegate_descriptor_id.includes("custom-code") && parsed.source) {
                        readableSettings = parsed.source
                            .replace(/\\n/g, '\n')
                            .replace(/\\"/g, '"');
                    } else {
                        readableSettings = JSON.stringify(parsed, null, 2)
                            .replace(/\\n/g, '\n')
                            .replace(/\\"/g, '"');
                    }
                } catch (e) {
                    readableSettings = attrs.settings?.replace(/\\n/g, '\n').replace(/\\"/g, '"') || "";
                }

                const preId = `pre_${dataElement.id}_${Math.random().toString(36).substring(2, 8)}`;

                // Code block (light gray background)
                const codeBlock = `
                    <div class="position-relative mb-3" style="display: inline-block; width: 100%;">
                        <pre id="${preId}" class="p-3 rounded border code-block"
                            style="background-color: #f1f3f5; color: #212529; white-space: pre-wrap; word-break: break-word; margin-bottom: 0;">${readableSettings}</pre>
                        <button type="button" class="btn btn-sm btn-outline-primary copy-btn" data-target="${preId}"
                            style="position: absolute; top: 8px; right: 8px; z-index: 10; display: none;">
                            Copy
                        </button>
                    </div>
                `;

                const modalId = `modal_dataelement_${Math.random().toString(36).substring(2, 8)}`;
                const td = document.createElement("td");
                td.className = "font-monospace text-wrap";

                td.innerHTML = `
                    <button type="button" class="btn btn-link btn-sm" data-bs-toggle="modal" data-bs-target="#${modalId}">
                        View Details
                    </button>

                    <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
                        <div class="modal-dialog modal-xl modal-dialog-scrollable">
                            <div class="modal-content bg-light">
                                <div class="modal-header bg-white border-bottom">
                                    <h5 class="modal-title text-primary" id="${modalId}Label">Data Element Details</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>

                                <div class="modal-body" style="background-color: #f8f9fa;">
                                    <strong>Extension Name:</strong> ${attrs.delegate_descriptor_id.split("::")[0]} <br>
                                    <strong>Data Element Type:</strong> ${attrs.delegate_descriptor_id.split("::").pop()} <br>
                                    <strong>Default Value:</strong> ${attrs.default_value == ""? '""' : (attrs.default_value == null? "Not Set" : attrs.default_value)} <br>
                                    <strong>Force Lowercase Value:</strong> ${attrs.force_lower_case == false? "Not Enabled" : "Enabled"} <br>
                                    <strong>Clean Text:</strong> ${attrs.clean_text == false? "Not Enabled": "Enabled"} <br>
                                    <strong>Storage Duration:</strong> ${attrs.storage_duration == null? "None" : attrs.storage_duration} <hr>
                                    <h6 class="text-secondary">Code / Settings:</h6>
                                    ${readableSettings ? codeBlock : "<em>Settings not available</em>"}
                                </div>

                                <div class="modal-footer bg-white border-top">
                                    <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // Append modal cell to row
                newRow.appendChild(td);

                // Copy button hover & click behavior
                setTimeout(() => {
                    document.querySelectorAll('.position-relative').forEach(container => {
                        const btn = container.querySelector('.copy-btn');
                        container.addEventListener('mouseenter', () => btn.style.display = 'inline-block');
                        container.addEventListener('mouseleave', () => btn.style.display = 'none');
                    });

                    document.querySelectorAll('.copy-btn').forEach(btn => {
                        btn.addEventListener('click', function () {
                            const targetId = this.getAttribute('data-target');
                            const text = document.getElementById(targetId).innerText;
                            navigator.clipboard.writeText(text)
                                .then(() => {
                                    this.textContent = 'Copied!';
                                    setTimeout(() => this.textContent = 'Copy', 1500);
                                })
                                .catch(() => alert('Failed to copy.'));
                        });
                    });
                }, 500);

                var link = 'https://experience.adobe.com/#/@' + companyId.split("0")[0] + '/sname:prod/platform/data-collection/tags/companies/' + cId + '/properties/' + ptId + '/dataElements/' + variable[i].id;
                const linkDetails = document.createElement('td');
                linkDetails.innerHTML = `
                <a href="${link}" target="_blank">
                    ${link}
                </a>
                `;

                linkDetails.className = "font-monospace";
                newRow.appendChild(linkDetails);
            } else if (type == "Extension") {           
                const extension = variable[i];
                const attrs = extension.attributes;
                let readableSettings = "";

                try {
                    const parsed = JSON.parse(attrs.settings);
                        readableSettings = JSON.stringify(parsed, null, 2)
                            .replace(/\\n/g, '\n')
                            .replace(/\\"/g, '"');
                } catch (e) {
                    readableSettings = attrs.settings?.replace(/\\n/g, '\n').replace(/\\"/g, '"') || "";
                }

                const preId = `pre_${extension.id}_${Math.random().toString(36).substring(2, 8)}`;

                // Code block (light gray background)
                const codeBlock = `
                    <div class="position-relative mb-3" style="display: inline-block; width: 100%;">
                        <pre id="${preId}" class="p-3 rounded border code-block"
                            style="background-color: #f1f3f5; color: #212529; white-space: pre-wrap; word-break: break-word; margin-bottom: 0;">${readableSettings}</pre>
                        <button type="button" class="btn btn-sm btn-outline-primary copy-btn" data-target="${preId}"
                            style="position: absolute; top: 8px; right: 8px; z-index: 10; display: none;">
                            Copy
                        </button>
                    </div>
                `;

                const modalId = `modal_extension_${Math.random().toString(36).substring(2, 8)}`;
                const td = document.createElement("td");
                td.className = "font-monospace text-wrap";

                td.innerHTML = `
                    <button type="button" class="btn btn-link btn-sm" data-bs-toggle="modal" data-bs-target="#${modalId}">
                        View Details
                    </button>

                    <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
                        <div class="modal-dialog modal-xl modal-dialog-scrollable">
                            <div class="modal-content bg-light">
                                <div class="modal-header bg-white border-bottom">
                                    <h5 class="modal-title text-primary" id="${modalId}Label">Extension Details</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>

                                <div class="modal-body" style="background-color: #f8f9fa;">
                                    <strong>Current Version:</strong> ${attrs.version} <hr>
                                    <h6 class="text-secondary">Code / Settings:</h6>
                                    ${readableSettings ? codeBlock : "<em>Settings not available</em>"}
                                </div>

                                <div class="modal-footer bg-white border-top">
                                    <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // Append modal cell to row
                newRow.appendChild(td);

                // Copy button hover & click behavior
                setTimeout(() => {
                    document.querySelectorAll('.position-relative').forEach(container => {
                        const btn = container.querySelector('.copy-btn');
                        container.addEventListener('mouseenter', () => btn.style.display = 'inline-block');
                        container.addEventListener('mouseleave', () => btn.style.display = 'none');
                    });

                    document.querySelectorAll('.copy-btn').forEach(btn => {
                        btn.addEventListener('click', function () {
                            const targetId = this.getAttribute('data-target');
                            const text = document.getElementById(targetId).innerText;
                            navigator.clipboard.writeText(text)
                                .then(() => {
                                    this.textContent = 'Copied!';
                                    setTimeout(() => this.textContent = 'Copy', 1500);
                                })
                                .catch(() => alert('Failed to copy.'));
                        });
                    });
                }, 500);    
                var link = 'https://experience.adobe.com/#/@' + companyId.split("0")[0] + '/sname:prod/platform/data-collection/tags/companies/' + cId + '/properties/' + ptId + '/extensions/' + variable[i].id;
                const linkDetails = document.createElement('td');
                linkDetails.innerHTML = `
                <a href="${link}" target="_blank">
                    ${link}
                </a>
                `;

                linkDetails.className = "font-monospace";
                newRow.appendChild(linkDetails);
            }
            // Append the new row to the table body
            document.getElementById('tableBody3').appendChild(newRow);
        }
    }
    // LAUNCH PROPERTY OPTION SELECTED
    if (optionSelectedValue == "1") {
        var ptName = document.getElementById("ptID").value;
        if (ptName == "") {
            document.getElementById("ptFeedback").style.display = "block"
            if (document.getElementById("ptFeedback").style.display = "block") {
                document.getElementById("ptID").readOnly = false
            }
            
        } else if (ptName != "") {
            var ptId = ""
            for (let i = 0; i < ptArr.length; ++i) {
                if (ptName == ptArr[i].name) {
                    ptId = ptArr[i].id;
                }
            }
            document.getElementById("spinner").style.display = "block"
            document.getElementById("submitButton").disabled = true;
            if (!accessToken) {
                console.warn("Access token is empty. Wait for token generation.");
                return;
            }
            async function fetchAllRulesAndRender(ptId, accessToken, clientId, orgId) {
                let allRules = [];
                let allDataElements = [];
                let allExtensions = [];
                const pageSize = 1000;

                try {
                    // Fetch all rules
                    let pageRules = 1;
                    while (true) {
                        const configRules = {
                            method: 'get',
                            maxBodyLength: Infinity,
                            url: `https://reactor.adobe.io/properties/${ptId}/rules/?page[size]=${pageSize}&page[number]=${pageRules}`,
                            headers: { 
                                'Accept': 'application/vnd.api+json;revision=1',
                                'Content-Type': 'application/vnd.api+json',
                                'Authorization': `Bearer ${accessToken}`, 
                                'x-api-key': clientId, 
                                'x-gw-ims-org-id': orgId
                            }
                        };

                        const responseRules = await axios.request(configRules);
                        allRules = allRules.concat(responseRules.data.data);

                        const pagination = responseRules.data.meta?.pagination;
                        if (!pagination || !pagination.next_page) break;
                        pageRules++;
                    }

                    // Fetch all data elements
                    let pageData = 1;
                    while (true) {
                        const configData = {
                            method: 'get',
                            maxBodyLength: Infinity,
                            url: `https://reactor.adobe.io/properties/${ptId}/data_elements?page[size]=${pageSize}&page[number]=${pageData}`,
                            headers: { 
                                'Accept': 'application/vnd.api+json;revision=1',
                                'Content-Type': 'application/vnd.api+json',
                                'Authorization': `Bearer ${accessToken}`, 
                                'x-api-key': clientId, 
                                'x-gw-ims-org-id': orgId
                            }
                        };

                        const responseData = await axios.request(configData);
                        allDataElements = allDataElements.concat(responseData.data.data);

                        const pagination = responseData.data.meta?.pagination;
                        if (!pagination || !pagination.next_page) break;
                        pageData++;
                    }

                    // Fetch all extensions
                    let pageExtension = 1;
                    while (true) {
                        const configData = {
                            method: 'get',
                            maxBodyLength: Infinity,
                            url: `https://reactor.adobe.io/properties/${ptId}/extensions?page[size]=${pageSize}&page[number]=${pageExtension}`,
                            headers: { 
                                'Accept': 'application/vnd.api+json;revision=1',
                                'Content-Type': 'application/vnd.api+json',
                                'Authorization': `Bearer ${accessToken}`, 
                                'x-api-key': clientId, 
                                'x-gw-ims-org-id': orgId
                            }
                        };

                        const responseData = await axios.request(configData);
                        allExtensions = allExtensions.concat(responseData.data.data);

                        const pagination = responseData.data.meta?.pagination;
                        if (!pagination || !pagination.next_page) break;
                        pageData++;
                    }

                    createTable3(allRules, "Rule");
                    createTable3(allDataElements, "Data Element");
                    createTable3(allExtensions, "Extension")

                    document.getElementById("allDetails").innerHTML = `
                    <p><strong>High Level Overview : </strong>
                        <em>There are <strong>${allRules.length} rules</strong>, <strong>${allDataElements.length} data elements</strong> and <strong>${allExtensions.length} extensions</strong> present in the selected property. (Total = <strong>${allRules.length+allDataElements.length+allExtensions.length} components</strong>)</em>
                    </p>
                    `;

                    document.getElementById("myTable3").style.display = "block";
                    document.getElementById("exportReset").style.display = "block";
                    document.getElementById("submitButton").style.display = "none";
                    document.getElementById("ptID").disabled = true;
                    document.getElementById("sdrAlert").style.display = "block";
                    document.getElementById("searchInput").style.display = "block";
                    document.getElementById("allDetails").style.display = "block";

                    setTimeout(() => {
                        document.getElementById("sdrAlert").style.display = "none";
                    }, 2000);

                    if (document.getElementById("searchInput").style.display === "block") {
                        document.getElementById("spinner").style.display = "none";
                        document.getElementById("clearValue3").style.display = "none";
                        document.getElementById("optionSelect").disabled = true;
                        document.getElementById("scrollerLeft").style.display = "block";
                        document.getElementById("scrollerRight").style.display = "block";
                    }
                } catch (error) {
                    console.error("Error fetching rules or data elements or extensions:", error);
                    document.getElementById("ptAlert").style.display = "block";
                    document.getElementById("submitButton").disabled = false;
                    setTimeout(() => {
                        document.getElementById("ptAlert").style.display = "none";
                    }, 2000);
                    document.getElementById("spinner").style.display = "none";
                    if (document.getElementById("ptAlert").style.display = "block") {
                        document.getElementById("ptID").readOnly = false;
                    }
                }
            }
            fetchAllRulesAndRender(ptId, accessToken, clientId, orgId);
        }
    }
}

function download() {
  try {
    var optionSelectedValue = optionSelected();
  } catch (e) {
    optionSelectedValue = "1";
  }
  if (optionSelectedValue != "1") return;

  const ptId = (document.getElementById("ptID")?.value || "export").trim();
  const table = document.getElementById("myTable3");
  if (!table) return alert('Table element "myTable3" not found.');

  // ---------- helpers ----------
  function cleanText(txt) {
    return (txt || "")
      .replace(/\b(copy|close|cancel|ok|done|view details)\b/gi, "")
      .replace(/\s+\n/g, "\n")
      .replace(/\n\s+/g, "\n")
      .trim();
  }

  function getModalByTrigger(trigger) {
    if (!trigger) return null;
    const target =
      trigger.getAttribute("data-bs-target") ||
      trigger.getAttribute("data-target") ||
      trigger.getAttribute("href");
    if (!target) return null;
    const id = target.replace(/^#/, "");
    return document.getElementById(id);
  }

  // Formats Rule Details modals with tabs: Events, Conditions, Actions.
  function extractModalDetails(modal) {
    if (!modal) return "";
    const body = modal.querySelector(".modal-body");
    if (!body) return "";

    const tabLinks = Array.from(
      modal.querySelectorAll('.nav-tabs [data-bs-toggle="tab"], .nav-tabs .nav-link, .nav-tabs a')
    ).map(el => ({
      el,
      title: (el.innerText || "").trim(),
      target: el.getAttribute("data-bs-target") || el.getAttribute("href")
    }));

    const hasECA = ["events", "conditions", "actions"].every(h =>
      tabLinks.some(t => t.title.toLowerCase().includes(h))
    );

    if (!hasECA) {
      return cleanText(body.innerText);
    }

    const sections = [];
    ["Events", "Conditions", "Actions"].forEach(label => {
      const link = tabLinks.find(t => t.title.toLowerCase().includes(label.toLowerCase()));
      if (!link) return;

      let pane = null;
      if (link.target && link.target.startsWith("#")) {
        pane = modal.querySelector(link.target);
      }
      if (!pane) {
        pane = Array.from(modal.querySelectorAll(".tab-pane")).find(
          p => p.getAttribute("aria-labelledby") === link.el.id
        );
      }

      const details = cleanText(pane ? pane.innerText : "") || "—";
      sections.push(`${label}\n${details}`);
    });

    return sections.join("\n\n").trim();
  }

  // ---------- choose rows to export ----------
  const headerRows = table.tHead ? Array.from(table.tHead.rows) : Array.from(table.querySelectorAll("thead tr"));
  const bodyRows = table.tBodies.length
    ? Array.from(table.tBodies[0].rows)
    : Array.from(table.querySelectorAll("tbody tr"));

  // A row is considered "visible" if it's not hidden via attribute/class/style.
  const isRowVisible = (row) => {
    if (!row) return false;
    if (row.hidden) return false;
    const cs = getComputedStyle(row);
    if (cs.display === "none" || cs.visibility === "hidden") return false;
    if (row.classList.contains("d-none")) return false;
    return true;
  };

  const visibleBodyRows = bodyRows.filter(isRowVisible);

  // If some rows are hidden, we assume a filter/search is active.
  const isFilterActive = visibleBodyRows.length !== bodyRows.length;

  const rowsForExport = [
    ...headerRows,                         // always include header(s)
    ...(isFilterActive ? visibleBodyRows : bodyRows) // filtered vs all
  ];

  // ---------- build export array ----------
  const aoa = [];

  rowsForExport.forEach(row => {
    const cells = Array.from(row.querySelectorAll("th, td"));
    if (!cells.length) return;

    const rowData = cells.map(cell => {
      let baseText = cell.innerText
        .replace(/\b(view details|copy|close|cancel|ok|done)\b/gi, "")
        .trim();

      const triggers = cell.querySelectorAll(
        '[data-bs-target], [data-target], a[href^="#"], button[data-bs-target]'
      );

      let combinedText = baseText;
      triggers.forEach(trigger => {
        const modal = getModalByTrigger(trigger);
        const modalDetails = extractModalDetails(modal);
        if (modalDetails) {
          combinedText += (combinedText ? "\n\n" : "") + modalDetails;
        }
      });

      return combinedText.trim();
    });

    aoa.push(rowData);
  });

  // ---------- to worksheet ----------
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Wrap + column widths
  const colWidths = [];
  aoa.forEach(row => {
    row.forEach((cell, i) => {
      const len = cell ? Math.min(100, cell.length + 2) : 10;
      colWidths[i] = Math.max(colWidths[i] || 10, len);
    });
  });
  ws["!cols"] = colWidths.map(w => ({ wch: w }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Details");
  XLSX.writeFile(wb, `${ptId}_SDR.xlsx`);
}


function resetButton () {
    document.getElementById("optionSelect").value = 0
    document.getElementById("optionSelect").disabled = false
    document.getElementById("submitButton").style.display = "none"
    document.getElementById("submitButton").disabled = false;
    document.getElementById("exportReset").style.display = "none"
    document.getElementById("searchInput").style.display = "none"
    document.getElementById("searchInput").value = ""
    document.getElementById("ptManager").style.display = "none"
    document.getElementById("scrollerLeft").style.display = "none"
    document.getElementById("scrollerRight").style.display = "none"
    document.getElementById("ptID").value = ""
    document.getElementById("myTable3").style.display = "none"
    document.getElementById("ptID").disabled = false;
    document.getElementById('tableBody3').innerHTML = ""
    document.getElementById("ptFeedback").style.display = "none"
    document.getElementById("ptID").readOnly = false;
    document.getElementById("clearValue3").style.display = "block"
    document.getElementById("ptContainer").style.display = "none"
    document.getElementById("allDetails").style.display = "none";
}

function rsInputFocus () {
    //document.getElementById("optionSelect").disabled = false;
    document.getElementById("atFeedback").style.display = "none"
    document.getElementById("ptFeedback").style.display = "none"
    document.getElementById("clientIdFeedback").style.display = "none"
    document.getElementById("orgIdFeedback").style.display = "none"
    document.getElementById("companyIdFeedback").style.display = "none"
    document.getElementById("tagCompanyIdFeedback").style.display = "none"
}

function searchTable () {
    var optionSelectedValue = optionSelected();
    if (optionSelectedValue == "1") {
        let input = document.getElementById("searchInput").value.toLowerCase();
        let table = document.getElementById("myTable3");
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
    document.getElementById("ptID").value = "";
    document.getElementById("ptID").readOnly = false;
    document.getElementById("autocomplete-dropdown3").innerHTML = ""
}

function scrollTable(amount) {
    document.getElementById("tableContainer3").scrollBy({ left: amount, behavior: "smooth" });
}