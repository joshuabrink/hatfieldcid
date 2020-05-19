const numberInput = document.getElementById('numbers'),
    //   scheduleSelect = document.getElementById('schedule'),
      button = document.getElementById('send'),
      response = document.querySelector('.response');

    

button.addEventListener('click', send, false);

const socket = io();
socket.on('smsStatus', function(data){
  if(data.error){
    response.innerHTML = '<h5>Text message sent to ' + data.error + '</h5>';
  }else{
    response.innerHTML = '<h5>Text message sent to ' + data.number + '</h5>';
  }
});

// let timeOut;
// const getTimeSchedule = ({ time, number, text }) => {
//   if(timeOut) clearTimeout(timeOut);
//   timeOut = setTimeout(() => {
//     fetchServer({ number, text });
//   }, time * 60 * 1000);
// };


const fetchServer = ({ numbers, message }) => {
  console.log('send');
  fetch('/sendSMS', {
    method: 'post',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({ numbers, message })
  })
    .then(function (res) {
      console.log(res);
    })
    .catch(function (err) {
      console.log(err);
    });
};

function send() {
    const numbersInput = document.querySelectorAll('.number');
    const numbers = Array.from(numbersInput).map(number => {
        return number.innerText.replace(/\D/g, '')
    })

    const textInput = document.getElementById('msg')

    // const bindings = numbers.map(number => {
    //     return JSON.stringify({ binding_type: 'sms', address: number });
    //   });
//   const number = numberInput.value.replace(/\D/g, '');
  const message = textInput.value;
//   const time = parseInt(scheduleSelect.value, 10);
//   getTimeSchedule({ number, text, time });
    fetchServer({numbers, message});
}