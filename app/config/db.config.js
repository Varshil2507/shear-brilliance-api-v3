
const pg = require('pg');
module.exports = {
    HOST: "ep-silent-butterfly-a68l2zqa.us-west-2.aws.neon.tech",
    USER: "neondb_owner",
    PASSWORD: "npg_KtviU2SlC0IE",
    DB: "neondb",
    dialect: "postgresql",
    dialectModule:pg,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      connectTimeout: 60000, // 60 seconds,
       ssl: {
         require: true,
        rejectUnauthorized: false
      },
      options: {
        sslmode: "require" // Setting sslmode in the options
      }
    }
  };