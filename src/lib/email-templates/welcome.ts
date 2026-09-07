export function welcomeTemplate(name: string): string {
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
              <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background-color:#eaebf8;color:#2545ff;font-size:24px;font-weight:bold;margin-bottom:24px;">★</div>
              <h1 style="margin:0 0 8px;font-size:28px;font-weight:600;color:#0c1754;">Welcome to StarPress!</h1>
              <p style="margin:0 0 32px;font-size:14px;color:#666;line-height:1.6;">
                Hi ${name},<br><br>
                Thank you for joining StarPress. You're now ready to turn your Google Reviews into revenue.
              </p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://starpress.app'}/onboarding" style="display:inline-block;padding:14px 32px;background-color:#2545ff;color:#ffffff;text-decoration:none;border-radius:50px;font-size:14px;font-weight:600;">Get Started →</a>
              <p style="margin:32px 0 0;font-size:12px;color:#999;line-height:1.5;">
                Need help? Reply to this email or visit our docs.
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
