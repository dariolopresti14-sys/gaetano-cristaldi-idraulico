

const jwt= require('jsonwebtoken');

function authenticateAdmin(req, res, next) {
    try {
        const authHeader= req.header('Authorization');

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Accesso negato. Token di autoindicazione mancante.'

            });

        }//prendi il token dal header authorization

        const token= authHeader.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Accesso negato. Token non valido.'

            });

        }//rimuovi bearer dal token

        const decoded= jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Accesso negato. Permessi insufficienti.'

            });

        }//verifica token jwt
        req.admin= {
            email: decoded.email,
            role: decoded.role

        };//aggiungi dati admin alla richiesta

        next();

    } catch (error) {
        console.error('❌ Errore autenticazione:', error.message);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token non valido'

            });

        }

        if (error.name === 'TokenExpireError') {
            return res.status(401).json({
                success: false,
                message: 'Token scaduto. Effettua nuovamente il login.'

            });

        }

        res.status(500).json({
            success: false,
            message: 'Errore durante la verifica dell\'autenticazione'

        });

    }

}

module.exports= { authenticateAdmin };