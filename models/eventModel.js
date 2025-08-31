//models/eventModel.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title:     { type: String, required: true, trim: true },
    category:  { type: String, required: true, enum: ['Astronomy', 'Science', 'Space', 'Education', 'Other'] },
    startDateTime: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                if (this.isSeed) return true;
                return value instanceof Date && value.getTime() > Date.now();
            },
            message: 'Start date must be after now.'
        }
    },
    endDateTime: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                if (this.isSeed) return true;
                return value instanceof Date && this.startDateTime && value.getTime() > this.startDateTime.getTime();
            },
            message: 'End date must be after the start date.'
        }
    },
    location:  { type: String, required: true, trim: true },
    details:   { type: String, required: true, trim: true },
    image:     { type: String },
    host:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    isSeed:    { type: Boolean, default: false, index: true }
}, { timestamps: true });

eventSchema.index({ startDateTime: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ host: 1 });

module.exports = mongoose.models.Event || mongoose.model('Event', eventSchema);

