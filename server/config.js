module.exports = {
  db: {
    url: process.env.PINGR_MONGO_URL
  },
  passport: {
    secret: process.env.PINGR_PASSPORT_SECRET
  },
  server:{
    port: process.env.PINGR_SERVER_PORT
  },
  mail: {
      sendEmailOnError: true,
      smtp: {
          host: 'mailrouter.man.ac.uk',
          port: 25,
          useAuth: false,
          username: '',
          password: ''
      },
      options: {
          from: 'development@pingr.srft.nhs.uk',
          to: 'richard.williams2@manchester.ac.uk'
      }
  }
  /*
  mail: {
      sendEmailOnError: true,
      smtp: {
          host: 'mail.srft.nhs.uk',
          port: 25,
          useAuth: false,
          username: '',
          password: ''
      },
      options: {
          from: 'PINGR <info@pingr.srft.nhs.uk>',
          to: ''
      }
  },
  */
};
