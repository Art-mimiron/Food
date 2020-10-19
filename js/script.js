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
      modal = document.querySelector('.modal'),
      modalClose = document.querySelector('[data-modal_close]');


function openModal() {
    modal.classList.toggle('show');
    document.body.style.overflow = 'hidden';
    clearInterval(modalTimeID);
    window.removeEventListener(('scroll'), showModalByScroll);
}
function closeModal() {
    modal.classList.toggle('show');
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
    if (e.target === modal || e.target === modalClose) {
    closeModal();
    }
});
document.addEventListener('keydown', (e) => {
    if(e.code === 'Escape' && modal.classList.contains('show')) {
        closeModal();
    }
});

const modalTimeID = setTimeout(openModal, 5000);


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

new CreateCard(
    "img/tabs/vegy.jpg",
    "vegy",
    'Меню "Фитнес"',
    'Меню "Фитнес" - это новый подход к приготовлению блюд: больше свежих овощей и фруктов. Продукт активных и здоровых людей. Это абсолютно новый продукт с оптимальной ценой и высоким качеством!',
    10,
    '.menu .container'
).render();
new CreateCard(
    "img/tabs/elite.jpg",
    "elite",
    'Меню “Премиум”',
    'В меню “Премиум” мы используем не только красивый дизайн упаковки, но и качественное исполнение блюд. Красная рыба, морепродукты, фрукты - ресторанное меню без похода в ресторан!',
    20,
    '.menu .container'
).render();
new CreateCard(
    "img/tabs/post.jpg",
    "post",
    'Меню "Постное"',
    'Меню “Постное” - это тщательный подбор ингредиентов: полное отсутствие продуктов животного происхождения, молоко из миндаля, овса, кокоса или гречки, правильное количество белков за счет тофу и импортных вегетарианских стейков.',
    13,
    '.menu .container'
).render();


// FORMS POST

const forms = document.querySelectorAll('form'),
      messages = {
          loading: 'Загрузка...',
          success: 'Спасибо! Мы с Вами скоро свяжемся',
          failure: 'Что-то пошло не так...'
      };

forms.forEach((item) => {
    postData(item);
});

function postData(form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let statusMessage = document.createElement('div');
        statusMessage.classList.add('status');
        statusMessage.textContent = messages.loading;
        form.appendChild(statusMessage);

        const request = new XMLHttpRequest();
        request.open('POST', 'server.php');
        request.setRequestHeader('Content-type', 'application/json; charset=utf-8');

        const formData = new FormData(form);
        const bufferObj = {};

        formData.forEach((item, key) => {
            bufferObj[key] = item;
        });
        
        request.send(JSON.stringify(bufferObj));

        request.addEventListener('load', () => {
            if (request.status == 200) {
                console.log(request.response);
                statusMessage.textContent = messages.success;
                form.reset();
                setTimeout(()=>{statusMessage.remove();}, 2000);
            } else {
                statusMessage.textContent = messages.failure;
            }
        });
    });
}

