const states = {
  START: `_START`,
  QUIZ: `_QUIZ`,
};
const Builders = require('./builders.js');


/* CONSTANTS */


const LaunchRequestHandler = {
  canHandle(handlerInput) {
    console.log("Inside LaunchRequestHandler");
    console.log("FART");
    console.log(handlerInput.requestEnvelope.request);
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    let speechText = `Welcome to Onion Not The Onion! You can ask me for a random Onion Headline or a headline that really should be in the onion, or you can ask me to start a quiz.  What would you like to do?`;
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const QuizHandler = {
  canHandle(handlerInput) {
    console.log("Inside QuizHandler");
    const request = handlerInput.requestEnvelope.request;
    console.log('Logging Intent Request:');
    console.log(request.intent.name);
    // console.log(JSON.stringify(request));
    return request.type === "IntentRequest" &&
      (request.intent.name === "QuizIntent" || request.intent.name === "AMAZON.StartOverIntent");
  },
  handle(handlerInput) {
    console.log("Inside QuizHandler - handle");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const response = handlerInput.responseBuilder;
    attributes.state = states.QUIZ;
    attributes.counter = 0;
    attributes.quizScore = 0;
    attributes.wrongAnswerCounter = 0;
    attributes.indexPosition = 0;
    attributes.randomIndexArray = Builders.generateRandomIndex();

    let startQuizMessage = "Alright, let's do this. I'm going to tell you different headlines and then you're going to guess if they're real or not. You can reply by saying things like, 'true' and 'real', or, 'fake', and 'fake news'.";
    var question = Builders.askQuestion(handlerInput);
    var speakOutput = startQuizMessage + question;
    var repromptOutput = question;

    return response
      .speak(speakOutput)
      .withSimpleCard("Onion Not The Onion", speakOutput)
      .reprompt(repromptOutput)
      .getResponse();
  },
};


const QuizAnswerHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    console.log("Inside QuizAnswerHandler");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    return attributes.state === states.QUIZ &&
      request.type === 'IntentRequest' &&
      request.intent.name === 'AnswerIntent';
  },
  handle(handlerInput) {
    console.log("Inside QuizAnswerHandler - handle");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const response = handlerInput.responseBuilder;

    var speakOutput = ``;
    var repromptOutput = ``;
    const item = attributes.quizItem;
    const isCorrect = Builders.compareSlots(handlerInput.requestEnvelope.request.intent.slots, item);
    if (isCorrect) {
      speakOutput = Builders.getSpeechCon(true);
      attributes.quizScore += 1;
      handlerInput.attributesManager.setSessionAttributes(attributes);
    } else {
      attributes.wrongAnswerCounter += 1;
      speakOutput = Builders.getSpeechCon(false);
    }

    speakOutput += Builders.getAnswer(item);
    let question = ``;
    //IF YOUR QUESTION COUNT IS LESS THAN 10, WE NEED TO ASK ANOTHER QUESTION.
    if (attributes.counter < 10) {
      speakOutput += Builders.getCurrentScore(attributes.quizScore, attributes.counter);
      question = Builders.askQuestion(handlerInput);
      speakOutput += question;
      repromptOutput = question;

      return response.speak(speakOutput)
        .withSimpleCard('Onion Not The Onion', speakOutput)
        .reprompt(repromptOutput)
        .getResponse();
    } else {
      let exitSkillMessage = `Thank you for playing the United States Quiz Game!  Let's play again soon!`;
      speakOutput += Builders.getFinalScore(attributes.quizScore, attributes.counter) + exitSkillMessage;

      return response.speak(speakOutput)
        .withSimpleCard('Onion Not The Onion', speakOutput)
        .getResponse();
    }
  },
};

const RepeatHandler = {
  canHandle(handlerInput) {
    console.log("Inside RepeatHandler");
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    return attributes.state === states.QUIZ && request.type === "IntentRequest" &&
      request.intent.name === "AMAZON.RepeatIntent";
  },
  handle(handlerInput) {
    console.log("Inside RepeatHandler - handle");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const question = Builders.getQuestion(attributes.counter, attributes.quizItem);

    return handlerInput.responseBuilder
      .speak(question)
      .reprompt(question)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    console.log("Inside HelpHandler");
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    console.log("Inside HelpHandler - handle");
    let helpMessage = 'You can start a quiz by just asking, "Start a quiz". From there, I will give you headlines and you need to guess if they are real or fake. You can guess by saying things like, "That\'s fake news", or "That must be true".  What would you like to do?';
    return handlerInput.responseBuilder
      .speak(helpMessage)
      .reprompt(helpMessage)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    console.log("Inside ExitHandler");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;

    return request.type === `IntentRequest` && (
      request.intent.name === 'AMAZON.StopIntent' ||
      request.intent.name === 'AMAZON.PauseIntent' ||
      request.intent.name === 'AMAZON.CancelIntent'
    );
  },
  handle(handlerInput) {
    let exitSkillMessage = `Thank you for playing Onion Not The Onion! Let's play again soon!`;
    return handlerInput.responseBuilder
      .speak(exitSkillMessage)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    console.log("Inside SessionEndedRequestHandler");
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    console.log("Inside ErrorHandler");
    return true;
  },
  handle(handlerInput, error) {
    console.log("Inside ErrorHandler - handle");
    console.log(`Error handled: ${JSON.stringify(error)}`);
    console.log(`Handler Input: ${JSON.stringify(handlerInput)}`);
    let helpMessage = `You can answer whether a headline is real or fake by saying things like "that's fake news". You can start a new quiz by saying start a quiz. What would you like to do?`;
    return handlerInput.responseBuilder
      .speak(helpMessage)
      .reprompt(helpMessage)
      .getResponse();
  },
};

module.exports = {
  LaunchRequestHandler: LaunchRequestHandler,
  QuizHandler: QuizHandler,
  QuizAnswerHandler: QuizAnswerHandler,
  RepeatHandler: RepeatHandler,
  HelpHandler: HelpHandler,
  ExitHandler: ExitHandler,
  SessionEndedRequestHandler: SessionEndedRequestHandler,
  ErrorHandler: ErrorHandler
};