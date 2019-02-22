// https://old.reddit.com/r/nottheonion/top/.json?sort=top&t=month&limit=100
var fs = require('fs');
const axios = require('axios');
let theOnionData = [];
let notTheOnionData = [];

async function fetchData(storageArray, subreddit) {
  console.log('in fetchData');
  let pagination = '';
  await axios.get(`https://old.reddit.com/r/${subreddit}/top/.json?sort=top&t=month&limit=100&after=${pagination}`)
    .then(result => {
      let posts = result.data.data.children;
      posts.forEach(post => {
        storageArray.push(post.data.title);
      });
      pagination = result.data.data.after;
      return pagination;
    })
    .then(pagination => axios.get(`https://old.reddit.com/r/${subreddit}/top/.json?sort=top&t=month&limit=100&after=${pagination}`))
    .then(result => {
      let posts = result.data.data.children;
      posts.forEach(post => {
        storageArray.push(post.data.title);
      });
      pagination = result.data.data.after;
      return pagination;
    })
    .then(pagination => axios.get(`https://old.reddit.com/r/${subreddit}/top/.json?sort=top&t=month&limit=100&after=${pagination}`))
    .then(result => {
      let posts = result.data.data.children;
      posts.forEach(post => {
        storageArray.push(post.data.title);
      });
      pagination = result.data.data.after;
      return storageArray;
    });
  return storageArray;
}

async function consolidateArrays(theOnion, notTheOnion) {
  console.log('in consolidateArrays');
  let object = {};
  object.notTheOnionHeadlines = notTheOnion;
  object.theOnionHeadlines = theOnion;
  console.log(object);
  return object;
}

async function writeArrays(object) {
  console.log('in writeArrays');
  await fs.writeFile('./quizData.json', JSON.stringify(object), function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('wrote the thing');

    }
  });
}


// The one that does the thing - that is, this function is responsible for calling all the other functions. 
async function getData() {
  const theOnionArrayPromise = fetchData(theOnionData, 'theonion');
  const notTheOnionArrayPromise = fetchData(notTheOnionData, 'nottheonion');
  const theOnionArray = await theOnionArrayPromise;
  const notTheOnionArray = await notTheOnionArrayPromise;
  const consolidatedArrays = await consolidateArrays(theOnionArray, notTheOnionArray);
  await writeArrays(consolidatedArrays);
}

getData();