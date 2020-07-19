// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: magic;
let containers = await ContactsContainer.all();
// let contacts = await Contact.all(containers);
let contactGroups = await ContactsGroup.all(containers); 

let vipGroup = contactGroups.filter(cg => {
   return cg.name == "VIPs";
});

let contacts = await Contact.inGroups(vipGroup);
contacts.forEach(function(contact){console.log(contact.givenName + " " + contact.familyName);});
//return JSON.stringify(vipContacts);
Pasteboard.copy(JSON.stringify(contacts));
Script.complete();