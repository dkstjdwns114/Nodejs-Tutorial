let express = require("express");
let app = express();
let fs = require("fs");
let bodyParser = require("body-parser");
let compression = require("compression");
let topicRouter = require("./routes/topic");
let indexRouter = require("./routes/index");
let helmet = require("helmet");
app.use(helmet());

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.get("*", function (request, response, next) {
  fs.readdir("./data", function (error, filelist) {
    request.list = filelist;
    next();
  });
});

app.use("/", indexRouter);
app.use("/topic", topicRouter);

app.use(function (req, res, next) {
  res.status(404).send("Sorry cant find that!");
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(3000, function () {
  console.log("Example app listening on port 3000!");
});
