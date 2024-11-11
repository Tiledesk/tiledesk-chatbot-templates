const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");

const Faq_kb = require('./models/faq_kb');
const faqService = require('./services/faqService');
const faqKbService = require('./services/faqKbService');

let log = false;

router.get('/', (req, res) => {
  res.send('Hello Chatbot Templates!');
});

// router.get('/public/community', async (req, res) => {
//   let bots = [];
//   let query = {public: true, certified: false};
//   try {
//     bots = await faqKbService.getAll(query);
//     res.send(bots);
//   }
//   catch (err) {
//     console.error('Get Bots Error ', err);
//     return res.status(500).send({ success: false, msg: 'Error getting bots.' });
//   }
// });

//RETURN THE SEARCH FULLTEXT OR FOR LANGUAGE AND CATEGORY
router.get('/public/community', async (req, res) => { // ?text=...
  // full-text
  let text = req.query.text;
  // language chatbot
  let lang = req.query.lang;
  //mainCategory chatbot
  let category = req.query.category;
  let bots = [];
  let query = { public: true, "trashed": { $in: [null, false] } };
  //let query = { public: true, "trashed": { $in: [null, false] }, language: req.query.language };
  //query.language = req.query.language;
  // var query = { "id_project": req.projectid, "trashed": { $in: [null, false] } };

  // CONTROLL THE LANGUAGE SELECTED FROM THE USER
  if (lang && lang != 'undefined' && lang != 'all_lang') {
    if (lang.split('-').length > 1) {
      const lang1 = lang.split('-')[0];
      const lang2 = lang.split('-')[1];
      query.language = { '$in': [lang1, lang2] };
    } else {
      query.language = { '$in': [lang] };
    }
  }
  // CONTROLL THE CATEGORY SELECTED FROM THE USER
  if (category && category != 'undefined' && category != 'all_cat') {
    query.mainCategory = { '$in': [category] };
  }
  // CONTROLL THE FULL TEXT SEARCH 
  let search_obj = { "$search": text };
  if (text && text != 'undefined') {
    query.$text = search_obj;
  }
  try {
    bots = await faqKbService.getAll(query);
    res.send(bots);
  }
  catch (err) {
    console.error('Get Bots Error ', err);
    return res.status(500).send({ success: false, msg: 'Error getting bots.' });
  }
});

router.get('/public/author/:authoid', async (req, res) => {
  // author chatbot
  let authorid = req.params.authoid;
  let bots = [];
  let query = { 'public': true, trashed: { $in: [null, false] }, createdBy: { $eq: authorid } };
  try {
    bots = await faqKbService.getAll(query);
    res.send(bots);
  }
  catch (err) {
    console.error('GET FAQ-KBs ERROR ', err);
    return res.status(500).send({ success: false, msg: 'Error getting bots.' });
  }
});

router.get('/public/templates', async (req, res) => {
  let bots = [];
  let query = { public: true, certified: true, "trashed": { $in: [null, false] } };
  try {
    bots = await faqKbService.getAll(query);
    res.send(bots);
  }
  catch (err) {
    console.error('GET FAQ-KBs ERROR ', err);
    return res.status(500).send({ success: false, msg: 'Error getting bots.' });
  }
});

// router.get('/public/community/system/:mainCategory', async (req, res) => {
//   let bots = [];
//   let query = {public: true, certified: true};
//   try {
//     bots = await faqKbService.getAll(query);
//     let botId = publicBotByCategory(bots, mainCategory);
//   }
//   catch (err) {
//     console.error('GET FAQ-KBs ERROR ', err);
//     return res.status(500).send({ success: false, msg: 'Error getting bots.' });
//   }
// });

router.get('/public/templates/:botid', (req, res) => {
  let id_faq_kb = req.params.botid;
  Faq_kb.findById(id_faq_kb, async (err, faq_kb) => {
    if (err) {
      console.error('GET FAQ-KB ERROR ', err)
      return res.status(500).send({ success: false, msg: 'Error getting bot.' });
    }
    else if (!faq_kb) {
      return res.status(404).send({ success: false, msg: 'Not found.' });
    }
    else if (faq_kb["public"]) {
      let faqs = null;
      try {
        faqs = await faqService.getAll(id_faq_kb); //.then((faqs) => {
        const intents = faqs.map(({ _id, id_project, topic, status, id_faq_kb, createdBy, createdAt, updatedAt, __v, ...keepAttrs }) => keepAttrs)
        let json = {
          webhook_enabled: faq_kb.webhook_enabled,
          webhook_url: faq_kb.webhook_url,
          language: faq_kb.language,
          name: faq_kb.name,
          title: faq_kb.title,
          short_description: faq_kb.short_description,
          type: faq_kb.type,
          //description: faq_kb.description,
          mainCategory: faq_kb.mainCategory,
          attributes: faq_kb.attributes,
          intents: intents
        }
        return res.send(json);
      }
      catch (err) {
        console.error('GET FAQ ERROR: ', err)
        return res.status(500).send({ success: false, msg: 'Error getting faqs.' });
      }
    }
    else {
      res.status(403).send({ success: false, message: "Forbidden" });
    }
  })
});

/**
 * This route serves all the bots metadata for templates/community purposes
 * 1. import certified templates
 * 2. import community chatbots
 */
router.get('/public/templates/windows/:botid', (req, res) => {
  let id_faq_kb = req.params.botid;
  Faq_kb.findById(id_faq_kb, async (err, faq_kb) => {
    if (err) {
      console.error('GET FAQ-KB ERROR ', err)
      return res.status(500).send({ success: false, msg: 'Error getting bot.' });
    }
    else if (!faq_kb) {
      return res.status(404).send({ success: false, msg: 'Not found.' });
    }
    else if (faq_kb["public"]) {
      let json = {
        _id: faq_kb._id,
        certified: faq_kb.certified,
        language: faq_kb.language,
        name: faq_kb.name,
        type: faq_kb.type,
        description: faq_kb.description,
        tags: faq_kb.tags,
        title: faq_kb.title,
        short_description: faq_kb.short_description,
        bigImage: faq_kb.bigImage,
        mainCategory: faq_kb.mainCategory,
        attributes: faq_kb.attributes,
        templateFeatures: faq_kb.templateFeatures,
        id_project: faq_kb.id_project,
        certifiedTags: faq_kb.certifiedTags,
        createdBy: faq_kb.createdBy,
        createdAt: faq_kb.createdAt,
        updatedAt: faq_kb.updatedAt
      }
      return res.send(json);
    }
    else {
      res.status(403).send({ success: false, message: "Forbidden" });
    }
  })
});

// function publicBotByCategory(bots, category) {
//   if (!bots || bots.length == 0) {
//     console.error("Error: Bots are empty. Can't find by category");
//     return null;
//   }
//   for (let i = 0; i < bots.length; i++)  {
//     let bot = bots[i];
//     console.log('Bot: ', JSON.stringify(bot));
//     if (bot.mainCategory === category) {
//       return bot._id;
//     }
//   }
//   return null;
// }

async function startApp(settings, callback) {

  if (!settings.MONGODB_URL) {
    console.error("(ChatbotTemplates) MONGODB_URL is mandatory. Exit...");
    return callback("Missing parameter: MONGODB_URL");
  }

  if (settings.CHATBOT_TEMPLATES_LOG) {
    log = true;
  }

  mongoose.connect(settings.MONGODB_URL, { "useNewUrlParser": true, "autoIndex": false }, async (err) => {
    if (err) {
      console.error("(ChatbotTemplates) Failed to connect to MongoDB on " + settings.MONGODB_URL + " ", err);
    } else {
      console.log("(ChatbotTemplates) mongodb connection ok.");

      if (callback) {
        callback(null);
      }
    }
  })

}

module.exports = { router: router, startApp: startApp };