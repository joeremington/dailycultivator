
import React from 'react';
import { PricingTier, TierType, AppUser } from '../types';

interface PricingPageProps {
  tiers: PricingTier[];
  currentUser: AppUser;
  onUpgrade: (tierId: TierType) => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ tiers, currentUser, onUpgrade }) => {
  const sortedTiers = [...tiers].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="py-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-[var(--text-color)] mb-4 tracking-tight">
          Cultivate Your Potential
        </h2>
        <p className="text-[var(--text-muted)] font-medium max-w-lg mx-auto">
          Choose the level of focus and impact that fits your lifestyle. Unlock AI coaching and unlimited tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {sortedTiers.map((tier) => (
          <div 
            key={tier.id}
            className={`relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-300 ${
              tier.isPopular 
                ? 'bg-[var(--surface-color)] border-[var(--primary-color)] shadow-2xl shadow-primary/10 scale-105 z-10' 
                : 'bg-[var(--surface-color)] border-gray-100 dark:border-gray-800'
            }`}
          >
            {tier.isPopular && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[var(--primary-color)] text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                Most Popular
              </span>
            )}

            <div className="mb-8">
              <div className="text-4xl mb-4">{tier.badge}</div>
              <h3 className="text-sm font-black text-[var(--primary-color)] uppercase tracking-widest mb-1">
                {tier.name}
              </h3>
              <p className="text-xl font-black text-[var(--text-color)] mb-2">
                {tier.identity.title}
              </p>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-4xl font-black text-[var(--text-color)]">${tier.price / 100}</span>
                <span className="text-[var(--text-muted)] font-bold text-sm">/mo</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2 font-medium leading-relaxed">{tier.identity.tagline}</p>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {tier.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-muted)] font-semibold">
                  <i className="fa-solid fa-circle-check text-[var(--primary-color)] mt-0.5 text-xs"></i>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => onUpgrade(tier.id)}
              disabled={currentUser.tier === tier.id}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                currentUser.tier === tier.id
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 cursor-default'
                  : 'bg-[var(--secondary-color)] text-gray-900 shadow-xl shadow-secondary/20 hover:scale-[1.02] active:scale-95'
              }`}
            >
              {currentUser.tier === tier.id ? 'Active Plan' : `Upgrade to ${tier.name}`}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-20 text-center">
         <p className="text-xs text-[var(--text-muted)] font-black uppercase tracking-[0.2em] mb-4">Trusted by 10,000+ Cultivators</p>
         <div className="flex justify-center gap-8 opacity-20 dark:opacity-40 grayscale dark:invert">
            <i className="fa-brands fa-google text-2xl"></i>
            <i className="fa-brands fa-apple text-2xl"></i>
            <i className="fa-brands fa-stripe text-2xl"></i>
            <i className="fa-brands fa-product-hunt text-2xl"></i>
         </div>
      </div>
    </div>
  );
};

export default PricingPage;
