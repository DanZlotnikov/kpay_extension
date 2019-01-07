var baseUrl = 'https://app1.kpay.to/api/';

var xpath;
var address_box;

var address;
var usage;

const addressRequest = new XMLHttpRequest();
const usageRequest = new XMLHttpRequest();

// Listen to http responses for address
addressRequest.onreadystatechange = function () {
    if (addressRequest.readyState == 4 && addressRequest.status == 200) {
        if (addressRequest.response == "null" || addressRequest.response == null) {
            address = 'No address found.';
        }
        else {
            var response = JSON.parse(addressRequest.response);
            if (response.EthAddresses == null || response.EthAddresses == {} ||  response.EthAddresses == false){
				address = 'No address found.';
			}
			else {
				address = getLeastUsedAddress(response.EthAddresses);
			}
        }

        address_box.select();
        document.execCommand("delete");
        address_box.focus();
        document.execCommand("insertText", false, address);
    }
}

// Fire up address request
function getDomainAddress(domain) {
    var url = baseUrl + "Identity?Identity=" + domain.toString();
    addressRequest.open("GET", url, false);
    addressRequest.send();
}


// Listen to http responses for usage count
usageRequest.onreadystatechange = function () {
    if (addressRequest.readyState == 4 && addressRequest.status == 200) {
        var response = usageRequest.response;
        usage = response;
    }
}

// Fire up usage count request
function getAddressUsageCount(address) {
    var url = baseUrl + "AddressUsage?address=" + address.toString();
    usageRequest.open("GET", url, false);
    usageRequest.send();
}


function getLeastUsedAddress(addresses) {
    var leastUsedAddressIndex = 0;
    var lowestUsageCount = getAddressUsageCount(addresses[0]);
    var currentUsageCount;

    for (var i = 0; i < addresses.length; i++) {
        // The usage is stored in a global variable, we need to call the function and then take the usage count from the variable
        getAddressUsageCount(addresses[i]);
        currentUsageCount = usage;
        if (currentUsageCount < lowestUsageCount) {
            lowestUsageCount = currentUsageCount;
            leastUsedAddressIndex = i;
        }
    }
    return addresses[leastUsedAddressIndex];
}

window.onhashchange = getAddressBox;
document.body.onload = getAddressBox;

function getAddressBox() {
    xpath = '/html/body/section[1]/div/main/article[2]/div/article[2]/div[1]/address-field/div[1]/input';
    address_box = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (address_box) {
        address_box.value = "";
        address_box.onclick = createModal;
    }
}


function windowOnClick(event) {
    if (event.target === modal) {
        toggleModal();
    }
}


var wrapperDiv, domainPrompt, domainInput;

function createModal() {
    e = window.event;

    posX = e.clientX;
    posY = e.clientY;

    wrapperDiv = document.createElement("div");
    wrapperDiv.setAttribute("style", "position: fixed; left: 0px; top: 0px; background-color: rgba(255, 255, 255, 0); z-index: 1000; height: 100%; width: 100%;");
    document.body.appendChild(wrapperDiv);

    // Prompt 
    domainPrompt = document.createElement("div");
    domainPrompt.setAttribute("style", "position: absolute; width: 350px; border: 2px solid rgb(51, 102, 153); padding: 1px; background-color: rgba(255, 255, 255, 1); opacity: 1; z-index: 1001; text-align: center; top:" + posY + "px; left: " + posX + "px; border-radius:5px;");
    wrapperDiv.appendChild(domainPrompt);

    // Header span
    headerSpan = customCreateElement("div", [{ key: 'style', value: 'padding: 1%; background-color:ghostwhite; ' }])

    // Logo
    imgUrl = chrome.runtime.getURL("images/KPay-logo.png");
    logo = customCreateElement("img", [{ key: 'src', value: imgUrl }, { key: 'height', value: '30' }, { key: 'width', value: '30' }]);
    headerSpan.appendChild(logo);

    // Logo
    logo = customCreateElement("p", [{ key: 'style', value: 'display:inline-flex; vertical-align: super;margin:0px;' }], "&nbspK-Pay");
    headerSpan.appendChild(logo);


    // Text
    domainTextSpan = customCreateElement("span");
    modalText = customCreateElement("strong", null, customInnerHTML = "Enter the payee email or mobile phone: ");
    domainTextSpan.append(modalText);

    // Input box
    domainInputSpan = document.createElement("span");
    domainInput = document.createElement("input");
    domainInput.setAttribute("style", "box-shadow: 0 0 1px #43D1AF;padding: 3px;border: 1px solid powderblue;border-radius:3px;");
    domainInputSpan.append(domainInput);

    // Confirm Button
    confirmButton = customCreateElement("button", [{ key: 'style', value: 'background-color: powderblue;overflow: hidden;margin: 7px;padding: 5px;cursor: pointer;user-select: none;transition: all 150ms linear;text-align: center;white-space: nowrap;text-decoration: none !important;text-transform: none;text-transform: capitalize;color: #fff;border: 0 none;border-radius: 4px;font-size: 13px;font-weight: 500;line-height: 1.3;- webkit - appearance: none;-moz - appearance: none;appearance: none;justify - content: center;align - items: center;flex: 0 0 160px;box - shadow: 2px 5px 10px var(--color - smoke);' }], "Confirm");
    confirmButton.onclick = hideWrapperAndSave;

    // Cancel Button
    cancelButton = customCreateElement("button", [{ key: 'style', value: 'background-color: red;overflow: hidden;padding: 5px;cursor: pointer;user-select: none;transition: all 150ms linear;text-align: center;white-space: nowrap;text-decoration: none !important;text-transform: none;text-transform: capitalize;color: #fff;border: 0 none;border-radius: 4px;font-size: 13px;font-weight: 500;line-height: 1.3;- webkit - appearance: none;-moz - appearance: none;appearance: none;justify - content: center;align - items: center;flex: 0 0 160px;box - shadow: 2px 5px 10px var(--color - smoke);' }], "Cancel");
    cancelButton.onclick = CancelWrapper;

    domainPrompt.appendChild(headerSpan);
    domainPrompt.appendChild(domainTextSpan);
    domainPrompt.appendChild(document.createElement("br"));
    domainPrompt.append(domainInputSpan);
    domainPrompt.append(confirmButton);
    domainPrompt.append(cancelButton);
    domainInput.focus();

    wrapperDiv.addEventListener('click', function (evt) {
        if (!domainPrompt.contains(evt.target)) {
            CancelWrapper();
        }
    });
}

function hideWrapperAndSave() {
    wrapperDiv.removeAttribute("style");

    while (wrapperDiv.firstChild) {
        wrapperDiv.removeChild(wrapperDiv.firstChild);
    }

    domain = domainInput.value;
    getDomainAddress(domain);

    // address_box.setAttribute("disabled", "true");
    // address_box.setAttribute("value", address);
    // address_box.value = address;
    // address_box.removeAttribute("disabled");
}

function CancelWrapper() {
    wrapperDiv.removeAttribute("style");

    while (wrapperDiv.firstChild) {
        wrapperDiv.removeChild(wrapperDiv.firstChild);
    }
    address_box.focus();
}

// childAttributes is an array of attribute key=>value pairs. Returns parent element
function customCreateElement(className, attributes = null, customInnerHTML = null) {
    element = document.createElement(className);
    if (attributes) {
        attributes.forEach(function (attribute) {
            element.setAttribute(attribute["key"], attribute["value"]);
        });
    }
    if (customInnerHTML) {
        element.innerHTML = customInnerHTML;
    }
    return element;
}

