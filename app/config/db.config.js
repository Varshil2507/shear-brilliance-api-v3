
const pg = require('pg');
module.exports = {
    HOST: "ep-floral-scene-a4hi3ss2-pooler.us-east-1.aws.neon.tech",
    USER: "neondb_owner",
    PASSWORD: "npg_cqv4zK7wMnUS",
    DB: "TestCheck",
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