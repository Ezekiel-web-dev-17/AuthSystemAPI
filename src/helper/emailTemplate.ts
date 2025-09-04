export const emailTemplate = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Verify your email</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      /* Clients strip most CSS, keep it simple + inline where important */
      a { text-decoration: none; }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#f6f9fc;">
    <!-- Preheader (hidden preview text in inbox) -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      Congrats! Verify your email to finish setting up {{APP_NAME}}.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f9fc;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #eaecef;">
            <tr>
              <td style="padding:24px 24px 8px 24px; text-align:center; font-family:Arial,Helvetica,sans-serif;">
                <h1 style="margin:0;font-size:22px;color:#111827;">Email verification</h1>
              </td>
            </tr>

            <tr>
              <td style="padding:0 24px 8px 24px; font-family:Arial,Helvetica,sans-serif; color:#374151; font-size:14px; line-height:1.6;">
                <p style="margin:16px 0;">Hi {{FIRST_NAME}},</p>
                <p style="margin:16px 0;">
                  Congrats for sending test email with Mailtrap + Nodemailer + TS 🚀
                  <br/>To finish, please verify your email address.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:16px 24px 24px 24px;">
                <!-- Bulletproof button -->
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td bgcolor="#2563eb" style="border-radius:8px;">
                      <a href="{{VERIFY_URL}}" target="_blank"
                         style="display:inline-block;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#ffffff;background:#2563eb;border-radius:8px;">
                        Verify Email
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="font-family:Arial,Helvetica,sans-serif;color:#6b7280;font-size:12px;line-height:1.6;margin:16px 0 0;">
                  Or copy &amp; paste this link into your browser:<br/>
                  <span style="word-break:break-all;color:#111827;">{{VERIFY_URL}}</span>
                </p>

                <p style="font-family:Arial,Helvetica,sans-serif;color:#6b7280;font-size:12px;line-height:1.6;margin:16px 0 0;">
                  If you didn’t request this, just ignore this email.
                </p>
              </td>
            </tr>

            <tr>
              <td style="background:#f9fafb;padding:16px 24px; font-family:Arial,Helvetica,sans-serif; color:#6b7280; font-size:12px;">
                &copy; {{APP_NAME}} • This link may expire for your security.
              </td>
            </tr>
          </table>

          <!-- Footer spacer -->
          <div style="height:24px;"></div>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
