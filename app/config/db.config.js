
const pg = require('pg');
module.exports = {
    HOST: "ep-autumn-sunset-a59jfsoj-pooler.us-east-2.aws.neon.tech",
    USER: "neondb_owner",
    PASSWORD: "Bf4sLOUR9xlS",
    DB: "neondb",
    dialect: "postgres",
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