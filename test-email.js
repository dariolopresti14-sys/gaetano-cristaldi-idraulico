

require('dotenv').config();

const { sendNewReviewEmail } = require('./backend/config/email');
const testReview= {
    _id: 'test123',
    name: 'Mario Rossi',
    email: 'mario@test.it',
    rating: 5,
    text: 'Test invio email - Servizio eccellente!'

};

console.log('📧 Invio email di test...');

sendNewReviewEmail(testReview)
.then(() => {
    console.log('✅ Email test inviata con successo!');
    console.log('📬 Controlla la casella:', process.env.ADMIN_EMAIL);
    process.exit(0);

})
.catch(err => {
    console.error('❌ Errore:', err);
    process.exit(1);

});

