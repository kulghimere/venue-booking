import React from 'react';
import { Link } from 'react-router-dom';
import styles from './LegalPage.module.css';

const sections = [
  {
    id: 's1', num: '1', title: 'Acceptance of Terms',
    content: (
      <>
        <p>By accessing or using the VenueBook platform ("Service"), you confirm that you are at least 18 years of age and agree to be bound by these Terms of Service ("Terms"). If you are using the Service on behalf of an organisation, you represent that you have the authority to bind that organisation to these Terms.</p>
        <p>VenueBook reserves the right to update these Terms at any time. Continued use of the Service after changes are posted constitutes your acceptance of the revised Terms. We will notify registered users of material changes via email or in-platform notification.</p>
      </>
    ),
  },
  {
    id: 's2', num: '2', title: 'Description of Service',
    content: (
      <>
        <p>VenueBook is an intelligent venue booking platform that connects venue owners with customers seeking spaces for events including weddings, conferences, sports, exhibitions, and social gatherings. The platform provides:</p>
        <ul>
          <li>A searchable directory of available venues with real-time availability</li>
          <li>AI-powered venue recommendations based on user preferences and booking history</li>
          <li>Online booking, confirmation, and payment processing</li>
          <li>Waitlist management for fully-booked venues</li>
          <li>Review and ratings system for completed bookings</li>
          <li>Owner dashboards for managing venues, bookings, and analytics</li>
        </ul>
        <p>The platform is provided as an intermediary service. VenueBook does not own, operate, or manage any of the listed venues.</p>
      </>
    ),
  },
  {
    id: 's3', num: '3', title: 'User Accounts',
    content: (
      <>
        <p>To access most features, you must create an account and verify your email address. You are responsible for:</p>
        <ul>
          <li>Providing accurate, complete, and current registration information</li>
          <li>Maintaining the confidentiality of your password</li>
          <li>All activity that occurs under your account</li>
          <li>Notifying us immediately of any unauthorised use of your account</li>
        </ul>
        <p>Accounts are available in three roles: <strong>Guest User</strong> (browse and book venues), <strong>Venue Owner</strong> (list and manage venues), and <strong>Administrator</strong> (platform management). You may not create multiple accounts to circumvent restrictions or abuse platform features.</p>
        <div className={styles.highlight}>VenueBook reserves the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or cause harm to other users or the platform.</div>
      </>
    ),
  },
  {
    id: 's4', num: '4', title: 'Bookings and Payments',
    content: (
      <>
        <p>When you submit a booking request, you are making a formal offer to hire a venue for the specified date, time, and duration. A booking is only confirmed when the venue owner explicitly approves it and you receive a confirmation notification.</p>
        <ul>
          <li><strong>Pricing:</strong> All prices are displayed in GBP (£) and include VAT where applicable. The total price is calculated based on the hourly rate multiplied by the number of hours booked.</li>
          <li><strong>Payment:</strong> Payment is due at the time of booking confirmation. VenueBook uses industry-standard encryption for all payment transactions.</li>
          <li><strong>Waitlisting:</strong> If a requested slot is unavailable, you may be placed on a waitlist. You will be notified automatically if a slot becomes available.</li>
          <li><strong>Booking edits:</strong> Requests to modify a confirmed booking (date, time, or guest count) must be submitted through the platform and approved by the venue owner.</li>
        </ul>
      </>
    ),
  },
  {
    id: 's5', num: '5', title: 'Cancellation and Refund Policy',
    content: (
      <>
        <p>Cancellation terms vary by venue and are set by the venue owner when listing their space. The three standard policies are:</p>
        <ul>
          <li><strong>Flexible:</strong> Full refund if cancelled at least 24 hours before the booking start time.</li>
          <li><strong>Moderate:</strong> Full refund if cancelled at least 5 days before the booking start time; 50% refund thereafter.</li>
          <li><strong>Strict:</strong> 50% refund if cancelled at least 7 days before the booking start time; no refund thereafter.</li>
        </ul>
        <p>Refunds are processed to the original payment method within 5–10 business days. VenueBook's service fee (if applicable) is non-refundable once a booking is confirmed.</p>
        <div className={styles.highlight}>In the event of exceptional circumstances (natural disasters, government-mandated closures, bereavement), please contact support — we review such cases individually.</div>
      </>
    ),
  },
  {
    id: 's6', num: '6', title: 'Venue Owner Obligations',
    content: (
      <>
        <p>Venue owners who list spaces on VenueBook agree to:</p>
        <ul>
          <li>Provide accurate and truthful descriptions, photographs, and availability information for their venues</li>
          <li>Honour all confirmed bookings, except in documented exceptional circumstances</li>
          <li>Respond to booking requests and edit requests in a timely manner (within 48 hours)</li>
          <li>Maintain the venue in the condition described and advertised on the platform</li>
          <li>Comply with all applicable local laws, health and safety regulations, and licensing requirements</li>
          <li>Not charge hidden fees beyond the listed price per hour</li>
        </ul>
        <p>Venue owners who consistently fail to honour bookings, provide misleading information, or receive sustained negative reviews may have their listings suspended or permanently removed.</p>
      </>
    ),
  },
  {
    id: 's7', num: '7', title: 'Prohibited Conduct',
    content: (
      <>
        <p>You agree not to use VenueBook to:</p>
        <ul>
          <li>Make fraudulent, speculative, or false bookings</li>
          <li>Harass, threaten, or abuse other users, venue owners, or platform staff</li>
          <li>Post false, defamatory, or misleading reviews</li>
          <li>Attempt to bypass the platform to arrange bookings or payments off-platform</li>
          <li>Use automated scripts, bots, or scrapers to access platform data</li>
          <li>Upload content that is illegal, offensive, or infringes intellectual property rights</li>
          <li>Attempt to gain unauthorised access to accounts, systems, or databases</li>
        </ul>
        <p>Violations may result in immediate account suspension and, where applicable, legal action.</p>
      </>
    ),
  },
  {
    id: 's8', num: '8', title: 'Reviews and User Content',
    content: (
      <>
        <p>Users who have completed a booking may submit a review and star rating for the venue. By submitting a review, you confirm that:</p>
        <ul>
          <li>The review is based on a genuine experience at the venue</li>
          <li>The content is honest, accurate, and not defamatory</li>
          <li>You are not affiliated with the venue in any capacity that would constitute a conflict of interest</li>
        </ul>
        <p>VenueBook reserves the right to remove reviews that violate these guidelines or are reported as fraudulent. You grant VenueBook a non-exclusive, royalty-free licence to display and use your submitted content on the platform.</p>
      </>
    ),
  },
  {
    id: 's9', num: '9', title: 'Intellectual Property',
    content: (
      <>
        <p>All content on the VenueBook platform — including but not limited to the logo, design, software, text, and AI recommendation algorithms — is the intellectual property of VenueBook and protected by copyright and other applicable laws.</p>
        <p>You may not copy, reproduce, distribute, or create derivative works from any platform content without express written permission. Venue owners retain ownership of photographs and descriptions they upload, but grant VenueBook a licence to display them on the platform.</p>
      </>
    ),
  },
  {
    id: 's10', num: '10', title: 'Limitation of Liability',
    content: (
      <>
        <p>VenueBook acts solely as an intermediary marketplace. To the maximum extent permitted by law:</p>
        <ul>
          <li>VenueBook is not liable for the condition, safety, legality, or suitability of any venue listed on the platform</li>
          <li>VenueBook is not responsible for losses arising from booking cancellations, venue closures, or disputes between users and venue owners</li>
          <li>Our total liability to you for any claim shall not exceed the amount you paid for the specific booking in question</li>
        </ul>
        <div className={styles.highlight}>Nothing in these Terms limits liability for death or personal injury caused by negligence, fraud, or any other matter that cannot be excluded under applicable UK law.</div>
      </>
    ),
  },
  {
    id: 's11', num: '11', title: 'Governing Law',
    content: (
      <>
        <p>These Terms are governed by and construed in accordance with the laws of England and Wales. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
        <p>If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.</p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroTag}>Legal</div>
        <h1>Terms of Service</h1>
        <p>Please read these terms carefully before using the VenueBook platform.</p>
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
          <h3>Questions about these Terms?</h3>
          <p>If you have any questions or concerns, please reach out to our support team.</p>
          <a href="mailto:support@venuebook.co.uk">support@venuebook.co.uk</a>
        </div>

        <p className={styles.updated}>
          Last updated: April 2026 · See also: <Link to="/privacy">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
