import { createRoot } from "react-dom/client";
import LessonPlanner from "./app/page";
import "./app/globals.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Lesson Planner preview root was not found.");
}

createRoot(container).render(<LessonPlanner />);
