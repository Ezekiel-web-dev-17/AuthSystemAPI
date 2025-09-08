export const forgotPasswordTemplate = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Reset your password</title>
</head>
<body style="margin:0; padding:0; background:#f2f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#1b1b1f;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="680" cellpadding="0" cellspacing="0" role="presentation" style="max-width:680px;">
          <tr>
            <td style="padding:24px 0; text-align:left;">
              <!-- Header / logo area -->
              <div style="font-size:18px; font-weight:700; color:#0f172a;">{{app_name}}</div>
            </td>
          </tr>

          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff; border-radius:10px; box-shadow:0 2px 4px rgba(15,23,42,0.04); overflow:hidden;">
                <tr>
                  <td style="padding:28px;">
                    <h1 style="margin:0 0 12px 0; font-size:20px; color:#0f172a;">Reset your password</h1>
                    <p style="margin:0 0 18px 0; color:#4b5563; line-height:1.5;">
                      Hey {{name}}, we got a request to reset your {{app_name}} password. Click the button below to pick a new password.
                    </p>

                    <p style="text-align:center; margin:26px 0;">
                      <a href="{{reset_link}}" role="button" style="display:inline-block; padding:14px 26px; font-weight:600; text-decoration:none; border-radius:8px; background:#0b74ff; color:#ffffff;">Reset password</a>
                    </p>

                    <p style="margin:0 0 6px 0; color:#6b7280; font-size:13px;">Or paste this link into your browser:</p>
                    <p style="word-break:break-all; font-size:13px; color:#6b7280; margin:4px 0 20px 0;">{{reset_link}}</p>

                    <p style="margin:0 0 8px 0; color:#6b7280; font-size:13px;">This link will expire in <strong>{{expiry_hours}} hours</strong>.</p>

                    <hr style="border:none; border-top:1px solid #eef2f7; margin:20px 0;">

                    <p style="color:#6b7280; font-size:13px; margin:0;">
                      If you didn't request a password reset, you can safely ignore this email. If you think someone is trying to access your account, contact us at <a href="mailto:{{support_email}}">{{support_email}}</a>.
                    </p>

                    <p style="color:#9ca3af; font-size:12px; margin-top:16px;">For your security, never share this link with anyone. The {{app_name}} team</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 0 0 0; text-align:center; color:#9ca3af; font-size:12px;">
              © {{current_year}} {{app_name}} — Need help? <a href="mailto:{{support_email}}">{{support_email}}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
