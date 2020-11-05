
//***** FRONT END DYNAMIC INPUT *******//

//Contact list to Number Input class
const TagsInput = function (element) {
    var self = this;
    var initChar = "\u200B";
    var initCharPattern = new RegExp(initChar, 'g');

    var insert = function (element) {
        if (self.textNode) self.element.insertBefore(element, self.textNode);
        else self.element.appendChild(element);
    };

    var updateCursor = function () {
        self.cursor = self.blank;
    };

    var focus = function () {
        updateCursor();
    };

    Object.defineProperties(this, {
        element: {
            get: function () {
                return element;
            },
            set: function (v) {
                if (typeof v == 'string') v = document.querySelector(v);
                element = v instanceof Node ? v : document.createElement('div');
                if (!element.className.match(/\btags-input\b/)) element.className += ' tags-input';
                this.text = initChar;
            }
        },
        tags: {
            get: function () {
                var element;
                var elements = this.element.querySelectorAll('span');
                var tags = {};
                for (var i = 0; i < elements.length; i++) {
                    element = elements[i]
                    tags[element.innerText.split('\n')[0]] = element;
                }

                return tags;
            }
        },
        lastChild: {
            get: function () {
                return this.element.lastChild;
            }
        },
        textNode: {
            get: function () {
                return this.element.lastChild instanceof Text ? this.element.lastChild : null;
            }
        },
        text: {
            get: function () {
                return this.textNode ? this.textNode.data : null;
            },
            set: function (v) {
                if (!this.textNode) this.element.appendChild(document.createTextNode(','));
                this.textNode.data = v;
            },
        }

    });

    this.add = function (tag) {
        tag = tag.replace(initCharPattern, '');
        tag = tag.replace(/^\s+/, '').replace(/\s+$/, ''); //replace one or more white spaces and newlines
        // tag = tag.replace(/^0/, '27'); //replace 0 with 27 if number begins with 0
        // tag = tag[0].toUpperCase() + tag.toLowerCase().slice(1);
        if (tag != '' && this.tags[tag] === undefined) {
            var element = document.createElement('span');
            // element.appendChild(document.createTextNode(tag));
            element.setAttribute('contenteditable', 'false');
            // element.classList.add('number')

            element.setAttribute('value', document.querySelector(`#contact-list input[name="${tag}"`).value)
            var top = document.createElement('div')
            top.classList.add('top')
            top.appendChild(document.createTextNode(tag))
            var under = document.createElement('div')
            under.classList.add('under');

            let number = document.querySelector(`input[name="${tag}"]`).dataset.number;
            if(number.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/g)) {
                element.classList.add('cross-fade','c-tag')
            } else {
                element.classList.add('cross-fade','g-tag')
            }

            under.appendChild(document.createTextNode(number))
            element.appendChild(top);
            element.appendChild(under);

            insert(element);
        }
    };

    this.remove = function (tag) {
        var element = this.tags[tag];
        if (element) this.element.removeChild(element);
    };

    this.element = element;
};

//Create a tag input object and set it to the numbers input
let input = new TagsInput('#numbers-input');

//Select the contact's from the Contact List as the inputs for the numbers input
let contactItems = document.querySelectorAll('#contact-list .form-check-input');

for (let i = 0; i < contactItems.length; i++) {
    contactItems[i].addEventListener("click", function () {
        if (this.checked) {
            input.add(this.name)
        } else {
            input.remove(this.name);
        }
    });
}


//***** BACK END ASYNC COMMUNICATION *******//

//ELEMENTS


//Select the numbers input, send button, response div
const numberInput = document.getElementById('numbers-input')
// button = document.getElementById('send'),
// response = document.querySelector('.response');
let filterContainer = document.querySelector('#contact-list-parent');
let filterBody = document.querySelector('#contact-list');
const title = document.title;
let f = new Filter("contacts", filterContainer, filterBody)


f.setFilter();
f.startListen();



//HELPER FUNCTIONS

const resetFields = (data) => {

    numberInput.innerHTML = '';

    const textInput = document.getElementById('msg')
    textInput.value = '';


    var contactInput = document.querySelectorAll('#contact-list .form-check-input ');

    for (let i = 0; i < contactInput.length; i++) {
        contactInput[i].checked = false;
    }

    if (data.error) {
        response.innerHTML = '<h5>' + data.error + '</h5>';
    } else {

        removePreloader();


    }
}


const groupContiner = document.querySelector('#groupContainer');
const groupBody = document.querySelector('#groupBody');

let groupFilter = new Filter('groups', groupContiner, groupBody);
groupFilter.setFilter();
groupFilter.startListen();

function groupContactListener() {
    let groups = Array.from(document.querySelectorAll('.filterContainer'));

    for (let i = 0; i < groups.length; i++) {

        filterBody = groups[i].querySelector('.filterBody');
        let f = new Filter('contacts', groups[i], filterBody)
        f.setFilter();
        f.startListen();

    }

}

groupContactListener();




function groupAdd() {
    let groupForm = document.getElementById('group-form')

    let contacts = Array.from(groupForm.querySelectorAll('#numbers-input span')).map(num=>
        {
            // return num.innerText
            return {
                _id: num.getAttribute('value'),
                name: num.innerText.split('\n')[0],
                number: num.innerText.split('\n')[1]
            }
        })

    let group = {
        name: groupForm.querySelector('input[name="name"]').value,
        contacts: contacts

    };

    group.async = true;
  
    asyncReq('/addGroup', 'post', group, (data) => {

      let row = '<tr class="editRow">\
      <td>\
      <a data-toggle="collapse" aria-expanded="false" aria-controls="' +
        data.name.replace(/\s/g, "") +
        ' .item-1"\
            href="#' +
        data.name.replace(/\s/g, "") +
        ' .item-1" class="group-btn btn btn-primary" role="tab">\
            <h4 class="mb-0">' +
        data.name +
        ' <i class="fa fa-angle-down"></i></h4> \
            </a>\
      </td>\
      <td><span class="badge badge-pill badge-primary">' +
        data.contacts.length +
        '</span></td>\
      <td>\
        <div class="editDelete">\
          <form action="/deleteGroup" method="post" class="deleteGroup">\
              <input type="hidden" name="_id" value="'+data._id+'">\
              <input type="hidden" name="async" value="false">\
              <button class="btn btn-primary" type="submit"><i class="fa fa-trash"></i></button>\
          </form>\
      </div>\
      </td>\
  </tr>';

   row += '<tr>\
       <td colspan="5">\
       <div id="' +
        data.name.replace(/\s/g, "") +
        '" data-group="' +
        data.name.replace(/\s/g, "") +
        '" class="filterContainer col-12">\
          <div class="collapse item-1" role="tabpanel" data-parent="#' +
        data.name.replace(/\s/g, "") +
        '">\
                  <div class="row mb-4">\
                      <div class="col-md-6">\
                          <div class="text-md-right">\
                              <form action="/searchContacts" method="POST"  class="d-flex search">\
                                  <input type="search" name="term" class="form-control form-control-sm" aria-controls="dataTable" placeholder="Search">\
                                  <button class="btn btn-primary d-inline py-0" type="submit"><i class="fas fa-search"></i></button>\
                              </form>\
                          </div>\
                      </div>\
                  </div>\
                  <div class="row">\
                  <div class="col-10 group-input-list">\
              <table class="table my-0" >\
                  <thead>\
                      <tr>\
                          <th class="w-30">Name <a id="name-sort" class="col-sort" href=""><i class="fa fa-sort"></i></a></th>\
                          <th class="w-20">Company <a id="company-sort" class="col-sort" href=""><i class="fa fa-sort"></i></a></th>\
                          <th class="w-10">Number <a id="number-sort" class="col-sort" href=""><i class="fa fa-sort"></i></a></th>\
                          <th class="w-30">Email <a id="email-sort" class="col-sort" href=""><i class="fa fa-sort"></i></a></th>\
                          <th class="w-10">Opt-In <a id="optin-sort" class="col-sort" href=""><i class="fa fa-sort"></i></a></th>\
                      </tr>\
                  </thead>\
                  <tbody class="filterBody">';

      for (let j = 0; j < data.contacts.length; j++) {
        row +=
          '<tr class="editRow">\
              <td>' + data.contacts[j].name + '</td>\
              <td>' + data.contacts[j].company + '</td>\
              <td>' + data.contacts[j].number + '</td>\
              <td>' + data.contacts[j].email + '</td>\
              <td><input type="checkbox" name="optIn" '+ (data.contacts[j].optIn ? "checked": "") + ' disabled></input></td>\
              <td class="editDelete">\
                  <div class="dropdown">\
                      <i class="fa fa-ellipsis-v " type="button" id="dropdownMenuButton" data-toggle="dropdown"></i>\
                      <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">\
                          <a class="left dropdown-item" href="/editContact"><i class="fa fa-edit"></i> Edit</a>\
                          <form action="/deleteContact" method="post" class="right dropdown-item">\
                              <input type="hidden" name="_id" value="'+ data.contacts[j]._id + '">\
                              <input type="hidden" name="async" value="false">\
                              <a type="submit"><i class="fa fa-trash"> Delete</i></a>\
                          </form>\
                      </div>\
                    </div>\
              </td>\
              </tr>';
      }
      row +=
        ' </tbody>\
              </table>\
          </div>\
          <div class="col group-contact-list">\
          <div class="row btnContainer">\
          <a href="/addContact" class="btn btn-primary addContact"><i class="fa fa-edit"></i> Edit Contacts</a>\
      </div>\
  </div>\
  </div></td></tr>';
    

        groupBody.innerHTML = row + groupBody.innerHTML;
      let u = new UpdateGroup( groupBody)
      row = groupBody.firstChild;
  
      u.editListen(row);
    })
  
  }
  
  let groupFrom = document.getElementById('group-form');
  
  groupFrom.addEventListener('submit', e => {
    e.preventDefault();
    groupAdd();
  })
  
  