const redis = require('redis');

const client = redis.createClient(process.env.REDISCLOUD_URL);
//REDIS CONFIG
const expirationTime = 30;

export const getOrSetCache = (key: any, cb: any) => {
  return new Promise((resolve, reject) => {
    client.get(key, async (error, data) => {
      if (error) return reject(error);
      if (data != null) return resolve(JSON.parse(data));
      const newData = await cb();
      const jsonData = JSON.stringify(newData);
      //   console.log(jsonData);
      client.set(key, jsonData, 'EX', expirationTime);
      resolve(newData);
    });
  });
};
