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
                    tags[element.innerText] = element;
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
        tag = tag[0].toUpperCase() + tag.toLowerCase().slice(1);
        if (tag != '' && this.tags[tag] === undefined) {
            var element = document.createElement('span');
            element.appendChild(document.createTextNode(tag));
            element.setAttribute('contenteditable', 'false');
            element.classList.add('number')

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
let filterContainer  = document.querySelector('#contact-list-parent');
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
        
        
        // //TODO format for contact
        // function deleteListen(type) {
        
        //   let delForms = Array.from(document.querySelectorAll('.delete'));
        //   let rows = Array.from(document.querySelectorAll('tbody tr'))
        
        //   for (let i = 0; i < delForms.length; i++) {
        //     delForms[i].addEventListener('submit', (e) => {
        //       e.preventDefault();
        //       let id = delForms[i].querySelector('input[name="_id"]').value
        
        //       asyncReq('/delete' + type, 'post', { _id: id, async: true }, (data) => {
        //         if (data.msg != "error") {
        //           rows[i].remove();
        //         }
        //       })
        //     })    
        //   }
        
        // }
        
        // deleteListen("Message");
        
    }

   
    

  
}

groupContactListener();