import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function createProducts() {
  // Crear productos y precios
  const products = {
    APRENDIZ: await stripe.products.create({
      name: "Plan Aprendiz",
      description: "Plan gratuito para comenzar",
      metadata: {
        plan_type: "APRENDIZ",
      },
    }),
    ENTRENADOR: await stripe.products.create({
      name: "Plan Entrenador",
      description: "Para coleccionistas serios",
      metadata: {
        plan_type: "ENTRENADOR",
      },
    }),
    MAESTRO: await stripe.products.create({
      name: "Plan Maestro",
      description: "Para coleccionistas profesionales",
      metadata: {
        plan_type: "MAESTRO",
      },
    }),
  };

  // Crear precios con el mismo intervalo de facturación y metadata consistente
  const prices = {
    APRENDIZ: await stripe.prices.create({
      product: products.APRENDIZ.id,
      unit_amount: 0,
      currency: "eur",
      recurring: {
        interval: "month",
        usage_type: "licensed",
      },
      metadata: {
        plan_type: "aprendiz", // Nota: en minúsculas para consistencia con la BD
      },
    }),
    ENTRENADOR: await stripe.prices.create({
      product: products.ENTRENADOR.id,
      unit_amount: 500, // 5€
      currency: "eur",
      recurring: {
        interval: "month",
        usage_type: "licensed",
      },
      metadata: {
        plan_type: "entrenador", // Nota: en minúsculas para consistencia con la BD
      },
    }),
    MAESTRO: await stripe.prices.create({
      product: products.MAESTRO.id,
      unit_amount: 1000, // 10€
      currency: "eur",
      recurring: {
        interval: "month",
        usage_type: "licensed",
      },
      metadata: {
        plan_type: "maestro", // Nota: en minúsculas para consistencia con la BD
      },
    }),
  };

  return { products, prices };
}

createProducts().then(console.log).catch(console.error);
