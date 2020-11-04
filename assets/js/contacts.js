const parent = document.querySelector('.parentContainer');
const filterBody = parent.querySelector('tbody');
const title = document.title
let f = new Filter(title, parent, filterBody)




f.setFilter();
f.startListen();


// let u = new Update();

// u.editAllListen();


function contactAdd(inputArr) {
  let contact = {};
  let key = "";
  let value = "";

  for (let i = 0; i < inputArr.length; i++) {

    key = inputArr[i].name
    value = inputArr[i].value
    if (key && value) {
      contact = { ...contact, [key.trim()]: value }
    }

  }
  contact.async = true;

  asyncReq('/addContact', 'post', contact, (data) => {
    data = data;


    let row = '<tr><td>' + data.group + '</td>\
   <td>' + data.name + '</td>';
    row += '<td>' + data.company + '</td>';
    row += '<td>' + data.number + '</td>';
    row += '<td>' + data.email + '</td>';
    row += '<td><input type="checkbox" name="optIn" checked disabled></input></td>';
    row += '<td class="editDelete"><div class="dropdown">\
          <i class="fa fa-ellipsis-v " type="button" id="dropdownMenuButton" data-toggle="dropdown"></i>\
          <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">\
              <a class="left dropdown-item" href="/editContact"><i class="fa fa-edit"></i> Edit</a>\
              <form action="/deleteContact" method="post" class="right dropdown-item">\
                  <input type="hidden" name="_id" value="'+ data._id + '">\
                  <input type="hidden" name="async" value="false">\
                  <a type="submit"><i class="fa fa-trash"> Delete</i></a>\
              </form>\
          </div>\
        </div>\
  </td>';
    row += '</tr>';

    filterBody.innerHTML = row + filterBody.innerHTML;
    let u = new UpdateContact(parent, filterBody)
    row = filterBody.firstChild;

    u.editListen(row);
  })

}

let contactFrom = document.getElementById('contact-form');

let inputs = contactFrom.querySelectorAll('input');

contactFrom.addEventListener('submit', e => {
  e.preventDefault();
  contactAdd(inputs);
})


