

const filterBody = document.querySelector('tbody');
const title = document.title
let f = new Filter(title)



f.setFilter();
f.startListen();



function deleteListen(type) {

  let delForms = Array.from(document.querySelectorAll('.delete'));
  let rows = Array.from(document.querySelectorAll('tbody tr'))

  for (let i = 0; i < delForms.length; i++) {
    delForms[i].addEventListener('submit', (e) => {
      e.preventDefault();
      let id = delForms[i].querySelector('input[name="_id"]').value

      asyncReq('/delete' + type, 'post', { _id: id, async: true }, (data) => {
        if (data.msg != "error") {
          rows[i].remove();
        }
      })
    })

  }

}

deleteListen("Message");


