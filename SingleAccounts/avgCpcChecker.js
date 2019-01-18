// Copyright 2019, Uwe Scharrer. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/*
* @name AverageCpcChecker
*
* @overview
*  The scripts checks if there are keywords in your account with a higher avg. Cpc than your given limit.
*  You can label keywords with an exception label. These keywords will be ignored. This could be useful
*  for some special or important keywords.
*
*  If the script has found such keywords it sends an e-mail to the given address.
*  You then have to go to the keyword tab, sort avg. Cpc descending and check these keywords.
*  Take care of your multipliers for devices, remarketing list etc. Very often they are the root cause for 
*  high avg. Cpcs.
* 
*  If the script hasn't found keywords with high avg. Cpc, it'll just log a short statment.
*
*  Schedule it to your own needs.
*
* @author Uwe Scharrer [https://www.linkedin.com/in/uwe-scharrer-842ba181/]
*    
* @version
*  1.0
*    
* @changelog
*	version 1.0
*    - Released intial version, 18.01.2019
*/

// Please change the variables below to your needs.
// Choose your max. avg. Cpc
var AVG_CPC_LIMIT = 50;

// Set the exception label by hand for keywords where the avg. CPC is ok. Keywords with this label will be ignored.
var EXCEPTION_LABEL = 'ALERT EXCEPTION';

// Select your date range.
// Possible Values: TODAY, YESTERDAY, LAST_7_DAYS, THIS_WEEK_SUN_TODAY, LAST_WEEK, LAST_14_DAYS, LAST_30_DAYS, LAST_BUSINESS_WEEK, LAST_WEEK_SUN_SAT, THIS_MONTH, LAST_MONTH, ALL_TIME
var DATE_RANGE = 'YESTERDAY';

// Choose the e-mail address for the notification mail.
var TO_NOTIFY = 'uwescharrer24@gmail.com';


function main() {
 avgCpcAlert();
}

function avgCpcAlert() {

  var keywordCount = 0;
  var yourCurrency = AdsApp.currentAccount().getCurrencyCode();

  // Call helper function to create label if it does not exist.
  createLabelIfNeeded(EXCEPTION_LABEL);
    
  var keywordSelector = AdsApp.keywords()
  .withCondition("CampaignStatus = ENABLED")
  .withCondition("AdGroupStatus = ENABLED")
  .withCondition("Status = ENABLED")
  .withCondition("LabelNames CONTAINS_NONE ['" + EXCEPTION_LABEL + "']")
  .withCondition("AverageCpc > '" + AVG_CPC_LIMIT + "'")
  .forDateRange(DATE_RANGE);
    
  var keywordIterator = keywordSelector.get();
  while(keywordIterator.hasNext()) {
          
    var keyword = keywordIterator.next();
    var campaign = keyword.getCampaign().getName();
    var adGroup = keyword.getAdGroup().getName();
    var keywordName = keyword.getText();
    keywordCount += 1;
    }// end while
  
  if(keywordCount > 0){
    sendEMail(TO_NOTIFY, keywordCount, AVG_CPC_LIMIT, EXCEPTION_LABEL, DATE_RANGE);
  } else {
    Logger.log("During " + DATE_RANGE + " we found " + keywordCount + " Keyword/s with a higher average CPC than " + AVG_CPC_LIMIT + " " + yourCurrency + ".");;
  }
  
 Logger.log("Runtime avgCpcAlert in seconds: " + (1800-AdWordsApp.getExecutionInfo().getRemainingTime()));
  
}// end function avgCpcAlert()

function sendEMail(address, data, limit, label, date){
  
  /*
  address: email address
  data: number of keywords with high avg. CPC
  limit: cpc limit
  date: given date range
  */

  MailApp.sendEmail(
    address,
    "ALERT: avg. CPCs zu hoch",
    "Hey PPC Masters,\n\n" + data + " keywords in your account had an higher avg. CPC than " + limit + " € during the time range of " + date + ".\n\n" + 
    "Please got to keywords and sort the column avg. CPC descending to see all of them. If the avg. CPC is ok for you, you an label the keyword with " + label + ". " + 
    "Keywords with this label will be ignored.\n\nMay the qualityscore be with you!\nYour Google Ads Account"
  );
  
}// end function sendEMail()


function createLabelIfNeeded(labelName) {
  if(!AdsApp.labels().withCondition("Name = '" + labelName + "'").get().hasNext()) {
    AdsApp.createLabel(labelName);
  }
}// end function createLabelIfNeeded()
