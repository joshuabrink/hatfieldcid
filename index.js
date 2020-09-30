
async function start() {
  const express = require('express');
  const app = express();
  const PORT = process.env.PORT || 2000;
  const path = require('path');
  const bodyParser = require('body-parser');
  const mongo = require('./lib/mongoUtil');
  const passport = require('passport');
  const session = require('express-session');
  const bcrypt = require('bcryptjs');
  const { ensureAuthenticated } = require('./lib/auth');

  //Awaits promise of connection to mongodb database
  await mongo.init();
  //require contacts api for getting data from db
  const { Contacts } = require('./lib/mongoUtil');
  const { Users } = require('./lib/mongoUtil');
  const { Messages } = require('./lib/mongoUtil');

  //  const xlsx = require('./lib/loadDb')


  const SMS = require('./lib/twilio');

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
      res.render('sendSMS', { title: 'Send SMS', contacts: contacts })
    }).catch(err => console.log(err))

  })

  app.post('/sendSMS', ensureAuthenticated, async (req, res) => {

    const { numbers, message } = req.body;

    const date = new Date(Date.now()).toISOString();
    let msg = { message: message, date: date };
    let contactList = [];


    let allProm = new Promise((resolve, reject) => {
      for (let i = 0; i < numbers.length; i++) {
        const number = numbers[i].replace(/^27/g, '0');

        let contact = { name: '', number: number }

        let promise = Contacts.findContact({ number: number }).then(c => {
          contact.name = c.name;
          return contact;
        }).catch(err => console.log(err))

        Promise.resolve(promise).then(contact => {
          contactList.push(contact)
          if (contactList.length == numbers.length) {
            resolve(contactList);
          }

        })
      }
    })

    Promise.resolve(allProm).then(cList => {
      msg.contact = cList;

      Messages.addMessage(msg).then((message) => {

        res.send({ numbers: numbers })
        
      }).catch(err => {
        res.send({ error: err})
    
      });
      
    })



    //  await SMS.sendBulk(numbers, message).then(response => {
    //   io.emit('smsStatus', response);
    // });   

  })

  // app.get('/messages', ensureAuthenticated, (req, res) => {
  //   Messages.findContacts({}).then((contacts) => {
  //       res.render('contacts', {title: 'Contacts', contacts: contacts})
  //   }).catch(err => console.log(err))
  //     res.render('messages', {title: 'Messages'})
  // })

  // app.post('/register', (req, res) => {
  //     const { email, number, password } = req.body;

  //     const newUser = {
  //       email,
  //       number,
  //       password
  //     };

  //     bcrypt.genSalt(10, (err, salt) => {
  //       bcrypt.hash(newUser.password, salt, (err, hash) => {
  //         if (err) throw err;
  //         newUser.password = hash;
  //         Users.addUser(newUser)
  //           .then(user => {

  //             console.log(user);
  //             console.log("added");
  //           })
  //           .catch(err => console.log(err));
  //       });
  //     });
  //   })

  // (opt-in/opt-out) POST watch request
  app.post('/getMessage', (res,req) =>{
      var reqBody = "" + req.body.Body;
      if(reqBody.match(/STOP/i)){
          //TODO do mongo opt-out
      }
      else if(reqBody.match(/START/i)){
         //TODO do mongo opt-in
      }
  });

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
    res.render('login', { title: 'Login' })
  })

  // Logout
  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });



  app.use('/', require('./routes/contacts.js'));
  app.use('/', require('./routes/messages.js'));


  const server = app.listen(PORT, console.log(`Server started on port ${PORT}`));


  // Connect to socket.io

}

start();

