/**
 * Created by yqzheng on 2017/4/10.
 */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
// var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var app = express();
var server = require('http').createServer(app);

app.set('port', process.env.PORT || 4080);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'app')));


app.get('/', function (req, res) {
    res.sendfile('app/index.html');
});
app.

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;
