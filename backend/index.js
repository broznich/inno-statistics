var express = require('express'),
    sqlite3 = require('sqlite3').verbose(),
    bodyParser = require('body-parser'),
    inno = require('./inno-helper');

/* DEBUG * /

/* END OF DEBUG */

var app = express(),
    port = parseInt(process.env.PORT, 10);

var db = new sqlite3.Database('./inno.db');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

var vars = {
    bucketName: process.env.INNO_BUCKET_ID,
    appKey: process.env.INNO_APP_KEY,
    appName: process.env.INNO_APP_ID,
    groupId: process.env.INNO_COMPANY_ID,
    apiUrl: process.env.INNO_API_HOST
};

inno.setVars(vars);
inno.setVar('collectApp', process.env.INNO_APP_ID);

app.get('/', function (req, res) {
    return res.send(JSON.stringify(vars));
});

app.get("/statistics", function (req, res) {
    var response = function (error, data) {
        return res.json({
            error: error || null,
            data: data
        });
    };
    
    db.all("SELECT event_id, COUNT(event_id) as count FROM events GROUP BY event_id", function (error, rows) {
        var result = {};
        if (error) {
            return response(error);
        } else {
            result.events = rows;
            db.all("SELECT profile_id, COUNT(profile_id) as count FROM events GROUP BY profile_id", function (error, rows) {
                if (error) {
                    return response(error);
                } else {
                    result.profiles = rows;
                    return response(null, result);
                }
            });
        }
    });
});

app.post('/', function (req, res) {
    inno.getDatas(req, function (error, data) {
        if (error) {
            return res.json({
                error: error.message
            });
        }

        if (!(data.event && data.event.createdAt && data.event.definitionId && data.data && data.profile && data.profile.id)) {
            return res.json({
                error: 'Stream data is not correct'
            });
        }
        
        db.run("INSERT INTO events(event_id, profile_id) VALUES (\"" + data.event.definitionId + "\", \"" + data.profile.id + "\")");
        console.log("Event added (\"" + data.event.definitionId + "\":\"" + data.profile.id + "\")");
    });
});

var startApp = function () {
    var server = app.listen(port, function () {
        console.log('Listening on port %d', server.address().port);
    });
};

db.serialize(function () {
    db.run("CREATE TABLE IF NOT EXISTS events (event_id TEXT,profile_id TEXT)");
    
    startApp();
});