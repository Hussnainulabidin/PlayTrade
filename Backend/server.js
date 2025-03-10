const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });


process.on('uncaughtException' , err => {
  console.log("UNCAUGHT REJECTION ..... Shutting Down");
  console.error(err.name, err.message);
  process.exit(1);
})

const app = require("./app");
const { getAllAccounts } = require("./controllers/valorantController");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB , {
}).then(() => {
  console.log("DB connection successful");
})

const port = 3003 || process.env.PORT;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log("UNHANDLED REJECTION ..... Shutting Down");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});


/*
├── controllers/
│   ├── valorantController.js
├── data/
│   ├── accounts.json
├── routes/
│   ├── valorantRoutes.js
├── public/
│   ├── index.html
├── src/
│   ├── components/
│   │   ├── AccountList.js
│   │   ├── AccountDetail.js
│   ├── App.js
│   ├── index.js
├── app.js
├── package.json
├── package-lock.json

Explanation:

1. controllers: Contains your backend controller files.
2. data: Contains your data files like accounts.json.
3. routes: Contains your backend route files.
4. public/: Contains static files like index.html which is the entry point for your React application.
5. src/: Contains your React application source files.
    -> components/: Contains your React components like AccountList.js and AccountDetail.js.
    ->App.js: The main React component.
    ->index.js: The entry point for your React application.
6. app.js: Your Express application file.
7. package.json: Contains your project dependencies and scripts.
8. package-lock.json: Contains the exact versions of your project dependencies.
*/
