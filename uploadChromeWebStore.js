const fs = require('fs');

const webStore = require('chrome-webstore-upload')({
    // extensionId: 'opegccnobejfanodcbnnpiklkoglpioi', // Testing Extension
    extensionId: 'dibbclmoocoenjjdjgdmgdbedcjeafjl', // Production Extension
    clientId: '1053282626377-g47fop0e5uhsm2ln7bi11b5ukleckdv5.apps.googleusercontent.com',
    clientSecret: '9fjOwgyAVWADHmq9nbKuSh4W',
    refreshToken: '1/5r_OPYJt8G1iP6CcgKjDjn_QRNPk8RRLJ7JZ1K7qNfBWzA_PPNFffuegwhdljIoZ',
});

webStore.fetchToken().then(token => {
    const myZipFile = fs.createReadStream('./dist.zip');
    webStore.uploadExisting(myZipFile, token).then(() => {
        const target = 'trustedTesters'; // optional. Can also be 'trustedTesters'
        webStore.publish(target, token).then(res => {
            if (res.status == ['ITEM_PENDING_REVIEW']) {
                console.log('Successfuly uploaded to chrome store');
            }
        });
    });
});
