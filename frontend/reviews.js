

// ==========================================
// CONFIGURAZIONE API
// ==========================================
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
  ? 'http://localhost:3000/api' 
  : `${window.location.protocol}//${window.location.host}/api`;

console.log('🔗 API URL:', API_URL);

// ==========================================
// ARRAY RECENSIONI FITTIZIE (FALLBACK)
// ==========================================
const reviewsData = [];

// Variabile globale per le recensioni attuali
let currentReviews = reviewsData;

// ==========================================
// CARICA RECENSIONI DAL BACKEND
// ==========================================
async function loadReviewsFromAPI() {
    try {
        console.log('📡 Caricamento recensioni dal server...');
        
        const response = await fetch(`${API_URL}/reviews/approved`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.reviews.length > 0) {
            console.log('✅ Recensioni caricate:', data.count);
            
            const formatted = data.reviews.map(r => ({
                id: r._id,
                name: r.name,
                rating: r.rating,
                text: r.text,
                date: new Date(r.createdAt).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }),
                isNew: false
            }));
            
            return formatted;
        } else {
            console.log('ℹ️ Uso recensioni di esempio');
            return reviewsData;
        }
        
    } catch (error) {
        console.error('❌ Errore caricamento:', error);
        return reviewsData;
    }
}

// ==========================================
// MOSTRA RECENSIONI
// ==========================================
function renderReviews(reviews) {
    const container = document.getElementById('reviewsWrapper');
    
    if (!container) {
        console.error('❌ reviewsWrapper non trovato!');
        return;
    }
    
    container.innerHTML = '';
    
    if (!reviews || reviews.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:40px;">Nessuna recensione.</p>';
        return;
    }
    
    console.log('✅ Mostro', reviews.length, 'recensioni');
    
    reviews.forEach(item => {
        const stars = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);
        
        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
            <div class="review-header">
                <span class="reviewer-name">${item.name}</span>
                <span class="review-stars">${stars}</span>
            </div>
            <div class="review-date">${item.date}</div>
            <div class="review-text">${item.text}</div>
        `;
        
        card.addEventListener('click', () => openReviewModal(item));
        container.appendChild(card);
    });
}

const modalOverlay= document.getElementById('modalOverlay');
const modalClose= document.getElementById('modalClose');
const modalReviewer= document.getElementById('modalReviewer');
const modalStars= document.getElementById('modalStars');
const modalDate= document.getElementById('modalDate');
const modalReviewText= document.getElementById('modalReviewText');

const reviewsWrapper= document.getElementById('reviewsWrapper');
const scrollLeftBtn= document.getElementById('scrollLeft');
const scrollRightBtn= document.getElementById('scrollRight');
const scrollIndicator= document.getElementById('scrollIndicator');
const scrollDots= document.getElementById('scrollDots');

let currentReview= null;
let isSubmitting = false; // Flag per prevenire doppio submit

function openReviewModal(review) {
    currentReview= review;

    const stars= '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

    modalReviewer.textContent= review.name;
    modalStars.textContent= stars;
    modalDate.textContent= review.date;
    modalReviewText.textContent= review.text;

    modalOverlay.classList.add('active');
    document.body.style.overflow= 'hidden';

}//apri popup recensione completa

function closeReviewModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow= 'auto';

}//chiudi popup

modalClose.addEventListener('click', closeReviewModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeReviewModal();

    }

});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeReviewModal();

    }

});

// Event listeners per i bottoni di scroll
if (scrollLeftBtn) {
    scrollLeftBtn.addEventListener('click', () => {
        reviewsWrapper.scrollBy({
            left: -370,
            behavior: "smooth"
        });
    });
}

if (scrollRightBtn) {
    scrollRightBtn.addEventListener('click', () => {
        reviewsWrapper.scrollBy({
            left: 370,
            behavior: "smooth"
        });
    });
}


scrollLeftBtn.addEventListener('click', () => {
    reviewsWrapper.scrollBy({
        left: -370,
        behavior: "smooth"
    });

});

scrollRightBtn.addEventListener('click', () => {
    reviewsWrapper.scrollBy({
        left: 370,
        behavior: "smooth"
    });

});

function scrollToPosition(index) {
    reviewsWrapper.scrollTo({
        left: index * 370,
        behavior: "smooth"

    });

}

reviewsWrapper.addEventListener('scroll', () => {
    updateScrollIndicators();

});

function updateScrollIndicators() {
    const scrollLeft= reviewsWrapper.scrollLeft;
    const scrollWidth= reviewsWrapper.scrollWidth;
    const clientWidth= reviewsWrapper.clientWidth;
    const currentIndex= Math.round(scrollLeft / 370);
    const totalCards = currentReviews.length;
    const dots= scrollDots.querySelectorAll('.scroll-dot');
    
    // Crea dots se non esistono
    if (dots.length !== totalCards) {
        scrollDots.innerHTML = '';
        for (let i = 0; i < totalCards; i++) {
            const dot = document.createElement('div');
            dot.className = 'scroll-dot';
            dot.addEventListener('click', () => scrollToPosition(i));
            scrollDots.appendChild(dot);
        }
    }
    
    // Aggiorna active dot
    const newDots = scrollDots.querySelectorAll('.scroll-dot');
    newDots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
    });

    if (scrollLeftBtn) scrollLeftBtn.disabled= scrollLeft <= 0;
    if (scrollRightBtn) scrollRightBtn.disabled= scrollLeft >= scrollWidth - clientWidth - 10;

    if (scrollLeft <= 0) {
        scrollIndicator.textContent= 'Scorri a destra per vedere altre recensioni →';

    }else if (scrollLeft >= scrollWidth - clientWidth -10) {
        scrollIndicator.textContent= '← Sei alla fine delle recensioni';

    }else {
        scrollIndicator.textContent= `Recensione ${currentIndex + 1} di ${totalCards}`;

    }

}

// ==========================================
// INVIA RECENSIONE
// ==========================================
async function submitReview(data) {
    try {
        console.log('📤 Invio recensione...');
        console.log('📦 Dati:', data);
        
        const response = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        console.log('📡 Risposta:', result);
        
        if (result.success) {
            return { success: true, message: result.message };
        } else {
            let msg = result.message;
            if (result.errors && result.errors.length > 0) {
                msg += ': ' + result.errors.join(', ');
            }
            return { success: false, message: msg };
        }
        
    } catch (error) {
        console.error('❌ Errore:', error);
        return { success: false, message: 'Errore di connessione' };
    }
}

// ==========================================
// FORM HANDLER
// ==========================================
const form = document.getElementById('reviewForm');
if (form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('📤 Form submit triggered');
        
        if (isSubmitting) {
            console.log('⏳ Submit già in corso, ignora');
            return;
        }
        
        isSubmitting = true;
        
        const btn = this.querySelector('button[type="submit"]');
        const btnText = btn ? btn.textContent : 'Invia';
        
        if (btn) {
            btn.disabled = true;
            btn.textContent = '⏳ Invio...';
        }
        
        const data = {
            name: document.getElementById('reviewerName').value.trim(),
            email: document.getElementById('reviewerEmail').value.trim(),
            rating: parseInt(document.querySelector('input[name="rating"]:checked')?.value || 0),
            text: document.getElementById('reviewText').value.trim()
        };
        
        console.log('📋 Form data:', data);
        
        // Validazione
        if (!data.name || !data.email || !data.rating || !data.text) {
            showError('Compila tutti i campi obbligatori');
            if (btn) {
                btn.disabled = false;
                btn.textContent = btnText;
            }
            return;
        }
        
        if (data.text.length < 10) {
            showError('La recensione deve avere almeno 10 caratteri');
            if (btn) {
                btn.disabled = false;
                btn.textContent = btnText;
            }
            return;
        }
        
        const result = await submitReview(data);
        
        if (result.success) {
            showSuccess(result.message || 'Recensione inviata con successo!');
            form.reset();
            document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            showError(result.message || 'Errore durante l\'invio');
        }
        
        if (btn) {
            btn.disabled = false;
            btn.textContent = btnText;
        }
        
        isSubmitting = false; // Reset flag
    });
}

// ==========================================
// MESSAGGI UI
// ==========================================
function showSuccess(msg) {
    const div = document.getElementById('successMessage');
    if (div) {
        div.textContent = msg;
        div.classList.add('show');
        setTimeout(() => div.classList.remove('show'), 5000);
    } else {
        alert(msg);
    }
}

function showError(msg) {
    const div = document.getElementById('errorMessage');
    if (div) {
        div.textContent = msg;
        div.classList.add('show');
        setTimeout(() => div.classList.remove('show'), 5000);
    } else {
        alert(msg);
    }
}

function updateReviewCount(count) {
    const el = document.getElementById('reviewCount');
    if (el) el.textContent = count;
}

function updateOverallRating(reviews) {
    const ratingEl = document.querySelector('.overall-rating');
    if (!ratingEl || !reviews || reviews.length === 0) return;
    
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = total / reviews.length;
    ratingEl.textContent = avg.toFixed(1);
    
    console.log('⭐ Rating medio:', avg.toFixed(1));
}

// ==========================================
// INIZIALIZZAZIONE
// ==========================================
async function loadAndDisplay() {
    const reviews = await loadReviewsFromAPI();
    currentReviews = reviews; // Aggiorna la variabile globale
    renderReviews(reviews);
    updateScrollIndicators(); // Aggiorna indicatori dopo render
    updateReviewCount(reviews.length);
    updateOverallRating(reviews);
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inizializzazione...');
    await loadAndDisplay();
    setInterval(loadAndDisplay, 30000);
});

console.log('✅ reviews.js caricato');
