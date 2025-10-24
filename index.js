const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

// Add CORS middleware
const cors = require('cors');
app.use(cors());
app.use(express.json());

// --- NEW: Brevo setup (replace nodemailer) ---
const SibApiV3Sdk = require('@sendinblue/client');
const brevo = new SibApiV3Sdk.TransactionalEmailsApi();
brevo.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'bouaami.el@gmail.com';

// Helper to send emails via Brevo
async function sendMail(options) {
  try {
    const { from, to, subject, html, text, replyTo } = options;

    // Build payload exactly as Brevo expects
    const payload = {
      sender: { email: from || ADMIN_EMAIL, name: 'Recruitment Team' },
      to: [{ email: to }],
      subject: subject || '(no subject)',
      htmlContent: html || '<p>(no HTML)</p>',
      // ✅ Force textContent to be a plain string, never undefined
      textContent: (text && String(text).trim()) || 'plain text fallback',
    };

    if (replyTo) payload.replyTo = { email: replyTo };

    console.log('🛰️  Brevo payload preview:', JSON.stringify(payload, null, 2));

    await brevo.sendTransacEmail(payload);
    console.log(`✅ Email sent to ${to}`);
    return { messageId: `brevo_${Date.now()}` };
  } catch (err) {
    console.error('❌ Email sending failed:', err.message);
    if (err.response && err.response.body) {
      console.error('Brevo API response:', err.response.body);
    }
    throw err;
  }
}


// --- TEST ENDPOINT ---
app.post('/test-post', (req, res) => {
    console.log('TEST POST received');
    console.log('Body:', req.body);
    res.json({ received: req.body });
});

// --- EXISTING ENDPOINT 1: Send Candidature ---
app.get('/send-candidature/:email/:id', async (req, res) => {
    const recipientEmail = req.params.email;
    const candidatureId = req.params.id;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!candidatureId || candidatureId.trim() === '') {
        return res.status(400).json({ error: 'Candidature ID is required' });
    }

    const mailOptions = {
        from: ADMIN_EMAIL,
        to: recipientEmail,
        subject: 'Candidature Submission Confirmation',
        text: `Dear Candidate,\n\nWe are pleased to confirm that your candidature has been successfully submitted and received by our recruitment team.\n\nYour Candidature ID: ${candidatureId}\n\nPlease keep this ID for your records.\n\nBest regards,\nRecruitment Team`,
        html: /* same HTML as before */ `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #2c3e50; margin-bottom: 20px; text-align: center;">Candidature Submission Confirmation</h2>
                <p>Dear Candidate,</p>
                <p>We are pleased to confirm that your candidature has been successfully submitted and received by our recruitment team.</p>
                <p><strong>Your Candidature ID:</strong> ${candidatureId}</p>
                <p>Thank you for your interest in joining our organization.</p>
                <p>Best regards,<br/>Recruitment Team</p>
            </div>
        </div>`
    };

    try {
        const info = await sendMail(mailOptions);
        res.json({
            success: true,
            messageId: info.messageId,
            recipient: recipientEmail,
            candidatureId: candidatureId,
            message: 'Candidature confirmation email sent successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- EXISTING ENDPOINT 2: Send Interview ---
app.get('/send-interview/:email', async (req, res) => {
    const recipientEmail = req.params.email;
    const interviewLink = req.query.link;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!interviewLink || !interviewLink.startsWith('http')) {
        return res.status(400).json({ error: 'A valid interview link is required' });
    }

    const mailOptions = {
        from: ADMIN_EMAIL,
        to: recipientEmail,
        subject: 'Interview Invitation',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; padding: 20px;">
            <div style="background: white; padding: 30px; border-radius: 8px;">
                <h2 style="text-align: center; color: #2980b9;">Interview Invitation</h2>
                <p>Hello,</p>
                <p>We are pleased to invite you to an interview.</p>
                <p style="text-align: center; margin: 20px 0;">
                    <a href="${interviewLink}" style="background: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Join Interview</a>
                </p>
                <p>We look forward to speaking with you.</p>
                <p>Best regards,<br/>Recruitment Team</p>
            </div>
        </div>`
    };

    try {
        const info = await sendMail(mailOptions);
        res.json({
            success: true,
            messageId: info.messageId,
            recipient: recipientEmail,
            interviewLink
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- EXISTING ENDPOINT 3: Send Decision ---
app.get('/send-decision/:email/:id', async (req, res) => {
    const recipientEmail = req.params.email;
    const candidatureId = req.params.id;
    const status = req.query.status?.toLowerCase();

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Status must be "accepted" or "rejected"' });
    }

    const subject = status === 'accepted'
        ? 'Congratulations! You are Accepted'
        : 'Candidature Update';
    const bodyText = status === 'accepted'
        ? `We are pleased to inform you that your application (ID: ${candidatureId}) has been accepted. Welcome aboard!`
        : `We regret to inform you that your application (ID: ${candidatureId}) was not selected. Thank you for applying.`;

    const mailOptions = {
        from: ADMIN_EMAIL,
        to: recipientEmail,
        subject,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; padding: 20px;">
            <div style="background: white; padding: 30px; border-radius: 8px;">
                <h2 style="text-align: center; color: ${status === 'accepted' ? '#27ae60' : '#c0392b'};">${subject}</h2>
                <p>${bodyText}</p>
                <p>Best regards,<br/>Recruitment Team</p>
            </div>
        </div>`
    };

    try {
        const info = await sendMail(mailOptions);
        res.json({ success: true, messageId: info.messageId });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- EXISTING ENDPOINT 4: Contact Form ---
app.post('/send-contact', async (req, res) => {
    console.log('🔍 DEBUG: Request body =', req.body);
    try {
        const { name, email, phone, subject, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, error: 'Name, email, and message are required fields' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, error: 'Invalid email format' });
        }

        const adminMailOptions = {
            from: ADMIN_EMAIL,
            to: ADMIN_EMAIL,
            replyTo: email,
            subject: `New Contact Form Submission: ${subject || 'No Subject'}`,
            html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong> ${message}</p>`
        };

        const userMailOptions = {
            from: ADMIN_EMAIL,
            to: email,
            subject: 'Thank you for contacting us!',
            html: `<p>Dear ${name},</p><p>We received your message and will reply soon.</p>`
        };

        console.log('🔍 DEBUG: Sending admin email...');
        await sendMail(adminMailOptions);
        console.log('🔍 DEBUG: Sending user confirmation email...');
        await sendMail(userMailOptions);

        res.json({ success: true, message: 'Contact form submitted successfully.' });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ success: false, error: 'Failed to send message.' });
    }
});

// --- SERVER START ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Email service running on port ${PORT}`));
