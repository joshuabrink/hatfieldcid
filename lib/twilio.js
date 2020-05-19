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
      
      sendBulk(numbers, message) {
          const service = twilio.notify.services(process.env.TWILIO_NOTIFY_SERVICE_SID);
      
          const bindings = numbers.map(number => {
            return JSON.stringify({ binding_type: 'sms', address: number });
          });
          
          service.notifications
            .create({
              toBinding: bindings,
              body: message
            })
            .then(notification => {
              console.log(notification);
              for (const number in numbers) {
                Messages.addMessage({number, message}).then((message) => {
                  console.log(message);
                }).catch(err => console.log(err));
  
              }
            })
            .catch(err => {
              console.error(err);
            });
      }
}



module.exports = SMS;