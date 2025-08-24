# Supabase Edge Function Price Map

To avoid coupling Stripe price IDs to frontend env files, configure function-level secrets that map planId and billingCycle to price IDs.

Example (test mode):

```
supabase secrets set \
  --project-ref juznipgitbmtfmoszzek \
  PRICE_MAP_TEST_JSON='{"pilot":{"monthly":"price_1RzSf600HE2ZS1pmADvYanGg","annual":"price_1RzSfC00HE2ZS1pmC8dKolHF"},"essential":{"monthly":"price_1RzSdr00HE2ZS1pmOkB7FKD5","annual":"price_1RzSe000HE2ZS1pmTAtpKQmK"},"pro":{"monthly":"price_1RzSeY00HE2ZS1pm8gRweTz9","annual":"price_1RzSed00HE2ZS1pmJlmkMgPS"},"contractor":{"monthly":"price_1RzSep00HE2ZS1pmeQmeh30A","annual":"price_1RzSex00HE2ZS1pm82hgE3c7"}}'
```

For production, set:

```
supabase secrets set \
  --project-ref juznipgitbmtfmoszzek \
  PRICE_MAP_LIVE_JSON='{}' \
  STRIPE_MODE='live'
```

Then redeploy:

```
supabase functions deploy create-checkout
```
