import { useState, useEffect } from "react";
import { supabase } from "./SupaBase/Client";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Box
} from "@mui/material";
import { CheckCircle, Edit, Delete, Save } from "@mui/icons-material";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    const { data, error } = await supabase
      .from("TODO")
      .select("*")
      .order("id", { ascending: true });
    if (!error) {
      setTodos(data);
    }
  }

  async function addTodo() {
    if (!title.trim() || !description.trim()) return;
    const { data, error } = await supabase
      .from("TODO")
      .insert([{ title, description, is_complete: false }])
      .select();
    if (!error && data.length > 0) {
      setTodos([...todos, data[0]]);
    }
    setTitle("");
    setDescription("");
  }

  async function toggleComplete(id, current) {
    await supabase.from("TODO").update({ is_complete: !current }).eq("id", id);
    fetchTodos();
  }

  async function deleteTodo(id) {
    await supabase.from("TODO").delete().eq("id", id);
    setTodos(todos.filter(todo => todo.id !== id));
  }

  function startEdit(todo) {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDesc(todo.description);
  }

  async function saveEdit(id) {
    await supabase
      .from("TODO")
      .update({ title: editTitle, description: editDesc })
      .eq("id", id);
    setEditingId(null);
    fetchTodos();
  }

  return (
    <Box sx={{ bgcolor: "#f5f9ff", minHeight: "100vh", py: 5 }}>
      <Card sx={{ maxWidth: 600, mx: "auto", p: 3, boxShadow: 3, borderRadius: 4 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: "bold", color: "#1e3a8a" }}>
          Todo List
        </Typography>
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Add a description of the task"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          multiline
          rows={3}
        />
        <Button
          variant="contained"
          onClick={addTodo}
          sx={{ mt: 2, bgcolor: "#1e3a8a", color: "white", fontWeight: "bold" }}
          fullWidth
        >
          ADD
        </Button>
      </Card>

      <Typography variant="h5" align="center" sx={{ mt: 5, fontWeight: "bold", color: "#1e3a8a" }}>
        Incomplete Tasks
      </Typography>

      <Box sx={{ maxWidth: 600, mx: "auto", mt: 3 }}>
        {todos
          .filter(todo => !todo.is_complete)
          .map((todo) => (
            <Card key={todo.id} sx={{ backgroundColor: "#e2f0ff", mb: 2, p: 1 }}>
              <CardContent>
                {editingId === todo.id ? (
                  <>
                    <TextField
                      fullWidth
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      label="Edit Title"
                      margin="dense"
                    />
                    <TextField
                      fullWidth
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      label="Edit Description"
                      margin="dense"
                      multiline
                      rows={2}
                    />
                  </>
                ) : (
                  <>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {todo.title}
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: "italic", color: "gray" }}>
                      {todo.description}
                    </Typography>
                  </>
                )}

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
                  <IconButton color="success" onClick={() => toggleComplete(todo.id, todo.is_complete)}>
                    <CheckCircle />
                  </IconButton>
                  {editingId === todo.id ? (
                    <IconButton color="primary" onClick={() => saveEdit(todo.id)}>
                      <Save />
                    </IconButton>
                  ) : (
                    <IconButton color="warning" onClick={() => startEdit(todo)}>
                      <Edit />
                    </IconButton>
                  )}
                  <IconButton color="error" onClick={() => deleteTodo(todo.id)}>
                    <Delete />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
      </Box>
    </Box>
  );
}
