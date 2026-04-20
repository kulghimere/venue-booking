import React from 'react';
import { Link } from 'react-router-dom';
import styles from './LegalPage.module.css';

const sections = [
  {
    id: 's1', num: '1', title: 'Who We Are',
    content: (
      <>
        <p>VenueBook ("we", "us", "our") is a venue booking platform developed as part of an MSc IT project at the University of the West of Scotland. This Privacy Policy explains how we collect, use, store, and protect your personal data when you use our platform at <strong>venuebook.co.uk</strong>.</p>
        <p>We are committed to protecting your privacy and handling your data in accordance with the <strong>UK General Data Protection Regulation (UK GDPR)</strong> and the <strong>Data Protection Act 2018</strong>.</p>
        <div className={styles.highlight}>We will never sell your personal data to third parties. Your data is used solely to operate and improve the VenueBook platform.</div>
      </>
    ),
  },
  {
    id: 's2', num: '2', title: 'Data We Collect',
    content: (
      <>
        <p>We collect the following categories of personal data:</p>
        <p><strong>Account Information</strong></p>
        <ul>
          <li>Full name (first and last)</li>
          <li>Email address</li>
          <li>Phone number (international format)</li>
          <li>Password (stored as a secure bcrypt hash — never in plain text)</li>
          <li>Account role (Guest, Venue Owner, or Administrator)</li>
        </ul>
        <p><strong>Booking Information</strong></p>
        <ul>
          <li>Venue booked, event type and title, date, time, and guest count</li>
          <li>Special requests submitted with a booking</li>
          <li>Booking history and status (pending, confirmed, completed, cancelled)</li>
          <li>Total price paid per booking</li>
        </ul>
        <p><strong>Venue Listings (Owners only)</strong></p>
        <ul>
          <li>Venue name, description, category, capacity, and pricing</li>
          <li>Location (address, city, country, and optional GPS coordinates)</li>
          <li>Uploaded venue photographs</li>
          <li>Amenities, rules, and cancellation policy</li>
        </ul>
        <p><strong>Usage Data</strong></p>
        <ul>
          <li>Pages visited, search queries, and filters applied</li>
          <li>Device type, browser, and approximate location (city-level)</li>
          <li>Timestamps of logins and key actions</li>
        </ul>
      </>
    ),
  },
  {
    id: 's3', num: '3', title: 'How We Use Your Data',
    content: (
      <>
        <p>We process your data for the following purposes:</p>
        <ul>
          <li><strong>Account management:</strong> To create, verify, and maintain your account, and to authenticate your identity on login.</li>
          <li><strong>Bookings:</strong> To process venue booking requests, confirmations, cancellations, and refunds.</li>
          <li><strong>AI Recommendations:</strong> To generate personalised venue suggestions based on your booking history, preferences, and search behaviour using our machine learning model.</li>
          <li><strong>Communications:</strong> To send booking confirmations, reminders, edit request notifications, and account-related emails (e.g. email verification, password reset).</li>
          <li><strong>Platform safety:</strong> To detect and prevent fraudulent activity, abuse, or violations of our Terms of Service.</li>
          <li><strong>Analytics:</strong> To understand how the platform is used and to improve features, performance, and user experience.</li>
          <li><strong>Legal compliance:</strong> To meet our obligations under applicable law.</li>
        </ul>
      </>
    ),
  },
  {
    id: 's4', num: '4', title: 'Legal Basis for Processing',
    content: (
      <>
        <p>Under UK GDPR, we rely on the following lawful bases for processing your personal data:</p>
        <ul>
          <li><strong>Contract performance:</strong> Processing your booking data, account details, and payments is necessary to provide the service you have requested.</li>
          <li><strong>Legitimate interests:</strong> Improving the platform, detecting fraud, and generating personalised recommendations — balanced against your rights and interests.</li>
          <li><strong>Legal obligation:</strong> Retaining records as required by applicable law (e.g. financial records for taxation purposes).</li>
          <li><strong>Consent:</strong> For optional marketing emails, if you choose to opt in. You may withdraw consent at any time.</li>
        </ul>
      </>
    ),
  },
  {
    id: 's5', num: '5', title: 'Data Sharing',
    content: (
      <>
        <p>We share personal data only in limited circumstances:</p>
        <ul>
          <li><strong>With venue owners:</strong> When you make a booking, the venue owner receives your name, email, phone number, and event details to facilitate the booking.</li>
          <li><strong>With guests (owners only):</strong> Venue owners can see booking details for events at their venues, including guest names and contact information.</li>
          <li><strong>Service providers:</strong> We use third-party services for email delivery (e.g. Gmail SMTP) and database hosting (MongoDB Atlas). These providers process data on our behalf under data processing agreements and may not use your data for their own purposes.</li>
          <li><strong>Legal requirements:</strong> We may disclose data if required to do so by law, court order, or to protect the rights and safety of our users or the public.</li>
        </ul>
        <div className={styles.highlight}>We do not share, sell, rent, or trade your personal data with third parties for marketing purposes.</div>
      </>
    ),
  },
  {
    id: 's6', num: '6', title: 'Data Retention',
    content: (
      <>
        <p>We retain your personal data for as long as your account is active or as needed to provide the service. Specific retention periods:</p>
        <ul>
          <li><strong>Account data:</strong> Retained for the lifetime of your account, plus 30 days after deletion to allow recovery.</li>
          <li><strong>Booking records:</strong> Retained for 7 years to comply with financial and legal recordkeeping obligations.</li>
          <li><strong>Email verification tokens:</strong> Expire and are deleted within 24 hours of creation.</li>
          <li><strong>Password reset tokens:</strong> Expire and are deleted within 15 minutes of creation.</li>
          <li><strong>Usage logs:</strong> Retained for up to 12 months for security and analytics purposes.</li>
        </ul>
        <p>When data is no longer required, it is securely deleted from our systems and backups within 90 days.</p>
      </>
    ),
  },
  {
    id: 's7', num: '7', title: 'Cookies and Tracking',
    content: (
      <>
        <p>VenueBook uses the following types of storage:</p>
        <ul>
          <li><strong>localStorage (authentication token):</strong> We store your JSON Web Token (JWT) in browser localStorage to keep you logged in. This token expires after 7 days.</li>
          <li><strong>Session data:</strong> No persistent session cookies are used beyond the JWT.</li>
        </ul>
        <p>We do not currently use advertising cookies, third-party tracking pixels, or analytics cookies. If this changes, we will update this policy and request your consent where required.</p>
      </>
    ),
  },
  {
    id: 's8', num: '8', title: 'Data Security',
    content: (
      <>
        <p>We take the security of your personal data seriously and implement the following measures:</p>
        <ul>
          <li><strong>Password hashing:</strong> All passwords are hashed using bcrypt with a cost factor of 12 — plain text passwords are never stored.</li>
          <li><strong>JWT authentication:</strong> Signed tokens with a 7-day expiry are used for session management.</li>
          <li><strong>HTTPS:</strong> All data in transit is encrypted using TLS.</li>
          <li><strong>Rate limiting:</strong> API endpoints are rate-limited to protect against brute-force and denial-of-service attacks.</li>
          <li><strong>Input validation:</strong> All user inputs are validated and sanitised on both the frontend and backend.</li>
          <li><strong>Security headers:</strong> HTTP security headers (via Helmet.js) are applied to all responses.</li>
        </ul>
        <p>Despite these measures, no system is completely secure. If you suspect your account has been compromised, please change your password immediately and contact us.</p>
      </>
    ),
  },
  {
    id: 's9', num: '9', title: 'Your Rights',
    content: (
      <>
        <p>Under UK GDPR, you have the following rights regarding your personal data:</p>
        <ul>
          <li><strong>Right of access:</strong> Request a copy of the personal data we hold about you.</li>
          <li><strong>Right to rectification:</strong> Request correction of inaccurate or incomplete data. You can update most account details directly in your profile settings.</li>
          <li><strong>Right to erasure ("right to be forgotten"):</strong> Request deletion of your account and personal data, subject to legal retention obligations.</li>
          <li><strong>Right to restrict processing:</strong> Request that we limit how we use your data in certain circumstances.</li>
          <li><strong>Right to data portability:</strong> Request a copy of your data in a structured, machine-readable format.</li>
          <li><strong>Right to object:</strong> Object to processing based on legitimate interests, including the use of your data for AI recommendations.</li>
          <li><strong>Right to withdraw consent:</strong> If we rely on consent for any processing, you may withdraw it at any time without affecting prior processing.</li>
        </ul>
        <p>To exercise any of these rights, contact us at <strong>privacy@venuebook.co.uk</strong>. We will respond within 30 days. You also have the right to lodge a complaint with the <strong>Information Commissioner's Office (ICO)</strong> at ico.org.uk.</p>
      </>
    ),
  },
  {
    id: 's10', num: '10', title: 'Children\'s Privacy',
    content: (
      <>
        <p>VenueBook is not directed at children under 18 years of age. We do not knowingly collect personal data from anyone under 18. If we become aware that a minor has registered an account, we will promptly delete their account and associated data.</p>
        <p>If you believe a child has provided us with personal data, please contact us at <strong>privacy@venuebook.co.uk</strong>.</p>
      </>
    ),
  },
  {
    id: 's11', num: '11', title: 'Changes to This Policy',
    content: (
      <>
        <p>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal obligations. When we make material changes, we will:</p>
        <ul>
          <li>Update the "Last updated" date at the bottom of this page</li>
          <li>Notify registered users via email or in-platform notification</li>
        </ul>
        <p>Your continued use of VenueBook after changes are posted constitutes your acceptance of the updated policy. We encourage you to review this policy periodically.</p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroTag}>Legal</div>
        <h1>Privacy Policy</h1>
        <p>How we collect, use, and protect your personal data.</p>
      </div>

      <div className={styles.body}>
        {/* Table of contents */}
        <div className={styles.toc}>
          <h3>Contents</h3>
          <ol>
            {sections.map(s => (
              <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>
            ))}
          </ol>
        </div>

        {/* Sections */}
        {sections.map(s => (
          <div key={s.id} id={s.id} className={styles.section}>
            <h2>
              <span className={styles.sectionNum}>{s.num}</span>
              {s.title}
            </h2>
            {s.content}
          </div>
        ))}

        {/* Contact */}
        <div className={styles.contactBox}>
          <h3>Privacy questions or requests?</h3>
          <p>Contact our Data Protection contact for any privacy-related enquiries or to exercise your rights.</p>
          <a href="mailto:privacy@venuebook.co.uk">privacy@venuebook.co.uk</a>
        </div>

        <p className={styles.updated}>
          Last updated: April 2026 · See also: <Link to="/terms">Terms of Service</Link>
        </p>
      </div>
    </div>
  );
}
