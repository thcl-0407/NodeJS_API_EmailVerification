require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const swaggerUI = require('swagger-ui-express')
const swaggerDoc = require('swagger-jsdoc')
const emailControl = require('./controls/email.control.js')
const fs = require('fs')
const redis = require('redis')
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
})

app.use(express.json())
app.use(cors())

const options = {
    definition: {
        openapi: "3.0.1",
        info: {
          title: 'Email Verificarion',
          version: '1.0.0',
        },
        servers: [
            {
                url: "http://localhost:" + process.env.PORT
            }
        ],
        host: "http://localhost: " + process.env.PORT
      },
      apis: ['./*.js', './controls/*.js'],
}

const uiOptions = {
    customSiteTitle: "Email Verification",
    explorer: false
}

const swaggerSpecs = swaggerDoc(options)

app.use('/emailverification/doc', swaggerUI.serve)
app.use('/emailverification/doc', swaggerUI.setup(swaggerSpecs, uiOptions))

app.get('/', (req, res)=>{
    res.redirect('/emailverification/doc')
})

/**
 * @swagger
 * /api/email/send:
 *   post:
 *     tags:
 *       - Email
 *     responses:
 *       200:
 *          description: OK
 *     summary: Send Email Verify
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *                  email:
 *                      type: string
 *                      default: "abc@gmail.com"
 *                  id:
 *                      type: string
 *                      default: "XUmRcbvKXKwskFhctGmQuADmgYHA"
 */
app.post('/api/email/send', (req, res)=>{
    if(req.body.email == undefined || req.body.id == undefined){
        res.json(
            {
                status: false,
                code: 404
            }
        )
    }

    let _email = req.body.email
    let _id = req.body.id
    let RegexCheckEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/

    if(RegexCheckEmail.test(_email) && _id.length > 0){
        let _token = require('./controls/jwt.control.js').GenerateToken(req.body)

        let payload = {
            email: _email,
            token: _token
        }

        emailControl.SendEmailVerification(payload, (status, result)=>{
            
            console.log(new Date(Date.now()).toUTCString() + ": Response Send Email: ", result)

            if(status){
                res.json({
                    status: status,
                    code: 202,
                    message: "Email have sent !"
                })    
            }else{
                res.json({
                    status: status,
                    code: 200,
                    message: "Have a error while email have been sending"
                })
            }
        })
    }else{
        res.json(
            {
                status: false,
                code: 404
            }
        )
    }
})

app.get('/email/verify/:token', (req, res)=>{
    redisClient.get(req.params.token, (err, reply)=>{
        if(reply != null){
            let html = fs.readFileSync(__dirname + '/controls/templates/404.html')
            res.send(html.toString('utf-8'))
            return
        }else{
            require('./controls/jwt.control.js').VerifyToken(req.params.token, (status, decoded)=>{
                if(!status){
                    let html = fs.readFileSync(__dirname + '/controls/templates/404.html')
                    res.send(html.toString('utf-8'))
                }else{
                    redisClient.set(req.params.token, req.params.token)
                    
                    let html = fs.readFileSync(__dirname + '/controls/templates/200.html')
                    res.send(html.toString('utf-8'))
                }
            })
        }
    })
})

app.listen(process.env.PORT, ()=>{
    console.log(new Date(Date.now()).toUTCString() + ": Starting on port: " + process.env.PORT)
})

