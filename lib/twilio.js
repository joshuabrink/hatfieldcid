require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilio = require('twilio')(accountSid, authToken);
const {Messages} = require('./mongoUtil');


const SMS = {
    sendSms (phone, message) {
  
        twilio.messages
          .create({
             body: message,
             from: process.env.TWILIO_PHONE,
             to: phone
           })
          .then(message => console.log(message.sid))
          .catch(err => {
            console.error(err);
          });
      },
      
      async sendBulk(numbers, message) {

        const response = {
          error : null,
          numbers : numbers
        }
         
          const service = twilio.notify.services(process.env.TWILIO_NOTIFY_SERVICE_SID);
      
          const bindings = numbers.map(number => {
            return JSON.stringify({ binding_type: 'sms', address: number });
          });
          
          await service.notifications
            .create({
              toBinding: bindings,
              body: message
            })
            .then(notification => {
              // console.log(notification);
              for (let i = 0; i < numbers.length; i++) {
                const number =  numbers[i];

                let msg = { name : '', number: number, message: message}
                let promise = Contacts.findContact({number: number}).then(contact => {
                      msg.name = contact.name;
                      return msg;
                  }).catch(err => console.log(err))

              Promise.resolve(promise).then(msg => {
                Messages.addMessage(msg).then((message) => {

                  console.log(message);     
                }).catch(err => {
                  console.log(err);
                  response.error = err;
                });
              })
               
              }

            })
            .catch(err => {
              console.error(err);
              response.error = err;
            });
            
            return response;
           
      }
}



module.exports = SMS;