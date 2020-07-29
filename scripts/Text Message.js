//Text Message
//Send text message to one or more people in the Contacts VIPs group
//Based upon Scriptable Watchlist example

//Create the table that holds the VIP contacts
let table = new UITable();
table.showSeparators = false;
let contacts = await loadVIPs();
populateTable(contacts);
table.present();

Script.complete();

//Populates the table with VIP contacts
//The function can be called repeatedly to update the information displayed in the table.
function populateTable(contacts) {
   table.removeAllRows();
  
   //Build header row
   let row = new UITableRow();
   row.isHeader = true;
   row.dismissOnSelect = false;
   let okButton = row.addButton("OK");
   okButton.dismissOnTap = true;
   okButton.rightAligned();

   okButton.onTap = () => {
      sendMessage(contacts);
      return true;
   }
   table.addRow(row);
  
   //Build rows of contacts
   for (i = 0; i < contacts.length; i++) {
      let contact = contacts[i];
      row = new UITableRow();
      row.dismissOnSelect = false;
      row.onSelect = (idx) => {
         toggleSelection(contacts[idx-1]); //-1 to account for header
         populateTable(contacts);
         table.reload();
      }
    
      let avatarCell = row.addImage(contact.image);
      if (Device.isPhone()) {
         avatarCell.widthWeight = 15;
      }
      else {
         avatarCell.widthWeight = 7;
      }
      let nameCell = row.addText(contact.givenName + " " + contact.familyName);
      nameCell.widthWeight = 100;
    
      let contactSelected = " ";
      if (contact.selected) {
         contactSelected = "✅";
      }
      let selectedButton = row.addButton(contactSelected);
      selectedButton.widthWeight = 10;

      table.addRow(row);
   }
}

//Loads the VIPs from the contact database
async function loadVIPs() {
   let containers = await ContactsContainer.all();
   let contactGroups = await ContactsGroup.all(containers); 
   let vipGroup = contactGroups.filter(cg => {
      return cg.name == "VIPs";
   });

   let contacts = await Contact.inGroups(vipGroup);
   contacts.forEach(function(contact) {
      contact.selected = false;
   });
   
   contacts.sort(sortContacts);
   
   return contacts;
}

//Sorts contacts based on their first and last name
function sortContacts(a, b) {
   let x = a.givenName + a.familyName;
   let y = b.givenName + b.familyName;
   if (x < y) {return -1;}
   if (x > y) {return 1;}
   return 0;
}

function toggleSelection(contact) {
   contact.selected = !contact.selected;
   return true;
}

//Send message to selected recipients
function sendMessage(contacts) {
   //Get selected contacts
   let selectedContacts = contacts.filter(contact => {
      return contact.selected;
   });
   
   //Get mobile #s of selected contacts
   let mobileNumbers = new Array();
   selectedContacts.forEach((sc) => {
      let mobileNumberObj = sc.phoneNumbers.filter(p => {
         return p.localizedLabel == "mobile";
      });
      mobileNumbers.push(mobileNumberObj[0].value);
   });
   
   //Present Messages interface
   if (mobileNumbers.length > 0) {
      m = new Message();
      m.recipients = mobileNumbers;
      m.send();
   }

   return true;
}