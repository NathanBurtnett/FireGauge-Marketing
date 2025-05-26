
import { useSubscription } from '../components/hooks/useSubscription';

const PLAN_DETAILS: { [key: string]: { name: string; priceDisplay: string } } = {
  "price_1RSqV400HE2ZS1pmK1uKuTCe": { name: "Pilot 90", priceDisplay: "Free" },
  "price_1RSqVe00HE2ZS1pmDEo9KWsH": { name: "Essential", priceDisplay: "$39/mo" },
  "price_1RSqW500HE2ZS1pmn2qPRJ16": { name: "Essential (Annual)", priceDisplay: "$399/yr" },
  "price_1RSqWZ00HE2ZS1pmcp0iWhqg": { name: "Pro", priceDisplay: "$99/mo" },
  "price_1RSqWs00HE2ZS1pmkDdtxYdV": { name: "Pro (Annual)", priceDisplay: "$999/yr" },
  "price_1RSqXb00HE2ZS1pmNY4PlTA5": { name: "Contractor", priceDisplay: "$279/mo" },
  "price_1RSqY000HE2ZS1pmKSzq7p3i": { name: "Contractor (Annual)", priceDisplay: "$2,999/yr" },
  "price_1RSqYn00HE2ZS1pmrIORlH1Q": { name: "Enterprise", priceDisplay: "Custom" },
};

export const useSubscriptionData = () => {
  const subscriptionHook = useSubscription();
  
  const currentPlanName = subscriptionHook.subscription_tier && PLAN_DETAILS[subscriptionHook.subscription_tier]?.name 
                          ? PLAN_DETAILS[subscriptionHook.subscription_tier].name 
                          : (subscriptionHook.subscribed ? "Active Plan" : "No Plan");
                          
  const nextBillingDateFormatted = subscriptionHook.subscription_end 
    ? new Date(subscriptionHook.subscription_end).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : subscriptionHook.subscribed ? "See portal" : "N/A";

  return {
    ...subscriptionHook,
    currentPlanName,
    nextBillingDateFormatted,
    PLAN_DETAILS
  };
};
