const valorant = require("./../models/valorant");

// const accounts = JSON.parse(
//   fs.readFileSync(`${__dirname}/../data/accounts.json`)
// );



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
    // data: {
    //   accounts,
    // },
  });
};

exports.createAccount = async (req, res) => {
  try {
    const newAccount = await valorant.create(req.body);

    res.status(201).json({
      status: "success",
      requestedAt: req.requestTime,
      data: {
        account: newAccount,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Invalid data sent!",
    });
  }
};

exports.getAccount = (req, res) => {
  const id = req.params.id;
  // const account = accounts.find((el) => el.id === Number(id));

  // res.status(200).json({
  //   status: "success",
  //   requestedAt: req.requestTime,
  //   data: {
  //     account,
  //   },
  // });
};

exports.updateAccount = (req, res) => {
  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    data: {
      account,
    },
  });
};

exports.deleteAccount = (req, res) => {
  res.status(204).json({
    status: "success",
    requestedAt: req.requestTime,
    data: null,
  });
};
