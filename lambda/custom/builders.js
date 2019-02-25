const quizData = require('./quizData.json');
const ordin = require('number-to-words');
Array.prototype.randomElement = function () {
  return this[Math.floor(Math.random() * this.length)];
};
/* HELPER FUNCTIONS */
const speechConsCorrect = ['Booya', 'All righty', 'Bam', 'Bazinga', 'Bingo', 'Boom', 'Bravo', 'Cha Ching', 'Cheers', 'Dynomite', 'Hip hip hooray', 'Hurrah', 'Hurray', 'Huzzah', 'Oh dear.  Just kidding.  Hurray', 'Kaboom', 'Kaching', 'Oh snap', 'Phew', 'Righto', 'Way to go', 'Well done', 'Whee', 'Woo hoo', 'Yay', 'Wowza', 'Yowsa'];
const speechConsWrong = ['Argh', 'Aw man', 'Blarg', 'Blast', 'Boo', 'Bummer', 'Darn', "D'oh", 'Dun dun dun', 'Eek', 'Honk', 'Le sigh', 'Mamma mia', 'Oh boy', 'Oh dear', 'Oof', 'Ouch', 'Ruh roh', 'Shucks', 'Uh oh', 'Wah wah', 'Whoops a daisy', 'Yikes'];
const GAME_NAME = 'Onion Not The Onion';

function askQuestion(handlerInput) {
  console.log('I am in askQuestion()');

  //GET SESSION ATTRIBUTES
  const attributes = handlerInput.attributesManager.getSessionAttributes();

  //GENERATING THE RANDOM QUESTION FROM DATA
  const random = attributes.randomIndexArray[attributes.indexPosition];
  const item = quizData[random];

  //SET QUESTION DATA TO ATTRIBUTES
  attributes.selectedItemIndex = random;
  attributes.quizItem = item;
  attributes.counter += 1;
  attributes.indexPosition += 1;

  //SAVE ATTRIBUTES
  handlerInput.attributesManager.setSessionAttributes(attributes);

  const question = getQuestion(attributes.counter, item);
  return question;
}


function getStartQuizMessage() {}



function getQuestion(counter, item) {
  console.log('Im in getQuestion()');
  return `Here is your ${ordin.toWordsOrdinal(counter)} headline: ${item.headline}`;
}

function compareSlots(slots, item) {
  console.log('Im in compareSlots()');
  for (const slot in slots) {
    if (Object.prototype.hasOwnProperty.call(slots, slot) && slots[slot].value !== undefined) {
      if (slots[slot].name.toString().toLowerCase() === item.category.toString().toLowerCase()) {
        return true;
      }
    }
  }
  return false;
}

function getSpeechCon(type) {
  console.log('Im in getSpeechCon()');
  if (type) return `<say-as interpret-as='interjection'>${speechConsCorrect[getRandom(0, speechConsCorrect.length - 1)]}! </say-as><break strength='strong'/>`;
  return `<say-as interpret-as='interjection'>${speechConsWrong[getRandom(0, speechConsWrong.length - 1)]} </say-as><break strength='strong'/>`;
}

function getAnswer(item) {
  console.log('Im in getAnswer()');
  let isRealHeadline = getIfHeadlineIsTrueFalse(item.category);
  return `That one is a ${isRealHeadline.toString()} headline!`;
}

function getIfHeadlineIsTrueFalse(category) {
  console.log('Im in getIfHeadlineIsTrueFalse()');
  if (category.toString().toLowerCase() === 'theonion') {
    return false;
  }
  return true;
}

function getCurrentScore(score, counter) {
  console.log('Im in getCurrentScore()');
  return `Your current score is ${score} out of ${counter} rounds. `;
}


function getFinalScore(score, counter) {
  return `Your final score is ${score} out of ${counter}. `;
}


////////////////
// TOOL FUNCTIONS BELOW - THEY DO SHIT THE OTHER METHODS RELY ON.
////////////////

// Builds an array of random numbers the length of the quizData array to be
// used as an index for actually retrieving questions, without storing the 
// whole 80kb in memory.
function generateRandomIndex() {
  let array = generateRandomArray(quizData.length);
  return array;
}

// Generates a random array.... The name describes it well.
// Except it doesn't. This creates arrays with repeats. Needs fixing.
// TODO
function generateRandomArray(arrayLength) {
  let array = [...Array(arrayLength).keys()];
  let shuffledArray = shuffle(array);
  return shuffledArray;
}

function shuffle(arr) {
  var newArr = [];
  while (arr.length) {
    var randomIndex =
      Math.floor(Math.random() * arr.length),
      element = arr.splice(randomIndex, 1);
    newArr.push(element[0]);
  }
  return newArr;
}

function getRandom(min, max) {
  return Math.floor((Math.random() * ((max - min) + 1)) + min);
}



module.exports = {
  askQuestion: askQuestion,
  getStartQuizMessage: getStartQuizMessage,
  generateRandomIndex: generateRandomIndex,
  getSpeechCon: getSpeechCon,
  getAnswer: getAnswer,
  getQuestion: getQuestion,
  getFinalScore: getFinalScore,
  compareSlots: compareSlots,
  getCurrentScore: getCurrentScore,
};