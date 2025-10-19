import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Email templates
export const sendCaregiverRegistrationEmail = async (caregiver) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: caregiver.email,
    subject: 'Welcome to CareNest - Registration Successful!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome to CareNest, ${caregiver.name}! 🎉</h2>
        
        <p>Thank you for registering as a caregiver on CareNest!</p>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1F2937; margin-top: 0;">What's Next?</h3>
          <p>Our team is currently reviewing your profile and verifying your documents (Aadhaar & PAN).</p>
          <p><strong>Expected Timeline:</strong> 24-48 hours</p>
        </div>
        
        <p>You will receive another email once your profile is approved and visible to families looking for caregivers.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">
            <strong>Registration Details:</strong><br>
            Email: ${caregiver.email}<br>
            Phone: ${caregiver.phone}<br>
            Experience: ${caregiver.experience} years<br>
            Status: Pending Approval
          </p>
        </div>
        
        <p style="margin-top: 30px;">
          If you have any questions, please contact us at <a href="mailto:support@carenest.com">support@carenest.com</a>
        </p>
        
        <p>Best regards,<br><strong>The CareNest Team</strong></p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Registration email sent to:', caregiver.email);
  } catch (error) {
    console.error('Error sending registration email:', error);
  }
};

export const sendAdminNotificationEmail = async (caregiver) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: '🔔 New Caregiver Registration - Action Required',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #DC2626;">New Caregiver Awaiting Approval</h2>
        
        <div style="background-color: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DC2626;">
          <h3 style="margin-top: 0;">Caregiver Details:</h3>
          <p><strong>Name:</strong> ${caregiver.name}</p>
          <p><strong>Email:</strong> ${caregiver.email}</p>
          <p><strong>Phone:</strong> ${caregiver.phone}</p>
          <p><strong>Experience:</strong> ${caregiver.experience} years</p>
          <p><strong>Specialization:</strong> ${caregiver.specialization}</p>
          <p><strong>Registered:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px;">
          <h3 style="margin-top: 0;">Documents Submitted:</h3>
          <p>✅ Aadhaar: ${caregiver.documents?.aadhaar?.number || 'N/A'}</p>
          <p>✅ PAN: ${caregiver.documents?.pan?.number || 'N/A'}</p>
        </div>
        
        <div style="margin-top: 30px;">
          <p><strong>Action Required:</strong></p>
          <p>Please review the documents and approve or reject this caregiver.</p>
          
          <a href="https://carenest-backend-1.onrender.com/api/admin/caregivers/${caregiver._id}" 
             style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            View Details
          </a>
        </div>
        
        <p style="margin-top: 30px; color: #6B7280; font-size: 14px;">
          This is an automated notification from CareNest Admin System.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent');
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
};

export const sendApprovalEmail = async (caregiver) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: caregiver.email,
    subject: '🎉 Congratulations! Your CareNest Profile is Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Profile Approved!</h1>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Dear ${caregiver.name},</p>
          
          <p>Great news! Your caregiver profile has been approved and is now <strong>LIVE</strong> on CareNest! 🚀</p>
          
          <div style="background-color: #ECFDF5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
            <h3 style="color: #065F46; margin-top: 0;">✅ Your Profile is Now Visible</h3>
            <p style="margin-bottom: 0;">Families looking for caregivers can now see your profile, experience, and specializations.</p>
          </div>
          
          <div style="margin: 30px 0;">
            <h3>What You Can Do Now:</h3>
            <ul style="line-height: 1.8;">
              <li>✅ Log in to your dashboard</li>
              <li>✅ View and respond to booking requests</li>
              <li>✅ Update your profile and availability</li>
              <li>✅ Connect with families in need</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://carenest-frontend-nu.vercel.app/login" 
               style="display: inline-block; background-color: #4F46E5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>
          
          <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin-top: 30px;">
            <p style="margin: 0; font-size: 14px; color: #6B7280;">
              <strong>Tips for Success:</strong><br>
              • Keep your profile updated<br>
              • Respond promptly to booking requests<br>
              • Maintain professional communication<br>
              • Build a good reputation through quality service
            </p>
          </div>
          
          <p style="margin-top: 30px;">
            If you have any questions, feel free to reach out to us at 
            <a href="mailto:support@carenest.com" style="color: #4F46E5;">support@carenest.com</a>
          </p>
          
          <p style="margin-top: 30px;">
            Best of luck!<br>
            <strong>The CareNest Team</strong>
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #6B7280; font-size: 12px;">
          <p>© 2025 CareNest. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Approval email sent to:', caregiver.email);
  } catch (error) {
    console.error('Error sending approval email:', error);
  }
};

export const sendRejectionEmail = async (caregiver, reason) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: caregiver.email,
    subject: 'CareNest Registration Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #DC2626;">Registration Update</h2>
        
        <p>Dear ${caregiver.name},</p>
        
        <p>Thank you for your interest in becoming a caregiver on CareNest.</p>
        
        <div style="background-color: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DC2626;">
          <p><strong>Status:</strong> Unable to verify at this time</p>
          <p><strong>Reason:</strong> ${reason || 'Documents verification incomplete'}</p>
        </div>
        
        <p>You can re-register with updated information and documents.</p>
        
        <p style="margin-top: 30px;">
          If you have any questions, please contact us at 
          <a href="mailto:support@carenest.com">support@carenest.com</a>
        </p>
        
        <p>Best regards,<br><strong>The CareNest Team</strong></p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Rejection email sent to:', caregiver.email);
  } catch (error) {
    console.error('Error sending rejection email:', error);
  }
};