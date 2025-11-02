# pfa-email-services

Simple email service for sending candidature, interview, decision and contact emails.

# My-email-service

Small email microservice for sending candidature confirmations, interview invitations, decision notifications and contact-form messages.

## Overview

This service exposes a few HTTP endpoints that trigger templated emails (via Nodemailer). It's intentionally small and easy to run locally for development and testing.

Key implementation notes:
- Built with Express and Nodemailer.
- Uses `cors` and `dotenv` (optional) — see `index.js`.
- Email templates are inline in `index.js` and were translated to French.

## Prerequisites

- Node.js (v14+ recommended)
- An SMTP account to send emails (the example uses Gmail). For Gmail, prefer an App Password rather than your main password.

From the project root run:

```sh
npm install
```

## Configuration

By default this project currently contains SMTP credentials directly in `index.js`. For a safer setup create a `.env` file in the project root and set these values (you will also need to update `index.js` to read them, example below):

Example `.env` (DO NOT commit this file):

```ini
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your-app-password
PORT=3000
```

Quick code snippet to use environment variables in `index.js` (optional change):

```js
// near transporter creation
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

If you keep credentials in `index.js` for quick testing, be careful not to push them to a public repository.

## Start the service

Start the server from the project root:

```sh
npm start
# or
node index.js
```

The server listens on `process.env.PORT` or `3000` by default.

## Endpoints and how to test

All examples assume the service is running at `http://localhost:3000`.

- Test endpoint (echo)
  - Route: `POST /test-post`
  - Body: any JSON
  - Example:

```sh
curl -X POST http://localhost:3000/test-post \
  -H "Content-Type: application/json" \
  -d '{"hello":"world"}'
```

- Send Candidature
  - Route: `GET /send-candidature/:email/:id`
  - Example:

```sh
curl "http://localhost:3000/send-candidature/test@example.com/CAND123"
```

  - Validates the email and non-empty id. Sends a candidature confirmation email (French template).

- Send Interview
  - Route: `GET /send-interview/:email?link=<meeting-url>`
  - Example:

```sh
curl "http://localhost:3000/send-interview/test@example.com?link=https://meet.example.com/abc123"
```

  - Validates email and that the `link` starts with `http`.

- Send Decision
  - Route: `GET /send-decision/:email/:id?status=accepted|rejected`
  - Example:

```sh
curl "http://localhost:3000/send-decision/test@example.com/CAND123?status=accepted"
```

  - Sends either an acceptance or rejection email (French templates). Query parameter `status` must be `accepted` or `rejected`.

- Contact form (send-contact)
  - Route: `POST /send-contact`
  - Body (JSON):

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "phone": "1234567890",     // optional
  "subject": "Hello",        // optional
  "message": "Message body"
}
```

  - Example:

```sh
curl -X POST http://localhost:3000/send-contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","message":"Hi"}'
```

  - Required fields: `name`, `email`, `message`. The endpoint sends an email to the admin address and a confirmation email to the user.

## Gmail / SMTP notes

- Gmail often requires an App Password when using SMTP from external apps. Create one in your Google Account (Security -> App passwords) and use it as `EMAIL_PASS`.
- If you see authentication errors, check:
  - That the account allows SMTP access.
  - That you're using an app password (recommended).
  - That there are no 2FA or account restrictions blocking SMTP.

## Security and production considerations

- Never commit real credentials to source control. Use environment variables, secrets managers, or deployment-specific configuration.
- Consider using a dedicated transactional email provider (SendGrid, Mailgun, SES) for production.
- Add rate limiting and authentication if you expose this service publicly.

## Troubleshooting

- Check the server logs printed to the console — the app logs send attempts and errors.
- If emails are not sent, the transporter will throw an error with details — review the error and SMTP configuration.

## Files

- Main server: `index.js`
- NPM config: `package.json`
- Environment file (ignored): `.env` (create locally)

## Next steps (suggested)

- Move SMTP credentials into `.env` and update `index.js` to read them from `process.env`.
- Externalize the templates into separate files and add multi-language support.
- Add tests that stub Nodemailer (e.g., using nodemailer-mock) to validate templates without sending real emails.

---

If you'd like, I can update `index.js` now to read credentials from `.env` and add a sample `.env.example` file. Tell me if you want me to do that and whether to keep using Gmail or switch to a provider example.