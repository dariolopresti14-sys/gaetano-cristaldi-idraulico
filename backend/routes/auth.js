

const express= require('express');
const router= express.Router();
const bcrypt= require('bcryptjs');
const jwt= require('jsonwebtoken');

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email e password sono obbligatori'

            });

        }//validazioni input

        if (email.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase()) {
            return res.status(401).json({
                success: false,
                message: 'Credenziali non valide'

            });

        }//verifica email admin
        const isValidPassword= await bcrypt.compare(
            password,
            process.env.ADMIN_PASSWORD_HASH

        );
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenziali non valide'

            });

        }//verifica password

        const token= jwt.sign(
            {
                email: email.toLowerCase(),
                role: 'admin',
                timestamp: Date.now()
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h'}

        );
        console.log('✅ Login admin effettuato:', email);

        res.json({
            success: true,
            message: 'Login effettuato con successo',
            token,
            admin: {
                email: email.toLowerCase(),
                role: 'admin'
            }

        });

    } catch (error) {
        console.error('❌ Errore login:', error);
        res.status(500).json({
            success: false,
            message: 'Errore durante il login'

        });

    }

});//genera jwt token valido per 24h

router.post('/verify', async (req, res) => {
    try {
        const token= req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token mancante'

            });

        }

        const decoded= jwt.verify(token, process.env.JWT_SECRET);

        res.json({
            success: true,
            message: 'Token valido',
            admin: {
                email: decoded.email,
                role: decoded.role
            }

        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token non valido o scaduto'

        });

    }

});//verifica token

router.post('/generate-hash', async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password richiesta'

            });

        }
        const hash= await bcrypt.hash(password, 10);

        res.json({
            success: true,
            hash,
            message: 'Copia questo hash nel file .env come ADMIN_PASSWORD_HASH'

        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message

        });

    }

});

module.exports= router;