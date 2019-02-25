/* eslint-disable  func-names */
/* eslint-disable  no-console */
/* eslint-disable  no-restricted-syntax */

// IMPORTANT: Please note that this template uses Dispay Directives,
// Display Interface for your skill should be enabled through the Amazon developer console
// See this screenshot - https://alexa.design/enabledisplay

const Alexa = require('ask-sdk-core');
const skillBuilder = Alexa.SkillBuilders.custom();
const Handlers = require('./handlers.js');
const Interceptors = require('./interceptors.js');


/* LAMBDA SETUP */
exports.handler = skillBuilder
  .addRequestHandlers(
    Handlers.LaunchRequestHandler,
    Handlers.QuizHandler,
    Handlers.QuizAnswerHandler,
    Handlers.RepeatHandler,
    Handlers.HelpHandler,
    Handlers.ExitHandler,
    Handlers.SessionEndedRequestHandler
  )
  .addErrorHandlers(Handlers.ErrorHandler)
  .addRequestInterceptors(Interceptors.consoleLogIntentAndData)
  .addResponseInterceptors(Interceptors.logSpeechOutput)
  .lambda();