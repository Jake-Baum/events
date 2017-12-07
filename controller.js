var fs = require("fs");

module.exports.index = function(req, res)
{
	res.sendfile("public/index.html");
}

module.exports.admin = function(req, res)
{
	res.sendfile("public/admin.html");
}

module.exports.listAllVenues = function(req, res)
{
	var venues;
	try {
		venues = require("./venues");
	} catch(e) {
		venues = null;
	}

	if (venues == null)
	{
		res.json({error: "No venues stored"});
		return
	}

	res.json(venues);
}

module.exports.searchEvents = function(req, res)
{
	var events;
	try {
		var events = require("./events");
	} catch(e) {
		events = null;
	}

	var searchEmpty = false, dateEmpty = false;
	if (typeof req.query.search == "undefined" || req.query.search == "")searchEmpty = true;
	if (typeof req.query.date == "undefined" || req.query.date == "")dateEmpty = true;

	if (events == null)
	{
		res.json({error: "No events stored."});
		return;
	}
	var arr = [];
	for (var i = 0; i < events.events.length; i++)
	{
		if (dateEmpty && searchEmpty)
		{
			arr.push(events.events[i]);
		}
		else if (dateEmpty)
		{
			if (events.events[i].title.toLowerCase().includes(req.query.search.toLowerCase()))
			{
				arr.push(events.events[i]);
			}
		}
		else if (searchEmpty)
		{
			if (events.events[i].date.valueOf().substr(0,10) == req.query.date.valueOf())
			{
				arr.push(events.events[i]);
			}
		}
		else
		{
			if (events.events[i].date.valueOf().substr(0,10) == req.query.date.valueOf && events.events[i].title.toLowerCase().includes(req.query.search.toLowerCase()))
			{
				arr.push(events.events[i]);
			}
		}
	}
	if (arr.length == 0)
	{
		res.json({ event: req.query.search + " not found"});
		return;
	}
	var json = JSON.parse('{"events":' + JSON.stringify(arr) + "}");

	res.json(json);
}

module.exports.getEventById = function(req, res)
{
	var events;
	try {
		var events = require("./events");
	} catch(e) {
		events = null;
	}

	for (var i = 0; i < events.events.length; i++)
	{
		if(events.events[i].event_id == req.params.event_id)
		{
			res.json(JSON.parse('{"events":' + JSON.stringify(events.events[i]) + "}"));
		}
	}
	res.json({ error: "no such event" });
}

module.exports.addVenue = function(req, res)
{
	var venues;
	try {
		venues = require("./venues");
	} catch(e) {
		venues = null;
	}
	//check authentication
	if (req.query.auth_token != "concertina")
	{
		res.status(400).json({error: "not authorised, wrong token"});
		return;
	}
	//verify all required parameters are present
	if (typeof req.query.name == "undefined")
	{
		res.status(400).json({error: "name required"});
		return;
	}

	//create venue json object
	var id = getNextVenueId();
	var venue = {"name": req.query.name, "postcode": req.query.postcode, "town": req.query.town, "url": req.query.url, "icon": req.query.icon};
	//if venues.json has not been created yet
	if (venues == null)
	{
		venuesjson = JSON.parse('{"venues": {"'+id+'":'+JSON.stringify(venue)+'}}');
		fs.writeFile("venues.json",  JSON.stringify(venuesjson, null, 2), "utf8", function(err, fd)
		{
			if (err)throw err;
			else res.json({status: "venue added successfully"});
		});
	}
	else
	{
		venues.venues[id] = venue;
		fs.writeFile("venues.json", JSON.stringify(venues, null, 2), "utf8", function(err)
		{
			if(err) throw err;
			else res.json({status: "venue added successfully"});
		});
	}
}

getNextVenueId = function()
{
	var venues;
	try {
		venues = require("./venues");
	} catch(e) {
		venues = null;
	}
	if (venues == null)return "v_1"; 
	var count = 1;
	for (var v in venues.venues)
	{
		count++;
	}
	return "v_" + count;
}

module.exports.addEvent = function(req, res)
{
	var events, venues;
	try {
		events = require("./events");
	} catch(e) {
		events = null;
	}
	try {
		venues = require("./venues");
	} catch(e) {
		venues = null;
	}

	if (venues == null)
	{
		res.status(400).json({error: "venues empty"});
	}

	//verify all required parameters are present
	var requiredjson = {};
	var ret = false;
	if (typeof req.query.event_id == "undefined")
	{
		requiredjson["event_id"] = "event_id required";
		ret = true;
	}
	if (typeof req.query.title == "undefined")
	{
		requiredjson["title"] = "title required";
		ret = true;
	}
	if (typeof req.query.venue_id == "undefined")
	{
		requiredjson["venue_id"] = "venue_id required";
		ret = true;
	}
	if (typeof req.query.date == "undefined")
	{
		requiredjson["date"] = "date required";
		ret = true;
	}
	if (ret)
	{
		res.json(requiredjson);
		return;
	}

	//create event json object
	var event = JSON.parse('{"event_id": "'+req.query.event_id+'", "title": "'+req.query.title+'", "blurb": "'+req.query.blurb+'", "date": "'+req.query.date+'", "url": "'+req.query.url+'", "venue": '+JSON.stringify(getVenueById(req.query.venue_id))+'}');

	//if events.json has not been created yet
	if (events == null)
	{
		eventsjson = JSON.parse('{"events": ["'+id+'":'+JSON.stringify(event)+'}]');
		fs.writeFile("events.json",  JSON.stringify(eventsjson, null, 2), "utf8", function(err, fd)
		{
			if (err)throw err;
			else res.json({status: "event added successfully"});
		});
	}
	else
	{
		events.events.push(event);
		fs.writeFile("events.json", JSON.stringify(events, null, 2), "utf8", function(err)
		{
			if(err) throw err;
			else res.json({status: "event added successfully"});
		});
	}
}

getVenueById = function(venue_id)
{
	var venues;
	try {
		venues = require("./venues");
	} catch (e) {
		venues = null;
	}
	for (var v in venues.venues)
	{
		if (v.valueOf() == venue_id.valueOf())
		{
			venues.venues[v]["venue_id"] = venue_id;
			return venues.venues[v];
		}
	}
	return null;
}

module.exports.getToken = function(req, res)
{
	var users, tokens;
	try {
		users = require("./users");
	} catch (e) {
		users = null;
	}
	try {
		tokens = require("./tokens");
	} catch (e) {
		tokens = null;
	}

	if (users == null)
	{
		res.json({error: "Users file not defined"});
		return;
	}
	for (var u in users.users)
	{
		//login successful
		if (users.users[u].username == req.body.username && users.users[u].password == req.body.password)
		{
			//create token
			var token = "concertina";

			//store token in file
			if (tokens == null)
			{
				fs.writeFile("tokens.json", {"ip": "127.0.0.1", "date": "", "token": token}, "utf8", function(err)
				{
					if (err)throw err;
				});
			}
			else
			{
				tokens.tokens[tokens.tokens.length] = {"ip": "127.0.0.1", "date": "", "token": token};
			}	
			res.cookie("authentication", token, {maxAge: 1000 * 3600 * 2}).json({cookie: "Cookie sent"});
			return;
		}
	}
	res.json({error: "username or password incorrect"});
}

module.exports.validToken = function(req, res)
{
	cookies = req.cookies;
	if (typeof req.cookies == "undefined" || req.cookies == {})
	{
		res.json({authentication: "failed"});
		return;
	}
	var tokens;
	try {
		tokens = require("./tokens");
	} catch (e) {
		tokens = null;
	}

	if (tokens == null)
	{
		res.json({error: "token not found"});
		return;
	}
	for (var t in tokens.tokens)
	{
		console.log(t);
		if (tokens.tokens[t].token == req.cookies.authentication)
		{
			res.json({authentication: "successful"});
			return;
		}
	}
	res.json({authentication: "failed"});
}