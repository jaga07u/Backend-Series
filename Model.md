## 1.User Model Schema
```javaScript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    // username:String,
    // email:String,
    //isActive: Boolean
    username: {
      type: String,
      require: true,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowecase: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema); //(kyabanau,kis ke base per karu)

```
## 2.TodoModel-Schema
``` javascript

import mongoose from 'mongoose';
const todoSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      require: true,
    },
    complete: {
      type: Boolean,
      defalut: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    subTodos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubTodo',
      },
    ],
  }, //Array of Sub-Todos
  { timestamps: true }
);

export const Todo = mongoose.model('Todo', todoSchema); //In magoDB 'Todo'->'todos'

```

## 3.SubTodoModel-Schema

```javascript

import mongoose from 'mongoose';

const subTodoSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    complete: {
      type: Boolean,
      default: false,
    },
    cretedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const SubTodo = mongoose.model('SubTodo', subTodoSchema);

```