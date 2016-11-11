module.exports = {
  db: {
    url: process.env.PINGR_MONGO_URL
  },
  //user auth
  passport: {
    secret: process.env.PINGR_PASSPORT_SECRET
  },
  server:{
    port: process.env.PINGR_SERVER_PORT,
    url: process.env.PINGR_SERVER_URL
  },
  mail: {
      sendEmailOnError: true,
      smtp: {
          host: process.env.PINGR_SMTP_HOST || 'mail.srft.nhs.uk',
          port: process.env.PINGR_SMTP_PORT || 25,
          useAuth: process.env.PINGR_SMTP_USER && true,
          username: process.env.PINGR_SMTP_USER || '',
          password: process.env.PINGR_SMTP_PASS || ''
      },
      options: {
          from: 'PINGR <noreply@smash.srft.nhs.uk>',
          to: process.env.PINGR_EMAIL_LIST || ''
      }
  }
};
