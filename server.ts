import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  let mockTasks = [
    { _id: '1', title: 'Deliver Order #123', description: 'Pick up from Burger King', completed: false, priority: 'high', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userId: '1' },
    { _id: '2', title: 'Complete Profile', description: 'Add vehicle details', completed: true, priority: 'medium', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userId: '1' }
  ];

  app.get("/api/v1/tasks", (req, res) => {
    res.json({ tasks: mockTasks });
  });

  app.get("/api/v1/task/:id", (req, res) => {
    const task = mockTasks.find(t => t._id === req.params.id);
    if (task) res.json(task);
    else res.status(404).json({ message: 'Task not found' });
  });

  app.get("/api/geocode", async (req, res) => {
    const { address } = req.query;
    if (!address) return res.status(400).json({ message: 'Address required' });
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address as string)}`, {
        headers: {
          'User-Agent': 'FoodWagonApp/1.0 (contact: jayakrishna5242@gmail.com)'
        }
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Geocoding failed' });
    }
  });

  app.post("/api/v1/task/create", (req, res) => {
    const newTask = {
      ...req.body,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completed: false
    };
    mockTasks.push(newTask);
    res.json(newTask);
  });

  app.patch("/api/v1/task/:id", (req, res) => {
    const index = mockTasks.findIndex(t => t._id === req.params.id);
    if (index !== -1) {
      mockTasks[index] = { ...mockTasks[index], ...req.body, updatedAt: new Date().toISOString() };
      res.json(mockTasks[index]);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  });

  app.delete("/api/v1/task/:id", (req, res) => {
    mockTasks = mockTasks.filter(t => t._id !== req.params.id);
    res.json({ message: 'Task deleted' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
