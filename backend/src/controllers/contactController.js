import Contact from '../models/Contact.js';
import AuditLog from '../models/AuditLog.js';

/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Contact form endpoints
 */

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Submit contact form
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contact message sent successfully
 *       400:
 *         description: Validation error
 */
export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const contact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
      meta: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        source: 'website'
      }
    });

    await contact.save();

    // Log the contact submission
    await AuditLog.logAction(
      null, 
      'create', 
      'contacts', 
      contact._id, 
      { email, subject }, 
      req
    );

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
      data: {
        id: contact._id,
        status: contact.status
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
};

