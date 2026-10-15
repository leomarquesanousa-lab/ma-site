export type PaymentMethod = "PIX" | "CARD" | "BOLETO";
export interface PaymentGateway {
  createIntent(input: { orderId: string; amountCents: number; method: PaymentMethod; idempotencyKey: string }): Promise<{ providerReference: string; checkoutUrl?: string }>;
  verifyNotification(rawBody: Uint8Array, signature: string): Promise<{ providerReference: string; status: "PENDING" | "CONFIRMED" | "FAILED" | "REFUNDED" }>;
}
export interface ShippingProvider {
  quote(input: { postalCode: string; items: { weightGrams: number; quantity: number }[] }): Promise<{ service: string; amountCents: number; estimatedDays: number }[]>;
}
// No provider is enabled until credentials, webhook verification and operational rules are configured.
export const paymentGateway: PaymentGateway | null = null;
export const shippingProvider: ShippingProvider | null = null;
