import "server-only";

import Stripe from "stripe";
import { confidentialEnv } from "./env";

export const stripe = new Stripe(confidentialEnv.STRIPE_SECRET_KEY);
