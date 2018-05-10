// execute the following prior to v3.8.0 to prevent any user seeing the new azt indicator
// then enable all for just chris haigh

db.users.update(
  {},
  {
    $set: {
      viewAllIndicators: false,
      indicatorIdsToExclude: ['meds.azt.monitor'],
      indicatorIdsToInclude: [],
    },
  },
  { multi: true }
);

db.users.update(
  { email: 'chris.haigh@nhs.net' },
  {
    $set: {
      viewAllIndicators: true,
      indicatorIdsToExclude: [],
      indicatorIdsToInclude: [],
    },
  },
  { multi: true }
);
