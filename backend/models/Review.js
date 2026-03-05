

const mongoose= require('mongoose');

const reviewSchema= new mongoose.Schema({
    name: {
    type: String,
    required: [true, 'Il nome è obbligatorio'],
    trim: true,
    minlength: [2, 'Il nome deve avere almeno 2 caratteri'],
    maxlength: [100, 'Il nome non può superare 100 caratteri']
  },
  email: {
    type: String,
    required: [true, 'L\'email è obbligatoria'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email non valida']
  },
  rating: {
    type: Number,
    required: [true, 'La valutazione è obbligatoria'],
    min: [1, 'La valutazione minima è 1'],
    max: [5, 'La valutazione massima è 5']
  },
  text: {
    type: String,
    required: [true, 'Il testo della recensione è obbligatorio'],
    trim: true,
    minlength: [10, 'La recensione deve avere almeno 10 caratteri'],
    maxlength: [1000, 'La recensione non può superare 1000 caratteri']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
   createdAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  }
    
});//struttura di una recensione

reviewSchema.index({ status: 1, createdAt: -1 });
module.exports= mongoose.model('Review', reviewSchema);
//indici per velocizzare le query
//tutto ciò dice a mongoDB che una recensione deve avere nome, email, rating, testo, status e data di creazione

