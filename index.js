
async function start() {
    const express = require('express');
    const app = express();
    const PORT = process.env.PORT || 2000;
    const path = require('path');
    const SMS = require('./lib/twilio');
    const bodyParser = require('body-parser');
    const socketio = require('socket.io');
    const mongo = require('./lib/mongoUtil');
    const passport = require('passport');
    const session = require('express-session');
    const bcrypt = require('bcryptjs');
    const { ensureAuthenticated } = require('./lib/auth');

    //Awaits promise of connection to mongodb database
   await mongo.init();
   //require contacts api for getting data from db
   const {Contacts} = require('./lib/mongoUtil');
   const {Users} = require('./lib/mongoUtil');

   //Body parser to get dat from forms
   app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Passport Config
    require('./lib/passport')(passport);

      // Express session
    app.use(
        session({
        secret: process.env.SECRET,
        resave: true,
        saveUninitialized: true
        })
    );
        
    // Passport middleware
    app.use(passport.initialize());
    app.use(passport.session());

    
    app.set('view engine', 'ejs');
    
    app.use(express.static(path.join(__dirname, 'assets')))
    
    app.get('/', ensureAuthenticated, (req, res) => {
        Contacts.findContacts({}).then((contacts) => {
            res.render('sendSMS', {title: 'Send SMS', contacts: contacts})
        }).catch(err => console.log(err))
        
    })
    
    app.post('/sendSMS',ensureAuthenticated, (req, res)=> {
    
        const {numbers, message} = req.body;
        SMS.sendBulk(numbers, message);
    })
    
    app.get('/messages', ensureAuthenticated, (req, res) => {
        res.render('messages', {title: 'Messages'})
    })

    app.post('/register', (req, res) => {
        const { email, number, password } = req.body;
      
        const newUser = {
          email,
          number,
          password
        };
      
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            Users.addUser(newUser)
              .then(user => {
      
                console.log(user);
                console.log("added");
              })
              .catch(err => console.log(err));
          });
        });
      })

      app.post('/login', (req, res, next) => {
        passport.authenticate('local', function (err, user, info) {
          if (err) { return next(err); }
          if (!user) {
            return res.redirect('/login');
          }
          
          req.login(user, function (err) {
            if (err) { return next(err); }
            return res.redirect('/');
          });
        })(req, res, next);
      });
      
    
    
    app.get('/login', (req, res) => {
        res.render('login', {title: 'Login'})
    })
    
    
    app.use('/', require('./routes/contacts.js'));
    
    
    const server = app.listen(PORT, console.log(`Server started on port ${PORT}`));
    
    
    // Connect to socket.io
    const io = socketio(server);
    io.on('connection', (socket) => {
      console.log('Connected');
      io.on('disconnect', () => {
        console.log('Disconnected');
      })
    });
}

start();

