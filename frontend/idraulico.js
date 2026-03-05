

let currentSlide= 0;
const sliderWrapper= document.getElementById('sliderWrapper');
const slides= document.querySelectorAll('.slide'); //container delle slide
const totalSlides= slides.length; //numero totale di slide
const dotsContainer= document.getElementById('sliderDots'); //container dei pallini


function createDots() {
    for (let i= 0; i< totalSlides; i++) {
        const dot= document.createElement('span');
        dot.classList.add('dot');

        if (i === 0) {
            dot.classList.add('active');

        }

        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);

    }
}

//funzione per creare i pallini di navigazione

function goToSlide(index) {
    currentSlide= index;
    const offset= -currentSlide * 100

    sliderWrapper.style.transform= `translateX(${offset}%)`;

    updateDots()

}

//funzione per andare in una slide specifica

function updateDots() {
    const dots= document.querySelectorAll('.dot');
    dots.forEach((dot,index) => {
        dot.classList.remove('active');

        if (index === currentSlide) {
            dot.classList.add('active');

        }

    });

}

//funzione per aggiornare lo stato dei pallini

function nextSlide() {
    if (currentSlide >= totalSlides -1) {
        goToSlide(0);

    }
    else {
        goToSlide(currentSlide + 1);

    }

}

//funzione per andare alla slide successiva

function prevSlide() {
    if (currentSlide <= 0) {
        goToSlide(totalSlides - 1);

    }
    else {
        goToSlide(currentSlide - 1);

    }

}

//funzione per andare alle slide precedenti

document.getElementById('prevBtn').addEventListener('click', prevSlide);
document.getElementById('nextBtn').addEventListener('click', nextSlide);

let autoplayInterval= setInterval(nextSlide, 5000);

function resetAutoplay() {
    clearInterval(autoplayInterval);
    autoplayInterval= setInterval(nextSlide, 5000);

}

document.getElementById('prevBtn').addEventListener('click', resetAutoplay);
document.getElementById('nextBtn').addEventListener('click', resetAutoplay);
dotsContainer.addEventListener('click', resetAutoplay);

let touchStartX= 0;
let touchEndX= 0;

sliderWrapper.addEventListener('touchstart', (e) => {
    touchStartX= e.changedTouches[0].screenX;

});

sliderWrapper.addEventListener('touchend', (e) => {
    touchEndX= e.changedTouches[0].screenX;
    handleSwipe();

});

function handleSwipe() {
    if(touchStartX - touchEndX > 50) {
        nextSlide();
        resetAutoplay();
    }

    if (touchEndX - touchStartX > 50) {
        prevSlide();
        resetAutoplay();

    }

}

createDots();

//tutti gli eventi della galleria, con scorrimento automatico di 5sec e l'implementazione dello scorrimento con swipe via telefono

/*const reviewForm= document.getElementById('reviewForm');

if (reviewForm) {
    reviewForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const submitBtn= this.querySelector('button[type="submit"]');
        const originalText= submitBtn.textContent;

        submitBtn.disabled= true;
        submitBtn.textContent= '⏳ Invio in corso...';

        const formData= {
            name: document.getElementById('reviewerName').value,
            email: document.getElementById('reviewerEmail').value,
            rating: parseInt(document.querySelector('input[name="rating"]:checked')?.value || 0),
            text: document.getElementById('reviewText').value

        };

        if (!formData.name || !formData.email || !formData.rating || !formData.text) {
            showError('Compila tutti i campi obbligatori');
            submitBtn.disabled= false;
            submitBtn.textContent= originalText;
            return; 

        }
        const result= await submitReview(formData);

        if (result.success) {
            showSuccess(result.message || 'Recensione inviata! Riceverai una conferma via email.');
            reviewForm.reset();

            window.scrollTo({ top: 0, behavior: 'smooth' });

        } else {
            showError(result.message || 'Errore durante l\'invio. Riprova.');

        }

        submitBtn.disabled= false;
        submitBtn.textContent= originalText;

    });

}// gestione invio form recensioni

function showSuccess(message) {
    const successDiv= document.getElementById('successMessage');

    if (successDiv) {
        successDiv.textContent= message;
        successDiv.classList.add('show');

        setTimeout(() => {
            successDiv.classList.remove('show');

        }, 5000);

    } else {
        alert(message);

    }

}

function showError(message) {
    const errorDiv= document.getElementById('errorMessage');

    if (errorDiv) {
        errorDiv.textContent= message;
        errorDiv.classList.add('show');

        setTimeout(() => {
            errorDiv.classList.remove('show');

        }, 5000);

    } else {
        alert(message);

    }

}

function updateReviewCount(count) {
    const countElement= document.getElementById('reviewCount');

    if (countElement) {
        countElement.textContent= count;

    }

}*/


/*const successMessage= document.getElementById('successMessage');
const reviewsContainer= document.getElementById('reviewsContainer');

reviewForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const name= document.getElementById('reviewer-name').value;
    const reviewText= document.getElementById('review-text').value;
    const ratingInput= document.querySelector('input[name="rating"]:checked');
    const rating= ratingInput ? ratingInput.value: 0;

    let starsHTML= '';

    for (let i= 0; i< 5; i++) {
        starsHTML += i< rating ? '★': '☆';

    }

    const today= new Date();
    const dateString= today.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'

    });

    const newReview= document.createElement('div');
    newReview.classList.add('review-card');
    newReview.style.opacity= '0';
    newReview.innerHTML= `
    <div class="review-header">
      <span class="reviewer-name">${name}</span>
      <span class="review-stars">${starsHTML}</span>
    </div>
    <div class="review-date">${dateString}</div>
    <div class="review-text">${reviewText}</div>
    <button class="delete-review-btn" aria-label="Elimina recensione">🗑️ Elimina</button>
    `;

    const deleteBtn= newReview.querySelector('.delete-review-btn');
    deleteBtn.addEventListener('click', function() {
        if(confirm('Sei sicuro di voler eliminare questa recensione?')) {
            newReview.style.opacity= '0';
            newReview.style.transition= 'opacity 0.5s ease';
            setTimeout(() => {
                newReview.remove();
            }, 500);
        }
    });

    //quando il form viene inviato,raccoglie i dati dal form,trova la stella selezionata,crea le stelle in base al rating e crea un nuovo elemento recensione

    reviewsContainer.insertBefore(newReview, reviewsContainer.firstChild);

    setTimeout(() => {
        newReview.style.transition= 'opacity 0.5s ease';
        newReview.style.opacity= '1';

    },100);

    successMessage.classList.add('show');
    reviewForm.reset();

    setTimeout(() => {
        successMessage.classList.remove('show');

    },5000);

    setTimeout(() => {
       newReview.scrollIntoView({behavior: 'smooth', block: 'center'});

    }, 600);

    console.log('Recensione inviata:', {
        nome: name,
        valutazione: rating,
        testo: reviewText,
        data: dateString

    });

});*/

//sistema per aggiungere una nuova recensione in cima alle altre

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();

        const targetID= this.getAttribute('href');
        const targetElement= document.querySelector(targetID);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'

            });

        }

    });

});

//smooth scroll per i link interni

//lazy loading per le immagini con IntersectionObserver - ottimizzazione performance
if ('IntersectionObserver' in window) {
    const imageObserver= new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img= entry.target;
                if (img.dataset.src) {
                    img.src= img.dataset.src;
                    img.classList.add('loaded');
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: '50px' // Carica 50px prima di diventare visibile
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
} else {
    // Fallback per browser vecchi
    document.querySelectorAll('img[data-src]').forEach(img => {
        img.src= img.dataset.src;
    });
}

// Hide/Show Header durante lo scroll
let lastScrollTop= 0;
const banner= document.querySelector('.banner');

window.addEventListener('scroll', function() {
    const scrollTop= this.window.pageYOffset || this.document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scroll verso il basso - nasconde il banner
        banner.style.transform= 'translateY(-100%)';
        banner.style.transition= 'transform 0.3s ease-in-out';
    } else {
        // Scroll verso l'alto - mostra il banner
        banner.style.transform= 'translateY(0)';
        banner.style.transition= 'transform 0.3s ease-in-out';
    }

    lastScrollTop= scrollTop <= 0 ? 0 : scrollTop;

},false);

console.log('✅ Pagina caricata correttamente');
console.log('📸 Totale slide:', totalSlides);
console.log('🎨 JavaScript inizializzato con successo');


