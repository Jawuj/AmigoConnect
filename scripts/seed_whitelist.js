const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Debes descargar esto de la consola de Firebase

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const teachers = [
    { email: 'profesor.perez@amigo.edu.co', fullName: 'Juan Pérez', faculty: 'Ingeniería' },
    { email: 'marisela.rojas@amigo.edu.co', fullName: 'Marisela Rojas', faculty: 'Tecnología' },
    { email: 'jawujj@gmail.com', fullName: 'DDDDD DDDD', faculty: 'Tecnología' },

];

const companies = [
    { domain: '@claro.com', name: 'Claro Colombia' },
    { domain: '@bancolombia.com.co', name: 'Bancolombia' },
    { domain: '@amigo.edu.co', name: 'Fundación Universitaria Luis Amigó' },

];

async function seedWhitelist() {
    // Seed Teachers (Por Email)
    for (const teacher of teachers) {
        await db.collection('whitelist_teachers').doc(teacher.email).set({
            fullName: teacher.fullName,
            faculty: teacher.faculty,
            addedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Docente autorizado: ${teacher.email}`);
    }

    // Seed Companies (Por Dominio)
    for (const company of companies) {
        await db.collection('whitelist_companies').doc(company.domain).set({
            name: company.name,
            addedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Dominio de empresa autorizado: ${company.domain}`);
    }
    process.exit();
}

seedWhitelist().catch(console.error);
