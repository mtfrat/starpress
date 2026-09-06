/**
 * Stripe Configuration Checker
 * Run this script to verify your Stripe setup is correct.
 *
 * Usage: node scripts/check-stripe.js
 */

const requiredVars = [
  { name: "STRIPE_SECRET_KEY", prefix: "sk_test_" },
  { name: "STRIPE_WEBHOOK_SECRET", prefix: "whsec_" },
  { name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", prefix: "pk_test_" },
  { name: "STRIPE_PRO_MONTHLY_PRICE_ID", prefix: "price_" },
  { name: "STRIPE_PRO_YEARLY_PRICE_ID", prefix: "price_" },
];

console.log("🔍 Checking Stripe configuration...\n");

const missing = [];
const invalid = [];

for (const { name, prefix } of requiredVars) {
  const value = process.env[name];

  if (!value) {
    missing.push(name);
    console.log(`  ❌ ${name} - NOT SET`);
  } else if (!value.startsWith(prefix)) {
    invalid.push({ name, expected: prefix, got: value.substring(0, 10) });
    console.log(`  ⚠️  ${name} - Invalid format (should start with ${prefix})`);
  } else {
    console.log(`  ✅ ${name} - OK`);
  }
}

console.log("");

if (missing.length === 0 && invalid.length === 0) {
  console.log("🎉 All Stripe variables are correctly configured!\n");
  console.log("Next steps:");
  console.log("  1. Make sure you've added the products in Stripe Dashboard");
  console.log("  2. Make sure webhook endpoint is configured");
  console.log("  3. Test with: npm run dev");
} else {
  if (missing.length > 0) {
    console.log(`❌ Missing ${missing.length} variable(s):`);
    missing.forEach((v) => console.log(`   - ${v}`));
    console.log("");
  }
  if (invalid.length > 0) {
    console.log(`⚠️  Invalid format for ${invalid.length} variable(s):`);
    invalid.forEach(({ name, expected }) =>
      console.log(`   - ${name} should start with "${expected}"`)
    );
    console.log("");
  }
  console.log("Fix these in your .env.local file and run again.");
}
