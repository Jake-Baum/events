var express = require("express");
var app = express();
var port = process.env.OPENSHIFT_NODE_JS_PORT || 8090;
var ip = provess.env.OPENSHIFT_NODE_JS_IP || "127.0.0.1";
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

app.use(express.static("public"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var routes = require("./routes");
routes(app);

app.use(function(req, res)
	{
		res.status(404).send({url: req.originalUrl + " not found"});
	});

app.listen(port);

console.log("App running on http://localhost:"+port);