const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
const dotenv = require("dotenv");
dotenv.config({ path: '.env' });

// Add CORS middleware to allow requests from your website
const cors = require('cors');
app.use(cors()); // You'll need to install: npm install cors

app.use(express.json());

// TEST ENDPOINT - Add this right after app.use(express.json())
app.post('/test-post', (req, res) => {
    console.log('TEST POST received');
    console.log('Body:', req.body);
    res.json({ received: req.body });
});


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'bouaami.el@gmail.com',
        pass: 'heem zezn szfo lkdl'
    }
});

// EXISTING ENDPOINT 1: Send Candidature
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
        from: 'bouaami.el@gmail.com',
        to: recipientEmail,
        subject: 'Candidature Submission Confirmation',
        text: `Dear Candidate,

We are pleased to confirm that your candidature has been successfully submitted and received by our recruitment team.

Your Candidature ID: ${candidatureId}

Please keep this ID for your records, as you may need it for future reference and to track the status of your application.

Our team will review your application and contact you if your profile matches our current requirements.

Thank you for your interest in joining our organization.

Best regards,
Recruitment Team`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #2c3e50; margin-bottom: 20px; text-align: center;">Candidature Submission Confirmation</h2>
                
                <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">Dear Candidate,</p>
                
                <p style="color: #34495e; line-height: 1.6; margin-bottom: 20px;">
                    We are pleased to confirm that your <strong>candidature has been successfully submitted</strong> and received by our recruitment team.
                </p>
                
                <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0; color: #2c3e50; font-weight: bold;">Your Candidature ID:</p>
                    <p style="margin: 5px 0 0 0; color: #e74c3c; font-size: 18px; font-weight: bold;">${candidatureId}</p>
                </div>
                
                <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">
                    Please keep this ID for your records, as you may need it for future reference and to track the status of your application.
                </p>
                
                <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">
                    Our team will review your application and contact you if your profile matches our current requirements.
                </p>
                
                <p style="color: #34495e; line-height: 1.6; margin-bottom: 20px;">
                    Thank you for your interest in joining our organization.
                </p>
                
                <div style="border-top: 1px solid #ecf0f1; padding-top: 20px; margin-top: 30px;">
                    <p style="color: #7f8c8d; margin: 0;">Best regards,</p>
                    <p style="color: #2c3e50; font-weight: bold; margin: 5px 0 0 0;">Recruitment Team</p>
                </div>
            </div>
        </div>`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        res.json({
            success: true,
            messageId: info.messageId,
            recipient: recipientEmail,
            candidatureId: candidatureId,
            message: 'Candidature confirmation email sent successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// EXISTING ENDPOINT 2: Send Interview
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
        from: 'bouaami.el@gmail.com',
        to: recipientEmail,
        subject: 'Interview Invitation',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; padding: 20px;">
                <div style="background: white; padding: 30px; border-radius: 8px;">
                    <h2 style="text-align: center; color: #2980b9;">Interview Invitation</h2>
                    <p>Hello,</p>
                    <p>We are pleased to invite you to an interview.</p>
                    <p>Please join using the link below at the scheduled time:</p>
                    <p style="text-align: center; margin: 20px 0;">
                        <a href="${interviewLink}" style="background: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Join Interview</a>
                    </p>
                    <p>We look forward to speaking with you.</p>
                    <p>Best regards,<br/>Recruitment Team</p>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
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

// EXISTING ENDPOINT 3: Send Decision
app.get('/send-decision/:email/:id', async (req, res) => {
    const recipientEmail = req.params.email;
    const candidatureId = req.params.id;
    const status = req.query.status?.toLowerCase();

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Status must be "accepted" or "rejected"' });
    }

    const subject = status === 'accepted' ? 'Congratulations! You are Accepted' : 'Candidature Update';
    const bodyText = status === 'accepted'
        ? `We are pleased to inform you that your application (ID: ${candidatureId}) has been accepted. Welcome aboard!`
        : `We regret to inform you that your application (ID: ${candidatureId}) was not selected. Thank you for applying.`;

    const mailOptions = {
        from: 'bouaami.el@gmail.com',
        to: recipientEmail,
        subject,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; padding: 20px;">
                <div style="background: white; padding: 30px; border-radius: 8px;">
                    <h2 style="text-align: center; color: ${status === 'accepted' ? '#27ae60' : '#c0392b'};">${subject}</h2>
                    <p>${bodyText}</p>
                    <p>Best regards,<br/>Recruitment Team</p>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        res.json({ success: true, messageId: info.messageId });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// NEW ENDPOINT 4: Contact Form
app.post('/send-contact', async (req, res) => {
    console.log('🔍 DEBUG: Request body =', req.body);
    
    try {
        // Extract data from request body
        const { name, email, phone, subject, message } = req.body;

        console.log('🔍 DEBUG: Extracted email =', email);

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({ 
                success: false,
                error: 'Name, email, and message are required fields' 
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid email format' 
            });
        }

        // Email to YOU (the admin/website owner)
        const adminMailOptions = {
            from: 'bouaami.el@gmail.com',
            to: 'bouaami.el@gmail.com', // Send to yourself
            replyTo: email, // Allow easy reply to the user
            subject: `New Contact Form Submission: ${subject || 'No Subject'}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #2c3e50; margin-bottom: 20px; border-bottom: 3px solid #3498db; padding-bottom: 10px;">
                        📧 New Contact Form Submission
                    </h2>
                    
                    <div style="margin: 20px 0;">
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #2c3e50;">Name:</strong>
                            <p style="margin: 5px 0; color: #34495e;">${name}</p>
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #2c3e50;">Email:</strong>
                            <p style="margin: 5px 0; color: #34495e;">
                                <a href="mailto:${email}" style="color: #3498db; text-decoration: none;">${email}</a>
                            </p>
                        </div>
                        
                        ${phone ? `
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #2c3e50;">Phone:</strong>
                            <p style="margin: 5px 0; color: #34495e;">${phone}</p>
                        </div>
                        ` : ''}
                        
                        ${subject ? `
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #2c3e50;">Subject:</strong>
                            <p style="margin: 5px 0; color: #34495e;">${subject}</p>
                        </div>
                        ` : ''}
                        
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #2c3e50;">Message:</strong>
                            <div style="margin: 10px 0; padding: 15px; background-color: #ecf0f1; border-radius: 5px; color: #34495e; line-height: 1.6;">
                                ${message.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1; color: #7f8c8d; font-size: 12px;">
                        <p style="margin: 0;">Received: ${new Date().toLocaleString()}</p>
                    </div>
                </div>
            </div>`
        };

        // Confirmation email to the USER
        const userMailOptions = {
            from: 'bouaami.el@gmail.com',
            to: email,
            subject: 'Thank you for contacting us!',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #27ae60; margin-bottom: 20px; text-align: center;">✓ Message Received!</h2>
                    
                    <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">Dear ${name},</p>
                    
                    <p style="color: #34495e; line-height: 1.6; margin-bottom: 20px;">
                        Thank you for reaching out to us! We have successfully received your message and will get back to you as soon as possible.
                    </p>
                    
                    <div style="background-color: #ecf0f1; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0; color: #2c3e50; font-weight: bold;">Your Message:</p>
                        <p style="margin: 0; color: #34495e; line-height: 1.6;">${message.substring(0, 200)}${message.length > 200 ? '...' : ''}</p>
                    </div>
                    
                    <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">
                        We typically respond within 24-48 hours during business days.
                    </p>
                    
                    <div style="border-top: 1px solid #ecf0f1; padding-top: 20px; margin-top: 30px;">
                        <p style="color: #7f8c8d; margin: 0;">Best regards,</p>
                        <p style="color: #2c3e50; font-weight: bold; margin: 5px 0 0 0;">Your Team</p>
                    </div>
                </div>
            </div>`
        };

        console.log('🔍 DEBUG: Sending admin email...');
        await transporter.sendMail(adminMailOptions);
        
        console.log('🔍 DEBUG: Sending user confirmation email...');
        await transporter.sendMail(userMailOptions);

        res.json({
            success: true,
            message: 'Contact form submitted successfully. Confirmation email sent.',
            data: {
                name,
                email,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send message. Please try again later.'
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Email service running on port ${PORT}`);
});
