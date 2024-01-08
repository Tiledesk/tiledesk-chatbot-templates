require('dotenv').config();
const express = require('express');
const app = express();

const templates = require('./templateRoute');
const templatesRoute = templates.router;

app.use("/", templatesRoute);

const MONGODB_URL = process.env.MONGODB_URL
const CHATBOT_TEMPLATES_LOG = process.env.CHATBOT_TEMPLATES_LOG || "1";

templates.startApp(
    {
        MONGODB_URL: MONGODB_URL,
        CHATBOT_TEMPLATES_LOG: CHATBOT_TEMPLATES_LOG
    }, (err) => {

        if (!err) {
            console.log("Chatbot Templates route successfully started.");
            var port = process.env.PORT || 3000;
            app.listen(port, function() {
                console.log("Chatbot Templates listening on port: ", port);
            })
        } else {
            console.error("(Warning) Unable to start tiledesk-chatbot-templates.", err);
        }
    }
);