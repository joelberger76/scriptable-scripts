// Kids Responsibilities

// Setup widget
let widget = new ListWidget();
widget.backgroundColor = Color.orange();
widget.spacing = 5;

// Setup font
let footerFont = Font.lightSystemFont(12);

// Get current date
let now = new Date();
let df = new DateFormatter();
df.useShortDateStyle();
df.useShortTimeStyle();

let monthDateDF = new DateFormatter();
monthDateDF.dateFormat = "d";

// Calculate responsibilities
let feed = "Aron";
let dishes = "Alyssa";
if (Number(monthDateDF.string(now)) % 2) {
   feed = "Alyssa";
   dishes = "Aron";
}

let lastWalkedTaco = await getLastWalkedTaco();
let walkTaco = "Aron";
if (lastWalkedTaco == "Aron") {
   walkTaco = "Alyssa";
}

// Add content to widget
widget.addText("Who's Turn?").font = Font.headline();
widget.addText("🍼‍  " + feed);
widget.addText("🧽  " + dishes);
widget.addText("🚶‍  " + walkTaco);
widget.addSpacer();
widget.addText("Last Updated: " + df.string(now)).font = footerFont;

Script.setWidget(widget);
Script.complete();

async function getLastWalkedTaco() {
   // Get auth and configuration values
   let apiKey = await getKeychainValue("airtableAPIKey");
   let base = await getKeychainValue("walkingTacoBaseID");
   if (!apiKey || !base) {
     console.error("Set keychain value cancelled");
     Script.complete();
     return false;
   }

   let queryURL = "https://api.airtable.com/v0/" +
                  base + "/" +
                  encodeURIComponent("Walk Log") + "?" +
                  "maxRecords=1&sortField=Date&sortDirection=desc";

   let req = new Request(queryURL);
   req.headers = { "Authorization": "Bearer " + apiKey };
   let resp = await req.loadJSON();
   
   return resp.records[0].fields["Name"];
}

async function getKeychainValue(key) {
   let value = null;
   if (Keychain.contains(key)) {
      value = Keychain.get(key);
   }
   else {
      value = await setKeychainValue(key);
   }
  
   return value;
}

async function setKeychainValue(key) {
   let inputAlert = new Alert();
   inputAlert.title = "Please enter a value for " + key;
   inputAlert.addTextField();
   inputAlert.addAction("OK");
   inputAlert.addCancelAction("Cancel");
   let result = await inputAlert.presentAlert();
   if (result == -1) {
      return null;
   }
   else {
      Keychain.set(key, inputAlert.textFieldValue(0));
      return inputAlert.textFieldValue(0);
   }
}