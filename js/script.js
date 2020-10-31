'use strict';

// TABS

let tabsContainer = document.querySelector('.tabheader__items'),
    tabs = document.querySelectorAll('.tabheader__item'),
    content = document.querySelectorAll('.tabcontent');
    

function hideTabContent() {
    content.forEach(item => {
        
        item.classList.remove('show', 'fade');
        item.classList.add('fade_reverse','hide');
    });
    
    tabs.forEach(item => {
        item.classList.remove('tabheader__item_active');
    });
    
}

function showTabContent(i = 0) {
    tabs[i].classList.add('tabheader__item_active');
    content[i].classList.add('show', 'fade');
    content[i].classList.remove('fade_reverse','hide');
}

hideTabContent();
showTabContent();

tabsContainer.addEventListener('click', function(e) {
    const t = e.target;

    if (t && t.classList.contains('tabheader__item')) {
        tabs.forEach((item, i) => {
            if (t == item) {
                hideTabContent();
                showTabContent(i);
            }
        });
    }
});

//TIMER


const deadLine = "2020-12-23";

function getTimeRemaining (endtime) {
    const t = Date.parse(endtime) - Date.parse(new Date()),
          days = Math.floor(t / (1000 * 60 * 60 * 24)),
          hours = Math.floor((t / (1000 * 60 * 60)) % 24),
          minutes = Math.floor((t / (1000 * 60)) % 60),
          seconds = Math.floor((t / 1000) % 60);

    return {
        t,
        days,
        hours,
        minutes,
        seconds
    };
}

function getZero(num) {
    if (num >= 0 && num < 10) {
        return `0${num}`;
    } else {
        return num;
    }
}

function setClock (selector, endtime) {
    const timer = document.querySelector(selector),
          days = timer.querySelector('#days'),
          hours = timer.querySelector('#hours'),
          minutes = timer.querySelector('#minutes'),
          seconds = timer.querySelector('#seconds'),
          timeInterval = setInterval(updateClock, 1000);

    updateClock();

    function updateClock() {
        const t = getTimeRemaining(endtime);

        days.innerHTML = getZero(t.days);
        hours.innerHTML = getZero(t.hours);
        minutes.innerHTML = getZero(t.minutes);
        seconds.innerHTML = getZero(t.seconds);

        if (t.t <= 0) {
            clearInterval(timeInterval);
        }
    }
          
}

setClock('.timer', deadLine);


//MODAL

const modalTrigger = document.querySelectorAll('[data-modal]'),
      modal = document.querySelector('.modal');


function openModal() {
    modal.classList.add('show');
    modal.classList.remove('hide');
    document.body.style.overflow = 'hidden';
    clearInterval(modalTimeID);
    window.removeEventListener(('scroll'), showModalByScroll);
}
function closeModal() {
    modal.classList.remove('show');
    modal.classList.add('hide');
    document.body.style.overflow = '';
}
function showModalByScroll() {
    if (window.pageYOffset + document.documentElement.clientHeight >= document.documentElement.scrollHeight) {
            openModal();
            window.removeEventListener(('scroll'), showModalByScroll);
        }
    }


modalTrigger.forEach(item => {
    item.addEventListener('click', openModal);
});

modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.getAttribute('data-modal_close') == '') {
    closeModal();
    }
});
document.addEventListener('keydown', (e) => {
    if(e.code === 'Escape' && modal.classList.contains('show')) {
        closeModal();
    }
});

const modalTimeID = setTimeout(openModal, 50000);


window.addEventListener('scroll', showModalByScroll);

//CLASS FOR CARDS

class CreateCard{
    constructor(src, alt, title, descr, price, parentSelector, ...classes) {
        this.src = src;
        this.alt = alt;
        this.title = title;
        this.descr = descr;
        this.price = price;
        this.class = classes;
        this.parent = document.querySelector(parentSelector);
        this.rateUAH = 28;
        this.convertToUAH();
    }
    convertToUAH() {
        this.price = this.price * this.rateUAH;
    }

    render() {
        const element = document.createElement('div');
        if (this.class.length === 0) {
            this.class = 'menu__item';
            element.classList.add(this.class);
        } else {
            this.class.forEach(className => element.classList.add(className));
        }

        element.innerHTML = `
            <img src=${this.src} alt=${this.alt}>
            <h3 class="menu__item-subtitle">${this.title}</h3>
            <div class="menu__item-descr">${this.descr}</div>
            <div class="menu__item-divider"></div>
            <div class="menu__item-price">
                <div class="menu__item-cost">Цена:</div>
                <div class="menu__item-total"><span>${this.price}</span> грн/день</div>
            </div>
        `;
        this.parent.append(element);
    }
}

const generateCard = async (url) => {
    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(`Failed to get data from ${url} status ${res.status}`);
    }
    return res.json();
};

generateCard('http://localhost:3000/menu')
.then(data => {
    data.forEach(({img, altimg, title, descr, price}) => {
        new CreateCard(img, altimg, title, descr, price, '.menu .container').render();
    });
});

// FORMS POST

const forms = document.querySelectorAll('form'),
      messages = {
          loading: 'icons/modal_spinner.svg',
          success: 'Спасибо! Мы с Вами скоро свяжемся',
          failure: 'Что-то пошло не так...'
      };

forms.forEach((item) => {
    bindPostData(item);
});

const postData = async (url, data) => {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: data
    });

    return await res.json();
};

function bindPostData(form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        const json = JSON.stringify(Object.fromEntries(formData.entries()));

        let statusMessage = document.createElement('img');
        statusMessage.src = messages.loading;
        statusMessage.style.cssText = `
            display: block;
            margin: 0 auto; 
        `;
        form.insertAdjacentElement('afterend', statusMessage);

        postData('http://localhost:3000/requests', json)
        .then(request => {
            console.log(request);
            showThanksModal(messages.success);
            statusMessage.remove();
        })
        .catch(() => {
            showThanksModal(messages.failure);
        })
        .finally(() => {
            form.reset();
        });
    });
}

function showThanksModal(message) {
    const prevModalWindow = document.querySelector('.modal__dialog');
    prevModalWindow.classList.add('hide');

    openModal();

    const thanksModal = document.createElement('div');
    thanksModal.classList.add('modal__dialog');
    thanksModal.innerHTML = `
        <div class="modal__content">
            <div class="modal__close" data-modal_close>×</div>
            <div class="modal__title">${message}</div>
        </div>
    `;

    document.querySelector('.modal').append(thanksModal);

    setTimeout(()=>{
        thanksModal.remove();
        prevModalWindow.classList.add('show');
        prevModalWindow.classList.remove('hide');
        closeModal();
    }, 4000);
}

// SLIDER

let offerSlide = document.querySelectorAll('.offer__slide');

console.log(offerSlide);