const mongoose = require('mongoose');
const validator = require('validator');
const { DateTime } = require('luxon');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, escape: true },
    category: {
        type: String,
        required: true,
        enum: ['Astronomy', 'Science', 'Space', 'Education', 'Other']
    },
    startDateTime: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return (
                    validator.isISO8601(value.toISOString()) &&
                    validator.isAfter(value.toISOString(), DateTime.now().toISO())
                );
            },
            message: 'Start date must be a valid ISO 8601 date and after today.'
        }
    },
    endDateTime: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return validator.isISO8601(value.toISOString()) && value > this.startDateTime;
            },
            message: 'End date must be a valid ISO 8601 date and after the start date.'
        }
    },
    location: { type: String, required: true, trim: true, escape: true },
    details: { type: String, required: true, trim: true, escape: true },
    image: { type: String },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    isSeed: { type: Boolean, default: false, index: true }
}, { timestamps: true });

module.exports = mongoose.models.Event || mongoose.model('Event', eventSchema);

