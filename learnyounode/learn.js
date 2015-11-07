var fs = require("fs");
var path = require("path");
var http = require("http");
var async = require("async");
var net = require("net");
var time = require("strftime");


exports.p1 = function()
{
    console.log("HELLO WORLD");
}

exports.p2 = function(argv)
{
    var nums = argv.slice(2);
    var res = nums.map(x=>Number(x)).reduce(function(a,b){return a+b;}, 0);
    console.log(res);
}

exports.p3 = function(filename)
{
    var contents = fs.readFileSync(filename);
    var num = contents.toString().match(/\n/g).length;
    console.log(num);
}

exports.p4 = function(filename)
{
    fs.readFile(filename, function(err, data)
    {
        if(err) return console.error(err);
        console.log(data.toString().match(/\n/g).length);
    });
}

exports.p5 = function(argv)
{
    var dir = argv[2];
    var ext = "."+ argv[3];
    fs.readdir(dir, function(err,data){
        var res = data.filter(x => path.extname(x) == ext);
        res.map(x=>console.log(x));
    });
}

//p6 is the same as p5
exports.p6 = function(argv)
{
    var dir = argv[2];
    var ext = "."+ argv[3];
    fs.readdir(dir, function(err,data){
        var res = data.filter(x => path.extname(x) == ext);
        res.map(x=>console.log(x));
    });
}

exports.p7 = function(url)
{
    http.get(url, function(res){
        res.setEncoding("utf8");
        res.on("data", function(d){console.log(d);});
    }).on("error", function(err) {console.log(err.message)});
}

exports.p8 = function(url)
{
    http.get(url, function(res){
        res.setEncoding("utf8");
        var body ="";
        res.on("data", function(d){body += d});
        res.on("end", function(){console.log(body.length); console.log(body);});
    }).on("error", function(err) {console.log(err.message)});
}

exports.p9 = function(argv)
{
    var urls = argv.slice(2, 5);
    async.map(urls, function(url, cb)
    {
        http.get(url, function(res)
        {
            res.setEncoding("utf8");
            var body ="";
            res.on("data",function(d){ body += d;});
            res.on("end", function(){ cb(null,body);});
        }).on("error", function(err){return cb(err);});
    },function(err, results)
    {
        if(err) return console.log(err.message);
        results.forEach(x => console.log(x));
    });
}

exports.p10 = function(port)
{
    var tcpserver = net.createServer(function(socket){
        socket.write(time("%F %R\n", new Date()));
        socket.end();
    });
    
    tcpserver.listen(Number(port));
}

exports.p11 = function(port, file)
{
    var server = http.createServer(function(req, res){
        var fileStream = fs.createReadStream(file);
        fileStream.on("open", function(){fileStream.pipe(res);});
        fileStream.on("error",function(err){ res.end(err);});
    });
    server.listen(Number(port));
}

exports.p12 = function(port)
{
    var server = http.createServer(function(req, res){

        if (req.method == 'POST') {
            req.setEncoding("utf8");
            var body = '';
            req.on('data', function (data) {
                body += data;
            });
            req.on('end', function () {
                 res.write(body.toUpperCase());
                 res.end();
            });
            
            //res.write(body.toUpperCase());
            //res.end();
            //since the request is not entirely sent once,we cannot put res.write and res.end here.
            //If we put them here, res.write and res.end will be executed before any data coming in. And once the request data is coming in,
            //res.end() has been executed and therefore, no response will be sent.
        }
        else res.end(req.method);
    });
    server.listen(Number(port));
}

//with express, P13 will be trivial
//you need install express
exports.p13 = function(port)
{
    var app = require("express")();
    app.listen(Number(port));
    app.get("/api/parsetime", function(req, res){
        var date = new Date(req.query.iso);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({"hour": date.getHours(), "minute": date.getMinutes(), "second":date.getSeconds()}));
        res.end();
    });
    
    app.get("/api/unixtime", function(req, res){
        var date = new Date(req.query.iso);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({"unixtime": date.getTime()}));
        res.end();
    });
}
