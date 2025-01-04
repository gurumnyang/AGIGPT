//@TODO 이게 왜필요함??

// // src/interface/todoController.js

// const express = require('express');
// const router = express.Router();
// const Todo = require('../db/model/todoModel');

// // Todo 생성
// router.post('/', async (req, res) => {
//   try {
//     const newTodo = await Todo.create({ tasks: [] });
//     res.status(201).json(newTodo);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Todo 목록 조회
// router.get('/', async (req, res) => {
//   try {
//     const todos = await Todo.find();
//     res.json(todos);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Todo 특정 조회
// router.get('/:id', async (req, res) => {
//   try {
//     const todo = await Todo.findById(req.params.id);
//     if (!todo) {
//       return res.status(404).json({ error: 'Todo를 찾을 수 없습니다.' });
//     }
//     res.json(todo);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Todo 수정 (tasks 배열 갱신)
// router.put('/:id', async (req, res) => {
//   try {
//     const updated = await Todo.findByIdAndUpdate(
//       req.params.id,
//       { tasks: req.body.tasks },
//       { new: true }
//     );
//     if (!updated) {
//       return res.status(404).json({ error: 'Todo를 찾을 수 없습니다.' });
//     }
//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Todo 삭제
// router.delete('/:id', async (req, res) => {
//   try {
//     const deleted = await Todo.findByIdAndDelete(req.params.id);
//     if (!deleted) {
//       return res.status(404).json({ error: 'Todo를 찾을 수 없습니다.' });
//     }
//     res.status(204).send();
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;
