const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const userSchema = new mongoose.Schema({

    name: {
        type: String,
        trim: true,
        required: [true, 'Complete name'],
        maxlength: 80
    },

    email: {
        type: String,
        trim: true,
        required: [true, 'E-mail is required'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Enter a valid email'
        ]
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must contain six (6) characters'],
        match: [/^(?=.*\d)(?=.*[@#\-_$%^&+=§!\?])(?=.*[a-z])(?=.*[A-Z])[0-9A-Za-z@#\-_$%^&+=§!\?]+$/,
            'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 digit and 1 special character'
        ],
    },

    isAdmin: {
        type: Boolean,
        default: false,
        required: true
    },

    plan: {
        type: String,
        enum: ["Starter", "Pro", "Premium", "none"],
        default: "none",
    },
    stripeCustomerId: String,
    stripePlanStatus: {}


}, { timestamps: true })



// Encrypting password before saving user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }

    this.password = await bcrypt.hash(this.password, 10)
})

// Compare user password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}


// Return JWT token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
        expiresIn: 3600
    });
}



module.exports = mongoose.model("User", userSchema);