require('dotenv').config()
const fs = require('fs')
const log = require('./../logs/log.js')
const sendGrid = require('@sendgrid/mail')
sendGrid.setApiKey(process.env.API_KEY)

const SendEmailVerification = (payload, callback)=>{
    let html = fs.readFileSync(__dirname + '/templates/01.html');
    let strHtml = html.toString('utf-8')
    let VerifyLink = process.env.PREFIX_LINK + payload.token

    strHtml = strHtml.replace('{LINK_1}', VerifyLink)
    strHtml = strHtml.replace('{LINK_2}', VerifyLink)
    strHtml = strHtml.replace('{LINK_3}', VerifyLink)

    const configs = {
        to: payload.email,
        from: {
            name: "GenMono",
            email: "genmono47@gmail.com"
        },
        subject: "[GenMono] Xac Thuc Email Cua Ban",
        html: strHtml
    }

    sendGrid.send(configs).then(
        (result)=>{
            log.LogAction("Sended Email Verification", true);
            callback(true, result)
        }, (error => {
            log.LogAction("Sended Email Verification", false);
            callback(false, error)
        })
    )
}

module.exports = {
    SendEmailVerification
}
