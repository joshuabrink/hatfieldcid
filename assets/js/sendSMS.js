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
                    tags[element.lastElementChild.innerText] = element;
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

    // TODO Edit this to do the number behind name thing
    this.add = function (tag) {
        let clientNum = tag.lastElementChild.innerText;
        clientNum = clientNum.replace(initCharPattern, '');
        clientNum = clientNum.replace(/^\s+/, '').replace(/\s+$/, ''); //replace one or more white spaces and newlines
        // tag = tag.replace(/^0/, '27'); //replace 0 with 27 if number begins with 0
        clientNum = clientNum[0].toUpperCase() + clientNum.toLowerCase().slice(1);
        if (clientNum != '' && this.tags[clientNum] === undefined) {
            var element = document.createElement('span');
            // let childDiv = document.createElement('div');
            // childDiv.classList.add('cross-fade', 'c-tag');
                
                let cName = document.createElement('div');
                cName.classList.add('top');
                cName.appendChild(document.createTextNode(tag.firstElementChild.innerText));
                element.appendChild(cName);

                let cNum = document.createElement('div');
                cNum.classList.add('under', 'number');
                cNum.appendChild(document.createTextNode(clientNum));
                element.appendChild(cNum);
            
            // element.appendChild(childDiv);
            element.setAttribute('contenteditable', 'false');
            element.classList.add('cross-fade', 'c-tag')

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
let contactItems = document.querySelectorAll('#contact-list .custom-control-input');

for (let i = 0; i < contactItems.length; i++) {
    contactItems[i].addEventListener("click", function () {
        if (this.checked) {
            let cont = this.parentNode.parentNode.nextElementSibling;
            input.add(cont)
        } else {
            input.remove(this.id);
        }
    });
}


//***** BACK END ASYNC COMMUNICATION *******//

//ELEMENTS


//Select the numbers input, send button, response div
const numberInput = document.getElementById('numbers-input'),
    button = document.getElementById('send'),
    response = document.querySelector('.response');

const filterBody = document.querySelector('#contact-list');
const title = document.title;
let f = new Filter("contacts")


f.setFilter();
f.startListen();



//HELPER FUNCTIONS

const resetFields = (data) => {

    numberInput.innerHTML = '';

    const textInput = document.getElementById('msg')
    textInput.value = '';


    var contactInput = document.querySelectorAll('#contact-list .custom-control-input');

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
  
        parent.innerHTML = '<h5>Text message sent to: ';
        data.numbers.forEach(number => {
            parent.innerHTML += number + ' '
        });
        parent.innerHTML += '</h5>';
  
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
    const numbersInput = document.querySelectorAll('.number');
    const numbers = Array.from(numbersInput).map(number => {
        number.innerText = number.innerText.replace(/^0/g, '27')
        return number.innerText.replace(/\D/g, '')
    })

    const textInput = document.getElementById('msg')
    const message = textInput.value;

    function finish(data) {
        showSMSResponse(response, data)
        resetFields(data)
    }

    showPreloader(response)
    
    asyncReq('/sendSMS', 'post', { numbers, message }, finish )

}