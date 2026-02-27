import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"

const privacyContent = `
# Privacy Policy

**Effective Date:** ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}

## 1. Introduction

We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.

## 2. Information We Collect

### 2.1 Information You Provide
- **Account Information:** Name, email address, password
- **Profile Information:** Profile picture, bio, preferences
- **Payment Information:** Billing address, payment method details (processed securely by third-party payment processors)
- **Communications:** Messages, feedback, and support requests

### 2.2 Automatically Collected Information
- **Usage Data:** Pages visited, features used, time spent, click patterns
- **Device Information:** IP address, browser type, operating system, device identifiers
- **Cookies and Tracking:** We use cookies and similar technologies to track activity and preferences
- **Log Data:** Server logs, error reports, performance data

### 2.3 AI Interaction Data
- **Chat History:** Conversations with AI assistants
- **Generated Content:** AI-generated text, images, or other outputs
- **Feedback:** Ratings and comments on AI responses

### 2.4 Third-Party Information
We may receive information about you from third-party services when you:
- Sign in using OAuth providers (Google, GitHub, etc.)
- Integrate third-party applications
- Use social media features

## 3. How We Use Your Information

We use your information to:

### 3.1 Provide and Improve Services
- Operate and maintain the Service
- Process transactions and send notifications
- Provide customer support
- Improve AI models and features
- Personalize your experience

### 3.2 Communication
- Send service-related announcements
- Respond to your inquiries
- Send marketing communications (with your consent)
- Notify you of updates and new features

### 3.3 Security and Compliance
- Detect and prevent fraud
- Ensure platform security
- Comply with legal obligations
- Enforce our Terms of Service

### 3.4 Analytics and Research
- Analyze usage patterns and trends
- Conduct research and development
- Generate aggregated statistics

## 4. How We Share Your Information

### 4.1 We Do Not Sell Your Data
We do not sell, rent, or trade your personal information to third parties.

### 4.2 Service Providers
We may share information with trusted third-party service providers who assist us in:
- Cloud hosting and storage
- Payment processing
- Email delivery
- Analytics and monitoring
- Customer support

### 4.3 Legal Requirements
We may disclose information when required by law or to:
- Comply with legal processes
- Protect our rights and property
- Prevent fraud or security issues
- Protect user safety

### 4.4 Business Transfers
If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.

### 4.5 With Your Consent
We may share information with third parties when you explicitly consent.

## 5. Data Security

### 5.1 Security Measures
We implement industry-standard security measures including:
- **Encryption:** Data encrypted in transit (TLS/SSL) and at rest (AES-256-GCM)
- **Access Controls:** Role-based access and authentication
- **Monitoring:** Continuous security monitoring and logging
- **Regular Audits:** Security assessments and penetration testing

### 5.2 API Keys
User-provided API keys are encrypted using AES-256-GCM encryption before storage.

### 5.3 Limitations
No method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.

## 6. Data Retention

### 6.1 Active Accounts
We retain your information as long as your account is active or as needed to provide services.

### 6.2 Deleted Accounts
When you delete your account:
- Personal information is deleted within 30 days
- Some data may be retained for legal or legitimate business purposes
- Aggregated, anonymized data may be retained indefinitely

### 6.3 Legal Requirements
We may retain information longer if required by law or for legal proceedings.

## 7. Your Rights and Choices

### 7.1 Access and Portability
You have the right to:
- Access your personal information
- Request a copy of your data
- Export your data in a portable format

### 7.2 Correction and Update
You can update your information through account settings or by contacting us.

### 7.3 Deletion
You can request deletion of your account and personal information.

### 7.4 Opt-Out
You can opt out of:
- Marketing communications (unsubscribe links provided)
- Non-essential cookies (browser settings)
- Data collection for analytics (account settings)

### 7.5 Do Not Track
We currently do not respond to Do Not Track signals.

## 8. Cookies and Tracking Technologies

### 8.1 Types of Cookies
- **Essential Cookies:** Required for basic functionality
- **Preference Cookies:** Remember your settings and preferences
- **Analytics Cookies:** Help us understand usage patterns
- **Marketing Cookies:** Used for targeted advertising (with consent)

### 8.2 Managing Cookies
You can control cookies through your browser settings. Note that disabling cookies may affect functionality.

## 9. Third-Party Services

### 9.1 OAuth Providers
When you sign in using third-party services (Google, GitHub), we receive limited information as permitted by those services.

### 9.2 AI Providers
We may use third-party AI services (OpenAI, Anthropic, Google). Your interactions may be subject to their privacy policies.

### 9.3 Analytics
We use analytics services (e.g., Google Analytics) to understand usage. These services may collect information about your activities.

## 10. International Data Transfers

Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.

## 11. Children's Privacy

### 11.1 Age Requirement
Our Service is not intended for children under 13. We do not knowingly collect information from children under 13.

### 11.2 Parental Notice
If we learn we have collected information from a child under 13, we will delete it promptly.

## 12. California Privacy Rights (CCPA)

California residents have additional rights:
- Right to know what personal information is collected
- Right to know if personal information is sold or disclosed
- Right to opt-out of the sale of personal information
- Right to deletion
- Right to non-discrimination

## 13. European Privacy Rights (GDPR)

If you are in the European Economic Area, you have rights under GDPR:
- Right to access
- Right to rectification
- Right to erasure
- Right to restrict processing
- Right to data portability
- Right to object
- Right to withdraw consent

## 14. Changes to This Policy

### 14.1 Updates
We may update this Privacy Policy from time to time. We will notify you of material changes by:
- Posting the updated policy on our website
- Sending email notifications
- Displaying in-app notices

### 14.2 Continued Use
Your continued use of the Service after changes constitutes acceptance of the updated policy.

## 15. Contact Us

If you have questions or concerns about this Privacy Policy, please contact us:

- **Email:** admin@blazeneuro.com
- **Data Protection Officer:** ankit@blazeneuro.com

For GDPR-related inquiries, you may also contact your local data protection authority.

---

**Last Updated:** ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}
`

export default function PrivacyPolicy() {
  return (
    <ScrollArea className="h-screen">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <ReactMarkdown>{privacyContent}</ReactMarkdown>
        </article>
      </div>
    </ScrollArea>
  )
}
