

// class Filter {
//   constructor(type) {
//     this.type = type;
//     this.order = [-1, -1];
//     this.cols = Array.from(document.querySelectorAll('.col-sort'));
//     this.amount = document.getElementById('filterAmount');
//     this.filter = { limit: -1, sort: {} };
//   }



//   setFilter(index) {

//     this.filter.sort = {};

//     if(typeof index !== 'undefined') {
//         let key = this.cols[index].id.replace('-sort', '');
//         this.filter.sort = { ...this.filter.sort, [key]: this.order[index] }
//         this.order[index] =  this.order[index] == -1 ? 1 : -1;
//     }
//     this.filter.limit = parseInt(this.amount.value);
//     this.filter.async = true;
//   }

//   startListen() {
//     for (let i = 0; i < this.cols.length; i++) {

//       this.cols[i].addEventListener('click', e => {
//         e.preventDefault()

//         showPreloader(filterBody)
//         this.setFilter(i);

//         asyncReq('/'+ this.type+ 'sFilter', 'post', this.filter, this.showResponse)
//       })

//     }

  
//       let search = document.getElementById("search");
    
//       search.addEventListener('submit', e => {
//         e.preventDefault();
//         showPreloader(filterBody)
//         let searchTerm = search.querySelector('input[type="search"]').value;
    
//         asyncReq('/searchMessages', 'post', { term: searchTerm, async: true }, this.showResponse)
    
//       })
    

//     this.amount.addEventListener('change', (e) => {
//       // let filter = { amount: parseInt(e.target.value) };
//       showPreloader(filterBody)
//       this.setFilter();

//       asyncReq('/'+ this.type+ 'sFilter', 'post', this.filter, this.showResponse)
//       // messageFilter(filter)
//     })

//   }


//   showResponse(data) {

//     removePreloader();

//     // setTimeout(() => {

//       filterBody.classList.remove('fadeIn')
//       void filterBody.offsetWidth;

//       let row = '';
//       filterBody.innerHTML = row;

//       for (let m = 0; m < data.length; m++) {

//         row = '<tr><td class="flex start-left flex-wrap pt-0">'
//         for (let c = 0; c < data[m].contact.length; c++) {
//           let contact = data[m].contact[c];
//           row += '<div class="cross-fade c-tag">\
//             <div class="top">' + contact.name + '</div> \
//           <div class="under">' + contact.number + '</div></div>';

//         }
//         row += '</td><td>' + data[m].message + '</td>';
//         row += '<td>' + data[m].date + '</td>';
//         row += '<td>\
//         <form action="/deleteMessage" method="post" class="delete">  \
//             <input type="hidden" name="_id" value="'+ data[m]._id + '">\
//             <input type="hidden" name="async" value="false">\
//             <button class="btn btn-primary" type="submit"><i class="fa fa-trash"></i></button>\
//         </form>\
//         </td>'
//         row += '</tr>';
//         filterBody.innerHTML += row;
//       }


//       this.body.classList.add('fadeIn')
//     // }, 1000);
//   }


// }

const filterBody = document.querySelector('tbody');
const title = document.title
let f = new Filter(title)



f.setFilter();
f.startListen();



// const showMessagesResponse = (data) => {

//   removePreloader()

//   setTimeout(() => {

//     tableBody.classList.remove('fadeIn')
//     void tableBody.offsetWidth;

//     let row = '';
//     tableBody.innerHTML = row;

//     for (let m = 0; m < data.length; m++) {

//       row = '<tr><td class="flex start-left flex-wrap pt-0">'
//       for (let c = 0; c < data[m].contact.length; c++) {
//         let contact = data[m].contact[c];
//         row += '<div class="cross-fade c-tag">\
//             <div class="top">' + contact.name + '</div> \
//           <div class="under">' + contact.number + '</div></div>';

//       }
//       row += '</td><td>' + data[m].message + '</td>';
//       row += '<td>\
//         <form action="/deleteMessage" method="post" class="delete">  \
//             <input type="hidden" name="_id" value="'+ data[m]._id + '">\
//             <input type="hidden" name="async" value="false">\
//             <button class="btn btn-primary" type="submit"><i class="fa fa-trash"></i></button>\
//         </form>\
//         </td>'
//       row += '</tr>';
//       tableBody.innerHTML += row;
//     }


//     tableBody.classList.add('fadeIn')
//   }, 1000);
// }

// function searchListen() {
//   let search = document.getElementById("search");

//   search.addEventListener('submit', e => {
//     e.preventDefault();

//     let searchTerm = search.querySelector('input[type="search"]').value;



//     asyncReq('/searchMessages', 'post', { term: searchTerm, async: true }, (data) => {
//      f.showResponse(data)
//     })

//   })
// }

// searchListen();

function deleteListen(type) {

  let delForms = Array.from(document.querySelectorAll('.delete'));
  let rows = Array.from(document.querySelectorAll('tbody tr'))

  for (let i = 0; i < delForms.length; i++) {
    delForms[i].addEventListener('submit', (e) => {
      e.preventDefault();
      let id = delForms[i].querySelector('input[name="_id"]').value

      asyncReq('/delete' + type, 'post', { _id: id, async: true }, (data) => {
        if (data.msg == "success") {
          rows[i].remove();
        }
      })
    })

  }

}

deleteListen("Message");


