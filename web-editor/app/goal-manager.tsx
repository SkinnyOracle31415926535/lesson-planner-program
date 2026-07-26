"use client";

import type { FormEvent } from "react";
import type { GeneralClassGoal } from "./lesson-goals";

export function GoalManagerDialog({
  goals,
  selectedGoalIds,
  classLabel,
  canSaveClassDefaults,
  newGoalText,
  onNewGoalTextChange,
  onAddGoal,
  onToggleGoal,
  onUpdateGoal,
  onRemoveGoal,
  onApplyToLesson,
  onSaveClassDefaults,
  onClose,
}: {
  goals: GeneralClassGoal[];
  selectedGoalIds: string[];
  classLabel: string;
  canSaveClassDefaults: boolean;
  newGoalText: string;
  onNewGoalTextChange: (value: string) => void;
  onAddGoal: () => void;
  onToggleGoal: (goalId: string, selected: boolean) => void;
  onUpdateGoal: (goalId: string, text: string) => void;
  onRemoveGoal: (goalId: string) => void;
  onApplyToLesson: () => void;
  onSaveClassDefaults: () => void;
  onClose: () => void;
}) {
  const selectedGoalIdSet = new Set(selectedGoalIds);
  const selectedCount = goals.filter((goal) => selectedGoalIdSet.has(goal.id) && goal.text.trim()).length;

  function submitNewGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAddGoal();
  }

  return (
    <div className="lesson-plan-dialog-scrim goal-manager-scrim" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="goal-manager-dialog retro-window" role="dialog" aria-modal="true" aria-label="Choose and edit general class goals">
        <div className="window-title">
          <b>GENERAL CLASS GOALS</b>
          <button type="button" onClick={onClose} aria-label="Close general class goals">×</button>
        </div>
        <div className="goal-manager-body">
          <p className="goal-manager-intro">
            Check any goals you want to use. General goals sync with the shared Planner. Existing lesson goals are never replaced automatically.
          </p>

          <div className="goal-manager-list" aria-label="General class goal list">
            {goals.length ? goals.map((goal) => (
              <div className="goal-manager-row" key={goal.id}>
                <input
                  type="checkbox"
                  checked={selectedGoalIdSet.has(goal.id)}
                  onChange={(event) => onToggleGoal(goal.id, event.currentTarget.checked)}
                  aria-label={`Select ${goal.text || "blank goal"}`}
                />
                <input
                  type="text"
                  value={goal.text}
                  maxLength={200}
                  onChange={(event) => onUpdateGoal(goal.id, event.currentTarget.value)}
                  aria-label={`Edit ${goal.text || "blank general goal"}`}
                />
                <button type="button" onClick={() => onRemoveGoal(goal.id)} aria-label={`Remove ${goal.text || "blank general goal"}`}>REMOVE</button>
              </div>
            )) : <p className="goal-manager-empty">No general goals yet. Add one below.</p>}
          </div>

          <form className="goal-manager-add" onSubmit={submitNewGoal}>
            <label htmlFor="new-general-goal">ADD A GENERAL GOAL</label>
            <div>
              <input
                id="new-general-goal"
                type="text"
                value={newGoalText}
                maxLength={200}
                placeholder="e.g. Show tight shapes from start to finish."
                onChange={(event) => onNewGoalTextChange(event.currentTarget.value)}
              />
              <button type="submit" disabled={!newGoalText.trim()}>ADD + SELECT</button>
            </div>
          </form>

          <div className="goal-manager-actions">
            <button type="button" disabled={selectedCount === 0} onClick={onApplyToLesson}>
              ADD {selectedCount || ""} TO THIS LESSON
            </button>
            <button type="button" disabled={!canSaveClassDefaults} onClick={onSaveClassDefaults}>
              SAVE AS {classLabel} DEFAULTS
            </button>
            <button type="button" onClick={onClose}>CLOSE</button>
          </div>
          <p className="goal-manager-note">
            New lessons for {classLabel} will start with the saved selection as bullets. Existing lessons keep their current goals.
          </p>
        </div>
      </section>
    </div>
  );
}
