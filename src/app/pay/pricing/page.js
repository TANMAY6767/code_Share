
"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Users, Code } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/SharedCode/UI/Button';
import Card from '../../../components/SharedCode/UI/Card';
import { toast } from 'sonner';
import { useTheme } from '../../../contexts/ThemeContext';

const Pricing = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  const handleUpgrade = (plan) => {
    toast.success(`Redirecting to ${plan} checkout...`);
    // In a real app, this would redirect to Stripe checkout
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      icon: Code,
      features: [
        '2 repositories maximum',
        '3 files per repository',
        '2 folders per repository',
        'Basic code editor',
        'Public sharing only',
        'Live collaboration (FREE!)',
        'Community support'
      ],
      limitations: [
        'No private repositories',
        'Limited file storage'
      ],
      current: user?.plan === 'free',
      popular: false
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: 'per month',
      description: 'For professional developers',
      icon: Crown,
      features: [
        'Unlimited repositories',
        'Unlimited files & folders',
        'Live collaboration',
        'Private repositories',
        'Advanced code editor',
        'Custom domains',
        'Priority support',
        'Version history',
        'Team management',
        'Advanced sharing controls'
      ],
      limitations: [],
      current: user?.plan === 'pro',
      popular: true
    },
    {
      name: 'Team',
      price: '$19.99',
      period: 'per month',
      description: 'For growing teams',
      icon: Users,
      features: [
        'Everything in Pro',
        'Up to 10 team members',
        'Team workspaces',
        'Advanced permissions',
        'SSO authentication',
        'Admin dashboard',
        'Usage analytics',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee'
      ],
      limitations: [],
      current: false,
      popular: false
    }
  ];

  return (
    <div className={`min-h-screen py-12 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900' 
        : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Simple,
            </span>
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              {' '}Fair Pricing
            </span>
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Choose the perfect plan for your coding needs. 
            Upgrade or downgrade at any time with no hidden fees.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}
              
              <Card className={`p-8 h-full ${plan.popular ? 'ring-2 ring-blue-500' : ''} ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mb-4">
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {plan.name}
                  </h3>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    {plan.description}
                  </p>
                  <div className="mb-6">
                    <span className={`text-4xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {plan.price}
                    </span>
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                      {' '}{plan.period}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h4 className={`font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    What's included:
                  </h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto">
                  {plan.current ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : plan.name === 'Free' ? (
                    <Button variant="outline" className="w-full" disabled>
                      Always Free
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleUpgrade(plan.name)}
                      icon={plan.name === 'Pro' ? Crown : Users}
                    >
                      Upgrade to {plan.name}
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className={`text-3xl font-bold text-center mb-12 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                question: "Can I change plans anytime?",
                answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
              },
              {
                question: "What happens to my data if I downgrade?",
                answer: "Your data remains safe. If you exceed free plan limits, you'll have read-only access until you upgrade again."
              },
              {
                question: "Do you offer student discounts?",
                answer: "Yes! Students get 50% off Pro plans with a valid student email. Contact support for details."
              },
              {
                question: "Is there a free trial for Pro features?",
                answer: "New users get a 14-day free trial of Pro features when they sign up. No credit card required."
              }
            ].map((faq, index) => (
              <Card key={index} className={`p-6 ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <h3 className={`text-lg font-semibold mb-3 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {faq.question}
                </h3>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <h2 className={`text-3xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to supercharge your coding?
          </h2>
          <p className={`text-xl mb-8 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Join thousands of developers already using CodeUrl Pro
          </p>
          <Button size="lg" onClick={() => handleUpgrade('Pro')} icon={Crown}>
            Start Free Trial
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;