import express from 'express';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.post('/', (req, res, next) => {
  console.log('headers', req.headers);
  console.log('body', req.body);
});

const init = async () => {
  app.listen(parseInt(process.env.EXPRESS_PORT || '3000'), () => {
    console.log(`listening on port ${process.env.EXPRESS_PORT || '3000'}`);
  });
};

init();
