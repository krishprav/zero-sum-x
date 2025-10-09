import { z } from "zod";
export declare const credentailSchma: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
export declare const tradeSchema: z.ZodObject<{
    asset: z.ZodEnum<{
        BTC: "BTC";
        ETH: "ETH";
        SOL: "SOL";
    }>;
    type: z.ZodEnum<{
        buy: "buy";
        sell: "sell";
    }>;
    margin: z.ZodNumber;
    leverage: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<5>, z.ZodLiteral<10>, z.ZodLiteral<20>, z.ZodLiteral<100>]>;
    takeProfit: z.ZodOptional<z.ZodNumber>;
    stopLoss: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
//# sourceMappingURL=userschema.d.ts.map