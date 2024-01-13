import Stripe from "stripe";
import express, { Request, Response } from "express";
import { getEmailForUser } from "../auth/auth.core";
import * as core from "express-serve-static-core";
import assert from "assert";
import { stripeCallback } from "./subscriptions.callback";

let _stripe: undefined | Stripe = undefined

export const initializeStripe = (app: core.Express) => {
    if (process.env.STRIPE_KEY != undefined) {
        assert(process.env.STRIPE_PRICE_A !== undefined);
        assert(process.env.STRIPE_PRICE_B !== undefined);
        assert(process.env.STRIPE_PRICE_C !== undefined);
        assert(process.env.STRIPE_WEBHOOK_SECRET !== undefined);
        assert(process.env.PLUS_ROOT_URL !== undefined);

        _stripe = new Stripe(process.env.STRIPE_KEY, { apiVersion: "2022-11-15" })

        // Handle webhook before we parse the body as json
        app.post("/v1/subscription/callback", express.raw({ type: 'application/json' }), stripeCallback)
    }
}

export const getStripe = () => _stripe;