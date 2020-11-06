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

    resetFields()

    u.editListen(row);
  })

}

function resetFields() {
  let contactForm = document.querySelectorAll('#contact-form input');

  for (let i = 0; i < contactForm.length; i++) {
    contactForm[i].value = ''
    
  }

  $('#accordion-1 .item-1').collapse('hide')

}




let contactFrom = document.getElementById('contact-form');

let inputs = contactFrom.querySelectorAll('input');

contactFrom.addEventListener('submit', e => {
  e.preventDefault();
  contactAdd(inputs);
})

let contactCollapse = document.querySelector('.new-contact-btn')

contactCollapse.addEventListener('click', e => {
  let groupInput = contactFrom.querySelector('input[name="group"]').parentNode

  asyncReq("/findDistinctGroups", "post", {}, (data) => {
    let select =   `<label for="groupSelect">Group</label>
    <select id="groupSelect" class="form-control" name="group" required>`
    select += `<option selected></option>`
    for (let i = 0; i < data.length; i++) {
    select += `<option>${data[i]}</option>`
      
    }

    select += `</select>`
    groupInput.innerHTML = select

  })

})


