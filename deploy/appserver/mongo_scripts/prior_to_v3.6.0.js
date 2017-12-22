// execute the following prior to v3.6.0 to move practice info into an array in the user collection

db.users.find().snapshot().forEach(
  function(e) {
    // update document, using its own properties
    e.practices = [{ id: e.practiceId, name: e.practiceName, authorised: true }];

    // remove old properties
    delete e.practiceId;
    delete e.practiceName;
    delete e.practiceIdNotAuthorised;
    delete e.practiceNameNotAuthorised;

    // save the updated document
    db.users.save(e);
  }
);
