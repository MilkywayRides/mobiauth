import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"

const termsContent = `
# Terms of Service

**Effective Date:** ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}

## 1. Acceptance of Terms

By accessing and using this service ("Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our Service.

## 2. Description of Service

Our Service provides AI-powered chat assistance, content generation, and related features. We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time.

## 3. User Accounts

### 3.1 Account Creation
- You must provide accurate and complete information when creating an account
- You are responsible for maintaining the confidentiality of your account credentials
- You must be at least 13 years old to use this Service

### 3.2 Account Security
- You are responsible for all activities that occur under your account
- Notify us immediately of any unauthorized use of your account
- We are not liable for any loss or damage arising from your failure to maintain account security

## 4. User Conduct

You agree not to:
- Use the Service for any illegal or unauthorized purpose
- Violate any laws in your jurisdiction
- Transmit any harmful code, viruses, or malicious software
- Attempt to gain unauthorized access to our systems
- Harass, abuse, or harm other users
- Impersonate any person or entity
- Collect or store personal data about other users

## 5. Intellectual Property

### 5.1 Our Content
All content, features, and functionality of the Service are owned by us and are protected by copyright, trademark, and other intellectual property laws.

### 5.2 User Content
- You retain ownership of content you submit to the Service
- By submitting content, you grant us a worldwide, non-exclusive license to use, reproduce, and display your content
- You represent that you have all necessary rights to the content you submit

## 6. AI-Generated Content

### 6.1 No Warranty
AI-generated content is provided "as is" without any warranty of accuracy, completeness, or reliability.

### 6.2 User Responsibility
You are solely responsible for verifying and using AI-generated content appropriately.

## 7. API Usage

If you use our API:
- You must comply with our API usage guidelines
- We may impose rate limits and usage restrictions
- We reserve the right to revoke API access at any time

## 8. Payment and Billing

### 8.1 Fees
Certain features may require payment. All fees are non-refundable unless otherwise stated.

### 8.2 Subscription
- Subscriptions automatically renew unless cancelled
- You can cancel your subscription at any time
- Cancellation takes effect at the end of the current billing period

## 9. Privacy

Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.

## 10. Disclaimer of Warranties

THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
- Merchantability
- Fitness for a particular purpose
- Non-infringement
- Accuracy or reliability

## 11. Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR:
- Any indirect, incidental, special, or consequential damages
- Loss of profits, data, or business opportunities
- Damages arising from your use or inability to use the Service

Our total liability shall not exceed the amount you paid us in the past 12 months.

## 12. Indemnification

You agree to indemnify and hold us harmless from any claims, damages, losses, or expenses arising from:
- Your use of the Service
- Your violation of these Terms
- Your violation of any rights of another party

## 13. Termination

### 13.1 By You
You may terminate your account at any time by contacting us or using account settings.

### 13.2 By Us
We may suspend or terminate your account if you:
- Violate these Terms
- Engage in fraudulent or illegal activities
- Pose a security risk to the Service

## 14. Changes to Terms

We reserve the right to modify these Terms at any time. We will notify you of material changes by:
- Posting the updated Terms on our website
- Sending an email notification
- Displaying a notice in the Service

Your continued use of the Service after changes constitutes acceptance of the modified Terms.

## 15. Governing Law

These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which we operate, without regard to conflict of law provisions.

## 16. Dispute Resolution

### 16.1 Informal Resolution
We encourage you to contact us first to resolve any disputes informally.

### 16.2 Arbitration
Any disputes that cannot be resolved informally shall be resolved through binding arbitration.

## 17. Severability

If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.

## 18. Entire Agreement

These Terms constitute the entire agreement between you and us regarding the Service and supersede all prior agreements.

## 19. Contact Information

If you have any questions about these Terms, please contact us at:
- Email: admin@blazeneuro.com

---

**Last Updated:** ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}
`

export default function TermsOfService() {
  return (
    <ScrollArea className="h-screen">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <ReactMarkdown>{termsContent}</ReactMarkdown>
        </article>
      </div>
    </ScrollArea>
  )
}
