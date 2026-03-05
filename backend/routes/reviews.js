

const express= require('express');
const router= express.Router();
const Review= require('../models/Review');
const { sendNewReviewEmail, sendConfirmationEmail } = require('../config/email');
const { authenticateAdmin } = require('../middleware/auth');


router.get('/approved', async(req, res) => {
    try {
        const reviews= await Review.find({ status: 'approved' })
        .sort({ approvedAt: -1 })
        .select('-email -__v');//non esporre l'email pubblicamente

        res.json({
            success: true,
            count: reviews.length,
            reviews

        });

    } catch (error) {
        console.error('Errore caricamento recensioni:', error);
        res.status(500).json({
            success: false,
            message: 'Errore caricamento recensioni'

        });

    }

});

//recensioni approvate (pubbliche)

router.get('/pending', authenticateAdmin, async (req, res) => {
    try {
        const reviews= await Review.find({ status: 'pending' })
        .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: reviews.length,
            reviews

        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message

        });

    }

});

//recensioni in attesa

router.post('/', async (req, res) => {
    console.log('📥 Richiesta POST /reviews ricevuta:', new Date().toISOString());
    try {
        const { name, email, rating, text } = req.body;
        console.log('📥 Dati ricevuti:', { name, email, rating, text });
        if (!name || name.trim().length === 0) {
            console.log('❌ Nome mancante o vuoto');
            return res.status(400).json({
                success: false,
                message: 'Il nome è obbligatorio'

            });

        }//validazione di base

        if (!email || email.trim().length === 0) {
            console.log('❌ Email mancante o vuota');
            return res.status(400).json({
                success: false,
                message: 'L\'email è obbligatoria'

            });
           
        }

        if (!rating || isNaN(rating)) {
            console.log('❌ Rating mancante o non valido:', rating);
            return res.status(400).json({
                success: false,
                message: 'La tua valutazione è obbligatoria'

            });

        }//verifica rating tra 1 e 5

        if (!text || text.trim().length === 0) {
            console.log('❌ Testo mancante o vuoto');
            return res.status(400).json({
                success: false,
                message: 'Il testo della recensione è obbligatorio'

            });

        }

        const ratingNum= parseInt(rating);
        if (ratingNum < 1 || ratingNum > 5) {
            console.log('❌ Rating fuori range:', ratingNum);
            return res.status(400).json({
                success: false,
                message: 'La valutazione deve essere tra 1 e 5 stelle'

            });

        }


        if (rating < 3) {
            console.log('ℹ️ Recensione sotto 3 stelle');
            return res.status(400).json({
                success: false,  // Corretto da true a false
                message: 'Grazie per il tuo feedback'

            });

        }//filtro che accetti solo le recensioni da 3 stelle in su

        // Controllo duplicati: verifica se esiste una recensione recente con stesso email
        const recentReview = await Review.findOne({
            email: email.trim().toLowerCase(),
            createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Ultimi 5 minuti
        });
        if (recentReview) {
            console.log('⚠️ Recensione duplicata recente da:', email);
            return res.status(400).json({
                success: false,
                message: 'Hai già inviato una recensione recentemente. Riprova più tardi.'
            });
        }

        const review= new Review({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            rating: ratingNum,
            text: text.trim(),
            status: 'pending'

        });

        await review.save();
        console.log('✅ Nuova recensione salvata:', review._id);
        //crea recensione nel database

        try {
            await sendNewReviewEmail(review);
        } catch (emailError) {
            console.error('❌ Errore invio email all\'admin:', emailError);
        }

        // Invia email di conferma solo se non è l'email dell'admin (per evitare duplicati nei test)
        if (review.email.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase()) {
            try {
                await sendConfirmationEmail(review);
            } catch (emailError) {
                console.error('❌ Errore invio email al cliente:', emailError);
            }
        } else {
            console.log('ℹ️ Email cliente è quella dell\'admin, salta invio conferma');
        }

        res.status(201).json({
            success: true,
            message: 'Recensione inviata con successo! Riceverai una conferma via email.',
            reviewId: review._id

        });

    } catch (error) {
        console.error('❌ Errore creazione recensione:', error);

        if (error.name === 'ValidationError') {
        const errors= Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
            success: false,
            message: 'Dati non validi',
            errors

        });

      }

      res.status(500).json({
        success: false,
        message: 'Errore durante l\'invio della recensione'

      });

    }//invia conferma al cliente e gestisce gli errori 

});

router.put('/:id/approve', authenticateAdmin, async (req, res) => {
    try {
        const review= await Review.findByIdAndUpdate(
            req.params.id,
            {
                status: 'approved',
                approvedAt: new Date()
            },
            { new: true }

        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Recensione non trovata'

            });

        }
        console.log('✅ Recensione approvata:', review._id);

        res.json({
            success: true,
            message: 'Recensione approvata e pubblicata!',
            review

        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message

        });

    }

});//approva recensione (solo admin)

router.put('/:id/reject', authenticateAdmin, async (req, res) => {
    try {
        const review= await Review.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }

        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Recensione non trovata'

            });

        }
        console.log('❌ Recensione rifiutata:', review._id);

        res.json({
            success: true,
            message: 'Recensione rifiutata',
            review

        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message

        });

    }

});//rifiuta recensione (solo admin)

router.delete('/:id', authenticateAdmin, async (req, res) => {
    console.log('🗑️ Richiesta DELETE ricevuta per ID:', req.params.id);
    console.log('👤 Admin:', req.admin?.email);
    try {
        const review= await Review.findByIdAndDelete(req.params.id);
        if (!review) {
            console.log('❌ Recensione non trovata:', req.params.id);
            return res.status(404).json({
                success: false,
                message: 'Recensione non trovata'

            });

        }
        console.log('✅ Recensione eliminata:', review._id);

        res.json({
            success: true,
            message: 'Recensione eliminata'

        });

    } catch (error) {
        res.status(500).json({
            success: false, 
            message: error.message

        });

    }

});//elimina recensione (solo admin)

router.get('/stats', authenticateAdmin, async (req, res) => {
    try {
        const stats= {
            total: await Review.countDocuments(),
            pending: await Review.countDocuments({ status: 'pending' }),
            approved: await Review.countDocuments({ status: 'approved' }),
            rejected: await Review.countDocuments({ status: 'rejected' }),
            averageRating: 0

        };

        const approvedReviews= await Review.find({ status: 'approved' });
        if (approvedReviews.length > 0) {
            const sum= approvedReviews.reduce((acc, r) => acc + r.rating, 0);
            stats.averageRating= (sum / approvedReviews.length).toFixed(1);

        }

        res.json({ success: true, stats });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });

    }

});

module.exports= router; //statistiche (solo admin) e calcolo media voti recensioni approvate



