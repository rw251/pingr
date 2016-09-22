module.exports = {
  db: {
    url: process.env.PINGR_MONGO_URL
  },
  passport: {
    secret: process.env.PINGR_PASSPORT_SECRET
  },
  server:{
    port: process.env.PINGR_SERVER_PORT
  }
};
