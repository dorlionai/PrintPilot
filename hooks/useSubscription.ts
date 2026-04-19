import { useState, useEffect } from 'react';
import { getSubscriptionStatus } from '../services/subscriptionService';

type Plan = 'free' | 'standard' | 'dealer';

export function useSubscription() {
  const [plan, setPlan] = useState<Plan>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubscriptionStatus()
      .then(p => setPlan(p as Plan))
      .finally(() => setLoading(false));
  }, []);

  const isPremium = plan !== 'free';
  const isDealer = plan === 'dealer';
  const canCalculate = isPremium; // Free: limit var, premium: sınırsız

  return { plan, loading, isPremium, isDealer, canCalculate };
}