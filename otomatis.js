const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = getFirestore('mentcare');

// URL Webhook milikmu
const WEBHOOK_URL = 'https://hook.eu1.make.com/3dvaamvy5v00w6ivl02gmb95oxa536qa';

async function kirimKeWebhook(data) {
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    console.log('✅ Data berhasil dikirim ke Make.com!');
  } catch (err) {
    console.error('❌ Gagal kirim ke Webhook:', err.message);
  }
}

// Pantau Database
db.collection('users').onSnapshot(async (snapshot) => {
  for (const change of snapshot.docChanges()) {
    if (change.type === 'added') {
      const data = change.doc.data();
      await kirimKeWebhook({ type: 'user', ...data });
    }
  }
});

db.collection('scans').onSnapshot(async (snapshot) => {
  for (const change of snapshot.docChanges()) {
    if (change.type === 'added') {
      const data = change.doc.data();
      await kirimKeWebhook({ type: 'scan', ...data });
    }
  }
});

console.log('🚀 Robot AKTIF dan terhubung ke Make.com!');