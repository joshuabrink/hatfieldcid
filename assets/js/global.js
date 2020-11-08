(function ($) {
  "use strict"; // Start of use strict

  // Toggle the side navigation
  $("#sidebarToggle, #sidebarToggleTop").on("click", function (e) {
    $("body").toggleClass("sidebar-toggled");
    $(".sidebar").toggleClass("toggled");
    if ($(".sidebar").hasClass("toggled")) {
      $(".sidebar .collapse").collapse("hide");
    }
  });

  // Close any open menu accordions when window is resized below 768px
  $(window).resize(function () {
    if ($(window).width() < 768) {
      $(".sidebar .collapse").collapse("hide");
    }
  });

  // Prevent the content wrapper from scrolling when the fixed side navigation hovered over
  $("body.fixed-nav .sidebar").on("mousewheel DOMMouseScroll wheel", function (
    e
  ) {
    if ($(window).width() > 768) {
      var e0 = e.originalEvent,
        delta = e0.wheelDelta || -e0.detail;
      this.scrollTop += (delta < 0 ? 1 : -1) * 30;
      e.preventDefault();
    }
  });

  // Scroll to top button appear
  $(document).on("scroll", function () {
    var scrollDistance = $(this).scrollTop();
    if (scrollDistance > 100) {
      $(".scroll-to-top").fadeIn();
    } else {
      $(".scroll-to-top").fadeOut();
    }
  });

  // Smooth scrolling using jQuery easing
  $(document).on("click", "a.scroll-to-top", function (e) {
    var $anchor = $(this);
    $("html, body")
      .stop()
      .animate(
        {
          scrollTop: $($anchor.attr("href")).offset().top,
        },
        1000,
        "easeInOutExpo"
      );
    e.preventDefault();
  });
})(jQuery); // End of use strict

let numberFormat = /[0-9]{10}/g
let emailFormat = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
let checkFormat = /^<input type="checkbox"/g
class UpdateContact {
  constructor(parent, body) {
    let bodyChildren = Array.from(body.children).filter(c => c.classList.contains("editRow"));
    this.rows = bodyChildren;
    this.headers = Array.from(parent.querySelector("thead").querySelectorAll("tr th"));
    this.parent = parent;
    // this.type = type[0].charAt(0).toUpperCase() + type.slice(1, type.length -1);
  }

  editListen(row) {
    let editBtn = row.querySelector(".left");
    let delBtn = row.querySelector(".right");
    let _this = this;

    // for (let i = 0; i < editBtn.length; i++) {
    editBtn.addEventListener("click", (e) => {
      e.preventDefault();

      let rowArr = Array.from(row.children);
      let inputType = "text";
      let j = 0;

     
      if(rowArr.length == 7) {
        j =1;
      }

      for (j; j < rowArr.length; j++) {
    
        if (numberFormat.test(rowArr[j].innerText)) {
          this.number = rowArr[j].innerText
          inputType = "number";
        } else if (emailFormat.test(rowArr[j].innerText.toLowerCase())) {
          inputType = "email";
        } else if (checkFormat.test(rowArr[j].innerHTML)) {
          // rowArr[j].innerHTML = rowArr[j].innerHTML.replace(/disabled/g, '');
          continue;
        } else if (rowArr[j].classList.contains("editDelete")
          || (rowArr[j].children[0] && rowArr[j].children[0].classList.contains("editDelete"))) {
          // rowArr[j].querySelector('.left').style = "background: green;";
          // rowArr[j].querySelector('.right button').style = "background: red;";
          // rowArr[j].innerHTML = rowArr[j].innerHTML.replace(/fa-edit/g, 'fa-check');
          // rowArr[j].innerHTML = rowArr[j].innerHTML.replace(/fa-trash/g, 'fa-times');
          // this.confirmListen(row);
          _this.changeBtns(row, true, "edit");

          continue;
        }
        rowArr[j].innerHTML =
          "<input class='form-control form-control-sm' \
          type='" +
          inputType +
          "' \
          name='" +
          this.headers[j].innerText.toLowerCase() +
          "' \
          value='" +
          rowArr[j].innerText +
          "'>";

        inputType = "text";
      }


    });

    delBtn.addEventListener("click", (e) => {
      e.preventDefault();

      _this.changeBtns(row, true, "delete");
    });


  }

  editAllListen() {
    for (let i = 0; i < this.rows.length; i++) {
      this.editListen(this.rows[i]);
    }
  }

  changeBtns(row, direction, type) {
    let container = row.querySelector(".editDelete");

    if (direction) {
      let buttons =
        '<a class="confirm" href="#" style=""><i class="fa fa-check"></i></a><a href="#" style=""><i class="fa fa-times"></i></a>';

      container.querySelector(".dropdown,.dropleft").style.display = "none";
      container.innerHTML += buttons;
      this.confirmListen(row, type);
    } else {
      let dropdown = container.querySelector(".dropdown,.dropleft");
      dropdown.style.display = "block";
      dropdown.querySelector(".dropdown-menu").classList.remove("show");
      container.innerHTML = container.innerHTML.replace(
        '<a class="confirm" href="#" style=""><i class="fa fa-check"></i></a><a href="#" style=""><i class="fa fa-times"></i></a>',
        ""
      );
    }
  }
  revertRow(row) {
    let rowArr = Array.from(row.children);
    let c = 0
    if(rowArr.length == 7) {
      c = 1;
    }

    for ( c ; c < rowArr.length; c++) {
      if (rowArr[c].classList.contains("editDelete")
        || (rowArr[c].children[0] && rowArr[c].children[0].classList.contains("editDelete"))) {
        this.changeBtns(row, false);
      } else if (checkFormat.test(rowArr[c].innerHTML)) {
        rowArr[c].querySelector("input").disabled = true;
      } else {
        let val = rowArr[c].querySelector("input").value;
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
      if(rowArr[i].firstChild && rowArr[i].firstChild) {
        key = rowArr[i].firstChild.name;
        value = rowArr[i].firstChild.value;
        if (key && value) {
          contact = { ...contact, [key.trim()]: value };
        }
      }
  
    }

    let currentNumber = contact.number

    if(this.number == currentNumber) {
      delete contact["number"]
    }

    contact.id = row.querySelector('input[name="_id"]').value;
    contact.async = true;

    asyncReq("/updateContact", "post", contact, (data)=> {
      let response = this.parent.querySelector('.updateContactResponse')
      if(data.err) {
        response.innerHTML =  `<h5>${data.err} <i class="fa fa-times"></i></h5>`;
        response.style.opacity = '1'
        response.classList.remove('text-primary')
        response.classList.add('text-danger')
      } else {
        response.innerHTML =  `<h5>Successfully updated contact</h5>`;
        response.style.opacity = '1'
        response.classList.add('text-primary')
        response.classList.remove('text-danger')
      }
     
    });
  }
  confirmListen(row, type = "edit") {
    let links = row.querySelectorAll("a, button");
    let _this = this;
    for (let i = 0; i < links.length; i++) {
      if (links[i].classList.contains("confirm")) {
        links[i].addEventListener("click", function handler(e) {
          e.preventDefault();

          if (type == "edit") {
            _this.updateContact(row);
            _this.revertRow(row);
          } else {
            _this.deleteContact(row);
          }

          e.currentTarget.removeEventListener(e.type, handler);
          _this.editListen(row);
        });
      } else {
        links[i].addEventListener("click", function handler(e) {
          e.preventDefault();
          if (type == "edit") {
            _this.revertRow(row);
          } else {
            _this.changeBtns(row, false);
          }
          e.currentTarget.removeEventListener(e.type, handler);
          _this.editListen(row);
        });
      }
    }
  }

  deleteContact(row) {
    let delForm = row.querySelector(".right");
    let id = delForm.querySelector('input[name="_id"]').value;
    asyncReq("/deleteContact", "post", { _id: id, async: true }, (data) => {
      if (data.msg != "error") {
        row.remove();
      }
    });
  }
}

class UpdateGroup {
  constructor(body) {
    this.headers = Array.from(body.children).filter(c => c.classList.contains("editRow"));;
    this.rows = Array.from(body.children).filter(c => !c.classList.contains("editRow"));
    this.open = false;
    this.body = body;
    this.clone = document.querySelector('#contact-list-parent').cloneNode(true);
  }


  startListen(row, header) {

    let addBtn = row.querySelector('.addContact');
    this.deleteListen(row, header)

    function startToggle(e) {
      e.preventDefault();
      this.toggleContactList(row, header);
    }

    
    addBtn.addEventListener('click', startToggle.bind(this))
  }

  startListenAll() {

    for (let i = 0; i < this.rows.length; i++) {
      this.startListen(this.rows[i], this.headers[i])
      // this.deleteListen(this.rows[i], this.headers[i])
    }
  }

  searchListen(parent,body) {
    let f = new Filter('contacts', parent, body)
        f.setFilter();
        f.startListen();
  }

  deleteListen(row, header) {
    let delForm = header.querySelector('.deleteGroup');
    let id = delForm.querySelector('input[name="_id"]').value
    delForm.addEventListener('submit', e => {
      e.preventDefault()
      asyncReq("/deleteGroup", "post", { _id: id, async: true }, (data) => {
        if (data.msg != "error") {
          row.remove();
          header.remove();
        }
      });

    })
  }

  confirmListen(row, header) {
    let btnContainer = row.querySelector('.btnContainer')
    btnContainer.innerHTML += `<a href="#" class="btn btn-dark cancelUpdate" style=""><i class="fa fa-times"></i> Close</a>`

    let cancelButton = btnContainer.querySelector('.cancelUpdate')
    let confirmButton =  btnContainer.querySelector('.addContact')

    confirmButton.innerHTML = '<i class="fa fa-check"></i> Confirm'

    cancelButton.addEventListener('click', e => {
      e.preventDefault();
      confirmButton.innerHTML = '<i class="fa fa-edit"></i> Edit Contacts'
      cancelButton.remove()
      confirmButton.removeEventListener('click', confirmEvent)
      this.toggleContactList(row, header);
      // btnContainer.innerHTML.replace(cancelButton
    })

    function confirmEvent(e) {
      
        e.preventDefault();
        let currentContacts = row.querySelectorAll('.filterBody tr');
        let currentNumbers = Array.from(currentContacts).map(c=>{
          if(c.children[2]) {
            return {
              _id:c.querySelector('input[name="_id"]').value,
              number:c.children[2].innerText
            }
          }
          
        }).filter(n => n)
  
        let delForm = header.querySelector('.deleteGroup');
        let id = delForm.querySelector('input[name="_id"]').value
  
        let name = header.querySelector('.group-btn h5').innerText;
  
        asyncReq("/updateGroup", "post", {name: name, contacts: currentNumbers, id: id, async: true }, (data) => {
          // let response = document.createElement('div')
          // response.classList.add('response','text-center','text-primary', 'mt-4') 
          // response.style.opacity = '1'
          // response.innerHTML = `<h5>Successully Updated Group</h5>`
          
          let currResponse = row.querySelector('.updateGroupResponse')
          currResponse.style.opacity = '1'
          currResponse.innerHTML = `<h5>Successfully updated group</h5>`
          // if(!currResponse) {
          //   btnContainer.parentElement.appendChild(response)
          // } 
        
        })
       
    }

    confirmButton.addEventListener('click', confirmEvent)
  }

  animate(row) {
    let contactList = row.querySelector('.group-contact-list')
    let list = row.querySelector('.group-input-list')
    
   
    

    if (this.open) {
      contactList.removeChild(contactList.children[0])
      list.querySelector('.filterBody').innerHTML = this.backupList;
      list.classList.remove('col')
      list.classList.add('col-10')

      contactList.classList.remove('col-4');
      contactList.classList.add('col');

    } else {

      // contactList.innerHTML = clone.innerHTML + contactList.innerHTML;

      // let currResponse = contactList.querySelector('.updateGroupResponse')

      contactList.innerHTML =  this.clone.innerHTML + contactList.innerHTML

      // currResponse.parentNode.insertBefore(clone.children[0], currResponse.nextSibling);
      this.searchListen(contactList, contactList.querySelector('#contact-list'))

      let currHeader = contactList.querySelector('.card-header .row')
      let search = currHeader.querySelector('.col-10')
      search.classList.remove('col-10');
      search.classList.add('col-12')

      let addAll = currHeader.querySelector('.col-2')
      currHeader.removeChild(addAll)

      list.classList.remove('col-10')
      list.classList.add('col')

      contactList.classList.remove('col');
      contactList.classList.add('col-4');
      
     
    }

  }

  checkList(row) {
    let checks = row.querySelectorAll('#contact-list td .form-check-input');
    let currentContacts = row.querySelectorAll('.filterBody tr');

    let currentNumbers = Array.from(currentContacts).map(c=>{return c.children[2].innerText})
    let currCheckNumbers =  Array.from(checks).map(c=>{return c.dataset.number});

    for (let j = 0; j < currCheckNumbers.length; j++) {
      for (let i = 0; i <currentNumbers.length; i++) {
      if(currentNumbers[i] == currCheckNumbers[j]) {
        checks[j].checked = true;
      }
    }
  }

  }

  toggleContactList(row, header) {

    if (this.open) {


      this.animate(row)
      this.startListen(row, header)

      this.open = false;
    } else {

     this.backupList = row.querySelector('.filterBody').innerHTML;

      this.animate(row)
      this.startListen(row, header)
      this.checkList(row)
      this.toggleContact(row);
      this.confirmListen(row, header)

      this.open = true;
    }


  }

  toggleContact(row) {
    let checks = row.querySelectorAll('#contact-list td .form-check-input');
    let currList = row.querySelector('.filterBody')
 
      for (let j = 0; j < checks.length; j++) {

      checks[j].addEventListener('click', e=>{
        

        let number = e.currentTarget.dataset.number;

        if(!e.currentTarget.checked) {
          let removeRow = Array.from(currList.children).find(c=>{
            if(c.children[2]) {
              return c.children[2].innerText == number;
            } 
          })
          if(removeRow) {
            currList.removeChild(removeRow)
          }
      
        
        } else {
          asyncReq("/findContact", "post", { number: number , async: true }, (data) => {

            let newRow = ''
            data = data[0]
            newRow += 
            "<tr class='editRow'><td>" + data.name + "</td>";
            newRow += "<td>" + data.company + "</td>";
            newRow += "<td>" + data.number + "</td>";
            newRow += "<td>" + data.email + "</td>";
            newRow += '<td><input type="checkbox" name="optIn" ';
            newRow += data.optIn ? "checked" : "";
            newRow += " disabled></input></td>";
  
            newRow +=
              '<td class="editDelete"><div class="dropdown">\
                <i class="fa fa-ellipsis-v " type="button" id="dropdownMenuButton" data-toggle="dropdown"></i>\
                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">\
                    <a class="left dropdown-item" href="/editContact"><i class="fa fa-edit"></i> Edit</a>\
                    <form action="/deleteContact" method="post" class="right dropdown-item">\
                        <input type="hidden" name="_id" value="' +
              data._id +
              '">\
                            <input type="hidden" name="async" value="false">\
                            <a type="submit"><i class="fa fa-trash"> Delete</i></a>\
                        </form>\
                    </div>\
                  </div>\
            </td><tr>'
           
            currList.innerHTML = newRow + currList.innerHTML
          })
        }
      })
    
    }

  }
}

const asyncReq = async (action, method, body, callback) => {
  return await fetch(action, {
    method: method,
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then(function (res) {
      return res.json(); //convert response into readable data and return it to the callback functions
    })
    .then(callback)
    .catch(function (err) {
      console.log(err);
    });
};

// HELPER FUNCTIONS

const showPreloader = (parent) => {
  if (!parent.innerHTML.match(/^<div id="preload"/g)) {
    if (parent.localName == "tbody") {
      parent.innerHTML = `<tr>
      <td colspan="5"> 
      <div id="preload" class="preloader">
      <div class="sk-folding-cube">
      <div class="sk-cube1 sk-cube"></div>
      <div class="sk-cube2 sk-cube"></div>
      <div class="sk-cube4 sk-cube"></div>
      <div class="sk-cube3 sk-cube"></div>
      </div> 
      </div>
      </td>
      </tr>`;
    } else {
      parent.innerHTML = `<div id="preload" class="preloader">
      <div class="sk-folding-cube">
      <div class="sk-cube1 sk-cube"></div>
      <div class="sk-cube2 sk-cube"></div>
      <div class="sk-cube4 sk-cube"></div>
      <div class="sk-cube3 sk-cube"></div>
      </div> </div>`;
    }

    parent.classList.remove("fadeIn");
    void parent.offsetWidth;
    parent.classList.add("fadeIn");
  }
};

const removePreloader = () => {
  let preloader = document.querySelector("#preload");
  if (preloader) {
    preloader.classList.remove("fadeOut");
    void preloader.offsetWidth;
    preloader.classList.add("fadeOut");
  }
};

function tagListen(checkbox, customList) {


  if(customList) {
    for (let i = 0; i < customList.length; i++) {
      if(customList[i] == checkbox.dataset.number) {
        checkbox.checked = true; //checks input if already selected
      }
      
    }
  } else {
    let numberInputs = document.querySelectorAll("#numbers-input span");
    for (let j = 0; j < numberInputs.length; j++) {
      if (checkbox.name == numberInputs[j].innerText.split('\n')[0]) {
        checkbox.checked = true; //checks input if already selected
      }
    }
  }


  checkbox.addEventListener("click", function () {
    if (this.checked) {
      input.add(this.dataset.number);
    } else {
      input.remove(this.dataset.number);
    }
  });
}

class Filter {
  constructor(type, parent, body) {
    this.type = type;
    this.order = [];
    this.groupCol = false;

    if (parent.querySelector('.add-col')) {
      this.tagList = true;
    }


    this.cols = parent.querySelector('thead').querySelectorAll(".col-sort")
      ? Array.from(parent.querySelector('thead').querySelectorAll(".col-sort"))
      : [];
    for (let i = 0; i < this.cols.length; i++) {
      this.order.push(1);
    }
    this.cols.forEach((c) => {
      if (c.id.replace("-sort", "") == "group") {
        this.groupCol = true;
      }

    });

    if (!this.tagList) {
      if (body.id == "groupBody") {
        let u = new UpdateGroup(body);
        u.startListenAll();

      } else {
        let u = new UpdateContact(parent, body);
        u.editAllListen();
      }

    }

    this.amount = parent.querySelector(".filterAmount")
      ? parent.querySelector(".filterAmount")
      : 0;

    this.page = parent.querySelector(".page-item.active")
      ? parseInt(parent.querySelector(".page-item.active").innerText)
      : 0;

    this.filter = { limit: -1, sort: {} };
    this.parent = parent;
    this.body = body;
    this.search = parent.querySelector(".search");


  }

  startListen() {
    try {
      this.searchListen();
      this.sortListen();
      this.pageListen();
      this.allListen();
      this.amountListen();
    } catch (error) {
      console.log(error);
    }
  }

  //Setter Function

  setFilter(index = -1) {
    if (!this.groupCol) {
      this.filter.group = this.parent.dataset.group;
    }

    this.filter.page = 0;

    if (index != -1) {
      let key = this.cols[index].id.replace("-sort", "");
      this.filter.sort = {};
      this.filter.sort = { ...this.filter.sort, [key]: this.order[index] };
      this.order[index] = this.order[index] == -1 ? 1 : -1;
    }

    this.filter.term = this.search ? this.search.querySelector('input[type="search"]').value : '';
    this.filter.limit = this.amount == 0 ? 0 : parseInt(this.amount.value);
    this.filter.async = true;
  }

  //Listener functions

  sortListen() {
    for (let i = 0; i < this.cols.length; i++) {
      this.cols[i].addEventListener("click", (e) => {
        e.preventDefault();

        showPreloader(this.body);
        this.setFilter(i);

        asyncReq(
          "/" + this.type + "Filter",
          "post",
          this.filter,
          this.showResponse.bind(this)
        ).then((data) => {
          this.setPages(0, data.total);
        });
      });
    }
  }

  allListen() {
    let all = this.parent.querySelector(".all");

    all.addEventListener("submit", (e) => {
      e.preventDefault();
      // let limit = all.querySelector('input[type="hidden"]').value;
      // this.filter.limit = parseInt(limit);
      this.filter.async = true;
      this.filter.term = "";
      this.search.querySelector('input[type="search"]').value = "";

      asyncReq(
        "/" + this.type + "Filter",
        "post",
        this.filter,
        this.showResponse.bind(this)
      ).then((data) => {
        this.setPages(0, data.total);
      });
    });
  }

  showResponse(d) {
    let data = d.data;

    if (data === true) {
      return;
    }
    removePreloader();

    this.body.classList.remove("fadeIn");
    void this.body.offsetWidth;

    let row = "";
    this.body.innerHTML = row;

    for (let m = 0; m < data.length; m++) {
      if (this.type == "contacts") {
        row = "<tr class='editRow'>";
        // for (let c = 0; c < this.cols.length; c++) {
        //   row += '<td>' + this.cols[index].id.replace('-sort', '') + '</td>';

        // }

        if (this.tagList) {
          row += `<td style="padding-left:45px;"><div class="form-check">
          <input class="form-check-input position-static" type="checkbox" value="${data[m]._id}" data-number="${data[m].number}" name="${data[m].name}"></div></td>`

          // row += '<td><div class="custom-control custom-checkbox">\
          // <input class="custom-control-input" type="checkbox" id="'+ data[m].number +'">\
          // <label class="custom-control-label" for="'+ data[m].number +'"></label></div></td>';
          row += '<td>' + data[m].name + '</td><td>' + data[m].number + '</td>';


        } else {
          if (this.groupCol) {
            row += "<td>" + data[m].group + "</td>";
          }

          row += "<td>" + data[m].name + "</td>";
          row += "<td>" + data[m].company + "</td>";
          row += "<td>" + data[m].number + "</td>";
          row += "<td>" + data[m].email + "</td>";
          row += '<td><input type="checkbox" name="optIn" ';
          row += data[m].optIn ? "checked" : "";
          row += " disabled></input></td>";

          row +=
            '<td class="editDelete"><div class="dropdown">\
              <i class="fa fa-ellipsis-v " type="button" id="dropdownMenuButton" data-toggle="dropdown"></i>\
              <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">\
                  <a class="left dropdown-item" href="/editContact"><i class="fa fa-edit"></i> Edit</a>\
                  <form action="/deleteContact" method="post" class="right dropdown-item">\
                      <input type="hidden" name="_id" value="' +
            data[m]._id +
            '">\
                          <input type="hidden" name="async" value="false">\
                          <a type="submit"><i class="fa fa-trash"> Delete</i></a>\
                      </form>\
                  </div>\
                </div>\
          </td>';
        }


        row += "</tr>";

      } else if (this.type == "messages") {
        row = '<tr><td class="flex start-left flex-wrap pt-0">';
        for (let c = 0; c < data[m].contacts.length; c++) {
          let contact = data[m].contacts[c];
          row +=
            '<div class="cross-fade c-tag">\
              <div class="top">' +
            contact.name +
            '</div> \
            <div class="under">' +
            contact.number +
            "</div></div>";
        }

        
        if(data[m].groups) {
          row += '<td><div class="flex start-left flex-wrap">'
          for (let c = 0; c < data[m].groups.length; c++) {
            let group = data[m].groups[c];
            row +=
              '<div class="c-tag">\
                <div class="top">' +
                group +
              '</div></div>';
          }
          row += '</div></td>'
        } else {
          row += '<td></td>'
        }
        row += "</td><td>" + data[m].message + "</td>";
        row += "<td>" + data[m].date + "</td>";

  
        row +=
          '<td>\
          <form action="/deleteMessage" method="post" class="deleteMessage">  \
              <input type="hidden" name="_id" value="' +
          data[m]._id +
          '">\
              <input type="hidden" name="async" value="false">\
              <button class="btn btn-primary" type="submit"><i class="fa fa-trash"></i></button>\
          </form>\
          </td>';
        row += "</tr>";

      }
      else if (this.type == "groups") {
        if (this.tagList) {
         
          row += `<td style="padding-left:45px;"> 
          <input class="form-check-input position-static" type="checkbox" value="${data[m]._id}" data-number="${data[m].number}" name="${data[m].name}"></div></td>`
          row += '<td>' + data[m].name + '</td><td>' + data[m].contacts.length + '</td>';

        } else {

        row = '<tr class="editRow">\
        <td>\
        <a data-toggle="collapse" aria-expanded="false" aria-controls="' +
          data[m].name.replace(/\s/g, "") +
          ' .item-1"\
              href="#' +
          data[m].name.replace(/\s/g, "") +
          ' .item-1" class="group-btn btn btn-primary" role="tab">\
              <h5 class="mb-0">' +
          data[m].name +
          ' <i class="fa fa-angle-down"></i></h5> \
              </a>\
        </td>\
        <td><span class="badge badge-pill badge-primary">' +
          data[m].contacts.length +
          '</span></td>\
        <td>\
          <div class="editDelete">\
            <form action="/deleteGroup" method="post" class="deleteGroup">\
                <input type="hidden" name="_id" value="'+data[m]._id+'">\
                <input type="hidden" name="async" value="false">\
                <button class="btn btn-primary" type="submit"><i class="fa fa-trash"></i></button>\
            </form>\
        </div>\
        </td>\
    </tr>';

     row += '<tr>\
         <td class="pt-0 pb-0" colspan="5">\
         <div id="' +
          data[m].name.replace(/\s/g, "") +
          '" data-group="' +
          data[m].name.replace(/\s/g, "") +
          '" class="filterContainer col-12">\
            <div class="collapse item-1" role="tabpanel" data-parent="#' +
          data[m].name.replace(/\s/g, "") +
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

        for (let j = 0; j < data[m].contacts.length; j++) {
          row +=
            '<tr class="editRow">\
                <td>' + data[m].contacts[j].name + '</td>\
                <td>' + data[m].contacts[j].company + '</td>\
                <td>' + data[m].contacts[j].number + '</td>\
                <td>' + data[m].contacts[j].email + '</td>\
                <td><input type="checkbox" name="optIn" '+ (data[m].contacts[j].optIn ? "checked": "") + ' disabled></input></td>\
                <td class="editDelete">\
                    <div class="dropdown">\
                        <i class="fa fa-ellipsis-v " type="button" id="dropdownMenuButton" data-toggle="dropdown"></i>\
                        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">\
                            <a class="left dropdown-item" href="/editContact"><i class="fa fa-edit"></i> Edit</a>\
                            <form action="/deleteContact" method="post" class="right dropdown-item">\
                                <input type="hidden" name="_id" value="'+ data[m].contacts[j]._id + '">\
                                <input type="hidden" name="async" value="false">\
                                <a type="submit"><i class="fa fa-trash"> Delete</i></a>\
                            </form>\
                        </div>\
                      </div>\
                </td>\
                </tr>';
        }
        row +=
          `</tbody>       
          </table>
      </div>
      <div class="col group-contact-list">
          
          <div class="row btnContainer">
          <a href="/addContact" class="btn btn-primary addContact"><i class="fa fa-edit"></i> Edit Contacts</a>
      </div> 
      <div class="response mt-4 text-center text-primary updateGroupResponse">
      </div>
  </div>
  </div>
</div>
</td>
</tr>`;
      }

      }
      this.body.innerHTML += row;
    }

    if( this.type != "messages") {
      if (!this.tagList) {
        if (!this.groupCol) {
          let u = new UpdateGroup(this.body);
          u.startListenAll();
          let rows = Array.from(this.body.children).filter(c => !c.classList.contains("editRow"));
          for (let i = 0; i < rows.length; i++) {
            let c = new UpdateContact(rows[i].querySelector('.filterContainer'), rows[i].querySelector('tbody'));
            c.editAllListen();
            // tagListen(rows[i].querySelector(".custom-control-input"));
  
          }
        } else {
          let u = new UpdateContact(this.parent, this.body);
          u.editAllListen();
        }
  
  
      } else {
        let rows = this.body.children;
       
        for (let i = 0; i < rows.length; i++) {
          if(!this.groupCol) {
            let customList = Array.from(this.parent.parentNode.querySelectorAll('.group-input-list tbody tr')).map(n=>n.children[2].innerText)
            tagListen(rows[i].querySelector(".form-check-input"), customList);
          } else {
            tagListen(rows[i].querySelector(".form-check-input"));
          }
          
        }
      }
    } else {
      
      msgDeleteListen();
    }

    this.body.classList.add("fadeIn");

    return d;
  }

  searchListen() {
    this.search.addEventListener("submit", (e) => {
      e.preventDefault();
      showPreloader(this.body);
      this.setFilter();

      // this.setPages()
      // let searchTerm = search.querySelector('input[type="search"]').value;

      asyncReq(
        "/search" + this.type,
        "post",
        this.filter,
        this.showResponse.bind(this)
      ).then((data) => {
        this.setPages(0, data.total);
      });
    });
  }

  amountListen() {
    this.amount.addEventListener("change", (e) => {
      // let filter = { amount: parseInt(e.target.value) };
      showPreloader(this.body);
      this.setFilter();
      // this.setPages();

      asyncReq(
        "/" + this.type + "Filter",
        "post",
        this.filter,
        this.showResponse.bind(this)
      ).then((data) => {
        this.setPages(0, data.total);
      });
      // messageFilter(filter)
    });
  }

  setPages(index, total) {
    let pageCon = this.parent.querySelector(".pagination");

    if (pageCon) {
      let limit = this.parent.querySelector(".filterAmount").value;

      let pages = total / limit;

      this.parent.querySelector(".total").innerText = total;

      pageCon.innerHTML = "";
      for (let i = 0; i < pages; i++) {
        pageCon.innerHTML +=
          '<li class="page-item "><a class="page-link" href="#">' +
          (i + 1) +
          "</a></li>";
        if (index == i) {
          pageCon.children[i].classList.add("active");
          this.parent.querySelector(".upper").innerText =
            limit * (i + 1) < total ? limit * (i + 1) : total;
          this.parent.querySelector(".lower").innerText = limit * i + 1;
        }
      }

      this.pageListen();
    }
  }

  pageListen() {
    // this.skip = document.querySelector('.pagination .active').value;
    let pageBtns = this.parent.querySelectorAll(".page-item");
    for (let i = 0; i < pageBtns.length; i++) {
      pageBtns[i].addEventListener("click", (e) => {
        e.preventDefault();

        this.setFilter();
        this.filter.page = i;
        let current = e.currentTarget;

        asyncReq(
          "/" + this.type + "Filter",
          "post",
          this.filter,
          this.showResponse.bind(this)
        ).then((data) => {
          this.setPages(parseInt(current.innerText) - 1, data.total);
        });
      });
    }
  }
}
