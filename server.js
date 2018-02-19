var express = require('express');
var aws = require('aws-sdk');
var app = express();
var session = require('express-session');
var cookie = require('cookie-parser')
var passport = require('passport');
var multer = require('multer');
var multerS3 = require('multer-s3');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');

var s3 = new aws.S3({accessKeyId:process.env.AWS_ACCESS_KEY_ID,
                     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY});

var database;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var storage = multer.diskStorage({
	
	destination: function(req,file,callback) {
		callback(null, './public/user/fileUpload/')
	},
	filename: function(req,file,callback){
		//var  = file.originalname.split('.');
		//callback(null, file.name + '.'+ fileExtension[fileExtension.length-1])
		callback(null, file.originalname)

	}
});

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'esa-experiment-images',
	acl:'public-read',
	contentType: multerS3.AUTO_CONTENT_TYPE,
	contentDisposition: 'inline',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, file.originalname);
    }
  })
});


/*
var upload = multer({
				storage: storage
			}).single('file');
*/
app.set('views',__dirname+'./public/users');
app.set('view engine', 'ejs');
multer();
app.use(session({ secret: 'laobanandmumu'}));
app.use(cookie());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));


var passwords = [{password: 'MASTER', roles:['admin']},
                 {password: 'Exp0', roles:['experiment']},
				 {password: 456, roles:['experiment']}, 
				 {password: 789, roles:['experiment']}];

passport.use( new LocalStrategy (
function( username, password, done){
	console.log('authenticating...');
	/*
	for( var p in passwords){
		if( password == passwords[p].password){
			return done(null,{password: password, roles:passwords[p].roles},
			{message:'Hello!'});
		}
	}*/

	database.collection('password_holder',function(err,collection){
		collection.find({'password':{$regex:password}},{_id:0,roles:1},function(err,result){
			result.toArray().then(function(something){
				console.log("Anything? " + something[0] + " !!!");
				if(something[0]){
					return done(null,{password: password, roles:something[0].roles},
						{message:'Hello!'});
				}
				else{
					console.log("Failed!");
					return done(null, false, {message: 'Unable to login'});
				}
			});
		});
	});
	
	
}));

passport.serializeUser( function(user,done){
	done(null,user);
});

passport.deserializeUser( function(user,done){
	done(null,user);
});

var auth = function(req,res,next){
		console.log('authenticating22...');

	if (!req.isAuthenticated()){
		res.send(401);
	}
	else{
		next();
	}
};

/*
var checkPass=function(pass){
	console.log("passing");
	database.collection('password_holder',function(err, collection){
		collection.find({'password':{$regex:pass}},{_id:0,roles:1},function(err,result){
			result.toArray().then(function(something){
				console.log(something[0].roles);
				return something[0].roles;
			});
		});
	});
}*/



//app.get('/admin',auth2);

//app.get('/profile',auth);

app.post("/login",passport.authenticate('local'), function(req,res){
	console.log("survived!");
	res.send(req.user);
});

app.get("/loggedin",function(req,res){
	res.send(req.isAuthenticated() ? req.user : '0' );
});

app.get("/isAdmin",function(req,res){
	req.user.newAttribute = "fudge";
	res.send(req.isAuthenticated() && req.user.roles[0]=="admin" ? req.user : '0' );
});

app.post("/logout",function(req,res){
	req.logOut();
	res.send(200);
});


app.post('/upload',upload.array('file'),function(req,res){
		console.log("uploading...");
		res.send('Uploaded.');
});

/*
app.post('/upload',auth,function(req,res){
	s3 = new aws.S3();
	
	fileName = req.query['fileName'];
	fileType = req.query['fileType'];
	
	console.log('BOdy: ' +req[0]);
	fileName = req.body.file;
	fileType = '';
	s3Params = {
		Bucket: S3_BUCKET,
		Key: fileName,
		Expires: 60,
		ContentType: fileType,
		ACL: 'public-read'
	};
	
	s3.getSignedUrl('putObject', s3Params,function(err,data){
		if(err){
			console.log(err);
			return res.end();
		}
		returnData = {
			signedRequest: data,
			url: 'https://${S3_BUCKET}.s3.amazonaws.com/${fileName}'
		};
		res.write(JSON.stringify(returnData));
		res.end();
	});
})


/*
app.post('/upload', auth, function(req, res) {
	console.log("uploading...");
	
	upload(req,res,function(err){
		
		if(err){
			res.msg="Error";
		}
	});
});*/

app.post('/resultsUpload', auth, function(req, res) {
	
	var combine = [];
	combine.push(req.user.name);
	combine.push(req.user.age);
	combine.push(req.user.gender);
	combine.push(req.user.personal);
	combine.push(req.user.pAnswers);
	var container = {};
	for( item in req.body.answers ){
		combine.push(req.body.questions[item].file);
		combine.push(req.body.questions[item].description);
		combine.push(req.body.questions[item].options);
		combine.push(req.body.answers[item]);
		combine.push(req.body.times[item]);
	}
	console.log(req.user.password);
	database.collection(req.user.password, function(err,collection){
		console.log(collection);
		collection.insertOne({combine});
	});
	
});

app.post('/checkPass',function(req,res){
	console.log('Maybe here');
	console.log(typeof req.body.possibility);
	database.collection('password_holder',function(err, collection){
		collection.find({'password':{$regex:req.body.possibility}},{_id:0,roles:1},function(err,result){
			result.toArray().then(function(something){
					console.log('What did you find, my precious?' + something);
					if(something[0]){
						res.send(false);
					}
					else{
						res.send(true);
					}
			});
		});
	});

});

app.post('/finalize',function(req, res){
	console.log('Submitted!');
	console.log(req.body.questions);
	database.collection( 'exp', function(err, collection) {
		collection.insertOne(
		{ expID : req.body.password,
		  questions : req.body.questions
		});
	});
	database.collection( 'password_holder', function(err, collection) {
		collection.insertOne(
		{ password : req.body.password,
		  roles:['experiment']
		});
	});
	database.createCollection( req.body.password );
});

app.get('/getQuestion',function(req,res){
	var password=req.user.password;
	database.collection('exp',function(err,collection){
		
		result = collection.find({'expID':{$regex:password}},{questions:1});
						
		result.toArray().then(function(something){
			console.log(something);
			res.json(something);
		});
		
	});
	
});

app.post('/addPersonal', function(req,res){
	
	database.collection( 'Exp0', function(err,collection){
		collection.find({'user_name':{$regex:req.body.name}},{_id:1},function(err,result){
			found = result.toArray();
			found.then(function(something){
				console.log(something.length);
				if(!something.length){
					req.user.name = req.body.name;
					req.user.age = req.body.age;
					req.user.gender = req.body.gender;
					req.user.personal = req.body.personal;
					req.user.pAnswers = req.body.answers;
					console.log(req.user);
					res.send(req.user);
				}
				else{
					res.send('');
				}
			});
			
		});
	});
});

/*
app.get('/retrieveData',function(req,res){
	database.collection('exp',function(err,collection){
		collection.find(function(err,result){
			var single = result.toArray();
			single.then(function(something){
				console.log(something);
				//name = something[0].expID;
			
				
				//for(var exp = 0; exp < 2; exp++){
					name = something[0].expID;
					console.log(name);
					database.collection(name,function(err,collection){
						collection.find(function(err,result){
							console.log('records');
							var arr = result.toArray();
							var data = [];
							arr.then(function(something){
								data = something;
								console.log('Within: ' + something);
								var content="";
								for (record in data){
									content = content + "{";
									var count = 0;
									for (item in data[record].combine){
										if(item == 0){
											content = content + "name:" + JSON.stringify(data[record].combine[item])+ ', ';
										}
										else if(item == 1){
											content = content + "age:" + JSON.stringify(data[record].combine[item])+ ', ';
										}
										else if( item == 2){
											content = content + "gender:" + JSON.stringify(data[record].combine[item])+ ', ';
										}
										else if(item == 3){
											
											for( ans in data[record].combine[item] ){
																					
												content = content + JSON.stringify(data[record].combine[item][ans]) + ":" +
														  JSON.stringify(data[record].combine[parseInt(item)+1][ans]) + ', ';
											}
										}
										else if(parseInt(item)%5 == 0){	
											content = content + "file" + count + ":"+JSON.stringify(data[record].combine[parseInt(item)]+', ');
											content = content + "description" + count + ":" + JSON.stringify(data[record].combine[parseInt(item)+1]+', ');
											content = content + "options" + count + ":" + JSON.stringify(data[record].combine[parseInt(item)+2]+', ');
											content = content + "answer" + count + ":" + JSON.stringify(data[record].combine[parseInt(item)+3]+', ');
											content = content + "time"+count+":"+JSON.stringify(data[record].combine[parseInt(item)+4]);
											if(parseInt(item)+4 !=data[record].combine.length-1){
												content = content + ', ';
											}
											count = count + 1;
										}
										
									}
									content = content + '}\r\n';
								}
								console.log('./public/user/'+name+'.json');
								fs.writeFileSync('./public/user/'+name+'.json',content);
								res.send('./public/user/'+name+'.json');
							});	
					
					
						});
					
					});
				//}
			});
		});
	});
	
	
});
*/


app.get('/retrieveData',function(req,res){
	experimentName = req.query.name;
	database.collection(experimentName, function(err,collection){
		collection.find(function(err,result){
			console.log('records');
			var arr = result.toArray();
			var data = [];
			arr.then(function(something){
				data = something;
				console.log('Within: ' + something);
				var content=" \"experimenters\":[";
				for (record in data){
					content = content + "{";
					var count = 0;
					for (item in data[record].combine){
						if(item == 0){
							content = content + "\"name\":" + JSON.stringify(data[record].combine[item])+ ', ';
						}
						else if(item == 1){
							content = content + "\"age\":" + JSON.stringify(data[record].combine[item])+ ', ';
						}
						else if( item == 2){
							content = content + "\"gender\":" + JSON.stringify(data[record].combine[item])+ ', ';
						}
						else if(item == 3){
							
							for( ans in data[record].combine[item] ){
																	
								content = content + JSON.stringify(data[record].combine[item][ans]) + ":" +
										  JSON.stringify(data[record].combine[parseInt(item)+1][ans]) + ', ';
							}
						}
						else if(parseInt(item)%5 == 0){	
							content = content + "\"file" + count + "\":"+JSON.stringify(data[record].combine[parseInt(item)])+', ';
							content = content + "\"description" + count + "\":" + JSON.stringify(data[record].combine[parseInt(item)+1])+', ';
							content = content + "\"options" + count + "\":" + JSON.stringify(data[record].combine[parseInt(item)+2])+', ';
							content = content + "\"answer" + count + "\":" + JSON.stringify(data[record].combine[parseInt(item)+3])+', ';
							content = content + "\"time"+count+"\":"+JSON.stringify(data[record].combine[parseInt(item)+4]);
							if(parseInt(item)+4 !=data[record].combine.length-1){
								content = content + ', ';
							}
							count = count + 1;
						}
						
					}
					
					if(record == data.length-1){
						content = content + '}\r\n';
					}	
					else{
						content = content + '},\r\n';
					}
				}
				content = content + ']';
				console.log(content);
				res.send(content);
			});	
		});
	});
	
});

app.get('/getProfileInfo', function(req,res){
			data = fs.readFileSync('./profileOptions.txt','utf8');			
				res.send(data);
});

app.post('/setProfileInfo', function(req,res){
	
	var content = "[";
	for( question in req.body.edits ){
		
		if( question != req.body.edits.length-1){
			content = content + "\"" + req.body.edits[question] + "\","; 
		}
		else{
			content = content + "\"" + req.body.edits[question] + "\"]";
		}
	}
	
	fs.writeFileSync('./profileOptions.txt',content);
	res.send("File uploaded");
});

app.get('/retrievePasswords',function(req,res){
	database.collection('exp',function(err,collection){
		collection.find(function(err,result){
			result.toArray().then(function(something){
				res.send(something);
			});
		});
	});
});

app.post('/deleteExperiment',function(req,res){
	database.collection(req.body.name,function(err,collection){
		collection.drop();
	});
	database.collection('exp',function(err,collection){
		collection.deleteOne({'expID':(req.body.name)});
	});
	database.collection('password_holder',function(err,collection){
		collection.deleteOne({'password':(req.body.name)});
	});
	
});

/*new code trial*/
app.get('/', function(req,res){
	
	res.sendfile("index.html",{root:__dirname});
})

var port      = process.env.PORT || 3000;
const S3_BUCKET = process.env.S3_BUCKET;


// Connect to the db
MongoClient.connect("mongodb://yuchingsun:rosemary11@ds115671.mlab.com:15671/heroku_1vtzmkf4", function(err, db) {
  if(!err) {
    console.log("We are connected");
	database = db;
	
  }
  app.listen(port);
});