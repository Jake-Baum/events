module.exports = function(app)
{
	var events = require("./controller");

	app.route("/events2017/index.html").get(events.index);

	app.route("/events2017/admin.html").get(events.admin);

	app.route("/events2017/authenticate").post(events.getToken).get(events.validToken);

	app.route("/events2017/venues").get(events.listAllVenues);

	app.route("/events2017/events/search").get(events.searchEvents);

	app.route("/events2017/events/get/:event_id").get(events.getEventById);

	app.route("/events2017/venues/add").post(events.addVenue);

	app.route("/events2017/events/add").post(events.addEvent);
};