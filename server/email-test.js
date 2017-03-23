var prompt = require('prompt'),
  emailSender = require('./email-sender');

//
// Start the prompt
//
prompt.start();

var schema = {
  properties: {
    from: {
      description: "Who to send the email from",
      pattern: /^[A-Za-z ]+\|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+$/,
      message: "Must enter: My Name|my.email@test.com",
      default: "Ben Brown|benjamin.brown@manchester.ac.uk"
    },
    to: {
      description: "Who to send the email to",
      pattern: /^[A-Za-z ]+\|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+$/,
      message: "Must enter: My Name|my.email@test.com",
      default: "Richard Williams|richard.williams2@manchester.ac.uk"
    },
    type: {
      description: "Method: \n[1] - sendgrid http,\n[2] - sendgrid smtp\n[3] - smtp",
      pattern: /^[123]$/,
      required: true,
      message: "Please enter 1,2 or 3"
    }
  }
};

prompt.get(schema, function(err, result) {
  //
  // Log the results.
  //
  console.log('Command-line input received:');
  console.log('  from: ' + result.from);
  console.log('    to: ' + result.to);
  console.log('     #: ' + result.type);
});
