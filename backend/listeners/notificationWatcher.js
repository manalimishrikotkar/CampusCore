// listeners/notificationWatcher.js
const mongoose = require('mongoose');
const QnA = require('../models/QnA');
const Notes = require('../models/Post');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService'); // <-- must exist

/**
 * Starts all MongoDB change stream watchers for notifications
 */
async function startNotificationWatcher() {
  try {
    const db = mongoose.connection;
    console.log('📡 Starting unified notification watcher...');

    const changeStream = db.watch([
      { $match: { operationType: { $in: ['insert', 'update'] } } }
    ]);
    console.log("change stream", changeStream);
    changeStream.on('change', async (change) => {
      console.log("In changed",change);
      console.log("In changed stream 😂");
      try {
        const ns = change.ns.coll; // collection name
        const updatedFields = change.updateDescription?.updatedFields || {};
        const fullDoc = change.fullDocument;
        console.log("change1", change);


        /* ============================================================
         *  QnA NOTIFICATIONS
         * ============================================================
         */
        console.log("ns", ns);
        if (ns === 'qnas') {
          // ✅ Detect new reply addition
          console.log("UF", updatedFields);
          console.log("change qna", change);



          const replyAdded = Object.keys(updatedFields).some(
            f => f === "replies" || /^replies\.\d+$/.test(f)
          );

          console.log("reply", replyAdded);
          if (replyAdded) {
            const qna = await QnA.findById(change.documentKey._id)
              .populate('createdBy', 'name email');

            if (qna?.createdBy?.email) {
              console.log("createdby", qna.createdBy.email);
              await sendEmail(
                qna.createdBy.email,
                'Your query was answered!',
                `Someone just replied to your question: "${qna.question}". Visit CampusCore to check it out.`
              );
              console.log(`📧 QnA reply notification sent to ${qna.createdBy.email}`);
            } else {
              console.log(`ℹ️ QnA ${qna._id}: no creator email found`);
            }
          }
        }

        /* ============================================================
         *  NOTES NOTIFICATIONS
         * ============================================================
         */

        if (ns === 'posts') {
          // 📝 Case 1: New note inserted with approvalStatus = 'pending'
          if (change.operationType === 'insert' && fullDoc.approvalStatus === 'pending') {
            const admins = await User.find({ role: 'admin' });
            for (const admin of admins) {
              if (admin.email) {
                await sendEmail(
                  admin.email,
                  'New Note Pending Approval',
                  `A new note titled "${fullDoc.title}" has been uploaded and awaits your review.`
                );
              }
            }
            console.log(`📧 Notified ${admins.length} admin(s) about note "${fullDoc.title}".`);
          }
          
          // 🟢 Case 2: approvalStatus changed to 'approved'
          const approvalChangedToApproved =
            Object.keys(updatedFields).includes('approvalStatus') &&
            updatedFields.approvalStatus === 'approved';
          console.log("approval",approvalChangedToApproved);
          if (approvalChangedToApproved) {
            const note = await Notes.findById(change.documentKey._id)
              .populate('createdBy', 'name email');

            if (note?.createdBy?.email) {
              await sendEmail(
                note.createdBy.email,
                'Your Note Has Been Approved!',
                `Congratulations! Your note titled "${note.title}" has been approved and is now visible to others.`
              );
              console.log(`📧 Note approval email sent to ${note.createdBy.email}`);
            }
          }
        }
      } catch (err) {
        console.error('❌ Error inside watcher event handler:', err);
      }
    });

    console.log('✅ Unified Notification Watcher running...');
  } catch (err) {
    console.error('❌ Failed to initialize unified watcher:', err);
  }
}

module.exports = { startNotificationWatcher };
