var express = require("express");
var url = require("url");
var fs  = require("fs");
var bing = require("node-bing-api")({accKey : 'iHwEaE76ZzjJfoR7h9k/O+vVFzEbAxk8tt+T+Gupltg='});
var app = express();

app.use(express.static(__dirname));
app.get("/api/imagesearch/:text", function(req, res){
    var parseURL = url.parse(req.url);
    var searchString = parseURL.pathname.substring(17);
    var offset = 0;
    //check if valid request
    if(parseURL.query.substring(0,7) == "offset=" && !isNaN(parseURL.query.substring(7))){
        offset = parseInt(parseURL.query.substring(7));
    }
    else{
        if(parseURL.pathname.length == parseURL.path.length){
            offset = 0;
        }
        else{
            //if offset is not an integer
            res.writeHead(200, {'Content-Type' : 'application/json'});
            res.write(JSON.stringify({'error' : 'offset must is an integer'}));
            res.end();
            return;
        }
    }
    
    searchString = searchString.replace(/%20/g, ' ');
    
    bing.images(searchString, {skip : offset}, function(err, respon, body){
        if(err) throw err;
        var bod = body.d.results;
        // console.log(offset + '-' + bod.length);
        var result = [];
        for(var i = 0; i < bod.length; i++){
            var b = bod[i];
            var obj = {
                url : b.MediaUrl,
                snippet : b.Title,
                thumbnail : b.Thumbnail.MediaUrl,
                context : b.SourceUrl,
            }
            result.push(obj);
        }
        res.json(result);
        res.end();
        return;
    });
});

app.get('/latest/imagesearch/', function (req, res) {
	fs.readFile(__dirname + '/search.json', function (err, data){
	    if(err) throw err;
	   var result = JSON.parse(data);
		res.json(result);
		res.end();
	})
});


app.listen(process.env.PORT);