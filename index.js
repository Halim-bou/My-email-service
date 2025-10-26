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
        user: 'portfolioangee@gmail.com',
        pass: 'qfhp nmno lccl jphu'
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
        subject: 'Confirmation de soumission de candidature',
        text: `Bonjour,

Nous avons le plaisir de confirmer que votre candidature a bien été soumise et reçue par notre équipe de recrutement.

Votre numéro de candidature : ${candidatureId}

Veuillez conserver ce numéro pour vos dossiers, car il pourra vous être demandé pour le suivi de votre candidature.

Notre équipe examinera votre dossier et vous contactera si votre profil correspond à nos besoins.

Merci de l'intérêt que vous portez à notre organisation.

Cordialement,
L'équipe recrutement`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #2c3e50; margin-bottom: 20px; text-align: center;">Confirmation de soumission de candidature</h2>
                
                <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">Bonjour,</p>
                
                <p style="color: #34495e; line-height: 1.6; margin-bottom: 20px;">
                    Nous avons le plaisir de confirmer que votre <strong>candidature a bien été soumise</strong> et reçue par notre équipe de recrutement.
                </p>
                
                <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0; color: #2c3e50; font-weight: bold;">Votre numéro de candidature :</p>
                    <p style="margin: 5px 0 0 0; color: #e74c3c; font-size: 18px; font-weight: bold;">${candidatureId}</p>
                </div>
                
                <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">
                    Veuillez conserver ce numéro pour vos dossiers, car il pourra vous être demandé pour le suivi de votre candidature.
                </p>
                
                <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">
                    Notre équipe examinera votre dossier et vous contactera si votre profil correspond à nos besoins.
                </p>
                
                <p style="color: #34495e; line-height: 1.6; margin-bottom: 20px;">
                    Merci de l'intérêt que vous portez à notre organisation.
                </p>
                
                <div style="border-top: 1px solid #ecf0f1; padding-top: 20px; margin-top: 30px;">
                    <p style="color: #7f8c8d; margin: 0;">Cordialement,</p>
                    <p style="color: #2c3e50; font-weight: bold; margin: 5px 0 0 0;">L'équipe recrutement</p>
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
        subject: 'Invitation à un entretien',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; padding: 20px;">
                <div style="background: white; padding: 30px; border-radius: 8px;">
                    <h2 style="text-align: center; color: #2980b9;">Invitation à un entretien</h2>
                    <p>Bonjour,</p>
                    <p>Nous avons le plaisir de vous inviter à un entretien.</p>
                    <p>Veuillez rejoindre via le lien ci-dessous à l'heure prévue :</p>
                    <p style="text-align: center; margin: 20px 0;">
                        <a href="${interviewLink}" style="background: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Rejoindre l'entretien</a>
                    </p>
                    <p>Au plaisir d'échanger avec vous.</p>
                    <p>Cordialement,<br/>L'équipe recrutement</p>
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
        return res.status(400).json({ error: 'Le statut doit être "accepted" ou "rejected" (accepted/rejected)' });
    }

    const subject = status === 'accepted' ? 'Félicitations ! Votre candidature a été acceptée' : 'Mise à jour concernant votre candidature';
    const bodyText = status === 'accepted'
        ? `Nous avons le plaisir de vous informer que votre candidature (ID : ${candidatureId}) a été acceptée. Bienvenue parmi nous !`
        : `Nous regrettons de vous informer que votre candidature (ID : ${candidatureId}) n'a pas été retenue. Merci d'avoir postulé.`;

    const mailOptions = {
        from: 'bouaami.el@gmail.com',
        to: recipientEmail,
        subject,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; padding: 20px;">
                <div style="background: white; padding: 30px; border-radius: 8px;">
                    <h2 style="text-align: center; color: ${status === 'accepted' ? '#27ae60' : '#c0392b'};">${subject}</h2>
                    <p>${bodyText}</p>
                    <p>Cordialement,<br/>L'équipe recrutement</p>
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
            from: 'portfolioangee@gmail.com',
            to: 'angeekomanoconstruction@gmail.com', // Send to yourself
            replyTo: email, // Allow easy reply to the user
            subject: `Nouvelle soumission du formulaire de contact: ${subject || 'Sans objet'}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #2c3e50; margin-bottom: 20px; border-bottom: 3px solid #3498db; padding-bottom: 10px;">
                            📧 Nouvelle soumission du formulaire de contact
                        </h2>
                    
                    <div style="margin: 20px 0;">
                        <div style="margin-bottom: 15px;">
                                <strong style="color: #2c3e50;">Nom :</strong>
                                <p style="margin: 5px 0; color: #34495e;">${name}</p>
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                                <strong style="color: #2c3e50;">E-mail :</strong>
                                <p style="margin: 5px 0; color: #34495e;">
                                    <a href="mailto:${email}" style="color: #3498db; text-decoration: none;">${email}</a>
                                </p>
                        </div>
                        
                        ${phone ? `
                        <div style="margin-bottom: 15px;">
                                <strong style="color: #2c3e50;">Téléphone :</strong>
                                <p style="margin: 5px 0; color: #34495e;">${phone}</p>
                        </div>
                        ` : ''}
                        
                        ${subject ? `
                        <div style="margin-bottom: 15px;">
                                <strong style="color: #2c3e50;">Sujet :</strong>
                                <p style="margin: 5px 0; color: #34495e;">${subject}</p>
                        </div>
                        ` : ''}
                        
                        <div style="margin-bottom: 15px;">
                                <strong style="color: #2c3e50;">Message :</strong>
                                <div style="margin: 10px 0; padding: 15px; background-color: #ecf0f1; border-radius: 5px; color: #34495e; line-height: 1.6;">
                                    ${message.replace(/\n/g, '<br>')}
                                </div>
                        </div>
                    </div>
                    
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1; color: #7f8c8d; font-size: 12px;">
                            <p style="margin: 0;">Reçu : ${new Date().toLocaleString()}</p>
                        </div>
                </div>
            </div>`
        };

        // Confirmation email to the USER
        const userMailOptions = {
            from: 'portfolioangee@gmail.com',
            to: email,
            subject: 'Merci de nous avoir contactés !',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #27ae60; margin-bottom: 20px; text-align: center;">✓ Message reçu !</h2>
                    
                        <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">Bonjour ${name},</p>
                    
                        <p style="color: #34495e; line-height: 1.6; margin-bottom: 20px;">
                            Merci de nous avoir contactés ! Nous avons bien reçu votre message et vous répondrons dès que possible.
                        </p>
                    
                        <div style="background-color: #ecf0f1; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 0 0 10px 0; color: #2c3e50; font-weight: bold;">Votre message :</p>
                            <p style="margin: 0; color: #34495e; line-height: 1.6;">${message.substring(0, 200)}${message.length > 200 ? '...' : ''}</p>
                        </div>
                    
                        <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">
                            Nous répondons généralement sous 24 à 48 heures pendant les jours ouvrables.
                        </p>
                    
                        <div style="border-top: 1px solid #ecf0f1; padding-top: 20px; margin-top: 30px;">
                            <p style="color: #7f8c8d; margin: 0;">Cordialement,</p>
                            <p style="color: #2c3e50; font-weight: bold; margin: 5px 0 0 0;">Angee Komano</p>
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
