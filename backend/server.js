

const express= require('express');
const mongoose= require('mongoose');
const cors= require('cors');
const dotenv= require('dotenv');
const path= require('path');

dotenv.config();//carica variabili ambiente
console.log('🔍 MONGODB_URI:', process.env.MONGODB_URI ? 'definita' : 'undefined');
console.log('🔍 Tutte le env:', Object.keys(process.env).filter(k => !k.includes('npm')));

console.log('🔗 FRONTEND_URL:', process.env.FRONTEND_URL);

console.log('🔍 MONGODB_URI:', process.env.MONGODB_URI ? 'definita' : 'undefined');

const app= express();//crea applicazione express

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend' )));

//middleware

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('✅ MongoDB connesso');
    console.log('📊 Database:', mongoose.connection.name);
})
.catch(err => {
    console.error('❌ Errore MongoDB:', err.message);
    process.exit(1);

});

//connessione database

const reviewRoutes= require('./routes/reviews');
const authRoutes= require('./routes/auth');
app.use('/api/reviews', reviewRoutes);
app.use('/api/auth', authRoutes);

//routes

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));

});
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin.html'));

});

//route principale

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint non trovato' });

});
app.use((err, req, res, next) => {
    console.error('❌ Errore:', err.stack);
    res.status(500).json({ success: false, message: 'Errore del server' });

});

//Gestione errori

const PORT= process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 ====================================');
  console.log(`🚀 Server avviato su http://localhost:${PORT}`);
  console.log(`🚀 Accessibile anche su http://192.168.0.174:${PORT}`);
  console.log('🚀 ====================================');

});

//Avvio del server
//con questo file accendo il server sulla porta 3000, mi connetto a mongoDB, servo i file html nella cartella frontend e gestisco gli eventuali errori

//gG147OiaszKQzaDL
//dariolopresti14_db_user
