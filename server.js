// ========================
// get the packages we need 
// ========================
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User   = require('../nodejs1/models/user'); // get our mongoose model

// =======================
// configuration =========
// =======================
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// =======================
// routes ================
// =======================
// basic route

	app.get('/setup', function(req, res) {

	  // create a sample user
	  var chris = new User({ 
	    name: 'Chris Salvi',
	    _id: 0,
	    age: 13, 
	    password: 'password',
	    admin: true 
	  });

	  chris.save(function(err){
	  	if(err) return handleError(err);

	  	var group1 = new Group({
	  		name: 'myspace',
	  		_creator: chris._id
	  	});

	  	group1.save(function(err) {
	  		if (err) return handleError(err);
	  	});
	  });
	 });

	


// API ROUTES -------------------
// get an instance of the router for api routes

var apiRoutes = express.Router(); 

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', function(req, res) {

  // find the user
  User.findOne({
    name: req.body.name
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresInMinutes: 1440 // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }   
    }
  });
});

// route middleware to verify a token
apiRoutes.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
    
  }
});


// route to show a test message (GET http://localhost:8080/api/)
	apiRoutes.get('/', function(req, res) {
	  res.json({ message: 'Welcome to the coolest API on earth!' });
	});

// route to return all users (GET http://localhost:8080/api/users)
	apiRoutes.route('/users')

	.get('/users', function(req, res) {
	  User.find({}, function(err, users) {
	    if (err)
            res.send(err);

	    res.json(users);
	  });
	});   


	// create a user (accessed at POST http://localhost:8080/api/users)
    apiRoutes.route('/users')

    .post(function(req, res) {
        
        var user = new User();      // create a new instance of the User model
        user.name = req.body.name;  // set the user name (comes from the request)

        // save the user and check for errors
        user.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'User created!' });
        });
    });


// on routes that end in /users/:user_id
// ----------------------------------------------------
	apiRoutes.route('/users/:user_id')

    // get the user with that id (accessed at GET http://localhost:8080/api/users/:user_id)
    .get(function(req, res) {
        User.findById(req.params.user_id, function(err, user) {
            if (err)
                res.send(err);
            res.json(user);
        });
    });

// update the user with this id (accessed at PUT http://localhost:8080/api/users/:user_id)
    apiRoutes.route('/users/:user_id')

    .put(function(req, res) {

        // use our User model to find the user we want
        User.findById(req.params.user_id, function(err, user) {

            if (err)
                res.send(err);

            user.name = req.body.name;  // update the user info

            // save the user
            user.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'User updated!' });
            });
        });
    });

// delete the user with this id (accessed at DELETE http://localhost:8080/api/users/:user_id)
    apiRoutes.route('/users/:user_id')

    .delete(function(req, res) {
        User.remove({
            _id: req.params.user_id
        }, function(err, user) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);




//---------GROUP Routes--------------------------------//


// route to return all groups (GET http://localhost:8080/api/groups)
	
	apiRoutes.route('/groups')

	.get('/groups', function(req, res) {
	  Group.find({}, function(err, groups) {
	    if (err)
            res.send(err);

	    res.json(groups);
	  });
	});   

// create a group (accessed at POST http://localhost:8080/api/group)
    
    apiRoutes.route('/groups')

    .post(function(req, res) {
        
        var group = new Group();      // create a new instance of the Group model
        group.name = req.body.name;  // set the group name (comes from the request)

        // save the group and check for errors
        group.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Group created!' });
        });
    });


// on routes that end in /groups/:group_id
// ----------------------------------------------------
	
	apiRoutes.route('/groups/:group_id')

    // get the group with that id (accessed at GET http://localhost:8080/api/groups/:group_id)
    .get(function(req, res) {
        Group.findById(req.params.group_id, function(err, group) {
            if (err)
                res.send(err);
            res.json(group);
        });
    });

// update the group with this id (accessed at PUT http://localhost:8080/api//groups/:group_id)
    
    apiRoutes.route('/groups/:group_id')
    .put(function(req, res) {

        // use our Group model to find the group we want
        Group.findById(req.params.group_id, function(err, group) {

            if (err)
                res.send(err);

            group.name = req.body.name;  // update the group info

            // save the group
            group.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Group updated!' });
            });
        });
    });

// delete the user with this id (accessed at DELETE http://localhost:8080/api/groups/:group_id)
    apiRoutes.route('/groups/:group_id')

    .delete(function(req, res) {
        Group.remove({
            _id: req.params.group_id
        }, function(err, user) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });


// =======================
// start the server ======
// =======================

	app.listen(port);
	console.log('Magic happens at http://localhost:' + port);
