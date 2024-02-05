import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { GetStudentInfo, capitalizeFirstLetter } from "./models/Student"

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/getStudent', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const studentInfo = await GetStudentInfo(username, password);

    if (studentInfo) {
        if(studentInfo.FirstName === null){
            res.status(400).json({ error: 'Incorrect Credentials or student not found.' });
        }else{
            res.status(200).json(studentInfo);
        }
    } else {
      res.status(404).json({ error: 'Student information not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});