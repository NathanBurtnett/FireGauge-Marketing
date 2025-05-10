import React from 'react';
import { Check, X } from 'lucide-react'; // For checkmarks and X marks

interface FeatureDetail {
  name: string;
  basic: string | boolean;
  standard: string | boolean;
  professional: string | boolean;
  enterprise: string | boolean;
  tooltip?: string; // Optional tooltip for more info
}

interface FeatureCategory {
  name: string;
  features: FeatureDetail[];
}

const featureComparisonData: FeatureCategory[] = [
  {
    name: "Core Testing & Compliance",
    features: [
      { name: "Hose Testing (NFPA 1962)", basic: true, standard: true, professional: true, enterprise: true },
      { name: "Guided Pass/Fail Tests", basic: true, standard: true, professional: true, enterprise: true },
      { name: "Offline Mode & Auto-Sync", basic: true, standard: true, professional: true, enterprise: true },
      { name: "Barcode/QR Code Scanning Support", basic: "Limited", standard: true, professional: true, enterprise: true, tooltip: "Basic plan may have limits on scan types or frequency." },
      { name: "Ladder Inspections Module (NFPA 1932)", basic: "Add-on", standard: "Add-on", professional: "Add-on", enterprise: "Included Option" },
      { name: "Pump Testing Module (NFPA 1911)", basic: "Add-on", standard: "Add-on", professional: "Add-on", enterprise: "Included Option" },
    ]
  },
  {
    name: "Reporting & Documentation",
    features: [
      { name: "NFPA-Compliant PDF Reports", basic: "Standard Reports", standard: "Advanced Reports", professional: "Branded & Advanced", enterprise: "Fully Custom Reports" },
      { name: "Automated Email Delivery of Reports", basic: false, standard: true, professional: true, enterprise: true },
      { name: "CSV Data Exports", basic: true, standard: true, professional: true, enterprise: true },
      { name: "Digital Record Keeping", basic: true, standard: true, professional: true, enterprise: true },
      { name: "E-Signature Capture", basic: true, standard: true, professional: true, enterprise: true },
      { name: "Full Test History Archives", basic: "90-day Retention", standard: "1-Year Retention", professional: "Unlimited Retention", enterprise: "Unlimited Retention" },
      { name: "Audit Logs", basic: false, standard: true, professional: true, enterprise: true },
    ]
  },
  {
    name: "User & Asset Management",
    features: [
      { name: "Admin Users", basic: "1", standard: "2", professional: "3", enterprise: "Unlimited" },
      { name: "Inspector/Operator Users", basic: "1", standard: "5", professional: "10", enterprise: "Unlimited" },
      { name: "Hose Count Limit", basic: "≤ 75", standard: "Up to 500", professional: "Up to 2,000", enterprise: "Custom/Unlimited" },
      { name: "Asset Tracking (Other Equipment)", basic: false, standard: "Limited", professional: "Unlimited", enterprise: "Unlimited" },
      { name: "Role-Based Access Control", basic: false, standard: true, professional: true, enterprise: true },
    ]
  },
  {
    name: "Support & Onboarding",
    features: [
      { name: "Email Support", basic: true, standard: "Priority Email", professional: "Priority Email", enterprise: "Dedicated Support Channel" },
      { name: "Phone Support", basic: false, standard: false, professional: true, enterprise: true },
      { name: "Dedicated Account Manager", basic: false, standard: false, professional: false, enterprise: true },
      { name: "Knowledge Base & Tutorials", basic: true, standard: true, professional: true, enterprise: true },
      { name: "Standard Onboarding Assistance", basic: true, standard: true, professional: true, enterprise: false },
      { name: "White-Glove Onboarding & Data Migration", basic: false, standard: false, professional: "Paid Add-on", enterprise: true },
    ]
  },
  {
    name: "Integrations & Advanced Features",
    features: [
      { name: "Basic Integrations (e.g., QuickBooks)", basic: false, standard: true, professional: true, enterprise: "Custom Integrations" },
      { name: "API Access", basic: false, standard: false, professional: true, enterprise: true },
      { name: "SSO/LDAP Integration", basic: false, standard: false, professional: false, enterprise: true },
      { name: "Custom Branding Options (Reports/Portal)", basic: false, standard: false, professional: true, enterprise: true },
      { name: "Custom SLAs", basic: false, standard: false, professional: false, enterprise: true },
    ]
  }
];

const FeatureComparisonTable = () => {
  return (
    <section className="py-12 bg-white"> {/* Changed background for contrast if page is gray */}
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-firegauge-charcoal">
          Compare Plans & Features
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3 lg:w-2/5">Feature</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Basic</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Standard</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Professional</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Enterprise</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {featureComparisonData.map((category) => (
                <React.Fragment key={category.name}>
                  <tr>
                    <td colSpan={5} className="px-4 py-3 bg-gray-100">
                      <h3 className="text-lg font-semibold text-firegauge-charcoal">{category.name}</h3>
                    </td>
                  </tr>
                  {category.features.map((feature) => (
                    <tr key={feature.name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{feature.name}</td>
                      {[feature.basic, feature.standard, feature.professional, feature.enterprise].map((value, idx) => (
                        <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {typeof value === 'boolean' ? (
                            value ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-500 mx-auto" />
                          ) : (
                            value
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
          * "Add-on" features are available for an additional monthly fee on Basic, Standard, and Professional plans.
        </p>
      </div>
    </section>
  );
};

export default FeatureComparisonTable; 