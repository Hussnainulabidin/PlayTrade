const valorant = require("./../models/valorant");
const APIFeatures = require("./../utils/apifeatures");


exports.getTopAccounts = async (req, res) => {   // will update laster based on seller rank , key words etc
  try {
    const topAccounts = await valorant
      .find()
      .sort({ views: -1 }) // Sort by views in descending order
      .limit(5); // Limit the results to the top 5

    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime,
      results: topAccounts.length,
      data: {
        accounts: topAccounts,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
}


exports.getAllAccounts = async (req, res) => {
  try {

    const features = new APIFeatures(valorant.find(), req.query).filter().sort().limitFields().paginate();
    
    const accounts = await features.query;

    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime,
      data: {
        accounts,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.createAccount = async (req, res) => {
  try {
    const newAccount = await valorant.create(req.body);
    console.log("Account created successfully:", newAccount);

    res.status(201).json({
      status: "success",
      requestedAt: req.requestTime,
      data: {
        account: newAccount,
      },
    });
  } catch (err) {
    console.error("Error creating account:", err);
    res.status(400).json({
      status: "fail",
      message: "Invalid data sent!",
      error: err.message,
    });
  }
};

exports.getAccount = async (req, res) => {
  try {
    const account = await valorant.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        status: "fail",
        message: "No account found with that ID",
      });
    }

    await valorant.updateOne({ _id: req.params.id }, { $inc: { views: 1 } });

    const updatedAccount = await valorant.findById(req.params.id);

    console.log("Account found:", updatedAccount.timeSinceLastUpdated);

    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime,
      data: {
        account: updatedAccount,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const accounts = await valorant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime,
      data: {
        accounts,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const accounts = await valorant.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime,
      data: {
        accounts,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
