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
const numberInput = document.getElementById('numbers-input'),
    button = document.getElementById('send'),
    response = document.querySelector('.response');

const parent = document.querySelector('.filterContainer');
const filterBody = document.querySelector('.filterBody');
const title = document.title;
let f = new Filter("contacts", parent, filterBody)


f.setFilter();
f.startListen();



//HELPER FUNCTIONS

const resetFields = (data) => {

    numberInput.innerHTML = '';

    const textInput = document.getElementById('msg')
    textInput.value = '';


    var contactInput = document.querySelectorAll('#contact-list .form-check-input');

    for (let i = 0; i < contactInput.length; i++) {
        contactInput[i].checked = false;
    }

    if (data.error) {
        response.innerHTML = '<h5>' + data.error + '</h5>';
    } else {

        removePreloader();


    }
}

const showSMSResponse = (parent, data) => {
    setTimeout(() => {
        parent.classList.remove('fadeIn')
        void parent.offsetWidth;
        let res = '';
        res = '<h5>Text message sent to: </h5>';
        res += '<div class="tags-input">'
        for (let i = 0; i < data.contacts.length; i++) {
            res += `<span class="cross-fade c-tag">
                <div class="top">${data.contacts[i].name}</div><div class="under">${data.contacts[i].number}</div>
            </span>`
        }
        for (let i = 0; i < data.groups.length; i++) {
            res += `<span class=" c-tag">
                <div class="top">${data.groups[i]}</div>
            </span>`
         
        }
        res += '</div>'

        parent.innerHTML = res;
        
        parent.classList.add('fadeIn')
    }, 1000);
}

//BUTTON LISTENER

try {
    //send sms on click
    button.addEventListener('click', sendSMS, false);
} catch (error) {

}


// MAIN SMS SEND FUNCTION

function sendSMS() {

    const contactsInput = numberInput.querySelectorAll('.c-tag');
    const groupsInput = numberInput.querySelectorAll('.g-tag');

    const contacts = Array.from(contactsInput).map(contact => {
        // number.innerText = number.innerText.replace(/^0/g, '27')
        return {name:contact.innerText.split('\n')[0],
            number:contact.innerText.split('\n')[1].replace(/\D/g, '')}
    })

    const groups = Array.from(groupsInput).map(group => {
        return group.innerText.split('\n')[0]
    });

    const textInput = document.getElementById('msg')
    const message = textInput.value;

    function finish(data) {
        showSMSResponse(response, data)
        resetFields(data)
    }

    showPreloader(response)


    asyncReq('/addMessage', 'post', { contacts, groups, message, async:true }, finish)

}

function toggleTagList(container) {

    let searchBar = container.querySelector('.search');
    let toggleBtn = container.querySelector('.toggle-btn');
    let textToggle = container.querySelector('.toggle-title');
    let headerCol = container.querySelector('thead tr').lastElementChild;
    // let body = container.getElementById('contact-list');

    toggleBtn.addEventListener('click', e => {
        e.preventDefault();
        let changeTo = toggleBtn.innerText.toLowerCase();
        asyncReq(`/${changeTo}Filter`, 'post', { async: true }, (data)=> {

            data = data.data;

            let rows = ``;

            for (let i = 0; i < data.length; i++) {
             
                if(changeTo == 'groups') {  
                    rows += `<tr>
                    <td style="padding-left: 45px;">
                        <div class="form-check">
                            <input class="form-check-input position-static" 
                            type="checkbox" name="${data[i].name}" data-number="${data[i].contacts.length}">
                        </div>
                    </td>`        
                    rows +=  `<td>
                        ${data[i].name}
                    </td>
                    <td>
                        ${data[i].contacts.length}
                    </td>
                    </tr>` 
                } else {
                    rows += `<tr>
                    <td style="padding-left: 45px;">
                        <div class="form-check">
                            <input class="form-check-input position-static" 
                            type="checkbox" name="${data[i].name}" data-number="${data[i].number}">
                        </div>
                    </td>` 
                    rows +=  `<td>
                    ${data[i].name}
                    </td>
                    <td>
                    ${data[i].number}
                    </td>
                    </tr>` 
                }
            }

            let upperCase = changeTo[0].toUpperCase() + changeTo.slice(1);

            toggleBtn.innerText = textToggle.innerText;
            if(changeTo == 'groups') {
                headerCol.innerHTML = `Count`
                textToggle.innerHTML = `<i class="fa fa-group"></i> 
                ${upperCase}`;
                f.type = 'groups'
            } else {
                headerCol.innerHTML = `Number <a id="number-sort" class="col-sort" href=""><i class="fa fa-sort"></i></a>`
                textToggle.innerHTML = `<i class="fa fa-address-book"></i> 
                ${upperCase}`;
                f.type = 'contacts'
            }

            // textToggle.innerHTML = `<i class="fa 
            // ${changeTo == 'contacts' ? 'fa-address-book': 'fa-group'}"></i> 
            // ${upperCase}`;

            searchBar.setAttribute('action', `/search${upperCase}`)

            filterBody.innerHTML = rows;

            let checkList = filterBody.children;
            for (let i = 0; i < checkList.length; i++) {
              tagListen(checkList[i].querySelector(".form-check-input"));
      
            }

        })

    })



}

toggleTagList(parent)

