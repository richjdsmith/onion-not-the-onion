// REQUEST INTERCEPTORS
const consoleLogIntentAndData = {
  async process(handlerInput) {
    const {
      request,
      session
    } = handlerInput.requestEnvelope;
    try {
      if (session.new) {
        console.log(JSON.stringify(handlerInput.requestEnvelope));
      }
      // console.log(handlerInput.sessionAttributes);
      if (request.type === 'LaunchRequest') {
        console.log('Intent:');
        console.log('LAUNCH REQUEST');
      } else if (request.intent && request.intent.name) {
        console.log('Intent:');
        console.log(JSON.stringify(request.intent.name));
        if (request.intent && request.intent.slots && request.intent.slots !== 'undefined') {
          console.log('Slots:');
          console.log(JSON.stringify(request.intent.slots));
        }
      }
      return;
    } catch (error) {
      console.log('Error in interceptor.js#ConsoleLogIntentAndData');
      console.log(error);
      return;
    }
  }
};

// RESPONSE INTERCEPTORS
const logSpeechOutput = {
  process(handlerInput) {
    console.log('END OF RESPONSE');
    console.log('Speech Output:');
    console.log(JSON.stringify(handlerInput.responseBuilder.getResponse(), null, 2));
  },
};

module.exports = {
  consoleLogIntentAndData: consoleLogIntentAndData,
  logSpeechOutput: logSpeechOutput
};