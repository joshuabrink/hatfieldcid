
const parent = document.querySelector('.filterContainer');
const filterBody = document.querySelector('.filterBody');
const title = "messages"
let f = new Filter(title, parent, filterBody)



f.setFilter();
f.startListen();



function msgDeleteListen() {

  let delForms = Array.from(document.querySelectorAll('.deleteMessage'));
  let rows = Array.from(document.querySelectorAll('tbody tr'))

  for (let i = 0; i < delForms.length; i++) {
    delForms[i].addEventListener('submit', (e) => {
      e.preventDefault();
      let id = delForms[i].querySelector('input[name="_id"]').value

      asyncReq('/deleteMessage', 'post', { _id: id, async: true }, (data) => {
        if (data.msg != "error") {
          rows[i].remove();
        }
      })
    })

  }

}

msgDeleteListen();


