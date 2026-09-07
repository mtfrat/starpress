export function passwordResetTemplate(resetUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f9f8f6;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f8f6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(12,23,84,0.06);">
          <tr>
            <td style="padding:40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background-color:#eaebf8;color:#2545ff;font-size:24px;font-weight:bold;margin-bottom:24px;">🔑</div>
              <h1 style="margin:0 0 8px;font-size:28px;font-weight:600;color:#0c1754;">Reset Your Password</h1>
              <p style="margin:0 0 32px;font-size:14px;color:#666;line-height:1.6;">
                We received a request to reset your password. Click the button below to create a new one.
              </p>
              <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background-color:#2545ff;color:#ffffff;text-decoration:none;border-radius:50px;font-size:14px;font-weight:600;">Reset Password →</a>
              <p style="margin:32px 0 0;font-size:12px;color:#999;line-height:1.5;">
                This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:24px 0 0;font-size:11px;color:#999;">© 2026 StarPress. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
