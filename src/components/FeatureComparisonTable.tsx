import React from 'react';
import { Check, X } from 'lucide-react';

interface FeatureDetail {
  name: string;
  pilot: string | boolean;
  essential: string | boolean;
  pro: string | boolean;
  contractor: string | boolean;
  enterprise: string | boolean;
}

interface FeatureCategory {
  name: string;
  features: FeatureDetail[];
}

const featureComparisonData: FeatureCategory[] = [
  {
    name: "Core Testing & Compliance",
    features: [
      { name: "Fire Hose Testing (NFPA 1962)", pilot: true, essential: true, pro: true, contractor: true, enterprise: true },
      { name: "Fire Hydrant Testing", pilot: true, essential: true, pro: true, contractor: true, enterprise: true },
      { name: "Ladder Testing (NFPA 1932)", pilot: true, essential: true, pro: true, contractor: true, enterprise: true },
      { name: "Pump Testing (NFPA 1911)", pilot: true, essential: true, pro: true, contractor: true, enterprise: true },
      { name: "Fire Extinguisher Testing", pilot: true, essential: true, pro: true, contractor: true, enterprise: true },
      { name: "Custom Equipment Types", pilot: true, essential: true, pro: true, contractor: true, enterprise: true },
      { name: "Pass/Fail Testing Workflow", pilot: true, essential: true, pro: true, contractor: true, enterprise: true },
      { name: "Offline Mode & Auto-Sync", pilot: true, essential: true, pro: true, contractor: true, enterprise: true },
    ]
  },
  {
    name: "Reporting & Documentation",
    features: [
      { name: "NFPA-Compliant PDF Reports", pilot: true, essential: true, pro: true, contractor: true, enterprise: true },
      { name: "CSV Data Exports", pilot: true, essential: true, pro: true, contractor: true, enterprise: true },
      { name: "Digital Record Keeping", pilot: true, essential: true, pro: true, contractor: true, enterprise: true },
      { name: "Test History & Archives", pilot: true, essential: true, pro: true, contractor: true, enterprise: true },
      { name: "Custom Branding Options", pilot: false, essential: false, pro: true, contractor: true, enterprise: true },
    ]
  },
  {
    name: "Asset & User Management",
    features: [
      { name: "Asset Limit", pilot: "100", essential: "300", pro: "1,500", contractor: "Unlimited", enterprise: "Unlimited" },
      { name: "User Accounts", pilot: "Unlimited", essential: "Unlimited", pro: "Unlimited", contractor: "Unlimited", enterprise: "Unlimited" },
      { name: "Role-Based Access Control", pilot: false, essential: false, pro: true, contractor: true, enterprise: true },
      { name: "Multi-Department Management", pilot: false, essential: false, pro: false, contractor: true, enterprise: true },
    ]
  },
  {
    name: "Support & Advanced Features",
    features: [
      { name: "Email Support", pilot: "Basic", essential: "Priority", pro: "Priority", contractor: "Priority", enterprise: "Dedicated" },
      { name: "Phone Support", pilot: false, essential: false, pro: true, contractor: true, enterprise: true },
      { name: "API Access", pilot: false, essential: false, pro: false, contractor: true, enterprise: true },
      { name: "Dedicated Account Manager", pilot: false, essential: false, pro: false, contractor: false, enterprise: true },
      { name: "Custom Integrations", pilot: false, essential: false, pro: false, contractor: false, enterprise: true },
    ]
  }
];

const FeatureComparisonTable = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-firegauge-charcoal">
          Compare Plans & Features
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3 lg:w-2/5">Feature</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pilot</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Essential</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pro</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Contractor</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Enterprise</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {featureComparisonData.map((category) => (
                <React.Fragment key={category.name}>
                  <tr>
                    <td colSpan={6} className="px-4 py-3 bg-gray-100">
                      <h3 className="text-lg font-semibold text-firegauge-charcoal">{category.name}</h3>
                    </td>
                  </tr>
                  {category.features.map((feature) => (
                    <tr key={feature.name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{feature.name}</td>
                      {[feature.pilot, feature.essential, feature.pro, feature.contractor, feature.enterprise].map((value, idx) => (
                        <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {typeof value === 'boolean' ? (
                            value ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-500 mx-auto" />
                          ) : (
                            <span className={typeof value === 'string' && value.includes('Unlimited') ? 'font-semibold text-green-600' : ''}>{value}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          * All plans include unlimited user accounts. Only asset limits vary by plan.
        </p>
      </div>
    </section>
  );
};

export default FeatureComparisonTable; 