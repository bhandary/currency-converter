export const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR'] as const;

export type CurrencyCode = (typeof currencies)[number];
