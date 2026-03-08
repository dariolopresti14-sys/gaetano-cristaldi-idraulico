


const { Resend } = require('resend');

//const resend = new Resend(process.env.RESEND_API_KEY);

async function sendNewReviewEmail(Review) {
    console.log('🔑 RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'presente' : 'undefined');
    const resend= new Resend(process.env.RESEND_API_KEY);
    const starsHTML = '⭐'.repeat(Review.rating);
    
    try {
        await resend.emails.send({
            from: 'TermoIdraulica <onboarding@resend.dev>',
            to: process.env.ADMIN_EMAIL,
            subject: `🔔 Nuova Recensione da ${Review.name} (${Review.rating}⭐)`,
            html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
                .container { background: white; max-width: 600px; margin: 0 auto; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 30px; text-align: center; }
                .content { padding: 30px; }
                .info-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 5px; }
                .review-text { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; font-size: 16px; line-height: 1.6; font-style: italic; }
                .button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔔 Nuova Recensione Ricevuta!</h1>
                </div>
                <div class="content">
                  <div class="info-box">
                    <p><strong>👤 Cliente:</strong> ${Review.name}</p>
                    <p><strong>📧 Email:</strong> ${Review.email}</p>
                    <p><strong>⭐ Valutazione:</strong> ${starsHTML} (${Review.rating}/5)</p>
                    <p><strong>📅 Data:</strong> ${new Date().toLocaleString('it-IT')}</p>
                  </div>
                  <h3>💬 Recensione:</h3>
                  <div class="review-text">"${Review.text}"</div>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL}/admin" class="button">✅ Vai al Pannello Admin</a>
                  </div>
                </div>
              </div>
            </body>
            </html>
            `
        });
        console.log('✅ Email inviata a:', process.env.ADMIN_EMAIL);
        return { success: true };
    } catch (error) {
        console.error('❌ Errore invio email:', error);
        throw error;
    }
}

async function sendConfirmationEmail(Review) {
    const resend= new Resend(process.env.RESEND_API_KEY);
    try {
        await resend.emails.send({
            from: 'TermoIdraulica <onboarding@resend.dev>',
            to: Review.email,
            subject: '✅ Grazie per la tua recensione!',
            html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial; background: #f5f5f5; padding: 20px;">
            <div style="background: white; max-width: 600px; margin: 0 auto; border-radius: 10px; padding: 40px;">
              <h1 style="color: #1e3c72;">Ciao ${Review.name}! 👋</h1>
              <p style="font-size: 16px; line-height: 1.8;">
                Grazie mille per aver lasciato una recensione sulla tua esperienza con i nostri servizi.
              </p>
              <div style="text-align: center; font-size: 30px; color: #ffc107; margin: 20px 0;">
                ${'⭐'.repeat(Review.rating)}
              </div>
              <p style="font-size: 16px; line-height: 1.8;">
                La tua opinione è molto importante per noi! La recensione sarà pubblicata sul nostro sito dopo una breve verifica.
              </p>
              <p style="margin-top: 30px;">
                Cordiali saluti,<br>
                <strong>Gaetano Cristaldi</strong><br>
                Idraulico Professionista<br>
                📞 +39 3407195649
              </p>
            </div>
            </body>
            </html>
            `
        });
        console.log('✅ Email conferma inviata a:', Review.email);
    } catch (error) {
        console.error('❌ Errore invio conferma:', error);
    }
}

module.exports = {
    sendNewReviewEmail,
    sendConfirmationEmail
};

/*const nodemailer= require('nodemailer');

const transporter= nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    family: 4,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    
    }

});//crea transporter

transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Errore configurazione email:', error);
    } else {
        console.log('✅ Server email pronto');

    }

});//verifica configurazione

async function sendNewReviewEmail(Review) {
    const starsHTML= '⭐'.repeat(Review.rating);
    const mailOptions= {
        from: `"Sistema Recensioni" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `🔔 Nuova Recensione da ${Review.name} (${Review.rating}⭐)`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
         <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
          .container { background: white; max-width: 600px; margin: 0 auto; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .info-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .review-text { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; font-size: 16px; line-height: 1.6; font-style: italic; }
          .button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Nuova Recensione Ricevuta!</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <p><strong>👤 Cliente:</strong> ${Review.name}</p>
              <p><strong>📧 Email:</strong> ${Review.email}</p>
              <p><strong>⭐ Valutazione:</strong> ${starsHTML} (${Review.rating}/5)</p>
              <p><strong>📅 Data:</strong> ${new Date().toLocaleString('it-IT')}</p>
            </div>
            <h3>💬 Recensione:</h3>
            <div class="review-text">"${Review.text}"</div>
            <div style="text-align: center; margin: 30px 0;"> 
                <!-- usa la variabile FRONTEND_URL per evitare IP hardcoded -->
                <a href="${process.env.FRONTEND_URL.replace(/\/$/, '')}/admin" class="button">✅ Vai al Pannello Admin</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
    };

    try {
        const info= await transporter.sendMail(mailOptions);
        console.log('✅ Email inviata a:', process.env.ADMIN_EMAIL);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Errore invio email:', error);
        throw error;

    }

}//funzione per inviare email nuova recensione

async function sendConfirmationEmail(Review) {
    const mailOptions= {
        from: `"Gaetano Cristaldi Idraulico" <${process.env.EMAIL_USER}>`,
        to: Review.email,
        subject: '✅ Grazie per la tua recensione!',
        html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial; background: #f5f5f5; padding: 20px;">
        <div style="background: white; max-width: 600px; margin: 0 auto; border-radius: 10px; padding: 40px;">
          <h1 style="color: #1e3c72;">Ciao ${Review.name}! 👋</h1>
          <p style="font-size: 16px; line-height: 1.8;">
            Grazie mille per aver lasciato una recensione sulla tua esperienza con i nostri servizi.
          </p>
          <div style="text-align: center; font-size: 30px; color: #ffc107; margin: 20px 0;">
            ${'⭐'.repeat(Review.rating)}
          </div>
          <p style="font-size: 16px; line-height: 1.8;">
            La tua opinione è molto importante per noi! La recensione sarà pubblicata sul nostro sito dopo una breve verifica.
          </p>
          <p style="margin-top: 30px;">
            Cordiali saluti,<br>
            <strong>Gaetano Cristaldi</strong><br>
            Idraulico Professionista<br>
            📞 +39 340 7195649
          </p>
        </div>
       </body>
      </html>
        `

    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Email conferma inviata a:', Review.email);

    } catch (error) {
        console.error('❌ Errore invio conferma:', error);

    }

}

module.exports= {
    sendNewReviewEmail,
    sendConfirmationEmail

};*/







