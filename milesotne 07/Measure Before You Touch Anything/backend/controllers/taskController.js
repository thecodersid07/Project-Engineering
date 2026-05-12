const Task = require('../models/Task');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Get all tasks
// @route   GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const allowedStatuses = ['pending', 'completed'];
    let filter = {};
    if (req.query.status && req.query.status !== 'All') {
      const status = req.query.status.toLowerCase();
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid task status' });
      }
      filter.status = status;
    }
    
    const tasks = await Task.find(filter)
      .select('title description status createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const trimmedTitle = title && title.trim();
    
    if (!trimmedTitle) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const existingTask = await Task.findOne({ title: trimmedTitle }).lean();
    if (existingTask) {
      return res.status(409).json({ message: 'Task already exists' });
    }
    
    const task = new Task({
      title: trimmedTitle,
      description
    });

    const savedTask = await task.save();

    res.status(201).json(savedTask);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Task already exists' });
    }
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.body.status && !['pending', 'completed'].includes(req.body.status)) {
      return res.status(400).json({ message: 'Invalid task status' });
    }
    if (req.body.title !== undefined && !req.body.title.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    task.status = req.body.status || task.status;
    task.title = req.body.title ? req.body.title.trim() : task.title;
    task.description = req.body.description || task.description;

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Task already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ id: req.params.id, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
