//@TODO 이게 왜필요함??

// const express = require('express');
// const router = express.Router();
// const Document = require('../db/model/documentModel');

// // 문서 생성
// router.post('/', async (req, res) => {
//   try {
//     const { title, content, tags } = req.body;
//     const newDoc = await Document.create({ title, content, tags });
//     res.status(201).json(newDoc);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // 문서 전체 목록 조회
// router.get('/', async (req, res) => {
//   try {
//     const docs = await Document.find();
//     res.json(docs);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // 문서 단건 조회
// router.get('/:id', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     if (!doc) {
//       return res.status(404).json({ error: '문서를 찾을 수 없습니다.' });
//     }
//     res.json(doc);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // 문서 수정
// router.put('/:id', async (req, res) => {
//   try {
//     const updated = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!updated) {
//       return res.status(404).json({ error: '문서를 찾을 수 없습니다.' });
//     }
//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // 문서 삭제
// router.delete('/:id', async (req, res) => {
//   try {
//     const deleted = await Document.findByIdAndDelete(req.params.id);
//     if (!deleted) {
//       return res.status(404).json({ error: '문서를 찾을 수 없습니다.' });
//     }
//     res.status(204).send();
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;
