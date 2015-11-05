var http = require("http");
var async = require("async");
var fs = require("fs");

exports.p1 = function(file)
{
	async.waterfall(
	[
		function(cb){
			fs.readFile(file, function(err,res)
			{
				if (err) return cb(err);
				else return cb(null, res.toString());
			});
		},
		function(url, cb){
			http.get(url, function(res){
				var body = "";
				res.on("data", function(d){body+=d.toString();});
				res.on("end", function(){return cb(null, body);});
			}).on("error",function(e){cb(e);});
		}
	],
	function(err, result)
	{
		if(err) console.log(err);
		else console.log(result);
	}
	);
}

exports.p2 = function(argv)
{
	var urls = argv.slice(2);
	function fetchurl(url,cb)
	{
		var body = "";
		http.get(url, function(res)
		{
			res.on("data", function(d) { body += d.toString();});
			res.on("end", function(){ return cb(null, body);});
		}).on("error", function(e){return cb(e);});
	}
	async.series({
			requestOne: function(cb)
			{
				fetchurl(urls[0],cb);
			},
			requestTwo: function(cb)
			{
				fetchurl(urls[1],cb)
			}
		},
		function(err, res){
			if(err) return console.log(err);
			return console.log(res);
		}
	);
}

exports.p3 = function(urls)
{
	async.each(urls, function(url, cb)
		{
			http.get(url, function(res){
				//console.log(res);
				cb(null);
			}).on("error", function(e){cb(e);});
		},
		function(err){
			console.log(err);
		}
	);
}

exports.p4 = function(argv)
{
	urls = argv.slice(2,4);
	async.map(urls, function(url, cb)
		{
			http.get(url, function(res){
				var body = "";
				res.on("data",function(d){body += d.toString();});
				res.on("end",function(){cb(null, body);});
				//console.log(res);
				
			}).on("error", function(e){cb(e);});
		},
		function(err, results){
			if(err) console.log(err);
			else console.log(results);
		}
	);
}

exports.p5 = function(argv)
{
	var hostname = argv[2];
	var port = argv[3];
	function createuser(userid, cb)
	{
		var options = {hostname: hostname, port: port, method: "POST", path:"/users/create" };
		var req = http.request(options, function(res)
		{
			res.on("data", function(d) {});
			res.on("end", function() {return cb(null, null);});
		});
		req.on("error", function(e){return cb(e);});
		
		req.write(JSON.stringify({"user_id": userid}));
		req.end();
	}
	
	async.series([
		function(scb)
		{
			async.times(5,function(i,cb)
			{
				createuser(i+1, function(e, r){if(e) cb(e); else cb(null,null);});
			},function(err,res)
			{
				if(err) return scb(err);
				scb(null, null);
			})
		},
		function(scb)
		{
			var options = {hostname: hostname, port: port,  path:"/users" };
			var body = "";
			http.get(options, function(res)
			{
				res.on("data",function(d){body += d.toString();});
				res.on("end",function(){scb(null, body);});
			}).on("error", function(e) {return scb(e);});
		}
	], function(err,results)
	{
		if(err) return err;
		console.log(results[1]);
	});
	
}

exports.p6 = function(url)
{
	async.reduce(["one", "two", "three"], 0, function(ini, item, cb)
	{
		http.get(url+"?number="+item, function(res)
		{
			var body="";
			res.on("data", function(d){body += d.toString();});
			res.on("end", function(){cb(null,ini+Number(body.toString()));});

		}).on("error", function(e){return cb(e);});
	}, function(err, res)
	{
		if(err) console.error(err);
		console.log(res);
	});
}

exports.p7 = function(url)
{
	var count = 0;
	var cont = 1;
	async.doWhilst(function(cb)
	{
		http.get(url, function(res){
			var body="";
			res.on("data", function(d){body += d.toString();});
			res.on("end", function(){ if (body.indexOf("meerkat") == -1) ++count; else cont = 0;cb(null);});
		});
	}, function(){ 		return cont;	}, 
	   function(err) {if(err) console.log(err); else console.log(count+1); });
}
