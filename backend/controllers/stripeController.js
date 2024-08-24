const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/user');
const sendEmail = require('../utils/sendEmail');


//show subscriptions
exports.listOfSubcription = async (req, res) => {
    const prices = await stripe.prices.list({
        //apiKey: process.env.STRIPE_SECRET_KEY,
    });
    //console.log('prices', prices)
    return res.json(prices);
}

// create subscription for premium plan
exports.subscribeToPlan = async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    let customer = '';
    if (user && user.stripeCustomerId === undefined) {
        customer = await stripe.customers.create({
            metadata: {
                userId: req.user.id,
                email: req.user.email
            }
        });
        user.stripeCustomerId = customer.id;
        await user.save({ validateBeforeSave: false });
    }

    const planId = req.body.planId;

    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ["card"],
        line_items: [
            {
                price: planId,
                quantity: 1,
            },
        ],
        customer: customer !== '' ? customer.id : user.stripeCustomerId,
        success_url: `${process.env.BASE_URL}/user/plan`,
        cancel_url: `${process.env.BASE_URL}/payment/cancel`,
    });

    return res.send({ url: session.url });
}



//event subscription monitoring
exports.subscriptionEvent = async (req, res, next) => {
    // This is your Stripe CLI webhook secret for testing your endpoint locally.

    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = await stripe.webhooks.constructEvent(req.body, sig, process.env.WEBHOOKS_SECRET);
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    // const data = event.data.object;
    // console.log(event.type, data);

    // Handle the event
    switch (event.type) {
        case 'customer.subscription.created':
            const subscription = event.data.object;
            //console.log("create sub event data object", subscription.customer);
            const user = await User.findOne({ stripeCustomerId: subscription.customer }).select('-password');

            if (subscription.plan.id === "price_1NU9MuHGRVR8FaKwByfehQWh") {
                user.plan = "Starter";
            }
            if (subscription.plan.id === "price_1NU9NkHGRVR8FaKwlWOkhEh3") {
                user.plan = "Pro";
            }
            if (subscription.plan.id === "price_1NU9OXHGRVR8FaKwrCMmy0qn") {
                user.plan = "Premium";
            }
            await user.save({ validateBeforeSave: false });
            console.log("subscription created")
            // Then define and call a function to handle the event customer.subscription.created
            break;
        case 'customer.subscription.deleted':
            const customerSubscriptionDeleted = event.data.object;
            // Then define and call a function to handle the event customer.subscription.deleted
            const userDeleteSubscription = await User.findOne({ stripeCustomerId: customerSubscriptionDeleted.customer }).select('-password');
            userDeleteSubscription.plan = "none";
            await userDeleteSubscription.save({ validateBeforeSave: false });
            console.log("subscription deleted")
            break;

        case 'customer.subscription.trial_will_end':
            const customerTrialWillEnd = event.data.object;
            // Then define and call a function to handle the event customer.subscription.trial_will_end
            console.log("trial ended");
            break;
        case 'customer.subscription.updated':
            const subscriptionUpdate = event.data.object;

            // console.log("update object", subscriptionUpdate.customer)
            const userUpdate = await User.findOne({ stripeCustomerId: subscriptionUpdate.customer }).select('-password');


            if (subscriptionUpdate.status === 'active') {
                if (subscriptionUpdate.plan.id === "price_1NU9MuHGRVR8FaKwByfehQWh") {
                    userUpdate.plan = "Starter";
                }
                if (subscriptionUpdate.plan.id === "price_1NU9NkHGRVR8FaKwlWOkhEh3") {
                    userUpdate.plan = "Pro";
                }
                if (subscriptionUpdate.plan.id === "price_1NU9OXHGRVR8FaKwrCMmy0qn") {
                    userUpdate.plan = "Premium";
                }
            }

            if (subscriptionUpdate.status === 'canceled') {
                userUpdate.plan = "none";
            }
            if (subscriptionUpdate.status === 'unpaid') {
                userUpdate.plan = "none";
            }
            if (subscriptionUpdate.status === 'past_due') {
                userUpdate.plan = "none";
            }
            if (subscriptionUpdate.status === 'paused') {
                userUpdate.plan = "none";
            }

            // here you can choose to have one source of true which is stripe
            // by saving the status each time server send notification
            const subscriptionStatus = await stripe.subscriptions.retrieve(
                subscriptionUpdate.id
            );
            userUpdate.stripePlanStatus = subscriptionStatus;

            await userUpdate.save({ validateBeforeSave: false });

            // here you can send email update, you can send html MSG as well.
            try {
                await sendEmail({
                    email: userUpdate.email,
                    subject: 'Plan Update',
                    message: "You've just updated your status on Our App"
                })
            } catch (error) {
                console.log(error)
            }
            break;
        // // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 res to acknowledge receipt of the event
    res.send();
}

exports.manageSubscription = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (user && user.stripeCustomerId) {
            const session = await stripe.billingPortal.sessions.create({
                customer: user.stripeCustomerId,
                return_url: `${process.env.BASE_URL}/user/plan`,
            });
            res.json(session.url);
        }
    } catch (error) {
        console.log(error);
    }
}


