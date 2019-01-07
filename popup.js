// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';
var baseUrl = 'https://app1.kpay.to/api/';

var address;
var usage;

const addressRequest = new XMLHttpRequest();
const usageRequest = new XMLHttpRequest();

// Listen to http responses for address
addressRequest.onreadystatechange = async function () {
  var response = JSON.parse(addressRequest.response);
  address = getLeastUsedAddress(response.EthAddresses);
}

// Fire up address request
function getDomainAddress(domain) {
  var url = baseUrl + "Identity?Identity=" + domain.toString();
  addressRequest.open("GET", url, false);
  addressRequest.send();
}


// Listen to http responses for usage count
usageRequest.onreadystatechange = async function () {
  var response = JSON.parse(usageRequest.response);
  usage = JSON.parse(usageRequest.response);
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


var getAddress = document.getElementById('getAddress');
getAddress.onclick = function (element) {
  var domain = document.getElementById("domain").value;
  getDomainAddress(domain);
  address = address.toString();
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      { code: "xpath='/html/body/section[1]/div/main/article[2]/div/article[2]/div[1]/address-field/div[1]/input'" }
    );
    chrome.tabs.executeScript(
      tabs[0].id,
      { code: 'address_box = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;' }
    );
    chrome.tabs.executeScript(
      tabs[0].id,
      { code: 'address_box.value="' + address.toString() + '";' }
    );
  });
};

function getElementByXpath(path) {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

