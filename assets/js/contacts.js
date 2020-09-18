const filterBody = document.querySelector('tbody');
const title = document.title
let f = new Filter(title)
let numberFormat = /[0-9]{10}/g
let emailFormat = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
let checkFormat = /^<input type="checkbox"/g



f.setFilter();
f.startListen();


class Update {
  constructor() {
    this.rows = Array.from(document.querySelectorAll('tbody tr'))
    this.headers = Array.from(document.querySelectorAll('thead tr th'))
  }

  startListen() {

  }

  editListen(row) {
    let editBtn = row.querySelector('.left');
    let delBtn = row.querySelector('.right');
    let _this = this;

    delBtn.addEventListener('click', (e) => {
      e.preventDefault();

      _this.changeBtns(row, true, 'delete')
    })

    // for (let i = 0; i < editBtn.length; i++) {
    editBtn.addEventListener('click', (e) => {
      e.preventDefault();

      let rowArr = Array.from(row.children);
      let inputType = "text";

      for (let j = 0; j < rowArr.length; j++) {

        if (numberFormat.test(rowArr[j].innerText)) {
          inputType = "number";
        }
        else if (emailFormat.test(rowArr[j].innerText.toLowerCase())) {
          inputType = "email";
        }
        else if (checkFormat.test(rowArr[j].innerHTML)) {
          rowArr[j].innerHTML = rowArr[j].innerHTML.replace(/disabled/g, '');
          continue;
        }
        else if (rowArr[j].classList.contains('editDelete')) {
          // rowArr[j].querySelector('.left').style = "background: green;";
          // rowArr[j].querySelector('.right button').style = "background: red;";
          // rowArr[j].innerHTML = rowArr[j].innerHTML.replace(/fa-edit/g, 'fa-check');
          // rowArr[j].innerHTML = rowArr[j].innerHTML.replace(/fa-trash/g, 'fa-times');
          // this.confirmListen(row);
          _this.changeBtns(row, true)

          continue;
        }
        rowArr[j].innerHTML = "<input class='form-control form-control-sm' \
          type='"+ inputType + "' \
          name='"+ this.headers[j].innerText.toLowerCase() + "' \
          value='"+ rowArr[j].innerText + "'>";

        inputType = "text";
      }


    })
  }

  editAllListen() {
    for (let i = 0; i < this.rows.length; i++) {
      this.editListen(this.rows[i]);
    }
  }

  changeBtns(row, direction, type) {
    if(direction) {
      row.querySelector('.left').style = "background: green;";
      row.querySelector('.right button').style = "background: red;";
      row.innerHTML = row.innerHTML.replace(/fa-edit/g, 'fa-check');
      row.innerHTML = row.innerHTML.replace(/fa-trash/g, 'fa-times');
      this.confirmListen(row, type);
    } else {
      row.querySelector('.left').style = "";
      row.querySelector('.right button').style = "";
      row.innerHTML = row.innerHTML.replace(/fa-check/g, 'fa-edit');
      row.innerHTML = row.innerHTML.replace(/fa-times/g, 'fa-trash');
    }

  }
  revertRow(row) {

    let rowArr = Array.from(row.children);
    for (let c = 0; c < rowArr.length; c++) {

      if (rowArr[c].classList.contains('editDelete')) {
        // rowArr[c].querySelector('.left').style = "";
        // rowArr[c].querySelector('.right button').style = "";
        // rowArr[c].innerHTML = rowArr[c].innerHTML.replace(/fa-check/g, 'fa-edit');
        // rowArr[c].innerHTML = rowArr[c].innerHTML.replace(/fa-times/g, 'fa-trash');
        this.changeBtns(row, false)
      } else if (checkFormat.test(rowArr[c].innerHTML)) {
        rowArr[c].querySelector('input').disabled = true;
      }
      else {
        let val = rowArr[c].querySelector('input').value;
        rowArr[c].innerHTML = val;
      }

    }
  }

  updateContact(row) {
    let rowArr = Array.from(row.children);

    let contact = {};
    let key = "";
    let value = "";

    for (let i = 0; i < rowArr.length; i++) {

      key = rowArr[i].firstChild.name
      value = rowArr[i].firstChild.value
      if (key && value) {
        contact = { ...contact, [key.trim()]: value }
      }

    }

    contact.id = row.querySelector('input[name="_id"]').value
    // let contact = {
    //    name : row.querySelector('input[name="name"]'),
    //    email : row.querySelector('input[name="email"]'),
    //    number : row.querySelector('input[name="number"]'),
    //    company : row.querySelector('input[name="company"]'),
    //    optIn : row.querySelector('input[name="optIn"]')
    // }

    asyncReq('/updateContact', 'post', contact, showResponse)


  }

  confirmListen(row, type = 'edit') {
    // let linksContainer = row.find(el => el.classList.contains('editDelete'));
    let links = row.querySelectorAll('a, button');
    let _this = this;
    for (let i = 0; i < links.length; i++) {

      if (links[i].classList.contains('left')) {
        links[i].addEventListener('click', function handler(e) {
          e.preventDefault()

          if (type == 'edit') {
            _this.updateContact(row);
          } else {
            _this.deleteListen(row);
          }

          _this.revertRow(row);
          e.currentTarget.removeEventListener(e.type, handler);
          _this.editListen(row);
        })
      } else {
        links[i].addEventListener('click', function handler(e) {
          e.preventDefault()
          if (type == 'edit') {
            _this.revertRow(row);
          } else {
            _this.changeBtns(row, false)
          }
          e.currentTarget.removeEventListener(e.type, handler);
          _this.editListen(row);
        })
      }
    }


  }

  deleteListen(row) {

    let delForm = row.querySelector('right');
    // let _this = this;

      delForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let id = delForm.querySelector('input[name="_id"]').value
        // _this.confirmListen(row, 'delete');

        asyncReq('/deleteContact', 'post', { _id: id, async: true }, (data) => {
          if (data.msg == "success") {
            rows[i].remove();
          }
        })
      }) 

  }



}

let u = new Update();

u.editAllListen();



// let rows = Array.from(document.querySelectorAll('tbody tr'))
// let headers = Array.from(document.querySelectorAll('thead tr th'))
// let editBtn = Array.from(document.querySelectorAll('.edit'));


// function editListen(row) {
//   let editBtn = row.find(el => el.firstChild.classList.contains('edit'));

//   // for (let i = 0; i < editBtn.length; i++) {
//     editBtn[i].addEventListener('click', (e) => {
//       e.preventDefault();

//       let row = Array.from(rows[i].querySelectorAll('td'));
//       let inputType = "text";

//       for (let j = 0; j < row.length; j++) {

//         if(numberFormat.test(row[j].innerText)) {
//           inputType = "number";
//         } 
//         else if(emailFormat.test(row[j].innerText.toLowerCase())) {
//           inputType="email";
//         } 
//         else if(checkFormat.test(row[j].innerHTML)) {
//           row[j].innerHTML = row[j].innerHTML.replace(/disabled/g, '');
//           continue;
//         }
//         else if(row[j].classList.contains('editDelete')) {
//           row[j].querySelector('.edit').style = "background: green;";
//           row[j].querySelector('.delete button').style = "background: red;";
//           row[j].innerHTML =row[j].innerHTML.replace(/fa-edit/g, 'fa-check');
//           row[j].innerHTML =row[j].innerHTML.replace(/fa-trash/g, 'fa-times');
//           confirmListen(row);

//           continue;
//         }
//         row[j].innerHTML = "<input class='form-control form-control-sm' \
//         type='"+inputType+"' \
//         name='"+ headers[j].innerText.toLowerCase() +"' \
//         value='"+ row[j].innerText +"'>";

//         inputType = "text";
//       }


//     })

//   // }
// }

// editListen()

// function confirmListen(row) {
//   let linksContainer = row.find(el => el.classList.contains('editDelete'));
//   let links = linksContainer.querySelectorAll('a, button');
//   for (let i = 0; i < links.length; i++) {
//     if(links[i].classList.contains('edit')) {
//      links[i].addEventListener('click',function handler(e) {
//         e.preventDefault()

//         updateContact(row);
//         revertRow(row);     
//         e.currentTarget.removeEventListener(e.type, handler);
//       })
//     } else {
//       links[i].addEventListener('click', function handler(e) {
//         e.preventDefault()

//         revertRow(row);
//         e.currentTarget.removeEventListener(e.type, handler);

//       })
//     }   
//   }

// }

// function revertRow(row) {
//   for (let c = 0; c < row.length; c++) {


//     if(row[c].classList.contains('editDelete')) {
//       row[c].querySelector('.edit').style = "";
//       row[c].querySelector('.delete button').style = "";
//        row[c].innerHTML = row[c].innerHTML.replace(/fa-check/g, 'fa-edit');
//        row[c].innerHTML = row[c].innerHTML.replace(/fa-times/g, 'fa-trash');
//     } else if(checkFormat.test(row[c].innerHTML)) {
//       row[c].querySelector('input').disabled = true;
//     }  
//     else {
//       let val = row[c].querySelector('input').value;
//       row[c].innerHTML = val;
//     }

//   }
// }

// function updateContact(row) {


//   let contact = {};
//   let key = "";
//   let value = "";

//   for (let i = 0; i < row.length; i++) {

//     key = row[i].firstChild.name
//     value = row[i].firstChild.value
//     contact = {...contact, [key]: value}

//   }

//   contact._id = row.querySelector('input[name="_id"]').value
//   // let contact = {
//   //    name : row.querySelector('input[name="name"]'),
//   //    email : row.querySelector('input[name="email"]'),
//   //    number : row.querySelector('input[name="number"]'),
//   //    company : row.querySelector('input[name="company"]'),
//   //    optIn : row.querySelector('input[name="optIn"]')
//   // }

//   asyncReq('/updateContact', 'post', contact, showResponse)


// }

function deleteListen(type) {

  let delForms = Array.from(document.querySelectorAll('right'));


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

  // deleteListen("Contact");