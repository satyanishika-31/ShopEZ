import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/Schema.js';

const generateToken = (id, usertype) => {
  return jwt.sign({ id, usertype }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

export const registerUser = async (req, res) => {
  const { username, email, usertype, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, usertype, password: hashedPassword });
    const userCreated = await newUser.save();

    // generate token on registration
    const token = generateToken(userCreated._id, userCreated.usertype);

    res.status(201).json({
      _id: userCreated._id,
      username: userCreated.username,
      email: userCreated.email,
      usertype: userCreated.usertype,
      token
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // generate token on login
    const token = generateToken(user._id, user.usertype);

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      usertype: user.usertype,
      token
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const fetchUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // don’t send password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error occurred' });
  }
};
