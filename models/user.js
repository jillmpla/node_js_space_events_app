//models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Invalid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 64
    },
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    rsvps:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'RSVP' }]
}, { timestamps: true });

//hash & salt password before saving (only when modified)
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

//compare a candidate password
userSchema.methods.comparePassword = function (candidate) {
    return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);


