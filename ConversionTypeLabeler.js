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
* @name ConversionTypeLabeler
*
* @overview
*		The script labels your keywords based on the name of the conversion type.
*		This could be helpful if you have imported conversions e.g. from Google Analytics.
*		At first it checks whether the label exists or not. If not, the script add it to your account.
*		The script checks if a keyword has an conversion with your given CONVERSION_TYPE_NAME,
*		and not yet your given NEW_KEYWORD_LABEL. If this is the case, the script sets the new
*		label for this keyword.
*
*		You can schedule it on your own needs.
*
* @author Uwe Scharrer [https://www.linkedin.com/in/uwe-scharrer-842ba181/]
*
* @version 1.0
*
* @changelog
* - version 1.0
*   - Released initial version
*/

// Set your label here
var NEW_KEYWORD_LABEL = 'YOUR_LABEL_HERE';
var LABEL_DESCRIPTION = 'YOUR_LABEL_DESCRIPTION'

// Set the name of your convesion type here
var CONVERSION_TYPE_NAME = 'YOUR_CONVERSION_TYPE_HERE'

function main() {
  createLabelIfNeeded(NEW_KEYWORD_LABEL, LABEL_DESCRIPTION)
  setConversionTypeLabel();
}

function setConversionTypeLabel() {

  var mapIds = {};

  var label = AdWordsApp.labels()
    .withCondition('Name CONTAINS "' + NEW_KEYWORD_LABEL + '"')
    .get()
    .next();

  var query = 'SELECT AdGroupId, Criteria, Id, ConversionTypeName, Labels FROM KEYWORDS_PERFORMANCE_REPORT ' +
      'WHERE CampaignStatus = ENABLED AND AdGroupStatus = ENABLED ' +
      'AND Labels CONTAINS_NONE [' + label.getId() + '] AND ConversionTypeName = "' + CONVERSION_TYPE_NAME + '" ' +
      'DURING LAST_30_DAYS';

  var report = AdsApp.report(query)

  var rows = report.rows();
  while (rows.hasNext()){
    var row = rows.next();
    var adGroupId = row['AdGroupId'];
    var keyword = row['Criteria'];
    var keywordId = row['Id'];
    var convType = row['ConversionTypeName'];
    var label = row['Labels'];

    if (!mapIds[adGroupId]) {
      mapIds[adGroupId] = [];
    }// end if
    mapIds[adGroupId].push([adGroupId, keywordId]);
  }// end while report

  for (var key in mapIds) {
    var keywords = AdWordsApp.keywords()
      .withCondition('AdGroupId = "' + key + '"')
      .withIds(mapIds[key])
      .get();

    while (keywords.hasNext()) {
      var keyword = keywords.next();
      keyword.applyLabel(NEW_KEYWORD_LABEL);
      }// end while
    }// end for

}// end function setLabelAngebote()

function createLabelIfNeeded(labelName, labelDescription) {
  if(!AdWordsApp.labels()
  .withCondition("Name = '" + labelName + "'").get().hasNext()){
    AdWordsApp.createLabel(labelName, labelDescription);
  }// end if
} // end function createLabelIfNeeded
