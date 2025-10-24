# pfa-email-services

Simple email service for sending candidature, interview, decision and contact emails.

## Prerequisites

- Node.js installed
- From project root run:
```sh
npm install
```
Refer to [pfa-email-services/package.json](pfa-email-services/package.json) for scripts.

## Start service

```sh
npm start
```

Default port: $PORT or 3000. See [pfa-email-services/index.js](pfa-email-services/index.js).

> Note: credentials are currently set in [pfa-email-services/index.js](pfa-email-services/index.js). For production, move them to [pfa-email-services/.env](pfa-email-services/.env) and update the code to use environment variables.

## Endpoints

All endpoints are served from the running server (default http://localhost:3000).

- Test endpoint (echo)
  - Route: [`app.post('/test-post', ...)`](pfa-email-services/index.js)
  - Method: POST
  - Body (JSON): any
  - Example:
    ```sh
    curl -X POST http://localhost:3000/test-post \
      -H "Content-Type: application/json" \
      -d '{"hello":"world"}'
    ```
  - Response: JSON echo of request body

- Send Candidature
  - Route: [`app.get('/send-candidature/:email/:id', ...)`](pfa-email-services/index.js)
  - Method: GET
  - Params: email, id
  - Example:
    ```sh
    curl "http://localhost:3000/send-candidature/test@example.com/CAND123"
    ```
  - Notes: validates email and non-empty id. Sends candidature confirmation email.

- Send Interview
  - Route: [`app.get('/send-interview/:email', ...)`](pfa-email-services/index.js)
  - Method: GET
  - Params: email
  - Query: `link` (full URL to meeting)
  - Example:
    ```sh
    curl "http://localhost:3000/send-interview/test@example.com?link=https://meet.example.com/abc123"
    ```
  - Notes: validates email and that `link` starts with `http`.

- Send Decision
  - Route: [`app.get('/send-decision/:email/:id', ...)`](pfa-email-services/index.js)
  - Method: GET
  - Params: email, id
  - Query: `status` = `accepted` or `rejected`
  - Example:
    ```sh
    curl "http://localhost:3000/send-decision/test@example.com/CAND123?status=accepted"
    ```

- Contact form (send-contact)
  - Route: [`app.post('/send-contact', ...)`](pfa-email-services/index.js)
  - Method: POST
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
  - Notes: required fields: name, email, message. Sends email to admin and confirmation to user.

## Troubleshooting

- If emails do not send, check SMTP credentials in [pfa-email-services/index.js](pfa-email-services/index.js) and any provider restrictions (Gmail may require app password / less secure app settings).
- Use server logs printed to console when calling endpoints.

## Files

- Main server: [pfa-email-services/index.js](pfa-email-services/index.js)
- NPM config: [pfa-email-services/package.json](pfa-email-services/package.json)
- Env (ignored): [pfa-email-services/.env](pfa-email-services/.env)
- Git ignore: [pfa-email-services/.gitignore](pfa-email-services/.gitignore)