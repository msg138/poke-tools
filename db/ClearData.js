const mongoose = require('mongoose');
require('./Connection');
const User = require('./User').default;

User.deleteMany({}, () => {
  console.log('Deleted users.');
  mongoose.connection.close();
});

