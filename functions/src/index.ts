import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();

// Email service configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: functions.config().gmail.email,
    pass: functions.config().gmail.password,
  },
});

// Send email function
async function sendEmail(to: string, subject: string, text: string, html?: string) {
  const mailOptions = {
    from: `"Al-Hamd Cars" <${functions.config().gmail.email}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Trigger: Send email when booking status changes
export const onBookingStatusChange = functions.firestore
  .document('testDriveBookings/{bookingId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    if (before.status !== after.status) {
      // Get customer details
      const customerDoc = await admin.firestore().doc(`users/${after.customerId}`).get();
      const customerData = customerDoc.data();
      
      // Get vehicle details
      const vehicleDoc = await admin.firestore().doc(`vehicles/${after.vehicleId}`).get();
      const vehicleData = vehicleDoc.data();
      
      const statusMessages = {
        'confirmed': 'تم تأكيد حجز موعد القيادة',
        'cancelled': 'تم إلغاء حجز موعد القيادة',
        'completed': 'تم إكمال موعد القيادة بنجاح',
        'no_show': 'لم يحضر العميل للموعد المحدد'
      };
      
      const subject = `تحديث حالة حجز موعد القيادة - ${vehicleData?.make} ${vehicleData?.model}`;
      const text = `
عزيزي/عزيزتي ${customerData?.name},

${statusMessages[after.status]}

تفاصيل الموعد:
- السيارة: ${vehicleData?.make} ${vehicleData?.model}
- التاريخ: ${after.date.toDate().toLocaleDateString('ar-EG')}
- الوقت: ${after.timeSlot}
- الحالة الحالية: ${after.status}

مع تحيات،
فريق Al-Hamd Cars
      `;
      
      await sendEmail(customerData?.email, subject, text);
    }
    
    return null;
  });

// Trigger: Send email for service booking status changes
export const onServiceBookingStatusChange = functions.firestore
  .document('serviceBookings/{bookingId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    if (before.status !== after.status) {
      // Get customer details
      const customerDoc = await admin.firestore().doc(`users/${after.customerId}`).get();
      const customerData = customerDoc.data();
      
      // Get service details
      const serviceDoc = await admin.firestore().doc(`serviceTypes/${after.serviceTypeId}`).get();
      const serviceData = serviceDoc.data();
      
      const statusMessages = {
        'confirmed': 'تم تأكيد حجز موعد الصيانة',
        'cancelled': 'تم إلغاء حجز موعد الصيانة',
        'completed': 'تم إكمال موعد الصيانة بنجاح',
        'no_show': 'لم يحضر العميل للموعد المحدد'
      };
      
      const subject = `تحديث حالة حجز موعد الصيانة - ${serviceData?.name}`;
      const text = `
عزيزي/عزيزتي ${customerData?.name},

${statusMessages[after.status]}

تفاصيل الموعد:
- الخدمة: ${serviceData?.name}
- التاريخ: ${after.date.toDate().toLocaleDateString('ar-EG')}
- الوقت: ${after.timeSlot}
- الحالة الحالية: ${after.status}

مع تحيات،
فريق Al-Hamd Cars
      `;
      
      await sendEmail(customerData?.email, subject, text);
    }
    
    return null;
  });

// Scheduled function: Clean up old bookings
export const cleanupOldBookings = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const bookingsRef = admin.firestore().collection('testDriveBookings');
    const serviceBookingsRef = admin.firestore().collection('serviceBookings');
    
    // Clean up old test drive bookings
    const oldTestDriveBookings = await bookingsRef
      .where('date', '<', thirtyDaysAgo)
      .where('status', 'in', ['completed', 'cancelled'])
      .get();
    
    const batch = admin.firestore().batch();
    oldTestDriveBookings.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Clean up old service bookings
    const oldServiceBookings = await serviceBookingsRef
      .where('date', '<', thirtyDaysAgo)
      .where('status', 'in', ['completed', 'cancelled'])
      .get();
    
    oldServiceBookings.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    console.log(`Cleaned up ${oldTestDriveBookings.size} test drive bookings and ${oldServiceBookings.size} service bookings`);
    
    return null;
  });

// HTTP Function: Send promotional email
export const sendPromotionalEmail = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated and has admin role
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }
  
  const { subject, message, customerSegment } = data;
  
  // Get customers based on segment
  let customersQuery = admin.firestore().collection('users');
  
  if (customerSegment === 'recent') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    customersQuery = customersQuery.where('createdAt', '>=', thirtyDaysAgo);
  } else if (customerSegment === 'active') {
    // Get customers with recent bookings
    const recentBookings = await admin.firestore()
      .collection('testDriveBookings')
      .where('date', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .get();
    
    const customerIds = recentBookings.docs.map(doc => doc.data().customerId);
    customersQuery = customersQuery.where(admin.firestore.FieldPath.documentId(), 'in', customerIds);
  }
  
  const customersSnapshot = await customersQuery.get();
  const customers = customersSnapshot.docs.map(doc => doc.data());
  
  // Send emails to all customers
  const emailPromises = customers.map(customer => {
    return sendEmail(
      customer.email,
      subject,
      `عزيزي/عزيزتي ${customer.name},\n\n${message}\n\nمع تحيات،\nفريق Al-Hamd Cars`
    );
  });
  
  await Promise.all(emailPromises);
  
  return { 
    success: true, 
    emailsSent: customers.length,
    message: `Promotional email sent to ${customers.length} customers`
  };
});

// Trigger: Update vehicle status when sold
export const onVehicleSold = functions.firestore
  .document('vehicles/{vehicleId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    if (before.status !== 'SOLD' && after.status === 'SOLD') {
      // Update all pending bookings for this vehicle
      const bookingsRef = admin.firestore().collection('testDriveBookings');
      const pendingBookings = await bookingsRef
        .where('vehicleId', '==', context.params.vehicleId)
        .where('status', '==', 'PENDING')
        .get();
      
      const batch = admin.firestore().batch();
      pendingBookings.forEach(doc => {
        batch.update(doc.ref, { 
          status: 'CANCELLED',
          notes: (doc.data().notes || '') + '\n\nVehicle sold - booking automatically cancelled'
        });
      });
      
      await batch.commit();
      
      console.log(`Cancelled ${pendingBookings.size} bookings for sold vehicle ${context.params.vehicleId}`);
    }
    
    return null;
  });

// HTTP Function: Generate daily report
export const generateDailyReport = functions.https.onRequest(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Get today's bookings
  const testDriveBookings = await admin.firestore()
    .collection('testDriveBookings')
    .where('date', '>=', today)
    .where('date', '<', tomorrow)
    .get();
  
  const serviceBookings = await admin.firestore()
    .collection('serviceBookings')
    .where('date', '>=', today)
    .where('date', '<', tomorrow)
    .get();
  
  const report = {
    date: today.toISOString().split('T')[0],
    testDriveBookings: testDriveBookings.size,
    serviceBookings: serviceBookings.size,
    totalBookings: testDriveBookings.size + serviceBookings.size,
    breakdown: {
      pending: testDriveBookings.docs.filter(doc => doc.data().status === 'PENDING').length +
               serviceBookings.docs.filter(doc => doc.data().status === 'PENDING').length,
      confirmed: testDriveBookings.docs.filter(doc => doc.data().status === 'CONFIRMED').length +
                serviceBookings.docs.filter(doc => doc.data().status === 'CONFIRMED').length,
      completed: testDriveBookings.docs.filter(doc => doc.data().status === 'COMPLETED').length +
                serviceBookings.docs.filter(doc => doc.data().status === 'COMPLETED').length,
      cancelled: testDriveBookings.docs.filter(doc => doc.data().status === 'CANCELLED').length +
                serviceBookings.docs.filter(doc => doc.data().status === 'CANCELLED').length
    }
  };
  
  // Save report to Firestore
  await admin.firestore().collection('dailyReports').add({
    ...report,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  res.status(200).json(report);
});