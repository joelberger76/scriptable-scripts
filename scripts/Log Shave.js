//Log Shave
//Log shave using prepared Airtable forms, filling in default values for predictable resources
/* 
TODO:
- 
*/

//Get input dictionary from Shortcuts
let parsedInput = null;
if (args.plainTexts.length > 0) {
   parsedInput = JSON.parse(args.plainTexts);
   //QuickLook.present(parsedInput);
}
else {
   let missingInputAlert = new Alert();
   missingInputAlert.title = "Data Missing";
   missingInputAlert.message = "Input data missing. Sample dictionary copied to clipboard.";
   missingInputAlert.addAction("OK");
   await missingInputAlert.presentAlert();
   
   const sampleDictionary = `{"Gear":{"Brushes":[{"Active":false,"Brush":"Semogue 1305 Boar"}],"Soaps":[{"Active":false,"Soap":"Soap Commander Bounty (2019-09-18)"}],"Blades":[{"Active":false,"Blade":"Astra Stainless"},{"Active":false,"Blade":"Rockwell"},{"Active":true,"Blade":"Gillette 7 O'Clock Super Stainless"}],"Pre-Shaves":[{"Active":false,"Pre-Shave":"Bloom Water"},{"Active":false,"Pre-Shave":"The Cube"},{"Active":true,"Pre-Shave":"The Cube (Rabid Banana)"},{"Active":false,"Pre-Shave":"The Cube (Scentless)"},{"Active":false,"Pre-Shave":"L'Oreal Men's Face Wash"}],"Razors":[{"Active":true,"Razor":"Rockwell 6C (3)"},{"Active":false,"Razor":"Rockwell 6C (4)"},{"Active":false,"Razor":"Merkur 23C (180)"}],"Aftershaves":[{"Active":false,"Aftershave":"Phoenix Shaving Sun Down (2020-06-18)"}]},"apiKey":"YOUR_API_KEY","Config":{"Form":"YOUR_FORM_ID","Base":"YOUR_BASE_ID","replaceBladeDay":"Monday","Table":"YOUR_SHAVE_LOG_TABLE"}}`;
   Pasteboard.copy(sampleDictionary);
   
   return false;
}

// Get auth and configuration values
// let formID = await getKeychainValue("shaveLogFormID");
// let airtableAPIKey = await getKeychainValue("airtableAPIKey");
// let airtableBaseID = await getKeychainValue("airtableBaseID");
// let shaveLogTable = await getKeychainValue("shaveLogTable");
// if (!formID || !airtableAPIKey || !airtableBaseID || !shaveLogTable) {
//   console.error("Set keychain value cancelled");
//   Script.complete();
//   return false;
// }
let airtableAPIKey = parsedInput.apiKey;
let formID = parsedInput.Config.Form;
let airtableBaseID = parsedInput.Config.Base;
let shaveLogTable = parsedInput.Config.Table;

//Setup form URL
let formURL = "https://airtable.com/" + formID + "?";

//Get current date
let now = new Date();
let iso8601 = new DateFormatter();
iso8601.dateFormat = "yyyy-MM-dd";
formURL = formURL + "prefill_Date=" + iso8601.string(now);

//Get blade day from most recent shave log record or if it is a Monday, use 1
let bladeDay = 1;
let replaceBladeDay = parsedInput.Config.replaceBladeDay;
let dayOfWeek = new DateFormatter();
dayOfWeek.dateFormat = "EEEE";
if (dayOfWeek.string(now).toLowerCase() != replaceBladeDay.toLowerCase()) {
   bladeDay = await getLastBladeDay(airtableBaseID, shaveLogTable, airtableAPIKey) + 1;
}
formURL = formURL + "&prefill_Blade+Day=" + bladeDay;

//Determine default values for shave gear
let gear = parsedInput.Gear;
let defaultBlade = getShaveGearDefault("Blade", gear);
if (defaultBlade) {
   formURL = formURL + "&" + "prefill_Blade=" + encodeURIComponent(defaultBlade);
}
let defaultPreShave = getShaveGearDefault("Pre-Shave", gear);
if (defaultPreShave) {
   formURL = formURL + "&" + "prefill_Pre-Shave=" + encodeURIComponent(defaultPreShave);
}
let defaultRazor = await getShaveGearDefault("Razor", gear);
if (defaultRazor) {
   formURL = formURL + "&" + "prefill_Razor=" + encodeURIComponent(defaultRazor);
}
let defaultSoap = await getShaveGearDefault("Soap", gear);
if (defaultSoap) {
   formURL = formURL + "&" + "prefill_Soap=" + encodeURIComponent(defaultSoap);
}
let defaultAftershave = await getShaveGearDefault("Aftershave", gear);
if (defaultAftershave) {
   formURL = formURL + "&" + "prefill_Aftershave=" + encodeURIComponent(defaultAftershave);
}
let defaultBrush = await getShaveGearDefault("Brush", gear);
if (defaultBrush) {
   formURL = formURL + "&" + "prefill_Brush=" + encodeURIComponent(defaultBrush);
}

//Open constructed Shave Log Form URL
Safari.open(formURL);

Script.complete();

// async function getKeychainValue(key) {
//    let value = null;
//    if (Keychain.contains(key)) {
//       value = Keychain.get(key);
//    }
//    else {
//       value = await setKeychainValue(key);
//    }
//   
//    return value;
// }

// async function setKeychainValue(key) {
//    let inputAlert = new Alert();
//    inputAlert.title = "Please enter a value for " + key;
//    inputAlert.addTextField();
//    inputAlert.addAction("OK");
//    inputAlert.addCancelAction("Cancel");
//    let result = await inputAlert.presentAlert();
//    if (result == -1) {
//       return null;
//    }
//    else {
//       Keychain.set(key, inputAlert.textFieldValue(0));
//       return inputAlert.textFieldValue(0);
//    }
// }

function getShaveGearDefault(gear, data) {
   let keyName = null;
   if (gear == "Brush") {
      keyName = gear + "es";
   }
   else {
      keyName = gear + "s";
   }
   let gearArray = data[keyName];
   let defaultGear = gearArray.filter(g => g.Active);
   
   if (defaultGear.length > 0) {
      //Get the first item in case multiple were returned
      return defaultGear[0][gear];
   }
   else {
      return false;
   }
}

async function getLastBladeDay(base, table, apiKey) {
   let queryURL = "https://api.airtable.com/v0/" +
                  base + "/" +
                  encodeURIComponent(table) + "?" +
                  "maxRecords=1&sortField=Date&sortDirection=desc";

   let req = new Request(queryURL);
   req.headers = { "Authorization": "Bearer " + apiKey };
   let resp = await req.loadJSON();
   
   return resp.records[0].fields["Blade Day"];
}