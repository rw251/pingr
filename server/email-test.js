const prompt = require('prompt');
const emailSender = require('./email-sender');

//
// Start the prompt
//
prompt.start();

const schema = {
  properties: {
    from: {
      description: 'Who to send the email from',
      pattern: /^[A-Za-z ]+\|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+$/,
      message: 'Must enter: My Name|my.email@test.com',
      default: 'Ben Brown|benjamin.brown@manchester.ac.uk',
    },
    to: {
      description: 'Who to send the email to',
      pattern: /^[A-Za-z ]+\|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+$/,
      message: 'Must enter: My Name|my.email@test.com',
      default: 'Richard Williams|richard.williams2@manchester.ac.uk',
    },
    another: {
      description: 'Another optional to email',
      pattern: /^[A-Za-z ]+\|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+$/,
      message: 'Must enter: My Name|my.email@test.com',
    },
    type: {
      description:
        `Method: \n${
          emailSender.EMAILTYPES.map((v, i) => `[${i + 1}] - ${v}`).join('\n')}`,
      pattern: /^[123]$/,
      default: 1,
      message: 'Please enter 1,2 or 3',
    },
  },
};

const emailConfig = emailSender.config(
  null,
  null,
  null,
  'Here is a test email',
  'A plain text version of the email',
  '<p>A <strong>html</strong> version of the email</p><p>Bye!</p>',
  null
);

const parseEmail = (text) => {
  const bits = text.split('|');
  return { name: bits[0], email: bits[1] };
};

prompt.get(schema, (err, result) => {
  const emailType = emailSender.EMAILTYPES[+result.type - 1];

  console.log('Command-line input received:');
  console.log(`  from: ${result.from}`);
  console.log(`    to: ${result.to}`);
  console.log(`    and: ${result.another}`);
  console.log(`  type: ${emailType}`);

  emailConfig.from = parseEmail(result.from);
  emailConfig.to.push(parseEmail(result.to));
  if (result.another) {
    emailConfig.to.push(parseEmail(result.another));
  }
  emailConfig.type = emailType;

  emailSender.send(emailConfig, (sendErr, info) => {
    if (sendErr) {
      console.log('message failed to send');
      console.log(sendErr);
      process.exit(1);
    } else {
      if (info) console.log(info);
      console.log('message sent');
      process.exit(0);
    }
  });
});
