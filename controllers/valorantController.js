const fs = require("fs");

const accounts = JSON.parse(
  fs.readFileSync(`${__dirname}/../data/accounts.json`)
);

// middleware to check if the id is valid before proceeding to the routes
exports.checkID = (req, res, next, val) => {
    const account = accounts.find((el) => el.id === Number(val));
  
    if (!account) {
      return res.status(404).json({
        status: "fail",
        requestedAt: req.requestTime,
        message: "Invalid ID",
      });
    }
    next();
};


// middleware to check if the body has all the required fields
exports.checkBody = (req, res, next) => {
    const { username, password, email, skins, description } = req.body;
    if (!username || !password || !email || !skins || !description) {
      return res.status(400).json({
        status: "fail",
        message: "Missing required fields",
      });
    }
    next();
  };

exports.getTopAccounts = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined",
  });
};

exports.getAllAccounts = (req, res) => {
  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    data: {
      accounts,
    },
  });
};

exports.createAccount = (req, res) => {
  const newAccount = req.body;
  const newID = accounts[accounts.length - 1].id + 1;
  newAccount.id = newID;

  accounts.push(newAccount);

  fs.writeFile(
    `${__dirname}/data/accounts.json`,
    JSON.stringify(accounts),
    (err) => {
      res.status(201).json({
        status: "success",
        requestedAt: req.requestTime,
        data: {
          account: newAccount,
        },
      });
    }
  );
};

exports.getAccount = (req, res) => {
  const id = req.params.id;
  const account = accounts.find((el) => el.id === Number(id));

  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    data: {
      account,
    },
  });
};

exports.updateAccount = (req, res) => {
  const id = req.params.id;
  const account = accounts.find((el) => el.id === Number(id));

  Object.keys(req.body).forEach((key) => {
    account[key] = req.body[key];
  });

  fs.writeFile(
    `${__dirname}/data/accounts.json`,
    JSON.stringify(accounts),
    (err) => {
      res.status(200).json({
        status: "success",
        requestedAt: req.requestTime,
        data: {
          account,
        },
      });
    }
  );
};

exports.deleteAccount = (req, res) => {
  const id = req.params.id;

  const account = accounts.find((el) => el.id === Number(id));
  const index = accounts.indexOf(account);

  accounts.splice(index, 1);

  fs.writeFile(
    `${__dirname}/data/accounts.json`,
    JSON.stringify(accounts),
    (err) => {
      res.status(204).json({
        status: "success",
        requestedAt: req.requestTime,
        data: null,
      });
    }
  );
};
