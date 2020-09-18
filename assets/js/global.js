(function ($) {
  "use strict"; // Start of use strict

  // Toggle the side navigation
  $("#sidebarToggle, #sidebarToggleTop").on('click', function (e) {
    $("body").toggleClass("sidebar-toggled");
    $(".sidebar").toggleClass("toggled");
    if ($(".sidebar").hasClass("toggled")) {
      $('.sidebar .collapse').collapse('hide');
    };
  });

  // Close any open menu accordions when window is resized below 768px
  $(window).resize(function () {
    if ($(window).width() < 768) {
      $('.sidebar .collapse').collapse('hide');
    };
  });

  // Prevent the content wrapper from scrolling when the fixed side navigation hovered over
  $('body.fixed-nav .sidebar').on('mousewheel DOMMouseScroll wheel', function (e) {
    if ($(window).width() > 768) {
      var e0 = e.originalEvent,
        delta = e0.wheelDelta || -e0.detail;
      this.scrollTop += (delta < 0 ? 1 : -1) * 30;
      e.preventDefault();
    }
  });

  // Scroll to top button appear
  $(document).on('scroll', function () {
    var scrollDistance = $(this).scrollTop();
    if (scrollDistance > 100) {
      $('.scroll-to-top').fadeIn();
    } else {
      $('.scroll-to-top').fadeOut();
    }
  });

  // Smooth scrolling using jQuery easing
  $(document).on('click', 'a.scroll-to-top', function (e) {
    var $anchor = $(this);
    $('html, body').stop().animate({
      scrollTop: ($($anchor.attr('href')).offset().top)
    }, 1000, 'easeInOutExpo');
    e.preventDefault();
  });

})(jQuery); // End of use strict


const asyncReq = (action, method, body, callback) => {
  fetch(action, {
    method: method,
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify(body)
  })
    .then(function (res) { 
      return res.json(); //convert response into readable data and return it to the callback functions
    })
    .then(callback)
    .catch(function (err) {
      console.log(err);
    });
}

// HELPER FUNCTIONS

const showPreloader = (parent) => {
  if (!parent.innerHTML.match(/^<div id="preload"/g)) {
    

     if( parent.localName == 'tbody') {
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

      parent.classList.remove('fadeIn')
      void parent.offsetWidth;
      parent.classList.add('fadeIn')
  


  }
}

const removePreloader = () => {
  let preloader = document.querySelector('#preload');
  if (preloader) {

      preloader.classList.remove('fadeOut')
      void preloader.offsetWidth;
      preloader.classList.add('fadeOut')
  }
}

function showResponse(data) {

  removePreloader();

  // setTimeout(() => {

    filterBody.classList.remove('fadeIn')
    void filterBody.offsetWidth;

    let row = '';
    filterBody.innerHTML = row;

    if (title == 'contacts') {
      for (let m = 0; m < data.length; m++) {
  
        row = '<tr><td>' + data[m].name + '</td>'
        row += '<td>' + data[m].company + '</td>';
        row += '<td>' + data[m].number + '</td>';
        row += '<td>' + data[m].email + '</td>';
        row += '<td>' + data[m].optIn + '</td>';
        row += '</tr>';
        filterBody.innerHTML += row;
      }
    
    } else if (title == 'messages') {
      
    for (let m = 0; m < data.length; m++) {

      row = '<tr><td class="flex start-left flex-wrap pt-0">'
      for (let c = 0; c < data[m].contact.length; c++) {
        let contact = data[m].contact[c];
        row += '<div class="cross-fade c-tag">\
          <div class="top">' + contact.name + '</div> \
        <div class="under">' + contact.number + '</div></div>';

      }
      row += '</td><td>' + data[m].message + '</td>';
      row += '<td>' + data[m].date + '</td>';
      row += '<td>\
      <form action="/delete"'+this.type+'" method="post" class="delete">  \
          <input type="hidden" name="_id" value="'+ data[m]._id + '">\
          <input type="hidden" name="async" value="false">\
          <button class="btn btn-primary" type="submit"><i class="fa fa-trash"></i></button>\
      </form>\
      </td>'
      row += '</tr>';
      filterBody.innerHTML += row;
    }
    }


    filterBody.classList.add('fadeIn')
  // }, 1000);
}


class Filter {
  constructor(type) {
    this.type = type;
    this.order = [];
    this.cols = Array.from(document.querySelectorAll('.col-sort'));

    for (let i = 0; i < this.cols.length; i++) {
      this.order.push(-1) 
    }
    this.amount = document.getElementById('filterAmount');
    this.filter = { limit: -1, sort: {} };

  }

  setFilter(index) {

    this.filter.sort = {};

    if(typeof index !== 'undefined') {
        let key = this.cols[index].id.replace('-sort', '');
        this.filter.sort = { ...this.filter.sort, [key]: this.order[index] }
        this.order[index] =  this.order[index] == -1 ? 1 : -1;
    }
    
    this.filter.limit = parseInt(this.amount.value);
    this.filter.async = true;
  }

  startListen() {
    for (let i = 0; i < this.cols.length; i++) {

      this.cols[i].addEventListener('click', e => {
        e.preventDefault()

        showPreloader(filterBody)
        this.setFilter(i);

        asyncReq('/'+ this.type+ 'Filter', 'post', this.filter, showResponse)
      })

    }

    let all = document.getElementById('all')

    all.addEventListener('submit', (e)=> {
      e.preventDefault();
      let limit = all.querySelector('input[type="hidden"]').value;
      this.filter.limit = parseInt(limit);
      this.filter.async = true;

      asyncReq('/'+ this.type+ 'Filter', 'post', this.filter, showResponse)

    })

  
      let search = document.getElementById("search");
    
      search.addEventListener('submit', e => {
        e.preventDefault();
        showPreloader(filterBody)
        let searchTerm = search.querySelector('input[type="search"]').value;
    
        asyncReq('/search'+this.type, 'post', { term: searchTerm, async: true }, showResponse)
    
      })
    

    this.amount.addEventListener('change', (e) => {
      // let filter = { amount: parseInt(e.target.value) };
      showPreloader(filterBody)
      this.setFilter();

      asyncReq('/'+ this.type+ 'Filter', 'post', this.filter, showResponse)
      // messageFilter(filter)
    })

  }

}

